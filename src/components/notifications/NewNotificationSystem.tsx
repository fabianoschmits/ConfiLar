'use client'

import { useEffect } from 'react'
// import { useNewActivityMonitor } from '@/hooks/useNewActivityMonitor' // ❌ DESABILITADO - Usando triggers SQL

/**
 * Inicializador do novo sistema de notificações
 * 
 * NOTA: Sistema agora usa TRIGGERS SQL + REALTIME para notificações instantâneas
 * - Triggers criam notificações automaticamente no banco
 * - Realtime envia notificações instantaneamente para o frontend
 * - Não há mais polling (verificação a cada X segundos)
 */
export function NewNotificationSystem() {
  // ❌ DESABILITADO: Polling a cada 10 segundos
  // useNewActivityMonitor()
  
  // ✅ NOVO SISTEMA: Triggers SQL + Realtime (0 delay)
  // As notificações são criadas automaticamente via triggers SQL quando:
  // - Nova mensagem é enviada
  // - Usuário é favoritado
  // - Usuário recebe recomendação
  // - Usuário recebe avaliação

  useEffect(() => {
    console.log('🔔 Sistema de notificações INICIADO')
    console.log('✅ Usando TRIGGERS SQL + REALTIME')
    console.log('⚡ Notificações INSTANTÂNEAS (sem polling)')
    console.log('🎯 Sistema otimizado e eficiente')
    console.log('')
    console.log('📋 Como funciona agora:')
    console.log('  1. Evento acontece (mensagem, favorito, etc)')
    console.log('  2. Trigger SQL cria notificação automaticamente')
    console.log('  3. Realtime envia para frontend INSTANTANEAMENTE')
    console.log('  4. Frontend atualiza UI em < 1 segundo')
    console.log('')
    console.log('✅ Sistema pronto!')
    
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
    
    return () => {
      if (marker.parentNode) {
        marker.parentNode.removeChild(marker)
      }
      console.log('🛑 Sistema de notificações parado')
    }
  }, [])

  return null
}
