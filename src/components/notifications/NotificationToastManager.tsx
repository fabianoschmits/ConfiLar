'use client'

import React, { useEffect, useRef } from 'react'
import { useNotifications } from './NotificationProviderSimple'
import { NotificationToast, useNotificationToast } from './NotificationToast'

export function NotificationToastManager() {
  const { notifications } = useNotifications()
  const { toasts, addToast, removeToast } = useNotificationToast()
  const lastNotificationId = useRef<string | null>(null)

  // Detectar novas notificações
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0]
      
      // Verificar se é uma notificação nova (diferente da última)
      if (latestNotification.id !== lastNotificationId.current) {
        lastNotificationId.current = latestNotification.id
        
        // Verificar se é uma notificação muito recente (últimos 3 segundos)
        const notificationTime = new Date(latestNotification.created_at).getTime()
        const now = Date.now()
        const timeDiff = now - notificationTime
        
        if (timeDiff < 3000) { // 3 segundos
          console.log('🔔 Nova notificação detectada para toast:', latestNotification.title)
          addToast(latestNotification)
        }
      }
    }
  }, [notifications, addToast])

  return (
    <>
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          notification={toast.notification}
          onClose={() => removeToast(toast.id)}
          position="top"
        />
      ))}
    </>
  )
}
