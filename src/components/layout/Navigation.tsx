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

  const handleLogout = async () => {
    await signOut()
    router.push('/auth')
  }

  if (!profile) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Confilar
            </Link>
          </div>

          {/* Links de Navegação */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <Link href="/feed">
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feed Social
              </Button>
            </Link>

            <Link href="/buscar">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </Link>

            <Link href="/classificados">
              <Button variant="ghost" size="sm">
                <Briefcase className="h-4 w-4 mr-2" />
                Classificados
              </Button>
            </Link>

            {profile.user_type === 'professional' && (
              <>
                <Link href="/agenda">
                  <Button variant="ghost" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agenda
                  </Button>
                </Link>
                <Link href="/dashboard-profissional">
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Meus Serviços
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Perfil e Ações */}
          <div className="flex items-center space-x-4">
            <Link href="/perfil">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Button>
            </Link>

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
