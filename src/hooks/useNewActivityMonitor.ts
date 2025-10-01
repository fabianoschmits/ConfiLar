'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { NewNotificationService } from '@/services/NewNotificationService'
import { NotificationDuplicateControl } from '@/services/NotificationDuplicateControl'
import { supabase } from '@/lib/supabase'

export function useNewActivityMonitor() {
  const { user } = useAuthContext()
  const processedActions = useRef(new Set<string>())
  const isMonitoring = useRef(false)
  const lastCheckTime = useRef<Date>(new Date())

  // Monitorar novas mensagens
  const monitorNewMessages = useCallback(async () => {
    if (!user) return

    try {
      console.log('📨 Monitorando novas mensagens...')
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          receiver_id,
          conversation_id,
          created_at,
          sender:profiles!messages_sender_id_fkey(full_name)
        `)
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .neq('sender_id', user.id)
        .gte('created_at', lastCheckTime.current.toISOString()) // Desde a última verificação
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error)
        return
      }

      if (!data || data.length === 0) return

      for (const message of data) {
        const actionId = `message_${message.id}`
        
        if (processedActions.current.has(actionId)) continue

        // Verificar duplicação com controle mais rigoroso
        const isDuplicate = await NotificationDuplicateControl.isNotificationProcessed(
          'message',
          user.id,
          message.id
        )

        if (isDuplicate) {
          console.log('⏭️ Notificação de mensagem já existe:', message.id)
          processedActions.current.add(actionId)
          continue
        }

        const senderName = (message.sender as any)?.full_name || 'Usuário'
        
        console.log(`🔔 Criando notificação para mensagem de ${senderName}`)
        
        await NewNotificationService.notifyNewMessage(
          user.id,
          senderName,
          message.content,
          message.conversation_id
        )

        // Marcar como processada
        NotificationDuplicateControl.markAsProcessed('message', user.id, message.id)
        processedActions.current.add(actionId)
      }
      
      // Atualizar timestamp da última verificação
      lastCheckTime.current = new Date()
    } catch (error) {
      console.error('❌ Erro ao monitorar mensagens:', error)
    }
  }, [user])

  // Monitorar novos favoritos
  const monitorNewFavorites = useCallback(async () => {
    if (!user) return

    try {
      console.log('❤️ Monitorando novos favoritos...')
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          user_id,
          favorite_user_id,
          created_at,
          favoriter:profiles!user_favorites_user_id_fkey(full_name)
        `)
        .eq('favorite_user_id', user.id)
        .gte('created_at', lastCheckTime.current.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar favoritos:', error)
        return
      }

      if (!data || data.length === 0) return

      for (const favorite of data) {
        const actionId = `favorite_${favorite.id}`
        
        if (processedActions.current.has(actionId)) continue

        const favoriterName = (favorite.favoriter as any)?.full_name || 'Usuário'
        
        console.log(`🔔 Criando notificação para favorito de ${favoriterName}`)
        
        await NewNotificationService.notifyNewFavorite(
          user.id,
          favoriterName,
          favorite.user_id
        )

        processedActions.current.add(actionId)
      }
      
      // Atualizar timestamp da última verificação
      lastCheckTime.current = new Date()
    } catch (error) {
      console.error('❌ Erro ao monitorar favoritos:', error)
    }
  }, [user])

  // Monitorar novas recomendações
  const monitorNewRecommendations = useCallback(async () => {
    if (!user) return

    try {
      console.log('⭐ Monitorando novas recomendações...')
      
      const { data, error } = await supabase
        .from('user_recommendations')
        .select(`
          id,
          recommender_id,
          recommended_id,
          recommendation_type,
          created_at,
          recommender:profiles!user_recommendations_recommender_id_fkey(full_name)
        `)
        .eq('recommended_id', user.id)
        .gte('created_at', lastCheckTime.current.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar recomendações:', error)
        return
      }

      if (!data || data.length === 0) return

      for (const recommendation of data) {
        const actionId = `recommendation_${recommendation.id}`
        
        if (processedActions.current.has(actionId)) continue

        const recommenderName = (recommendation.recommender as any)?.full_name || 'Usuário'
        
        console.log(`🔔 Criando notificação para recomendação de ${recommenderName}`)
        
        await NewNotificationService.notifyNewRecommendation(
          user.id,
          recommenderName,
          recommendation.recommended_id,
          recommendation.recommendation_type
        )

        processedActions.current.add(actionId)
      }
      
      // Atualizar timestamp da última verificação
      lastCheckTime.current = new Date()
    } catch (error) {
      console.error('❌ Erro ao monitorar recomendações:', error)
    }
  }, [user])

  // Monitorar novas avaliações
  const monitorNewReviews = useCallback(async () => {
    if (!user) return

    try {
      console.log('⭐ Monitorando novas avaliações...')
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          reviewer_id,
          reviewed_id,
          rating_person,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name)
        `)
        .eq('reviewed_id', user.id)
        .gte('created_at', lastCheckTime.current.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar avaliações:', error)
        return
      }

      if (!data || data.length === 0) return

      for (const review of data) {
        const actionId = `review_${review.id}`
        
        if (processedActions.current.has(actionId)) continue

        const reviewerName = (review.reviewer as any)?.full_name || 'Usuário'
        
        console.log(`🔔 Criando notificação para avaliação de ${reviewerName}`)
        
        await NewNotificationService.notifyNewReview(
          user.id,
          reviewerName,
          review.rating_person,
          review.id
        )

        processedActions.current.add(actionId)
      }
      
      // Atualizar timestamp da última verificação
      lastCheckTime.current = new Date()
    } catch (error) {
      console.error('❌ Erro ao monitorar avaliações:', error)
    }
  }, [user])

  // Executar monitoramento
  useEffect(() => {
    if (!user) return

    if (isMonitoring.current) {
      console.log('⚠️ Monitoramento já está ativo, pulando...')
      return
    }

    isMonitoring.current = true
    console.log('🔄 Sistema de monitoramento de atividades INICIADO')

    const runMonitoring = async () => {
      try {
        // Verificar e limpar duplicatas primeiro
        await NotificationDuplicateControl.checkForDuplicates(user.id)
        NotificationDuplicateControl.cleanupCache()
        
        await Promise.all([
          monitorNewMessages(),
          monitorNewFavorites(),
          monitorNewRecommendations(),
          monitorNewReviews()
        ])
      } catch (error) {
        console.error('❌ Erro no monitoramento:', error)
      }
    }

    // Executar imediatamente
    runMonitoring()

    // Executar a cada 10 segundos para teste
    const interval = setInterval(runMonitoring, 10000)

    return () => {
      clearInterval(interval)
      isMonitoring.current = false
      console.log('🛑 Sistema de monitoramento parado')
    }
  }, [user, monitorNewMessages, monitorNewFavorites, monitorNewRecommendations, monitorNewReviews])

  return {
    monitorNewMessages,
    monitorNewFavorites,
    monitorNewRecommendations,
    monitorNewReviews
  }
}
