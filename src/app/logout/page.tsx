'use client'

import { useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'

export default function LogoutPage() {
  const { signOut } = useAuthContext()

  useEffect(() => {
    const performSignOut = async () => {
      try {
        console.log('🚪 Executando signOut...')
        
        // Executar signOut e aguardar conclusão
        await signOut()
        
        console.log('✅ SignOut concluído, redirecionando...')
        
        // Redirecionar imediatamente para página inicial
        window.location.replace('/')
        
      } catch (error) {
        console.error('Erro ao fazer signOut:', error)
        // Mesmo com erro, redirecionar
        window.location.replace('/')
      }
    }

    performSignOut()
  }, [signOut])

  // Não mostrar nada, apenas executar o logout
  return null
}
