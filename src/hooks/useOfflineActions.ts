/**
 * Hook para gerenciar ações offline
 * Permite que ações sejam executadas offline e sincronizadas depois
 */

import { useState, useEffect } from 'react'
import { queueOfflineAction, initOfflineSync, getOfflineSync } from '@/lib/storage/offlineSync'
import { getPendingOfflineActions } from '@/lib/storage/indexedDB'

export function useOfflineActions() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingActions, setPendingActions] = useState<any[]>([])
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Inicializar sincronizador
    const sync = initOfflineSync()

    // Atualizar status online/offline
    const handleOnline = () => {
      setIsOnline(true)
      // Tentar sincronizar quando voltar online
      syncPendingActions()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Atualizar ações pendentes periodicamente
    const updatePendingActions = async () => {
      const actions = await getPendingOfflineActions()
      setPendingActions(actions)
    }

    // Atualizar imediatamente
    updatePendingActions()

    // Atualizar a cada 10 segundos
    const interval = setInterval(updatePendingActions, 10000)

    // Event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const syncPendingActions = async () => {
    const sync = getOfflineSync()
    if (sync && isOnline) {
      setIsSyncing(true)
      try {
        await sync.syncPendingActions()
        // Atualizar lista de ações pendentes
        const actions = await getPendingOfflineActions()
        setPendingActions(actions)
      } catch (error) {
        console.error('Erro ao sincronizar ações:', error)
      } finally {
        setIsSyncing(false)
      }
    }
  }

  /**
   * Adiciona uma ação para execução offline
   */
  const addOfflineAction = async (
    type: 'create_post' | 'like' | 'comment' | 'transfer_points' | 'update_profile',
    payload: any
  ): Promise<number> => {
    const actionId = await queueOfflineAction(type, payload)
    // Atualizar lista de ações pendentes
    const actions = await getPendingOfflineActions()
    setPendingActions(actions)
    return actionId
  }

  /**
   * Força sincronização manual
   */
  const forceSync = async () => {
    await syncPendingActions()
  }

  return {
    isOnline,
    pendingActions,
    pendingCount: pendingActions.length,
    isSyncing,
    addOfflineAction,
    forceSync
  }
}


