'use client'

import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  LogOut,
  Plus,
  Briefcase,
  Calendar,
  HelpCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Navigation() {
  const { profile, signOut, isMockMode } = useAuthContext()
  const router = useRouter()

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
      window.location.href = '/logout'
    } catch (error) {
      console.error('Erro ao sair:', error)
      window.location.href = '/logout'
    }
  }

  if (!profile) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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
                  onClick={() => handleNavigation('/agenda')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agenda
                </Button>
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
          </div>

          {/* Perfil e Ações */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation('/editarperfil')}
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
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
