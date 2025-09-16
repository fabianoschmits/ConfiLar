import { useNotifications } from '@/components/notifications/NotificationProvider';
import { useAuth } from './useAuth';

export const useNotificationService = () => {
  const { addNotification } = useNotifications();
  const { profile } = useAuth();

  const notifyNewMessage = (senderName: string, messagePreview: string) => {
    addNotification({
      title: 'Nova Mensagem',
      message: `${senderName}: ${messagePreview}`,
      type: 'info',
      user_id: profile?.id || '',
      action_url: '/mensagens',
      priority: 'normal'
    });
  };

  const notifyNewReview = (reviewerName: string, rating: number, serviceName: string) => {
    const emoji = rating >= 4 ? '⭐' : rating >= 3 ? '👍' : '😐';
    addNotification({
      title: 'Nova Avaliação',
      message: `${emoji} ${reviewerName} avaliou seu serviço "${serviceName}" com ${rating}/5 estrelas`,
      type: 'success',
      user_id: profile?.id || '',
      action_url: '/avaliacoes',
      priority: 'normal'
    });
  };

  const notifyServiceRequest = (clientName: string, serviceType: string) => {
    addNotification({
      title: 'Nova Solicitação de Serviço',
      message: `${clientName} solicitou seus serviços de ${serviceType}`,
      type: 'info',
      user_id: profile?.id || '',
      action_url: '/dashboard',
      priority: 'normal'
    });
  };

  const notifyProfileUpdate = (field: string) => {
    addNotification({
      title: 'Perfil Atualizado',
      message: `Seu ${field} foi atualizado com sucesso!`,
      type: 'success',
      user_id: profile?.id || '',
      priority: 'normal'
    });
  };

  const notifySystemUpdate = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'info',
      user_id: profile?.id || '',
      priority: 'normal'
    });
  };

  const notifyError = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'error',
      user_id: profile?.id || '',
      priority: 'high'
    });
  };

  const notifySuccess = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'success',
      user_id: profile?.id || '',
      priority: 'normal'
    });
  };

  const notifyWarning = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'warning',
      user_id: profile?.id || '',
      priority: 'high'
    });
  };

  // Simular notificações automáticas para demonstração
  const simulateNotifications = () => {
    setTimeout(() => {
      notifyNewMessage('João Silva', 'Olá! Gostaria de saber mais sobre seus serviços...');
    }, 2000);

    setTimeout(() => {
      notifyNewReview('Maria Santos', 5, 'Limpeza Residencial');
    }, 5000);

    setTimeout(() => {
      notifyServiceRequest('Carlos Oliveira', 'Manutenção Elétrica');
    }, 8000);

    setTimeout(() => {
      notifySystemUpdate('Nova Funcionalidade', 'O sistema de notificações está funcionando perfeitamente!');
    }, 12000);
  };

  return {
    notifyNewMessage,
    notifyNewReview,
    notifyServiceRequest,
    notifyProfileUpdate,
    notifySystemUpdate,
    notifyError,
    notifySuccess,
    notifyWarning,
    simulateNotifications
  };
};






