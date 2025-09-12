'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { useNavigationWithLoading } from '@/hooks/useLoading'
import { NavigationLink } from '@/components/ui/NavigationLink'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Tabler Icons - Estilo Brutalista
import {
  IconHome,
  IconSearch,
  IconMessageCircle,
  IconBell,
  IconUser,
  IconHeart,
  IconCalendar,
  IconCreditCard,
  IconHelp,
  IconPhone,
  IconSettings,
  IconBuilding,
  IconMapPin,
  IconBriefcase,
  IconChartLine,
  IconStar,
  IconClock,
  IconWallet,
  IconTrendingUp,
  IconFileText,
  IconShield,
  IconBolt,
  IconEye,
  IconWorld,
  IconBook,
  IconTrophy,
  IconChevronRight,
  IconChevronLeft,
  IconChevronUp,
  IconChevronDown,
  IconUsers,
  IconLogout,
  IconEdit,
  IconChartBar,
  IconInfoCircle
} from '@tabler/icons-react'

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
        {/* Barra Principal Brutalista */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Links Principais */}
            <div className="flex items-center space-x-1">
              <NavigationLink
                href="/home"
                destination="Home"
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 min-w-[50px] border-2 border-black font-black text-xs",
                  isActive('/home')
                    ? "bg-blue-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <IconHome size={20} stroke={2} />
                <span className="font-black mt-1">HOME</span>
              </NavigationLink>
              
              <NavigationLink
                href="/dashboard"
                destination="Dashboard"
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 min-w-[50px] border-2 border-black font-black text-xs",
                  isActive('/dashboard')
                    ? "bg-indigo-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <IconChartBar size={20} stroke={2} />
                <span className="font-black mt-1">DASH</span>
              </NavigationLink>
              
              <NavigationLink
                href="/buscar"
                destination="Buscar"
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 min-w-[50px] border-2 border-black font-black text-xs",
                  isActive('/buscar')
                    ? "bg-green-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <IconSearch size={20} stroke={2} />
                <span className="font-black mt-1">BUSCAR</span>
              </NavigationLink>
              
              <NavigationLink
                href="/classificados"
                destination="Classificados"
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 min-w-[50px] border-2 border-black font-black text-xs",
                  isActive('/classificados')
                    ? "bg-purple-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <IconBriefcase size={20} stroke={2} />
                <span className="font-black mt-1">CLASS</span>
              </NavigationLink>
            </div>

            {/* Botão de Expansão Brutalista */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-10 h-10 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
            >
              {isExpanded ? <IconChevronDown size={18} stroke={2} /> : <IconChevronUp size={18} stroke={2} />}
            </button>
          </div>
        </div>

        {/* Menu Expandido Brutalista */}
        {isExpanded && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[60vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Ações Rápidas */}
              <div>
                <h3 className="text-sm font-black text-black mb-3 flex items-center">
                  <IconBolt size={16} stroke={2} className="mr-2 text-yellow-500" />
                  AÇÕES RÁPIDAS
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col items-center p-2 bg-red-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black">
                    <NotificationDropdown />
                    <span className="text-xs font-black mt-1">NOTIF</span>
                  </div>
                  <Link
                    href="/favoritos"
                    className="flex flex-col items-center p-2 bg-green-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                    onClick={() => setIsExpanded(false)}
                  >
                    <IconHeart size={16} stroke={2} className="mb-1" />
                    <span className="text-xs font-black">FAV</span>
                  </Link>
                  <Link
                    href="/agenda"
                    className="flex flex-col items-center p-2 bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                    onClick={() => setIsExpanded(false)}
                  >
                    <IconCalendar size={16} stroke={2} className="mb-1" />
                    <span className="text-xs font-black">AGENDA</span>
                  </Link>
                  <Link
                    href="/feed"
                    className="flex flex-col items-center p-2 bg-purple-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                    onClick={() => setIsExpanded(false)}
                  >
                    <IconUsers size={16} stroke={2} className="mb-1" />
                    <span className="text-xs font-black">FEED</span>
                  </Link>
                </div>
              </div>

              {/* Minha Conta */}
              <div>
                <h3 className="text-sm font-black text-black mb-3 flex items-center">
                  <IconUser size={16} stroke={2} className="mr-2 text-blue-500" />
                  MINHA CONTA
                </h3>
                <div className="space-y-1">
                  <Link
                    href={`/perfil/${profile?.id}`}
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                    onClick={() => setIsExpanded(false)}
                  >
                    <IconEye size={14} stroke={2} className="text-blue-600" />
                    <span>VER PERFIL</span>
                  </Link>
                  <Link
                    href="/editarperfil"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                    onClick={() => setIsExpanded(false)}
                  >
                    <IconEdit size={14} stroke={2} className="text-green-600" />
                    <span>EDITAR PERFIL</span>
                  </Link>
                  {profile?.user_type === 'professional' && (
                    <>
                      <Link
                        href="/portfolio"
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                        onClick={() => setIsExpanded(false)}
                      >
                        <IconBriefcase size={14} stroke={2} className="text-purple-600" />
                        <span>PORTFÓLIO</span>
                      </Link>
                      <Link
                        href="/ganhos"
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                        onClick={() => setIsExpanded(false)}
                      >
                        <IconTrendingUp size={14} stroke={2} className="text-green-600" />
                        <span>GANHOS</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Configurações */}
              <div>
                <h3 className="text-sm font-black text-black mb-3 flex items-center">
                  <IconSettings size={16} stroke={2} className="mr-2 text-gray-500" />
                  CONFIGURAÇÕES
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/ajuda"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                    onClick={() => setIsExpanded(false)}
                  >
                    <IconHelp size={14} stroke={2} className="text-blue-600" />
                    <span>CENTRAL DE AJUDA</span>
                  </Link>
                  <Link
                    href="/contato"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                    onClick={() => setIsExpanded(false)}
                  >
                    <IconPhone size={14} stroke={2} className="text-green-600" />
                    <span>CONTATO</span>
                  </Link>
                  <Link
                    href="/sobre"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 border-2 border-black transition-all"
                    onClick={() => setIsExpanded(false)}
                  >
                    <IconInfoCircle size={14} stroke={2} className="text-purple-600" />
                    <span>SOBRE A CONFILAR</span>
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t-4 border-black pt-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-3">
                  <span>MEMBRO DESDE {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}</span>
                  <span>V5.0</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-3 py-2 text-sm font-black text-white bg-red-500 hover:bg-red-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all w-full"
                >
                  <IconLogout size={14} stroke={2} />
                  <span>SAIR DA CONTA</span>
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