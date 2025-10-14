'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { usePostLikes } from '@/hooks/usePostLikes'

interface LikeButtonWithNotificationsProps {
  postId: string
  postOwnerId: string
  postOwnerName: string
  isLiked: boolean
  likesCount: number
  className?: string
}

export function LikeButtonWithNotifications({
  postId,
  postOwnerId,
  postOwnerName,
  isLiked,
  likesCount,
  className = ''
}: LikeButtonWithNotificationsProps) {
  const { toggleLike, isLiking } = usePostLikes({
    postId,
    postOwnerId,
    postOwnerName
  })

  return (
    <button
      onClick={toggleLike}
      disabled={isLiking}
      className={`flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-red-500 transition-colors ${
        isLiked ? 'text-red-500' : ''
      } ${className}`}
    >
      <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isLiked ? 'fill-current' : ''}`} />
      <span className="text-sm md:text-base">
        {isLiking ? 'Curtindo...' : likesCount > 0 ? likesCount : 'Curtir'}
      </span>
    </button>
  )
}
