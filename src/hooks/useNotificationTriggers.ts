import { useCallback, useEffect, useRef } from 'react'
import { useAutoNotifications } from './useAutoNotifications'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

export function useNotificationTriggers() {
  const { user } = useAuthContext()
  const { createRecommendationPost, createReviewPost, createFavoritePost, createStatsPost } = useAutoNotifications()
  
  // Sistema de controle para evitar processamento duplicado
  const processedActions = useRef(new Set<string>())

  // Monitorar novas avaliações
  const monitorReviews = useCallback(async () => {
    try {
      // Verificar se há usuário autenticado
      if (!user) {
        console.log('⚠️ Usuário não autenticado, pulando monitoramento de avaliações')
        return
      }

      // Monitorar apenas ações MUITO RECENTES (últimos 5 minutos)
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
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos apenas
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      if (!data || data.length === 0) {
        return // Nenhuma avaliação nova
      }

      // Buscar informações dos usuários
      for (const review of data) {
        try {
          // Criar ID único para esta ação
          const actionId = `review_${review.id}_${review.reviewer_id}_${review.reviewed_id}`
          
          // Verificar se já foi processada
          if (processedActions.current.has(actionId)) {
            console.log('⚠️ Ação de avaliação já processada, pulando:', actionId)
            continue
          }

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
            // Marcar como processada ANTES de criar o post
            processedActions.current.add(actionId)
            
            await createReviewPost(
              reviewerData.id,
              reviewerData.full_name,
              reviewedData.id,
              reviewedData.full_name,
              review.rating_person || 5,
              review.comment || 'Sem comentário.'
            )
            
            console.log('✅ Ação de avaliação processada:', actionId)
          }
        } catch (reviewError) {
          console.error('❌ Erro ao processar review:', reviewError)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao monitorar avaliações:', error)
    }
  }, [user, createReviewPost])

  // Monitorar recomendações
  const monitorRecommendations = useCallback(async () => {
    try {
      // Verificar se há usuário autenticado
      if (!user) {
        console.log('⚠️ Usuário não autenticado, pulando monitoramento de recomendações')
        return
      }

      // Monitorar apenas ações MUITO RECENTES (últimos 5 minutos)
      const { data, error } = await supabase
        .from('user_recommendations')
        .select(`
          id,
          recommendation_type,
          created_at,
          recommender_id,
          recommended_id
        `)
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos apenas
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      if (!data || data.length === 0) {
        return // Nenhuma recomendação nova
      }

      // Buscar informações dos usuários
      for (const recommendation of data) {
        try {
        // Criar ID único para esta ação
        const actionId = `recommendation_${recommendation.id}_${recommendation.recommender_id}_${recommendation.recommended_id}`
        
        // Verificar se já foi processada nos últimos 5 minutos
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
        const actionTime = new Date(recommendation.created_at).getTime()
        if (actionTime < fiveMinutesAgo) {
          console.log('⚠️ Ação de recomendação muito antiga, pulando:', actionId)
          continue
        }
          
          // Verificar se já foi processada
          if (processedActions.current.has(actionId)) {
            console.log('⚠️ Ação de recomendação já processada, pulando:', actionId)
            continue
          }

          // Buscar dados do recommender
          const { data: fromUserData, error: fromUserError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', recommendation.recommender_id)
            .single()

          // Buscar dados do recommended
          const { data: toUserData, error: toUserError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', recommendation.recommended_id)
            .single()

          if (fromUserError || toUserError) {
            console.log('⚠️ Dados de usuário não encontrados para recomendação:', recommendation.id)
            continue
          }

          if (fromUserData && toUserData) {
            // Marcar como processada ANTES de criar o post
            processedActions.current.add(actionId)
            
            await createRecommendationPost(
              fromUserData.id,
              fromUserData.full_name,
              toUserData.id,
              toUserData.full_name,
              'Sem motivo especificado.'
            )
            
            console.log('✅ Ação de recomendação processada:', actionId)
          }
        } catch (recommendationError) {
          console.error('❌ Erro ao processar recomendação:', recommendationError)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao monitorar recomendações:', error)
    }
  }, [user, createRecommendationPost])

  // Monitorar favoritos
  const monitorFavorites = useCallback(async () => {
    try {
      // Verificar se há usuário autenticado
      if (!user) {
        console.log('⚠️ Usuário não autenticado, pulando monitoramento de favoritos')
        return
      }

      // Monitorar apenas ações MUITO RECENTES (últimos 5 minutos)
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          user_id,
          professional_id,
          created_at
        `)
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos apenas
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      if (!data || data.length === 0) {
        return // Nenhum favorito novo
      }

      // Buscar informações dos usuários
      for (const favorite of data) {
        try {
        // Criar ID único para esta ação (usando timestamp para evitar duplicação)
        const actionId = `favorite_${favorite.user_id}_${favorite.professional_id}_${new Date(favorite.created_at).getTime()}`
        
        // Verificar se já foi processada nos últimos 5 minutos
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
        const actionTime = new Date(favorite.created_at).getTime()
        if (actionTime < fiveMinutesAgo) {
          console.log('⚠️ Ação de favorito muito antiga, pulando:', actionId)
          continue
        }
          
          // Verificar se já foi processada
          if (processedActions.current.has(actionId)) {
            console.log('⚠️ Ação de favorito já processada, pulando:', actionId)
            continue
          }

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
            console.log('⚠️ Dados de usuário não encontrados para favorito')
            continue
          }

          if (userData && favoritedData) {
            // Marcar como processada ANTES de criar o post
            processedActions.current.add(actionId)
            
            await createFavoritePost(
              userData.id,
              userData.full_name,
              favoritedData.id,
              favoritedData.full_name
            )
            
            console.log('✅ Ação de favorito processada:', actionId)
          }
        } catch (favoriteError) {
          console.error('❌ Erro ao processar favorito:', favoriteError)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao monitorar favoritos:', error)
    }
  }, [user, createFavoritePost])

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

  // Executar monitoramento periodicamente
  useEffect(() => {
    console.log('🔄 Iniciando sistema de monitoramento de notificações...')
    console.log('👤 Usuário autenticado:', user?.id || 'Nenhum')
    
    // Verificar se já está executando para evitar duplicação
    if (processedActions.current.has('system_running')) {
      console.log('⚠️ Sistema já está executando, pulando...')
      return
    }
    
    // Marcar sistema como executando
    processedActions.current.add('system_running')
    
    // Executar imediatamente
    console.log('⚡ Executando monitoramento imediato...')
    monitorReviews()
    monitorRecommendations()
    monitorFavorites()

    // Configurar intervalo para monitoramento contínuo (otimizado para ações recentes)
    const interval = setInterval(() => {
      console.log('🔄 Executando monitoramento periódico...')
      monitorReviews()
      monitorRecommendations()
      monitorFavorites()
    }, 30 * 1000) // A cada 30 segundos (otimizado para ações recentes)

    // Limpar cache de ações processadas apenas quando necessário
    // (manter ações por 24 horas para evitar duplicação)
    const cleanupInterval = setInterval(() => {
      const cacheSize = processedActions.current.size
      if (cacheSize > 500) { // Só limpar se tiver mais de 500 itens
        console.log(`🧹 Limpando cache de ações processadas (${cacheSize} itens)`)
        processedActions.current.clear()
      }
    }, 24 * 60 * 60 * 1000) // A cada 24 horas

    return () => {
      console.log('🛑 Parando sistema de monitoramento...')
      clearInterval(interval)
      clearInterval(cleanupInterval)
      // Limpar flag de sistema executando
      processedActions.current.delete('system_running')
    }
  }, [user, monitorReviews, monitorRecommendations, monitorFavorites])

  return {
    monitorReviews,
    monitorRecommendations,
    monitorFavorites,
    postStats
  }
}