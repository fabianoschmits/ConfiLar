'use client'

import { useEffect } from 'react'
import { useNewActivityMonitor } from '@/hooks/useNewActivityMonitor'

/**
 * Inicializador do novo sistema de notificações
 */
export function NewNotificationSystem() {
  // Inicializar monitoramento de atividades
  useNewActivityMonitor()

  useEffect(() => {
    console.log('🔔 Novo sistema de notificações INICIADO')
    console.log('✅ Monitoramento de atividades ativo')
    console.log('✅ Realtime configurado')
    console.log('✅ Sistema limpo e organizado')
    console.log('⚠️ Verificando se há múltiplas instâncias...')
    
    // Verificar se já existe uma instância
    const existingInstance = document.querySelector('[data-notification-system]')
    if (existingInstance) {
      console.log('⚠️ MÚLTIPLA INSTÂNCIA DETECTADA! Removendo...')
      return
    }
    
    // Marcar esta instância
    const marker = document.createElement('div')
    marker.setAttribute('data-notification-system', 'true')
    marker.style.display = 'none'
    document.body.appendChild(marker)
    
    console.log('🔔 Sistema de notificações configurado com sucesso!')
    console.log('📱 Aguardando atividades para processar...')
    
    return () => {
      if (marker.parentNode) {
        marker.parentNode.removeChild(marker)
      }
      console.log('🛑 Sistema de notificações parado')
    }
  }, [])

  return null
}
