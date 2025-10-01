import { supabase } from '@/lib/supabase'

export interface NotificationData {
  user_id: string
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  action_url?: string
  metadata?: Record<string, any>
  expires_at?: string
}

export type NotificationType = 
  | 'message'           // Mensagens de chat
  | 'review'            // Avaliações recebidas
  | 'booking'            // Agendamentos
  | 'system'            // Sistema/admin
  | 'achievement'       // Conquistas
  | 'verification'      // Verificações
  | 'success'           // Sucessos
  | 'warning'           // Avisos
  | 'error'             // Erros
  | 'favorite'          // Favoritos
  | 'follow'            // Seguidores
  | 'recommendation'    // Recomendações
  | 'profile_view'      // Visualizações de perfil
  | 'post_like'         // Curtidas em posts
  | 'post_comment'      // Comentários em posts
  | 'availability'      // Mudanças de disponibilidade
  | 'portfolio'         // Atualizações de portfólio
  | 'reputation'        // Mudanças de reputação
  | 'admin'             // Notificações administrativas
  | 'security'          // Segurança
  | 'maintenance'       // Manutenção
  | 'update'            // Atualizações
  | 'reminder'          // Lembretes

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export class NotificationService {
  /**
   * Criar uma nova notificação
   */
  static async create(notification: NotificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          priority: notification.priority || 'normal',
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar notificação:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro no NotificationService.create:', error)
      throw error
    }
  }

  /**
   * Criar notificação para múltiplos usuários
   */
  static async createBulk(notifications: NotificationData[]) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(
          notifications.map(notification => ({
            ...notification,
            priority: notification.priority || 'normal',
            is_read: false,
            created_at: new Date().toISOString()
          }))
        )
        .select()

      if (error) {
        console.error('Erro ao criar notificações em lote:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro no NotificationService.createBulk:', error)
      throw error
    }
  }

  /**
   * Notificação de nova mensagem
   */
  static async notifyNewMessage(
    recipientId: string, 
    senderName: string, 
    messagePreview: string,
    conversationId?: string
  ) {
    return this.create({
      user_id: recipientId,
      title: `💬 Nova mensagem de ${senderName}`,
      message: messagePreview,
      type: 'message',
      priority: 'high',
      // Não usar action_url para mensagens - será tratado pelo código
      action_url: null,
      metadata: { 
        sender_name: senderName,
        conversation_id: conversationId,
        sender_id: conversationId ? undefined : recipientId, // Será preenchido pelo useNotificationTriggers
        action_type: 'open_chat'
      }
    })
  }

  /**
   * Notificação de nova avaliação
   */
  static async notifyNewReview(
    recipientId: string,
    reviewerName: string,
    rating: number,
    reviewId: string
  ) {
    return this.create({
      user_id: recipientId,
      title: `Nova avaliação de ${reviewerName}`,
      message: `Você recebeu uma avaliação de ${rating} estrelas`,
      type: 'review',
      priority: 'high',
      action_url: `/avaliacoes?review=${reviewId}`,
      metadata: { reviewer_name: reviewerName, rating }
    })
  }

  /**
   * Notificação de novo favorito
   */
  static async notifyNewFavorite(
    recipientId: string,
    favoriterName: string,
    profileId: string
  ) {
    return this.create({
      user_id: recipientId,
      title: `${favoriterName} adicionou você aos favoritos`,
      message: 'Seu perfil foi adicionado aos favoritos',
      type: 'favorite',
      priority: 'normal',
      action_url: `/perfil/${profileId}`,
      metadata: { favoriter_name: favoriterName }
    })
  }

  /**
   * Notificação de visualização de perfil
   */
  static async notifyProfileView(
    recipientId: string,
    viewerName: string,
    profileId: string
  ) {
    return this.create({
      user_id: recipientId,
      title: `${viewerName} visualizou seu perfil`,
      message: 'Alguém visualizou seu perfil profissional',
      type: 'profile_view',
      priority: 'low',
      action_url: `/perfil/${profileId}`,
      metadata: { viewer_name: viewerName }
    })
  }

  /**
   * Notificação de nova recomendação
   */
  static async notifyNewRecommendation(
    recipientId: string,
    recommenderName: string,
    reason: string,
    recommendationId: string
  ) {
    return this.create({
      user_id: recipientId,
      title: `${recommenderName} te recomendou`,
      message: `Motivo: ${reason}`,
      type: 'recommendation',
      priority: 'high',
      action_url: `/reputacao`,
      metadata: { recommender_name: recommenderName, reason }
    })
  }

  /**
   * Notificação de conquista
   */
  static async notifyAchievement(
    userId: string,
    achievementName: string,
    description: string,
    badgeUrl?: string
  ) {
    return this.create({
      user_id: userId,
      title: `🏆 Nova conquista: ${achievementName}`,
      message: description,
      type: 'achievement',
      priority: 'high',
      action_url: '/reputacao',
      metadata: { achievement_name: achievementName, badge_url: badgeUrl }
    })
  }

  /**
   * Notificação de verificação
   */
  static async notifyVerification(
    userId: string,
    verificationType: string,
    status: 'approved' | 'rejected' | 'pending'
  ) {
    const statusMessages = {
      approved: 'aprovada',
      rejected: 'rejeitada',
      pending: 'em análise'
    }

    return this.create({
      user_id: userId,
      title: `Verificação ${statusMessages[status]}`,
      message: `Sua verificação de ${verificationType} foi ${statusMessages[status]}`,
      type: 'verification',
      priority: status === 'approved' ? 'high' : 'normal',
      action_url: '/verificacao',
      metadata: { verification_type: verificationType, status }
    })
  }

  /**
   * Notificação de sistema
   */
  static async notifySystem(
    userId: string,
    title: string,
    message: string,
    priority: NotificationPriority = 'normal'
  ) {
    return this.create({
      user_id: userId,
      title,
      message,
      type: 'system',
      priority,
      action_url: '/dashboard'
    })
  }

  /**
   * Notificação de manutenção
   */
  static async notifyMaintenance(
    userId: string,
    startTime: string,
    duration: string
  ) {
    return this.create({
      user_id: userId,
      title: '🔧 Manutenção programada',
      message: `O sistema passará por manutenção em ${startTime} por ${duration}`,
      type: 'maintenance',
      priority: 'normal',
      action_url: '/sobre'
    })
  }

  /**
   * Notificação de segurança
   */
  static async notifySecurity(
    userId: string,
    securityEvent: string,
    action: string
  ) {
    return this.create({
      user_id: userId,
      title: '🔒 Alerta de segurança',
      message: `${securityEvent}: ${action}`,
      type: 'security',
      priority: 'urgent',
      action_url: '/dashboard'
    })
  }

  /**
   * Notificação de recomendação
   */
  static async notifyRecommendation(
    userId: string,
    recommenderName: string,
    professionalName: string,
    recommendationId: string
  ) {
    return this.create({
      user_id: userId,
      title: `${recommenderName} recomendou ${professionalName}`,
      message: 'Você recebeu uma nova recomendação',
      type: 'recommendation',
      priority: 'normal',
      action_url: `/recomendacoes?rec=${recommendationId}`,
      metadata: { recommender_name: recommenderName, professional_name: professionalName }
    })
  }

  /**
   * Notificação de mudança de disponibilidade
   */
  static async notifyAvailabilityChange(
    userId: string,
    isAvailable: boolean
  ) {
    return this.create({
      user_id: userId,
      title: isAvailable ? '✅ Você está disponível' : '⏸️ Você está indisponível',
      message: isAvailable 
        ? 'Seu status foi alterado para disponível' 
        : 'Seu status foi alterado para indisponível',
      type: 'availability',
      priority: 'low',
      action_url: '/dashboard'
    })
  }

  /**
   * Notificação de atualização de portfólio
   */
  static async notifyPortfolioUpdate(
    userId: string,
    projectName: string,
    projectId: string
  ) {
    return this.create({
      user_id: userId,
      title: '📁 Portfólio atualizado',
      message: `Novo projeto adicionado: ${projectName}`,
      type: 'portfolio',
      priority: 'normal',
      action_url: `/portfolio?project=${projectId}`,
      metadata: { project_name: projectName }
    })
  }

  /**
   * Notificação de mudança de reputação
   */
  static async notifyReputationChange(
    userId: string,
    oldReputation: number,
    newReputation: number
  ) {
    const change = newReputation - oldReputation
    const isPositive = change > 0

    return this.create({
      user_id: userId,
      title: isPositive ? '📈 Reputação aumentou' : '📉 Reputação diminuiu',
      message: `Sua reputação ${isPositive ? 'aumentou' : 'diminuiu'} de ${oldReputation} para ${newReputation}`,
      type: 'reputation',
      priority: 'normal',
      action_url: '/reputacao',
      metadata: { old_reputation: oldReputation, new_reputation: newReputation, change }
    })
  }

  /**
   * Notificação de curtida em post
   */
  static async notifyPostLike(
    userId: string,
    likerName: string,
    postId: string
  ) {
    return this.create({
      user_id: userId,
      title: `${likerName} curtiu seu post`,
      message: 'Alguém curtiu sua publicação',
      type: 'post_like',
      priority: 'low',
      action_url: `/feed?post=${postId}`,
      metadata: { liker_name: likerName }
    })
  }

  /**
   * Notificação de comentário em post
   */
  static async notifyPostComment(
    userId: string,
    commenterName: string,
    comment: string,
    postId: string
  ) {
    return this.create({
      user_id: userId,
      title: `${commenterName} comentou em seu post`,
      message: comment,
      type: 'post_comment',
      priority: 'normal',
      action_url: `/feed?post=${postId}`,
      metadata: { commenter_name: commenterName }
    })
  }

  /**
   * Notificação de lembrete
   */
  static async notifyReminder(
    userId: string,
    title: string,
    message: string,
    reminderTime: string
  ) {
    return this.create({
      user_id: userId,
      title: `⏰ Lembrete: ${title}`,
      message,
      type: 'reminder',
      priority: 'normal',
      expires_at: reminderTime
    })
  }

  /**
   * Notificação de atualização do sistema
   */
  static async notifyUpdate(
    userId: string,
    version: string,
    features: string[]
  ) {
    return this.create({
      user_id: userId,
      title: `🆕 Atualização v${version}`,
      message: `Novas funcionalidades: ${features.join(', ')}`,
      type: 'update',
      priority: 'normal',
      action_url: '/sobre'
    })
  }

  /**
   * Notificação administrativa
   */
  static async notifyAdmin(
    userId: string,
    title: string,
    message: string,
    priority: NotificationPriority = 'normal'
  ) {
    return this.create({
      user_id: userId,
      title: `👨‍💼 Admin: ${title}`,
      message,
      type: 'admin',
      priority,
      action_url: '/dashboard'
    })
  }
}
