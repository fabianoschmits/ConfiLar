'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { NavigationLink } from '@/components/ui/NavigationLink'
import { cn } from '@/lib/utils'
import { 
  Home,
  Search,
  Briefcase,
  MessageCircle,
  User,
  Users
} from 'lucide-react'

export function ModernBottomNavigation() {
  const pathname = usePathname()
  const { user, profile } = useAuthContext()

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const navigationItems = [
    {
      href: '/home',
      label: 'Home',
      icon: Home,
      active: isActive('/home')
    },
    {
      href: '/feed',
      label: 'Feed',
      icon: Users,
      active: isActive('/feed')
    },
    {
      href: '/buscar',
      label: 'Buscar',
      icon: Search,
      active: isActive('/buscar')
    },
    {
      href: '/classificados',
      label: 'Classificados',
      icon: Briefcase,
      active: isActive('/classificados')
    },
    {
      href: `/perfil/${profile.id}`,
      label: 'Perfil',
      icon: User,
      active: isActive('/perfil')
    }
  ]

  return (
    <div 
      className="lg:hidden bottom-nav-fixed bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => (
            <NavigationLink
              key={item.href}
              href={item.href}
              destination={item.label}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-[60px]",
                item.active
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1",
                item.active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              )} />
              <span className={cn(
                "text-xs font-medium",
                item.active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              )}>
                {item.label}
              </span>
            </NavigationLink>
          ))}
        </div>
      </div>
    </div>
  )
}

