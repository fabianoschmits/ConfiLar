'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'

// Tabler Icons - Estilo Brutalista
import {
  IconHome,
  IconSearch,
  IconMessageCircle,
  IconBell,
  IconUser,
  IconArrowLeft,
  IconMenu2,
  IconPlus,
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
  showQuickActions?: boolean
  onBackClick?: () => void
  onMenuClick?: () => void
  onQuickActionsClick?: () => void
}

export function BrutalistHeader({
  showBackButton = false,
  title,
  showMenuButton = false,
  showQuickActions = true,
  onBackClick,
  onMenuClick,
  onQuickActionsClick
}: BrutalistHeaderProps) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuthContext()
  const { openChat } = useFloatingChat()
  const { unreadCount } = useSupabaseNotifications()
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  const getPageTitle = () => {
    if (title) return title
    
    const pathTitles: Record<string, string> = {
      '/home': 'HOME',
      '/buscar': 'BUSCAR PROFISSIONAIS',
      '/classificados': 'CLASSIFICADOS',
      '/feed': 'FEED SOCIAL',
      '/mensagens': 'MENSAGENS',
      '/perfil': 'MEU PERFIL',
      '/agendamentos': 'AGENDAMENTOS',
      '/agenda': 'AGENDA',
      '/favoritos': 'FAVORITOS',
      '/portfolio': 'MEU PORTFÓLIO',
      '/ganhos': 'GANHOS',
      '/reputacao': 'REPUTAÇÃO',
      '/ajuda': 'CENTRAL DE AJUDA',
      '/contato': 'CONTATO',
      '/sobre': 'SOBRE NÓS'
    }
    
    return pathTitles[pathname] || 'CONFILAR'
  }

  const handleSignOut = async () => {
    try {
      setIsMenuExpanded(false)
      window.location.href = '/logout'
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  // Dados mockados para demonstração
  const accountStats = {
    totalServices: profile?.user_type === 'professional' ? 45 : 12,
    completedServices: profile?.user_type === 'professional' ? 38 : 10,
    rating: 4.8,
    totalEarnings: profile?.user_type === 'professional' ? 15420.50 : 0,
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
            {showQuickActions && (
              <button
                onClick={onQuickActionsClick}
                className="p-2 h-10 w-10 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
              >
                <IconPlus size={20} stroke={2} />
              </button>
            )}
            
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
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[9999]">
                  <div className="p-4 space-y-4">
                    {/* Header do Perfil */}
                    <div className="text-center pb-4 border-b-4 border-black">
                      <div className="flex justify-center mb-2">
                        <UserAvatar 
                          src={profile?.avatar_url}
                          alt={profile?.full_name || 'Usuário'}
                          fallback={profile?.full_name?.charAt(0) || 'U'}
                          size="md"
                        />
                      </div>
                      <h3 className="font-black text-black text-lg">
                        {(profile?.full_name || 'USUÁRIO').toUpperCase()}
                      </h3>
                      <p className="text-sm font-bold text-gray-700 mb-2">
                        {profile?.user_type === 'professional' ? 'PROFISSIONAL' : 'CLIENTE'}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        {getVerificationBadge()}
                        {getPremiumBadge()}
                      </div>
                    </div>

                    {/* Estatísticas Rápidas */}
                    <div className="bg-yellow-400 border-4 border-black p-3">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-xl font-black text-black">{accountStats.totalServices}</div>
                          <div className="text-xs font-bold text-gray-700">SERVIÇOS</div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-black">{accountStats.rating}</div>
                          <div className="text-xs font-bold text-gray-700">AVALIAÇÃO</div>
                        </div>
                      </div>
                      {profile?.user_type === 'professional' && (
                        <div className="mt-2 pt-2 border-t-2 border-black text-center">
                          <div className="text-sm font-black text-black">
                            R$ {accountStats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs font-bold text-gray-700">GANHOS TOTAIS</div>
                        </div>
                      )}
                    </div>

                    {/* Ações Rápidas */}
                    <div>
                      <h3 className="text-sm font-black text-black mb-2 flex items-center">
                        <IconBolt size={16} stroke={2} className="mr-2 text-yellow-500" />
                        AÇÕES RÁPIDAS
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            openChat()
                            setIsMenuExpanded(false)
                          }}
                          className="flex flex-col items-center p-3 bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                        >
                          <IconMessageCircle size={16} stroke={2} className="mb-1" />
                          <span className="text-xs">MENSAGENS</span>
                          {unreadCount > 0 && (
                            <span className="mt-1 px-1 py-0.5 text-xs font-black bg-white text-red-500 border border-black">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                        <Link
                          href="/favoritos"
                          className="flex flex-col items-center p-3 bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                          onClick={() => setIsMenuExpanded(false)}
                        >
                          <IconHeart size={16} stroke={2} className="mb-1" />
                          <span className="text-xs">FAVORITOS</span>
                        </Link>
                        <Link
                          href="/agenda"
                          className="flex flex-col items-center p-3 bg-blue-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                          onClick={() => setIsMenuExpanded(false)}
                        >
                          <IconCalendar size={16} stroke={2} className="mb-1" />
                          <span className="text-xs">AGENDA</span>
                        </Link>
                        <Link
                          href="/ajuda"
                          className="flex flex-col items-center p-3 bg-purple-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                          onClick={() => setIsMenuExpanded(false)}
                        >
                          <IconHelp size={16} stroke={2} className="mb-1" />
                          <span className="text-xs">AJUDA</span>
                        </Link>
                      </div>
                    </div>

                    {/* Conta e Perfil */}
                    <div>
                      <h3 className="text-sm font-black text-black mb-2 flex items-center">
                        <IconUser size={16} stroke={2} className="mr-2 text-blue-500" />
                        MINHA CONTA
                      </h3>
                      <div className="space-y-1">
                        <Link
                          href={`/perfil/${profile?.id}`}
                          className="flex items-center space-x-2 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                          onClick={() => setIsMenuExpanded(false)}
                        >
                          <IconEye size={14} stroke={2} className="text-blue-600" />
                          <span>VER MEU PERFIL</span>
                        </Link>
                        <Link
                          href="/editarperfil"
                          className="flex items-center space-x-2 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                          onClick={() => setIsMenuExpanded(false)}
                        >
                          <IconEdit size={14} stroke={2} className="text-green-600" />
                          <span>EDITAR PERFIL</span>
                        </Link>
                        {profile?.user_type === 'professional' && (
                          <>
                            <Link
                              href="/portfolio"
                              className="flex items-center space-x-2 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                              onClick={() => setIsMenuExpanded(false)}
                            >
                              <IconBriefcase size={14} stroke={2} className="text-purple-600" />
                              <span>MEU PORTFÓLIO</span>
                            </Link>
                            <Link
                              href="/ganhos"
                              className="flex items-center space-x-2 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                              onClick={() => setIsMenuExpanded(false)}
                            >
                              <IconTrendingUp size={14} stroke={2} className="text-green-600" />
                              <span>MEUS GANHOS</span>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Botão de Sair */}
                    <div className="border-t-4 border-black pt-3">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-black text-white bg-red-500 hover:bg-red-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all w-full"
                      >
                        <IconLogout size={16} stroke={2} />
                        <span>SAIR DA CONTA</span>
                      </button>
                      
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mt-2">
                        <span>MEMBRO DESDE {accountStats.memberSince}</span>
                        <span>V5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar ao clicar fora */}
      {isMenuExpanded && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsMenuExpanded(false)}
        />
      )}
    </>
  )
}
