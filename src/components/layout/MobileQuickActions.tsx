'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Phosphor Icons Light
import {
  House,
  MagnifyingGlass,
  ChatTeardrop,
  Bell as BellPhosphor,
  User,
  Heart as HeartPhosphor,
  Calendar as CalendarPhosphor,
  Briefcase as BriefcasePhosphor,
  Users as UsersPhosphor,
  Gear,
  Question,
  Phone as PhonePhosphor,
  Info as InfoPhosphor,
  SignOut,
  CaretUp,
  CaretDown,
  Eye as EyePhosphor,
  PencilSimple,
  TrendUp,
  Lightning,
  Plus
} from '@phosphor-icons/react'

export function MobileQuickActions() {
  const pathname = usePathname()
  const { user, profile } = useAuthContext()
  const { unreadCount } = useSupabaseNotifications()
  const { openChat } = useFloatingChat()
  const [isExpanded, setIsExpanded] = useState(false)

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  const handleSignOut = async () => {
    try {
      setIsExpanded(false)
      window.location.href = '/logout'
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="lg:hidden fixed top-4 right-4 z-50">
      <div className="relative">
        {/* Botão Principal - Sempre Visível */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
        >
          <Plus size={20} weight="light" className="text-gray-700" />
        </button>

        {/* Menu Expandido */}
        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 max-h-[70vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="text-center pb-3 border-b border-gray-100">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Ações Rápidas</h3>
                <p className="text-xs text-gray-500">
                  {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'} • 
                  Membro desde {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
                </p>
              </div>

              {/* Links Principais */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <Lightning size={14} weight="light" className="mr-2 text-yellow-500" />
                  Navegação Principal
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/home"
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive('/home')
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setIsExpanded(false)}
                  >
                    <House size={16} weight={isActive('/home') ? "fill" : "light"} className="text-blue-600" />
                    <span className="text-sm font-medium">Home</span>
                  </Link>
                  <Link
                    href="/buscar"
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive('/buscar')
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setIsExpanded(false)}
                  >
                    <MagnifyingGlass size={16} weight={isActive('/buscar') ? "fill" : "light"} className="text-green-600" />
                    <span className="text-sm font-medium">Buscar</span>
                  </Link>
                  <Link
                    href="/classificados"
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive('/classificados')
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setIsExpanded(false)}
                  >
                    <BriefcasePhosphor size={16} weight={isActive('/classificados') ? "fill" : "light"} className="text-purple-600" />
                    <span className="text-sm font-medium">Classificados</span>
                  </Link>
                  <button
                    onClick={() => {
                      openChat()
                      setIsExpanded(false)
                    }}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors relative w-full text-left",
                      isActive('/mensagens')
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <ChatTeardrop size={16} weight={isActive('/mensagens') ? "fill" : "light"} className="text-blue-600" />
                    <span className="text-sm font-medium">Mensagens</span>
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </button>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <Lightning size={14} weight="light" className="mr-2 text-yellow-500" />
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/notificacoes"
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <BellPhosphor size={16} weight="light" className="text-purple-600" />
                    <span className="text-sm font-medium">Notificações</span>
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-blue-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/favoritos"
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <HeartPhosphor size={16} weight="light" className="text-red-600" />
                    <span className="text-sm font-medium">Favoritos</span>
                  </Link>
                  <Link
                    href="/_public/agendamentos"
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <CalendarPhosphor size={16} weight="light" className="text-green-600" />
                    <span className="text-sm font-medium">Agendamentos</span>
                  </Link>
                  <Link
                    href="/feed"
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <UsersPhosphor size={16} weight="light" className="text-blue-600" />
                    <span className="text-sm font-medium">Feed Social</span>
                  </Link>
                </div>
              </div>

              {/* Minha Conta */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <User size={14} weight="light" className="mr-2 text-blue-500" />
                  Minha Conta
                </h3>
                <div className="space-y-1">
                  <Link
                    href={`/perfil/${profile?.id}`}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <EyePhosphor size={14} weight="light" className="text-blue-600" />
                    <span>Ver Perfil</span>
                  </Link>
                  <Link
                    href="/editarperfil"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <PencilSimple size={14} weight="light" className="text-green-600" />
                    <span>Editar Perfil</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                  >
                    <SignOut size={14} weight="light" />
                    <span>Sair da Conta</span>
                  </button>
                  {profile?.user_type === 'professional' && (
                    <>
                      <Link
                        href="/portfolio"
                        className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsExpanded(false)}
                      >
                        <BriefcasePhosphor size={14} weight="light" className="text-purple-600" />
                        <span>Meu Portfólio</span>
                      </Link>
                      <Link
                        href="/_public/ganhos"
                        className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsExpanded(false)}
                      >
                        <TrendUp size={14} weight="light" className="text-green-600" />
                        <span>Meus Ganhos</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Configurações */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <Gear size={14} weight="light" className="mr-2 text-gray-500" />
                  Configurações
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/ajuda"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Question size={14} weight="light" className="text-blue-600" />
                    <span>Central de Ajuda</span>
                  </Link>
                  <Link
                    href="/_public/contato"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <PhonePhosphor size={14} weight="light" className="text-green-600" />
                    <span>Contato</span>
                  </Link>
                  <Link
                    href="/sobre"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <InfoPhosphor size={14} weight="light" className="text-purple-600" />
                    <span>Sobre a ConfiLar</span>
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>v5.0</span>
                  <span>ConfiLar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overlay para fechar ao clicar fora */}
        {isExpanded && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    </div>
  )
}