import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { ReactionType, REACTION_EMOJIS, REACTION_COLORS } from '@/types/reactions'
import { useReactions, useReactionCounts, useReactionUsers } from '@/hooks/useReactions'

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

  const handleReaction = () => {
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
      className={`flex items-center space-x-1 md:space-x-2 hover:bg-gray-100 ${className} ${
        userReaction === 'like' ? 'bg-gray-100' : ''
      }`}
      onClick={handleReaction}
      disabled={isLoading || countsLoading}
    >
        <Heart 
          className={`h-4 w-4 md:h-5 md:w-5 ${
            userReaction === 'like' 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-600 hover:text-gray-700'
          }`} 
        />
      {reactionCounts.like > 0 && (
        <span className="text-sm md:text-base font-medium">{reactionCounts.like}</span>
      )}
    </Button>
  )
}
