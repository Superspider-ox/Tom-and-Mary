// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RedPacket is ReentrancyGuard {
    // 红包结构体
    struct RedPacket {
        address creator;          // 发红包的人
        address token;            // 0x0表示ETH，其他为ERC20代币地址
        uint256 totalAmount;      // 总金额
        uint256 remainingAmount;  // 剩余金额
        uint256 numPackets;       // 红包份数
        uint256 claimIndex;       // 已领取数量
        uint256 decayRate;        // 衰减率（万分数，例如100表示1%）
        uint256 expireAt;         // 过期时间戳
        bool isRefunded;          // 是否已退还
        mapping(address => uint256) claimed;  // 领取记录
        address[] topClaimers;    // 前N名领取者
        uint256[] topAmounts;     // 前N名领取金额
        uint256 maxTopCount;      // 排行榜最大记录数
        uint256[] historyAmounts; // 历史领取金额记录，确保递减
    }

    // 红包ID计数器
    uint256 public redPacketId;
    // 红包存储
    mapping(uint256 => RedPacket) public redPackets;

    // 事件定义
    event RedPacketCreated(
        uint256 indexed id,
        address indexed creator,
        address token,
        uint256 totalAmount,
        uint256 numPackets,
        uint256 expireAt
    );
    
    event RedPacketClaimed(
        uint256 indexed id,
        address indexed claimer,
        uint256 amount
    );

    event RedPacketRefunded(
        uint256 indexed id,
        address indexed creator,
        uint256 amount
    );

    constructor() {
        redPacketId = 1; // 从1开始计数
    }

    /**
     * @dev 创建红包（ETH）
     */
    function createRedPacket(
        uint256 numPackets,
        uint256 decayRate,
        uint256 expireAt,
        uint256 maxTopCount
    ) external payable nonReentrant {
        require(msg.value > 0, "总金额必须大于0");
        require(numPackets > 0, "红包份数必须大于0");
        require(decayRate > 0 && decayRate <= 10000, "衰减率必须大于0且不超过100%");
        require(expireAt > block.timestamp, "过期时间必须在未来");
        require(maxTopCount > 0, "排行榜记录数必须大于0");

        // 创建红包
        RedPacket storage rp = redPackets[redPacketId];
        rp.creator = msg.sender;
        rp.token = address(0); // ETH
        rp.totalAmount = msg.value;
        rp.remainingAmount = msg.value;
        rp.numPackets = numPackets;
        rp.claimIndex = 0;
        rp.decayRate = decayRate;
        rp.expireAt = expireAt;
        rp.maxTopCount = maxTopCount;
        rp.isRefunded = false;
        rp.topClaimers = new address[](0);
        rp.topAmounts = new uint256[](0);
        rp.historyAmounts = new uint256[](0);

        emit RedPacketCreated(
            redPacketId,
            msg.sender,
            address(0),
            msg.value,
            numPackets,
            expireAt
        );

        redPacketId++;
    }

    /**
     * @dev 创建红包（ERC20）
     */
    function createRedPacketERC20(
        address token,
        uint256 totalAmount,
        uint256 numPackets,
        uint256 decayRate,
        uint256 expireAt,
        uint256 maxTopCount
    ) external nonReentrant {
        require(token != address(0), "代币地址无效");
        require(totalAmount > 0, "总金额必须大于0");
        require(numPackets > 0, "红包份数必须大于0");
        require(decayRate > 0 && decayRate <= 10000, "衰减率必须大于0且不超过100%");
        require(expireAt > block.timestamp, "过期时间必须在未来");
        require(maxTopCount > 0, "排行榜记录数必须大于0");

        // 转移代币到合约
        IERC20(token).transferFrom(msg.sender, address(this), totalAmount);

        // 创建红包
        RedPacket storage rp = redPackets[redPacketId];
        rp.creator = msg.sender;
        rp.token = token;
        rp.totalAmount = totalAmount;
        rp.remainingAmount = totalAmount;
        rp.numPackets = numPackets;
        rp.claimIndex = 0;
        rp.decayRate = decayRate;
        rp.expireAt = expireAt;
        rp.isRefunded = false;
        rp.maxTopCount = maxTopCount;
        rp.topClaimers = new address[](0);
        rp.topAmounts = new uint256[](0);
        rp.historyAmounts = new uint256[](0);

        emit RedPacketCreated(
            redPacketId,
            msg.sender,
            token,
            totalAmount,
            numPackets,
            expireAt
        );

        redPacketId++;
    }

    /**
     * @dev 领取红包
     */
    function claimRedPacket(uint256 rpId) external nonReentrant {
        // 先检查是否有其他红包已过期，若有则退还
        refundExpiredRedPackets();
        
        require(rpId > 0 && rpId < redPacketId, "红包不存在");
        RedPacket storage rp = redPackets[rpId];

        // 检查红包状态
        require(block.timestamp < rp.expireAt, "红包已过期");
        require(rp.claimIndex < rp.numPackets, "红包已领完");
        require(rp.claimed[msg.sender] == 0, "已领取过该红包");

        // 计算领取金额（严格递减）
        uint256 amount = calculateClaimAmount(rp);
        
        require(amount > 0 && amount <= rp.remainingAmount, "金额计算错误");

        // 确保当前金额小于上一笔（如果不是第一笔）
        if (rp.claimIndex > 0) {
            require(amount < rp.historyAmounts[rp.claimIndex - 1], "金额未递减");
        }

        // 更新红包状态
        rp.claimed[msg.sender] = amount;
        rp.remainingAmount -= amount;
        rp.claimIndex++;
        rp.historyAmounts.push(amount);

        // 更新排行榜
        updateRanking(rp, msg.sender, amount);

        // 发放奖励
        distributeReward(rp, msg.sender, amount);

        emit RedPacketClaimed(rpId, msg.sender, amount);
    }

    /**
     * @dev 退还所有已过期且未退还的红包资金
     */
    function refundExpiredRedPackets() internal {
        for (uint256 i = 1; i < redPacketId; i++) {
            RedPacket storage rp = redPackets[i];
            if (block.timestamp >= rp.expireAt && !rp.isRefunded && rp.remainingAmount > 0) {
                rp.isRefunded = true;
                distributeReward(rp, rp.creator, rp.remainingAmount);
                emit RedPacketRefunded(i, rp.creator, rp.remainingAmount);
            }
        }
    }

    /**
     * @dev 计算领取金额（确保严格递减）
     */
    function calculateClaimAmount(RedPacket storage rp) internal view returns (uint256) {
        // 第一份红包获得最大比例（基础比例为总金额的30%，可根据份数动态调整）
        uint256 basePercentage = rp.numPackets > 5 ? 3000 : 10000 / rp.numPackets;
        
        if (rp.claimIndex == 0) {
            // 第一份金额 = 总金额 × 基础比例（至少为平均金额的1.5倍）
            uint256 firstAmount = (rp.totalAmount * basePercentage) / 10000;
            uint256 minFirstAmount = (rp.totalAmount * 3) / (rp.numPackets * 2); // 平均的1.5倍
            return firstAmount > minFirstAmount ? firstAmount : minFirstAmount;
        }
        
        // 后续金额 = 上一份金额 × (1 - 衰减率/10000)
        uint256 previousAmount = rp.historyAmounts[rp.claimIndex - 1];
        uint256 currentAmount = (previousAmount * (10000 - rp.decayRate)) / 10000;
        
        // 最后一份红包处理
        if (rp.claimIndex == rp.numPackets - 1) {
            // 确保最后一份不超过前一份且能领完所有剩余金额
            return rp.remainingAmount < currentAmount ? rp.remainingAmount : currentAmount;
        }
        
        // 确保金额不为0
        return currentAmount > 0 ? currentAmount : 1;
    }

    /**
     * @dev 更新排行榜
     */
    function updateRanking(RedPacket storage rp, address claimer, uint256 amount) internal {
        uint256 topCount = rp.topClaimers.length;
        
        // 如果还没满额，直接添加
        if (topCount < rp.maxTopCount) {
            rp.topClaimers.push(claimer);
            rp.topAmounts.push(amount);
            sortRanking(rp); // 排序保持从高到低
        } else {
            // 如果金额比最后一名高，替换并排序
            if (amount > rp.topAmounts[topCount - 1]) {
                rp.topClaimers[topCount - 1] = claimer;
                rp.topAmounts[topCount - 1] = amount;
                sortRanking(rp); // 排序保持从高到低
            }
        }
    }

    /**
     * @dev 排行榜排序（从高到低）
     */
    function sortRanking(RedPacket storage rp) internal {
        // 简单冒泡排序，适合小数据量
        for (uint256 i = 0; i < rp.topAmounts.length; i++) {
            for (uint256 j = i + 1; j < rp.topAmounts.length; j++) {
                if (rp.topAmounts[i] < rp.topAmounts[j]) {
                    // 交换金额
                    (rp.topAmounts[i], rp.topAmounts[j]) = (rp.topAmounts[j], rp.topAmounts[i]);
                    // 交换地址
                    (rp.topClaimers[i], rp.topClaimers[j]) = (rp.topClaimers[j], rp.topClaimers[i]);
                }
            }
        }
    }

    /**
     * @dev 发放奖励
     */
    function distributeReward(RedPacket storage rp, address to, uint256 amount) internal {
        if (rp.token == address(0)) {
            // ETH转账
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH转账失败");
        } else {
            // ERC20转账
            bool success = IERC20(rp.token).transfer(to, amount);
            require(success, "ERC20转账失败");
        }
    }

    /**
     * @dev 查询红包基本信息
     */
    function getRedPacket(uint256 rpId) external view returns (
        address creator,
        address token,
        uint256 totalAmount,
        uint256 remainingAmount,
        uint256 numPackets,
        uint256 claimIndex,
        uint256 decayRate,
        uint256 expireAt,
        bool isRefunded
    ) {
        require(rpId > 0 && rpId < redPacketId, "红包不存在");
        RedPacket storage rp = redPackets[rpId];
        return (
            rp.creator,
            rp.token,
            rp.totalAmount,
            rp.remainingAmount,
            rp.numPackets,
            rp.claimIndex,
            rp.decayRate,
            rp.expireAt,
            rp.isRefunded
        );
    }

    /**
     * @dev 查询红包排行榜
     */
    function getRedPacketRanking(uint256 rpId) external view returns (
        address[] memory topClaimers,
        uint256[] memory topAmounts
    ) {
        require(rpId > 0 && rpId < redPacketId, "红包不存在");
        RedPacket storage rp = redPackets[rpId];
        return (rp.topClaimers, rp.topAmounts);
    }

    /**
     * @dev 查询用户领取记录
     */
    function getClaimRecord(uint256 rpId, address user) external view returns (uint256) {
        require(rpId > 0 && rpId < redPacketId, "红包不存在");
        return redPackets[rpId].claimed[user];
    }

    // 接收ETH
    receive() external payable {}
}