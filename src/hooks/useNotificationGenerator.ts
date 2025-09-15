import { useNotifications } from '@/components/notifications/NotificationProvider';

export const useNotificationGenerator = () => {
  const { addNotification } = useNotifications();

  // Notificações de Mensagens
  const notifyNewMessage = (senderName: string, conversationId: string) => {
    addNotification({
      user_id: '', // Será preenchido automaticamente
      title: 'Nova mensagem recebida',
      message: `${senderName} enviou uma nova mensagem`,
      type: 'message',
      category: 'messages',
      action_url: `/mensagens?conversa=${conversationId}`,
      action_label: 'Responder',
      metadata: {
        sender: senderName,
        conversation_id: conversationId
      }
    });
  };

  // Notificações de Avaliações
  const notifyNewReview = (reviewerName: string, rating: number, reviewId: string) => {
    addNotification({
      user_id: '',
      title: 'Nova avaliação recebida',
      message: `${reviewerName} avaliou seu serviço com ${rating} estrelas`,
      type: 'review',
      category: 'reviews',
      action_url: `/avaliacoes/${reviewId}`,
      action_label: 'Ver avaliação',
      metadata: {
        reviewer: reviewerName,
        rating: rating,
        review_id: reviewId
      }
    });
  };

  // Notificações de Agendamentos
  const notifyNewBooking = (clientName: string, serviceName: string, bookingId: string) => {
    addNotification({
      user_id: '',
      title: 'Novo agendamento',
      message: `${clientName} agendou ${serviceName}`,
      type: 'booking',
      category: 'bookings',
      action_label: 'Ver agendamento',
      metadata: {
        client: clientName,
        service: serviceName,
        booking_id: bookingId
      }
    });
  };

  const notifyBookingConfirmed = (professionalName: string, serviceName: string, bookingId: string) => {
    addNotification({
      user_id: '',
      title: 'Agendamento confirmado',
      message: `${professionalName} confirmou seu agendamento para ${serviceName}`,
      type: 'success',
      category: 'bookings',
      action_label: 'Ver detalhes',
      metadata: {
        professional: professionalName,
        service: serviceName,
        booking_id: bookingId
      }
    });
  };

  const notifyBookingCancelled = (professionalName: string, serviceName: string, bookingId: string) => {
    addNotification({
      user_id: '',
      title: 'Agendamento cancelado',
      message: `${professionalName} cancelou o agendamento para ${serviceName}`,
      type: 'warning',
      category: 'bookings',
      action_label: 'Ver detalhes',
      metadata: {
        professional: professionalName,
        service: serviceName,
        booking_id: bookingId
      }
    });
  };

  // Notificações de Verificação
  const notifyVerificationRequested = (documentType: string) => {
    addNotification({
      user_id: '',
      title: 'Verificação solicitada',
      message: `Sua verificação de ${documentType} foi enviada para análise`,
      type: 'verification',
      category: 'verifications',
      action_url: '/verificacao',
      action_label: 'Acompanhar status',
      metadata: {
        document_type: documentType,
        status: 'pending'
      }
    });
  };

  const notifyVerificationApproved = (documentType: string) => {
    addNotification({
      user_id: '',
      title: 'Verificação aprovada!',
      message: `Sua verificação de ${documentType} foi aprovada com sucesso`,
      type: 'success',
      category: 'verifications',
      action_url: '/verificacao',
      action_label: 'Ver perfil',
      metadata: {
        document_type: documentType,
        status: 'approved'
      }
    });
  };

  const notifyVerificationRejected = (documentType: string, reason: string) => {
    addNotification({
      user_id: '',
      title: 'Verificação rejeitada',
      message: `Sua verificação de ${documentType} foi rejeitada: ${reason}`,
      type: 'error',
      category: 'verifications',
      action_url: '/verificacao',
      action_label: 'Corrigir',
      metadata: {
        document_type: documentType,
        status: 'rejected',
        reason: reason
      }
    });
  };

  // Notificações de Conquistas
  const notifyAchievementUnlocked = (achievementName: string, description: string, achievementId: string) => {
    addNotification({
      user_id: '',
      title: '🏆 Nova conquista desbloqueada!',
      message: `${achievementName}: ${description}`,
      type: 'achievement',
      category: 'achievements',
      action_url: `/conquistas/${achievementId}`,
      action_label: 'Ver conquista',
      metadata: {
        achievement_name: achievementName,
        description: description,
        achievement_id: achievementId
      }
    });
  };

  // Notificações de Sistema
  const notifySystemUpdate = (title: string, message: string) => {
    addNotification({
      user_id: '',
      title: title,
      message: message,
      type: 'info',
      category: 'system'
    });
  };

  const notifyWelcome = (userName: string) => {
    addNotification({
      user_id: '',
      title: '🎉 Bem-vindo ao ConfiLar!',
      message: `Olá ${userName}! Estamos felizes em tê-lo conosco. Complete seu perfil para começar.`,
      type: 'success',
      category: 'system',
      action_url: '/perfil',
      action_label: 'Completar perfil',
      metadata: {
        welcome: true,
        user_name: userName
      }
    });
  };

  const notifyProfileCompleted = (completionPercentage: number) => {
    addNotification({
      user_id: '',
      title: 'Perfil atualizado!',
      message: `Seu perfil está ${completionPercentage}% completo. Continue para melhorar sua visibilidade!`,
      type: 'success',
      category: 'system',
      action_url: '/perfil',
      action_label: 'Ver perfil',
      metadata: {
        profile_completion: completionPercentage
      }
    });
  };

  // Notificações de Segurança
  const notifySecurityAlert = (title: string, message: string) => {
    addNotification({
      user_id: '',
      title: `🔒 ${title}`,
      message: message,
      type: 'warning',
      category: 'system',
      action_url: '/perfil',
      action_label: 'Verificar',
      metadata: {
        security_alert: true
      }
    });
  };

  // Notificações de Marketing (opcional)
  const notifyPromotion = (title: string, message: string, actionUrl?: string) => {
    addNotification({
      user_id: '',
      title: title,
      message: message,
      type: 'info',
      category: 'marketing',
      action_url: actionUrl,
      action_label: actionUrl ? 'Ver oferta' : undefined,
      metadata: {
        promotion: true
      }
    });
  };

  return {
    // Mensagens
    notifyNewMessage,
    
    // Avaliações
    notifyNewReview,
    
    // Agendamentos
    notifyNewBooking,
    notifyBookingConfirmed,
    notifyBookingCancelled,
    
    // Verificações
    notifyVerificationRequested,
    notifyVerificationApproved,
    notifyVerificationRejected,
    
    // Conquistas
    notifyAchievementUnlocked,
    
    // Sistema
    notifySystemUpdate,
    notifyWelcome,
    notifyProfileCompleted,
    
    // Segurança
    notifySecurityAlert,
    
    // Marketing
    notifyPromotion
  };
};




