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

  // Tela de logout brutalista
  return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
        <div className="mx-auto w-20 h-20 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
          <span className="text-yellow-400 font-black text-2xl">🚪</span>
        </div>
        <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
          FAZENDO LOGOUT...
        </h1>
        <p className="text-black font-bold mb-8 animate-fade-in">
          AGUARDE ENQUANTO ENCERRAMOS SUA SESSÃO.
        </p>
        
        <div className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-black border-t-yellow-400 mr-3"></div>
            <p className="text-black font-black text-sm">
              REDIRECIONANDO PARA A PÁGINA INICIAL...
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-black font-bold">
          <p>OBRIGADO POR USAR O CONFILAR!</p>
        </div>
      </div>
    </div>
  )
}
