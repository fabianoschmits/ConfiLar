'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Crown, Medal, Award, Star, Users } from 'lucide-react'
import { usePointsLeaderboard } from '@/hooks/usePoints'
import { formatPoints, USER_LEVELS } from '@/types/points'
import { cn } from '@/lib/utils'
import { RankingListSkeleton } from '@/components/ui/skeleton'

export default function ConfiPointsRankingPage() {
  const { leaderboard, loading, error } = usePointsLeaderboard(50)

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (position === 3) return <Award className="w-6 h-6 text-amber-600" />
    return <Star className="w-4 h-4 text-gray-400" />
  }

  const getRankColor = (position: number) => {
    if (position === 1) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    if (position === 2) return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    if (position === 3) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }

  if (loading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="container py-8">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Ranking ConfiPoints
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Top usuários do sistema de pontos
                    </p>
                  </div>
                </div>
              </div>

              <RankingListSkeleton count={10} />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Erro ao carregar ranking
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Não foi possível carregar o ranking de pontos.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Ranking ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Top usuários do sistema de pontos
                  </p>
                </div>
              </div>
            </div>

            {/* Estatísticas do Ranking */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {leaderboard.length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usuários no ranking
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {leaderboard.length > 0 ? formatPoints(leaderboard[0].total_points_earned) : '0'}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Maior pontuação
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {leaderboard.filter(u => u.user_level === 'diamond').length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usuários Diamond
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista do Ranking */}
            {leaderboard.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhum usuário no ranking ainda
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Seja o primeiro a ganhar pontos e aparecer no ranking!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <Card 
                    key={user.user_id}
                    className={cn(
                      "transition-all duration-200 hover:shadow-md",
                      getRankColor(index + 1)
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Posição */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
                          {getRankIcon(index + 1)}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>

                        {/* Informações */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.full_name || 'Usuário'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                color: USER_LEVELS[user.user_level]?.color,
                                borderColor: USER_LEVELS[user.user_level]?.color
                              }}
                            >
                              {USER_LEVELS[user.user_level]?.name || user.user_level}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              #{index + 1}
                            </span>
                          </div>
                        </div>

                        {/* Pontos */}
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatPoints(user.total_points_earned)}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            pontos totais
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
