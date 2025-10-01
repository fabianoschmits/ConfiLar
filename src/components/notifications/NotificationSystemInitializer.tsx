'use client'

import { useEffect } from 'react'
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers'
import { useCompleteNotifications } from '@/hooks/useCompleteNotifications'

/**
 * Componente que inicializa o sistema de notificações (REATIVADO COM CONTROLES)
 */
export function NotificationSystemInitializer() {
  // TUDO DESABILITADO PARA INVESTIGAÇÃO COMPLETA
  // useNotificationTriggers()
  // useCompleteNotifications()

  useEffect(() => {
    console.log('⚠️ SISTEMA COMPLETAMENTE DESABILITADO PARA INVESTIGAÇÃO')
  }, [])

  // Este componente não renderiza nada, apenas inicializa o sistema
  return null
}
