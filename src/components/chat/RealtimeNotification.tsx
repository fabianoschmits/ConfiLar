'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { MessageCircle, Bell } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useMessages } from '@/hooks/useMessages'
import { useFloatingChat } from '@/contexts/FloatingChatContext'

export function RealtimeNotification() {
  const { user } = useAuthContext()
  const { conversations, getTotalUnreadCount } = useMessages()
  const { isOpen, openChat, setSelectedConversation } = useFloatingChat()
  const [lastUnreadCount, setLastUnreadCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [lastNotificationConversation, setLastNotificationConversation] = useState<string | null>(null)

  // Calcular total de mensagens não lidas
  const totalUnread = getTotalUnreadCount()

  // Encontrar conversa com mensagens não lidas
  const getConversationWithUnread = () => {
    return conversations.find(conv => conv.unread_count && conv.unread_count > 0)
  }

  // Detectar novas mensagens - apenas atualizar estado, sem toast
  useEffect(() => {
    if (totalUnread > lastUnreadCount && lastUnreadCount > 0) {
      const unreadConversation = getConversationWithUnread()
      
      if (unreadConversation && unreadConversation.id !== lastNotificationConversation) {
        // Nova mensagem recebida - apenas atualizar estado
        setLastNotificationConversation(unreadConversation.id)
      }
    }
    setLastUnreadCount(totalUnread)
  }, [totalUnread, lastUnreadCount, conversations, lastNotificationConversation])

  // Mostrar notificação quando há mensagens não lidas e chat não está aberto
  useEffect(() => {
    if (totalUnread > 0 && !isOpen) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
      setLastNotificationConversation(null)
    }
  }, [totalUnread, isOpen])

  // Função para abrir chat com conversa específica
  const handleOpenChatWithConversation = async () => {
    const unreadConversation = getConversationWithUnread()
    if (unreadConversation) {
      // Primeiro definir a conversa selecionada
      setSelectedConversation(unreadConversation.id)
      // Depois abrir o chat
      await openChat()
      // Esconder a notificação
      setIsVisible(false)
    } else {
      await openChat()
      setIsVisible(false)
    }
  }

  if (!user || !isVisible) return null

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div 
        className="bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 rounded-none cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
        onClick={handleOpenChatWithConversation}
      >
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-black" />
          <span className="font-black text-black text-sm uppercase">
            {totalUnread} MENSAGEM{totalUnread > 1 ? 'S' : ''} NÃO LIDA{totalUnread > 1 ? 'S' : ''}
          </span>
        </div>
        <div className="text-xs text-black font-bold mt-1">
          CLIQUE PARA ABRIR CHAT
        </div>
      </div>
    </div>
  )
}
