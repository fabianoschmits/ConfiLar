'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react'
import { ReviewStats as ReviewStatsType } from '@/hooks/useSupabaseReviews'

interface ReviewStatsProps {
  stats: ReviewStatsType
  className?: string
}

export function ReviewStats({ stats, className = '' }: ReviewStatsProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingPercentage = (rating: number) => {
    if (stats.totalReviews === 0) return 0
    return Math.round((stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100)
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5: return 'bg-green-500'
      case 4: return 'bg-blue-500'
      case 3: return 'bg-yellow-500'
      case 2: return 'bg-orange-500'
      case 1: return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getOverallRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Excelente'
    if (rating >= 3.5) return 'Muito Bom'
    if (rating >= 2.5) return 'Bom'
    if (rating >= 1.5) return 'Regular'
    return 'Ruim'
  }

  const getOverallRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-blue-600'
    if (rating >= 2.5) return 'text-yellow-600'
    if (rating >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Média Geral */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getOverallRatingColor(stats.averageRating)}`}>
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center mt-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {getOverallRatingText(stats.averageRating)}
            </p>
          </CardContent>
        </Card>

        {/* Total de Avaliações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalReviews}
            </div>
            <p className="text-xs text-gray-600">
              Avaliações recebidas
            </p>
          </CardContent>
        </Card>

        {/* Excelentes (5★) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excelentes (5★)</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.ratingDistribution[5]}
            </div>
            <p className="text-xs text-gray-600">
              {getRatingPercentage(5)}% do total
            </p>
          </CardContent>
        </Card>

        {/* Baixas (1-2★) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baixas (1-2★)</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.ratingDistribution[1] + stats.ratingDistribution[2]}
            </div>
            <p className="text-xs text-gray-600">
              {getRatingPercentage(1) + getRatingPercentage(2)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição das Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribuição das Avaliações
          </CardTitle>
          <CardDescription>
            Como suas avaliações estão distribuídas por nota
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
              const percentage = getRatingPercentage(rating)
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm font-medium">{rating}★</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getRatingColor(rating)}`}
                      style={{
                        width: `${percentage}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-2 w-20">
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </span>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Avaliações Recentes */}
      {stats.recentReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliações Recentes</CardTitle>
            <CardDescription>
              Últimas avaliações recebidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating_person)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {review.reviewer.full_name}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(review.created_at).toLocaleDateString('pt-BR')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
