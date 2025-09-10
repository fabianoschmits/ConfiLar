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
    // Redirecionar forçadamente para dashboard
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath || '/dashboard'
    }
    return null
  }

  return children
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

