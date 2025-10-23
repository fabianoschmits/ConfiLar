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
          user_id,
          title,
          description,
          images,
          service_category_id,
          location_state,
          location_city,
          likes_count,
          comments_count,
          created_at,
          updated_at,
          metadata,
          professional:profiles!feed_posts_professional_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type,
            is_available
          ),
          user:profiles!feed_posts_user_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type,
            is_available
          )
        `)
        // .eq('is_active', true) // Coluna não existe
        .order('created_at', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)

      // Aplicar filtro de busca se especificado
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim().toLowerCase()
        console.log('🔍 Aplicando filtro de busca:', searchTerm)
        
        // Buscar em campos básicos do post
        postsQuery = postsQuery.or(`
          title.ilike.%${searchTerm}%,
          description.ilike.%${searchTerm}%,
          metadata->>category.ilike.%${searchTerm}%,
          metadata->>service_type.ilike.%${searchTerm}%,
          metadata->>tags.ilike.%${searchTerm}%,
          metadata->>service_description.ilike.%${searchTerm}%,
          metadata->>user.ilike.%${searchTerm}%
        `.replace(/\s+/g, ''))
      }

      // Aplicar filtros de localização
      if (filters.location_filter) {
        const locationFilter = filters.location_filter
        
        console.log('🔍 Aplicando filtro de localização:', JSON.stringify(locationFilter, null, 2))
        
        switch (locationFilter.type) {
          case 'local':
            if (locationFilter.city && locationFilter.state) {
              console.log('🏠 Filtro local:', {
                city: locationFilter.city,
                state: locationFilter.state
              })
              postsQuery = postsQuery
                .ilike('location_city', locationFilter.city)
                .ilike('location_state', locationFilter.state)
            }
            break
          case 'state':
            if (locationFilter.state) {
              console.log('🏙️ Filtro estado:', locationFilter.state)
              postsQuery = postsQuery.ilike('location_state', locationFilter.state)
            }
            break
          case 'country':
            if (locationFilter.country) {
              console.log('🌎 Filtro país:', locationFilter.country)
              // Para país (Brasil), não aplicar filtro pois todos são do Brasil
              // Remover este filtro para mostrar todos os posts
            }
            break
          case 'custom':
            if (locationFilter.city && locationFilter.state) {
              console.log('🎯 Aplicando filtro custom:', {
                city: locationFilter.city,
                state: locationFilter.state
              })
              postsQuery = postsQuery
                .ilike('location_city', locationFilter.city)
                .ilike('location_state', locationFilter.state)
            } else if (locationFilter.state && !locationFilter.city) {
              // Se apenas estado foi selecionado (sem cidade)
              console.log('🏙️ Filtro custom: apenas estado:', locationFilter.state)
              postsQuery = postsQuery.ilike('location_state', locationFilter.state)
            } else {
              console.log('⚠️ Filtro custom sem dados completos:', {
                city: locationFilter.city,
                state: locationFilter.state
              })
            }
            break
          case 'all':
            console.log('🌍 Filtro: Todos os locais')
            // Não aplicar filtro de localização
            break
        }
      }

      const { data: posts, error: postsError } = await postsQuery

      if (postsError) {
        console.error('❌ Erro ao buscar posts:', postsError)
        throw postsError
      }
      
      console.log('📊 Posts retornados:', {
        total: posts?.length || 0,
        filter: filters.location_filter?.type,
        city: filters.location_filter?.city,
        state: filters.location_filter?.state,
        todosOsPosts: posts?.map(p => ({
          id: p.id,
          title: p.title?.substring(0, 30),
          location_city: p.location_city,
          location_state: p.location_state,
          // Comparação direta
          cityMatch: p.location_city === filters.location_filter?.city,
          stateMatch: p.location_state === filters.location_filter?.state,
          // Comparação lower case
          cityMatchLower: p.location_city?.toLowerCase() === filters.location_filter?.city?.toLowerCase(),
          stateMatchLower: p.location_state?.toLowerCase() === filters.location_filter?.state?.toLowerCase()
        }))
      })
      
      // Log detalhado para debug
      if (posts && posts.length > 0) {
        console.log('🔍 DEBUG DETALHADO - Primeiro post:', {
          'Filtro city': `"${filters.location_filter?.city}"`,
          'Filtro state': `"${filters.location_filter?.state}"`,
          'Post city': `"${posts[0].location_city}"`,
          'Post state': `"${posts[0].location_state}"`,
          'City match exato': posts[0].location_city === filters.location_filter?.city,
          'State match exato': posts[0].location_state === filters.location_filter?.state,
          'City length filtro': filters.location_filter?.city?.length,
          'State length filtro': filters.location_filter?.state?.length,
          'City length post': posts[0].location_city?.length,
          'State length post': posts[0].location_state?.length
        })
      }

      // Se há busca ativa, fazer uma busca adicional por nome de usuário nos posts
      let relatedPosts: any[] = []
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim().toLowerCase()
        console.log('🔍 Buscando posts relacionados por nome de usuário:', searchTerm)
        
        try {
          // Buscar posts onde o nome do usuário aparece nos metadados ou dados relacionados
          const { data: relatedData, error: relatedError } = await supabase
            .from('feed_posts')
            .select(`
              id,
              professional_id,
              user_id,
              title,
              description,
              images,
              service_category_id,
              location_state,
              location_city,
              likes_count,
              comments_count,
              created_at,
              updated_at,
              metadata,
              professional:profiles!feed_posts_professional_id_fkey(
                id,
                full_name,
                avatar_url,
                user_type,
                is_available
              ),
              user:profiles!feed_posts_user_id_fkey(
                id,
                full_name,
                avatar_url,
                user_type,
                is_available
              )
            `)
            .or(`
              professional.full_name.ilike.%${searchTerm}%,
              user.full_name.ilike.%${searchTerm}%
            `.replace(/\s+/g, ''))
            .order('created_at', { ascending: false })
            .limit(10)

          if (!relatedError && relatedData) {
            relatedPosts = relatedData
            console.log('✅ Posts relacionados encontrados:', relatedPosts.length)
          }
        } catch (error) {
          console.warn('⚠️ Erro ao buscar posts relacionados:', error)
        }
      }

      // Buscar atividades do sistema
      let activitiesQuery = supabase
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

      // Aplicar filtro de busca nas atividades também
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim().toLowerCase()
        console.log('🔍 Aplicando filtro de busca nas atividades:', searchTerm)
        
        activitiesQuery = activitiesQuery.or(`
          description.ilike.%${searchTerm}%,
          metadata->>category.ilike.%${searchTerm}%,
          metadata->>service_description.ilike.%${searchTerm}%,
          metadata->>target_user_name.ilike.%${searchTerm}%,
          metadata->>user.ilike.%${searchTerm}%,
          metadata->>service_type.ilike.%${searchTerm}%
        `.replace(/\s+/g, ''))
      }

      const { data: activities, error: activitiesError } = await activitiesQuery

      if (activitiesError) {
        console.warn('Erro ao buscar atividades:', activitiesError)
        // Continuar sem atividades se houver erro
      }

      // Notificações removidas do feed por solicitação
      // As notificações devem aparecer apenas no sino de notificações, não no feed
      const notifications: any[] = []

      // Combinar posts principais com posts relacionados, removendo duplicatas
      const allPosts = [...(posts || []), ...relatedPosts]
      const uniquePosts = allPosts.filter((post, index, self) => 
        index === self.findIndex(p => p.id === post.id)
      )

      console.log('📊 Estatísticas de busca:', {
        postsPrincipais: posts?.length || 0,
        postsRelacionados: relatedPosts.length,
        totalUnicos: uniquePosts.length
      })

      // Transformar posts em TimelinePost
      const timelinePosts = uniquePosts.map(post => {
        // Para posts de boas-vindas, usar dados do metadata ou do user
        const isWelcomePost = post.metadata?.type === 'welcome'
        const userData = isWelcomePost ? 
          (post.user as any) || (post.professional as any) :
          (post.professional as any) || (post.user as any)
        
        // Se for post de boas-vindas e tiver metadata, usar dados do metadata
        const finalUserData = isWelcomePost && post.metadata ? {
          full_name: post.metadata.user || userData?.full_name || 'Usuário',
          avatar_url: post.metadata.avatar_url || userData?.avatar_url,
          user_type: post.metadata.user_type || userData?.user_type
        } : userData

        return {
          id: post.id,
          type: 'post' as const,
          created_at: post.created_at,
          user_id: post.user_id || post.professional_id,
          user_name: finalUserData?.full_name || 'Usuário',
          user_avatar: finalUserData?.avatar_url,
          user_type: finalUserData?.user_type,
          title: post.title,
          description: post.description || '',
          images: post.images || [],
          service_category_id: post.service_category_id,
          location_state: post.location_state,
          location_city: post.location_city,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          is_liked: likedPosts.has(post.id),
          metadata: post.metadata
        }
      })

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

      // Notificações removidas do feed por solicitação
      const timelineNotifications: any[] = []

      // Combinar e ordenar todos os itens
      const allItems = [...timelinePosts, ...timelineActivities, ...timelineNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, ITEMS_PER_PAGE)

      return allItems
    },
    getNextPageParam: (lastPage, allPages) => {
      console.log('📄 getNextPageParam:', {
        lastPageLength: lastPage.length,
        itemsPerPage: ITEMS_PER_PAGE,
        allPagesLength: allPages.length,
        hasNext: lastPage.length === ITEMS_PER_PAGE
      })
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
             console.log('📝 [addPost] Criando novo post para usuário:', newPost.user_id)
             
             // Salvar no banco de dados
             const { data, error } = await supabase
               .from('feed_posts')
               .insert({
                 professional_id: newPost.user_id,
                 title: newPost.title,
                 description: newPost.description,
                 images: newPost.images || [],
                 service_category_id: newPost.service_category_id || null,
                 location_state: newPost.location_state,
                 location_city: newPost.location_city,
                 likes_count: 0,
                 comments_count: 0
               })
               .select()
               .single()

             if (error) throw error

             console.log('✅ [addPost] Post criado com sucesso:', data.id)

             // ✅ VERIFICAR SE É O PRIMEIRO POST DO USUÁRIO (para referral milestone)
             try {
               // Contar quantos posts o usuário tem (excluindo posts de sistema/boas-vindas)
               const { count, error: countError } = await supabase
                 .from('feed_posts')
                 .select('*', { count: 'exact', head: true })
                 .eq('professional_id', newPost.user_id)
                 .or('tags.not.cs.["sistema","boas-vindas"],tags.is.null')
               
               if (!countError && count === 1) {
                 console.log('🎉 [addPost] Este é o PRIMEIRO post do usuário! Marcando milestone...')
                 
                 // Marcar milestone de primeiro post
                 const { error: milestoneError } = await supabase
                   .from('referrals')
                   .update({ 
                     first_post_made: true,
                     last_activity_at: new Date().toISOString()
                   })
                   .eq('referred_id', newPost.user_id)
                   .eq('first_post_made', false)
                 
                 if (milestoneError) {
                   console.warn('⚠️ [addPost] Erro ao marcar milestone (usuário pode não ter sido indicado):', milestoneError.message)
                 } else {
                   console.log('✅ [addPost] Milestone first_post_made marcado! (+30 pontos para indicador)')
                 }
               } else {
                 console.log('📝 [addPost] Post criado. Total de posts do usuário:', count)
               }
             } catch (milestoneError) {
               console.warn('⚠️ [addPost] Erro ao processar milestone de primeiro post:', milestoneError)
               // Não falhar a criação do post se houver erro no milestone
             }

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
               service_category_id: data.service_category_id,
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
             console.log('🗑️ Iniciando exclusão do post:', postId)
             
             // Verificar usuário atual
             const { data: { user }, error: userError } = await supabase.auth.getUser()
             if (userError || !user) {
               console.error('❌ Erro ao obter usuário atual:', userError)
               throw new Error('Usuário não autenticado')
             }
             
             console.log('👤 Usuário atual:', user.id)
             
             // Buscar informações do post
             const { data: postData, error: fetchError } = await supabase
               .from('feed_posts')
               .select('metadata, user_id, professional_id, title')
               .eq('id', postId)
               .single()

             if (fetchError) {
               console.error('❌ Erro ao buscar dados do post:', fetchError)
               throw new Error('Post não encontrado')
             }

            console.log('📋 Dados do post encontrados:', {
              id: postId,
              title: postData?.title,
              user_id: postData?.user_id,
              professional_id: postData?.professional_id,
              metadata: postData?.metadata
            })
            
            // Verificar se o usuário tem permissão para deletar este post
            // O post pode ter user_id OU professional_id
            const isOwner = postData?.user_id === user.id || postData?.professional_id === user.id
            
            if (!isOwner) {
              console.error('❌ PERMISSÃO NEGADA: Usuário não pode deletar este post')
              console.error('❌ Post user_id:', postData?.user_id, '| professional_id:', postData?.professional_id, '| Usuário atual:', user.id)
              throw new Error('Você não tem permissão para deletar este post')
            }
            
            console.log('✅ Permissão confirmada: usuário pode deletar este post')

            // Deletar do banco de dados
            console.log('🗄️ Executando DELETE no banco de dados...')
            const { error, count } = await supabase
              .from('feed_posts')
              .delete()
              .eq('id', postId)
              .or(`user_id.eq.${user.id},professional_id.eq.${user.id}`) // Verificar ambos os campos

             if (error) {
               console.error('❌ Erro ao deletar post do banco:', error)
               console.error('❌ Detalhes do erro:', {
                 message: error.message,
                 details: error.details,
                 hint: error.hint,
                 code: error.code
               })
               throw error
             }

             console.log('✅ Post deletado do banco com sucesso. Linhas afetadas:', count)

             // Verificar se o post foi realmente deletado
             if (count === 0) {
               console.error('❌ PROBLEMA: Nenhuma linha foi afetada na exclusão!')
               console.error('❌ Isso indica que o post não foi deletado ou não existe')
               throw new Error('Post não foi deletado - nenhuma linha afetada')
             }

             // Verificar se o post foi realmente deletado
             const { data: verifyData, error: verifyError } = await supabase
               .from('feed_posts')
               .select('id, title, user_id')
               .eq('id', postId)
               .single()

             if (verifyError && verifyError.code === 'PGRST116') {
               console.log('✅ Confirmação: Post foi deletado (não encontrado na verificação)')
             } else if (verifyData) {
               console.error('❌ PROBLEMA CRÍTICO: Post ainda existe no banco após exclusão:', verifyData)
               throw new Error('Post não foi deletado do banco de dados')
             }

             // Se o post tem metadata indicando que é um post automático, deletar notificações relacionadas
             if (postData?.metadata?.type) {
               const postType = postData.metadata.type
               const userId = postData.user_id
               const professionalId = postData.professional_id

               console.log('🔍 Post automático deletado, verificando notificações relacionadas:', {
                 postType,
                 userId,
                 professionalId
               })

               // Deletar notificações relacionadas baseadas no tipo de post
               if (postType === 'favorite' && professionalId) {
                 // Deletar notificação de favorito para o usuário que foi favoritado
                 const { error: notificationError } = await supabase
                   .from('notifications')
                   .delete()
                   .eq('user_id', professionalId)
                   .eq('type', 'favorite')
                   .eq('metadata->>favoriter_id', userId)

                 if (notificationError) {
                   console.warn('⚠️ Erro ao deletar notificação de favorito:', notificationError.message)
                 } else {
                   console.log('✅ Notificação de favorito deletada')
                 }
               } else if (postType === 'recommendation' && professionalId) {
                 // Deletar notificação de recomendação para o usuário que foi recomendado
                 const { error: notificationError } = await supabase
                   .from('notifications')
                   .delete()
                   .eq('user_id', professionalId)
                   .eq('type', 'recommendation')
                   .eq('metadata->>recommender_id', userId)

                 if (notificationError) {
                   console.warn('⚠️ Erro ao deletar notificação de recomendação:', notificationError.message)
                 } else {
                   console.log('✅ Notificação de recomendação deletada')
                 }
               }
             }

             // Atualizar cache local - remover o post
             console.log('🔄 Atualizando cache local para remover post:', postId)
             queryClient.setQueryData(queryKey, (oldData: any) => {
               if (!oldData) {
                 console.log('⚠️ Cache vazio, não há dados para atualizar')
                 return oldData
               }
               
               const updatedData = {
                 ...oldData,
                 pages: oldData.pages.map((page: any[]) => {
                   const originalLength = page.length
                   const filteredPage = page.filter((item: any) => !(item.id === postId && item.type === 'post'))
                   console.log(`📄 Página atualizada: ${originalLength} → ${filteredPage.length} itens`)
                   return filteredPage
                 })
               }
               
               console.log('✅ Cache atualizado com sucesso')
               return updatedData
             })

             console.log('🎉 Exclusão do post concluída com sucesso:', postId)
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
