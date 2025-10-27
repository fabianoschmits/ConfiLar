'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Users, Search, Briefcase, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useAuthContext } from '@/contexts/AuthContext'

interface QuickActionItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export function QuickActionMenu() {
  const pathname = usePathname()
  const { isVisible } = useScrollDirection()
  const { user, profile } = useAuthContext()

  // Não renderizar se o usuário não estiver logado
  if (!user || !profile) {
    return null
  }

  const quickActions: QuickActionItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/home',
      icon: Home
    },
    {
      id: 'feed',
      label: 'Feed',
      href: '/feed',
      icon: Users
    },
    {
      id: 'search',
      label: 'Buscar',
      href: '/buscar',
      icon: Search
    },
    {
      id: 'classifieds',
      label: 'Classificados',
      href: '/classificados',
      icon: Briefcase
    },
    {
      id: 'profile',
      label: 'Perfil',
      href: `/perfil/${profile.id}`,
      icon: User
    }
  ]

  return (
    <div
      className={cn(
        'lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[72px] opacity-0 pointer-events-none'
      )}
    >
      <nav className="bg-white dark:bg-[#1b1b1b] rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl backdrop-blur-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
          {quickActions.map((action) => {
            const Icon = action.icon
            const isActive = pathname === action.href || pathname.startsWith(action.href)
            
            return (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col items-center gap-1 relative transition-all duration-200 hover:scale-110"
              >
                {/* Badge de notificação */}
                {action.badge && action.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
                
                {/* Ícone */}
                <div className={cn(
                  'transition-colors duration-200',
                  isActive 
                    ? 'text-orange-500 dark:text-orange-500' 
                    : 'text-gray-600 dark:text-white'
                )}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                
                {/* Label */}
                <span className={cn(
                  'text-[10px] sm:text-xs font-medium transition-colors duration-200',
                  isActive 
                    ? 'text-orange-500 dark:text-orange-500' 
                    : 'text-gray-600 dark:text-white'
                )}>
                  {action.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
