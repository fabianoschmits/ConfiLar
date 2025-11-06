import React from 'react'
import { Heart, Zap, Coins, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePremiumLikes, usePremiumLikesStats } from '@/hooks/usePremiumLikes'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePoints } from '@/hooks/usePoints'
import { cn } from '@/lib/utils'
import { PREMIUM_PRICES } from '@/constants/premiumPrices'
import { useHapticFeedback } from '@/hooks/useHapticFeedback'

// CSS para animação de batida do coração
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes heartBeat {
      0%, 100% {
        transform: scale(1);
      }
      25% {
        transform: scale(1.3) rotate(-5deg);
      }
      50% {
        transform: scale(1.2) rotate(5deg);
      }
      75% {
        transform: scale(1.15) rotate(-3deg);
      }
    }
  `
  if (!document.head.querySelector('#premium-like-animations')) {
    style.id = 'premium-like-animations'
    document.head.appendChild(style)
  }
}

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

  const [isAnimating, setIsAnimating] = React.useState(false)
  const haptic = useHapticFeedback()

  const isOwnPost = user?.id === postCreatorId
  const hasLiked = likes.some(like => like.user_id === user?.id)
  
  // Calcular total de premium likes do post
  // Usar stats se disponível, caso contrário calcular diretamente dos likes
  const premiumLikesCount = React.useMemo(() => {
    if (stats?.premium_likes !== undefined) {
      return stats.premium_likes
    }
    // Fallback: calcular diretamente dos likes
    if (likes) {
      return likes.filter(like => like.is_premium === true).length
    }
    return 0
  }, [stats?.premium_likes, likes])
  
  const totalLikesCount = stats?.total_likes || likes?.length || 0
  const pointsReceived = stats?.total_points_received || 0
  const hasEnoughPoints = balance?.balance >= PREMIUM_PRICES.LIKE.POINTS // Verificação de segurança para balance

  const handlePremiumLike = () => {
    if (isOwnPost) {
      return // Não pode curtir próprio post
    }

    // Feedback háptico
    if (userPremiumLiked) {
      haptic.light() // Feedback leve ao descurtir
    } else {
      haptic.medium() // Feedback médio ao curtir premium
    }

    // Ativar animação
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600) // Duração da animação

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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={userPremiumLiked ? 'default' : 'outline'}
            size={size}
            onClick={handlePremiumLike}
            disabled={isOwnPost || isPremiumLiking || !hasEnoughPoints}
            className={cn(
              'transition-all duration-200 relative px-2 overflow-visible',
              userPremiumLiked && 'bg-red-500 hover:bg-red-600 text-white',
              isOwnPost && 'opacity-50 cursor-not-allowed',
              !hasEnoughPoints && 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400',
              isAnimating && 'animate-pulse scale-110',
              className
            )}
          >
            <Heart 
              size={iconSizes[size]} 
              className={cn(
                'transition-all duration-300',
                userPremiumLiked && 'fill-current',
                isAnimating && 'animate-[heartBeat_0.6s_ease-in-out] scale-125'
              )}
              style={{
                animation: isAnimating ? 'heartBeat 0.6s ease-in-out' : undefined
              }}
            />
            <span className={cn(
              "ml-1 text-xs transition-all duration-300 flex items-center gap-1",
              isAnimating && "scale-110 font-bold"
            )}>
              <span className="hidden sm:inline font-semibold">Premium</span>
              <span className={cn(
                "font-medium",
                userPremiumLiked && "text-white",
                !userPremiumLiked && "text-gray-700 dark:text-gray-300"
              )}>{premiumLikesCount}</span>
            </span>
            
            {/* Ícone de moedas sobreposto no canto superior direito - mostrar se usuário deu like premium */}
            {userPremiumLiked && (
              <Coins 
                size={iconSizes[size] + 4} 
                className="absolute -top-1 -right-1 text-yellow-500 animate-bounce" 
              />
            )}
            
            {/* Efeito de partículas ao clicar */}
            {isAnimating && (
              <>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute animate-ping text-yellow-400 opacity-75">
                    ✨
                  </span>
                </span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">🎉 Curtida Premium</p>
            <p className="text-xs">💰 Gasta {PREMIUM_PRICES.LIKE.POINTS} ConfiPoints</p>
            <p className="text-xs">🎁 Recompensa o criador com {PREMIUM_PRICES.LIKE.POINTS} pontos</p>
            
            {!hasEnoughPoints ? (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-600 font-semibold">❌ Saldo Insuficiente</p>
                <p className="text-xs text-red-500">Você tem {balance?.balance || 0} ConfiPoints</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-green-400 mt-1">
                  ✨ Incentiva criação de conteúdo de qualidade
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  💰 Saldo: {balance?.balance || 0} ConfiPoints
                </p>
              </>
            )}
            
            {premiumLikesCount > 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                ⚡ {premiumLikesCount} curtidas premium neste post
              </p>
            )}
            {userPremiumLikesCount > 0 && (
              <p className="text-xs text-green-400 mt-1">
                ✓ Você deu {userPremiumLikesCount} likes premium aqui
              </p>
            )}
            {hasEnoughPoints && (
              <p className="text-xs text-blue-400 mt-1">💡 Clique várias vezes para enviar mais!</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
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
