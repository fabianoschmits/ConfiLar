'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { LogOut } from 'lucide-react'

export default function LogoutPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // const { signOut } = useAuthContext()
  const signOut = async () => {
    // Implementação temporária
    console.log('Signing out...')
    window.location.replace('/')
  }

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

  // Tela de logout moderna
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-md border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <LogOut className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Fazendo logout...
          </h1>
          <p className="text-gray-600 mb-8">
            Aguarde enquanto encerramos sua sessão.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3"></div>
              <p className="text-blue-700 font-medium text-sm">
                Redirecionando para a página inicial...
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Obrigado por usar o ConfiLar!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
