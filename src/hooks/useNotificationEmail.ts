'use client'

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface EmailNotificationData {
  to: string
  subject: string
  template: 'message' | 'recommendation'
  data: {
    userName: string
    senderName: string
    senderNameInitial: string
    senderType: string
    messagePreview?: string
    messageTime?: string
    chatUrl?: string
    profileUrl?: string
  }
}

export function useNotificationEmail() {
  const sendEmailNotification = useCallback(async (notificationData: EmailNotificationData) => {
    try {
      console.log('📧 Enviando notificação por email:', notificationData.template)
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: notificationData
      })

      if (error) {
        console.error('❌ Erro ao enviar email:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Email enviado com sucesso:', data)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    }
  }, [])

  const sendMessageNotification = useCallback(async (
    recipientEmail: string,
    recipientName: string,
    senderName: string,
    senderType: 'client' | 'professional',
    messagePreview: string,
    messageTime: string
  ) => {
    const notificationData: EmailNotificationData = {
      to: recipientEmail,
      subject: `💬 Nova mensagem de ${senderName} - ConfiLar`,
      template: 'message',
      data: {
        userName: recipientName,
        senderName,
        senderNameInitial: senderName.charAt(0).toUpperCase(),
        senderType: senderType === 'professional' ? 'Profissional' : 'Cliente',
        messagePreview,
        messageTime,
        chatUrl: `${window.location.origin}/mensagens`
      }
    }

    return await sendEmailNotification(notificationData)
  }, [sendEmailNotification])

  const sendRecommendationNotification = useCallback(async (
    recipientEmail: string,
    recipientName: string,
    senderName: string,
    senderType: 'client' | 'professional'
  ) => {
    const notificationData: EmailNotificationData = {
      to: recipientEmail,
      subject: `👍 Nova recomendação de ${senderName} - ConfiLar`,
      template: 'recommendation',
      data: {
        userName: recipientName,
        senderName,
        senderNameInitial: senderName.charAt(0).toUpperCase(),
        senderType: senderType === 'professional' ? 'Profissional' : 'Cliente',
        profileUrl: `${window.location.origin}/perfil`
      }
    }

    return await sendEmailNotification(notificationData)
  }, [sendEmailNotification])

  return {
    sendEmailNotification,
    sendMessageNotification,
    sendRecommendationNotification
  }
}
