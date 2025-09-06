'use client'

import { useEffect, useRef } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function SessionMonitor() {
  const { user, signOut } = useAuthContext()
  const lastActivityRef = useRef<number>(Date.now())
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) return

    console.log('🔍 Iniciando monitoramento de sessão para:', user.email)

    // Função para verificar se a sessão ainda é válida
    const checkSessionValidity = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('⚠️ Erro ao verificar sessão:', error)
          return
        }

        // Se não há sessão mas o usuário está logado localmente, fazer logout
        if (!session && user) {
          console.log('🚪 Sessão expirada, fazendo logout automático...')
          await signOut()
          return
        }

        // Verificar se a sessão está próxima do vencimento (5 minutos antes)
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000)
          const now = new Date()
          const timeUntilExpiry = expiresAt.getTime() - now.getTime()
          const fiveMinutes = 5 * 60 * 1000

          if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
            console.log('⏰ Sessão próxima do vencimento, renovando...')
            try {
              await supabase.auth.refreshSession()
              console.log('✅ Sessão renovada com sucesso')
            } catch (refreshError) {
              console.error('❌ Erro ao renovar sessão:', refreshError)
              await signOut()
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro crítico ao verificar sessão:', error)
      }
    }

    // Função para detectar atividade do usuário
    const updateLastActivity = () => {
      lastActivityRef.current = Date.now()
    }

    // Adicionar listeners de atividade
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(event => {
      document.addEventListener(event, updateLastActivity, true)
    })

    // Verificar sessão a cada 2 minutos
    sessionCheckIntervalRef.current = setInterval(checkSessionValidity, 2 * 60 * 1000)

    // Verificar se o usuário está inativo há mais de 30 minutos
    const inactivityCheckInterval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityRef.current
      const thirtyMinutes = 30 * 60 * 1000

      if (timeSinceLastActivity > thirtyMinutes) {
        console.log('😴 Usuário inativo há mais de 30 minutos, verificando sessão...')
        checkSessionValidity()
      }
    }, 5 * 60 * 1000) // Verificar a cada 5 minutos

    // Cleanup
    return () => {
      console.log('🧹 Limpando monitoramento de sessão...')
      
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current)
      }
      
      clearInterval(inactivityCheckInterval)
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateLastActivity, true)
      })
    }
  }, [user, signOut])

  // Monitorar mudanças de conectividade
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexão restaurada, verificando sessão...')
      if (user) {
        // Verificar sessão quando voltar online
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error || !session) {
            console.log('🚪 Sessão inválida após reconexão, fazendo logout...')
            signOut()
          }
        })
      }
    }

    const handleOffline = () => {
      console.log('📴 Conexão perdida')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user, signOut])

  return null
}
