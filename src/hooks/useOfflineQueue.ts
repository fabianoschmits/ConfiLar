'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface QueuedAction {
  id: string
  type: 'message' | 'favorite' | 'like' | 'comment' | 'post'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retries: number
}

const QUEUE_KEY = 'confilar-offline-queue'
const MAX_RETRIES = 3

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedAction[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Carregar queue do localStorage
  useEffect(() => {
    loadQueue()
    
    const handleOnline = () => {
      setIsOnline(true)
      syncQueue()
    }
    
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar status inicial
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Carregar queue do localStorage
  const loadQueue = useCallback(() => {
    try {
      const stored = localStorage.getItem(QUEUE_KEY)
      if (stored) {
        const parsedQueue: QueuedAction[] = JSON.parse(stored)
        setQueue(parsedQueue)
        
        // Se estiver online, tentar sincronizar
        if (navigator.onLine && parsedQueue.length > 0) {
          syncQueue()
        }
      }
    } catch (error) {
      console.error('Erro ao carregar queue:', error)
    }
  }, [])

  // Salvar queue no localStorage
  const saveQueue = useCallback((newQueue: QueuedAction[]) => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue))
      setQueue(newQueue)
    } catch (error) {
      console.error('Erro ao salvar queue:', error)
    }
  }, [])

  // Adicionar ação à queue
  const addToQueue = useCallback((
    type: QueuedAction['type'],
    action: QueuedAction['action'],
    data: any
  ) => {
    const newAction: QueuedAction = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      action,
      data,
      timestamp: Date.now(),
      retries: 0
    }

    const newQueue = [...queue, newAction]
    saveQueue(newQueue)

    console.log('✅ Ação adicionada à queue offline:', newAction)

    // Se estiver online, tentar sincronizar imediatamente
    if (navigator.onLine) {
      syncQueue()
    }

    return newAction.id
  }, [queue, saveQueue])

  // Remover ação da queue
  const removeFromQueue = useCallback((actionId: string) => {
    const newQueue = queue.filter(action => action.id !== actionId)
    saveQueue(newQueue)
  }, [queue, saveQueue])

  // Sincronizar queue com servidor
  const syncQueue = useCallback(async () => {
    if (!navigator.onLine || isSyncing || queue.length === 0) return

    setIsSyncing(true)

    console.log(`🔄 Sincronizando ${queue.length} ações offline...`)

    const actionsToSync = [...queue]
    const succeededActions: string[] = []

    for (const action of actionsToSync) {
      try {
        await processAction(action)
        succeededActions.push(action.id)
        console.log('✅ Ação sincronizada:', action.type, action.action)
      } catch (error) {
        console.error('❌ Erro ao sincronizar ação:', error)
        
        // Incrementar retries
        action.retries++
        
        // Se excedeu max retries, remover da queue
        if (action.retries >= MAX_RETRIES) {
          console.warn('⚠️ Ação removida após max retries:', action.type)
          succeededActions.push(action.id)
        }
      }
    }

    // Remover ações bem-sucedidas da queue
    const newQueue = queue.filter(action => !succeededActions.includes(action.id))
    saveQueue(newQueue)

    setIsSyncing(false)
    
    if (succeededActions.length > 0) {
      console.log(`✅ ${succeededActions.length} ações sincronizadas com sucesso!`)
    }
  }, [queue, isSyncing, saveQueue])

  // Processar uma ação específica
  const processAction = async (action: QueuedAction) => {
    switch (action.type) {
      case 'message':
        return await processMessageAction(action)
      
      case 'favorite':
        return await processFavoriteAction(action)
      
      case 'like':
        return await processLikeAction(action)
      
      case 'comment':
        return await processCommentAction(action)
      
      case 'post':
        return await processPostAction(action)
      
      default:
        throw new Error(`Tipo de ação desconhecido: ${action.type}`)
    }
  }

  // Processar ação de mensagem
  const processMessageAction = async (action: QueuedAction) => {
    const { action: actionType, data } = action

    if (actionType === 'create') {
      const { error } = await supabase
        .from('messages')
        .insert(data)
      
      if (error) throw error
    }
    
    // Outras ações de mensagem...
  }

  // Processar ação de favorito
  const processFavoriteAction = async (action: QueuedAction) => {
    const { action: actionType, data } = action

    if (actionType === 'create') {
      const { error } = await supabase
        .from('favorites')
        .insert(data)
      
      if (error) throw error
    }
    
    if (actionType === 'delete') {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', data.id)
      
      if (error) throw error
    }
  }

  // Processar ação de curtida
  const processLikeAction = async (action: QueuedAction) => {
    const { action: actionType, data } = action

    if (actionType === 'create') {
      const { error } = await supabase
        .from('post_reactions')
        .insert(data)
      
      if (error) throw error
    }
    
    if (actionType === 'delete') {
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('id', data.id)
      
      if (error) throw error
    }
  }

  // Processar ação de comentário
  const processCommentAction = async (action: QueuedAction) => {
    const { action: actionType, data } = action

    if (actionType === 'create') {
      const { error } = await supabase
        .from('post_comments')
        .insert(data)
      
      if (error) throw error
    }
  }

  // Processar ação de post
  const processPostAction = async (action: QueuedAction) => {
    const { action: actionType, data } = action

    if (actionType === 'create') {
      const { error } = await supabase
        .from('posts')
        .insert(data)
      
      if (error) throw error
    }
  }

  return {
    // Estado
    queue,
    isOnline,
    isSyncing,
    hasQueuedActions: queue.length > 0,
    
    // Ações
    addToQueue,
    removeFromQueue,
    syncQueue,
    
    // Utilitários
    queueSize: queue.length
  }
}

