'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function LogoutPage() {
  const router = useRouter()
  const { signOut } = useAuthContext()

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Mostrar mensagem de aviso
        toast.info('Desconectando...', {
          duration: 2000,
        })

        // Aguardar um momento para mostrar a mensagem
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Executar logout
        const result = await signOut()
        
        if (result.error) {
          console.error('Erro ao sair:', result.error)
          toast.error('Erro ao desconectar. Tente novamente.')
          return
        }

        // Redirecionar para a página inicial
        window.location.href = '/'
      } catch (error) {
        console.error('Erro ao sair:', error)
        toast.error('Erro ao desconectar. Tente novamente.')
      }
    }

    performLogout()
  }, [signOut])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Desconectando...</p>
      </div>
    </div>
  )
}
