import { supabase } from '@/lib/supabase'

export interface NotificationData {
  user_id: string
  type: 'like' | 'comment' | 'mention' | 'share' | 'reply' | 'follow'
  title: string
  message: string
  action_url?: string
  priority?: 'low' | 'normal' | 'high'
  metadata?: Record<string, any>
}

export class NotificationService {
  /**
   * Criar notificação para curtida em post
   */
  static async createLikeNotification(
    postId: string,
    postOwnerId: string,
    likerId: string,
    likerName: string
  ) {
    if (postOwnerId === likerId) return // Não notificar a si mesmo

    const notification: NotificationData = {
      user_id: postOwnerId,
      type: 'like',
      title: 'Nova curtida!',
      message: `${likerName} curtiu seu post`,
      action_url: `/feed?post=${postId}`,
      priority: 'normal',
      metadata: {
        post_id: postId,
        liker_id: likerId,
        liker_name: likerName,
        type: 'post_like'
      }
    }

    return this.createNotification(notification)
  }

  /**
   * Criar notificação para comentário em post
   */
  static async createCommentNotification(
    postId: string,
    postOwnerId: string,
    commenterId: string,
    commenterName: string,
    commentContent: string
  ) {
    if (postOwnerId === commenterId) return // Não notificar a si mesmo

    const notification: NotificationData = {
      user_id: postOwnerId,
      type: 'comment',
      title: 'Novo comentário!',
      message: `${commenterName} comentou em seu post: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`,
      action_url: `/feed?post=${postId}`,
      priority: 'normal',
      metadata: {
        post_id: postId,
        commenter_id: commenterId,
        commenter_name: commenterName,
        comment_content: commentContent,
        type: 'post_comment'
      }
    }

    return this.createNotification(notification)
  }

  /**
   * Criar notificação para resposta a comentário
   */
  static async createReplyNotification(
    postId: string,
    commentId: string,
    originalCommenterId: string,
    replierId: string,
    replierName: string,
    replyContent: string
  ) {
    if (originalCommenterId === replierId) return // Não notificar a si mesmo

    const notification: NotificationData = {
      user_id: originalCommenterId,
      type: 'reply',
      title: 'Nova resposta!',
      message: `${replierName} respondeu seu comentário: "${replyContent.substring(0, 50)}${replyContent.length > 50 ? '...' : ''}"`,
      action_url: `/feed?post=${postId}`,
      priority: 'normal',
      metadata: {
        post_id: postId,
        comment_id: commentId,
        replier_id: replierId,
        replier_name: replierName,
        reply_content: replyContent,
        type: 'comment_reply'
      }
    }

    return this.createNotification(notification)
  }

  /**
   * Criar notificação para menção
   */
  static async createMentionNotification(
    postId: string,
    mentionedUserId: string,
    mentionerId: string,
    mentionerName: string,
    content: string
  ) {
    if (mentionedUserId === mentionerId) return // Não notificar a si mesmo

    const notification: NotificationData = {
      user_id: mentionedUserId,
      type: 'mention',
      title: 'Você foi mencionado!',
      message: `${mentionerName} te mencionou: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
      action_url: `/feed?post=${postId}`,
      priority: 'high',
      metadata: {
        post_id: postId,
        mentioner_id: mentionerId,
        mentioner_name: mentionerName,
        content: content,
        type: 'mention'
      }
    }

    return this.createNotification(notification)
  }

  /**
   * Criar notificação genérica
   */
  static async createNotification(notification: NotificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          action_url: notification.action_url,
          priority: notification.priority || 'normal',
          metadata: notification.metadata || {},
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar notificação:', error)
        throw error
      }

      console.log('✅ Notificação criada:', data.id)
      return data
    } catch (error) {
      console.error('Erro no NotificationService:', error)
      throw error
    }
  }

  /**
   * Enviar notificação push (se o usuário tiver subscription)
   */
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          title,
          body,
          data,
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png'
        })
      })

      if (!response.ok) {
        console.warn('Falha ao enviar push notification:', await response.text())
      }
    } catch (error) {
      console.warn('Erro ao enviar push notification:', error)
    }
  }
}