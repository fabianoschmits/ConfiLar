'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface RedirectConfig {
  delay?: number
  fallbackPath?: string
  maxAttempts?: number
  onRedirect?: (path: string) => void
  onError?: (error: string) => void
}

interface AuthRedirectProps {
  isAuthenticated: boolean
  isLoading: boolean
  isReady: boolean
  redirectPath?: string
  config?: RedirectConfig
}

export function useAuthRedirect({
  isAuthenticated,
  isLoading,
  isReady,
  redirectPath,
  config = {}
}: AuthRedirectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [redirectAttempts, setRedirectAttempts] = useState(0)
  const redirectTimeoutRef = useRef<NodeJS.Timeout>()
  const maxAttempts = config.maxAttempts || 3
  const delay = config.delay || 500
  const fallbackPath = config.fallbackPath || '/dashboard'

  const executeRedirect = (path: string) => {
    console.log('🔄 Executando redirecionamento para:', path)
    
    try {
      if (config.onRedirect) {
        config.onRedirect(path)
      }
      
      router.push(path)
      setRedirectAttempts(prev => prev + 1)
    } catch (error) {
      console.error('❌ Erro no redirecionamento:', error)
      if (config.onError) {
        config.onError(error instanceof Error ? error.message : 'Erro no redirecionamento')
      }
    }
  }

  useEffect(() => {
    // Limpar timeout anterior
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }

    // Não fazer nada se ainda está carregando ou não está pronto
    if (isLoading || !isReady) {
      return
    }

    // Se usuário está autenticado e não está na página correta
    if (isAuthenticated) {
      const targetPath = redirectPath || fallbackPath
      
      // Se já está na página correta, não redirecionar
      if (pathname === targetPath) {
        console.log('✅ Usuário já está na página correta:', pathname)
        return
      }

      // Verificar se não excedeu o número máximo de tentativas
      if (redirectAttempts >= maxAttempts) {
        console.error('❌ Máximo de tentativas de redirecionamento atingido')
        if (config.onError) {
          config.onError('Máximo de tentativas de redirecionamento atingido')
        }
        return
      }

      console.log('🔄 Agendando redirecionamento para:', targetPath)
      
      // Agendar redirecionamento
      redirectTimeoutRef.current = setTimeout(() => {
        executeRedirect(targetPath)
      }, delay)
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [
    isAuthenticated, 
    isLoading, 
    isReady, 
    redirectPath, 
    fallbackPath, 
    pathname, 
    redirectAttempts, 
    maxAttempts, 
    delay, 
    config
  ])

  // Resetar tentativas quando o estado de autenticação muda
  useEffect(() => {
    setRedirectAttempts(0)
  }, [isAuthenticated])

  return {
    redirectAttempts,
    maxAttempts,
    canRedirect: redirectAttempts < maxAttempts
  }
}

interface SmartRedirectProps {
  isAuthenticated: boolean
  isLoading: boolean
  isReady: boolean
  redirectPath?: string
  children: React.ReactNode
  config?: RedirectConfig
}

export function SmartRedirect({ 
  isAuthenticated, 
  isLoading, 
  isReady, 
  redirectPath, 
  children, 
  config 
}: SmartRedirectProps) {
  const { redirectAttempts, maxAttempts, canRedirect } = useAuthRedirect({
    isAuthenticated,
    isLoading,
    isReady,
    redirectPath,
    config
  })

  // Se excedeu tentativas, mostrar erro
  if (!canRedirect && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Erro de Redirecionamento</h3>
            <p className="text-sm text-gray-600 mt-2">
              Não foi possível redirecionar após {maxAttempts} tentativas.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = redirectPath || '/dashboard'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook para redirecionamento automático baseado em autenticação
export function useAutoRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const redirectTo = (path: string, options?: { replace?: boolean }) => {
    if (isRedirecting) return
    
    setIsRedirecting(true)
    console.log('🔄 Redirecionamento automático para:', path)
    
    try {
      if (options?.replace) {
        router.replace(path)
      } else {
        router.push(path)
      }
    } catch (error) {
      console.error('❌ Erro no redirecionamento automático:', error)
    } finally {
      // Resetar flag após um tempo
      setTimeout(() => setIsRedirecting(false), 1000)
    }
  }

  const redirectToLogin = (currentPath?: string) => {
    const loginPath = currentPath ? `/auth?redirect=${encodeURIComponent(currentPath)}` : '/auth'
    redirectTo(loginPath)
  }

  const redirectToDashboard = () => {
    redirectTo('/dashboard')
  }

  const redirectToHome = () => {
    redirectTo('/')
  }

  return {
    redirectTo,
    redirectToLogin,
    redirectToDashboard,
    redirectToHome,
    isRedirecting
  }
}

