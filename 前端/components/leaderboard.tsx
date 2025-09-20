"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Medal, Award, Crown } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  username: string
  amount: number
  avatar: string
}

interface LeaderboardProps {
  data: LeaderboardEntry[]
  onBack: () => void
}

export function Leaderboard({ data, onBack }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{rank}
          </span>
        )
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-yellow-400/50 bg-yellow-400/10"
      case 2:
        return "border-gray-400/50 bg-gray-400/10"
      case 3:
        return "border-amber-600/50 bg-amber-600/10"
      default:
        return "border-muted/50 bg-muted/10"
    }
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-accent/20 via-background to-primary/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,215,0,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-accent hover:text-accent/80 hover:bg-accent/10 neon-glow"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-accent neon-text">排行榜</h1>
            <p className="text-muted-foreground">赛博世界的顶级玩家</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {data.slice(0, 3).map((player, index) => (
              <Card
                key={player.rank}
                className={`${getRankColor(player.rank)} backdrop-blur-sm neon-glow animate-float`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-card/50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                    {player.avatar}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getRankIcon(player.rank)}
                    <CardTitle className="text-xl">{player.username}</CardTitle>
                  </div>
                  <CardDescription className="text-2xl font-bold text-accent">¥{player.amount}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard */}
          <Card className="bg-card/30 backdrop-blur-sm border-accent/50 neon-glow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-accent">完整排行榜</CardTitle>
              <CardDescription>所有玩家的抢红包记录</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {data.map((player, index) => (
                <div
                  key={player.rank}
                  className={`flex items-center justify-between p-4 rounded-lg ${getRankColor(player.rank)} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">{getRankIcon(player.rank)}</div>
                    <div className="text-3xl">{player.avatar}</div>
                    <div>
                      <div className="font-semibold text-foreground">{player.username}</div>
                      <div className="text-sm text-muted-foreground">第 {player.rank} 名</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-accent">¥{player.amount}</div>
                    <div className="text-sm text-muted-foreground">总收益</div>
                  </div>
                </div>
              ))}

              {data.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">暂无排行数据</h3>
                  <p className="text-muted-foreground">开始抢红包来登上排行榜吧！</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
