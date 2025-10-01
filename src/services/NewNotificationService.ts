import { supabase } from '@/lib/supabase'

export interface NewNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'message' | 'favorite' | 'recommendation' | 'review' | 'system'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  is_read: boolean
  action_url?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export class NewNotificationService {
  /**
   * Criar uma nova notificação
   */
  static async create(notification: Omit<NewNotification, 'id' | 'created_at' | 'updated_at' | 'is_read'>): Promise<NewNotification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          is_read: false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar notificação:', error)
        return null
      }

      console.log('✅ Notificação criada:', data.id)
      return data
    } catch (error) {
      console.error('❌ Erro no NewNotificationService.create:', error)
      return null
    }
  }

  /**
   * Notificar nova mensagem
   */
  static async notifyNewMessage(
    recipientId: string,
    senderName: string,
    messageContent: string,
    conversationId?: string
  ): Promise<NewNotification | null> {
    return this.create({
      user_id: recipientId,
      title: `💬 Nova mensagem de ${senderName}`,
      message: messageContent,
      type: 'message',
      priority: 'high',
      action_url: null,
      metadata: {
        sender_name: senderName,
        conversation_id: conversationId,
        action_type: 'open_chat'
      }
    })
  }

  /**
   * Notificar adição aos favoritos
   */
  static async notifyNewFavorite(
    userId: string,
    favoriterName: string,
    favoritedUserId: string
  ): Promise<NewNotification | null> {
    return this.create({
      user_id: userId,
      title: `❤️ ${favoriterName} te adicionou aos favoritos`,
      message: `${favoriterName} adicionou você aos seus favoritos`,
      type: 'favorite',
      priority: 'normal',
      action_url: `/perfil/${favoritedUserId}`,
      metadata: {
        favoriter_name: favoriterName,
        favorited_user_id: favoritedUserId,
        action_type: 'view_profile'
      }
    })
  }

  /**
   * Notificar nova recomendação
   */
  static async notifyNewRecommendation(
    userId: string,
    recommenderName: string,
    recommendedUserId: string,
    reason?: string
  ): Promise<NewNotification | null> {
    return this.create({
      user_id: userId,
      title: `⭐ ${recommenderName} te recomendou`,
      message: reason ? `"${reason}"` : `${recommenderName} te recomendou`,
      type: 'recommendation',
      priority: 'normal',
      action_url: `/perfil/${recommendedUserId}`,
      metadata: {
        recommender_name: recommenderName,
        recommended_user_id: recommendedUserId,
        reason: reason,
        action_type: 'view_profile'
      }
    })
  }

  /**
   * Notificar nova avaliação
   */
  static async notifyNewReview(
    userId: string,
    reviewerName: string,
    rating: number,
    reviewId: string
  ): Promise<NewNotification | null> {
    const stars = '⭐'.repeat(rating)
    return this.create({
      user_id: userId,
      title: `⭐ ${reviewerName} te avaliou com ${rating} estrelas`,
      message: `${reviewerName} te avaliou com ${stars}`,
      type: 'review',
      priority: 'normal',
      action_url: `/avaliacoes`,
      metadata: {
        reviewer_name: reviewerName,
        rating: rating,
        review_id: reviewId,
        action_type: 'view_reviews'
      }
    })
  }

  /**
   * Notificar sistema
   */
  static async notifySystem(
    userId: string,
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<NewNotification | null> {
    return this.create({
      user_id: userId,
      title: `🔔 ${title}`,
      message: message,
      type: 'system',
      priority: priority,
      action_url: null,
      metadata: {
        action_type: 'system'
      }
    })
  }

  /**
   * Buscar notificações do usuário
   */
  static async getUserNotifications(userId: string, limit: number = 50): Promise<NewNotification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ Erro ao buscar notificações:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Erro no NewNotificationService.getUserNotifications:', error)
      return []
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('❌ Erro ao marcar notificação como lida:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Erro no NewNotificationService.markAsRead:', error)
      return false
    }
  }

  /**
   * Deletar notificação
   */
  static async delete(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('❌ Erro ao deletar notificação:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Erro no NewNotificationService.delete:', error)
      return false
    }
  }

  /**
   * Limpar todas as notificações do usuário
   */
  static async clearAll(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Erro ao limpar notificações:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Erro no NewNotificationService.clearAll:', error)
      return false
    }
  }
}
