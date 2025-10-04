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
import { MobileNotificationItem } from './MobileNotificationItem'

export function NewNotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  const { openChat } = useFloatingChat()
  const [isOpen, setIsOpen] = useState(false)

  // Marcar todas como lidas ao fechar o menu
  const handleClose = () => {
    if (unreadCount > 0) {
      markAllAsRead()
    }
    setIsOpen(false)
  }

  // Função para deletar notificação individual
  const handleDeleteNotification = async (notificationId: string, notificationTitle: string) => {
    try {
      await removeNotification(notificationId)
      // Toast será mostrado pelo provider
    } catch (error) {
      console.error('Erro ao remover notificação:', error)
    }
  }

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


  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose()
      } else {
        setIsOpen(true)
      }
    }}>
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
                <MobileNotificationItem
                  key={notification.id}
                  notification={notification}
                  onDelete={handleDeleteNotification}
                  onMarkAsRead={markAsRead}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
