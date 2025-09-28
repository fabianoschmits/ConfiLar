'use client'

import { useEffect, useCallback } from 'react'
// import { useContactAgreements } from '@/hooks/useContactAgreements' // Removido - sistema antigo
import { useAuthContext } from '@/contexts/AuthContext'

export function useReviewNotificationMonitor() {
  // Hook desabilitado - sistema antigo removido
  // const { profile } = useAuthContext()
  // const { agreements, createReviewAvailableNotification } = useContactAgreements()

  // const checkForAvailableReviews = useCallback(async () => {
  //   if (!profile?.id || !agreements.length) return

  //   const now = new Date()
    
  //   for (const agreement of agreements) {
  //     // Verificar se o acordo está aceito e tem data de avaliação disponível
  //     if (agreement.status === 'accepted' && agreement.review_available_at) {
  //       const reviewAvailableAt = new Date(agreement.review_available_at)
        
  //       // Verificar se o tempo acabou agora (com margem de 1 minuto)
  //       const timeDiff = now.getTime() - reviewAvailableAt.getTime()
  //       const oneMinute = 60 * 1000
        
  //       if (timeDiff >= 0 && timeDiff <= oneMinute) {
  //         // Verificar se já foi notificado (usando localStorage)
  //         const notificationKey = `review_notified_${agreement.id}`
  //         const alreadyNotified = localStorage.getItem(notificationKey)
        
  //         if (!alreadyNotified) {
  //           console.log('🎯 Tempo de avaliação expirou para acordo:', agreement.id)
        
  //           // Enviar notificação
  //           await createReviewAvailableNotification(agreement)
        
  //           // Marcar como notificado
  //           localStorage.setItem(notificationKey, 'true')
  //         }
  //       }
  //     }
  //   }
  // }, [profile?.id, agreements, createReviewAvailableNotification])

  // useEffect(() => {
  //   if (!profile?.id) return

  //   // Verificar imediatamente
  //   checkForAvailableReviews()

  //   // Verificar a cada minuto
  //   const interval = setInterval(checkForAvailableReviews, 60000)

  //   return () => clearInterval(interval)
  // }, [checkForAvailableReviews])

  // return {
  //   checkForAvailableReviews
  // }
}
