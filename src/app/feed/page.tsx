'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/MainLayout'
import { Plus, Filter, Loader2, ChevronDown, ChevronUp, Search, Crown } from 'lucide-react'
import { useUnifiedTimeline } from '@/hooks/useUnifiedTimeline'
import { useTimelineRealtime } from '@/hooks/useTimelineRealtime'
import { usePostRanking } from '@/hooks/usePostRanking'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { TimelinePost } from '@/components/timeline/TimelinePost'
import { TimelineActivity } from '@/components/timeline/TimelineActivity'
import { TimelineNotification } from '@/components/timeline/TimelineNotification'
import { NewPostForm } from '@/components/timeline/NewPostForm'
import { PremiumPostForm } from '@/components/timeline/PremiumPostForm'
import { EditPostModal } from '@/components/timeline/EditPostModal'
import { Modal } from '@/components/ui/modal'
import { LocationFilterSelector } from '@/components/timeline/LocationFilterSelector'
import { useLocationFilters } from '@/hooks/useLocationFilters'
import { UnifiedTimelineItem, TimelineFilters } from '@/types/timeline'
import { services, getCategories } from '@/data/services'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'
import { SmartSearchBar } from '@/components/search/SmartSearchBar'
import { ErrorHandler } from '@/components/ErrorHandler'
import { FeedSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { FileText, TrendingUp } from 'lucide-react'

export default function FeedPage() {
  const [mounted, setMounted] = useState(false)
  const { profile, user, loading: authLoading } = useAuthContext()
  const searchParams = useSearchParams()
  const highlightPostId = searchParams.get('post')
  
  // Estado para abas do feed
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'notifications'>('posts')
  
  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TimelineFilters>({
    category: 'all',
    search: ''
  })
  
  // Hook para filtros de localização
  const { currentFilter, setFilter } = useLocationFilters()
  
  // Estados para formulário de novo post
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [showPremiumPostForm, setShowPremiumPostForm] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [postStatus, setPostStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  
  // Estados para edição de posts
  const [editingPost, setEditingPost] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  
  // Estados para comentários
  const [postComments, setPostComments] = useState<Record<string, string[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hook da timeline unificada - usando dados reais
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
    editPost,
    deletePost,
    refetch
  } = useUnifiedTimeline({
    ...filters,
    location_filter: currentFilter
  })

  // Hook para pull-to-refresh
  const {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    shouldRefresh
  } = usePullToRefresh({
    onRefresh: async () => {
      await refetch()
    }
  })

  // Função para identificar se um post é automático
  const isAutomaticPost = (item: UnifiedTimelineItem) => {
    if (item.type !== 'post') return false
    
    const post = item as any
    const postType = post.metadata?.type
    const isSimpleAutomaticPost = postType && ['favorite', 'recommendation'].includes(postType)
    const isWelcomeUserPost = postType === 'welcome'
    const isOldAutomaticPost = postType && ['review'].includes(postType)
    
    // Verificação adicional: se o título contém emojis de sistema
    const isSystemPostByTitle = post.title?.includes('💡') || post.title?.includes('❤️') || post.title?.includes('⭐') || post.title?.includes('🎉')
    
    return isSimpleAutomaticPost || isWelcomeUserPost || isOldAutomaticPost || isSystemPostByTitle
  }

  // Função para identificar se um post é manual (criado pelo usuário)
  const isManualPost = (item: UnifiedTimelineItem) => {
    if (item.type !== 'post') return false
    return !isAutomaticPost(item)
  }

  // Filtrar itens baseado na aba ativa
  const getFilteredItems = () => {
    switch (activeTab) {
      case 'posts':
        // Mostrar apenas posts manuais (criados pelos usuários)
        return items.filter(item => isManualPost(item))
      case 'notifications':
        // Mostrar apenas posts automáticos e notificações
        return items.filter(item => item.type === 'notification' || isAutomaticPost(item))
      case 'all':
      default:
        return items
    }
  }

  const filteredItems = getFilteredItems()

  // Hook para infinite scroll - carregamento automático ao fazer scroll
  // CORRIGIDO: Sempre mostrar botão de carregar mais se houver próxima página
  const { loadingRef } = useInfiniteScroll({
    hasNextPage: hasNextPage,
    isFetchingNextPage: isFetchingNextPage || false,
    fetchNextPage: loadMore,
    threshold: 500 // Carregar quando estiver a 500px do final (aumentado)
  })

  // Realtime para timeline
  useTimelineRealtime()

  // Ranking de posts em alta
  const { trendingPosts } = usePostRanking({
    location_city: profile?.location_city,
    location_state: profile?.location_state,
    limit: 5
  })

  // Usar categorias reais dos serviços
  const categories = [
    { id: 'all', name: 'Todos' },
    ...getCategories().map(category => ({ id: category, name: category }))
  ]


  useEffect(() => {
    setMounted(true)
  }, [])

  // Rolar para o post destacado (compartilhado)
  useEffect(() => {
    if (highlightPostId && mounted) {
      const timer = setTimeout(() => {
        const postElement = document.getElementById(`post-${highlightPostId}`)
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Adicionar destaque visual temporário
          postElement.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50')
          setTimeout(() => {
            postElement.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50')
          }, 3000)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [highlightPostId, mounted])

  if (!mounted) {
    return null
  }

  // Handlers para interações
  const handleLike = (postId: string) => {
    likePost(postId)
  }

  const handleComment = (postId: string, comment: string) => {
    if (comment.trim()) {
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }))
      
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }))
    }
  }

  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }))
  }

  const handleShare = (postId: string) => {
    // Implementar compartilhamento
  }

  const handleNewPost = async (postData: { title: string; description: string; images: string[]; service: string }) => {
    setIsPosting(true)
    setPostStatus('sending')
    try {
      await addPost({
        type: 'post',
        user_id: profile?.id || '',
        user_name: profile?.full_name || 'Usuário',
        user_avatar: profile?.avatar_url,
        user_type: profile?.user_type,
        title: postData.title,
        description: postData.description,
        images: postData.images,
        service_category_id: postData.service,
        location_state: profile?.location_state,
        location_city: profile?.location_city,
        likes_count: 0,
        comments_count: 0,
        is_liked: false
      })
      
      // Mostrar "Enviado!" por 1 segundo antes de fechar
      setPostStatus('sent')
      setTimeout(() => {
        setShowNewPostForm(false)
        setPostStatus('idle')
      }, 1000)
    } catch (error) {
      console.error('Erro ao criar post:', error)
      setPostStatus('idle')
    } finally {
      setIsPosting(false)
    }
  }

  const handleNewPremiumPost = async (postData: { 
    title: string
    description: string
    images: string[]
    service: string
    pointsToSpend: number
    durationDays: number
  }) => {
    setIsPosting(true)
    setPostStatus('sending')
    try {
      await addPremiumPost({
        type: 'post',
        user_id: profile?.id || '',
        user_name: profile?.full_name || 'Usuário',
        user_avatar: profile?.avatar_url,
        user_type: profile?.user_type,
        title: postData.title,
        description: postData.description,
        images: postData.images,
        service_category_id: postData.service,
        location_state: profile?.location_state,
        location_city: profile?.location_city,
        pointsToSpend: postData.pointsToSpend,
        durationDays: postData.durationDays
      })
      
      // Mostrar "Enviado!" por 1 segundo antes de fechar
      setPostStatus('sent')
      setTimeout(() => {
        setShowPremiumPostForm(false)
        setPostStatus('idle')
      }, 1000)
    } catch (error) {
      console.error('Erro ao criar post premium:', error)
      setPostStatus('idle')
    } finally {
      setIsPosting(false)
    }
  }

  const handleEditPost = (postId: string) => {
    const post = items.find(item => item.id === postId && item.type === 'post')
    if (post) {
      setEditingPost(post)
      setShowEditModal(true)
    }
  }

  const handleSaveEdit = async (postId: string, updatedPost: any) => {
    try {
      await editPost(postId, updatedPost)
      setShowEditModal(false)
      setEditingPost(null)
    } catch (error) {
      console.error('Erro ao editar post:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      setDeletingPostId(postId)
      await deletePost(postId)
    } catch (error) {
      console.error('Erro ao deletar post:', error)
    } finally {
      setDeletingPostId(null)
    }
  }

  // Verificar se um post está em alta
  const isPostTrending = (postId: string) => {
    return trendingPosts.some(trending => trending.id === postId)
  }

  const getTrendingReason = (postId: string) => {
    const trending = trendingPosts.find(trending => trending.id === postId)
    return trending?.trending_reason
  }




  // Renderizar item da timeline baseado no tipo
  const renderTimelineItem = (item: UnifiedTimelineItem) => {
    switch (item.type) {
      case 'post':
        return (
          <TimelinePost
            key={item.id}
            post={item}
            onShare={handleShare}
            onLike={handleLike}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            isTrending={isPostTrending(item.id)}
            trendingReason={getTrendingReason(item.id)}
            isDeleting={deletingPostId === item.id}
          />
        )
      case 'activity':
        return (
          <TimelineActivity
            key={item.id}
            activity={item}
          />
        )
      default:
        return null
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <ErrorHandler>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-1 md:py-2">
        
        {/* Abas do Feed */}
        <div className="mb-4 md:mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-1">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Todos</span>
              </button>
              
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'posts'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0H7m8 0v3" />
                </svg>
                <span>Posts</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'notifications'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                </svg>
                <span>Notificações</span>
              </button>
            </div>
          </div>
        </div>

        {/* Botão de Filtros e Novo Post - Responsivo */}
        <div className="mb-2 md:mb-3 flex items-center justify-between gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base"
            >
              <Plus className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">
                {profile?.user_type === 'professional' ? 'Novo Post' : 'Compartilhar'}
              </span>
              <span className="sm:hidden">Post</span>
            </Button>
            
            <Button 
              onClick={() => setShowPremiumPostForm(!showPremiumPostForm)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base"
            >
              <Crown className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Premium</span>
              <span className="sm:hidden">⭐</span>
            </Button>
          </div>
        </div>


        {/* Filtros de Localização e Busca - Responsivo */}
        <div className="mb-2 md:mb-3 space-y-2">
          {/* Filtro de Localização */}
          <LocationFilterSelector
            onFilterChange={(filter) => {
              setFilter(filter)
            }}
            className="w-full"
          />
          
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome do usuário, serviço, categoria..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 md:py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base dark:text-white dark:placeholder-gray-400"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpar busca"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filtros Colapsáveis - Responsivos */}
        {showFilters && (
          <div className="mb-6 md:mb-8 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 md:p-4">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <Filter className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
              </div>

              <div className="space-y-3 md:space-y-4">
              <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Categoria</label>
                  <select
                    value={filters.category || 'all'}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Novo Post */}
        <Modal
          isOpen={showNewPostForm}
          onClose={() => setShowNewPostForm(false)}
          title="Novo Post"
          size="lg"
        >
          <NewPostForm
            onSubmit={handleNewPost}
            onCancel={() => setShowNewPostForm(false)}
            isLoading={isPosting}
            postStatus={postStatus}
          />
        </Modal>

        {/* Modal de Post Premium */}
        <Modal
          isOpen={showPremiumPostForm}
          onClose={() => setShowPremiumPostForm(false)}
          title="Post Premium"
          size="lg"
        >
          <PremiumPostForm
            onSubmit={handleNewPremiumPost}
            onCancel={() => setShowPremiumPostForm(false)}
            isLoading={isPosting}
            postStatus={postStatus}
          />
        </Modal>

        {/* Modal para Editar Post */}
        {editingPost && (
          <EditPostModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setEditingPost(null)
            }}
            post={editingPost}
            onSave={handleSaveEdit}
          />
        )}

        {/* Indicador de Busca Ativa */}
        {filters.search && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Buscando por: <strong>&ldquo;{filters.search}&rdquo;</strong>
                </span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Limpar busca
              </button>
            </div>
          </div>
        )}

        {/* Layout Principal - Responsivo */}
        <div className="max-w-4xl mx-auto" ref={containerRef}>
          {/* Indicador de Pull-to-Refresh */}
          {(isPulling || isRefreshing) && (
            <div 
              className="flex items-center justify-center py-4 transition-all duration-200"
              style={{
                opacity: isPulling ? Math.min(pullDistance / 80, 1) : 1,
                transform: `translateY(${Math.min(pullDistance / 2, 40)}px)`
              }}
            >
              <div className="flex items-center space-x-2 text-blue-600">
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Atualizando...</span>
                  </>
                ) : shouldRefresh ? (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Solte para atualizar</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className="text-sm font-medium">Puxe para atualizar</span>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Timeline Principal */}
          <div className="space-y-4 md:space-y-6">
            {isLoading && filteredItems.length === 0 ? (
              <FeedSkeleton />
            ) : error ? (
              <ErrorState
                title="Erro ao carregar timeline"
                message="Não foi possível carregar os posts. Tente novamente em alguns instantes."
                error={error instanceof Error ? error : String(error)}
                onRetry={() => refetch()}
                showHomeButton={false}
              />
            ) : filteredItems.length === 0 ? (
              filters.search ? (
                <EmptyState
                  icon={<Search className="h-16 w-16 text-orange-500" />}
                  title="Nenhum resultado encontrado"
                  description={`Não encontramos posts relacionados a "${filters.search}". Tente buscar por outros termos ou verifique a ortografia.`}
                  action={{
                    label: 'Ver Todos os Posts',
                    onClick: () => setFilters({ ...filters, search: '' })
                  }}
                />
              ) : (
                activeTab === 'all' ? (
                  <EmptyState
                    icon={<FileText className="h-16 w-16 text-blue-500" />}
                    title="Seja o primeiro a compartilhar!"
                    description="A comunidade ConfiLar está esperando para ver seus trabalhos incríveis! Compartilhe fotos dos serviços que você realizou ou que foram feitos para você."
                    action={{
                      label: 'Criar Primeiro Post',
                      onClick: () => setShowNewPostForm(true)
                    }}
                  />
                ) : activeTab === 'posts' ? (
                  <EmptyState
                    icon={<FileText className="h-16 w-16 text-green-500" />}
                    title="Nenhum post dos usuários"
                    description="Ainda não há posts criados pelos usuários. Seja o primeiro a compartilhar seus trabalhos e experiências!"
                    action={{
                      label: 'Criar Post',
                      onClick: () => setShowNewPostForm(true)
                    }}
                  />
                ) : (
                  <EmptyState
                    icon={<TrendingUp className="h-16 w-16 text-purple-500" />}
                    title="Nenhuma notificação automática"
                    description="Não há posts automáticos ou notificações do sistema no momento. Continue interagindo para ver atualizações!"
                  />
                )
              )
            ) : (
              <>
                {filteredItems.map((item) => renderTimelineItem(item))}
                
                {/* Loading automático para infinite scroll */}
                {hasNextPage && (
                  <div 
                    ref={loadingRef}
                    className="flex justify-center py-8"
                  >
                    {isFetchingNextPage ? (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-sm font-medium">Carregando mais posts...</span>
                      </div>
                    ) : (
                      <Button
                        onClick={loadMore}
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Carregar mais posts
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        </div>
        </div>
      </ErrorHandler>
    </MainLayout>
  )
}
