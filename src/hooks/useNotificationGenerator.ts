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
      action_url: `/mensagens?conversa=${conversationId}`,
      priority: 'normal'
    });
  };

  // Notificações de Avaliações
  const notifyNewReview = (reviewerName: string, rating: number, reviewId: string) => {
    addNotification({
      user_id: '',
      title: 'Nova avaliação recebida',
      message: `${reviewerName} avaliou seu serviço com ${rating} estrelas`,
      type: 'review',
      action_url: `/avaliacoes/${reviewId}`,
      priority: 'normal'
    });
  };

  // Notificações de Agendamentos
  const notifyNewBooking = (clientName: string, serviceName: string, bookingId: string) => {
    addNotification({
      user_id: '',
      title: 'Novo agendamento',
      message: `${clientName} agendou ${serviceName}`,
      type: 'booking',
      priority: 'normal'
    });
  };

  const notifyBookingConfirmed = (professionalName: string, serviceName: string, bookingId: string) => {
    addNotification({
      user_id: '',
      title: 'Agendamento confirmado',
      message: `${professionalName} confirmou seu agendamento para ${serviceName}`,
      type: 'success',
      priority: 'normal'
    });
  };

  const notifyBookingCancelled = (professionalName: string, serviceName: string, bookingId: string) => {
    addNotification({
      user_id: '',
      title: 'Agendamento cancelado',
      message: `${professionalName} cancelou o agendamento para ${serviceName}`,
      type: 'warning',
      priority: 'high'
    });
  };

  // Notificações de Verificação
  const notifyVerificationRequested = (documentType: string) => {
    addNotification({
      user_id: '',
      title: 'Verificação solicitada',
      message: `Sua verificação de ${documentType} foi enviada para análise`,
      type: 'verification',
      action_url: '/verificacao',
      priority: 'normal'
    });
  };

  const notifyVerificationApproved = (documentType: string) => {
    addNotification({
      user_id: '',
      title: 'Verificação aprovada!',
      message: `Sua verificação de ${documentType} foi aprovada com sucesso`,
      type: 'success',
      action_url: '/verificacao',
      priority: 'normal'
    });
  };

  const notifyVerificationRejected = (documentType: string, reason: string) => {
    addNotification({
      user_id: '',
      title: 'Verificação rejeitada',
      message: `Sua verificação de ${documentType} foi rejeitada: ${reason}`,
      type: 'error',
      action_url: '/verificacao',
      priority: 'high'
    });
  };

  // Notificações de Conquistas
  const notifyAchievementUnlocked = (achievementName: string, description: string, achievementId: string) => {
    addNotification({
      user_id: '',
      title: '🏆 Nova conquista desbloqueada!',
      message: `${achievementName}: ${description}`,
      type: 'achievement',
      action_url: `/conquistas/${achievementId}`,
      priority: 'normal'
    });
  };

  // Notificações de Sistema
  const notifySystemUpdate = (title: string, message: string) => {
    addNotification({
      user_id: '',
      title: title,
      message: message,
      type: 'info',
      priority: 'normal'
    });
  };

  const notifyWelcome = (userName: string) => {
    addNotification({
      user_id: '',
      title: '🎉 Bem-vindo ao ConfiLar!',
      message: `Olá ${userName}! Estamos felizes em tê-lo conosco. Complete seu perfil para começar.`,
      type: 'success',
      action_url: '/perfil',
      priority: 'normal'
    });
  };

  const notifyProfileCompleted = (completionPercentage: number) => {
    addNotification({
      user_id: '',
      title: 'Perfil atualizado!',
      message: `Seu perfil está ${completionPercentage}% completo. Continue para melhorar sua visibilidade!`,
      type: 'success',
      action_url: '/perfil',
      priority: 'normal'
    });
  };

  // Notificações de Segurança
  const notifySecurityAlert = (title: string, message: string) => {
    addNotification({
      user_id: '',
      title: `🔒 ${title}`,
      message: message,
      type: 'warning',
      action_url: '/perfil',
      priority: 'urgent'
    });
  };

  // Notificações de Marketing (opcional)
  const notifyPromotion = (title: string, message: string, actionUrl?: string) => {
    addNotification({
      user_id: '',
      title: title,
      message: message,
      type: 'info',
      action_url: actionUrl,
      priority: 'normal'
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




