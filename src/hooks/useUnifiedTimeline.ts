import { useState, useCallback } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { UnifiedTimelineItem, TimelineFilters, TimelineStats } from '@/types/timeline'
import { LocationFilter } from '@/hooks/useLocationFilters'

const ITEMS_PER_PAGE = 20

export function useUnifiedTimeline(filters: TimelineFilters = {}) {
  const queryClient = useQueryClient()
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const queryKey = ['unified-timeline', filters]

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const page = pageParam as number
      
      // Buscar posts de trabalhos
      let postsQuery = supabase
        .from('feed_posts')
        .select(`
          id,
          professional_id,
          title,
          description,
          images,
          location_state,
          location_city,
          likes_count,
          comments_count,
          created_at,
          updated_at,
          professional:profiles!feed_posts_professional_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          )
        `)
        // .eq('is_active', true) // Coluna não existe
        .order('created_at', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)

      // Aplicar filtro de busca se especificado
      if (filters.search && filters.search.trim()) {
        postsQuery = postsQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,professional.full_name.ilike.%${filters.search}%`)
      }

      // Aplicar filtros de localização
      if (filters.location_filter) {
        const locationFilter = filters.location_filter
        
        switch (locationFilter.type) {
          case 'local':
            if (locationFilter.city && locationFilter.state) {
              postsQuery = postsQuery
                .eq('location_city', locationFilter.city)
                .eq('location_state', locationFilter.state)
            }
            break
          case 'state':
            if (locationFilter.state) {
              postsQuery = postsQuery.eq('location_state', locationFilter.state)
            }
            break
          case 'country':
            if (locationFilter.country) {
              postsQuery = postsQuery.eq('location_state', locationFilter.country)
            }
            break
          case 'all':
            // Não aplicar filtro de localização
            break
        }
      }

      const { data: posts, error: postsError } = await postsQuery

      if (postsError) throw postsError

      // Buscar atividades do sistema
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activity_log')
        .select(`
          id,
          user_id,
          activity_type,
          description,
          metadata,
          created_at,
          user:profiles!user_activity_log_user_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          )
        `)
        .in('activity_type', ['user_joined', 'recommendation', 'review', 'agreement', 'classified_posted'])
        .order('created_at', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)

      if (activitiesError) {
        console.warn('Erro ao buscar atividades:', activitiesError)
        // Continuar sem atividades se houver erro
      }

      // Buscar notificações públicas relevantes
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          id,
          user_id,
          title,
          message,
          type,
          category,
          is_read,
          action_url,
          action_label,
          created_at,
          user:profiles!notifications_user_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          )
        `)
        .in('category', ['system', 'community', 'achievement'])
        .order('created_at', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)

      if (notificationsError) {
        console.warn('Erro ao buscar notificações:', notificationsError)
        // Continuar sem notificações se houver erro
      }

      // Transformar posts em TimelinePost
      const timelinePosts = (posts || []).map(post => ({
        id: post.id,
        type: 'post' as const,
        created_at: post.created_at,
        user_id: post.professional_id,
        user_name: (post.professional as any)?.full_name || 'Usuário',
        user_avatar: (post.professional as any)?.avatar_url,
        user_type: (post.professional as any)?.user_type,
        title: post.title,
        description: post.description || '',
        images: post.images || [],
        location_state: post.location_state,
        location_city: post.location_city,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        is_liked: likedPosts.has(post.id)
      }))

      // Transformar atividades em TimelineActivity
      const timelineActivities = (activities || []).map(activity => {
        const metadata = activity.metadata as any || {}
        
        return {
          id: activity.id,
          type: 'activity' as const,
          created_at: activity.created_at,
          user_id: activity.user_id,
          user_name: (activity.user as any)?.full_name || 'Usuário',
          user_avatar: (activity.user as any)?.avatar_url,
          user_type: (activity.user as any)?.user_type,
          activity_type: activity.activity_type as any,
          title: getActivityTitle(activity.activity_type, (activity.user as any)?.full_name || 'Usuário', metadata),
          description: activity.description || getActivityDescription(activity.activity_type, metadata),
          metadata,
          icon: getActivityIcon(activity.activity_type),
          color: getActivityColor(activity.activity_type)
        }
      })

      // Transformar notificações em TimelineNotification
      const timelineNotifications = (notifications || []).map(notification => ({
        id: notification.id,
        type: 'notification' as const,
        created_at: notification.created_at,
        user_id: notification.user_id,
        user_name: (notification.user as any)?.full_name || 'Sistema',
        user_avatar: (notification.user as any)?.avatar_url,
        user_type: (notification.user as any)?.user_type,
        title: notification.title,
        message: notification.message,
        notification_type: notification.type,
        category: notification.category,
        is_read: notification.is_read,
        action_url: notification.action_url,
        action_label: notification.action_label
      }))

      // Combinar e ordenar todos os itens
      const allItems = [...timelinePosts, ...timelineActivities, ...timelineNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, ITEMS_PER_PAGE)

      return allItems
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined
    },
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 10, // Manter no cache por 10 minutos
  })

  const items = data?.pages.flat() || []

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const likePost = useCallback((postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })

    // Atualizar cache local
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        pages: oldData.pages.map((page: UnifiedTimelineItem[]) =>
          page.map(item => 
            item.type === 'post' && item.id === postId 
              ? { 
                  ...item, 
                  likes_count: likedPosts.has(postId) ? item.likes_count - 1 : item.likes_count + 1,
                  is_liked: !likedPosts.has(postId)
                }
              : item
          )
        )
      }
    })
  }, [queryClient, queryKey, likedPosts])

         const addPost = useCallback(async (newPost: any) => {
           try {
             // Salvar no banco de dados
             const { data, error } = await supabase
               .from('feed_posts')
               .insert({
                 professional_id: newPost.user_id,
                 title: newPost.title,
                 description: newPost.description,
                 images: newPost.images || [],
                 location_state: newPost.location_state,
                 location_city: newPost.location_city,
                 likes_count: 0,
                 comments_count: 0
               })
               .select()
               .single()

             if (error) throw error

             // Atualizar cache local
             const timelinePost = {
               id: data.id,
               type: 'post' as const,
               created_at: data.created_at,
               user_id: data.professional_id,
               user_name: newPost.user_name,
               user_avatar: newPost.user_avatar,
               user_type: newPost.user_type,
               title: data.title,
               description: data.description || '',
               images: data.images || [],
               location_state: data.location_state,
               location_city: data.location_city,
               likes_count: data.likes_count || 0,
               comments_count: data.comments_count || 0,
               is_liked: false
             } as UnifiedTimelineItem

             queryClient.setQueryData(queryKey, (oldData: any) => {
               if (!oldData) return { pages: [[timelinePost]], pageParams: [undefined] }
               return {
                 ...oldData,
                 pages: [[timelinePost, ...oldData.pages[0]], ...oldData.pages.slice(1)]
               }
             })

             return timelinePost
           } catch (error) {
             console.error('Erro ao criar post:', error)
             throw error
           }
         }, [queryClient, queryKey])

         const editPost = useCallback(async (postId: string, updatedPost: any) => {
           try {
             // Atualizar no banco de dados
             const { data, error } = await supabase
               .from('feed_posts')
               .update({
                 title: updatedPost.title,
                 description: updatedPost.description,
                 images: updatedPost.images || [],
                 updated_at: new Date().toISOString()
               })
               .eq('id', postId)
               .select()
               .single()

             if (error) throw error

             // Atualizar cache local
             queryClient.setQueryData(queryKey, (oldData: any) => {
               if (!oldData) return oldData
               return {
                 ...oldData,
                 pages: oldData.pages.map((page: any[]) =>
                   page.map((item: any) =>
                     item.id === postId && item.type === 'post'
                       ? {
                           ...item,
                           title: data.title,
                           description: data.description,
                           images: data.images || []
                         }
                       : item
                   )
                 )
               }
             })

             return data
           } catch (error) {
             console.error('Erro ao editar post:', error)
             throw error
           }
         }, [queryClient, queryKey])

         const deletePost = useCallback(async (postId: string) => {
           try {
             // Deletar do banco de dados
             const { error } = await supabase
               .from('feed_posts')
               .delete()
               .eq('id', postId)

             if (error) throw error

             // Atualizar cache local - remover o post
             queryClient.setQueryData(queryKey, (oldData: any) => {
               if (!oldData) return oldData
               return {
                 ...oldData,
                 pages: oldData.pages.map((page: any[]) =>
                   page.filter((item: any) => !(item.id === postId && item.type === 'post'))
                 )
               }
             })

             return true
           } catch (error) {
             console.error('Erro ao deletar post:', error)
             throw error
           }
         }, [queryClient, queryKey])

  return {
    items,
    isLoading,
    error,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    likePost,
    addPost,
    editPost,
    deletePost,
    refetch
  }
}

