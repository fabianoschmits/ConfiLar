'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Users, 
  Search, 
  Briefcase, 
  User, 
  LogIn, 
  UserPlus, 
  Mail, 
  FileText, 
  Info, 
  HelpCircle 
} from 'lucide-react'
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

  // Menu para usuários não logados (página inicial e outras públicas)
  const publicQuickActions: QuickActionItem[] = [
    {
      id: 'register',
      label: 'Cadastro',
      href: '/auth?tab=register',
      icon: UserPlus
    },
    {
      id: 'login',
      label: 'Login',
      href: '/auth',
      icon: LogIn
    },
    {
      id: 'about',
      label: 'Sobre',
      href: '/sobre',
      icon: Info
    },
    {
      id: 'help',
      label: 'Ajuda',
      href: '/ajuda',
      icon: HelpCircle
    },
    {
      id: 'terms',
      label: 'Termos',
      href: '/termos',
      icon: FileText
    },
    {
      id: 'contact',
      label: 'Contato',
      href: 'mailto:contato@appconfilar.com.br',
      icon: Mail
    }
  ]

  // Menu para usuários logados
  const loggedInQuickActions: QuickActionItem[] = [
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
      href: profile ? `/perfil/${profile.id}` : '/home',
      icon: User
    }
  ]

  // Usar ações públicas se não estiver logado, senão usar ações de logado
  const quickActions = (!user || !profile) ? publicQuickActions : loggedInQuickActions

  return (
    <div
      className={cn(
        'lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[72px] opacity-0 pointer-events-none'
      )}
    >
      <nav className="bg-white dark:bg-black rounded-full px-1.5 sm:px-3 py-2 sm:py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl backdrop-blur-md border border-gray-200 dark:border-gray-900 overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 nowrap min-w-max">
          {quickActions.map((action) => {
            const Icon = action.icon
            // Para contato (mailto), usar <a> em vez de <Link>
            const isContact = action.id === 'contact'
            // Para mailto, não verificar pathname
            const isActive = isContact ? false : (pathname === action.href || pathname.startsWith(action.href))

            const content = (
              <>
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
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                
                {/* Label */}
                <span className={cn(
                  'text-[8px] sm:text-[9px] font-medium transition-colors duration-200 whitespace-nowrap',
                  isActive 
                    ? 'text-orange-500 dark:text-orange-500' 
                    : 'text-gray-600 dark:text-white'
                )}>
                  {action.label}
                </span>
              </>
            )

            return isContact ? (
              <a
                key={action.id}
                href={action.href}
                className="flex flex-col items-center gap-1 relative transition-all duration-200 hover:scale-110"
              >
                {content}
              </a>
            ) : (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col items-center gap-1 relative transition-all duration-200 hover:scale-110"
              >
                {content}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
