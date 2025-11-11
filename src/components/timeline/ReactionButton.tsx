import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { ReactionType, REACTION_EMOJIS, REACTION_COLORS } from '@/types/reactions'
import { useReactions, useReactionCounts, useReactionUsers } from '@/hooks/useReactions'
import { useState } from 'react'
import { cn } from '@/lib/utils'
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
    @keyframes heartPulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.8;
      }
    }
  `
  if (!document.head.querySelector('#reaction-like-animations')) {
    style.id = 'reaction-like-animations'
    document.head.appendChild(style)
  }
}

interface ReactionButtonProps {
  postId: string
  postOwnerId?: string
  postOwnerName?: string
  className?: string
}

export function ReactionButton({ postId, postOwnerId, postOwnerName, className }: ReactionButtonProps) {
  const { addReaction, userReaction, isLoading } = useReactions(postId, postOwnerId, postOwnerName)
  const { reactionCounts, isLoading: countsLoading } = useReactionCounts(postId)
  const { reactionUsers, isLoading: usersLoading } = useReactionUsers(postId)
  const [isAnimating, setIsAnimating] = useState(false)
  const haptic = useHapticFeedback()

  const handleReaction = () => {
    // Feedback háptico
    if (userReaction === 'like') {
      haptic.light() // Feedback leve ao descurtir
    } else {
      haptic.success() // Feedback de sucesso ao curtir
    }
    
    // Ativar animação
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600) // Duração da animação

    if (userReaction === 'like') {
      // Se já curtiu, remove a curtida
      addReaction('like')
    } else {
      // Se não curtiu ou curtiu com outro emoji, muda para like
      addReaction('like')
    }
  }

  const formatUserNames = () => {
    if (reactionUsers.length === 0) return ''
    
    const maxNames = 5
    const names = reactionUsers.slice(0, maxNames).map(user => user.name)
    const remaining = reactionUsers.length - maxNames
    
    if (remaining > 0) {
      return `${names.join(', ')} e mais ${remaining}`
    }
    
    return names.join(', ')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'flex items-center space-x-1 md:space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 relative overflow-visible transition-all duration-200',
        userReaction === 'like' ? 'bg-gray-100 dark:bg-gray-900' : '',
        isAnimating && 'scale-110',
        className
      )}
      onClick={handleReaction}
      disabled={isLoading || countsLoading}
    >
        <Heart 
          className={cn(
            'h-4 w-4 md:h-5 md:w-5 transition-all duration-300',
            userReaction === 'like' 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
            isAnimating && 'animate-[heartBeat_0.6s_ease-in-out]'
          )}
          style={{
            animation: isAnimating ? 'heartBeat 0.6s ease-in-out' : undefined
          }}
        />
      {reactionCounts.like > 0 && (
        <span className={cn(
          "text-sm md:text-base font-medium transition-all duration-300",
          isAnimating && "scale-110 font-bold"
        )}>
          {reactionCounts.like}
        </span>
      )}
      
      {/* Efeito de partículas ao clicar */}
      {isAnimating && userReaction === 'like' && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute animate-ping text-red-400 opacity-75 text-xs">
            ❤️
          </span>
        </span>
      )}
    </Button>
  )
}
