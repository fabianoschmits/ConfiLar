'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useOpenMessages } from '@/hooks/useOpenMessages'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { AvailabilityToggleCompact } from '@/components/ui/AvailabilityToggle'

// Phosphor Icons Light
import {
  Bell as BellPhosphor,
  User,
  ArrowLeft,
  List,
  Gear,
  SignOut,
  UserCircle,
  Briefcase,
  Star,
  Question,
  ChatCircle
} from '@phosphor-icons/react'

interface MobileHeaderProps {
  showBackButton?: boolean
  title?: string
  showMenuButton?: boolean
  onBackClick?: () => void
  onMenuClick?: () => void
}

export function MobileHeader({
  showBackButton = false,
  title,
  showMenuButton = false,
  onBackClick,
  onMenuClick
}: MobileHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile } = useAuthContext()
  const { openMessagesList } = useOpenMessages()
  const [notificationCount, setNotificationCount] = useState(0)

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleLogout = () => {
    router.push('/logout')
  }

  const getPageTitle = () => {
    if (title) return title
    
    const pathTitles: Record<string, string> = {
      '/home': 'Home',
      '/buscar': 'Buscar Profissionais',
      '/classificados': 'Classificados',
      '/feed': 'Feed Social',
      '/mensagens': 'Mensagens',
      '/perfil': 'Meu Perfil',
      '/favoritos': 'Favoritos',
      '/portfolio': 'Meu Portfólio',
      '/reputacao': 'Reputação',
      '/ajuda': 'Central de Ajuda',
      '/contato': 'Contato',
      '/sobre': 'Sobre Nós'
    }
    
    return pathTitles[pathname] || 'ConfiLar'
  }

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-yellow-400 border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)] safe-area-top">
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
        {/* Left side - Back button */}
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="p-1 sm:p-2 h-8 w-8 sm:h-10 sm:w-10 bg-white border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </button>
          )}
        </div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-poetsen-one text-black uppercase tracking-wider leading-tight sm:drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-transform duration-200" style={{textShadow: 'none'}}>
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Toggle de Disponibilidade */}
          <AvailabilityToggleCompact />
          
          {/* Notifications Bell */}
          <button
            className="p-1 sm:p-2 h-8 w-8 sm:h-10 sm:w-10 bg-white border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all relative"
            onClick={() => handleNavigation('/notificacoes')}
          >
            <BellPhosphor className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            {notificationCount > 0 && (
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                <span className="text-xs font-black text-white">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              </div>
            )}
          </button>

          {/* Messages Button */}
          <button
            className="p-1 sm:p-2 h-8 w-8 sm:h-10 sm:w-10 bg-blue-500 border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            onClick={openMessagesList}
            title="Abrir Mensagens"
          >
            <ChatCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
          
          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 sm:p-1 h-8 w-8 sm:h-10 sm:w-10 bg-white border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Usuário'}
                    className="h-6 w-6 sm:h-8 sm:w-8 object-cover border-2 border-black"
                  />
                ) : (
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 flex items-center justify-center border-2 border-black">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-2 max-h-96 overflow-y-auto">
              {/* User Info */}
              <div className="px-3 py-3 border-b-2 border-black mb-2">
                <p className="text-sm font-black text-black uppercase">
                  {profile.full_name || 'USUÁRIO'}
                </p>
                <p className="text-xs text-black font-bold">
                  {profile.email}
                </p>
              </div>
              
              {/* Navigation Links */}
              <DropdownMenuItem 
                onClick={() => handleNavigation('/perfil')}
                className="px-3 py-2 mb-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <UserCircle className="mr-3 h-5 w-5 text-black" />
                <span className="font-black text-black uppercase text-sm">MEU PERFIL</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleNavigation('/editarperfil')}
                className="px-3 py-2 mb-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <Gear className="mr-3 h-5 w-5 text-black" />
                <span className="font-black text-black uppercase text-sm">EDITAR PERFIL</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleNavigation('/portfolio')}
                className="px-3 py-2 mb-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <Briefcase className="mr-3 h-5 w-5 text-black" />
                <span className="font-black text-black uppercase text-sm">MEU PORTFÓLIO</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleNavigation('/reputacao')}
                className="px-3 py-2 mb-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <Star className="mr-3 h-5 w-5 text-black" />
                <span className="font-black text-black uppercase text-sm">REPUTAÇÃO</span>
              </DropdownMenuItem>
              
              <div className="border-t-2 border-black my-2"></div>
              
              <DropdownMenuItem 
                onClick={() => handleNavigation('/ajuda')}
                className="px-3 py-2 mb-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <Question className="mr-3 h-5 w-5 text-black" />
                <span className="font-black text-black uppercase text-sm">AJUDA</span>
              </DropdownMenuItem>
              
              <div className="border-t-2 border-black my-2"></div>
              
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="px-3 py-2 bg-red-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <SignOut className="mr-3 h-5 w-5 text-white" />
                <span className="font-black text-white uppercase text-sm">SAIR</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
