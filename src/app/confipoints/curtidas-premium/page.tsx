'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PremiumLikesRanking } from '@/components/points/PremiumLikeButton'
import { Zap, Coins, TrendingUp, Users, Award } from 'lucide-react'
import { usePremiumLikesStats } from '@/hooks/usePremiumLikes'
import { MainLayout } from '@/components/layout/MainLayout'

export default function PremiumLikesPage() {
  const { stats, loading } = usePremiumLikesStats()

  const totalPremiumLikes = stats.reduce((sum, stat) => sum + stat.premium_likes, 0)
  const totalPointsTransferred = stats.reduce((sum, stat) => sum + stat.total_points_received, 0)
  const avgPointsPerLike = totalPremiumLikes > 0 ? totalPointsTransferred / totalPremiumLikes : 0

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
            <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Curtidas Premium
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Posts mais curtidos com pontos premium
            </p>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Curtidas Premium</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalPremiumLikes.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Coins className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pontos Transferidos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalPointsTransferred.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Média por Curtida</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {avgPointsPerLike.toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Posts Únicos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Como Funciona */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Como Funcionam as Curtidas Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                Para Quem Curtir:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">5 pontos</Badge>
                  <span>Custa 5 pontos para curtir premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Post fica destacado com ícone premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-green-500" />
                  <span>Pontos são transferidos automaticamente</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                Para Quem Recebe:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">+5 pontos</Badge>
                  <span>Recebe 5 pontos por curtida premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span>Post aparece no ranking de popularidade</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>Incentiva criação de conteúdo criativo</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Dica de Engajamento
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Use curtidas premium para destacar posts que realmente gostou e incentivar 
                  criadores a produzir mais conteúdo de qualidade. É uma forma de valorizar 
                  o trabalho dos outros usuários!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Ranking de Posts Premium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PremiumLikesRanking />
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  )
}

