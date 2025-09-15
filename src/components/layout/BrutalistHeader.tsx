'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { AvailabilityToggleCompact } from '@/components/ui/AvailabilityToggle'

// Tabler Icons - Estilo Brutalista
import {
  IconHome,
  IconSearch,
  IconMessageCircle,
  IconBell,
  IconUser,
  IconArrowLeft,
  IconMenu2,
  IconChevronDown,
  IconChevronUp,
  IconHeart,
  IconCalendar,
  IconSettings,
  IconLogout,
  IconHelp,
  IconPhone,
  IconBriefcase,
  IconTrendingUp,
  IconBolt,
  IconEye,
  IconEdit,
  IconInfoCircle
} from '@tabler/icons-react'

interface BrutalistHeaderProps {
  showBackButton?: boolean
  title?: string
  showMenuButton?: boolean
  onBackClick?: () => void
  onMenuClick?: () => void
}

export function BrutalistHeader({
  showBackButton = false,
  title,
  showMenuButton = false,
  onBackClick,
  onMenuClick
}: BrutalistHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuthContext()
  const { openChat } = useFloatingChat()
  const { unreadCount } = useSupabaseNotifications()
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  // Função de navegação simplificada
  const handleNavigation = (path: string) => {
    console.log('Navegando para:', path)
    setIsMenuExpanded(false)
    window.location.href = path
  }

  const getPageTitle = () => {
    if (title) return title
    
    const pathTitles: Record<string, string> = {
      '/home': 'HOME',
      '/buscar': 'BUSCAR PROFISSIONAIS',
      '/classificados': 'CLASSIFICADOS',
      '/feed': 'FEED SOCIAL',
      '/perfil': 'MEU PERFIL',
      '/favoritos': 'FAVORITOS',
      '/portfolio': 'MEU PORTFÓLIO',
      '/reputacao': 'REPUTAÇÃO',
      '/ajuda': 'CENTRAL DE AJUDA',
      '/contato': 'CONTATO',
      '/sobre': 'SOBRE NÓS'
    }
    
    return pathTitles[pathname] || 'CONFILAR'
  }

  const handleSignOut = async () => {
    console.log('Executando logout...')
    setIsMenuExpanded(false)
    await signOut()
    window.location.href = '/logout'
  }

  // Dados mockados para demonstração
  const accountStats = {
    totalServices: profile?.user_type === 'professional' ? 45 : 12,
    completedServices: profile?.user_type === 'professional' ? 38 : 10,
    rating: 4.8,
    memberSince: profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024',
    verificationStatus: profile?.user_type === 'professional' ? 'verified' : 'basic',
    premiumStatus: false
  }

  const getVerificationBadge = () => {
    if (accountStats.verificationStatus === 'verified') {
      return <span className="px-2 py-1 text-xs font-black bg-green-500 text-white border-2 border-black">✓ VERIFICADO</span>
    }
    return <span className="px-2 py-1 text-xs font-black bg-gray-500 text-white border-2 border-black">BÁSICO</span>
  }

  const getPremiumBadge = () => {
    if (accountStats.premiumStatus) {
      return <span className="px-2 py-1 text-xs font-black bg-yellow-400 text-black border-2 border-black">👑 PREMIUM</span>
    }
    return null
  }

  return (
    <>
      {/* Header Principal Brutalista */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side */}
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="p-2 h-10 w-10 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
              >
                <IconArrowLeft size={20} stroke={2} />
              </button>
            )}
            
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 h-10 w-10 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
              >
                <IconMenu2 size={20} stroke={2} />
              </button>
            )}
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-black text-black truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right side - Menu do usuário */}
          <div className="flex items-center space-x-2">
            
            {/* Toggle de Disponibilidade */}
            <AvailabilityToggleCompact />
            
            {/* Notificações */}
            <div className="relative">
              <NotificationDropdown />
            </div>
            
            {/* Avatar e Menu do Usuário */}
            <div className="relative">
              <button
                onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                className="flex items-center gap-2 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all px-3 py-2 font-black"
              >
                <UserAvatar 
                  src={profile?.avatar_url}
                  alt={profile?.full_name || 'Usuário'}
                  fallback={profile?.full_name?.charAt(0) || 'U'}
                  size="sm"
                />
                <span className="hidden sm:block text-xs">
                  {(profile?.full_name || 'USUÁRIO').toUpperCase()}
                </span>
                {isMenuExpanded ? <IconChevronUp size={14} stroke={2} /> : <IconChevronDown size={14} stroke={2} />}
              </button>

              {/* Menu Expandido */}
              {isMenuExpanded && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[9999] max-h-[80vh] overflow-hidden">
                  <div className="h-full flex flex-col">
                    {/* Header do Perfil - Fixo */}
                    <div className="p-3 border-b-2 border-black bg-yellow-400 flex-shrink-0">
                      <div className="flex items-center space-x-3">
                        <UserAvatar 
                          src={profile?.avatar_url}
                          alt={profile?.full_name || 'Usuário'}
                          fallback={profile?.full_name?.charAt(0) || 'U'}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-black text-sm truncate">
                            {(profile?.full_name || 'USUÁRIO').toUpperCase()}
                          </h3>
                          <p className="text-xs font-bold text-gray-700">
                            {profile?.user_type === 'professional' ? 'PROFISSIONAL' : 'CLIENTE'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {getVerificationBadge()}
                          {getPremiumBadge()}
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo Scrollável com Indicadores */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                      {/* Indicador de scroll no topo */}
                      <div className="h-1 bg-gradient-to-b from-gray-300 to-transparent"></div>
                      
                      <div className="p-3 space-y-3">
                        {/* Estatísticas Rápidas - Compactas */}
                        <div className="bg-yellow-400 border-2 border-black p-2">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-lg font-black text-black">{accountStats.totalServices}</div>
                              <div className="text-xs font-bold text-gray-700">SERVIÇOS</div>
                            </div>
                            <div>
                            <div className="text-lg font-black text-black">{accountStats.rating}</div>
                            <div className="text-xs font-bold text-gray-700">AVALIAÇÃO</div>
                          </div>
                        </div>
                        </div>

                        {/* Ações Rápidas - Grid Compacto */}
                        <div>
                          <h3 className="text-xs font-black text-black mb-2 flex items-center">
                            <IconBolt size={12} stroke={2} className="mr-1 text-yellow-500" />
                            AÇÕES RÁPIDAS
                          </h3>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => {
                                console.log('Abrindo chat...')
                                openChat()
                                setIsMenuExpanded(false)
                              }}
                              className="flex flex-col items-center p-2 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                            >
                              <IconMessageCircle size={12} stroke={2} className="mb-1" />
                              <span className="text-xs">MSG</span>
                              {unreadCount > 0 && (
                                <span className="mt-1 px-1 py-0.5 text-xs font-black bg-white text-red-500 border border-black">
                                  {unreadCount}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => handleNavigation('/favoritos')}
                              className="flex flex-col items-center p-2 bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                            >
                              <IconHeart size={12} stroke={2} className="mb-1" />
                              <span className="text-xs">FAV</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/buscar')}
                              className="flex flex-col items-center p-2 bg-purple-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                            >
                              <IconSearch size={12} stroke={2} className="mb-1" />
                              <span className="text-xs">BUSCAR</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/classificados')}
                              className="flex flex-col items-center p-2 bg-orange-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                            >
                              <IconBriefcase size={12} stroke={2} className="mb-1" />
                              <span className="text-xs">CLASS</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/ajuda')}
                              className="flex flex-col items-center p-2 bg-gray-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                            >
                              <IconHelp size={12} stroke={2} className="mb-1" />
                              <span className="text-xs">AJUDA</span>
                            </button>
                          </div>
                        </div>

                        {/* Conta e Perfil - Lista Compacta */}
                        <div>
                          <h3 className="text-xs font-black text-black mb-2 flex items-center">
                            <IconUser size={12} stroke={2} className="mr-1 text-blue-500" />
                            MINHA CONTA
                          </h3>
                          <div className="space-y-1">
                            <button
                              onClick={() => handleNavigation(`/perfil/${profile?.id}`)}
                              className="flex items-center space-x-2 px-2 py-1.5 text-xs font-bold text-black hover:bg-yellow-400 border border-black transition-all w-full text-left"
                            >
                              <IconEye size={12} stroke={2} className="text-blue-600" />
                              <span>VER PERFIL</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/editarperfil')}
                              className="flex items-center space-x-2 px-2 py-1.5 text-xs font-bold text-black hover:bg-yellow-400 border border-black transition-all w-full text-left"
                            >
                              <IconEdit size={12} stroke={2} className="text-green-600" />
                              <span>EDITAR PERFIL</span>
                            </button>
                            {profile?.user_type === 'professional' && (
                              <>
                                <button
                                  onClick={() => handleNavigation('/portfolio')}
                                  className="flex items-center space-x-2 px-2 py-1.5 text-xs font-bold text-black hover:bg-yellow-400 border border-black transition-all w-full text-left"
                                >
                                  <IconBriefcase size={12} stroke={2} className="text-purple-600" />
                                  <span>PORTFÓLIO</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Botão de Sair - Fixo no final */}
                        <div className="border-t-2 border-black pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center justify-center space-x-2 px-3 py-2 text-xs font-black text-white bg-red-500 hover:bg-red-600 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all w-full"
                          >
                            <IconLogout size={12} stroke={2} />
                            <span>SAIR DA CONTA</span>
                          </button>
                          
                          <div className="flex items-center justify-between text-xs font-bold text-gray-700 mt-1">
                            <span>DESDE {accountStats.memberSince}</span>
                            <span>V5.0</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Indicador de scroll na parte inferior */}
                      <div className="h-1 bg-gradient-to-t from-gray-300 to-transparent"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay removido - usando onClick no container principal */}
    </>
  )
}
