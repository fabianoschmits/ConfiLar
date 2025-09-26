import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ReactionType, REACTION_EMOJIS, REACTION_COLORS } from '@/types/reactions'
import { useReactions, useReactionCounts } from '@/hooks/useReactions'

interface ReactionButtonProps {
  postId: string
  className?: string
}

export function ReactionButton({ postId, className }: ReactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { addReaction, userReaction, isLoading } = useReactions(postId)
  const { reactionCounts, isLoading: countsLoading } = useReactionCounts(postId)

  const reactionTypes: ReactionType[] = ['like', 'love', 'laugh', 'thumbs_up', 'thumbs_down', 'fire', 'star']

  const handleReaction = (reactionType: ReactionType) => {
    addReaction(reactionType)
    setIsOpen(false)
  }

  const getDisplayReaction = () => {
    if (userReaction) {
      return {
        emoji: REACTION_EMOJIS[userReaction],
        color: REACTION_COLORS[userReaction],
        count: reactionCounts[userReaction]
      }
    }

    // Mostrar a reação mais popular
    const mostPopular = Object.entries(reactionCounts)
      .filter(([key, value]) => key !== 'total' && (value as number) > 0)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0]

    if (mostPopular) {
      const [reactionType, count] = mostPopular
      return {
        emoji: REACTION_EMOJIS[reactionType as ReactionType],
        color: REACTION_COLORS[reactionType as ReactionType],
        count
      }
    }

    return {
      emoji: '👍',
      color: 'text-gray-500',
      count: 0
    }
  }

  const displayReaction = getDisplayReaction()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center space-x-1 hover:bg-gray-100 ${className} ${displayReaction.color}`}
          disabled={isLoading || countsLoading}
        >
          <span className="text-base md:text-lg">{displayReaction.emoji}</span>
          {displayReaction.count > 0 && (
            <span className="text-xs md:text-sm font-medium">{displayReaction.count}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex items-center space-x-1">
          {reactionTypes.map((reactionType) => (
            <Button
              key={reactionType}
              variant="ghost"
              size="sm"
              className={`w-8 h-8 md:w-10 md:h-10 p-0 hover:bg-gray-100 ${
                userReaction === reactionType ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleReaction(reactionType)}
              title={`${REACTION_EMOJIS[reactionType]} ${reactionCounts[reactionType] || 0}`}
            >
              <span className="text-base md:text-xl">{REACTION_EMOJIS[reactionType]}</span>
            </Button>
          ))}
        </div>
        {reactionCounts.total > 0 && (
          <div className="mt-2 pt-2 border-t">
            <div className="text-xs text-gray-500 text-center">
              {reactionCounts.total} reação{reactionCounts.total !== 1 ? 'ões' : ''}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
