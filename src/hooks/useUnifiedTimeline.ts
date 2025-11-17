import { useState, useCallback } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { UnifiedTimelineItem, TimelineFilters, TimelineStats, TimelinePost } from '@/types/timeline'
import { LocationFilter } from '@/hooks/useLocationFilters'
import { removeYouTubeUrls, detectYouTubeUrls } from '@/utils/youtube'
import { getEstadoBySigla, getEstadoByNome } from '@/lib/ibge'

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
      // Nota: A ordenação por is_featured é feita no frontend após verificar se premium expirou
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
          is_featured,
          is_premium,
          premium_points_spent,
          premium_expires_at,
          premium_highlight_color,
          tags,
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
        .eq('is_active', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)

      // Aplicar filtro de busca se especificado
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim()
        
        // Verificar se é busca por usuário (user:username) ou ID (id:userid)
        if (searchTerm.startsWith('user:')) {
          // Buscar por nome do usuário
          const username = searchTerm.replace('user:', '').trim()
          
          // Primeiro, buscar IDs dos usuários que correspondem ao nome
          const { data: matchingProfiles } = await supabase
            .from('profiles')
            .select('id')
            .ilike('full_name', `%${username}%`)
          
          const matchingUserIds = matchingProfiles?.map(p => p.id) || []
          
          if (matchingUserIds.length > 0) {
            // Filtrar posts por IDs dos usuários encontrados
            // Usar .in() para user_id e professional_id
            postsQuery = postsQuery.or(`user_id.in.(${matchingUserIds.join(',')}),professional_id.in.(${matchingUserIds.join(',')})`)
          } else {
            // Se não encontrar usuários, retornar query vazia usando um ID inválido
            postsQuery = postsQuery.eq('id', '00000000-0000-0000-0000-000000000000') // ID inválido para retornar vazio
          }
        } else if (searchTerm.startsWith('id:')) {
          // Buscar por ID do usuário
          const userId = searchTerm.replace('id:', '').trim()
          postsQuery = postsQuery.or(`user_id.eq.${userId},professional_id.eq.${userId}`)
        } else {
          // Busca por palavras-chave (padrão)
          const keywords = searchTerm.toLowerCase()
          
          // Buscar em campos básicos do post
          postsQuery = postsQuery.or(`
            title.ilike.%${keywords}%,
            description.ilike.%${keywords}%,
            metadata->>category.ilike.%${keywords}%,
            metadata->>service_type.ilike.%${keywords}%,
            metadata->>tags.ilike.%${keywords}%,
            metadata->>service_description.ilike.%${keywords}%,
            metadata->>user.ilike.%${keywords}%
          `.replace(/\s+/g, ''))
        }
      }

      // Aplicar filtros de localização
      if (filters.location_filter) {
        const locationFilter = filters.location_filter
        
        console.log('🔍 Aplicando filtro de localização:', JSON.stringify(locationFilter, null, 2))
        
        // Função auxiliar para normalizar estado (aceitar tanto sigla quanto nome completo)
        const normalizeStateForQuery = async (state: string): Promise<string[]> => {
          const states: string[] = [state] // Sempre incluir o valor original
          
          // Se for sigla (2 caracteres), buscar nome completo também
          if (state && state.length === 2) {
            try {
              const estado = await getEstadoBySigla(state)
              if (estado && estado.nome !== state) {
                states.push(estado.nome)
              }
            } catch (error) {
              console.error('Erro ao buscar nome do estado:', error)
            }
          } else {
            // Se for nome completo, buscar sigla também
            try {
              const estado = await getEstadoByNome(state)
              if (estado && estado.sigla !== state) {
                states.push(estado.sigla)
              }
            } catch (error) {
              console.error('Erro ao buscar sigla do estado:', error)
            }
          }
          
          return states
        }
        
        switch (locationFilter.type) {
          case 'local':
            if (locationFilter.city && locationFilter.state) {
              console.log('🏠 Filtro local:', {
                city: locationFilter.city,
                state: locationFilter.state
              })
              
              // Normalizar estado para buscar tanto sigla quanto nome completo
              const normalizedStates = await normalizeStateForQuery(locationFilter.state)
              
              // Buscar posts que correspondam à cidade E ao estado (sigla ou nome completo)
              if (normalizedStates.length > 1) {
                // Se há múltiplas variações do estado, usar OR
                const stateConditions = normalizedStates.map(s => `location_state.ilike.%${s}%`).join(',')
                postsQuery = postsQuery
                  .ilike('location_city', locationFilter.city)
                  .or(`location_state.ilike.%${normalizedStates[0]}%,location_state.ilike.%${normalizedStates[1]}%`)
              } else {
                postsQuery = postsQuery
                  .ilike('location_city', locationFilter.city)
                  .ilike('location_state', locationFilter.state)
              }
            }
            break
          case 'state':
            if (locationFilter.state) {
              console.log('🏙️ Filtro estado:', locationFilter.state)
              
              // Normalizar estado para buscar tanto sigla quanto nome completo
              const normalizedStates = await normalizeStateForQuery(locationFilter.state)
              
              if (normalizedStates.length > 1) {
                // Se há múltiplas variações do estado, usar OR
                postsQuery = postsQuery.or(`location_state.ilike.%${normalizedStates[0]}%,location_state.ilike.%${normalizedStates[1]}%`)
              } else {
                postsQuery = postsQuery.ilike('location_state', locationFilter.state)
              }
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
              
              // Normalizar estado para buscar tanto sigla quanto nome completo
              const normalizedStates = await normalizeStateForQuery(locationFilter.state)
              
              if (normalizedStates.length > 1) {
                // Se há múltiplas variações do estado, usar OR
                postsQuery = postsQuery
                  .ilike('location_city', locationFilter.city)
                  .or(`location_state.ilike.%${normalizedStates[0]}%,location_state.ilike.%${normalizedStates[1]}%`)
              } else {
                postsQuery = postsQuery
                  .ilike('location_city', locationFilter.city)
                  .ilike('location_state', locationFilter.state)
              }
            } else if (locationFilter.state && !locationFilter.city) {
              // Se apenas estado foi selecionado (sem cidade)
              console.log('🏙️ Filtro custom: apenas estado:', locationFilter.state)
              
              // Normalizar estado para buscar tanto sigla quanto nome completo
              const normalizedStates = await normalizeStateForQuery(locationFilter.state)
              
              if (normalizedStates.length > 1) {
                // Se há múltiplas variações do estado, usar OR
                postsQuery = postsQuery.or(`location_state.ilike.%${normalizedStates[0]}%,location_state.ilike.%${normalizedStates[1]}%`)
              } else {
                postsQuery = postsQuery.ilike('location_state', locationFilter.state)
              }
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
      

      // Se há busca ativa, fazer uma busca adicional por nome de usuário nos posts
      let relatedPosts: any[] = []
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim().toLowerCase()
        
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
            .order('is_featured', { ascending: false })
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

        // Verificar se premium expirou
        const premiumExpired = post.is_premium && post.premium_expires_at 
          ? new Date(post.premium_expires_at) < new Date()
          : false
        
        // Só considerar premium/featured se não tiver expirado
        const isActivePremium = post.is_premium && !premiumExpired
        const isActiveFeatured = post.is_featured && !premiumExpired

        const timelinePost = {
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
          is_featured: isActiveFeatured,
          tags: post.tags || [],
          is_premium: isActivePremium,
          premium_points_spent: post.premium_points_spent,
          premium_expires_at: post.premium_expires_at,
          premium_highlight_color: post.premium_highlight_color,
          metadata: post.metadata
        }


        return timelinePost
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

      // Combinar e ordenar todos os itens (priorizando posts destacados que não expiraram)
      const allItems = [...timelinePosts, ...timelineActivities, ...timelineNotifications]
        .sort((a, b) => {
          // Verificar se são posts e se premium expirou
          const aIsPost = a.type === 'post'
          const bIsPost = b.type === 'post'
          
          // Verificar se premium expirou para posts
          const aPremiumExpired = aIsPost && a.premium_expires_at 
            ? new Date(a.premium_expires_at) < new Date()
            : false
          const bPremiumExpired = bIsPost && b.premium_expires_at 
            ? new Date(b.premium_expires_at) < new Date()
            : false
          
          // Só considerar featured se não tiver expirado
          const aIsFeatured = (a.is_featured || false) && !aPremiumExpired
          const bIsFeatured = (b.is_featured || false) && !bPremiumExpired
          
          // Priorizar posts destacados (is_featured) que não expiraram
          if (aIsFeatured && !bIsFeatured) return -1
          if (!aIsFeatured && bIsFeatured) return 1
          
          // Se ambos são destacados ou ambos não são, ordenar por data
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
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
    staleTime: 1000 * 10, // Cache por 10 segundos (mais frequente)
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
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
      
      // Validar dados obrigatórios
      if (!newPost.user_id) {
        throw new Error('ID do usuário é obrigatório')
      }
      if (!newPost.description?.trim()) {
        throw new Error('Descrição é obrigatória')
      }
      
      // Detectar vídeos do YouTube ANTES de remover o link
      const youtubeVideos = detectYouTubeUrls(newPost.description.trim())
      const firstVideo = youtubeVideos.length > 0 ? youtubeVideos[0] : null
      
      // Remover URLs do YouTube da descrição antes de salvar
      const cleanedDescription = removeYouTubeUrls(newPost.description.trim())
      
      // Gerar título automaticamente a partir da descrição limpa (primeiros 100 caracteres)
      const title = cleanedDescription.slice(0, 100)
      
      // Preparar metadata com informações do vídeo (se houver)
      const metadata = firstVideo ? {
        youtube_video_id: firstVideo.id,
        youtube_video_url: firstVideo.url
      } : null
      
      // Preparar dados para inserção
      const postData = {
        professional_id: newPost.user_id,
        user_id: newPost.user_id,
        title: title,
        description: cleanedDescription,
        content: cleanedDescription, // Usar description limpa como content também
        images: Array.isArray(newPost.images) ? newPost.images : [],
        service_category_id: newPost.service_category_id || null,
        location_state: newPost.location_state || null,
        location_city: newPost.location_city || null,
        likes_count: 0,
        comments_count: 0,
        is_active: true,
        is_public: true,
        is_featured: false,
        tags: null,
        metadata: metadata
      }
      
      console.log('📝 [addPost] Dados do post:', postData)
      
      // Criação do post
      const { data, error } = await supabase
        .from('feed_posts')
        .insert(postData)
        .select()
        .single()

      if (error) {
        console.error('❌ [addPost] Erro do Supabase:', error)
        throw error
      }

      console.log('✅ [addPost] Post criado com sucesso:', data.id)

      // ✅ VERIFICAR SE É O PRIMEIRO POST DO USUÁRIO (para referral milestone)
      try {
        // Contar quantos posts o usuário tem (excluindo posts de sistema/boas-vindas)
        const { count, error: countError } = await supabase
          .from('feed_posts')
          .select('*', { count: 'exact', head: true })
          .eq('professional_id', newPost.user_id)
          .is('tags', null)
        
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

      // Atualizar cache local - usar metadata do banco (que já inclui o vídeo se houver)
      const timelinePost = {
        id: data.id,
        type: 'post' as const,
        created_at: data.created_at,
        user_id: data.professional_id,
        user_name: newPost.user_name,
        user_avatar: newPost.user_avatar,
        user_type: newPost.user_type,
        title: data.title,
        description: data.description || '', // Já está limpo (sem link)
        images: data.images || [],
        service_category_id: data.service_category_id,
        location_state: data.location_state,
        location_city: data.location_city,
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        is_liked: false,
        is_featured: data.is_featured || false,
        tags: data.tags || [],
        metadata: data.metadata // Metadata já inclui youtube_video_id se houver
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
      // Buscar post atual para manter metadata existente e dados premium
      const { data: currentPost } = await supabase
        .from('feed_posts')
        .select('metadata, is_premium, premium_expires_at, premium_points_spent, premium_highlight_color')
        .eq('id', postId)
        .single()
      
      // Detectar vídeos do YouTube ANTES de remover o link
      const youtubeVideos = detectYouTubeUrls(updatedPost.description?.trim() || '')
      const firstVideo = youtubeVideos.length > 0 ? youtubeVideos[0] : null
      
      // Remover URLs do YouTube da descrição antes de salvar
      const cleanedDescription = removeYouTubeUrls(updatedPost.description?.trim() || '')
      
      // Preparar metadata mantendo dados existentes e adicionando/atualizando vídeo
      const existingMetadata = (currentPost?.metadata as any) || {}
      const metadata: any = {
        ...existingMetadata
      }
      
      // Adicionar ou atualizar informações do vídeo do YouTube
      if (firstVideo) {
        metadata.youtube_video_id = firstVideo.id
        metadata.youtube_video_url = firstVideo.url
      } else {
        // Se não há vídeo, remover do metadata
        delete metadata.youtube_video_id
        delete metadata.youtube_video_url
      }
      
      // Preparar dados de atualização - NÃO atualizar campos premium se o post for premium
      // Isso garante que o tempo de expiração não seja resetado
      const updateData: any = {
        title: updatedPost.title,
        description: cleanedDescription,
        content: cleanedDescription, // Também atualizar content com a descrição limpa
        images: updatedPost.images || [],
        metadata: metadata,
        updated_at: new Date().toISOString()
      }
      
      // Se o post é premium, preservar todos os dados premium (não resetar)
      if (currentPost?.is_premium) {
        // Manter todos os campos premium existentes (não atualizar)
        // Isso garante que premium_expires_at não seja alterado
        console.log('🛡️ [editPost] Post premium detectado - preservando dados premium:', {
          is_premium: currentPost.is_premium,
          premium_expires_at: currentPost.premium_expires_at,
          premium_points_spent: currentPost.premium_points_spent
        })
      }
      
      // Atualizar no banco de dados (campos premium serão preservados automaticamente se não forem incluídos no update)
      const { data, error } = await supabase
        .from('feed_posts')
        .update(updateData)
        .eq('id', postId)
        .select('*, professional:profiles!feed_posts_professional_id_fkey(id, full_name, avatar_url, user_type, is_available), user:profiles!feed_posts_user_id_fkey(id, full_name, avatar_url, user_type, is_available)')
        .single()

      if (error) throw error

      // Transformar dados do banco para o formato TimelinePost
      const professionalData = (data.professional as any) || (data.user as any)
      const userData = (data.user as any) || (data.professional as any)
      
      // Atualizar cache local - usar dados do banco (que preservam premium_expires_at)
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any[]) =>
            page.map((item: any) => {
              if (item.id === postId && item.type === 'post') {
                return {
                  ...item,
                  title: data.title,
                  description: cleanedDescription,
                  images: data.images || [],
                  metadata: metadata,
                  // Preservar dados premium do banco (não são atualizados na edição)
                  is_premium: data.is_premium ?? item.is_premium,
                  premium_expires_at: data.premium_expires_at ?? item.premium_expires_at,
                  premium_points_spent: data.premium_points_spent ?? item.premium_points_spent,
                  premium_highlight_color: data.premium_highlight_color ?? item.premium_highlight_color,
                  tags: data.tags || item.tags
                }
              }
              return item
            })
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

  // Função para criar posts premium
  const addPremiumPost = useCallback(async (newPost: Omit<TimelinePost, 'id' | 'created_at' | 'likes_count' | 'comments_count' | 'is_liked'> & { pointsToSpend: number; durationDays: number }) => {
    try {
      // Detectar vídeos do YouTube ANTES de remover o link
      const youtubeVideos = detectYouTubeUrls(newPost.description?.trim() || '')
      const firstVideo = youtubeVideos.length > 0 ? youtubeVideos[0] : null
      
      // Remover URLs do YouTube da descrição antes de salvar
      const cleanedDescription = removeYouTubeUrls(newPost.description?.trim() || '')
      
      // Gerar título automaticamente a partir da descrição limpa (primeiros 100 caracteres)
      const title = cleanedDescription.slice(0, 100) || newPost.title || 'Post Premium'

      // Verificar saldo do usuário
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_points_balance')
        .select('balance, total_spent')
        .eq('user_id', newPost.user_id)
        .single()

      if (balanceError || !balanceData) {
        throw new Error('Erro ao verificar saldo do usuário')
      }

      if (balanceData.balance < newPost.pointsToSpend) {
        throw new Error(`Saldo insuficiente para criar post premium. Necessário: ${newPost.pointsToSpend} pontos`)
      }

      // Calcular data de expiração baseado na duração escolhida
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + newPost.durationDays)

      // Preparar metadata com informações do vídeo (se houver) e dados premium
      const metadata: any = {
        type: 'premium',
        points_spent: newPost.pointsToSpend,
        duration_days: newPost.durationDays,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      }
      
      // Adicionar informações do vídeo do YouTube ao metadata se houver
      if (firstVideo) {
        metadata.youtube_video_id = firstVideo.id
        metadata.youtube_video_url = firstVideo.url
      }

      // Criar post premium diretamente na tabela
      const postData = {
        professional_id: newPost.user_id,
        user_id: newPost.user_id,
        title: title,
        description: cleanedDescription,
        content: cleanedDescription, // Usar description limpa como content
        images: Array.isArray(newPost.images) ? newPost.images : [],
        service_category_id: newPost.service_category_id || null,
        location_state: newPost.location_state || null,
        location_city: newPost.location_city || null,
        likes_count: 0,
        comments_count: 0,
        is_active: true,
        is_public: true,
        is_featured: true, // Posts premium são destacados
        is_premium: true, // Marcar como premium
        premium_points_spent: newPost.pointsToSpend,
        premium_expires_at: expiresAt.toISOString(),
        premium_highlight_color: '#FFD700',
        tags: ['premium'],
        metadata: metadata
      }

      const { data, error } = await supabase
        .from('feed_posts')
        .insert(postData)
        .select()
        .single()

      if (error) {
        console.error('❌ [addPremiumPost] Erro do Supabase:', error)
        throw error
      }

      console.log('✅ [addPremiumPost] Post PREMIUM criado com sucesso:', data.id)

      // DEBITAR PONTOS DO USUÁRIO usando add_points (registra a transação)
      const { error: pointsError } = await supabase
        .rpc('add_points', {
          p_user_id: newPost.user_id,
          p_points: -newPost.pointsToSpend,
          p_source: 'premium_post',
          p_description: `Criou post premium (${newPost.durationDays} dia${newPost.durationDays > 1 ? 's' : ''} - ${newPost.pointsToSpend} pontos)`,
          p_metadata: {
            post_id: data.id,
            duration_days: newPost.durationDays,
            post_title: newPost.title
          }
        })

      if (pointsError) {
        console.error('❌ [addPremiumPost] Erro ao debitar pontos:', pointsError)
        // Rollback: deletar o post criado
        await supabase
          .from('feed_posts')
          .delete()
          .eq('id', data.id)
        throw new Error('Erro ao debitar pontos. Post não foi criado.')
      }

      console.log('✅ [addPremiumPost] Pontos debitados com sucesso e transação registrada')

      // Atualizar estatísticas de pontos no perfil
      const { data: currentProfile, error: profileSelectError } = await supabase
        .from('profiles')
        .select('total_points_spent')
        .eq('id', newPost.user_id)
        .single()

      if (!profileSelectError && currentProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            total_points_spent: (currentProfile.total_points_spent || 0) + newPost.pointsToSpend,
            updated_at: new Date().toISOString()
          })
          .eq('id', newPost.user_id)

        if (profileError) {
          console.warn('⚠️ [addPremiumPost] Erro ao atualizar estatísticas do perfil (não crítico):', profileError)
        }
      }

      console.log('✅ [addPremiumPost] Pontos debitados com sucesso')

      // Atualizar cache local
      const timelinePost = {
        id: data.id,
        type: 'post' as const,
        created_at: data.created_at || new Date().toISOString(),
        user_id: newPost.user_id,
        user_name: newPost.user_name,
        user_avatar: newPost.user_avatar,
        user_type: newPost.user_type,
        title: title,
        description: cleanedDescription,
        images: newPost.images || [],
        service_category_id: newPost.service_category_id,
        location_state: newPost.location_state,
        location_city: newPost.location_city,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        is_featured: true, // Posts premium são destacados
        tags: ['premium'],
        metadata: metadata // Usar o metadata que já inclui o vídeo (se houver)
      } as UnifiedTimelineItem

      // Adicionar ao cache local (igual ao addPost)
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return { pages: [[timelinePost]], pageParams: [undefined] }
        return {
          ...oldData,
          pages: [[timelinePost, ...oldData.pages[0]], ...oldData.pages.slice(1)]
        }
      })

      // Invalidar queries relacionadas para atualizar a timeline
      queryClient.invalidateQueries({ queryKey: ['unified-timeline'] })
      queryClient.invalidateQueries({ queryKey: ['user-posts', newPost.user_id] })
      queryClient.invalidateQueries({ queryKey: ['user-points', newPost.user_id] })

      console.log('✅ [addPremiumPost] Post premium criado com sucesso!', {
        id: timelinePost.id,
        title: timelinePost.title,
        is_featured: (timelinePost as any).is_featured,
        tags: (timelinePost as any).tags
      })

      return timelinePost

    } catch (error) {
      console.error('❌ [addPremiumPost] Erro ao criar post premium:', error)
      // Re-throw para que o componente possa tratar o erro
      throw error
    }
  }, [queryClient, queryKey])

  // Função para renovar post premium expirado
  const renewPremiumPost = useCallback(async (postId: string, pointsToSpend: number, durationDays: number) => {
    try {
      console.log('👑 [renewPremiumPost] Renovando post premium:', postId)

      // Buscar o post atual
      const { data: currentPost, error: fetchError } = await supabase
        .from('feed_posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (fetchError || !currentPost) {
        throw new Error('Post não encontrado')
      }

      // Verificar saldo do usuário
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_points_balance')
        .select('balance, total_spent')
        .eq('user_id', currentPost.user_id)
        .single()

      if (balanceError || !balanceData) {
        throw new Error('Erro ao verificar saldo do usuário')
      }

      if (balanceData.balance < pointsToSpend) {
        throw new Error(`Saldo insuficiente para renovar post premium. Necessário: ${pointsToSpend} pontos`)
      }

      // Calcular nova data de expiração
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + durationDays)

      // Atualizar post para premium novamente
      const { data, error } = await supabase
        .from('feed_posts')
        .update({
          is_premium: true,
          is_featured: true,
          premium_points_spent: pointsToSpend,
          premium_expires_at: expiresAt.toISOString(),
          premium_highlight_color: '#FFD700',
          tags: ['premium'],
          metadata: {
            ...(currentPost.metadata || {}),
            type: 'premium',
            points_spent: pointsToSpend,
            duration_days: durationDays,
            expires_at: expiresAt.toISOString(),
            renewed_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single()

      if (error) {
        console.error('❌ [renewPremiumPost] Erro do Supabase:', error)
        throw error
      }

      console.log('✅ [renewPremiumPost] Post premium renovado com sucesso:', data.id)

      // Debitar pontos
      const { error: pointsError } = await supabase
        .rpc('add_points', {
          p_user_id: currentPost.user_id,
          p_points: -pointsToSpend,
          p_source: 'premium_post_renewal',
          p_description: `Renovou post premium (${durationDays} dia${durationDays > 1 ? 's' : ''} - ${pointsToSpend} pontos)`,
          p_metadata: {
            post_id: postId,
            duration_days: durationDays,
            post_title: currentPost.title
          }
        })

      if (pointsError) {
        console.error('❌ [renewPremiumPost] Erro ao debitar pontos:', pointsError)
        throw new Error('Erro ao debitar pontos. Renovação não foi concluída.')
      }

      // Invalidar queries para atualizar a timeline
      queryClient.invalidateQueries({ queryKey: ['unified-timeline'] })
      queryClient.invalidateQueries({ queryKey: ['user-posts', currentPost.user_id] })
      queryClient.invalidateQueries({ queryKey: ['user-points', currentPost.user_id] })

      console.log('✅ [renewPremiumPost] Post premium renovado com sucesso!')
      return data

    } catch (error) {
      console.error('❌ [renewPremiumPost] Erro ao renovar post premium:', error)
      throw error
    }
  }, [queryClient, supabase])

  return {
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
