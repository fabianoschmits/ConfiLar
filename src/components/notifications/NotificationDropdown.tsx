'use client';

import React, { useState, useEffect } from 'react';
// Tabler Icons - Estilo Brutalista
import {
  IconBell,
  IconCheck,
  IconTrash,
  IconSettings,
  IconX,
  IconArrowLeft,
  IconMessageCircle,
  IconStar,
  IconCalendar,
  IconShield,
  IconTrophy,
  IconInfoCircle,
  IconAlertTriangle,
  IconLoader2
} from '@tabler/icons-react'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications';
import { useFloatingChat } from '@/contexts/FloatingChatContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import { NotificationPreferencesFallback } from './NotificationPreferencesFallback';

interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  message_notifications: boolean;
  review_notifications: boolean;
  booking_notifications: boolean;
  achievement_notifications: boolean;
  marketing_notifications: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
    case 'review':
      return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
    case 'booking':
      return <div className="w-2 h-2 bg-green-500 rounded-full" />;
    case 'verification':
      return <div className="w-2 h-2 bg-purple-500 rounded-full" />;
    case 'achievement':
      return <div className="w-2 h-2 bg-orange-500 rounded-full" />;
    default:
      return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
  }
};

const formatTimestamp = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
};

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuthContext();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    removeNotification,
    clearAll,
    isLoading 
  } = useSupabaseNotifications();
  
  const { openChat } = useFloatingChat();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    email_enabled: true,
    message_notifications: true,
    review_notifications: true,
    booking_notifications: true,
    achievement_notifications: true,
    marketing_notifications: false,
  });
  const [saving, setSaving] = useState(false);
  const [tableExists, setTableExists] = useState(true);

  const recentNotifications = notifications.slice(0, 8);

  // Carregar preferências do usuário
  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Se a tabela não existe ou há erro de permissão, usar preferências padrão
        if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('relation "notification_preferences" does not exist')) {
          console.log('Tabela notification_preferences não encontrada, usando preferências padrão');
          setTableExists(false);
          return;
        }
        console.error('Erro ao carregar preferências:', error);
        return;
      }

      if (data) {
        setPreferences({
          push_enabled: data.push_enabled ?? true,
          email_enabled: data.email_enabled ?? true,
          message_notifications: data.message_notifications ?? true,
          review_notifications: data.review_notifications ?? true,
          booking_notifications: data.booking_notifications ?? true,
          achievement_notifications: data.achievement_notifications ?? true,
          marketing_notifications: data.marketing_notifications ?? false,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  // Salvar preferências
  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        // Se a tabela não existe, mostrar mensagem específica
        if (error.code === '42P01' || error.message?.includes('relation "notification_preferences" does not exist')) {
          setTableExists(false);
          toast.error('Tabela de preferências não encontrada. Execute o script SQL fornecido.');
          console.error('Tabela notification_preferences não existe. Execute o script fix-notification-preferences.sql');
          return;
        }
        console.error('Erro ao salvar preferências:', error);
        toast.error('Erro ao salvar configurações');
        return;
      }

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id: string) => {
    await removeNotification(id);
    toast.success('Notificação removida');
  };

  const handleClearAll = async () => {
    await clearAll();
    toast.success('Todas as notificações foram removidas');
  };

  // Marcar todas as notificações como lidas quando abrir o dropdown
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Marcar todas as notificações visíveis como lidas quando abrir
      await markAllAsRead();
    }
    // Resetar configurações quando fechar
    if (!open) {
      setShowSettings(false);
    }
  };

  // Lidar com clique em notificação
  const handleNotificationClick = async (notification: { id: string; is_read: boolean; type: string; metadata?: { sender_id?: string; sender_name?: string }; action_url?: string }) => {
    // Marcar como lida se não estiver lida
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Fechar dropdown
    setIsOpen(false);

    // Se for notificação de mensagem, abrir chat
    if (notification.type === 'message' && notification.metadata?.sender_id) {
      const senderId = notification.metadata.sender_id as string;
      const senderName = (notification.metadata.sender_name as string) || 'Usuário';
      openChat(senderId, senderName);
    } else if (notification.action_url) {
      // Para outros tipos de notificação, usar action_url
      window.open(notification.action_url, '_blank');
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 h-10 w-10 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
        >
          <IconBell size={20} stroke={2} />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-xs font-black">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-96 max-h-[500px] overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {showSettings ? (
          tableExists ? (
            <div className="w-96">
              {/* Header das Configurações Brutalista */}
              <div className="flex items-center justify-between p-4 border-b-4 border-black bg-yellow-400">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 h-8 w-8 bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    <IconArrowLeft size={14} stroke={2} />
                  </button>
                  <IconSettings size={16} stroke={2} className="text-black" />
                  <span className="text-sm font-black text-black uppercase">CONFIGURAÇÕES</span>
                </div>
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-black text-white bg-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <IconLoader2 size={12} stroke={2} className="animate-spin" />
                      <span>SALVANDO</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <IconCheck size={12} stroke={2} />
                      <span>SALVAR</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Conteúdo das Configurações Brutalista */}
              <div className="p-4 space-y-6 max-h-80 overflow-y-auto bg-white">
                {/* Canais de Notificação */}
                <div className="space-y-4">
                  <div className="px-3 py-2 bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-sm font-black uppercase">CANAIS DE NOTIFICAÇÃO</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black">
                      <label htmlFor="push_enabled" className="text-sm font-black text-black">NOTIFICAÇÕES PUSH</label>
                      <button
                        id="push_enabled"
                        onClick={() => handleToggle('push_enabled')}
                        className={`w-12 h-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.push_enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.push_enabled ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black">
                      <label htmlFor="email_enabled" className="text-sm font-black text-black">NOTIFICAÇÕES POR EMAIL</label>
                      <button
                        id="email_enabled"
                        onClick={() => handleToggle('email_enabled')}
                        className={`w-12 h-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.email_enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.email_enabled ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Separador Brutalista */}
                <div className="h-2 bg-black border-2 border-black"></div>

                {/* Tipos de Notificação */}
                <div className="space-y-4">
                  <div className="px-3 py-2 bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-sm font-black uppercase">TIPOS DE NOTIFICAÇÃO</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black">
                      <label htmlFor="message_notifications" className="text-sm font-black text-black">MENSAGENS</label>
                      <button
                        id="message_notifications"
                        onClick={() => handleToggle('message_notifications')}
                        className={`w-12 h-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.message_notifications ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.message_notifications ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black">
                      <label htmlFor="review_notifications" className="text-sm font-black text-black">AVALIAÇÕES</label>
                      <button
                        id="review_notifications"
                        onClick={() => handleToggle('review_notifications')}
                        className={`w-12 h-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.review_notifications ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.review_notifications ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black">
                      <label htmlFor="booking_notifications" className="text-sm font-black text-black">AGENDAMENTOS</label>
                      <button
                        id="booking_notifications"
                        onClick={() => handleToggle('booking_notifications')}
                        className={`w-12 h-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.booking_notifications ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.booking_notifications ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black">
                      <label htmlFor="achievement_notifications" className="text-sm font-black text-black">CONQUISTAS</label>
                      <button
                        id="achievement_notifications"
                        onClick={() => handleToggle('achievement_notifications')}
                        className={`w-12 h-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.achievement_notifications ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.achievement_notifications ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black">
                      <label htmlFor="marketing_notifications" className="text-sm font-black text-black">MARKETING</label>
                      <button
                        id="marketing_notifications"
                        onClick={() => handleToggle('marketing_notifications')}
                        className={`w-12 h-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.marketing_notifications ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          preferences.marketing_notifications ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <NotificationPreferencesFallback onBack={() => setShowSettings(false)} />
          )
        ) : (
          <>
            {/* Header das Notificações Brutalista */}
            <div className="flex items-center justify-between p-4 border-b-4 border-black bg-yellow-400">
              <div className="flex items-center gap-3">
                <IconBell size={16} stroke={2} className="text-black" />
                <span className="text-sm font-black text-black uppercase">NOTIFICAÇÕES</span>
                {unreadCount > 0 && (
                  <div className="px-2 py-1 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black">
                    {unreadCount} NÃO LIDAS
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 h-8 w-8 bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                >
                  <IconSettings size={16} stroke={2} />
                </button>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-2 h-8 w-8 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    <IconTrash size={16} stroke={2} />
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Notificações Brutalista */}
            <div className="max-h-80 overflow-y-auto bg-white">
              {isLoading ? (
                <div className="text-center py-8 bg-gray-100 border-2 border-black m-4">
                  <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-black text-black uppercase">CARREGANDO NOTIFICAÇÕES...</p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8 bg-gray-100 border-2 border-black m-4">
                  <IconBell size={32} stroke={2} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-sm font-black text-black uppercase">NENHUMA NOTIFICAÇÃO</p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {recentNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={cn(
                          "flex items-start gap-3 p-4 cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all",
                          !notification.is_read ? "bg-blue-100" : "bg-gray-100"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getNotificationIcon(notification.type)}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "text-sm font-black line-clamp-2 uppercase",
                                !notification.is_read && "text-blue-900"
                              )}>
                                {notification.title}
                              </h4>
                              <span className="text-xs font-black text-gray-700 whitespace-nowrap ml-2">
                                {formatTimestamp(notification.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-xs font-bold text-gray-800 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <button
                              className="p-1 h-6 w-6 bg-green-500 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <IconCheck size={12} stroke={2} />
                            </button>
                          )}
                          
                          <button
                            className="p-1 h-6 w-6 bg-red-500 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                          >
                            <IconX size={12} stroke={2} />
                          </button>
                        </div>
                      </div>
                      
                      {index < recentNotifications.length - 1 && (
                        <div className="h-1 bg-black mx-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Brutalista */}
            {notifications.length > 0 && (
              <div className="p-4 border-t-4 border-black bg-yellow-400">
                <div className="flex items-center justify-between gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="px-4 py-2 text-xs font-black text-white bg-green-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <IconCheck size={12} stroke={2} />
                        <span>MARCAR TODAS COMO LIDAS</span>
                      </div>
                    </button>
                  )}
                  
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 text-xs font-black text-white bg-red-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ml-auto"
                  >
                    <div className="flex items-center gap-2">
                      <IconTrash size={12} stroke={2} />
                      <span>LIMPAR TODAS</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
