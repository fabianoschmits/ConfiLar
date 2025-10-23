'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Share2, Eye, TrendingUp, MessageCircle } from 'lucide-react'
import { LikeButtonWithNotifications } from './LikeButtonWithNotifications'
import { CommentSectionWithNotifications } from './CommentSectionWithNotifications'
import { usePostViews, usePostViewTracker } from '@/hooks/usePostViews'
import { useCommentsCount } from '@/hooks/useCommentsCount'

interface TimelinePostWithNotificationsProps {
  post: {
    id: string
    title: string
    content: string
    images?: string[]
    likes_count: number
    comments_count: number
    is_liked: boolean
    created_at: string
    user: {
      id: string
      full_name: string
      avatar_url?: string
      user_type: string
    }
  }
  onShare?: (postId: string) => void
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  className?: string
}

export function TimelinePostWithNotifications({
  post,
  onShare,
  onEdit,
  onDelete,
  className = ''
}: TimelinePostWithNotificationsProps) {
  const [showComments, setShowComments] = useState(false)
  
  // Hooks para visualizações e comentários
  const { viewsCount } = usePostViews(post.id)
  usePostViewTracker(post.id)
  const { count: commentsCount } = useCommentsCount(post.id)

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar 
              src={post.user.avatar_url}
              alt={post.user.full_name}
              fallback={post.user.full_name.charAt(0).toUpperCase()}
              size="md"
              userId={post.user.id}
              showReferralBadge={true}
            />
            <div>
              <h3 className="font-semibold text-gray-900">{post.user.full_name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {post.user.user_type === 'professional' && (
              <Badge variant="secondary" className="text-xs">
                Profissional
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Conteúdo do post */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          
          {/* Imagens */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {viewsCount} visualizações
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {post.likes_count} curtidas
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {commentsCount} comentários
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <LikeButtonWithNotifications
            postId={post.id}
            postOwnerId={post.user.id}
            postOwnerName={post.user.full_name}
            isLiked={post.is_liked}
            likesCount={post.likes_count}
          />

          <CommentSectionWithNotifications
            postId={post.id}
            postOwnerId={post.user.id}
            postOwnerName={post.user.full_name}
            isOpen={showComments}
            onToggle={() => setShowComments(!showComments)}
          />

          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(post.id)}
              className="flex items-center gap-2 text-gray-500 hover:text-green-500"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
