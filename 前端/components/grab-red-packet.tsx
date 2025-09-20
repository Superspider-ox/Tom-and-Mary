"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Gift, Zap, Users, DollarSign } from "lucide-react"

interface RedPacket {
  id: number
  amount: number
  count: number
  remaining: number
  creator: string
}

interface GrabRedPacketProps {
  redPackets: RedPacket[]
  onBack: () => void
  onGrab: (packetId: number, grabbedAmount: number) => void
}

export function GrabRedPacket({ redPackets, onBack, onGrab }: GrabRedPacketProps) {
  const [grabbingId, setGrabbingId] = useState<number | null>(null)
  const [showResult, setShowResult] = useState<{ amount: number; message: string } | null>(null)

  const handleGrab = async (packet: RedPacket) => {
    setGrabbingId(packet.id)

    // Simulate grabbing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Calculate random amount (between 0.01 and remaining average * 2)
    const averageRemaining = packet.amount / packet.count
    const maxAmount = Math.min(averageRemaining * 2, packet.amount)
    const grabbedAmount = Math.max(0.01, Math.random() * maxAmount)

    setShowResult({
      amount: Number.parseFloat(grabbedAmount.toFixed(2)),
      message: Math.random() > 0.5 ? "手气不错！" : "恭喜发财！",
    })

    setTimeout(() => {
      onGrab(packet.id, Number.parseFloat(grabbedAmount.toFixed(2)))
      setShowResult(null)
      setGrabbingId(null)
    }, 2000)
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-accent/30 via-background to-primary/30 pointer-events-none" />
        <Card className="bg-card/50 backdrop-blur-sm border-accent/50 neon-glow max-w-md mx-auto animate-float">
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-neon">
              <Gift className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-accent mb-2 neon-text">¥{showResult.amount}</h2>
            <p className="text-xl text-foreground mb-4">{showResult.message}</p>
            <div className="text-sm text-muted-foreground">正在跳转到排行榜...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-secondary/20 via-background to-accent/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(233,30,99,0.15),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 neon-glow"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-secondary neon-text">抢红包</h1>
            <p className="text-muted-foreground">选择一个红包来抢夺奖励</p>
          </div>
        </div>

        {redPackets.length === 0 ? (
          <Card className="bg-card/30 backdrop-blur-sm border-muted/50 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">暂无可抢红包</h3>
              <p className="text-muted-foreground">等待其他玩家创建红包，或者自己创建一个吧！</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {redPackets.map((packet) => (
              <Card
                key={packet.id}
                className="bg-card/30 backdrop-blur-sm border-secondary/50 hover:border-secondary transition-all duration-300 hover:neon-glow animate-float cursor-pointer group"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors">
                    <Gift className="w-8 h-8 text-secondary" />
                  </div>
                  <CardTitle className="text-xl text-secondary">红包 #{packet.id}</CardTitle>
                  <CardDescription className="text-muted-foreground">来自 {packet.creator}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
                      <div className="text-lg font-bold text-primary">¥{packet.amount}</div>
                      <div className="text-xs text-muted-foreground">总金额</div>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <Users className="w-5 h-5 text-accent mx-auto mb-1" />
                      <div className="text-lg font-bold text-accent">
                        {packet.remaining}/{packet.count}
                      </div>
                      <div className="text-xs text-muted-foreground">剩余</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">抢夺进度</span>
                      <span className="text-foreground">
                        {(((packet.count - packet.remaining) / packet.count) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-secondary to-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((packet.count - packet.remaining) / packet.count) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Grab Button */}
                  <Button
                    className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground neon-glow"
                    onClick={() => handleGrab(packet)}
                    disabled={grabbingId === packet.id}
                  >
                    {grabbingId === packet.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin mr-2" />
                        抢夺中...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        立即抢夺
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
