'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Heart, MessageCircle, Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { TrendingPostModal } from './TrendingPostModal'
import { usePostViews, usePostViewTracker } from '@/hooks/usePostViews'
import { useCommentsCount } from '@/hooks/useCommentsCount'
import { DynamicAvailabilityBadge } from '@/components/ui/DynamicAvailabilityBadge'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TrendingPostCardProps {
  className?: string
}

interface TrendingPost {
  id: string
  content: string
  images: string[]
  location_city: string
  location_state: string
  likes_count: number
  comments_count: number
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url?: string
    user_type: string
    is_available?: boolean
  }
  engagement_score: number
  trending_reason: 'high_engagement' | 'new_post' | 'verified_professional'
}

export function TrendingPostCard({ className = '' }: TrendingPostCardProps) {
  const [trendingPost, setTrendingPost] = useState<TrendingPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Hook para visualizações (só será usado quando o post for carregado)
  const { viewsCount } = usePostViews(trendingPost?.id || '')
  usePostViewTracker(trendingPost?.id || '')
  
  // Hook para contagem de comentários
  const { count: commentsCount } = useCommentsCount(trendingPost?.id || '')

  useEffect(() => {
    loadTrendingPost()
  }, [])

  const loadTrendingPost = async () => {
    try {
      setIsLoading(true)
      
      // Buscar posts com mais curtidas e comentários das últimas 24h
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          id,
          content,
          images,
          location_city,
          location_state,
          likes_count,
          comments_count,
          created_at,
          user:profiles!feed_posts_user_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type,
            is_available
          )
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('likes_count', { ascending: false })
        .order('comments_count', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error

      if (data) {
        // Calcular score de engajamento
        const engagementScore = (data.likes_count * 2) + (data.comments_count * 3)
        
        // Determinar motivo do trending
        let trendingReason: TrendingPost['trending_reason'] = 'high_engagement'
        if (data.likes_count > 10 || data.comments_count > 5) {
          trendingReason = 'high_engagement'
        } else if ((data.user as any)?.user_type === 'professional') {
          trendingReason = 'verified_professional'
        } else {
          trendingReason = 'new_post'
        }

        setTrendingPost({
          id: data.id,
          content: data.content,
          images: data.images || [],
          location_city: data.location_city,
          location_state: data.location_state,
          likes_count: data.likes_count,
          comments_count: data.comments_count,
          created_at: data.created_at,
          user: Array.isArray(data.user) ? data.user[0] : data.user,
          engagement_score: engagementScore,
          trending_reason: trendingReason
        })
      }
    } catch (error) {
      console.error('Erro ao carregar post em alta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendingIcon = (reason: string) => {
    switch (reason) {
      case 'high_engagement':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'verified_professional':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'new_post':
        return <Star className="h-4 w-4 text-blue-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-orange-500" />
    }
  }

  const getTrendingText = (reason: string) => {
    switch (reason) {
      case 'high_engagement':
        return '🔥 Em Alta'
      case 'verified_professional':
        return '⭐ Profissional'
      case 'new_post':
        return '✨ Novo'
      default:
        return '📈 Trending'
    }
  }

  const getTrendingColor = (reason: string) => {
    switch (reason) {
      case 'high_engagement':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'verified_professional':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'new_post':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!trendingPost) {
    return null
  }

  return (
    <>
      <Card 
        className={`${className} cursor-pointer hover:shadow-lg transition-shadow border-2 border-yellow-200 dark:border-yellow-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20`}
        onClick={() => setShowModal(true)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getTrendingIcon(trendingPost.trending_reason)}
              <span className="font-semibold text-sm dark:text-white">Post em Alta</span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${getTrendingColor(trendingPost.trending_reason)}`}
            >
              {getTrendingText(trendingPost.trending_reason)}
            </Badge>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar
              src={trendingPost.user.avatar_url}
              alt={trendingPost.user.full_name}
              fallback={trendingPost.user.full_name.charAt(0).toUpperCase()}
              size="md"
              className="w-10 h-10"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {trendingPost.user.full_name}
                </h4>
                {/* Status de Disponibilidade - Dinâmico */}
                <DynamicAvailabilityBadge userId={trendingPost.user.id} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {trendingPost.location_city}, {trendingPost.location_state}
              </p>
            </div>
          </div>

          {/* Post Preview */}
          <div className="mb-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              {trendingPost.content}
            </p>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{trendingPost.likes_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{commentsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{viewsCount}</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {formatDistanceToNow(new Date(trendingPost.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </div>
          </div>

          {/* Click to view */}
          <div className="mt-3 text-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
            >
              Ver Post Completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <TrendingPostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        postId={trendingPost.id}
      />
    </>
  )
}
