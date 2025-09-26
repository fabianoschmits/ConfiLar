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
import { TimelinePost } from '@/components/timeline/TimelinePost'
import { TimelineActivity } from '@/components/timeline/TimelineActivity'
import { TimelineNotification } from '@/components/timeline/TimelineNotification'
import { NewPostForm } from '@/components/timeline/NewPostForm'
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
  
  // Estados para comentários
  const [postComments, setPostComments] = useState<Record<string, string[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  // Hook da timeline unificada
  // Usar dados reais do Supabase
  const {
    items,
    isLoading,
    error,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    likePost,
    addPost
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
            isTrending={isPostTrending(item.id)}
            trendingReason={getTrendingReason(item.id)}
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
        {/* Header Moderno */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Timeline ConfiLar</h1>
                  <p className="text-sm text-gray-600">Comunidade em movimento</p>
                </div>
              </div>
              {profile?.user_type === 'professional' && (
                <Button 
                  onClick={() => setShowNewPostForm(!showNewPostForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Botão de Filtros */}
        <div className="mb-6">
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
        </div>

        {/* Campo de Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar posts, usuários, serviços ou palavras-chave..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Filtros Colapsáveis */}
        {showFilters && (
          <div className="mb-8 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center space-x-4 mb-4">
                <Filter className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</label>
                  <select
                    value={filters.category || 'all'}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

        {/* Layout com Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Timeline Principal */}
          <div className="lg:col-span-3 space-y-6">
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
              <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum item encontrado</h3>
                <p className="text-gray-600">Tente ajustar os filtros ou criar um novo post.</p>
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

          {/* Sidebar com Posts em Alta */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <TrendingPosts 
                location_city={profile?.location_city}
                location_state={profile?.location_state}
                limit={5}
              />
              
              {/* Notificações */}
              {unreadCount > 0 && (
                <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-200 shadow-sm p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-blue-900">
                      Notificações ({unreadCount})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map(notification => (
                      <div key={notification.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="font-medium text-blue-800 text-sm">{notification.title}</p>
                        <p className="text-blue-600 text-xs mt-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aviso de Modo Mock */}
        {isMockMode && (
          <div className="mt-8 bg-yellow-50/80 backdrop-blur-md border border-yellow-200 rounded-xl shadow-sm p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-yellow-800 text-sm font-medium">
                Modo de desenvolvimento ativo - Dados simulados para demonstração
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  )
}
