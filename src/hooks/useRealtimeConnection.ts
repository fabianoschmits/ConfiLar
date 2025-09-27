'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

export interface RealtimeConnectionStatus {
  isConnected: boolean
  isConnecting: boolean
  lastActivity: Date | null
  connectionError: string | null
}

export function useRealtimeConnection() {
  const { profile } = useAuthContext()
  const [status, setStatus] = useState<RealtimeConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    lastActivity: null,
    connectionError: null
  })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!profile?.id) {
      setStatus({
        isConnected: false,
        isConnecting: false,
        lastActivity: null,
        connectionError: null
      })
      return
    }

    console.log('🔗 Iniciando monitoramento de conexão em tempo real para:', profile.id)
    
    setStatus(prev => ({ ...prev, isConnecting: true }))

    // Criar canal de teste para verificar conectividade
    const testChannel = supabase
      .channel(`connection-test-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`
        },
        () => {
          // Atualizar última atividade quando receber qualquer mudança
          setStatus(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            lastActivity: new Date(),
            connectionError: null
          }))
        }
      )
      .subscribe((subscriptionStatus) => {
        console.log('🔗 Status da conexão de teste:', subscriptionStatus)
        
        if (subscriptionStatus === 'SUBSCRIBED') {
          setStatus(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            connectionError: null
          }))
          setRetryCount(0) // Reset contador de retry
          console.log('✅ Conexão em tempo real estabelecida')
        } else if (subscriptionStatus === 'CHANNEL_ERROR') {
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            connectionError: 'Erro na conexão do canal'
          }))
          console.error('❌ Erro na conexão do canal')
        } else if (subscriptionStatus === 'TIMED_OUT') {
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            connectionError: 'Timeout na conexão'
          }))
          console.error('⏰ Timeout na conexão')
          
          // Implementar retry com backoff exponencial
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
            console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${retryCount + 1}/3)`)
            setTimeout(() => {
              setRetryCount(prev => prev + 1)
            }, delay)
          } else {
            console.log('❌ Máximo de tentativas de reconexão atingido')
            setRetryCount(0)
          }
        } else if (subscriptionStatus === 'CLOSED') {
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            connectionError: 'Conexão fechada'
          }))
          console.log('🔒 Conexão fechada')
        }
      })

    // Verificar conectividade periodicamente (otimizado para 10 segundos)
    const healthCheck = setInterval(() => {
      if (status.lastActivity) {
        const timeSinceLastActivity = Date.now() - status.lastActivity.getTime()
        const isStale = timeSinceLastActivity > 30000 // 30 segundos sem atividade (reduzido)
        
        if (isStale && status.isConnected) {
          console.log('⚠️ Conexão pode estar inativa há mais de 30 segundos')
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            connectionError: 'Conexão inativa'
          }))
        }
      }
    }, 10000) // Verificar a cada 10 segundos (otimizado)

    return () => {
      console.log('🔗 Limpando monitoramento de conexão...')
      clearInterval(healthCheck)
      supabase.removeChannel(testChannel)
    }
  }, [profile?.id, status.lastActivity, retryCount])

  return status
}
