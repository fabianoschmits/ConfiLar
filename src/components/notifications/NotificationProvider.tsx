'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'review' | 'booking' | 'verification' | 'achievement' | 'system';
  is_read: boolean;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: Date;
  created_at: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'is_read' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
  sendPushNotification: (title: string, options?: NotificationOptions) => void;
  loadNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  // Carregar notificações do banco de dados
  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao carregar notificações:', error);
        return;
      }

      const formattedNotifications = data.map(n => ({
        ...n,
        timestamp: new Date(n.created_at),
        created_at: new Date(n.created_at),
        is_read: n.is_read || false,
        priority: n.priority || 'normal'
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Conectar ao canal de notificações em tempo real REATIVADO
  useEffect(() => {
    if (!user) return;

    console.log('🔔 Conectando ao canal de notificações em tempo real')

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Nova notificação recebida:', payload);
          const newNotification = payload.new as Notification;
          
          // Adicionar nova notificação
          setNotifications(prev => [{
            ...newNotification,
            timestamp: new Date(newNotification.created_at),
            created_at: new Date(newNotification.created_at)
          }, ...prev]);

          // Mostrar toast
          showNotificationToast(newNotification);

          // Enviar notificação push se permitido
          if (hasPermission && newNotification.type !== 'info') {
            sendPushNotification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: newNotification.id,
              data: {
                url: newNotification.action_url
              }
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Status da conexão de notificações:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, hasPermission]);

  // Carregar notificações iniciais
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Verificar permissão de notificação
  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  // Mostrar toast baseado no tipo de notificação
  const showNotificationToast = (notification: Notification) => {
    // Não exibir toast para notificações de mensagem - apenas no sino
    if (notification.type === 'message') {
      return;
    }

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, {
          description: notification.title,
          action: notification.action_url ? {
            label: 'Ver',
            onClick: () => window.open(notification.action_url, '_blank')
          } : undefined
        });
        break;
      case 'error':
        toast.error(notification.message, {
          description: notification.title,
        });
        break;
      case 'warning':
        toast.warning(notification.message, {
          description: notification.title,
        });
        break;
      case 'review':
        toast.success(notification.message, {
          description: notification.title,
          action: notification.action_url ? {
            label: 'Ver Avaliação',
            onClick: () => window.open(notification.action_url, '_blank')
          } : undefined
        });
        break;
      case 'booking':
        toast.info(notification.message, {
          description: notification.title,
          action: notification.action_url ? {
            label: 'Ver Agendamento',
            onClick: () => window.open(notification.action_url, '_blank')
          } : undefined
        });
        break;
      case 'verification':
        toast.info(notification.message, {
          description: notification.title,
          action: notification.action_url ? {
            label: 'Verificar',
            onClick: () => window.open(notification.action_url, '_blank')
          } : undefined
        });
        break;
      case 'achievement':
        toast.success(notification.message, {
          description: notification.title,
          action: notification.action_url ? {
            label: 'Ver Conquista',
            onClick: () => window.open(notification.action_url, '_blank')
          } : undefined
        });
        break;
      default:
        toast.info(notification.message, {
          description: notification.title,
        });
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('SEU NAVEGADOR NÃO SUPORTA NOTIFICAÇÕES PUSH');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      
      if (granted) {
        toast.success('NOTIFICAÇÕES ATIVADAS COM SUCESSO!');
      } else {
        toast.error('PERMISSÃO DE NOTIFICAÇÃO NEGADA');
      }
      
      return granted;
    } catch (error) {
      toast.error('ERRO AO SOLICITAR PERMISSÃO DE NOTIFICAÇÃO');
      return false;
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'is_read' | 'created_at'>) => {
    if (!user) return;

    try {
      // Salvar no banco de dados
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: false,
          action_url: notification.action_url,
          priority: 'normal'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar notificação:', error);
        return;
      }

      const newNotification: Notification = {
        ...data,
        timestamp: new Date(),
        created_at: new Date()
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Mostrar toast
      showNotificationToast(newNotification);

      // Enviar notificação push se permitido
      if (hasPermission && notification.type !== 'info') {
        sendPushNotification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: newNotification.id,
          data: {
            url: notification.action_url
          }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar notificação:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return;
      }

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        return;
      }

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const removeNotification = async (id: string) => {
    if (!user) return;

    try {
      // Remover do banco de dados
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover notificação:', error);
        return;
      }

      // Atualizar estado local
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
    }
  };

  const clearAll = async () => {
    if (!user) return;

    try {
      // Remover todas do banco de dados
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao limpar todas as notificações:', error);
        return;
      }

      // Limpar estado local
      setNotifications([]);
    } catch (error) {
      console.error('Erro ao limpar todas as notificações:', error);
    }
  };

  const sendPushNotification = (title: string, options?: NotificationOptions) => {
    if (!hasPermission || !('Notification' in window)) return;

    try {
      const notification = new Notification(title, options);
      
      // Adicionar evento de clique
      notification.onclick = () => {
        if (options?.data?.url) {
          window.open(options.data.url, '_blank');
        }
        notification.close();
      };
    } catch (error) {
      console.error('Erro ao enviar notificação push:', error);
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestPermission,
    hasPermission,
    sendPushNotification,
    loadNotifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
