'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

export function useAutoRedirect() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    // Não fazer nada se ainda está carregando
    if (loading) return

    // Se não há usuário logado, redirecionar para página principal
    // Mas apenas se não estivermos em uma página que requer autenticação
    if (!user) {
      const currentPath = window.location.pathname
      const authRequiredPaths = ['/editarperfil', '/editar-perfil', '/feed', '/perfil', '/favoritos', '/avaliacoes', '/reputacao', '/portfolio', '/minhas-denuncias', '/admin']
      
      // Se não estamos em uma página que requer autenticação, redirecionar
      if (!authRequiredPaths.some(path => currentPath.startsWith(path))) {
        router.push('/')
      }
    }
  }, [user, loading, router])

  // Detectar quando a página fica inativa por muito tempo
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Página ficou oculta, iniciar timer
        timeoutId = setTimeout(() => {
          // Após 30 minutos inativo, redirecionar para página principal
          router.push('/')
        }, 30 * 60 * 1000) // 30 minutos
      } else {
        // Página voltou a ficar visível, cancelar timer
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    const handleBeforeUnload = () => {
      // Limpar timer quando a página for fechada
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    // Adicionar listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [router])
}
