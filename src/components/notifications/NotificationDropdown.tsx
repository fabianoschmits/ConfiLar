'use client';

import React, { useState, useEffect } from 'react';
// Lucide React Icons - Tema Moderno
import {
  Bell,
  Check,
  Trash2,
  Settings,
  X,
  ArrowLeft,
  MessageCircle,
  Star,
  Calendar,
  Shield,
  Trophy,
  Info,
  AlertTriangle,
  Loader2,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications';
import { useMessages } from '@/hooks/useMessages';
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';
// import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'; // Desabilitado temporariamente
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
  message_notifications: boolean;
  review_notifications: boolean;
  system_notifications: boolean;
  info_notifications: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageCircle className="h-4 w-4 text-blue-600" />;
    case 'review':
      return <Star className="h-4 w-4 text-yellow-600" />;
    case 'booking':
      return <Calendar className="h-4 w-4 text-green-600" />;
    case 'verification':
      return <Shield className="h-4 w-4 text-purple-600" />;
    case 'achievement':
      return <Trophy className="h-4 w-4 text-orange-600" />;
    case 'info':
      return <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
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
  
  // Usar o novo hook de tempo real
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    removeNotification,
    clearAll,
    isLoading
  } = useSupabaseNotifications();
  
  // Desabilitado temporariamente para evitar conflitos
  const isConnected = false;
  const addTestNotification = (title: string, message: string, type: string) => {
    console.log('Teste de notificação desabilitado:', { title, message, type });
  };
  
  // Hook para monitorar conexão em tempo real (manter para indicadores visuais)
  const { isConnected: isRealtimeConnected, isConnecting, lastActivity, connectionError } = useRealtimeConnection();
  
  // Usar o mesmo sistema do chat flutuante para mensagens
  const { conversations, getTotalUnreadCount } = useMessages();
  const { openChat } = useFloatingChat();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [visualUnreadCount, setVisualUnreadCount] = useState(0);
  
  // O novo hook já gerencia tudo, incluindo mensagens
  const displayUnreadCount = unreadCount;
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    message_notifications: true,
    review_notifications: true,
    system_notifications: true,
    info_notifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [tableExists, setTableExists] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const recentNotifications = notifications
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

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
          message_notifications: data.message_notifications ?? true,
          review_notifications: data.review_notifications ?? true,
          system_notifications: data.system_notifications ?? true,
          info_notifications: data.info_notifications ?? true,
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

  // Gerenciar contador visual
  useEffect(() => {
    if (!isOpen) {
      setVisualUnreadCount(displayUnreadCount);
    }
  }, [displayUnreadCount, isOpen]);


  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id: string) => {
    await removeNotification(id);
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  // Gerenciar abertura/fechamento do dropdown
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    setSelectedIndex(-1); // Resetar seleção
    
    if (open) {
      // Quando abrir o menu, resetar o contador visualmente
      // Não marcar como lidas automaticamente - só quando usuário clicar explicitamente
      setVisualUnreadCount(0);
      console.log('🔔 Menu de notificações aberto - contador resetado visualmente');
    } else {
      // Quando fechar, restaurar o contador real
      setVisualUnreadCount(displayUnreadCount);
    }
    
    // Resetar configurações quando fechar
    if (!open) {
      setShowSettings(false);
    }
  };

  // Lidar com clique em notificação
  const handleNotificationClick = async (notification: { id: string; is_read: boolean; type: string; metadata?: { sender_id?: string; sender_name?: string; conversation_id?: string }; action_url?: string }) => {
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
      
      // Se tiver conversation_id, usar ele para abrir a conversa específica
      if (notification.metadata.conversation_id) {
        // Para conversation_id, não passar userName para que seja tratado como conversationId
        openChat(notification.metadata.conversation_id);
      } else {
        openChat(senderId, senderName);
      }
    } else if (notification.action_url) {
      // Para outros tipos de notificação, usar action_url
      window.open(notification.action_url, '_blank');
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key];
    
    // Atualizar estado local imediatamente
    setPreferences(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Salvar automaticamente no banco sem notificação
    if (user && tableExists) {
      try {
        setSaving(true);
        
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            [key]: newValue,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Erro ao salvar preferência:', error);
          // Reverter estado local em caso de erro
          setPreferences(prev => ({
            ...prev,
            [key]: !newValue
          }));
        }
      } catch (error) {
        console.error('Erro ao salvar preferência:', error);
        // Reverter estado local em caso de erro
        setPreferences(prev => ({
          ...prev,
          [key]: !newValue
        }));
      } finally {
        setSaving(false);
      }
    }
  };

  // Hook para gerenciar teclas de seleção
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (showSettings) {
            // Navegar pelas configurações
            const settingsItems = ['push_enabled', 'message_notifications', 'review_notifications', 'system_notifications', 'info_notifications'];
            setSelectedIndex(prev => Math.min(prev + 1, settingsItems.length - 1));
          } else {
            // Navegar pelas notificações
            setSelectedIndex(prev => Math.min(prev + 1, recentNotifications.length - 1));
          }
          break;
        
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
          break;
        
        case 'Enter':
          event.preventDefault();
          if (showSettings) {
            // Alternar configuração selecionada
            const settingsKeys: (keyof NotificationPreferences)[] = ['push_enabled', 'message_notifications', 'review_notifications', 'system_notifications', 'info_notifications'];
            if (selectedIndex >= 0 && selectedIndex < settingsKeys.length) {
              handleToggle(settingsKeys[selectedIndex]);
            }
          } else if (selectedIndex >= 0 && selectedIndex < recentNotifications.length) {
            // Abrir notificação selecionada
            handleNotificationClick(recentNotifications[selectedIndex]);
          }
          break;
        
        case 'Escape':
          event.preventDefault();
          if (showSettings) {
            setShowSettings(false);
            setSelectedIndex(-1);
          } else {
            setIsOpen(false);
            setSelectedIndex(-1);
          }
          break;
        
        case 's':
        case 'S':
          if (!showSettings) {
            event.preventDefault();
            setShowSettings(true);
            setSelectedIndex(0);
          }
          break;
        
        case 'c':
        case 'C':
          if (!showSettings && recentNotifications.length > 0) {
            event.preventDefault();
            handleClearAll();
          }
          break;
        
        case 'm':
        case 'M':
          if (!showSettings && displayUnreadCount > 0) {
            event.preventDefault();
            handleMarkAllAsRead();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSettings, selectedIndex, recentNotifications, displayUnreadCount, handleToggle, handleNotificationClick, handleClearAll, handleMarkAllAsRead]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-1 h-6 w-6 bg-white dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 rounded-lg"
        >
          <Bell size={14} className="text-gray-600 dark:text-gray-400" />
          
          {/* Indicador de conexão em tempo real */}
          {isConnecting && (
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-yellow-500 rounded-full border border-white shadow-sm animate-pulse" 
                 title="Conectando..." />
          )}
          {isConnected && !isConnecting && (
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-white shadow-sm animate-pulse" 
                 title="Notificações em tempo real ativas" />
          )}
          {!isConnected && !isConnecting && (
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full border border-white shadow-sm" 
                 title="Conexão perdida" />
          )}
          
          {/* Contador de notificações não lidas */}
          {(isOpen ? visualUnreadCount : displayUnreadCount) > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-semibold shadow-md animate-pulse">
              {(isOpen ? visualUnreadCount : displayUnreadCount) > 99 ? '99+' : (isOpen ? visualUnreadCount : displayUnreadCount)}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 sm:w-96 max-h-[80vh] overflow-hidden bg-white dark:bg-gray-800/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 dark:border-gray-700 shadow-xl rounded-xl mx-2 sm:mx-0 flex flex-col"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {showSettings ? (
          tableExists ? (
            <div className="w-full">
              {/* Header das Configurações Moderno */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8 bg-white dark:bg-gray-800 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-400 border border-gray-200 dark:border-gray-700 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-all duration-200 rounded-lg"
                  >
                    <ArrowLeft size={12} className="sm:w-3.5 sm:h-3.5" />
                  </button>
                  <Settings size={14} className="text-gray-600 dark:text-gray-400 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Configurações</span>
                </div>
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-blue-600 shadow-sm hover:shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 rounded-lg"
                >
                  {saving ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Loader2 size={10} className="animate-spin sm:w-3 sm:h-3" />
                      <span>Salvando</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Check size={10} className="sm:w-3 sm:h-3" />
                      <span>Salvar</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Conteúdo das Configurações Moderno */}
              <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 max-h-80 overflow-y-auto bg-white dark:bg-gray-800">
                {/* Canais de Notificação */}
                <div className="space-y-4">
                  <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                    <h4 className="text-xs sm:text-sm font-semibold text-blue-900">Canais de Notificação</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <label htmlFor="push_enabled" className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Notificações Push</label>
                      <div className="flex items-center gap-2">
                        {saving && <Loader2 size={12} className="text-gray-400 animate-spin sm:w-3.5 sm:h-3.5" />}
                      <button
                        onClick={() => handleToggle('push_enabled')}
                          disabled={saving}
                          className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            preferences.push_enabled ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${
                              preferences.push_enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                            }`}
                          />
                      </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separador Moderno */}
                <div className="h-px bg-gray-200"></div>

                {/* Tipos de Notificação */}
                <div className="space-y-4">
                  <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                    <h4 className="text-xs sm:text-sm font-semibold text-green-900">Tipos de Notificação</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <label htmlFor="message_notifications" className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Mensagens</label>
                      <div className="flex items-center gap-2">
                        {saving && <Loader2 size={12} className="text-gray-400 animate-spin sm:w-3.5 sm:h-3.5" />}
                      <button
                        onClick={() => handleToggle('message_notifications')}
                          disabled={saving}
                          className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            preferences.message_notifications ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${
                              preferences.message_notifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                            }`}
                          />
                      </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <label htmlFor="review_notifications" className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Avaliações</label>
                      <div className="flex items-center gap-2">
                        {saving && <Loader2 size={12} className="text-gray-400 animate-spin sm:w-3.5 sm:h-3.5" />}
                      <button
                        onClick={() => handleToggle('review_notifications')}
                          disabled={saving}
                          className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            preferences.review_notifications ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${
                              preferences.review_notifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                            }`}
                          />
                      </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <label htmlFor="system_notifications" className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Sistema</label>
                      <div className="flex items-center gap-2">
                        {saving && <Loader2 size={12} className="text-gray-400 animate-spin sm:w-3.5 sm:h-3.5" />}
                        <button
                          onClick={() => handleToggle('system_notifications')}
                          disabled={saving}
                          className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            preferences.system_notifications ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${
                              preferences.system_notifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <label htmlFor="info_notifications" className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Informações</label>
                      <div className="flex items-center gap-2">
                        {saving && <Loader2 size={12} className="text-gray-400 animate-spin sm:w-3.5 sm:h-3.5" />}
                        <button
                          onClick={() => handleToggle('info_notifications')}
                          disabled={saving}
                          className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            preferences.info_notifications ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${
                              preferences.info_notifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
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
            {/* Header das Notificações Moderno - Fixo */}
            <div className="flex items-center justify-between px-1.5 py-1 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex-shrink-0">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  <Bell size={8} className="text-blue-600 dark:text-blue-400" />
                  {/* Indicador de conexão em tempo real */}
                  {isConnecting && (
                    <div className="h-1 w-1 bg-yellow-500 rounded-full animate-pulse" 
                         title="Conectando..." />
                  )}
                  {isConnected && !isConnecting && (
                    <div className="h-1 w-1 bg-green-500 rounded-full animate-pulse" 
                         title="Notificações em tempo real ativas" />
                  )}
                  {!isConnected && !isConnecting && (
                    <div className="h-1 w-1 bg-red-500 rounded-full" 
                         title="Conexão perdida" />
                  )}
                </div>
                <span className="text-[8px] font-semibold text-gray-900 dark:text-white">Notificações</span>
                {(isOpen ? visualUnreadCount : displayUnreadCount) > 0 && (
                  <Badge variant="destructive" className="text-[7px] px-0.5 py-0 h-3">
                    {isOpen ? visualUnreadCount : displayUnreadCount} não lidas
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                {/* Botão de teste para notificações em tempo real */}
                <button
                  onClick={() => addTestNotification(
                    'Teste de Notificação',
                    'Esta é uma notificação de teste para verificar o sistema em tempo real.',
                    'info'
                  )}
                  className="p-0.5 h-3 w-3 bg-blue-500 text-white border border-blue-600 shadow-sm hover:shadow-md hover:bg-blue-600 transition-all duration-200 rounded"
                  title="Testar notificação em tempo real"
                >
                  <Bell size={6} />
                </button>
                
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-0.5 h-3 w-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 rounded"
                  title="Configurações (S)"
                >
                  <Settings size={6} />
                </button>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-0.5 h-3 w-3 bg-red-500 text-white border border-red-600 shadow-sm hover:shadow-md hover:bg-red-600 transition-all duration-200 rounded"
                    title="Limpar todas (C)"
                  >
                    <Trash2 size={6} />
                  </button>
                )}
              </div>
            </div>

            {/* Instruções de Teclado - Fixo */}
                  <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600 dark:text-gray-400 gap-2 sm:gap-0">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="flex items-center gap-1">
                          <kbd className="px-1 sm:px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                          <span className="hidden sm:inline">Navegar</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="px-1 sm:px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Enter</kbd>
                          <span className="hidden sm:inline">Selecionar</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="px-1 sm:px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">S</kbd>
                          <span className="hidden sm:inline">Configurações</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        {(isOpen ? visualUnreadCount : displayUnreadCount) > 0 && (
                          <span className="flex items-center gap-1">
                            <kbd className="px-1 sm:px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">M</kbd>
                            <span className="hidden sm:inline">Marcar todas</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <kbd className="px-1 sm:px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Esc</kbd>
                          <span className="hidden sm:inline">Fechar</span>
                        </span>
                      </div>
                    </div>
                  </div>

            {/* Lista de Notificações Moderna - Com scroll */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 min-h-0">
              {isLoading ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 m-4 rounded-lg">
                  <Loader2 size={32} className="mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carregando notificações...</p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 m-4 rounded-lg">
                  <Bell size={32} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {recentNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={cn(
                          "flex items-start gap-3 p-3 cursor-pointer border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg",
                          !notification.is_read ? "bg-blue-50 border-blue-200" : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800",
                          selectedIndex === index && "ring-2 ring-blue-500 bg-blue-50"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getNotificationIcon(notification.type)}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "text-sm font-semibold line-clamp-2",
                                !notification.is_read && "text-blue-900"
                              )}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                {formatTimestamp(notification.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <button
                              className="p-0 h-3 w-3 bg-green-500 text-white rounded-sm hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              title="Marcar como lida"
                            >
                              <Check size={8} />
                            </button>
                          )}
                          
                          <button
                            className="p-0 h-3 w-3 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            title="Remover notificação"
                          >
                            <Trash2 size={8} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Moderno - Fixo no final */}
            {notifications.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 sticky bottom-0">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                  {/* Contador fixo */}
                  <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2">
                    {(isOpen ? visualUnreadCount : displayUnreadCount) > 0 && (
                      <Badge variant="destructive" className="text-xs px-2 py-1">
                        {(isOpen ? visualUnreadCount : displayUnreadCount) > 99 ? '99+' : (isOpen ? visualUnreadCount : displayUnreadCount)} não lidas
                      </Badge>
                    )}
                  </div>
                  
                  <div className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                    {(isOpen ? visualUnreadCount : displayUnreadCount) > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-500 text-white border border-green-600 shadow-sm hover:shadow-md hover:bg-green-600 transition-all duration-200 rounded-lg text-xs sm:text-sm font-medium"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Check size={10} className="sm:w-3 sm:h-3" />
                          <span>Marcar todas como lidas</span>
                        </div>
                      </button>
                    )}
                    
                    <button
                      onClick={handleClearAll}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-500 text-white border border-red-600 shadow-sm hover:shadow-md hover:bg-red-600 transition-all duration-200 rounded-lg text-xs sm:text-sm font-medium"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Trash2 size={10} className="sm:w-3 sm:h-3" />
                        <span>Limpar todas</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
