import { supabase } from "@/lib/supabase";

export interface NotificationData {
  user_id: string;
  type:
    | "like"
    | "comment"
    | "mention"
    | "share"
    | "reply"
    | "follow"
    | "message"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "review"
    | "booking"
    | "verification"
    | "achievement"
    | "support"
    | "system";
  title: string;
  message: string;
  action_url?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Criar notificação para curtida em post
   */
  static async createLikeNotification(
    postId: string,
    postOwnerId: string,
    likerId: string,
    likerName: string,
  ) {
    if (postOwnerId === likerId) return; // Não notificar a si mesmo

    const notification: NotificationData = {
      user_id: postOwnerId,
      type: "like",
      title: "Nova curtida!",
      message: `${likerName} curtiu seu post`,
      action_url: `/feed?post=${postId}`,
      priority: "normal",
      metadata: {
        post_id: postId,
        liker_id: likerId,
        liker_name: likerName,
        type: "post_like",
      },
    };

    return this.createNotification(notification);
  }

  /**
   * Criar notificação para comentário em post
   */
  static async createCommentNotification(
    postId: string,
    postOwnerId: string,
    commenterId: string,
    commenterName: string,
    commentContent: string,
  ) {
    if (postOwnerId === commenterId) return; // Não notificar a si mesmo

    const notification: NotificationData = {
      user_id: postOwnerId,
      type: "comment",
      title: "Novo comentário!",
      message: `${commenterName} comentou em seu post: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? "..." : ""}"`,
      action_url: `/feed?post=${postId}`,
      priority: "normal",
      metadata: {
        post_id: postId,
        commenter_id: commenterId,
        commenter_name: commenterName,
        comment_content: commentContent,
        type: "post_comment",
      },
    };

    return this.createNotification(notification);
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
    replyContent: string,
  ) {
    if (originalCommenterId === replierId) return; // Não notificar a si mesmo

    const notification: NotificationData = {
      user_id: originalCommenterId,
      type: "reply",
      title: "Nova resposta!",
      message: `${replierName} respondeu seu comentário: "${replyContent.substring(0, 50)}${replyContent.length > 50 ? "..." : ""}"`,
      action_url: `/feed?post=${postId}`,
      priority: "normal",
      metadata: {
        post_id: postId,
        comment_id: commentId,
        replier_id: replierId,
        replier_name: replierName,
        reply_content: replyContent,
        type: "comment_reply",
      },
    };

    return this.createNotification(notification);
  }

  /**
   * Criar notificação para menção
   */
  static async createMentionNotification(
    postId: string,
    mentionedUserId: string,
    mentionerId: string,
    mentionerName: string,
    content: string,
  ) {
    if (mentionedUserId === mentionerId) return; // Não notificar a si mesmo

    const notification: NotificationData = {
      user_id: mentionedUserId,
      type: "mention",
      title: "Você foi mencionado!",
      message: `${mentionerName} te mencionou: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`,
      action_url: `/feed?post=${postId}`,
      priority: "high",
      metadata: {
        post_id: postId,
        mentioner_id: mentionerId,
        mentioner_name: mentionerName,
        content: content,
        type: "mention",
      },
    };

    return this.createNotification(notification);
  }

