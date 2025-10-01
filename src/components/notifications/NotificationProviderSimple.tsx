'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';

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

export const NotificationProviderSimple: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  console.log('🔔 NotificationProviderSimple: Renderizando com user:', user?.id || 'null');

  // Carregar notificações do banco de dados
  const loadNotifications = async () => {
    try {
      if (!user) {
        console.log('🔔 NotificationProviderSimple: Usuário não autenticado, pulando carregamento')
        return;
      }

      console.log('🔔 NotificationProviderSimple: Carregando notificações para usuário:', user.id)

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Erro ao carregar notificações:', error);
        return;
      }

      console.log(`🔔 NotificationProviderSimple: ${data?.length || 0} notificações carregadas`)

      const formattedNotifications = data?.map(notification => ({
        ...notification,
        timestamp: new Date(notification.created_at),
        created_at: new Date(notification.created_at),
      })) || [];

      setNotifications(formattedNotifications);
      
      const unreadCount = formattedNotifications.filter(n => !n.is_read).length
      console.log(`🔔 NotificationProviderSimple: ${unreadCount} notificações não lidas`)
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
    }
  };

  // Adicionar notificação
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'is_read' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      is_read: false,
      created_at: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Mostrar toast
    toast(notification.title, {
      description: notification.message,
    });
  };

  // Marcar como lida
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  // Remover notificação
  const removeNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover notificação:', error);
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
    }
  };

  // Limpar todas
  const clearAll = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Erro ao limpar notificações:', error);
        return;
      }

      setNotifications([]);
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  };

  // Solicitar permissão para notificações
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações');
      return false;
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true);
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setHasPermission(granted);
    return granted;
  };

  // Enviar notificação push
  const sendPushNotification = (title: string, options?: NotificationOptions) => {
    if (!hasPermission) {
      console.warn('Permissão para notificações não concedida');
      return;
    }

    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });
  };

  // Atualizar notificações
  const refreshNotifications = async () => {
    await loadNotifications();
  };

  // Calcular contagem de não lidas
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Carregar notificações na inicialização e quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      console.log('🔔 NotificationProviderSimple: Usuário disponível, carregando notificações')
      loadNotifications();
    }
  }, [user]);

  // Configurar realtime para notificações
  useEffect(() => {
    if (!user) return

    console.log('🔔 Configurando realtime para notificações do usuário:', user.id)

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Nova notificação recebida via realtime:', payload.new)
          const newNotification = payload.new as Notification
          
          // Adicionar nova notificação ao estado
          setNotifications(prev => [newNotification, ...prev])
          
          // Mostrar toast para nova notificação
          toast(newNotification.title, {
            description: newNotification.message,
            action: newNotification.action_url ? {
              label: 'Ver',
              onClick: () => {
                if (newNotification.action_url?.startsWith('#')) {
                  // Se for um fragmento (como #chat), não abrir em nova aba
                  window.location.hash = newNotification.action_url
                } else {
                  window.open(newNotification.action_url, '_blank')
                }
              }
            } : undefined
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notificação atualizada via realtime:', payload.new)
          const updatedNotification = payload.new as Notification
          
          // Atualizar notificação no estado
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === updatedNotification.id ? updatedNotification : notification
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notificação deletada via realtime:', payload.old)
          const deletedNotification = payload.old as Notification
          
          // Remover notificação do estado
          setNotifications(prev => 
            prev.filter(notification => notification.id !== deletedNotification.id)
          )
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      console.log('🔔 Desconectando realtime de notificações')
      channel.unsubscribe()
    }
  }, [user])

  // Verificar permissão na inicialização
  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

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











