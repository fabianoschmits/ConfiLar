'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  Search,
  Users,
  Star,
  Calendar,
  Heart,
  CreditCard,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Phone,
  Building2,
  MapPin,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarItem {
  id: string
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  badgeColor?: string
}

interface SidebarCategory {
  id: string
  title: string
  icon: React.ReactNode
  items: SidebarItem[]
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile } = useAuthContext()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Só renderiza o componente se o usuário estiver logado
  if (!user || !profile) {
    return null;
  }

  // Categorias principais da sidebar (sem opções de perfil)
  const sidebarCategories: SidebarCategory[] = [
    {
      id: 'main',
      title: 'Principal',
      icon: <Home className="h-5 w-5" />,
      items: [
        {
          id: 'home',
          title: 'Início',
          href: '/',
          icon: <Home className="h-4 w-4" />
        },
        {
          id: 'dashboard',
          title: 'Dashboard',
          href: '/dashboard',
          icon: <Home className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'services',
      title: 'Serviços',
      icon: <Search className="h-5 w-5" />,
      items: [
        {
          id: 'search',
          title: 'Buscar Profissionais',
          href: '/buscar',
          icon: <Search className="h-4 w-4" />
        },
        {
          id: 'classificados',
          title: 'Classificados',
          href: '/classificados',
          icon: <Briefcase className="h-4 w-4" />
        },
        {
          id: 'feed',
          title: 'Feed Social',
          href: '/feed',
          icon: <Users className="h-4 w-4" />
        },
        {
          id: 'reviews',
          title: 'Avaliações',
          href: '/avaliacoes',
          icon: <Star className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'management',
      title: 'Gestão',
      icon: <Calendar className="h-5 w-5" />,
      items: [
        {
          id: 'schedule',
          title: 'Agendamentos',
          href: '/agendamentos',
          icon: <Calendar className="h-4 w-4" />
        },
        {
          id: 'agenda',
          title: 'Agenda Profissional',
          href: '/agenda',
          icon: <Calendar className="h-4 w-4" />
        },
        {
          id: 'favorites',
          title: 'Favoritos',
          href: '/favoritos',
          icon: <Heart className="h-4 w-4" />
        },
        {
          id: 'payments',
          title: 'Pagamentos',
          href: '/pagamentos',
          icon: <CreditCard className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'support',
      title: 'Suporte',
      icon: <HelpCircle className="h-5 w-5" />,
      items: [
        {
          id: 'help',
          title: 'Central de Ajuda',
          href: '/ajuda',
          icon: <HelpCircle className="h-4 w-4" />
        },
        {
          id: 'contact',
          title: 'Contato',
          href: '/contato',
          icon: <Phone className="h-4 w-4" />
        },
        {
          id: 'about',
          title: 'Sobre Nós',
          href: '/sobre',
          icon: <Building2 className="h-4 w-4" />
        }
      ]
    }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64'
  const sidebarTransition = 'transition-all duration-300 ease-in-out'

  return (
    <>
      {/* Botão Mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-30
        ${sidebarWidth} ${sidebarTransition}
        ${isMobileOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full lg:translate-x-0'}
      `}>
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Confilar</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Conteúdo da Sidebar */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-2">
            {sidebarCategories.map((category) => (
              <div key={category.id} className="space-y-1">
                {/* Cabeçalho da Categoria */}
                <div className="px-2 py-1">
                  {!isCollapsed && (
                    <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {category.icon}
                      <span>{category.title}</span>
                    </div>
                  )}
                </div>

                {/* Itens da Categoria */}
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive(item.href)
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                        }
                      `}
                    >
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge 
                              className={`text-xs ${item.badgeColor || 'bg-gray-500'} text-white`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Indicador DEV */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600">
            DEV
          </Badge>
        </div>

        {/* Informações do Usuário */}
        {!isCollapsed && (
          <div className="absolute bottom-16 left-2 right-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {profile?.location_city && profile?.location_state
                    ? `${profile.location_city}, ${profile.location_state}`
                    : 'Localização não informada'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Phone className="h-3 w-3" />
                <span className="truncate">
                  {profile?.phone || 'Telefone não informado'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>
                  Membro desde {profile?.created_at 
                    ? new Date(profile.created_at).getFullYear() 
                    : '2024'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Espaçador para o conteúdo principal */}
      <div className={`${sidebarWidth} ${sidebarTransition}`} />
    </>
  )
}
