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

    // Verificar conectividade periodicamente
    const healthCheck = setInterval(() => {
      if (status.lastActivity) {
        const timeSinceLastActivity = Date.now() - status.lastActivity.getTime()
        const isStale = timeSinceLastActivity > 60000 // 1 minuto sem atividade
        
        if (isStale && status.isConnected) {
          console.log('⚠️ Conexão pode estar inativa há mais de 1 minuto')
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            connectionError: 'Conexão inativa'
          }))
        }
      }
    }, 30000) // Verificar a cada 30 segundos

    return () => {
      console.log('🔗 Limpando monitoramento de conexão...')
      clearInterval(healthCheck)
      supabase.removeChannel(testChannel)
    }
  }, [profile?.id, status.lastActivity])

  return status
}
