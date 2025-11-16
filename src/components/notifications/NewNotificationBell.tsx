'use client'

import React, { useState } from 'react'
import { Bell, X, Check, Trash2 } from 'lucide-react'
import { useNotifications } from './NotificationProviderSimple'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MobileNotificationItem } from './MobileNotificationItem'

export function NewNotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  const { openChat } = useFloatingChat()
  const { user } = useAuthContext()
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

    const metadata = notification.metadata || {};
    const notificationType = notification.type || '';
    const titleLower = (notification.title || '').toLowerCase();
    
    // 1. MENSAGEM - Abrir chat flutuante
    if (notificationType === 'message' || titleLower.includes('mensagem')) {
      const conversationId = metadata.conversation_id || metadata.chat_id;
      const senderId = metadata.sender_id;
      const senderName = metadata.sender_name;
      
      if (conversationId) {
        openChat(conversationId);
      } else if (senderId && senderName) {
        openChat(senderId, senderName);
      } else {
        openChat();
      }
      return;
    }
    
    // 2. LIKE / CURTIDA - Ir para o post
    if (notificationType === 'like' || titleLower.includes('curtida') || metadata.type === 'post_like') {
      const postId = metadata.post_id;
      if (postId) {
        window.location.href = `/feed?post=${postId}`;
        return;
      }
    }
    
    // 3. COMENTÁRIO - Ir para o post
    if (notificationType === 'comment' || titleLower.includes('comentário') || metadata.type === 'post_comment') {
      const postId = metadata.post_id;
      if (postId) {
        window.location.href = `/feed?post=${postId}`;
        return;
      }
    }
    
    // 4. RESPOSTA A COMENTÁRIO - Ir para o post
    if (notificationType === 'reply' || titleLower.includes('resposta') || metadata.type === 'comment_reply') {
      const postId = metadata.post_id;
      if (postId) {
        window.location.href = `/feed?post=${postId}`;
        return;
      }
    }
    
    // 5. MENÇÃO - Ir para o post
    if (notificationType === 'mention' || titleLower.includes('mencionado') || metadata.type === 'mention') {
      const postId = metadata.post_id;
      if (postId) {
        window.location.href = `/feed?post=${postId}`;
        return;
      }
    }
    
    // 6. COMPARTILHAMENTO - Ir para o post compartilhado
    if (notificationType === 'share' || titleLower.includes('compartilhou')) {
      const postId = metadata.post_id;
      if (postId) {
        window.location.href = `/feed?post=${postId}`;
        return;
      }
    }
    
    // 7. AVALIAÇÃO / REVIEW - Ir para página de avaliações
    if (notificationType === 'review' || titleLower.includes('avaliação') || metadata.type === 'review') {
      window.location.href = '/avaliacoes';
      return;
    }
    
    // 8. FAVORITO - Ir para o perfil do usuário
    if (titleLower.includes('favorito') || metadata.type === 'favorite') {
      // Favorito geralmente é sobre o próprio perfil
      if (user?.id) {
        window.location.href = `/perfil/${user.id}`;
        return;
      }
    }
    
    // 9. RECOMENDAÇÃO - Ir para página de reputação
    if (titleLower.includes('recomendação') || metadata.type === 'recommendation') {
      window.location.href = '/reputacao';
      return;
    }
    
    // 10. VISUALIZAÇÃO DE PERFIL - Ir para o perfil
    if (titleLower.includes('visualizou') || metadata.type === 'profile_view') {
      if (user?.id) {
        window.location.href = `/perfil/${user.id}`;
        return;
      }
    }
    
    // 11. SEGUIR / FOLLOW - Ir para o perfil de quem seguiu
    if (notificationType === 'follow' || titleLower.includes('seguir')) {
      const followerId = metadata.follower_id || metadata.user_id;
      if (followerId) {
        window.location.href = `/perfil/${followerId}`;
        return;
      }
    }
    
    // 12. FALLBACK - Usar action_url se disponível
    if (notification.action_url) {
      if (notification.action_url.startsWith('/')) {
        window.location.href = notification.action_url;
      } else if (notification.action_url.startsWith('#')) {
        window.location.hash = notification.action_url;
      } else {
        window.open(notification.action_url, '_blank');
      }
      return;
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
                         notification={{
                           ...notification,
                           created_at: notification.created_at instanceof Date 
                             ? notification.created_at.toISOString() 
                             : notification.created_at
                         }}
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
