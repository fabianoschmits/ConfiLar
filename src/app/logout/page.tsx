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
        toast.info('Desconectando e limpando dados...', {
          duration: 3000,
        })

        // Aguardar um momento para mostrar a mensagem
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Executar logout
        const result = await signOut()
        
        if (result.error) {
          console.error('Erro ao sair:', result.error)
          toast.error('Erro ao desconectar. Tente novamente.')
          return
        }

        // Aguardar um pouco mais para garantir que a limpeza foi concluída
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Redirecionar com força para evitar cache
        toast.success('Logout realizado com sucesso!')
        
        // Usar replace para evitar problemas de histórico
        setTimeout(() => {
          // Forçar reload completo da página inicial
          window.location.replace('/')
        }, 500)
        
      } catch (error) {
        console.error('Erro ao sair:', error)
        toast.error('Erro ao desconectar. Tente novamente.')
        
        // Mesmo com erro, tentar redirecionar após um tempo
        setTimeout(() => {
          window.location.replace('/')
        }, 2000)
      }
    }

    performLogout()
  }, [signOut])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Desconectando e limpando dados...</p>
      </div>
    </div>
  )
}
