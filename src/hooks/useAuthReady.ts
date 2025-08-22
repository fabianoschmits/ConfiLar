'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'

/**
 * Hook para verificar se o contexto de autenticação está totalmente carregado
 * Útil para evitar renderizações incorretas antes do carregamento completo
 */
export function useAuthReady() {
  const { user, profile, loading } = useAuthContext()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Se não está mais carregando, consideramos que está pronto
    if (!loading) {
      setIsReady(true)
    }
  }, [loading])

  return {
    isReady,
    isAuthenticated: !!user && !!profile,
    user,
    profile,
    loading
  }
}
