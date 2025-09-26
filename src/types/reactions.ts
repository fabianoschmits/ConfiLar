export type ReactionType = 'like' | 'love' | 'laugh' | 'thumbs_up' | 'thumbs_down' | 'fire' | 'star'

export interface Reaction {
  id: string
  post_id: string
  user_id: string
  reaction_type: ReactionType
  created_at: string
}

export interface ReactionCounts {
  like: number
  love: number
  laugh: number
  thumbs_up: number
  thumbs_down: number
  fire: number
  star: number
  total: number
}

export interface UserReaction {
  post_id: string
  reaction_type: ReactionType | null
}

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  thumbs_up: '👍',
  thumbs_down: '👎',
  fire: '🔥',
  star: '⭐'
}

export const REACTION_COLORS: Record<ReactionType, string> = {
  like: 'text-blue-500',
  love: 'text-red-500',
  laugh: 'text-yellow-500',
  thumbs_up: 'text-green-500',
  thumbs_down: 'text-gray-500',
  fire: 'text-orange-500',
  star: 'text-yellow-400'
}
