'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User } from 'lucide-react'

export default function TesteLogoutPage() {
  const { user, profile, signOut, loading } = useAuthContext()

  const handleLogout = async () => {
    console.log('🧪 Teste de logout iniciado...')
    try {
      const result = await signOut()
      console.log('🧪 Resultado do logout:', result)
      
      if (result?.error) {
        console.error('❌ Erro no logout:', result.error)
        alert('Erro no logout: ' + result.error.message)
      } else {
        console.log('✅ Logout bem-sucedido')
        alert('Logout realizado com sucesso!')
      }
    } catch (error) {
      console.error('💥 Erro crítico no logout:', error)
      alert('Erro crítico no logout: ' + error)
    }
  }

  const handleLogoutViaPage = () => {
    console.log('🧪 Redirecionando para página de logout...')
    window.location.href = '/logout'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Teste de Logout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> {loading ? 'Carregando...' : 'Pronto'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Usuário:</strong> {user ? user.email : 'Não logado'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Perfil:</strong> {profile ? profile.full_name : 'Não encontrado'}
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleLogout}
              disabled={loading || !user}
              className="w-full"
              variant="outline"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout Direto (signOut)
            </Button>

            <Button 
              onClick={handleLogoutViaPage}
              disabled={loading || !user}
              className="w-full"
              variant="destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout via Página (/logout)
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• <strong>Logout Direto:</strong> Chama signOut() diretamente</p>
            <p>• <strong>Logout via Página:</strong> Redireciona para /logout</p>
            <p>• Ambos devem limpar a sessão e redirecionar para /</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
