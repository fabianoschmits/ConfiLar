'use client'

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
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 border-b-4 border-black bg-black text-yellow-400">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">MÉDIA GERAL</h3>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <div className="p-4">
            <div className={`text-3xl font-black ${getOverallRatingColor(stats.averageRating)}`}>
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center mt-2">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className="text-xs text-black font-bold mt-2">
              {getOverallRatingText(stats.averageRating).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Total de Avaliações */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 border-b-4 border-black bg-black text-yellow-400">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">TOTAL DE AVALIAÇÕES</h3>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-black text-blue-600">
              {stats.totalReviews}
            </div>
            <p className="text-xs text-black font-bold">
              AVALIAÇÕES RECEBIDAS
            </p>
          </div>
        </div>

        {/* Excelentes (5★) */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 border-b-4 border-black bg-black text-yellow-400">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">EXCELENTES (5★)</h3>
              <ThumbsUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-black text-green-600">
              {stats.ratingDistribution[5]}
            </div>
            <p className="text-xs text-black font-bold">
              {getRatingPercentage(5)}% DO TOTAL
            </p>
          </div>
        </div>

        {/* Baixas (1-2★) */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 border-b-4 border-black bg-black text-yellow-400">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">BAIXAS (1-2★)</h3>
              <ThumbsDown className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-black text-red-600">
              {stats.ratingDistribution[1] + stats.ratingDistribution[2]}
            </div>
            <p className="text-xs text-black font-bold">
              {getRatingPercentage(1) + getRatingPercentage(2)}% DO TOTAL
            </p>
          </div>
        </div>
      </div>

      {/* Distribuição das Avaliações */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-4 border-b-4 border-black bg-black text-yellow-400">
          <h3 className="text-lg font-black flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            DISTRIBUIÇÃO DAS AVALIAÇÕES
          </h3>
          <p className="text-sm font-bold mt-1">
            COMO SUAS AVALIAÇÕES ESTÃO DISTRIBUÍDAS POR NOTA
          </p>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
              const percentage = getRatingPercentage(rating)
              
              return (
                <div key={rating} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-16">
                    <span className="text-sm font-black text-black">{rating}★</span>
                  </div>
                  <div className="flex-1 bg-gray-200 border-2 border-black h-4">
                    <div
                      className={`h-full ${getRatingColor(rating)} border-r-2 border-black`}
                      style={{
                        width: `${percentage}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-3 w-24">
                    <span className="text-sm text-black font-black w-8 text-right">
                      {count}
                    </span>
                    <span className="text-xs text-black font-bold w-8 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Resumo das Avaliações Recentes */}
      {stats.recentReviews.length > 0 && (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 border-b-4 border-black bg-black text-yellow-400">
            <h3 className="text-lg font-black">AVALIAÇÕES RECENTES</h3>
            <p className="text-sm font-bold mt-1">
              ÚLTIMAS AVALIAÇÕES RECEBIDAS
            </p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {stats.recentReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-gray-100 border-2 border-black p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating_person)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-black truncate">
                        {review.reviewer.full_name.toUpperCase()}
                      </p>
                    </div>
                    <div className="px-2 py-1 bg-white border border-black text-xs font-black">
                      {new Date(review.created_at).toLocaleDateString('pt-BR').toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
