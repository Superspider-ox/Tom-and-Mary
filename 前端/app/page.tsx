"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Zap, Trophy, Users } from "lucide-react"
import { CreateRedPacket } from "@/components/create-red-packet"
import { GrabRedPacket } from "@/components/grab-red-packet"
import { Leaderboard } from "@/components/leaderboard"

type Screen = "home" | "create" | "grab" | "leaderboard"

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [redPackets, setRedPackets] = useState([
    { id: 1, amount: 100, count: 10, remaining: 7, creator: "赛博玩家001" },
    { id: 2, amount: 50, count: 5, remaining: 3, creator: "未来战士" },
    { id: 3, amount: 200, count: 20, remaining: 15, creator: "霓虹猎手" },
  ])
  const [leaderboardData, setLeaderboardData] = useState([
    { rank: 1, username: "赛博玩家001", amount: 888, avatar: "🤖" },
    { rank: 2, username: "未来战士", amount: 666, avatar: "⚡" },
    { rank: 3, username: "霓虹猎手", amount: 555, avatar: "🔥" },
    { rank: 4, username: "数字幽灵", amount: 333, avatar: "👻" },
    { rank: 5, username: "量子黑客", amount: 222, avatar: "💀" },
  ])

  const handleCreateRedPacket = (data: { amount: number; count: number; message: string }) => {
    const newPacket = {
      id: redPackets.length + 1,
      amount: data.amount,
      count: data.count,
      remaining: data.count,
      creator: "你",
    }
    setRedPackets([...redPackets, newPacket])
    setCurrentScreen("home")
  }

  const handleGrabRedPacket = (packetId: number, grabbedAmount: number) => {
    setRedPackets((packets) =>
      packets
        .map((packet) => (packet.id === packetId ? { ...packet, remaining: packet.remaining - 1 } : packet))
        .filter((packet) => packet.remaining > 0),
    )

    // Update leaderboard
    setLeaderboardData((prev) => {
      const updated = [...prev]
      const playerIndex = updated.findIndex((p) => p.username === "你")
      if (playerIndex >= 0) {
        updated[playerIndex].amount += grabbedAmount
      } else {
        updated.push({ rank: updated.length + 1, username: "你", amount: grabbedAmount, avatar: "🎯" })
      }
      return updated.sort((a, b) => b.amount - a.amount).map((player, index) => ({ ...player, rank: index + 1 }))
    })

    setCurrentScreen("leaderboard")
  }

  if (currentScreen === "create") {
    return <CreateRedPacket onBack={() => setCurrentScreen("home")} onCreate={handleCreateRedPacket} />
  }

  if (currentScreen === "grab") {
    return (
      <GrabRedPacket redPackets={redPackets} onBack={() => setCurrentScreen("home")} onGrab={handleGrabRedPacket} />
    )
  }

  if (currentScreen === "leaderboard") {
    return <Leaderboard data={leaderboardData} onBack={() => setCurrentScreen("home")} />
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 neon-text text-primary animate-pulse-neon">赛博红包</h1>
          <p className="text-xl text-muted-foreground mb-8">未来世界的红包抢夺游戏</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/30 neon-glow">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">1,234</div>
                <div className="text-sm text-muted-foreground">在线玩家</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-secondary/30 neon-glow">
              <CardContent className="p-6 text-center">
                <Gift className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary">{redPackets.length}</div>
                <div className="text-sm text-muted-foreground">可抢红包</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-accent/30 neon-glow">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">¥56,789</div>
                <div className="text-sm text-muted-foreground">今日总奖池</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card
              className="bg-card/30 backdrop-blur-sm border-primary/50 hover:border-primary transition-all duration-300 hover:neon-glow animate-float cursor-pointer group"
              onClick={() => setCurrentScreen("create")}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">发红包</CardTitle>
                <CardDescription className="text-muted-foreground">创建属于你的赛博红包</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground neon-glow">
                  <Zap className="w-4 h-4 mr-2" />
                  开始创建
                </Button>
              </CardContent>
            </Card>

            <Card
              className="bg-card/30 backdrop-blur-sm border-secondary/50 hover:border-secondary transition-all duration-300 hover:neon-glow animate-float cursor-pointer group"
              onClick={() => setCurrentScreen("grab")}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors">
                  <Zap className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl text-secondary">抢红包</CardTitle>
                <CardDescription className="text-muted-foreground">抢夺其他玩家的红包奖励</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground neon-glow">
                  <Gift className="w-4 h-4 mr-2" />
                  立即抢夺
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Preview */}
          <Card
            className="bg-card/30 backdrop-blur-sm border-accent/50 hover:border-accent transition-all duration-300 hover:neon-glow cursor-pointer"
            onClick={() => setCurrentScreen("leaderboard")}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-accent">排行榜</CardTitle>
              <CardDescription className="text-muted-foreground">查看赛博世界的顶级玩家</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboardData.slice(0, 3).map((player) => (
                  <div key={player.rank} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{player.avatar}</span>
                      <span className="font-medium">{player.username}</span>
                    </div>
                    <span className="text-accent font-bold">¥{player.amount}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-accent hover:bg-accent/80 text-accent-foreground neon-glow">
                查看完整排行榜
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
