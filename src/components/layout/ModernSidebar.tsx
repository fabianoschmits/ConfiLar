'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  ChevronDown,
  UserPlus,
  Coins,
  Target,
  History,
  TrendingUp,
  Gift,
  Zap,
  Crown,
  Send,
  ShoppingCart
} from 'lucide-react'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { BrandLogo } from '@/components/common/BrandLogo'

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

  // Carregar estado das categorias expandidas do localStorage ao montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-expanded-categories')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setExpandedCategories(parsed)
          }
        } catch (error) {
          console.error('Erro ao carregar categorias expandidas:', error)
        }
      }
    }
  }, [])

  // Salvar estado das categorias expandidas no localStorage sempre que mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded-categories', JSON.stringify(expandedCategories))
    }
  }, [expandedCategories])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

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
          title: 'Home',
          href: '/home',
          icon: <Home className="h-4 w-4" />,
          description: 'Visão geral'
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
          id: 'search',
          title: 'Buscar',
          href: '/buscar',
          icon: <Search className="h-4 w-4" />,
          description: 'Profissionais/Clientes'
        },
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
        {
          id: 'reviews',
          title: 'Avaliações',
          href: '/avaliacoes',
          icon: <Star className="h-4 w-4" />,
          description: 'Avalie serviços'
        },
        {
          id: 'referrals-management',
          title: 'Indicações',
          href: '/indicacoes',
          icon: <UserPlus className="h-4 w-4" />,
          description: 'Indique e ganhe recompensas'
        },
        {
          id: 'messages',
          title: 'Mensagens',
          href: '#',
          icon: <MessageCircle className="h-4 w-4" />,
          badge: unreadCount > 0 ? unreadCount.toString() : undefined,
          badgeColor: 'bg-red-500',
          description: 'Chat com profissionais',
          onClick: () => openChat()
        },
      ]
    }] : []),
    ...(isLoggedIn ? [{
      id: 'confipoints',
      title: 'ConfiPoints',
      icon: <Coins className="h-5 w-5" />,
      color: 'yellow',
      items: [
        {
          id: 'confipoints-dashboard',
          title: 'Dashboard',
          href: '/confipoints/dashboard',
          icon: <BarChart3 className="h-4 w-4" />,
          description: 'Visão geral e histórico'
        },
        {
          id: 'confipoints-store',
          title: 'Loja Premium',
          href: '/confipoints/comprar',
          icon: <Crown className="h-4 w-4" />,
          description: 'Adquirir ConfiPoints'
        },
        {
          id: 'confipoints-transfer',
          title: 'Transferir',
          href: '/confipoints/transferir',
          icon: <Send className="h-4 w-4" />,
          description: 'Enviar pontos'
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
        },
        {
          id: 'terms',
          title: 'Termos de Uso',
          href: '/termos',
          icon: <FileText className="h-4 w-4" />,
          description: 'Termos e condições'
        },
        {
          id: 'privacy',
          title: 'Política de Privacidade',
          href: '/privacidade',
          icon: <Shield className="h-4 w-4" />,
          description: 'Proteção de dados LGPD'
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
          href: '/editarperfil/dados-da-conta',
          icon: <Settings className="h-4 w-4" />,
          description: 'Atualizar informações'
        },
        {
          id: 'referrals',
          title: 'Indicações',
          href: '/indicacoes',
          icon: <UserPlus className="h-4 w-4" />,
          description: 'Indique amigos e ganhe recompensas'
        },
        {
          id: 'privacy-settings',
          title: 'Privacidade',
          href: '/configuracoes-privacidade',
          icon: <Shield className="h-4 w-4" />,
          description: 'Controle seus dados LGPD'
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
      blue: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900',
      green: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900',
      purple: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900',
      orange: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900',
      indigo: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900',
      red: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900',
      gray: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <>
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Moderna - Flutuante no Desktop */}
      <div className={`
        fixed left-0 top-0 h-full lg:h-auto lg:top-6 lg:left-6 lg:bottom-6 bg-gray-50/95 dark:bg-black backdrop-blur-md lg:backdrop-blur-lg border-r lg:border border-gray-200 dark:border-gray-900 shadow-sm lg:shadow-xl lg:rounded-2xl z-[60]
        w-48 lg:w-56 transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full lg:translate-x-0'}
      `}>
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-900 bg-gray-100 dark:bg-black lg:rounded-t-2xl">
          <Link href="/home" className="flex flex-col items-center space-y-1 w-full">
            <div className="h-10 flex items-center justify-center">
              <BrandLogo width={120} height={28} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Marketplace</p>
          </Link>
        </div>

        {/* Conteúdo da Sidebar */}
        <div className="flex-1 overflow-y-auto py-4 lg:overflow-y-auto lg:max-h-[calc(100vh-12rem)]">
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
                              ? 'bg-[#00b0b0]/20 dark:bg-[#00b0b0]/30 text-[#00b0b0] dark:text-[#00b0b0] font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`${isActive(item.href) ? 'text-[#00b0b0] dark:text-[#00b0b0]' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                              {item.icon}
                            </div>
                            <div>
                              <span className="block">{item.title}</span>
                              {item.description && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
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
                            ${item.id === 'referrals' || item.id === 'referrals-management'
                              ? isActive(item.href)
                                ? 'bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium'
                                : 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                              : isActive(item.href)
                              ? 'bg-[#00b0b0]/20 dark:bg-[#00b0b0]/30 text-[#00b0b0] dark:text-[#00b0b0] font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`
                              ${item.id === 'referrals' || item.id === 'referrals-management'
                                ? isActive(item.href)
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300'
                                : isActive(item.href)
                                ? 'text-[#00b0b0] dark:text-[#00b0b0]'
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                              }
                            `}>
                              {item.icon}
                            </div>
                            <div>
                              <span className="block">{item.title}</span>
                              {item.description && (
                                <span className={`text-xs ${item.id === 'referrals' || item.id === 'referrals-management' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-black lg:rounded-b-2xl">
            <div className="space-y-2">
              {/* Status do Usuário */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {profile?.user_type === 'professional' ? 'Profissional Ativo' : 'Cliente Ativo'}
                </span>
              </div>
              
              {/* Localização */}
              {profile?.location_city && profile?.location_state && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
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
      <div className="w-48 transition-all duration-300 ease-in-out" />
    </>
  )
}

