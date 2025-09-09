'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Settings, X, ArrowLeft } from 'lucide-react';
import { Bell as BellPhosphor, Check as CheckPhosphor, Trash as TrashPhosphor, Gear } from '@phosphor-icons/react';
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
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100"
        >
          <BellPhosphor size={20} weight="light" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-96 max-h-[500px] overflow-hidden"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {showSettings ? (
          tableExists ? (
            <div className="w-96">
              {/* Header das Configurações */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <Settings size={16} />
                  <span className="text-sm font-medium">Configurações</span>
                </div>
                <Button
                  size="sm"
                  onClick={savePreferences}
                  disabled={saving}
                  className="h-8 text-xs"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Check size={12} className="mr-1" />
                  )}
                  Salvar
                </Button>
              </div>

              {/* Conteúdo das Configurações */}
              <div className="p-3 space-y-4 max-h-80 overflow-y-auto">
                {/* Canais de Notificação */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Canais de Notificação</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push_enabled" className="text-sm">Notificações Push</Label>
                    <Switch
                      id="push_enabled"
                      checked={preferences.push_enabled}
                      onCheckedChange={() => handleToggle('push_enabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_enabled" className="text-sm">Notificações por Email</Label>
                    <Switch
                      id="email_enabled"
                      checked={preferences.email_enabled}
                      onCheckedChange={() => handleToggle('email_enabled')}
                    />
                  </div>
                </div>

                <Separator />

                {/* Tipos de Notificação */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Tipos de Notificação</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message_notifications" className="text-sm">Mensagens</Label>
                    <Switch
                      id="message_notifications"
                      checked={preferences.message_notifications}
                      onCheckedChange={() => handleToggle('message_notifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="review_notifications" className="text-sm">Avaliações</Label>
                    <Switch
                      id="review_notifications"
                      checked={preferences.review_notifications}
                      onCheckedChange={() => handleToggle('review_notifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="booking_notifications" className="text-sm">Agendamentos</Label>
                    <Switch
                      id="booking_notifications"
                      checked={preferences.booking_notifications}
                      onCheckedChange={() => handleToggle('booking_notifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="achievement_notifications" className="text-sm">Conquistas</Label>
                    <Switch
                      id="achievement_notifications"
                      checked={preferences.achievement_notifications}
                      onCheckedChange={() => handleToggle('achievement_notifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketing_notifications" className="text-sm">Marketing</Label>
                    <Switch
                      id="marketing_notifications"
                      checked={preferences.marketing_notifications}
                      onCheckedChange={() => handleToggle('marketing_notifications')}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <NotificationPreferencesFallback onBack={() => setShowSettings(false)} />
          )
        ) : (
          <>
            {/* Header das Notificações */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <Bell size={16} />
                <span className="text-sm font-medium">Notificações</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} não lidas
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="h-8 w-8 p-0"
                >
                  <Settings size={16} />
                </Button>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm mt-2">Carregando notificações...</p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={cn(
                          "flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50",
                          !notification.is_read && "bg-blue-50"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getNotificationIcon(notification.type)}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "text-sm font-medium line-clamp-2",
                                !notification.is_read && "font-semibold"
                              )}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {formatTimestamp(notification.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {index < recentNotifications.length - 1 && (
                        <Separator className="mx-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <div className="flex items-center justify-between gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs h-8"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Marcar todas como lidas
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs h-8 ml-auto"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Limpar todas
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
