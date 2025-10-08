'use client'

import { useState, useEffect } from 'react'
import { X, Heart, MessageCircle, Share2, Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useAuthContext } from '@/contexts/AuthContext'
import { useComments } from '@/hooks/useComments'
import { useReactions } from '@/hooks/useReactions'
import { usePostViews, usePostViewTracker } from '@/hooks/usePostViews'
import { useCommentsCount } from '@/hooks/useCommentsCount'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TrendingPostModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}

interface PostData {
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
  }
}

export function TrendingPostModal({ isOpen, onClose, postId }: TrendingPostModalProps) {
  const { user } = useAuthContext()
  const [post, setPost] = useState<PostData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  
  // Hooks para funcionalidades do post
  const { 
    comments, 
    isLoading: commentsLoading, 
    addComment, 
    likeComment
  } = useComments({ post_id: postId })
  
  const { 
    userReaction, 
    addReaction, 
    removeReaction,
    isLoading: reactionsLoading 
  } = useReactions(postId)

  // Hook para gerenciar visualizações
  const { viewsCount } = usePostViews(postId)
  usePostViewTracker(postId) // Registra visualização automaticamente
  
  // Hook para gerenciar contagem de comentários
  const { count: commentsCount } = useCommentsCount(postId)

  // Carregar dados do post
  useEffect(() => {
    if (isOpen && postId) {
      loadPost()
    }
  }, [isOpen, postId])

  const loadPost = async () => {
    try {
      setIsLoading(true)
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
            user_type
          )
        `)
        .eq('id', postId)
        .single()

      if (error) throw error
      setPost({
        id: data.id,
        content: data.content,
        images: data.images || [],
        location_city: data.location_city,
        location_state: data.location_state,
        likes_count: data.likes_count,
        comments_count: data.comments_count,
        created_at: data.created_at,
        user: Array.isArray(data.user) ? data.user[0] : data.user
      })
    } catch (error) {
      console.error('Erro ao carregar post:', error)
      toast.error('Erro ao carregar post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user || !post) return
    
    try {
      if (userReaction) {
        await removeReaction()
      } else {
        await addReaction('like')
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error)
      toast.error('Erro ao curtir post')
    }
  }

  const handleShare = async () => {
    if (!post) return
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Post do ConfiLar',
          text: post.content,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const handleAddComment = async (content: string) => {
    if (!user || !content.trim()) return
    
    try {
      await addComment(content)
      toast.success('Comentário adicionado!')
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      toast.error('Erro ao adicionar comentário')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Post em Alta</h2>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              🔥 Trending
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Carregando post...</p>
            </div>
          ) : post ? (
            <div className="p-4">
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-4">
                <UserAvatar
                  src={post.user.avatar_url}
                  alt={post.user.full_name}
                  fallback={post.user.full_name.charAt(0).toUpperCase()}
                  size="md"
                  className="w-12 h-12"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{post.user.full_name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {post.user.user_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{post.location_city}, {post.location_state}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}</span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Imagem ${index + 1} do post de ${post.user.full_name}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes_count} curtidas</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{commentsCount} comentários</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{viewsCount} visualizações</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 py-3 border-t border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    userReaction ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                  disabled={reactionsLoading}
                >
                  <Heart className={`h-4 w-4 ${userReaction ? 'fill-current' : ''}`} />
                  Curtir
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 text-gray-500 hover:text-blue-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  Comentar
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-500 hover:text-green-500"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </div>

              {/* Comments Section */}
              {showComments && (
                <div className="mt-4">
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <UserAvatar
                        src={(user as any)?.avatar_url}
                        alt={(user as any)?.full_name || 'Usuário'}
                        fallback={(user as any)?.full_name?.charAt(0).toUpperCase() || 'U'}
                        size="sm"
                        className="w-8 h-8"
                      />
                      <div className="flex-1">
                        <textarea
                          placeholder="Adicione um comentário..."
                          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              const target = e.target as HTMLTextAreaElement
                              if (target.value.trim()) {
                                handleAddComment(target.value.trim())
                                target.value = ''
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {commentsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <UserAvatar
                            src={comment.user.avatar_url}
                            alt={comment.user.full_name}
                            fallback={comment.user.full_name.charAt(0).toUpperCase()}
                            size="sm"
                            className="w-8 h-8"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{comment.user.full_name}</span>
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(comment.created_at), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-gray-500 hover:text-red-500"
                                  onClick={() => likeComment(comment.id)}
                                >
                                  <Heart className="h-3 w-3 mr-1" />
                                  {comment.likes_count || 0}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">Post não encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
