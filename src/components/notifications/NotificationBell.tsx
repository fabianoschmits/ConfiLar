'use client';

import React, { useState } from 'react';
import { Bell, Check, Trash2, Settings } from 'lucide-react';
import { Bell as BellPhosphor, Check as CheckPhosphor, Trash as TrashPhosphor, Gear } from '@phosphor-icons/react';
import { useNotifications, Notification } from './NotificationProviderSimple';
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple';
import { NotificationSettingsInline } from './NotificationSettingsInline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  
  return timestamp.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
};

export const NotificationBell: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    // isConnected removido - não existe no contexto 
  } = useNotifications();
  
  const { openChat } = useFloatingChat();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const recentNotifications = notifications.slice(0, 5);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
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
  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como lida se não estiver lida
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Fechar dropdown
    setIsOpen(false);

    // Para notificações com action_url, abrir a URL
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
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
        className="w-80 max-h-96 overflow-y-auto"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {showSettings ? (
          <NotificationSettingsInline onBack={() => setShowSettings(false)} />
        ) : (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Notificações</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} não lidas
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Settings size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>

        <CardContent className="p-0">
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <DropdownMenuItem
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
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>

                    {!notification.is_read && (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2 bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </DropdownMenuItem>
                  
                  {index < recentNotifications.length - 1 && (
                    <Separator className="mx-3" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="p-3 border-t">
          <div className="flex items-center justify-between gap-2">
            {unreadCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-8 bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
            
          </div>
        </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
