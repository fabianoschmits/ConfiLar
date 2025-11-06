'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext'
import { useAdmin } from '@/hooks/useAdmin';
import { NavigationLink } from '@/components/ui/NavigationLink';
import {
  Home,
  Search,
  User,
  Settings,
  Bell,
  Heart,
  Calendar,
  CreditCard,
  HelpCircle,
  Phone,
  Building,
  MapPin,
  Briefcase,
  TrendingUp,
  MessageCircle,
  Star,
  Clock,
  Wallet,
  TrendingUp as TrendingUpIcon,
  FileText,
  Shield,
  Zap,
  Globe,
  Book,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Users,
  LogOut,
  Edit,
  BarChart3,
  BookOpen,
  Award,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications';
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple';

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

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile } = useAuthContext()
  const { unreadCount } = useSupabaseNotifications()
  const { openChat } = useFloatingChat()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isAdmin } = useAdmin()

  // Sempre renderizar o componente para navegação
  const isLoggedIn = user && profile

  // Categorias principais da sidebar com ícones Tabler
  const sidebarCategories: SidebarCategory[] = [
    {
      id: 'main',
      title: 'PRINCIPAL',
      icon: <Home size={20} strokeWidth={2} />,
      color: 'blue',
      items: [
        {
          id: 'home',
          title: 'HOME',
          href: '/home',
          icon: <Home size={16} strokeWidth={2} />,
          description: 'Página inicial'
        },
      ]
    },
    {
      id: 'discovery',
      title: 'DESCOBRIR',
      icon: <Search size={20} strokeWidth={2} />,
      color: 'green',
      items: [
        {
          id: 'search',
          title: 'BUSCAR PROFISSIONAIS',
          href: '/buscar',
          icon: <Search size={16} strokeWidth={2} />,
          description: 'Encontre profissionais'
        },
        {
          id: 'classificados',
          title: 'CLASSIFICADOS',
          href: '/classificados',
          icon: <Briefcase size={16} strokeWidth={2} />,
          description: 'Anúncios e ofertas'
        },
        {
          id: 'feed',
          title: 'FEED SOCIAL',
          href: '/feed',
          icon: <Users size={16} strokeWidth={2} />,
          description: 'Atualizações da comunidade'
        },
        {
          id: 'reviews',
          title: 'AVALIAÇÕES',
          href: '/avaliacoes',
          icon: <Star size={16} strokeWidth={2} />,
          description: 'Avalie e veja reviews'
        }
      ]
    },
    {
      id: 'communication',
      title: 'COMUNICAÇÃO',
      icon: <MessageCircle size={20} strokeWidth={2} />,
      color: 'purple',
      items: [
        ...(isLoggedIn ? [{
          id: 'messages',
          title: 'MENSAGENS',
          href: '#',
          icon: <MessageCircle size={16} strokeWidth={2} />,
          badge: unreadCount > 0 ? unreadCount.toString() : undefined,
          badgeColor: 'bg-red-500',
          description: 'Chat com profissionais',
          onClick: () => openChat()
        }] : [{
          id: 'login',
          title: 'FAZER LOGIN',
          href: '/auth',
          icon: <User size={16} strokeWidth={2} />,
          description: 'Acesse sua conta'
        }])
      ]
    },
    ...(isLoggedIn ? [{
      id: 'management',
      title: 'GESTÃO',
      icon: <Calendar size={20} strokeWidth={2} />,
      color: 'orange',
      items: [
        {
          id: 'favorites',
          title: 'FAVORITOS',
          href: '/favoritos',
          icon: <Heart size={16} strokeWidth={2} />,
          description: 'Profissionais favoritos'
        },
      ]
    }] : []),
    ...(isLoggedIn && profile?.user_type === 'professional' ? [{
      id: 'professional',
      title: 'PROFISSIONAL',
      icon: <Briefcase size={20} strokeWidth={2} />,
      color: 'indigo',
      items: [
        {
          id: 'portfolio',
          title: 'MEU PORTFÓLIO',
          href: '/portfolio',
          icon: <FileText size={16} strokeWidth={2} />,
          description: 'Mostre seu trabalho'
        },
        {
          id: 'reputation',
          title: 'REPUTAÇÃO',
          href: '/reputacao',
          icon: <Trophy size={16} strokeWidth={2} />,
          description: 'Sua avaliação'
        }
      ]
    }] : []),
    {
      id: 'support',
      title: 'SUPORTE',
      icon: <HelpCircle size={20} strokeWidth={2} />,
      color: 'red',
      items: [
        {
          id: 'help',
          title: 'CENTRAL DE AJUDA',
          href: '/ajuda',
          icon: <HelpCircle size={16} strokeWidth={2} />,
          description: 'Tire suas dúvidas'
        },
        {
          id: 'contact',
          title: 'CONTATO',
          href: '/contato',
          icon: <Phone size={16} strokeWidth={2} />,
          description: 'Fale conosco'
        },
        {
          id: 'about',
          title: 'SOBRE NÓS',
          href: '/sobre',
          icon: <Building size={16} strokeWidth={2} />,
          description: 'Conheça a ConfiLar'
        },
        {
          id: 'terms',
          title: 'TERMOS DE USO',
          href: '/termos',
          icon: <FileText size={16} strokeWidth={2} />,
          description: 'Termos e condições'
        },
        {
          id: 'privacy',
          title: 'POLÍTICA DE PRIVACIDADE',
          href: '/privacidade',
          icon: <Shield size={16} strokeWidth={2} />,
          description: 'Proteção de dados LGPD'
        }
      ]
    },
    ...(isLoggedIn ? [{
      id: 'confipoints',
      title: 'CONFIPOINTS',
      icon: <Zap size={20} strokeWidth={2} />,
      color: 'yellow',
      items: [
        {
          id: 'my-points',
          title: 'MEUS PONTOS',
          href: '/confipoints',
          icon: <Zap size={16} strokeWidth={2} />,
          description: 'Saldo e estatísticas'
        },
        {
          id: 'history',
          title: 'HISTÓRICO',
          href: '/confipoints/historico',
          icon: <Clock size={16} strokeWidth={2} />,
          description: 'Transações e atividades'
        },
        {
          id: 'premium-system',
          title: 'SISTEMA PREMIUM',
          href: '/confipoints/sistema-premium',
          icon: <Award size={16} strokeWidth={2} />,
          description: 'Como funciona o premium'
        },
        {
          id: 'premium-posts',
          title: 'POSTS PREMIUM',
          href: '/confipoints/posts-premium',
          icon: <FileText size={16} strokeWidth={2} />,
          description: 'Criar posts destacados'
        },
        {
          id: 'premium-ads',
          title: 'ANÚNCIOS PREMIUM',
          href: '/confipoints/anuncios-premium',
          icon: <Briefcase size={16} strokeWidth={2} />,
          description: 'Criar anúncios destacados'
        },
        {
          id: 'premium-likes',
          title: 'CURTIDAS PREMIUM',
          href: '/confipoints/curtidas-premium',
          icon: <Heart size={16} strokeWidth={2} />,
          description: 'Curtir com pontos'
        },
        {
          id: 'vip-badges',
          title: 'BADGES VIP',
          href: '/confipoints/badges-vip',
          icon: <Shield size={16} strokeWidth={2} />,
          description: 'Badges de usuários premium'
        },
        {
          id: 'store',
          title: 'LOJA PREMIUM',
          href: '/confipoints/comprar',
          icon: <Crown size={16} strokeWidth={2} />,
          description: 'Comprar pontos'
        },
        {
          id: 'transfer',
          title: 'TRANSFERIR',
          href: '/confipoints/transferir',
          icon: <TrendingUpIcon size={16} strokeWidth={2} />,
          description: 'Enviar pontos para outros'
        },
        ...(isAdmin ? [{
          id: 'admin-dashboard',
          title: 'ADMIN DASHBOARD',
          href: '/confipoints/admin',
          icon: <BarChart3 size={16} strokeWidth={2} />,
          description: 'Gerenciar ConfiPoints',
          badge: 'ADMIN',
          badgeColor: 'red'
        }] : []),
        {
          id: 'purchases',
          title: 'MINHAS COMPRAS',
          href: '/confipoints/minhas-compras',
          icon: <BarChart3 size={16} strokeWidth={2} />,
          description: 'Histórico de compras'
        }
      ]
    }] : []),
    ...(isLoggedIn ? [{
      id: 'account',
      title: 'CONTA',
      icon: <User size={20} strokeWidth={2} />,
      color: 'gray',
      items: [
        {
          id: 'profile',
          title: 'MEU PERFIL',
          href: '/perfil',
          icon: <User size={16} strokeWidth={2} />,
          description: 'Editar perfil'
        },
        {
          id: 'edit-profile',
          title: 'EDITAR PERFIL',
          href: '/editarperfil/dados-da-conta',
          icon: <Edit size={16} strokeWidth={2} />,
          description: 'Atualizar informações'
        },
        {
          id: 'privacy-settings',
          title: 'PRIVACIDADE',
          href: '/configuracoes-privacidade',
          icon: <Shield size={16} strokeWidth={2} />,
          description: 'Controle seus dados LGPD'
        },
        {
          id: 'verification',
          title: 'VERIFICAÇÃO',
          href: '/verificacao',
          icon: <Shield size={16} strokeWidth={2} />,
          description: 'Verificar identidade'
        },
        {
          id: 'logout',
          title: 'SAIR',
          href: '/auth',
          icon: <LogOut size={16} strokeWidth={2} />,
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
      blue: 'bg-blue-500 text-white border-black',
      green: 'bg-green-500 text-white border-black',
      purple: 'bg-purple-500 text-white border-black',
      orange: 'bg-orange-500 text-white border-black',
      indigo: 'bg-indigo-500 text-white border-black',
      red: 'bg-red-500 text-white border-black',
      gray: 'bg-gray-500 text-white border-black',
      yellow: 'bg-yellow-500 text-white border-black'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const sidebarWidth = 'w-72'
  const sidebarTransition = 'transition-all duration-300 ease-in-out'

  return (
    <>
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Brutalista */}
      <div className={`
        fixed left-0 top-0 h-full bg-blue-600 border-r border-gray-200 shadow-lg z-[60]
        ${sidebarWidth} ${sidebarTransition}
        ${isMobileOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full lg:translate-x-0'}
      `}>
        {/* Header da Sidebar Brutalista */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 border border-gray-300 shadow-sm flex items-center justify-center">
              <span className="text-gray-900 font-semibold text-xl">C</span>
            </div>
            <div>
              <span className="font-semibold text-white text-lg">CONFILAR</span>
              <p className="text-xs text-white font-bold">MARKETPLACE PROFISSIONAL</p>
            </div>
          </div>
        </div>

        {/* Conteúdo da Sidebar */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-4 px-3">
            {sidebarCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                {/* Cabeçalho da Categoria Brutalista */}
                <div className="px-2 py-1">
                  <div className={`flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider px-3 py-2 border border-gray-300 shadow-sm ${getCategoryColor(category.color || 'blue')}`}>
                    {category.icon}
                    <span>{category.title}</span>
                  </div>
                </div>

                {/* Itens da Categoria */}
                <div className="space-y-2">
                  {category.items.map((item) => (
                    item.onClick ? (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.onClick?.()
                          setIsMobileOpen(false)
                        }}
                        className={`
                          group flex items-center px-3 py-2 text-sm font-semibold transition-all duration-200 w-full text-left border border-gray-300 shadow-sm hover:shadow-md
                          ${isActive(item.href)
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-900 hover:bg-blue-600'
                          }
                        `}
                      >
                        <div className={`flex-shrink-0 mr-3 ${isActive(item.href) ? 'text-white' : 'text-gray-900 group-hover:text-gray-900'}`}>
                          {item.icon}
                        </div>
                        
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex-1">
                            <span className="block text-xs font-semibold">{item.title}</span>
                            {item.description && (
                              <span className="text-xs opacity-70 block mt-0.5 font-bold">
                                {item.description}
                              </span>
                            )}
                          </div>
                          {item.badge && (
                            <span className={`text-xs px-2 py-1 font-semibold border border-gray-300 ${item.badgeColor || 'bg-gray-500'} text-white ml-2`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    ) : (
                      <NavigationLink
                        key={item.id}
                        href={item.href}
                        destination={item.title}
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          group flex items-center px-3 py-2 text-sm font-semibold transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md
                          ${isActive(item.href)
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-900 hover:bg-blue-600'
                          }
                        `}
                      >
                        <div className={`flex-shrink-0 mr-3 ${isActive(item.href) ? 'text-white' : 'text-gray-900 group-hover:text-gray-900'}`}>
                          {item.icon}
                        </div>
                        
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex-1">
                            <span className="block text-xs font-semibold">{item.title}</span>
                            {item.description && (
                              <span className="text-xs opacity-70 block mt-0.5 font-bold">
                                {item.description}
                              </span>
                            )}
                          </div>
                          {item.badge && (
                            <span className={`text-xs px-2 py-1 font-semibold border border-gray-300 ${item.badgeColor || 'bg-gray-500'} text-white ml-2`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </NavigationLink>
                    )
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Informações do Usuário Brutalista */}
        <div className="p-4 border-t-4 border-black bg-gray-900">
            <div className="space-y-3">
              {/* Status do Usuário */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 border border-gray-300"></div>
                <span className="text-xs text-white font-semibold">
                  {profile?.user_type === 'professional' ? 'PROFISSIONAL ATIVO' : 'CLIENTE ATIVO'}
                </span>
              </div>
              
              {/* Localização */}
              {profile?.location_city && profile?.location_state && (
                <div className="flex items-center space-x-2 text-xs text-white font-bold">
                  <MapPin size={12} strokeWidth={2} />
                  <span className="truncate">
                    {profile.location_city.toUpperCase()}, {profile.location_state.toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Membro desde */}
              <div className="flex items-center space-x-2 text-xs text-white font-bold">
                <Calendar size={12} strokeWidth={2} />
                <span>
                  MEMBRO DESDE {profile?.created_at 
                    ? new Date(profile.created_at).getFullYear() 
                    : '2024'
                  }
                </span>
              </div>
            </div>
          </div>

      </div>

      {/* Espaçador para o conteúdo principal */}
      <div className={`${sidebarWidth} ${sidebarTransition}`} />
    </>
  )
}
