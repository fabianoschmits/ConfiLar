import { useCallback, useEffect } from 'react'
import { useAutoNotifications } from './useAutoNotifications'
import { supabase } from '@/lib/supabase'

export function useNotificationTriggers() {
  const { createRecommendationPost, createReviewPost, createFavoritePost, createStatsPost } = useAutoNotifications()

  // Monitorar novas avaliações
  const monitorReviews = useCallback(async () => {
    try {
      // Verificar se já existem posts de avaliação recentes para evitar duplicatas
      const { data: existingPosts } = await supabase
        .from('feed_posts')
        .select('id')
        .eq('metadata->>type', 'review')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
        .limit(1)

      if (existingPosts && existingPosts.length > 0) {
        return // Já processou recentemente
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          created_at,
          rating_person,
          comment,
          reviewer_id,
          reviewed_id
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      if (!data || data.length === 0) {
        return // Nenhuma avaliação nova
      }

           // Buscar informações dos usuários
           for (const review of data) {
             try {
               // Buscar dados do reviewer
               const { data: reviewerData, error: reviewerError } = await supabase
                 .from('profiles')
                 .select('id, full_name')
                 .eq('id', review.reviewer_id)
                 .single()

               // Buscar dados do reviewed
               const { data: reviewedData, error: reviewedError } = await supabase
                 .from('profiles')
                 .select('id, full_name')
                 .eq('id', review.reviewed_id)
                 .single()

               if (reviewerError || reviewedError) {
                 console.log('⚠️ Dados de usuário não encontrados para review:', review.id)
                 continue
               }

               if (reviewerData && reviewedData) {
                 await createReviewPost(
                   reviewerData.id,
                   reviewerData.full_name,
                   reviewedData.id,
                   reviewedData.full_name,
                   review.rating_person || 5,
                   review.comment || 'Sem comentário.'
                 )
               }
             } catch (reviewError) {
               console.error('❌ Erro ao processar review:', reviewError)
             }
           }
    } catch (error) {
      console.error('❌ Erro ao monitorar avaliações:', error)
    }
  }, [createReviewPost])

  // Monitorar recomendações
  const monitorRecommendations = useCallback(async () => {
    try {
      // Verificar se já existem posts de recomendação recentes para evitar duplicatas
      const { data: existingPosts } = await supabase
        .from('feed_posts')
        .select('id')
        .eq('metadata->>type', 'recommendation')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
        .limit(1)

      if (existingPosts && existingPosts.length > 0) {
        return // Já processou recentemente
      }

      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          id,
          reason,
          created_at,
          from_user_id,
          to_user_id
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      if (!data || data.length === 0) {
        return // Nenhuma recomendação nova
      }

      // Buscar informações dos usuários
      for (const recommendation of data) {
        try {
          // Buscar dados do from_user
          const { data: fromUserData, error: fromUserError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', recommendation.from_user_id)
            .single()

          // Buscar dados do to_user
          const { data: toUserData, error: toUserError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', recommendation.to_user_id)
            .single()

          if (fromUserError || toUserError) {
            console.log('⚠️ Dados de usuário não encontrados para recomendação:', recommendation.id)
            continue
          }

          if (fromUserData && toUserData) {
            await createRecommendationPost(
              fromUserData.id,
              fromUserData.full_name,
              toUserData.id,
              toUserData.full_name,
              recommendation.reason || 'Sem motivo especificado.'
            )
          }
        } catch (recommendationError) {
          console.error('❌ Erro ao processar recomendação:', recommendationError)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao monitorar recomendações:', error)
    }
  }, [createRecommendationPost])

  // Monitorar favoritos
  const monitorFavorites = useCallback(async () => {
    try {
      // Verificar se já existem posts de favorito recentes para evitar duplicatas
      const { data: existingPosts } = await supabase
        .from('feed_posts')
        .select('id')
        .eq('metadata->>type', 'favorite')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
        .limit(1)

      if (existingPosts && existingPosts.length > 0) {
        return // Já processou recentemente
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          user_id,
          professional_id,
          created_at
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      if (!data || data.length === 0) {
        return // Nenhum favorito novo
      }

      // Buscar informações dos usuários
      for (const favorite of data) {
        try {
          // Buscar dados do user
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', favorite.user_id)
            .single()

          // Buscar dados do favorited
          const { data: favoritedData, error: favoritedError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', favorite.professional_id)
            .single()

          if (userError || favoritedError) {
            console.log('⚠️ Dados de usuário não encontrados para favorito:', favorite.id)
            continue
          }

          if (userData && favoritedData) {
            await createFavoritePost(
              userData.id,
              userData.full_name,
              favoritedData.id,
              favoritedData.full_name
            )
          }
        } catch (favoriteError) {
          console.error('❌ Erro ao processar favorito:', favoriteError)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao monitorar favoritos:', error)
    }
  }, [createFavoritePost])

  // Postar estatísticas periodicamente
  const postStats = useCallback(async () => {
    try {
      // Buscar estatísticas da plataforma
      const [usersResult, projectsResult, reviewsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('classified_ads').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true })
      ])

      const stats = {
        totalUsers: usersResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalReviews: reviewsResult.count || 0
      }

      // Postar estatísticas se houver dados significativos
      if (stats.totalUsers > 0) {
        await createStatsPost(stats)
      }
    } catch (error) {
      console.error('❌ Erro ao postar estatísticas:', error)
    }
  }, [createStatsPost])

  // Executar monitoramento apenas uma vez por sessão
  useEffect(() => {
    // Executar apenas uma vez ao carregar a página
    const timeout = setTimeout(() => {
      monitorReviews()
      monitorRecommendations()
      monitorFavorites()
    }, 2000) // Aguardar 2 segundos após carregar

    return () => {
      clearTimeout(timeout)
    }
  }, []) // Executar apenas uma vez

  return {
    monitorReviews,
    monitorRecommendations,
    monitorFavorites,
    postStats
  }
}