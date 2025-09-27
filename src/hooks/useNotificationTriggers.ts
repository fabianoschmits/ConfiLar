import { useCallback, useEffect } from 'react'
import { useAutoNotifications } from './useAutoNotifications'
import { supabase } from '@/lib/supabase'

export function useNotificationTriggers() {
  const { createRecommendationPost, createReviewPost, createFavoritePost, createStatsPost } = useAutoNotifications()

  // Monitorar novas avaliações
  const monitorReviews = useCallback(async () => {
    try {
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
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Buscar informações dos usuários
      for (const review of data || []) {
        try {
          // Buscar dados do reviewer
          const { data: reviewerData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', review.reviewer_id)
            .single()

          // Buscar dados do reviewed
          const { data: reviewedData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', review.reviewed_id)
            .single()

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
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          id,
          reason,
          created_at,
          from_user_id,
          to_user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Buscar informações dos usuários
      for (const recommendation of data || []) {
        try {
          // Buscar dados do from_user
          const { data: fromUserData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', recommendation.from_user_id)
            .single()

          // Buscar dados do to_user
          const { data: toUserData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', recommendation.to_user_id)
            .single()

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
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          user_id,
          professional_id,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Buscar informações dos usuários
      for (const favorite of data || []) {
        try {
          // Buscar dados do user
          const { data: userData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', favorite.user_id)
            .single()

          // Buscar dados do favorited
          const { data: favoritedData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', favorite.professional_id)
            .single()

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

  // Executar monitoramento
  useEffect(() => {
    const interval = setInterval(() => {
      monitorReviews()
      monitorRecommendations()
      monitorFavorites()
    }, 30000) // Verificar a cada 30 segundos

    // Postar estatísticas uma vez por dia
    const dailyStats = setInterval(() => {
      postStats()
    }, 24 * 60 * 60 * 1000) // 24 horas

    return () => {
      clearInterval(interval)
      clearInterval(dailyStats)
    }
  }, [monitorReviews, monitorRecommendations, monitorFavorites, postStats])

  return {
    monitorReviews,
    monitorRecommendations,
    monitorFavorites,
    postStats
  }
}