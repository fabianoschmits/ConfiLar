'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { Plus, Search, MessageCircle, Heart, Share2, MoreHorizontal, Flame, X, Send, Camera, Loader2, RefreshCw, Crown } from 'lucide-react'
import { useUnifiedTimeline } from '@/hooks/useUnifiedTimeline'
import { useTimelineRealtime } from '@/hooks/useTimelineRealtime'
import { usePostRanking } from '@/hooks/usePostRanking'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { NewPostForm } from '@/components/timeline/NewPostForm'
import { PremiumPostForm } from '@/components/timeline/PremiumPostForm'
import { Modal } from '@/components/ui/modal'
import { LocationFilterSelector } from '@/components/timeline/LocationFilterSelector'
import { useLocationFilters } from '@/hooks/useLocationFilters'
import { getCategories } from '@/data/services'
import { ErrorHandler } from '@/components/ErrorHandler'
import { FeedSkeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { UnifiedTimelineItem } from '@/types/timeline'
import { useComments } from '@/hooks/useComments'
import { SharePostModal } from '@/components/timeline/SharePostModal'
import { useReactions, useReactionCounts } from '@/hooks/useReactions'
import { PostOptionsMenu } from '@/components/timeline/PostOptionsMenu'
import { CommentOptionsMenu } from '@/components/timeline/CommentOptionsMenu'
import { EditPostModal } from '@/components/timeline/EditPostModal'
import { useCommentsCount } from '@/hooks/useCommentsCount'
import { cn } from '@/lib/utils'
import { PremiumLikeButton } from '@/components/points/PremiumLikeButton'

export default function FeedPage() {
  const [mounted, setMounted] = useState(false)
  const { profile } = useAuthContext()
  const searchParams = useSearchParams()
  const highlightPostId = searchParams.get('post')

  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'notifications'>('posts')
  const [showNewPost, setShowNewPost] = useState(false)
  const [showPremiumPost, setShowPremiumPost] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [postStatus, setPostStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const { currentFilter, setFilter } = useLocationFilters()

  const {
    items,
    isLoading,
    error,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    likePost,
    addPost,
    addPremiumPost,
    renewPremiumPost,
    editPost,
    deletePost,
    refetch
  } = useUnifiedTimeline({ search, location_filter: currentFilter })
  
  const [editingPost, setEditingPost] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [renewingPostId, setRenewingPostId] = useState<string | null>(null)
  const [showRenewPremiumModal, setShowRenewPremiumModal] = useState(false)

  const { containerRef, isPulling, isRefreshing, pullDistance } = usePullToRefresh({ 
    onRefresh: async () => {
      await refetch()
    }
  })

  const { loadingRef } = useInfiniteScroll({ 
    hasNextPage, 
    isFetchingNextPage, 
    fetchNextPage: loadMore, 
    threshold: 800 
  })

  useTimelineRealtime()
  
  const { trendingPosts } = usePostRanking({ 
    location_city: profile?.location_city, 
    location_state: profile?.location_state, 
    limit: 5 
  })

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (highlightPostId && mounted) {
      setTimeout(() => {
        const el = document.getElementById(`post-${highlightPostId}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.classList.add('animate-pulse', 'ring-4', 'ring-blue-500')
        setTimeout(() => {
          el?.classList.remove('animate-pulse', 'ring-4', 'ring-blue-500')
        }, 2000)
      }, 800)
    }
  }, [highlightPostId, mounted])

  const filteredItems = items.filter(item => {
    if (activeTab === 'posts') {
      // Incluir todos os posts (normais e premium)
      // Excluir apenas notificações automáticas (que têm metadata.type diferente de 'premium')
      if (item.type !== 'post') return false
      const metadataType = (item as any).metadata?.type
      // Incluir posts sem metadata.type, posts premium, e excluir notificações automáticas
      return !metadataType || metadataType === 'premium'
    }
    if (activeTab === 'notifications') {
      return item.type === 'notification' || ((item as any).metadata?.type && (item as any).metadata?.type !== 'premium')
    }
    return true
  })

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const handleLike = (postId: string) => {
    likePost(postId)
    setLikedPosts(prev => {
      const next = new Set(prev)
      next.has(postId) ? next.delete(postId) : next.add(postId)
      return next
    })
  }

  const handleEditPost = (postId: string) => {
    const post = items.find(item => item.type === 'post' && item.id === postId)
    if (post) {
      setEditingPost(post)
      setShowEditModal(true)
    }
  }

  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId)
    try {
      await deletePost(postId)
      await refetch()
    } catch (error) {
      console.error('Erro ao deletar post:', error)
      alert('Erro ao deletar post')
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleCameraClick = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Tentar abrir câmera
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setShowNewPost(true)
        })
        .catch(() => {
          setShowNewPost(true)
        })
    } else {
      setShowNewPost(true)
    }
  }

  // Stories mock (futuro)
  const stories = [
    { id: '1', name: 'Seu story', avatar: profile?.avatar_url, hasNew: true },
    { id: '2', name: 'João Silva', avatar: null, hasNew: false },
    { id: '3', name: 'Maria Santos', avatar: null, hasNew: true },
    { id: '4', name: 'Pedro Costa', avatar: null, hasNew: false },
  ]

  if (!mounted) return null

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-white dark:bg-black">
        {/* HEADER FIXO */}
        <header className="sticky top-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                ConfiLar
              </h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowNewPost(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
                  title="Criar novo post"
                >
                  <Plus className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
                  <Search className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
                  <MessageCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>

            {/* ABAS */}
            <div className="flex gap-6">
              {(['all', 'posts', 'notifications'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 border-b-2 transition-all font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab === 'all' ? 'Todos' : tab === 'posts' ? 'Posts' : 'Notificações'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* STORIES (Futuro) */}
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {stories.map((story, i) => (
                <div key={story.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                  <div className={`relative w-16 h-16 rounded-full p-0.5 ${
                    story.hasNew 
                      ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' 
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}>
                    <div className="w-full h-full rounded-full bg-white dark:bg-black p-0.5">
                      {story.avatar ? (
                        <img 
                          src={story.avatar} 
                          alt={story.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
                          <span className="text-lg">{story.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[70px]">
                    {i === 0 ? 'Seu story' : story.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PULL TO REFRESH */}
        {(isPulling || isRefreshing) && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white dark:bg-black rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-800">
              {isRefreshing ? (
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" style={{ transform: `rotate(${pullDistance * 2}deg)` }} />
              )}
            </div>
          </div>
        )}

        {/* FEED */}
        <div ref={containerRef} className="max-w-2xl mx-auto pb-20">
          {isLoading ? (
            <div className="space-y-4 p-4">
              <FeedSkeleton />
              <FeedSkeleton />
              <FeedSkeleton />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4">
                <MessageCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Seja o primeiro a compartilhar algo!
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredItems.map(item => item.type === 'post' && (
                <InstagramPost
                  key={item.id}
                  post={item}
                  isLiked={likedPosts.has(item.id)}
                  onLike={() => handleLike(item.id)}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onRenewPremium={(postId) => {
                    setRenewingPostId(postId)
                    setShowRenewPremiumModal(true)
                  }}
                  isTrending={trendingPosts.some(t => t.id === item.id)}
                  isDeleting={deletingPostId === item.id}
                />
              ))}

              {hasNextPage && (
                <div className="flex justify-center py-8">
                  {isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => loadMore()}
                      className="rounded-full"
                    >
                      Carregar mais
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>


        {/* MODAIS */}
        {/* Modal de Novo Post */}
        {showNewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNewPost(false)}
            />

            {/* Modal Content - Usando o próprio componente como modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
              <NewPostForm
                onSubmit={async (data) => {
                  if (!profile?.id) {
                    alert('Erro: Usuário não autenticado')
                    return
                  }
                  
                  setIsPosting(true)
                  setPostStatus('sending')
                  
                  try {
                    console.log('📝 [Test Feed] Criando post:', {
                      isPremium: data.isPremium,
                      pointsToSpend: data.pointsToSpend,
                      durationDays: data.durationDays,
                      description: data.description.substring(0, 50) + '...'
                    })

                    // Se for post premium, usar addPremiumPost
                    if (data.isPremium && data.pointsToSpend && data.durationDays) {
                      console.log('👑 [Test Feed] Criando POST PREMIUM')
                      const premiumPost = await addPremiumPost({
                        type: 'post',
                        user_id: profile.id,
                        user_name: profile.full_name || 'Usuário',
                        user_avatar: profile.avatar_url,
                        user_type: profile.user_type,
                        title: data.description.trim().slice(0, 100), // Título gerado da descrição
                        description: data.description,
                        images: data.images,
                        service_category_id: data.service,
                        location_state: profile.location_state,
                        location_city: profile.location_city,
                        pointsToSpend: data.pointsToSpend,
                        durationDays: data.durationDays,
                        likes_count: 0,
                        comments_count: 0,
                        is_liked: false
                      } as any)
                      console.log('✅ [Test Feed] Post premium criado:', premiumPost.id)
                    } else {
                      // Post normal
                      console.log('📄 [Test Feed] Criando POST NORMAL')
                      const normalPost = await addPost({
                        type: 'post',
                        user_id: profile.id,
                        user_name: profile.full_name || 'Usuário',
                        user_avatar: profile.avatar_url,
                        user_type: profile.user_type,
                        title: data.description.trim().slice(0, 100), // Título gerado da descrição
                        description: data.description,
                        images: data.images,
                        service_category_id: data.service,
                        location_state: profile.location_state,
                        location_city: profile.location_city,
                        likes_count: 0,
                        comments_count: 0,
                        is_liked: false
                      })
                      console.log('✅ [Test Feed] Post normal criado:', normalPost.id)
                    }
                    
                    // Mostrar "Enviado!" por 1 segundo antes de fechar
                    setPostStatus('sent')
                    setTimeout(() => {
                      setShowNewPost(false)
                      setPostStatus('idle')
                      refetch()
                    }, 1000)
                  } catch (error: any) {
                    console.error('❌ [Test Feed] Erro ao criar post:', error)
                    const errorMessage = error?.message || 'Erro ao criar post'
                    alert(`Erro ao criar post: ${errorMessage}`)
                    setPostStatus('idle')
                  } finally {
                    setIsPosting(false)
                  }
                }}
                onCancel={() => setShowNewPost(false)}
                isLoading={isPosting}
                postStatus={postStatus}
              />
            </div>
          </div>
        )}

        <Modal
          isOpen={showPremiumPost}
          onClose={() => setShowPremiumPost(false)}
          size="lg"
          title="Post Premium"
        >
          <PremiumPostForm
            onSubmit={async (data) => {
              if (!profile?.id) return
              await addPremiumPost({
                type: 'post',
                user_id: profile.id,
                user_name: profile.full_name || '',
                user_avatar: profile.avatar_url || undefined,
                user_type: profile.user_type || 'professional',
                title: data.title,
                description: data.description,
                images: data.images || [],
                service_category_id: data.service || undefined,
                location_state: profile.location_state || undefined,
                location_city: profile.location_city || undefined,
                pointsToSpend: data.pointsToSpend,
                durationDays: data.durationDays
              } as any)
              setShowPremiumPost(false)
            }}
            onCancel={() => setShowPremiumPost(false)}
            isLoading={false}
            postStatus="idle"
          />
        </Modal>

        {/* Modal de edição de post */}
        {editingPost && (
          <EditPostModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setEditingPost(null)
            }}
            post={editingPost}
            onSave={async (updatedPost: any) => {
              try {
                await editPost(editingPost.id, updatedPost)
                setShowEditModal(false)
                setEditingPost(null)
                await refetch()
              } catch (error) {
                console.error('Erro ao editar post:', error)
                alert('Erro ao editar post')
              }
            }}
          />
        )}

        {/* Modal de renovação premium */}
        {renewingPostId && (
          <Modal
            isOpen={showRenewPremiumModal}
            onClose={() => {
              setShowRenewPremiumModal(false)
              setRenewingPostId(null)
            }}
            size="lg"
            title="Renovar Post Premium"
          >
            <PremiumPostForm
              isRenewal={true}
              onSubmit={async (data) => {
                if (!profile?.id || !renewingPostId) return
                try {
                  setIsPosting(true)
                  setPostStatus('sending')
                  await renewPremiumPost(renewingPostId, data.pointsToSpend, data.durationDays)
                  setPostStatus('sent')
                  setTimeout(() => {
                    setShowRenewPremiumModal(false)
                    setRenewingPostId(null)
                    setPostStatus('idle')
                    refetch()
                  }, 1000)
                } catch (error: any) {
                  console.error('Erro ao renovar post premium:', error)
                  alert(`Erro ao renovar post premium: ${error?.message || 'Erro desconhecido'}`)
                  setPostStatus('idle')
                } finally {
                  setIsPosting(false)
                }
              }}
              onCancel={() => {
                setShowRenewPremiumModal(false)
                setRenewingPostId(null)
              }}
              isLoading={isPosting}
              postStatus={postStatus}
            />
          </Modal>
        )}
      </div>
    </MainLayout>
  )
}

// COMPONENTE DE POST (INSTAGRAM STYLE)
function InstagramPost({ post, isLiked, onLike, onEdit, onDelete, onRenewPremium, isTrending, isDeleting = false }: any) {
  const { profile } = useAuthContext()
  const [showFull, setShowFull] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  
  const text = post.description || post.title || ''
  const shouldTruncate = text.length > 120
  const displayText = showFull ? text : text.slice(0, 120) + (shouldTruncate ? '...' : '')

  // Hook de reações (likes) - igual ao usado na página principal
  const { addReaction, userReaction, isLoading: isReactionLoading } = useReactions(
    post.id,
    post.user_id,
    post.user_name || 'Usuário'
  )
  
  // Hook para contagem de reações
  const { reactionCounts } = useReactionCounts(post.id)
  
  // Verificar se o usuário curtiu
  const isLikedByUser = userReaction === 'like'
  const likesCount = reactionCounts.like || 0

  // Hook de comentários
  const {
    comments,
    isLoading: commentsLoading,
    addComment,
    likeComment,
    editComment,
    deleteComment,
    isAddingComment,
    isLikingComment,
    isEditingComment,
    isDeletingComment
  } = useComments({
    post_id: post.id,
    postOwnerId: post.user_id,
    postOwnerName: post.user_name || 'Usuário'
  })

  // Hook para contagem de comentários
  const { count: commentsCount } = useCommentsCount(post.id)

  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  // Função para curtir/descurtir usando o hook de reações
  const handleLikeClick = () => {
    setIsLiking(true)
    addReaction('like')
    // Atualizar cache e chamar callback
    onLike()
    setTimeout(() => setIsLiking(false), 300)
  }

  // Função para adicionar comentário
  const handleAddComment = async () => {
    if (!newComment.trim() || isAddingComment) return

    try {
      await addComment(newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      alert('Erro ao adicionar comentário')
    }
  }

  // Função para editar comentário
  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId)
    setEditCommentContent(currentContent)
  }

  // Função para salvar edição de comentário
  const handleSaveEditComment = async () => {
    if (!editingComment || !editCommentContent.trim() || isEditingComment) return

    try {
      await editComment(editingComment, editCommentContent.trim())
      setEditingComment(null)
      setEditCommentContent('')
    } catch (error) {
      console.error('Erro ao editar comentário:', error)
      alert('Erro ao editar comentário')
    }
  }

  // Função para cancelar edição de comentário
  const handleCancelEditComment = () => {
    setEditingComment(null)
    setEditCommentContent('')
  }

  // Função para deletar comentário
  const handleDeleteComment = async (commentId: string) => {
    if (isDeletingComment) return
    
    if (confirm('Tem certeza que deseja deletar este comentário?')) {
      try {
        await deleteComment(commentId)
      } catch (error) {
        console.error('Erro ao deletar comentário:', error)
        alert('Erro ao deletar comentário')
      }
    }
  }


  // Pegar dados do usuário de diferentes fontes possíveis
  const postUser = post.professional || post.user || {}
  const postImages = post.images || []
  
  // Garantir que temos todos os dados do usuário, tentando todas as fontes possíveis
  const userAvatar = 
    postUser?.avatar_url || 
    post.user_avatar || 
    post.professional?.avatar_url || 
    post.user?.avatar_url || 
    undefined
  
  // Extrair nome do usuário de todas as fontes possíveis
  const userName = 
    (postUser as any)?.full_name || 
    post.user_name || 
    (post.professional as any)?.full_name || 
    (post.user as any)?.full_name || 
    (post as any).metadata?.user || 
    'Usuário'
  
  const userId = 
    postUser?.id || 
    post.user_id || 
    post.professional?.id || 
    post.user?.id || 
    ''
  
  // Garantir que sempre temos um nome válido
  const displayUserName = userName && userName !== '' ? userName : 'Usuário'

  // Verificar se é post premium
  const isPremium = post.is_premium || post.tags?.includes('premium') || post.metadata?.type === 'premium'
  const premiumExpired = post.premium_expires_at ? new Date(post.premium_expires_at) < new Date() : false
  const isActivePremium = isPremium && !premiumExpired

  return (
    <article 
      id={`post-${post.id}`}
      className={`bg-white dark:bg-black border-b ${
        isActivePremium 
          ? 'border-l-2 border-l-yellow-400 dark:border-l-yellow-500 bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-900/10 dark:to-transparent' 
          : 'border-gray-200 dark:border-gray-900'
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/perfil/${userId}`}>
            <Avatar className="w-10 h-10 border-2 border-gray-200 dark:border-gray-800">
              <AvatarImage src={userAvatar} alt={displayUserName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                {displayUserName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/perfil/${userId}`}>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {displayUserName}
              </p>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {post.location_city && `${post.location_city}, ${post.location_state}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActivePremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 text-[10px] px-1.5 py-0.5">
              <Crown className="h-2.5 w-2.5 mr-1" />
              Premium
            </Badge>
          )}
          {isTrending && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <Flame className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
        <PostOptionsMenu
          postId={post.id}
          postUserId={userId}
          postTitle={post.title || post.description || 'Post'}
          onEdit={(postId) => {
            if (onEdit) onEdit(postId)
          }}
          onDelete={(postId) => {
            if (onDelete) onDelete(postId)
          }}
          onRenewPremium={onRenewPremium}
          isDeleting={isDeleting}
          isPremium={isPremium}
          premiumExpired={premiumExpired}
        />
      </div>

      {/* IMAGEM OU DESCRIÇÃO */}
      {postImages[0] ? (
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-900">
          <Image
            src={postImages[0]}
            alt={post.title || 'Post'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 640px"
          />
          {/* Double tap to like overlay */}
          {isLiking && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="h-20 w-20 text-red-500 fill-red-500 animate-ping" />
            </div>
          )}
        </div>
      ) : (
        /* DESCRIÇÃO NO LUGAR DA FOTO */
        <div className="px-4 py-4">
          <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words leading-relaxed">
            {displayText}
            {shouldTruncate && !showFull && (
              <button
                onClick={() => setShowFull(true)}
                className="text-gray-500 dark:text-gray-400 ml-1 font-medium hover:text-gray-700 dark:hover:text-gray-300"
              >
                mais
              </button>
            )}
          </p>
        </div>
      )}

      {/* AÇÕES */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center gap-4">
          {/* Botão de Like Normal */}
          <button
            onClick={handleLikeClick}
            disabled={isLiking || isReactionLoading}
            className="transition-transform active:scale-125 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Heart 
              className={`h-4 w-4 transition-all ${
                isLikedByUser 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {likesCount > 0 ? likesCount.toLocaleString('pt-BR') : '0'}
            </span>
          </button>
          
          {/* Botão de Like Premium */}
          <PremiumLikeButton
            postId={post.id}
            postCreatorId={userId}
            size="sm"
            showStats={false}
            className="h-auto"
          />
          
          {/* Botão de Comentários */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="transition-transform active:scale-125 flex items-center gap-1.5"
          >
            <MessageCircle 
              className={`h-4 w-4 transition-all ${
                showComments 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {(commentsCount || post.comments_count || 0).toLocaleString('pt-BR')}
            </span>
          </button>
          
          {/* Botão de Compartilhar */}
          <button 
            onClick={() => setShowShareModal(true)}
            className="transition-transform active:scale-125 flex items-center gap-1.5"
          >
            <Share2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              0
            </span>
          </button>
        </div>
      </div>

        {/* TEXTO - Só mostra se tiver foto (se não tiver, já mostrou acima) */}
        {postImages[0] && (
          <div className="space-y-1">
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="font-semibold">{displayUserName}</span>
              {displayText && (
                <>
                  {' '}
                  <span>{displayText}</span>
                  {shouldTruncate && !showFull && (
                    <button
                      onClick={() => setShowFull(true)}
                      className="text-gray-500 dark:text-gray-400 ml-1"
                    >
                      mais
                    </button>
                  )}
                </>
              )}
            </p>
            {/* Removido "Ver todos os comentários" - apenas ícone de comentários */}
          </div>
        )}

      {/* COMENTÁRIOS */}
      {showComments && (
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-900 px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Lista de comentários */}
            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.slice(0, 10).map((comment: any) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={comment.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {comment.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {comment.user?.full_name || 'Usuário'}
                            </span>
                            {' '}
                            {editingComment === comment.id ? (
                              <div className="mt-2 space-y-2">
                                <input
                                  type="text"
                                  value={editCommentContent}
                                  onChange={(e) => setEditCommentContent(e.target.value)}
                                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none pb-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault()
                                      handleSaveEditComment()
                                    }
                                    if (e.key === 'Escape') {
                                      handleCancelEditComment()
                                    }
                                  }}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveEditComment}
                                    disabled={isEditingComment || !editCommentContent.trim()}
                                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold disabled:opacity-50"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={handleCancelEditComment}
                                    className="text-xs text-gray-500 dark:text-gray-400"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-700 dark:text-gray-300">
                                {comment.content}
                              </span>
                            )}
                          </p>
                          {editingComment !== comment.id && (
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                              {/* Botão de Like */}
                              <button
                                onClick={() => likeComment(comment.id)}
                                disabled={isLikingComment}
                                className={cn(
                                  "flex items-center gap-1 text-xs transition-all duration-200",
                                  comment.is_liked 
                                    ? 'text-red-500 hover:text-red-600' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                                )}
                              >
                                <Heart 
                                  className={cn(
                                    "w-3.5 h-3.5 transition-all duration-300",
                                    comment.is_liked && 'fill-current'
                                  )}
                                />
                                <span className="font-medium">
                                  {comment.likes_count || 0}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                        {editingComment !== comment.id && (
                          <CommentOptionsMenu
                            commentId={comment.id}
                            commentUserId={comment.user?.id || comment.user_id}
                            onEdit={() => handleEditComment(comment.id, comment.content)}
                            onDelete={() => handleDeleteComment(comment.id)}
                            isDeleting={isDeletingComment}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length > 10 && (
                  <button className="text-xs text-gray-500 dark:text-gray-400">
                    Ver mais comentários
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            )}

            {/* Input de comentário */}
            <div className="flex gap-2 items-center">
              {profile?.avatar_url && (
                <Avatar className="w-6 h-6">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
                placeholder="Adicione um comentário..."
                disabled={isAddingComment}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none border-b border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 pb-1"
              />
              {newComment.trim() && (
                <button
                  onClick={handleAddComment}
                  disabled={isAddingComment}
                  className="text-blue-600 dark:text-blue-400 font-semibold text-sm disabled:opacity-50"
                >
                  {isAddingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Publicar'
                  )}
                </button>
              )}
            </div>
          </div>
      )}

      {/* Modal de compartilhamento */}
      <SharePostModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={post.id}
        postTitle={post.title || post.description || 'Post'}
      />

      {/* TIMESTAMP */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {new Date(post.created_at).toLocaleDateString('pt-BR', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </article>
  )
}

