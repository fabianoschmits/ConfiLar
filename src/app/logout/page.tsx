'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function LogoutPage() {
  const { signOut } = useAuthContext()
  const [isLoggingOut, setIsLoggingOut] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('🚪 Iniciando processo de logout...')
        
        // Mostrar mensagem de aviso
        toast.info('Desconectando e limpando dados...', {
          duration: 3000,
        })

        // Aguardar um momento para mostrar a mensagem
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Executar logout com timeout
        const logoutPromise = signOut()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout no logout')), 10000)
        )
        
        const result = await Promise.race([logoutPromise, timeoutPromise]) as { error?: { message: string } }
        
        if (result?.error) {
          console.error('Erro ao sair:', result.error)
          setError('Erro ao desconectar. Redirecionando...')
          toast.error('Erro ao desconectar. Redirecionando...')
        } else {
          console.log('✅ Logout realizado com sucesso')
          toast.success('Logout realizado com sucesso!')
        }

        // Aguardar um pouco mais para garantir que a limpeza foi concluída
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Forçar limpeza adicional de cache
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
            
            console.log('✅ Limpeza adicional de cache concluída')
          } catch (cleanupError) {
            console.warn('⚠️ Erro na limpeza adicional:', cleanupError)
          }
        }

        setIsLoggingOut(false)
        
        // Redirecionar com força para evitar cache
        setTimeout(() => {
          console.log('🔄 Redirecionando para página inicial...')
          // Usar replace para evitar problemas de histórico e forçar reload
          window.location.replace('/')
        }, 1000)
        
      } catch (error) {
        console.error('Erro crítico ao sair:', error)
        setError('Erro ao desconectar. Redirecionando...')
        toast.error('Erro ao desconectar. Redirecionando...')
        
        setIsLoggingOut(false)
        
        // Mesmo com erro, tentar redirecionar após um tempo
        setTimeout(() => {
          console.log('🔄 Redirecionando após erro...')
          window.location.replace('/')
        }, 2000)
      }
    }

    performLogout()
  }, [signOut])

  if (!isLoggingOut && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg">⚠️</div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Desconectando e limpando dados...</p>
        <p className="text-sm text-muted-foreground">Aguarde um momento...</p>
      </div>
    </div>
  )
}
