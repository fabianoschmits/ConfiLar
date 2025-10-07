'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/MainLayout'
import { Plus, Filter, Loader2, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { useUnifiedTimeline } from '@/hooks/useUnifiedTimeline'
import { useTimelineRealtime } from '@/hooks/useTimelineRealtime'
import { usePostRanking } from '@/hooks/usePostRanking'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
// import { useSmartNotifications } from '@/hooks/useSmartNotifications' // DESABILITADO - causava loop
// import { useSmartNotificationsMock } from '@/hooks/useSmartNotificationsMock' // DESABILITADO - causava loop
// import { useNotificationTriggers } from '@/hooks/useNotificationTriggers' // DESABILITADO - causava loop
import { TimelinePost } from '@/components/timeline/TimelinePost'
import { TimelineActivity } from '@/components/timeline/TimelineActivity'
import { TimelineNotification } from '@/components/timeline/TimelineNotification'
import { NewPostForm } from '@/components/timeline/NewPostForm'
import { EditPostModal } from '@/components/timeline/EditPostModal'
import { Modal } from '@/components/ui/modal'
import { TrendingPosts } from '@/components/timeline/TrendingPosts'
import { LocationFilterSelector } from '@/components/timeline/LocationFilterSelector'
import { useLocationFilters } from '@/hooks/useLocationFilters'
import { UnifiedTimelineItem, TimelineFilters } from '@/types/timeline'
import { services, getCategories } from '@/data/services'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'
import { SmartSearchBar } from '@/components/search/SmartSearchBar'
import { ErrorHandler } from '@/components/ErrorHandler'

export default function FeedPage() {
  const [mounted, setMounted] = useState(false)
  const { profile } = useAuthContext()
  
  // Estado para abas do feed
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'notifications'>('all')
  
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
  const [isPosting, setIsPosting] = useState(false)
  
  // Estados para edição de posts
  const [editingPost, setEditingPost] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  
  // Estados para comentários
  const [postComments, setPostComments] = useState<Record<string, string[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

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
    editPost,
    deletePost
  } = useUnifiedTimeline({
    ...filters,
    location_filter: currentFilter
  })


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

  // Determinar se há próxima página baseado na aba ativa
  const shouldShowLoadMore = () => {
    // Se estamos na aba "all", usar a lógica original
    if (activeTab === 'all') {
      return hasNextPage
    }
    
    // Para abas específicas, só mostrar se há mais dados originais E se os dados filtrados são poucos
    return hasNextPage && filteredItems.length < 10
  }

  // Hook para infinite scroll - carregamento automático ao fazer scroll
  const { loadingRef } = useInfiniteScroll({
    hasNextPage: shouldShowLoadMore(),
    isFetchingNextPage: isFetchingNextPage || false,
    fetchNextPage: loadMore,
    threshold: 300 // Carregar quando estiver a 300px do final
  })

  // Debug: log dos valores do infinite scroll
  console.log('🔄 Feed Infinite Scroll Debug:', {
    hasNextPage,
    isFetchingNextPage,
    itemsLength: items.length,
    filteredItemsLength: filteredItems.length,
    activeTab
  })

  // Debug: log do filtro atual
  console.log('🔍 Feed - currentFilter:', currentFilter)

  // Realtime para timeline
  useTimelineRealtime()

  // Ranking de posts em alta
  const { trendingPosts } = usePostRanking({
    location_city: profile?.location_city,
    location_state: profile?.location_state,
    limit: 5
  })

  // Notificações inteligentes (DESABILITADO - causava loop)
  // const { notifications, unreadCount } = useSmartNotifications()
  
  // Sistema de notificações automáticas (DESABILITADO - agora usa criação direta)
  // useNotificationTriggers()

  // Usar categorias reais dos serviços
  const categories = [
    { id: 'all', name: 'Todos' },
    ...getCategories().map(category => ({ id: category, name: category }))
  ]


  useEffect(() => {
    setMounted(true)
  }, [])

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
    console.log('Compartilhar post:', postId)
  }

  const handleNewPost = async (postData: { title: string; description: string; images: string[]; service: string }) => {
    setIsPosting(true)
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
        service_category: postData.service,
        location_state: profile?.location_state,
        location_city: profile?.location_city,
        likes_count: 0,
        comments_count: 0,
        is_liked: false
      })
      setShowNewPostForm(false)
    } catch (error) {
      console.error('Erro ao criar post:', error)
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

  // handleNotificationAction removido - notificações não aparecem mais no feed

  // Verificar se um post está em alta
  const isPostTrending = (postId: string) => {
    return trendingPosts.some(trending => trending.id === postId)
  }

  const getTrendingReason = (postId: string) => {
    const trending = trendingPosts.find(trending => trending.id === postId)
    return trending?.trending_reason
  }

  // Função para identificar se um post é automático
  const isAutomaticPost = (item: UnifiedTimelineItem) => {
    if (item.type !== 'post') return false
    
    const post = item as any
    const postType = post.metadata?.type
    const isSimpleAutomaticPost = postType && ['favorite', 'recommendation'].includes(postType)
    const isWelcomeUserPost = postType === 'welcome'
    const isOldAutomaticPost = postType && ['review'].includes(postType)
    
    // Verificação adicional: se o título contém emojis de sistema
    const isSystemPostByTitle = post.title.includes('💡') || post.title.includes('❤️') || post.title.includes('⭐') || post.title.includes('🎉')
    
    return isSimpleAutomaticPost || isWelcomeUserPost || isOldAutomaticPost || isSystemPostByTitle
  }

  // Função para identificar se um post é manual (criado pelo usuário)
  const isManualPost = (item: UnifiedTimelineItem) => {
    if (item.type !== 'post') return false
    return !isAutomaticPost(item)
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
      // case 'notification' removido - notificações não aparecem mais no feed
      default:
        return null
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <ErrorHandler>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-1 md:py-2">
        
        {/* Abas do Feed */}
        <div className="mb-4 md:mb-6">
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm p-1">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Todos</span>
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'posts'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0H7m8 0v3" />
                </svg>
                <span>Posts</span>
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {items.filter(item => isManualPost(item)).length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'notifications'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                </svg>
                <span>Notificações</span>
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {items.filter(item => item.type === 'notification' || isAutomaticPost(item)).length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Botão de Filtros e Novo Post - Responsivo */}
        <div className="mb-2 md:mb-3 flex items-center justify-between gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="bg-white/80 backdrop-blur-md border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
          
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
        </div>

        {/* Filtros de Localização e Busca - Responsivo */}
        <div className="mb-2 md:mb-3 space-y-2">
          {/* Filtro de Localização */}
          <LocationFilterSelector
            onFilterChange={(filter) => {
              console.log('🔄 Feed recebeu filtro:', filter)
              setFilter(filter)
            }}
            className="w-full"
          />
          
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, serviço, categoria..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 md:py-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Filtros Colapsáveis - Responsivos */}
        {showFilters && (
          <div className="mb-6 md:mb-8 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm p-3 md:p-4">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <Filter className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Filtros</h3>
              </div>

              <div className="space-y-3 md:space-y-4">
              <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</label>
                  <select
                    value={filters.category || 'all'}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
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

        {/* Layout Principal - Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Timeline Principal */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {isLoading && filteredItems.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm p-12">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600 font-medium">Carregando timeline...</span>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar timeline</h3>
                <p className="text-gray-600 mb-4">Tente novamente em alguns instantes.</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Recarregar
                </Button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 shadow-lg p-12 text-center">
                {activeTab === 'all' ? (
                  <>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Seja o primeiro a compartilhar!</h3>
                    <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
                      A comunidade ConfiLar está esperando para ver seus trabalhos incríveis! 
                      Compartilhe fotos dos serviços que você realizou ou que foram feitos para você.
                    </p>
                  </>
                ) : activeTab === 'posts' ? (
                  <>
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0H7m8 0v3" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhum post dos usuários</h3>
                    <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
                      Ainda não há posts criados pelos usuários. Seja o primeiro a compartilhar seus trabalhos e experiências!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhuma notificação automática</h3>
                    <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
                      Não há posts automáticos ou notificações do sistema no momento. Continue interagindo para ver atualizações!
                    </p>
                  </>
                )}
                
                {activeTab === 'all' && (
                  <>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-6 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3">💡 O que você pode compartilhar:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>Reformas e construções</span>
                        </div>
                          <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Limpeza e organização</span>
                          </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span>Jardinagem e paisagismo</span>
                          </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span>Serviços domésticos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span>Reparos e manutenção</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                          <span>E muito mais!</span>
                        </div>
                      </div>
                    </div>

                    {profile?.user_type === 'professional' ? (
                  <Button 
                    onClick={() => setShowNewPostForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Compartilhar Meu Trabalho
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Você pode compartilhar trabalhos que foram feitos para você ou recomendar profissionais!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={() => setShowNewPostForm(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Compartilhar Experiência
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-2"
                        onClick={() => window.location.href = '/buscar'}
                      >
                        Encontrar Profissionais
                      </Button>
                    </div>
                  </div>
                )}
                  </>
                )}

                {activeTab === 'posts' && (
                  <Button 
                    onClick={() => setShowNewPostForm(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Criar Primeiro Post
                  </Button>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      Posts automáticos incluem: boas-vindas de novos usuários, favoritos, recomendações e avaliações.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('all')}
                      className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg font-semibold"
                    >
                      Ver Timeline Completa
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {filteredItems.map(renderTimelineItem)}
                
                {/* Loading automático para infinite scroll */}
                {shouldShowLoadMore() && (
                  <div 
                    ref={loadingRef}
                    className="flex justify-center py-6"
                  >
                    {isFetchingNextPage ? (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Carregando mais posts...</span>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">
                        Role para baixo para carregar mais posts
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar com Posts em Alta e Notificações - Responsiva */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <div className="sticky top-20 space-y-6">
              <TrendingPosts 
                location_city={profile?.location_city}
                location_state={profile?.location_state}
                limit={5}
              />
              
              <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-200 shadow-sm p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-900">
                    Notificações (Sistema Desabilitado)
                  </h3>
                </div>
                <p className="text-sm text-gray-500">Sistema de notificações temporariamente desabilitado</p>
              </div>
            </div>
          </div>
        </div>

        </div>
        </div>
      </ErrorHandler>
    </MainLayout>
  )
}
