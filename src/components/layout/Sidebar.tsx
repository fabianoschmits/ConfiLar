'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { NavigationLink } from '@/components/ui/NavigationLink';
import { 
  FileText,
  Shield,
  Zap,
  Globe,
  BookOpen,
  Award,
  Clock,
  Wallet
} from 'lucide-react';

// Tabler Icons - Estilo Brutalista
import {
  IconHome,
  IconSearch,
  IconUser,
  IconSettings,
  IconBell,
  IconHeart,
  IconCalendar,
  IconCreditCard,
  IconHelp,
  IconPhone,
  IconBuilding,
  IconMapPin,
  IconBriefcase,
  IconChartLine,
  IconMessageCircle,
  IconStar,
  IconClock,
  IconWallet,
  IconTrendingUp,
  IconFileText,
  IconShield,
  IconBolt,
  IconWorld,
  IconBook,
  IconTrophy,
  IconChevronRight,
  IconChevronLeft,
  IconUsers,
  IconLogout,
  IconEdit,
  IconChartBar
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications';
import { useFloatingChat } from '@/contexts/FloatingChatContext';

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

  // Sempre renderizar o componente para navegação
  const isLoggedIn = user && profile

  // Categorias principais da sidebar com ícones Tabler
  const sidebarCategories: SidebarCategory[] = [
    {
      id: 'main',
      title: 'PRINCIPAL',
      icon: <IconHome size={20} stroke={2} />,
      color: 'blue',
      items: [
        {
          id: 'home',
          title: 'HOME',
          href: '/home',
          icon: <IconHome size={16} stroke={2} />,
          description: 'Página inicial'
        },
        {
          id: 'dashboard',
          title: 'DASHBOARD',
          href: '/dashboard',
          icon: <IconChartBar size={16} stroke={2} />,
          description: 'Visão geral e métricas'
        },
      ]
    },
    {
      id: 'discovery',
      title: 'DESCOBRIR',
      icon: <IconSearch size={20} stroke={2} />,
      color: 'green',
      items: [
        {
          id: 'search',
          title: 'BUSCAR PROFISSIONAIS',
          href: '/buscar',
          icon: <IconSearch size={16} stroke={2} />,
          description: 'Encontre profissionais'
        },
        {
          id: 'classificados',
          title: 'CLASSIFICADOS',
          href: '/classificados',
          icon: <IconBriefcase size={16} stroke={2} />,
          description: 'Anúncios e ofertas'
        },
        {
          id: 'feed',
          title: 'FEED SOCIAL',
          href: '/feed',
          icon: <IconUsers size={16} stroke={2} />,
          description: 'Atualizações da comunidade'
        },
        {
          id: 'reviews',
          title: 'AVALIAÇÕES',
          href: '/avaliacoes',
          icon: <IconStar size={16} stroke={2} />,
          description: 'Avalie e veja reviews'
        }
      ]
    },
    {
      id: 'communication',
      title: 'COMUNICAÇÃO',
      icon: <IconMessageCircle size={20} stroke={2} />,
      color: 'purple',
      items: [
        ...(isLoggedIn ? [{
          id: 'messages',
          title: 'MENSAGENS',
          href: '#',
          icon: <IconMessageCircle size={16} stroke={2} />,
          badge: unreadCount > 0 ? unreadCount.toString() : undefined,
          badgeColor: 'bg-red-500',
          description: 'Chat com profissionais',
          onClick: () => openChat()
        }] : [{
          id: 'login',
          title: 'FAZER LOGIN',
          href: '/auth',
          icon: <IconUser size={16} stroke={2} />,
          description: 'Acesse sua conta'
        }])
      ]
    },
    ...(isLoggedIn ? [{
      id: 'management',
      title: 'GESTÃO',
      icon: <IconCalendar size={20} stroke={2} />,
      color: 'orange',
      items: [
        {
          id: 'appointments',
          title: 'AGENDAMENTOS',
          href: '/agendamentos',
          icon: <IconCalendar size={16} stroke={2} />,
          description: 'Seus compromissos'
        },
        {
          id: 'agenda',
          title: 'AGENDA PROFISSIONAL',
          href: '/agenda',
          icon: <IconClock size={16} stroke={2} />,
          description: 'Gerencie sua agenda'
        },
        {
          id: 'favorites',
          title: 'FAVORITOS',
          href: '/favoritos',
          icon: <IconHeart size={16} stroke={2} />,
          description: 'Profissionais favoritos'
        },
        {
          id: 'payments',
          title: 'PAGAMENTOS',
          href: '/pagamentos',
          icon: <IconCreditCard size={16} stroke={2} />,
          description: 'Histórico financeiro'
        }
      ]
    }] : []),
    ...(isLoggedIn && profile?.user_type === 'professional' ? [{
      id: 'professional',
      title: 'PROFISSIONAL',
      icon: <IconBriefcase size={20} stroke={2} />,
      color: 'indigo',
      items: [
        {
          id: 'portfolio',
          title: 'MEU PORTFÓLIO',
          href: '/portfolio',
          icon: <IconFileText size={16} stroke={2} />,
          description: 'Mostre seu trabalho'
        },
        {
          id: 'earnings',
          title: 'GANHOS',
          href: '/ganhos',
          icon: <IconTrendingUp size={16} stroke={2} />,
          description: 'Acompanhe seus lucros'
        },
        {
          id: 'reputation',
          title: 'REPUTAÇÃO',
          href: '/reputacao',
          icon: <IconTrophy size={16} stroke={2} />,
          description: 'Sua avaliação'
        }
      ]
    }] : []),
    {
      id: 'support',
      title: 'SUPORTE',
      icon: <IconHelp size={20} stroke={2} />,
      color: 'red',
      items: [
        {
          id: 'help',
          title: 'CENTRAL DE AJUDA',
          href: '/ajuda',
          icon: <IconHelp size={16} stroke={2} />,
          description: 'Tire suas dúvidas'
        },
        {
          id: 'contact',
          title: 'CONTATO',
          href: '/contato',
          icon: <IconPhone size={16} stroke={2} />,
          description: 'Fale conosco'
        },
        {
          id: 'about',
          title: 'SOBRE NÓS',
          href: '/sobre',
          icon: <IconBuilding size={16} stroke={2} />,
          description: 'Conheça a ConfiLar'
        }
      ]
    },
    ...(isLoggedIn ? [{
      id: 'account',
      title: 'CONTA',
      icon: <IconUser size={20} stroke={2} />,
      color: 'gray',
      items: [
        {
          id: 'profile',
          title: 'MEU PERFIL',
          href: '/perfil',
          icon: <IconUser size={16} stroke={2} />,
          description: 'Editar perfil'
        },
        {
          id: 'edit-profile',
          title: 'EDITAR PERFIL',
          href: '/editarperfil',
          icon: <IconEdit size={16} stroke={2} />,
          description: 'Atualizar informações'
        },
        {
          id: 'verification',
          title: 'VERIFICAÇÃO',
          href: '/verificacao',
          icon: <IconShield size={16} stroke={2} />,
          description: 'Verificar identidade'
        },
        {
          id: 'logout',
          title: 'SAIR',
          href: '/logout',
          icon: <IconLogout size={16} stroke={2} />,
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
      gray: 'bg-gray-500 text-white border-black'
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
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Brutalista */}
      <div className={`
        fixed left-0 top-0 h-full bg-yellow-400 border-r-4 border-black shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] z-[60]
        ${sidebarWidth} ${sidebarTransition}
        ${isMobileOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full lg:translate-x-0'}
      `}>
        {/* Header da Sidebar Brutalista */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <span className="text-black font-black text-xl">C</span>
            </div>
            <div>
              <span className="font-black text-yellow-400 text-lg">CONFILAR</span>
              <p className="text-xs text-yellow-400 font-bold">MARKETPLACE PROFISSIONAL</p>
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
                  <div className={`flex items-center space-x-2 text-xs font-black uppercase tracking-wider px-3 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${getCategoryColor(category.color || 'blue')}`}>
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
                          group flex items-center px-3 py-2 text-sm font-black transition-all duration-200 w-full text-left border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                          ${isActive(item.href)
                            ? 'bg-black text-yellow-400'
                            : 'bg-white text-black hover:bg-yellow-400'
                          }
                        `}
                      >
                        <div className={`flex-shrink-0 mr-3 ${isActive(item.href) ? 'text-yellow-400' : 'text-black group-hover:text-black'}`}>
                          {item.icon}
                        </div>
                        
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex-1">
                            <span className="block text-xs font-black">{item.title}</span>
                            {item.description && (
                              <span className="text-xs opacity-70 block mt-0.5 font-bold">
                                {item.description}
                              </span>
                            )}
                          </div>
                          {item.badge && (
                            <span className={`text-xs px-2 py-1 font-black border-2 border-black ${item.badgeColor || 'bg-gray-500'} text-white ml-2`}>
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
                          group flex items-center px-3 py-2 text-sm font-black transition-all duration-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                          ${isActive(item.href)
                            ? 'bg-black text-yellow-400'
                            : 'bg-white text-black hover:bg-yellow-400'
                          }
                        `}
                      >
                        <div className={`flex-shrink-0 mr-3 ${isActive(item.href) ? 'text-yellow-400' : 'text-black group-hover:text-black'}`}>
                          {item.icon}
                        </div>
                        
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex-1">
                            <span className="block text-xs font-black">{item.title}</span>
                            {item.description && (
                              <span className="text-xs opacity-70 block mt-0.5 font-bold">
                                {item.description}
                              </span>
                            )}
                          </div>
                          {item.badge && (
                            <span className={`text-xs px-2 py-1 font-black border-2 border-black ${item.badgeColor || 'bg-gray-500'} text-white ml-2`}>
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
        <div className="p-4 border-t-4 border-black bg-black">
            <div className="space-y-3">
              {/* Status do Usuário */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 border-2 border-black"></div>
                <span className="text-xs text-yellow-400 font-black">
                  {profile?.user_type === 'professional' ? 'PROFISSIONAL ATIVO' : 'CLIENTE ATIVO'}
                </span>
              </div>
              
              {/* Localização */}
              {profile?.location_city && profile?.location_state && (
                <div className="flex items-center space-x-2 text-xs text-yellow-400 font-bold">
                  <IconMapPin size={12} stroke={2} />
                  <span className="truncate">
                    {profile.location_city.toUpperCase()}, {profile.location_state.toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Membro desde */}
              <div className="flex items-center space-x-2 text-xs text-yellow-400 font-bold">
                <IconCalendar size={12} stroke={2} />
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
