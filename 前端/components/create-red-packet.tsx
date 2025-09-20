"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Gift, Zap, DollarSign, Users } from "lucide-react"

interface CreateRedPacketProps {
  onBack: () => void
  onCreate: (data: { amount: number; count: number; message: string }) => void
}

export function CreateRedPacket({ onBack, onCreate }: CreateRedPacketProps) {
  const [amount, setAmount] = useState("")
  const [count, setCount] = useState("")
  const [message, setMessage] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !count) return

    setIsCreating(true)

    // Simulate creation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onCreate({
      amount: Number.parseFloat(amount),
      count: Number.parseInt(count),
      message: message || "恭喜发财，红包拿来！",
    })

    setIsCreating(false)
  }

  const averageAmount = amount && count ? (Number.parseFloat(amount) / Number.parseInt(count)).toFixed(2) : "0"

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.15),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-primary hover:text-primary/80 hover:bg-primary/10 neon-glow"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-primary neon-text">创建红包</h1>
            <p className="text-muted-foreground">设置你的赛博红包参数</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/30 backdrop-blur-sm border-primary/50 neon-glow">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-neon">
                <Gift className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">红包配置</CardTitle>
              <CardDescription>填写红包信息，让其他玩家来抢夺吧！</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-foreground font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    红包总金额
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="输入红包总金额"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-input/50 border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                {/* Count Input */}
                <div className="space-y-2">
                  <Label htmlFor="count" className="text-foreground font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary" />
                    红包个数
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    placeholder="输入红包个数"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="bg-input/50 border-secondary/30 focus:border-secondary text-foreground placeholder:text-muted-foreground"
                    min="1"
                    required
                  />
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    红包祝福语
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="输入红包祝福语（可选）"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-input/50 border-accent/30 focus:border-accent text-foreground placeholder:text-muted-foreground resize-none"
                    rows={3}
                  />
                </div>

                {/* Preview Stats */}
                {amount && count && (
                  <Card className="bg-muted/20 border-muted/30">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">¥{amount}</div>
                          <div className="text-sm text-muted-foreground">总金额</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-secondary">¥{averageAmount}</div>
                          <div className="text-sm text-muted-foreground">平均每个</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground neon-glow text-lg py-6"
                  disabled={isCreating || !amount || !count}
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 mr-2" />
                      创建红包
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
