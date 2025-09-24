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
      // Abrir chat diretamente com a conversa específica
      console.log('🔔 Abrindo chat com conversa específica:', unreadConversation.id)
      await openChat(unreadConversation.id)
      // Esconder a notificação
      setIsVisible(false)
    } else {
      // Abrir lista de conversas
      await openChat()
      setIsVisible(false)
    }
  }

  if (!user || !isVisible) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-right-5 duration-300">
      <div 
        className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-4 cursor-pointer hover:shadow-xl hover:bg-white transition-all duration-200 max-w-xs"
        onClick={handleOpenChatWithConversation}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">
                {totalUnread} nova{totalUnread > 1 ? 's' : ''} mensagem{totalUnread > 1 ? 's' : ''}
              </span>
              {totalUnread > 0 && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Toque para abrir o chat
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