// Funções auxiliares para atividades
function getActivityTitle(activityType: string, userName: string, metadata: any): string {
  switch (activityType) {
    case 'user_joined':
      return `${userName} entrou para o ConfiLar`
    case 'recommendation':
      return `${userName} recomendou ${metadata.target_user_name || 'alguém'}`
    case 'review':
      return `${userName} avaliou ${metadata.target_user_name || 'alguém'} com ${metadata.rating || 5} estrelas`
    case 'agreement':
      return `${userName} fechou um acordo`
    case 'classified_posted':
      return `${userName} publicou um anúncio`
    default:
      return `${userName} realizou uma atividade`
  }
}

function getActivityDescription(activityType: string, metadata: any): string {
  switch (activityType) {
    case 'user_joined':
      return 'Bem-vindo(a) à nossa comunidade!'
    case 'recommendation':
      return `Recomendação para ${metadata.service_description || 'serviço'}`
    case 'review':
      return `Avaliação: ${metadata.service_description || 'serviço realizado'}`
    case 'agreement':
      return `Acordo para: ${metadata.service_description || 'serviço'}`
    case 'classified_posted':
      return `Categoria: ${metadata.category || 'geral'}`
    default:
      return 'Nova atividade na comunidade'
  }
}

function getActivityIcon(activityType: string): string {
  switch (activityType) {
    case 'user_joined':
      return '✨'
    case 'recommendation':
      return '👍'
    case 'review':
      return '⭐'
    case 'agreement':
      return '🤝'
    case 'classified_posted':
      return '📢'
    default:
      return '📝'
  }
}

function getActivityColor(activityType: string): string {
  switch (activityType) {
    case 'user_joined':
      return 'bg-green-100 text-green-800'
    case 'recommendation':
      return 'bg-blue-100 text-blue-800'
    case 'review':
      return 'bg-yellow-100 text-yellow-800'
    case 'agreement':
      return 'bg-purple-100 text-purple-800'
    case 'classified_posted':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