  /**
   * Criar notificação genérica
   */
  static async createNotification(notification: NotificationData) {
    try {
      const data = {
        id: crypto.randomUUID(),
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        action_url: notification.action_url,
        priority: notification.priority || "normal",
        metadata: notification.metadata || {},
        is_read: false,
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("notifications").insert(data);

      if (error) {
        console.error("Erro ao criar notificação:", error);
        throw error;
      }

      console.log("✅ Notificação criada:", data.id);
      return data;
    } catch (error) {
      console.error("Erro no NotificationService:", error);
      throw error;
    }
  }

  /**
   * Notificar nova mensagem no chat
   */
  static async notifyNewMessage(
    recipientId: string,
    senderName: string,
    messageContent: string,
    chatId: string,
  ) {
    try {
      const notification: NotificationData = {
        user_id: recipientId,
        type: "message",
        title: "Nova mensagem",
        message: `${senderName}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? "..." : ""}`,
        action_url: `/mensagens?conversation=${chatId}`,
        priority: "high",
        metadata: {
          chat_id: chatId,
          sender_name: senderName,
          type: "chat_message",
        },
      };

      await this.createNotification(notification);

      await this.sendPushNotification(
        recipientId,
        "Nova mensagem",
        `${senderName}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? "..." : ""}`,
      );
    } catch (error) {
      console.warn("Erro ao notificar nova mensagem:", error);
    }
  }

  /**
   * Notificar nova avaliação
   */
  static async notifyNewReview(
    recipientId: string,
    reviewerName: string,
    rating: number,
    comment: string,
  ) {
    try {
      const notification: NotificationData = {
        user_id: recipientId,
        type: "review",
        title: "Nova avaliação!",
        message: `${reviewerName} avaliou você com ${rating} estrelas`,
        action_url: `/avaliacoes`,
        priority: "normal",
        metadata: {
          reviewer_name: reviewerName,
          rating,
          type: "review",
        },
      };

      await this.createNotification(notification);
      await this.sendPushNotification(
        recipientId,
        "Nova avaliação!",
        `${reviewerName} te avaliou`,
      );
    } catch (error) {
      console.warn("Erro ao notificar nova avaliação:", error);
    }
  }

  /**
   * Notificar novo favorito
   */
  static async notifyNewFavorite(recipientId: string, userName: string) {
    try {
      const notification: NotificationData = {
        user_id: recipientId,
        type: "info",
        title: "Novo favorito!",
        message: `${userName} adicionou você aos favoritos`,
        action_url: `/perfil/${recipientId}`,
        priority: "normal",
        metadata: {
          user_name: userName,
          type: "favorite",
        },
      };

      await this.createNotification(notification);
      await this.sendPushNotification(
        recipientId,
        "Novo favorito!",
        `${userName} te favoritou`,
      );
    } catch (error) {
      console.warn("Erro ao notificar novo favorito:", error);
    }
  }

  /**
   * Notificar nova recomendação
   */
  static async notifyNewRecommendation(
    recipientId: string,
    recommenderName: string,
  ) {
    try {
      const notification: NotificationData = {
        user_id: recipientId,
        type: "info",
        title: "Nova recomendação!",
        message: `${recommenderName} recomendou você`,
        action_url: `/perfil/${recipientId}`,
        priority: "normal",
        metadata: {
          recommender_name: recommenderName,
          type: "recommendation",
        },
      };

      await this.createNotification(notification);
      await this.sendPushNotification(
        recipientId,
        "Nova recomendação!",
        `${recommenderName} te recomendou`,
      );
    } catch (error) {
      console.warn("Erro ao notificar nova recomendação:", error);
    }
  }

  /**
   * Notificar visualização de perfil
   */
  static async notifyProfileView(recipientId: string, visitorName: string) {
    try {
      const notification: NotificationData = {
        user_id: recipientId,
        type: "info",
        title: "Perfil visualizado",
        message: `${visitorName} visualizou seu perfil`,
        action_url: `/perfil/${recipientId}`,
        priority: "low",
        metadata: {
          visitor_name: visitorName,
          type: "profile_view",
        },
      };

      await this.createNotification(notification);
    } catch (error) {
      console.warn("Erro ao notificar visualização de perfil:", error);
    }
  }

  /**
   * Enviar notificação push (se o usuário tiver subscription)
   */
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title,
          body,
          data,
          icon: "/icon-192x192.png",
          badge: "/icon-96x96.png",
        }),
      });

      if (!response.ok) {
        console.warn(
          "Falha ao enviar push notification:",
          await response.text(),
        );
      }
    } catch (error) {
      console.warn("Erro ao enviar push notification:", error);
    }
  }
}
