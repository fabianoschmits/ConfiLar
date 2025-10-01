import { useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { NotificationService } from '@/services/NotificationService'
import { supabase } from '@/lib/supabase'

/**
 * Hook para notificações relacionadas ao chat
 */
export function useChatNotifications() {
  const { user } = useAuthContext()

  // Notificar nova mensagem
  const notifyNewMessage = useCallback(async (
    recipientId: string,
    messageContent: string,
    chatId?: string
  ) => {
    if (!user) return

    try {
      // Buscar nome do remetente
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      const senderName = profileData?.name || 'Usuário'

      await NotificationService.notifyNewMessage(
        recipientId,
        senderName,
        messageContent,
        chatId
      )
    } catch (error) {
      console.error('Erro ao notificar nova mensagem:', error)
    }
  }, [user])

  // Notificar mensagem não lida
  const notifyUnreadMessage = useCallback(async (
    recipientId: string,
    messageCount: number
  ) => {
    if (!user) return

    try {
      await NotificationService.create({
        user_id: recipientId,
        title: `${messageCount} mensagem${messageCount > 1 ? 'ns' : ''} não lida${messageCount > 1 ? 's' : ''}`,
        message: 'Você tem mensagens não lidas no chat',
        type: 'message',
        priority: 'high',
        action_url: '/chat'
      })
    } catch (error) {
      console.error('Erro ao notificar mensagem não lida:', error)
    }
  }, [user])

  // Notificar status de leitura
  const notifyMessageRead = useCallback(async (
    senderId: string,
    messageId: string
  ) => {
    if (!user) return

    try {
      await NotificationService.create({
        user_id: senderId,
        title: 'Mensagem lida',
        message: 'Sua mensagem foi lida',
        type: 'message',
        priority: 'low',
        action_url: '/chat'
      })
    } catch (error) {
      console.error('Erro ao notificar mensagem lida:', error)
    }
  }, [user])

  return {
    notifyNewMessage,
    notifyUnreadMessage,
    notifyMessageRead
  }
}
