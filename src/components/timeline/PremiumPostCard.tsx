'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Heart, MessageCircle, Share2, Crown, Sparkles, Zap, Flame, Star, Trophy, Clock } from 'lucide-react'
import Link from 'next/link'
import { TimelinePost as TimelinePostType } from '@/types/timeline'
import { CommentSection } from './CommentSection'
import { PostOptionsMenu } from './PostOptionsMenu'
import { MentionText } from '@/components/ui/MentionText'
import { SharePostModal } from './SharePostModal'

interface PremiumPostCardProps {
  post: TimelinePostType
  onShare: (postId: string) => void
  onLike?: (postId: string) => void
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  showComments?: boolean
  isTrending?: boolean
  trendingReason?: string
  isDeleting?: boolean
}

export function PremiumPostCard({
  post,
  onShare,
  onLike,
  onEdit,
  onDelete,
  showComments = true,
  isTrending = false,
  trendingReason,
  isDeleting = false
}: PremiumPostCardProps) {
  const [showCommentSection, setShowCommentSection] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    // Se foi há menos de 1 minuto
    if (diffInMinutes < 1) {
      return 'Agora'
    }

    // Se foi há menos de 1 hora
    if (diffInMinutes < 60) {
      return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
    }

    // Se foi há menos de 24 horas
    if (diffInHours < 24) {
      return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
    }

    // Se foi há menos de 7 dias
    if (diffInDays < 7) {
      return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
    }

    // Se foi há mais de 7 dias, mostrar data completa
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours === 1) return '1 hora atrás'
    if (diffInHours < 24) return `${diffInHours} horas atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 dia atrás'
    return `${diffInDays} dias atrás`
  }

  const daysLeft = post.metadata?.expires_at 
    ? Math.ceil((new Date(post.metadata.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 7

  return (
    <div className="relative group">
      {/* Efeito de brilho animado premium */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 animate-pulse"></div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-2xl blur opacity-30"></div>
      
      <Card 
        id={`post-${post.id}`} 
        className="relative overflow-hidden border-2 border-gradient-to-r from-amber-400 to-yellow-500 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-amber-950/50 dark:via-yellow-950/40 dark:to-amber-900/30 shadow-2xl shadow-amber-500/30 dark:shadow-amber-800/40 hover:shadow-amber-500/50 transition-all duration-500"
      >
        {/* Badge Premium Fixo no Topo */}
        <div className="absolute top-0 right-0 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-bl-2xl opacity-80"></div>
            <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 rounded-bl-2xl shadow-lg">
              <div className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-white animate-pulse" fill="white" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decoração superior com padrão */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-amber-400/20 to-transparent"></div>
        
        {/* Header Premium */}
        <CardContent className="pt-6 pb-4 px-6">
          {/* Header do usuário */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-sm opacity-50"></div>
                <Link href={`/perfil/${post.user_id}`} className="hover:opacity-80 transition-opacity relative">
                  <UserAvatar 
                    src={post.user_avatar}
                    alt={post.user_name}
                    fallback={post.user_name?.charAt(0).toUpperCase() || 'U'}
                    size="lg"
                    userId={post.user_id}
                    className="cursor-pointer hover:ring-2 hover:ring-amber-400 hover:ring-offset-2 transition-all relative z-10 border-2 border-amber-400"
                  />
                </Link>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link 
                    href={`/perfil/${post.user_id}`}
                    className="font-semibold text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    {post.user_name || 'Usuário'}
                  </Link>
                  
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-md">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                  
                  <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Destacado
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDateTime(post.created_at)}</span>
                  {daysLeft > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-medium flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {daysLeft} dias restantes
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Menu de opções */}
            <PostOptionsMenu
              postId={post.id}
              postUserId={post.user_id}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </div>

          {/* Título Premium */}
          <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-3 pr-12">
            {post.title}
          </h3>

          {/* Conteúdo */}
          {post.description && (
            <div className="mb-4">
              <MentionText 
                text={post.description} 
                className="text-amber-800 dark:text-amber-200 leading-relaxed"
              />
            </div>
          )}

          {post.content && post.content !== post.description && (
            <div className="mb-4">
              <MentionText 
                text={post.content} 
                className="text-amber-800 dark:text-amber-200 leading-relaxed"
              />
            </div>
          )}

          {/* Imagens com efeito especial */}
          {post.images && post.images.length > 0 && (
            <div className="mb-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(post.images.length, 3)}, 1fr)` }}>
              {post.images.slice(0, 3).map((image, index) => (
                <div 
                  key={index}
                  className="relative overflow-hidden rounded-xl border-2 border-amber-300 dark:border-amber-700 shadow-lg hover:shadow-amber-500/50 transition-all duration-300 group"
                >
                  <img 
                    src={image} 
                    alt={`Post image ${index + 1}`}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
              {post.images.length > 3 && (
                <div className="absolute bottom-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-tl-lg font-semibold text-sm">
                  +{post.images.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Stats Premium */}
          <div className="flex items-center gap-6 pt-3 border-t border-amber-300/50 dark:border-amber-700/50">
            {/* Likes */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike && onLike(post.id)}
              className="text-amber-700 dark:text-amber-300 hover:text-red-500 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? 'fill-current text-red-500' : ''}`} />
              <span>{post.likes_count || 0}</span>
            </Button>

            {/* Comentários */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentSection(!showCommentSection)}
              className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{post.comments_count || 0}</span>
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Footer com badge */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-300/50 dark:border-amber-700/50">
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">Post Premium • {post.metadata?.points_spent || 50} ConfiPoints gastos</span>
            </div>
            
            {isTrending && trendingReason && (
              <Badge variant="default" className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                <Flame className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seção de comentários */}
      {showCommentSection && showComments && (
        <div className="mt-4">
          <CommentSection 
            postId={post.id}
          />
        </div>
      )}

      {/* Modal de compartilhamento */}
      <SharePostModal
        isOpen={showShareModal}
        postId={post.id}
        postTitle={post.title}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  )
}