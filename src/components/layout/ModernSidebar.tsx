'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { NavigationLink } from '@/components/ui/NavigationLink'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Home,
  BarChart3,
  Search,
  Briefcase,
  Users,
  Star,
  MessageCircle,
  Heart,
  Calendar,
  FileText,
  Award,
  HelpCircle,
  Phone,
  Building,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'

interface SidebarItem {
  id: string
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  badgeColor?: string
  description?: string
  onClick?: () => void
}

interface SidebarCategory {
  id: string
  title: string
  icon: React.ReactNode
  items: SidebarItem[]
  color?: string
}

export function ModernSidebar() {
  const pathname = usePathname()
  const { user, profile } = useAuthContext()
  const { unreadCount } = useSupabaseNotifications()
  const { openChat } = useFloatingChat()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  // Sempre renderizar o componente para navegação
  const isLoggedIn = user && profile

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Recolher todos os menus a cada atualização da página
  useEffect(() => {
    setExpandedCategories([])
  }, [pathname])

  // Categorias principais da sidebar
  const sidebarCategories: SidebarCategory[] = [
    {
      id: 'main',
      title: 'Principal',
      icon: <Home className="h-5 w-5" />,
      color: 'blue',
      items: [
        {
          id: 'home',
          title: 'Dashboard',
          href: '/home',
          icon: <Home className="h-4 w-4" />,
          description: 'Visão geral'
        },
        {
          id: 'dashboard',
          title: 'Métricas',
          href: '/dashboard',
          icon: <BarChart3 className="h-4 w-4" />,
          description: 'Estatísticas'
        },
      ]
    },
    {
      id: 'discovery',
      title: 'Descobrir',
      icon: <Search className="h-5 w-5" />,
      color: 'green',
      items: [
        {
          id: 'search',
          title: 'Buscar Profissionais',
          href: '/buscar',
          icon: <Search className="h-4 w-4" />,
          description: 'Encontre profissionais'
        },
        {
          id: 'classificados',
          title: 'Classificados',
          href: '/classificados',
          icon: <Briefcase className="h-4 w-4" />,
          description: 'Anúncios e ofertas'
        },
        {
          id: 'feed',
          title: 'Feed Social',
          href: '/feed',
          icon: <Users className="h-4 w-4" />,
          description: 'Atualizações'
        },
        {
          id: 'reviews',
          title: 'Avaliações',
          href: '/avaliacoes',
          icon: <Star className="h-4 w-4" />,
          description: 'Avalie serviços'
        }
      ]
    },
    {
      id: 'communication',
      title: 'Comunicação',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'purple',
      items: [
        ...(isLoggedIn ? [{
          id: 'messages',
          title: 'Mensagens',
          href: '#',
          icon: <MessageCircle className="h-4 w-4" />,
          badge: unreadCount > 0 ? unreadCount.toString() : undefined,
          badgeColor: 'bg-red-500',
          description: 'Chat com profissionais',
          onClick: () => openChat()
        }] : [{
          id: 'login',
          title: 'Fazer Login',
          href: '/auth',
          icon: <User className="h-4 w-4" />,
          description: 'Acesse sua conta'
        }])
      ]
    },
    ...(isLoggedIn ? [{
      id: 'management',
      title: 'Gestão',
      icon: <Calendar className="h-5 w-5" />,
      color: 'orange',
      items: [
        {
          id: 'favorites',
          title: 'Favoritos',
          href: '/favoritos',
          icon: <Heart className="h-4 w-4" />,
          description: 'Profissionais favoritos'
        },
      ]
    }] : []),
    ...(isLoggedIn && profile?.user_type === 'professional' ? [{
      id: 'professional',
      title: 'Profissional',
      icon: <Briefcase className="h-5 w-5" />,
      color: 'indigo',
      items: [
        {
          id: 'portfolio',
          title: 'Meu Portfólio',
          href: '/portfolio',
          icon: <FileText className="h-4 w-4" />,
          description: 'Mostre seu trabalho'
        },
        {
          id: 'reputation',
          title: 'Reputação',
          href: '/reputacao',
          icon: <Award className="h-4 w-4" />,
          description: 'Sua avaliação'
        }
      ]
    }] : []),
    {
      id: 'support',
      title: 'Suporte',
      icon: <HelpCircle className="h-5 w-5" />,
      color: 'red',
      items: [
        {
          id: 'help',
          title: 'Central de Ajuda',
          href: '/ajuda',
          icon: <HelpCircle className="h-4 w-4" />,
          description: 'Tire suas dúvidas'
        },
        {
          id: 'contact',
          title: 'Contato',
          href: '/contato',
          icon: <Phone className="h-4 w-4" />,
          description: 'Fale conosco'
        },
        {
          id: 'about',
          title: 'Sobre Nós',
          href: '/sobre',
          icon: <Building className="h-4 w-4" />,
          description: 'Conheça a ConfiLar'
        }
      ]
    },
    ...(isLoggedIn ? [{
      id: 'account',
      title: 'Conta',
      icon: <User className="h-5 w-5" />,
      color: 'gray',
      items: [
        {
          id: 'profile',
          title: 'Meu Perfil',
          href: '/perfil',
          icon: <User className="h-4 w-4" />,
          description: 'Editar perfil'
        },
        {
          id: 'edit-profile',
          title: 'Editar Perfil',
          href: '/editarperfil',
          icon: <Settings className="h-4 w-4" />,
          description: 'Atualizar informações'
        },
        {
          id: 'verification',
          title: 'Verificação',
          href: '/verificacao',
          icon: <Shield className="h-4 w-4" />,
          description: 'Verificar identidade'
        },
        {
          id: 'logout',
          title: 'Sair',
          href: '/auth',
          icon: <LogOut className="h-4 w-4" />,
          description: 'Desconectar'
        }
      ]
    }] : [])
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: 'text-gray-600 bg-gray-100',
      green: 'text-gray-600 bg-gray-100',
      purple: 'text-gray-600 bg-gray-100',
      orange: 'text-gray-600 bg-gray-100',
      indigo: 'text-gray-600 bg-gray-100',
      red: 'text-gray-600 bg-gray-100',
      gray: 'text-gray-600 bg-gray-100'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <>
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Moderna */}
      <div className={`
        fixed left-0 top-0 h-full bg-gray-50 border-r border-gray-200 shadow-sm z-50
        w-64 transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full lg:translate-x-0'}
      `}>
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-100">
          <Link href="/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">ConfiLar</span>
              <p className="text-xs text-gray-500">Marketplace</p>
            </div>
          </Link>
        </div>

        {/* Conteúdo da Sidebar */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-2">
            {sidebarCategories.map((category) => (
              <div key={category.id} className="space-y-1">
                {/* Cabeçalho da Categoria */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${getCategoryColor(category.color || 'blue')}`}
                >
                  <div className="flex items-center space-x-2">
                    {category.icon}
                    <span>{category.title}</span>
                  </div>
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {/* Itens da Categoria */}
                {expandedCategories.includes(category.id) && (
                  <div className="ml-4 space-y-1">
                    {category.items.map((item) => (
                      item.onClick ? (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.onClick?.()
                            setIsMobileOpen(false)
                          }}
                          className={`
                            group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors w-full text-left
                            ${isActive(item.href)
                              ? 'bg-gray-200 text-gray-800 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`${isActive(item.href) ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-700'}`}>
                              {item.icon}
                            </div>
                            <div>
                              <span className="block">{item.title}</span>
                              {item.description && (
                                <span className="text-xs text-gray-500">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.badge && (
                            <Badge variant="destructive" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      ) : (
                        <NavigationLink
                          key={item.id}
                          href={item.href}
                          destination={item.title}
                          onClick={() => setIsMobileOpen(false)}
                          className={`
                            group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                            ${isActive(item.href)
                              ? 'bg-gray-200 text-gray-800 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`${isActive(item.href) ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-700'}`}>
                              {item.icon}
                            </div>
                            <div>
                              <span className="block">{item.title}</span>
                              {item.description && (
                                <span className="text-xs text-gray-500">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.badge && (
                            <Badge variant="destructive" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </NavigationLink>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Informações do Usuário */}
        {isLoggedIn && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2">
              {/* Status do Usuário */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 font-medium">
                  {profile?.user_type === 'professional' ? 'Profissional Ativo' : 'Cliente Ativo'}
                </span>
              </div>
              
              {/* Localização */}
              {profile?.location_city && profile?.location_state && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="truncate">
                    {profile.location_city}, {profile.location_state}
                  </span>
                </div>
              )}
              
              {/* Membro desde */}
              <div className="text-xs text-gray-500">
                Membro desde {profile?.created_at 
                  ? new Date(profile.created_at).getFullYear() 
                  : '2024'
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Espaçador para o conteúdo principal */}
      <div className="w-64 transition-all duration-300 ease-in-out" />
    </>
  )
}

