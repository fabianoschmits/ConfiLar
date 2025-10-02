'use client'

import React, { useState } from 'react'
import { Bell, X, Check, Trash2 } from 'lucide-react'
import { useNotifications } from './NotificationProviderSimple'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export function NewNotificationBell() {
  const { notifications, unreadCount, markAsRead, removeNotification, clearAll } = useNotifications()
  const { openChat } = useFloatingChat()
  const [isOpen, setIsOpen] = useState(false)

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida
    await markAsRead(notification.id)

    // Se for mensagem, abrir chat
    if (notification.type === 'message' && notification.metadata?.conversation_id) {
      openChat(notification.metadata.conversation_id)
    } else if (notification.type === 'message' && notification.metadata?.sender_id) {
      const senderId = notification.metadata.sender_id
      const senderName = notification.metadata.sender_name || 'Usuário'
      openChat(senderId, senderName)
    } else if (notification.action_url) {
      // Para outros tipos, navegar para a URL
      if (notification.action_url.startsWith('/')) {
        window.location.href = notification.action_url
      } else {
        window.open(notification.action_url, '_blank')
      }
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬'
      case 'favorite': return '❤️'
      case 'recommendation': return '⭐'
      case 'review': return '⭐'
      case 'system': return '🔔'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600'
      case 'favorite': return 'text-red-600'
      case 'recommendation': return 'text-yellow-600'
      case 'review': return 'text-yellow-600'
      case 'system': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-3 sm:p-2">
          <Bell className="h-6 w-6 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-6 w-6 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notificações</span>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-xs"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar todas
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhuma notificação</p>
              <p className="text-sm text-gray-400">Você receberá notificações aqui</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                    !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium text-sm ${getNotificationColor(notification.type)}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notification.id)
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
