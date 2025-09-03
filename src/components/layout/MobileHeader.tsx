'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Phosphor Icons Light
import {
  House,
  MagnifyingGlass,
  ChatTeardrop,
  Bell as BellPhosphor,
  User,
  ArrowLeft,
  List,
  Plus
} from '@phosphor-icons/react'

interface MobileHeaderProps {
  showBackButton?: boolean
  title?: string
  showMenuButton?: boolean
  showQuickActions?: boolean
  onBackClick?: () => void
  onMenuClick?: () => void
  onQuickActionsClick?: () => void
}

export function MobileHeader({
  showBackButton = false,
  title,
  showMenuButton = true,
  showQuickActions = true,
  onBackClick,
  onMenuClick,
  onQuickActionsClick
}: MobileHeaderProps) {
  const pathname = usePathname()
  const { user, profile } = useAuthContext()

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  const getPageTitle = () => {
    if (title) return title
    
    const pathTitles: Record<string, string> = {
      '/home': 'Home',
      '/buscar': 'Buscar Profissionais',
      '/classificados': 'Classificados',
      '/feed': 'Feed Social',
      '/mensagens': 'Mensagens',
      '/notificacoes': 'Notificações',
      '/perfil': 'Meu Perfil',
      '/agendamentos': 'Agendamentos',
      '/agenda': 'Agenda',
      '/favoritos': 'Favoritos',
      '/portfolio': 'Meu Portfólio',
      '/ganhos': 'Ganhos',
      '/reputacao': 'Reputação',
      '/ajuda': 'Central de Ajuda',
      '/contato': 'Contato',
      '/sobre': 'Sobre Nós'
    }
    
    return pathTitles[pathname] || 'ConfiLar'
  }

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="p-2 h-10 w-10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2 h-10 w-10 rounded-full"
            >
              <List className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {showQuickActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onQuickActionsClick}
              className="p-2 h-10 w-10 rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
          
          {/* Quick access to messages */}
          <Link href="/mensagens">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-10 w-10 rounded-full relative"
            >
              <ChatTeardrop className="h-5 w-5" />
              {/* Badge for unread messages could be added here */}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
