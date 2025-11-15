/**
 * Provider para gerenciar funcionalidades offline
 * Inicializa IndexedDB, sincronização e cache
 */

'use client'

import { useEffect } from 'react'
import { initOfflineSync } from '@/lib/storage/offlineSync'
import { cleanupExpiredData, cleanupCompletedActions } from '@/lib/storage/indexedDB'
import { useOfflineActions } from '@/hooks/useOfflineActions'

interface OfflineProviderProps {
  children: React.ReactNode
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const { isOnline, pendingCount, isSyncing } = useOfflineActions()

  useEffect(() => {
    // Inicializar sincronizador offline
    initOfflineSync()

    // Limpar dados expirados na inicialização
    cleanupExpiredData()
    cleanupCompletedActions()

    // Limpar dados expirados periodicamente (a cada 6 horas)
    const cleanupInterval = setInterval(() => {
      cleanupExpiredData()
      cleanupCompletedActions()
    }, 6 * 60 * 60 * 1000)

    // Registrar background sync no Service Worker
    const registerBackgroundSync = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready
          if ('sync' in registration) {
            await (registration as any).sync.register('confilar-offline-sync')
            console.log('✅ Background Sync registrado')
          } else {
            console.warn('⚠️ Background Sync API não disponível neste navegador')
          }
        } catch (error) {
          console.warn('⚠️ Erro ao registrar Background Sync:', error)
        }
      }
    }

    registerBackgroundSync()

    // Listener para mensagens do Service Worker
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_PENDING_ACTIONS') {
        console.log('🔄 Service Worker solicitou sincronização de ações')
        // A sincronização será feita automaticamente pelo useOfflineActions
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)

    return () => {
      clearInterval(cleanupInterval)
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  // Mostrar indicador de sincronização se houver ações pendentes
  useEffect(() => {
    if (!isOnline && pendingCount > 0) {
      console.log(`📴 Modo offline - ${pendingCount} ações pendentes`)
    }
  }, [isOnline, pendingCount, isSyncing])

  return <>{children}</>
}

