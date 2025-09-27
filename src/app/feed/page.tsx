'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/MainLayout'
import { Plus, Filter, Loader2, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { useUnifiedTimeline } from '@/hooks/useUnifiedTimeline'
import { useUnifiedTimelineMock } from '@/hooks/useUnifiedTimelineMock'
import { useTimelineRealtime } from '@/hooks/useTimelineRealtime'
import { usePostRanking } from '@/hooks/usePostRanking'
import { usePostRankingMock } from '@/hooks/usePostRankingMock'
import { useSmartNotifications } from '@/hooks/useSmartNotifications'
import { useSmartNotificationsMock } from '@/hooks/useSmartNotificationsMock'
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers'
import { TimelinePost } from '@/components/timeline/TimelinePost'
import { TimelineActivity } from '@/components/timeline/TimelineActivity'
import { TimelineNotification } from '@/components/timeline/TimelineNotification'
import { NewPostForm } from '@/components/timeline/NewPostForm'
import { EditPostModal } from '@/components/timeline/EditPostModal'
import { Modal } from '@/components/ui/modal'
import { TrendingPosts } from '@/components/timeline/TrendingPosts'
import { UnifiedTimelineItem, TimelineFilters } from '@/types/timeline'
import { services, getCategories } from '@/data/services'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'

export default function FeedPage() {
  const [mounted, setMounted] = useState(false)
  const { profile, isMockMode } = useAuthContext()
  
  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TimelineFilters>({
    category: 'all',
    search: ''
  })
  
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
  } = useUnifiedTimeline(filters)

  // Realtime para timeline
  useTimelineRealtime()

  // Ranking de posts em alta
  const { trendingPosts } = usePostRanking({
    location_city: profile?.location_city,
    location_state: profile?.location_state,
    limit: 5
  })

  // Notificações inteligentes
  const { notifications, unreadCount } = useSmartNotifications()
  
  // Sistema de notificações automáticas - DESABILITADO temporariamente
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

  const handleNotificationAction = (url: string) => {
    // Implementar ação da notificação
    console.log('Ação da notificação:', url)
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
      case 'notification':
        return (
          <TimelineNotification
            key={item.id}
            notification={item}
            onAction={handleNotificationAction}
          />
        )
      default:
        return null
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Moderno - Responsivo */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm md:text-lg">C</span>
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">Timeline ConfiLar</h1>
                  <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Comunidade em movimento</p>
                </div>
              </div>
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
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Botão de Filtros - Responsivo */}
        <div className="mb-4 md:mb-6">
              <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="bg-white/80 backdrop-blur-md border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
              </Button>
        </div>

        {/* Campo de Busca - Responsivo */}
        <div className="mb-4 md:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar posts, usuários..."
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
            {isLoading && items.length === 0 ? (
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
            ) : items.length === 0 ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 shadow-lg p-12 text-center">
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
              </div>
            ) : (
              <>
                {items.map(renderTimelineItem)}
                
                {/* Botão Carregar Mais */}
                {hasNextPage && (
                  <div className="flex justify-center py-6">
                    <Button 
                      onClick={loadMore}
                      disabled={isFetchingNextPage}
                      variant="outline"
                      className="min-w-[200px] bg-white/80 backdrop-blur-md border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Carregando...
                        </>
                      ) : (
                        'Carregar mais'
                      )}
                    </Button>
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
                    Notificações {unreadCount > 0 && `(${unreadCount})`}
                  </h3>
                </div>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map(notification => (
                      <div key={notification.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">Nenhuma notificação no momento</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </MainLayout>
  )
}
