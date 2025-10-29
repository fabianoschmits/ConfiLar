import React from 'react'
import { Heart, Zap, Coins, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePremiumLikes, usePremiumLikesStats } from '@/hooks/usePremiumLikes'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePoints } from '@/hooks/usePoints'
import { cn } from '@/lib/utils'

interface PremiumLikeButtonProps {
  postId: string
  postCreatorId: string
  className?: string
  size?: 'sm' | 'lg' | 'default'
  showStats?: boolean
}

export function PremiumLikeButton({ 
  postId, 
  postCreatorId, 
  className,
  size = 'default',
  showStats = true 
}: PremiumLikeButtonProps) {
  const { user } = useAuthContext()
  const { balance } = usePoints(user?.id) // Passar o userId
  const { 
    likes, 
    stats, 
    userPremiumLiked, 
    userPremiumLikesCount,
    premiumLike, 
    normalLike, 
    unlike,
    isPremiumLiking,
    isNormalLiking,
    isUnliking
  } = usePremiumLikes(postId)

  const isOwnPost = user?.id === postCreatorId
  const hasLiked = likes.some(like => like.user_id === user?.id)
  const premiumLikesCount = stats?.premium_likes || 0
  const totalLikesCount = stats?.total_likes || 0
  const pointsReceived = stats?.total_points_received || 0
  const hasEnoughPoints = balance?.balance >= 5 // Verificação de segurança para balance

  const handlePremiumLike = () => {
    if (isOwnPost) {
      return // Não pode curtir próprio post
    }

    premiumLike()
  }

  const sizeClasses = {
    sm: 'h-4 px-1 text-xs',
    default: 'h-5 px-1.5 text-xs',
    lg: 'h-6 px-2 text-sm'
  }

  const iconSizes = {
    sm: 14,
    default: 16,
    lg: 18
  }

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        {/* Botão de Curtida Premium */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={userPremiumLiked ? 'default' : 'outline'}
              size={size}
              onClick={handlePremiumLike}
              disabled={isOwnPost || isPremiumLiking || !hasEnoughPoints}
              className={cn(
                'transition-all duration-200 mt-1 relative',
                userPremiumLiked && 'bg-red-500 hover:bg-red-600 text-white',
                isOwnPost && 'opacity-50 cursor-not-allowed',
                !hasEnoughPoints && 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
              )}
            >
              <Heart 
                size={iconSizes[size]} 
                className={cn(
                  userPremiumLiked && 'fill-current'
                )}
              />
              {/* Ícone de moedas sobreposto no canto superior direito */}
              <Coins 
                size={Math.max(iconSizes[size] + 16, 40)} 
                className="absolute top-0 right-0 text-yellow-500" 
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-semibold">🎉 Curtida Premium</p>
              <p className="text-xs">💰 Gasta 5 ConfiPoints</p>
              <p className="text-xs">🎁 Recompensa o criador com 5 pontos</p>
              
              {!hasEnoughPoints ? (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-600 font-semibold">❌ Saldo Insuficiente</p>
                  <p className="text-xs text-red-500">Você tem {balance?.balance || 0} ConfiPoints</p>
                  <p className="text-xs text-red-500">Precisa de 5 para curtir premium</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-green-400 mt-1">
                    ✨ Incentiva criação de conteúdo de qualidade
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    💰 Seu saldo: {balance?.balance || 0} ConfiPoints
                  </p>
                </>
              )}
              
              {premiumLikesCount > 0 && (
                <p className="text-xs text-yellow-400 mt-1">
                  ⚡ {premiumLikesCount} curtidas premium no total
                </p>
              )}
              {userPremiumLikesCount > 0 && (
                <p className="text-xs text-green-400 mt-1">
                  ✓ Você recompensou {userPremiumLikesCount} vezes ({userPremiumLikesCount * 5} pontos enviados)
                </p>
              )}
              {hasEnoughPoints && (
                <p className="text-xs text-blue-400 mt-1">💡 Clique várias vezes para enviar mais recompensas!</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Estatísticas */}
        {showStats && stats && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {premiumLikesCount > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap size={12} />
                {premiumLikesCount}
              </Badge>
            )}
            {pointsReceived > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Coins size={12} />
                {pointsReceived}
              </Badge>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Componente para mostrar ranking de posts com mais curtidas premium
export function PremiumLikesRanking() {
  const { stats, loading } = usePremiumLikesStats()

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Zap className="text-yellow-500" size={20} />
        Posts Mais Curtidos Premium
      </h3>
      
      {stats.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum post com curtidas premium ainda
        </p>
      ) : (
        <div className="space-y-2">
          {stats.slice(0, 10).map((stat, index) => (
            <div 
              key={stat.post_id}
              className="flex items-center justify-between p-3 bg-card rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                  {index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {stat.content.length > 50 
                      ? `${stat.content.substring(0, 50)}...` 
                      : stat.content
                    }
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{stat.premium_likes} curtidas premium</span>
                    <span>•</span>
                    <span>{stat.total_points_received} pontos recebidos</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap size={12} />
                  {stat.premium_likes}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coins size={12} />
                  {stat.total_points_received}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
