'use client'

import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useOpenMessages } from '@/hooks/useOpenMessages'
import { NewNotificationBell } from '@/components/notifications/NewNotificationBell'
import { 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  LogOut,
  Plus,
  Briefcase,
  Calendar,
  HelpCircle,
  TestTube
} from 'lucide-react'

export function Navigation() {
  const { profile, signOut, isMockMode } = useAuthContext()
  const router = useRouter()
  const { openMessagesList } = useOpenMessages()

  // Função de navegação robusta
  const handleNavigation = (path: string) => {
    try {
      window.location.href = path
    } catch (error) {
      console.error('Erro na navegação:', error)
      router.push(path)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      // Redirecionar diretamente para a página de login
      window.location.href = '/auth'
    } catch (error) {
      console.error('Erro ao sair:', error)
      // Mesmo com erro, redirecionar para login
      window.location.href = '/auth'
    }
  }

  if (!profile) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-20 md:h-16 py-2 sm:py-0">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('/home')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Confilar
            </button>
          </div>

          {/* Links de Navegação */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation('/home')}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation('/feed')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Feed Social
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={openMessagesList}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensagens
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation('/buscar')}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation('/classificados')}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Classificados
            </Button>

            {profile.user_type === 'professional' && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleNavigation('/portfolio')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Meus Serviços
                </Button>
              </>
            )}

            {/* Link para página de teste (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleNavigation('/teste-notificacoes')}
                className="text-orange-600 hover:text-orange-800"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Teste Notificações
              </Button>
            )}
          </div>

          {/* Perfil e Ações */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Sino de Notificações */}
                <NewNotificationBell />

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation('/editarperfil')}
              className="hidden sm:flex"
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>

            {/* Indicador de Modo Mock */}
            {isMockMode && (
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-300">
                MODO DEV
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
