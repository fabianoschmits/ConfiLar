'use client'

import React from 'react'
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
  Star as StarPhosphor,
  Users as UsersPhosphor
} from '@phosphor-icons/react'

export function MobileBottomNavigation() {
  const pathname = usePathname()
  const { user, profile } = useAuthContext()
  const { unreadCount } = useSupabaseNotifications()

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/home',
      icon: House,
      description: 'Página inicial'
    },
    {
      id: 'search',
      label: 'Buscar',
      href: '/buscar',
      icon: MagnifyingGlass,
      description: 'Encontrar profissionais'
    },
    {
      id: 'messages',
      label: 'Chat',
      href: '/mensagens',
      icon: ChatTeardrop,
      description: 'Mensagens',
      badge: unreadCount > 0 ? unreadCount.toString() : undefined
    },
    {
      id: 'notifications',
      label: 'Alertas',
      href: '/notificacoes',
      icon: BellPhosphor,
      description: 'Notificações',
      badge: unreadCount > 0 ? unreadCount.toString() : undefined
    },
    {
      id: 'profile',
      label: 'Perfil',
      href: '/perfil',
      icon: User,
      description: 'Meu perfil'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] relative",
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <div className="relative">
                <Icon 
                  size={20} 
                  weight={active ? "fill" : "light"} 
                  className={cn(
                    "transition-all duration-200",
                    active ? "text-blue-600" : "text-gray-500"
                  )}
                />
                {item.badge && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white border-2 border-white"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium mt-1 transition-all duration-200",
                active ? "text-blue-600" : "text-gray-500"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
