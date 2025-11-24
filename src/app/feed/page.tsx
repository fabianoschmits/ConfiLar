'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { Plus, Search, MessageCircle, Heart, Share2, MoreHorizontal, Flame, X, Send, Camera, Loader2, RefreshCw, Crown, Coins } from 'lucide-react'
import { useUnifiedTimeline } from '@/hooks/useUnifiedTimeline'
import { useTimelineRealtime } from '@/hooks/useTimelineRealtime'
import { usePostRanking } from '@/hooks/usePostRanking'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { NewPostForm } from '@/components/timeline/NewPostForm'
import { PremiumPostForm } from '@/components/timeline/PremiumPostForm'
import { Modal } from '@/components/ui/modal'
import { useLocationFilters } from '@/hooks/useLocationFilters'
import { InstagramPostSkeleton } from '@/components/ui/skeleton'
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
import { usePostShares } from '@/hooks/usePostShares'
import { useQueryClient } from '@tanstack/react-query'
import { LikedBy } from '@/components/timeline/LikedBy'
import { PostMedia } from '@/components/timeline/PostMedia'
import { detectYouTubeUrls, removeYouTubeUrls } from '@/utils/youtube'
import { PremiumTimeRemaining } from '@/components/timeline/PremiumTimeRemaining'
import { MentionText } from '@/components/ui/MentionText'
import { MentionInput } from '@/components/ui/MentionInput'
import { FeedSettingsModal } from '@/components/timeline/FeedSettingsModal'
import { supabase } from '@/lib/supabase'
import { LocationFilter } from '@/hooks/useLocationFilters'
import { usePremiumNotifications } from '@/hooks/usePremiumNotifications'
import { useStories } from '@/hooks/useStories'
import { StoryViewer } from '@/components/stories/StoryViewer'
import { CreateStoryModal } from '@/components/stories/CreateStoryModal'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export default function FeedPage() {
  const t = useTranslations('feed')
  const tCommon = useTranslations('common')
  const [mounted, setMounted] = useState(false)
  const { profile } = useAuthContext()
  const searchParams = useSearchParams()
  const highlightPostId = searchParams.get('post')

  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'notifications'>('posts')
  const [showNewPost, setShowNewPost] = useState(false)
  const [showPremiumPost, setShowPremiumPost] = useState(false)
  const [showFeedSettings, setShowFeedSettings] = useState(false)
  const [search, setSearch] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [postStatus, setPostStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const feedSettingsRef = useRef<HTMLDivElement>(null)
  const [showCreateStory, setShowCreateStory] = useState(false)
  const [showStoryViewer, setShowStoryViewer] = useState(false)
  const [selectedStoryGroupIndex, setSelectedStoryGroupIndex] = useState(0)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)

  const { currentFilter, setFilter } = useLocationFilters()
  const { storyGroups, isLoading: storiesLoading, refetch: refetchStories } = useStories()

  // Fechar dropdown quando clicar fora (mas não quando clicar dentro do modal)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // Verificar se o clique foi fora do modal e do botão que abre o modal
      if (feedSettingsRef.current && 
          !feedSettingsRef.current.contains(target) &&
          !(target instanceof Element && target.closest('[data-feed-settings-modal]'))) {
        setShowFeedSettings(false)
      }
    }

    if (showFeedSettings) {
      // Usar um pequeno delay para evitar fechar imediatamente ao abrir
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFeedSettings])

  // NÃO carregar preferências de pesquisa salvas
  // A pesquisa (keywords, username, userid) é apenas temporária
  // Se o usuário atualizar a página, a pesquisa volta vazia

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
    threshold: 400 
  })

  useTimelineRealtime()
  
  // Verificar notificações premium automaticamente
  usePremiumNotifications()
  
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
      toast.error('Erro ao deletar post. Tente novamente.')
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

  // Preparar lista de stories para exibição
  // Verificar se o usuário tem stories próprios
  const myStoryGroup = storyGroups.find(group => group.userId === profile?.id)
  const displayStories = [
    // "Seu story" sempre aparece primeiro
    {
      id: 'my-story',
      userId: profile?.id || '',
      userName: 'Seu story',
      userAvatar: profile?.avatar_url || null,
      hasNew: false,
      isMyStory: true,
      stories: myStoryGroup?.stories || []
    },
    // Stories de outros usuários
    ...storyGroups
      .filter(group => group.userId !== profile?.id)
      .map(group => ({
        id: group.userId,
        userId: group.userId,
        userName: group.userName,
        userAvatar: group.userAvatar,
        hasNew: group.hasNew,
        isMyStory: false,
        stories: group.stories
      }))
  ]

  if (!mounted) return null

  return (
    <MainLayout requireAuth={true}>
      {/* Story Viewer */}
      {showStoryViewer && (
        <StoryViewer
          initialGroupIndex={selectedStoryGroupIndex}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setShowStoryViewer(false)}
        />
      )}

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStoryModal
          isOpen={showCreateStory}
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={async () => {
            await refetchStories()
          }}
        />
      )}

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
                  title={t('createPost')}
                >
                  <Plus className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
                <div className="relative" ref={feedSettingsRef}>
                  <button 
                    onClick={() => setShowFeedSettings(!showFeedSettings)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
                    title={t('title')}
                  >
                    <Search className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  
                  {/* Dropdown de Configurações */}
                  {showFeedSettings && (
                    <FeedSettingsModal
                      isOpen={showFeedSettings}
                      onClose={() => setShowFeedSettings(false)}
                      currentSearch={search}
                      currentLocationFilter={currentFilter}
                      onSearchChange={(newSearch) => {
                        setSearch(newSearch)
                      }}
                      onLocationFilterChange={(newFilter) => {
                        setFilter(newFilter)
                      }}
                      onReset={async () => {
                        // Resetar para estado original (cidade do usuário)
                        const resetFilter: LocationFilter = {
                          type: 'local',
                          city: profile?.location_city || '',
                          state: profile?.location_state || '',
                          country: 'Brasil'
                        }
                        
                        // Normalizar estado se for sigla
                        if (resetFilter.state && resetFilter.state.length === 2) {
                          try {
                            const { getEstadoBySigla } = await import('@/lib/ibge')
                            const estado = await getEstadoBySigla(resetFilter.state)
                            if (estado) {
                              resetFilter.state = estado.nome
                            }
                          } catch (error) {
                            console.error('Erro ao normalizar estado no reset:', error)
                          }
                        }
                        
                        setSearch('')
                        setFilter(resetFilter)
                        
                        // Salvar APENAS localização resetada no perfil
                        // NÃO salvar pesquisa (keywords, username, userid)
                        if (profile?.id) {
                          try {
                            await supabase
                              .from('profiles')
                              .update({
                                feed_location_filter_type: 'local',
                                feed_location_filter_city: resetFilter.city || null,
                                feed_location_filter_state: resetFilter.state || null,
                                updated_at: new Date().toISOString()
                              })
                              .eq('id', profile.id)
                          } catch (error) {
                            console.error('Erro ao salvar reset:', error)
                          }
                        }
                      }}
                    />
                  )}
                </div>
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
                  {tab === 'all' ? t('all') : tab === 'posts' ? t('posts') : t('notifications')}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* STORIES */}
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900">
          <div className="max-w-2xl mx-auto px-4 py-3">
            {storiesLoading ? (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[70px] flex-shrink-0">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse border-2 border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {displayStories.map((story, i) => (
                  <div
                    key={story.id}
                    className="flex flex-col items-center gap-2 min-w-[70px] flex-shrink-0"
                  >
                    <div className="relative">
                      {/* Avatar clicável - abre stories do usuário */}
                      <button
                        onClick={() => {
                          if (story.isMyStory) {
                            // Se for "Seu story", verificar se tem stories para ver
                            if (myStoryGroup && myStoryGroup.stories.length > 0) {
                              // Encontrar o índice do grupo do usuário
                              const groupIndex = storyGroups.findIndex(g => g.userId === profile?.id)
                              if (groupIndex !== -1) {
                                setSelectedStoryGroupIndex(groupIndex)
                                setSelectedStoryIndex(0)
                                setShowStoryViewer(true)
                              }
                            } else {
                              // Se não tem stories, abrir modal de criar
                              setShowCreateStory(true)
                            }
                          } else {
                            // Encontrar o índice do grupo na lista real
                            const groupIndex = storyGroups.findIndex(g => g.userId === story.userId)
                            if (groupIndex !== -1) {
                              setSelectedStoryGroupIndex(groupIndex)
                              setSelectedStoryIndex(0)
                              setShowStoryViewer(true)
                            }
                          }
                        }}
                        className={`relative w-16 h-16 rounded-full p-0.5 block ${
                          story.hasNew 
                            ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' 
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className="w-full h-full rounded-full bg-white dark:bg-black p-0.5">
                          {story.userAvatar ? (
                            <img 
                              src={story.userAvatar} 
                              alt={story.userName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
                              <span className="text-lg text-gray-600 dark:text-gray-400">
                                {story.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                      {/* Botão + apenas para "Seu story" - abre modal de criar */}
                      {story.isMyStory && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowCreateStory(true)
                          }}
                          className="absolute -bottom-3 -right-3 bg-transparent border-0 flex items-center justify-center hover:opacity-80 transition-opacity z-10 p-0"
                          title={t('createStory')}
                        >
                          <Plus className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[70px]">
                      {story.userName}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
            <div className="space-y-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <InstagramPostSkeleton key={i} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4">
                <MessageCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                {search || currentFilter.type !== 'all' 
                  ? 'Não encontramos posts com os filtros selecionados.'
                  : 'Seja o primeiro a compartilhar algo!'}
              </p>
              {(search || currentFilter.type !== 'all') && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-md">
                  <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-2">
                    💡 Dicas para encontrar mais posts:
                  </p>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Limpe a pesquisa usando o botão "Resetar" nas configurações</li>
                    <li>Mude o filtro de localização para outra cidade ou estado</li>
                    <li>Selecione "Todos os Locais" para ver posts de qualquer lugar</li>
                    <li>Verifique se os termos de pesquisa estão corretos</li>
                  </ul>
                </div>
              )}
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
                <div ref={loadingRef} className="flex justify-center py-8">
                  {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
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
                    toast.error('Erro: Usuário não autenticado')
                    return
                  }
                  
                  setIsPosting(true)
                  setPostStatus('sending')
                  
                  try {
                    // Se for post premium, usar addPremiumPost
                    if (data.isPremium && data.pointsToSpend && data.durationDays) {
                      await addPremiumPost({
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
                    } else {
                      // Post normal
                      await addPost({
                        type: 'post',
                        user_id: profile.id,
                        user_name: profile.full_name || 'Usuário',
                        user_avatar: profile.avatar_url,
                        user_type: profile.user_type,
                        title: data.description.trim().slice(0, 100), // Título gerado da descrição
                        description: data.description,
                        images: data.images,
                        service_category_id: data.service,
                        location_state: data.location_state || profile.location_state,
                        location_city: data.location_city || profile.location_city,
                        location_country: data.location_country || (profile as any)?.country || 'BR',
                        likes_count: 0,
                        comments_count: 0,
                        is_liked: false
                      })
                    }
                    
                    // Mostrar "Enviado!" por 1 segundo antes de fechar
                    setPostStatus('sent')
                    setTimeout(async () => {
                      setShowNewPost(false)
                      setPostStatus('idle')
                      // Aguardar um pouco antes de refetch para garantir que o post foi salvo
                      await new Promise(resolve => setTimeout(resolve, 500))
                      await refetch()
                    }, 1000)
                  } catch (error: any) {
                    console.error('Erro ao criar post:', error)
                    const errorMessage = error?.message || 'Erro ao criar post'
                    toast.error(`Erro ao criar post: ${errorMessage}`)
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
          title={t('premiumPost')}
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
            post={{
              id: editingPost.id,
              description: editingPost.description || '',
              images: editingPost.images || [],
              service: editingPost.service_category_id || ''
            }}
            onSave={async (postId: string, updatedPost: { description: string; images: string[] }) => {
              try {
                await editPost(postId, {
                  title: updatedPost.description.slice(0, 100), // Gerar título automaticamente
                  description: updatedPost.description,
                  images: updatedPost.images
                })
                setShowEditModal(false)
                setEditingPost(null)
                await refetch()
              } catch (error) {
                console.error('Erro ao editar post:', error)
                toast.error('Erro ao editar post. Tente novamente.')
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
            title={t('renewPremium')}
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
                  toast.error(`Erro ao renovar post premium: ${error?.message || 'Erro desconhecido'}`)
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
  const t = useTranslations('feed')
  const { profile, user } = useAuthContext()
  const queryClient = useQueryClient()
  const [showFull, setShowFull] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isPremiumLiking, setIsPremiumLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  

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
  
  // Hook para contagem de compartilhamentos
  const { sharesCount } = usePostShares(post.id)

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
      toast.error('Erro ao adicionar comentário. Tente novamente.')
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
      toast.error('Erro ao editar comentário. Tente novamente.')
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
        toast.error('Erro ao deletar comentário. Tente novamente.')
      }
    }
  }


  // Pegar dados do usuário de diferentes fontes possíveis
  const postUser = post.professional || post.user || {}
  const postImages = post.images || []
  
  // Detectar vídeos do YouTube: primeiro verificar metadata, depois descrição (para compatibilidade com posts antigos)
  const youtubeVideoId = (post.metadata as any)?.youtube_video_id || null
  const youtubeVideos = youtubeVideoId 
    ? [{ id: youtubeVideoId, url: (post.metadata as any)?.youtube_video_url || '', thumbnail: `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg` }]
    : detectYouTubeUrls(post.description || '')
  const cleanDescription = removeYouTubeUrls(post.description || '')
  
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
  
  // Texto para exibir (sem vídeos do YouTube)
  const displayText = cleanDescription || post.title || ''
  const shouldTruncate = displayText.length > 120
  const finalDisplayText = showFull ? displayText : displayText.slice(0, 120) + (shouldTruncate ? '...' : '')

  // Verificar se é post premium
  const isPremium = post.is_premium || post.tags?.includes('premium') || post.metadata?.type === 'premium'
  const premiumExpired = post.premium_expires_at ? new Date(post.premium_expires_at) < new Date() : false
  const isActivePremium = isPremium && !premiumExpired
  
  // Verificar se o usuário atual é o dono do post
  const isOwner = user?.id === userId

  return (
    <article 
      id={`post-${post.id}`}
      className={`bg-white dark:bg-black ${
        isActivePremium 
          ? 'border-l-2 border-l-yellow-400 dark:border-l-yellow-500 bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-900/10 dark:to-transparent' 
          : ''
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

      {/* MÍDIA (FOTOS E/OU VÍDEO) - Sempre mostrar se houver */}
      {(postImages.length > 0 || youtubeVideos.length > 0 || youtubeVideoId) ? (
        <>
          <PostMedia
            images={postImages}
            youtubeVideoId={youtubeVideoId}
            onDoubleClick={handleLikeClick}
            isLiking={isLiking}
            isPremiumLiking={isPremiumLiking}
          />
          {/* DESCRIÇÃO - Mostrar abaixo da mídia se houver texto */}
          {finalDisplayText && (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words leading-relaxed">
                <MentionText text={finalDisplayText} />
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
        </>
      ) : (
        /* DESCRIÇÃO NO LUGAR DA MÍDIA - Se não houver mídia */
        finalDisplayText && (
          <div className="px-4 py-4 relative">
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words leading-relaxed">
              {finalDisplayText}
              {shouldTruncate && !showFull && (
                <button
                  onClick={() => setShowFull(true)}
                  className="text-gray-500 dark:text-gray-400 ml-1 font-medium hover:text-gray-700 dark:hover:text-gray-300"
                >
                  mais
                </button>
              )}
            </p>
            {/* Animações de like para posts sem mídia */}
            {isLiking && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <Heart className="h-20 w-20 text-red-500 fill-red-500 animate-ping" />
              </div>
            )}
            {isPremiumLiking && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="relative h-20 w-20">
                  <Coins 
                    className="h-20 w-20 absolute inset-0 text-yellow-500 animate-ping"
                    style={{
                      fill: '#eab308',
                      stroke: 'none',
                      zIndex: 1
                    }}
                  />
                  <Coins 
                    className="h-20 w-20 absolute inset-0 text-gray-700 dark:text-gray-300 animate-ping"
                    style={{
                      fill: 'none',
                      stroke: 'currentColor',
                      strokeWidth: 3,
                      zIndex: 2
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )
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
            onPremiumLikeClick={() => {
              setIsPremiumLiking(true)
              setTimeout(() => setIsPremiumLiking(false), 600) // Duração da animação
            }}
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
              {(commentsCount ?? 0).toLocaleString('pt-BR')}
            </span>
          </button>
          
          {/* Botão de Compartilhar */}
          <button 
            onClick={() => setShowShareModal(true)}
            className="transition-transform active:scale-125 flex items-center gap-1.5"
          >
            <Share2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {sharesCount > 0 ? sharesCount.toLocaleString('pt-BR') : '0'}
            </span>
          </button>
        </div>
        
        {/* Mostrar quem curtiu */}
        <LikedBy postId={post.id} likesCount={likesCount} />
      </div>

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
                                <MentionInput
                                  value={editCommentContent}
                                  onChange={(value) => setEditCommentContent(value)}
                                  placeholder={t('editComment')}
                                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none pb-1"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault()
                                      handleSaveEditComment()
                                    }
                                    if (e.key === 'Escape') {
                                      handleCancelEditComment()
                                    }
                                  }}
                                  minHeight="40px"
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
                                <MentionText text={comment.content} />
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
                                onClick={() => {
                                  likeComment(comment.id)
                                }}
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
            <div className="flex gap-2 items-start">
              {profile?.avatar_url && (
                <Avatar className="w-6 h-6 mt-1 flex-shrink-0">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1">
                <MentionInput
                  value={newComment}
                  onChange={(value) => setNewComment(value)}
                  placeholder={t('addComment')}
                  disabled={isAddingComment}
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none border-b border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 pb-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                  minHeight="48px"
                />
              </div>
            </div>
            {newComment.trim() && (
              <div className="flex justify-end mt-2">
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
              </div>
            )}
          </div>
      )}

      {/* Modal de compartilhamento */}
      <SharePostModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={post.id}
        postTitle={post.title || post.description || 'Post'}
        onShareRecorded={() => {
          // Invalidar query para atualizar contador
          queryClient.invalidateQueries({ queryKey: ['post-shares', post.id] })
        }}
      />

      {/* TIMESTAMP */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
            {new Date(post.created_at).toLocaleDateString('pt-BR', { 
              day: 'numeric', 
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {isPremium && isOwner && post.premium_expires_at && (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-600">|</span>
              <PremiumTimeRemaining 
                expiresAt={post.premium_expires_at} 
                isOwner={isOwner}
              />
            </>
          )}
        </div>
      </div>
      
      {/* LINHA SEPARADORA - Indica o fim do post */}
      <div className="border-b-2 border-gray-300 dark:border-gray-700 my-2"></div>
    </article>
  )
}

