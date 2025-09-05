'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
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
  Lightning
} from '@phosphor-icons/react'

export function MobileBottomNavigation() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuthContext()
  const { unreadCount } = useSupabaseNotifications()
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
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="relative">
        {/* Barra Principal - Sempre Visível */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Links Principais */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.location.href = '/home'}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                  isActive('/home')
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <House size={24} weight={isActive('/home') ? "fill" : "light"} />
                <span className="text-xs font-medium mt-1">Home</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/buscar'}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                  isActive('/buscar')
                    ? "bg-green-100 text-green-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <MagnifyingGlass size={24} weight={isActive('/buscar') ? "fill" : "light"} />
                <span className="text-xs font-medium mt-1">Buscar</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/classificados'}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                  isActive('/classificados')
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <BriefcasePhosphor size={24} weight={isActive('/classificados') ? "fill" : "light"} />
                <span className="text-xs font-medium mt-1">Classificados</span>
              </button>
            </div>

            {/* Botão de Expansão */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              {isExpanded ? <CaretDown size={18} weight="light" /> : <CaretUp size={18} weight="light" />}
            </button>
          </div>
        </div>

        {/* Menu Expandido */}
        {isExpanded && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 max-h-[60vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Ações Rápidas */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <Lightning size={14} weight="light" className="mr-2 text-yellow-500" />
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <Link
                    href="/notificacoes"
                    className="flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <BellPhosphor size={16} weight="light" className="text-purple-600 mb-1" />
                    <span className="text-xs font-medium">Notificações</span>
                    {unreadCount > 0 && (
                      <Badge className="mt-1 bg-blue-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/favoritos"
                    className="flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <HeartPhosphor size={16} weight="light" className="text-red-600 mb-1" />
                    <span className="text-xs font-medium">Favoritos</span>
                  </Link>
                  <Link
                    href="/agendamentos"
                    className="flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <CalendarPhosphor size={16} weight="light" className="text-green-600 mb-1" />
                    <span className="text-xs font-medium">Agendamentos</span>
                  </Link>
                  <Link
                    href="/feed"
                    className="flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <UsersPhosphor size={16} weight="light" className="text-blue-600 mb-1" />
                    <span className="text-xs font-medium">Feed</span>
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
                  {profile?.user_type === 'professional' && (
                    <>
                      <Link
                        href="/portfolio"
                        className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsExpanded(false)}
                      >
                        <BriefcasePhosphor size={14} weight="light" className="text-purple-600" />
                        <span>Portfólio</span>
                      </Link>
                      <Link
                        href="/ganhos"
                        className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsExpanded(false)}
                      >
                        <TrendUp size={14} weight="light" className="text-green-600" />
                        <span>Ganhos</span>
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
                    href="/contato"
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
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Membro desde {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}</span>
                  <span>v5.0</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                >
                  <SignOut size={14} weight="light" />
                  <span>Sair da Conta</span>
                </button>
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