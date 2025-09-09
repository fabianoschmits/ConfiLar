'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'

export default function LogoutPage() {
  const { signOut } = useAuthContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const performLogout = async () => {
      try {
        console.log('🚪 Iniciando logout...')
        
        // Executar logout sem mostrar mensagens
        await signOut()
        
        // Limpeza adicional de cache
        if (typeof window !== 'undefined') {
          try {
            // Limpar todos os caches
            if ('caches' in window) {
              const cacheNames = await caches.keys()
              await Promise.all(cacheNames.map(name => caches.delete(name)))
            }
            
            // Desregistrar Service Workers
            if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations()
              await Promise.all(registrations.map(reg => reg.unregister()))
            }
            
            // Limpar localStorage específico
            const keysToRemove = [
              'mockUser', 'mockProfile', 'supabase.auth.token', 'auth-token',
              'user-session', 'user-profile', 'user-preferences', 'chat-history',
              'notification-preferences', 'search-history', 'recent-searches'
            ]
            keysToRemove.forEach(key => localStorage.removeItem(key))
            
            sessionStorage.clear()
            
            console.log('✅ Limpeza concluída')
          } catch (cleanupError) {
            console.warn('⚠️ Erro na limpeza:', cleanupError)
          }
        }

        // Redirecionar diretamente para a página inicial
        console.log('🔄 Redirecionando para página inicial...')
        window.location.replace('/')
        
      } catch (error) {
        console.error('Erro ao sair:', error)
        // Mesmo com erro, redirecionar
        window.location.replace('/')
      }
    }

    performLogout()
  }, [signOut])

  // Não mostrar nada, apenas executar o logout
  return null
}
