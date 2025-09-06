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
  Briefcase,
  BarChart3,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  TrendingUp,
  FileText,
  Shield,
  Zap,
  Globe,
  BookOpen,
  Award,
  Clock,
  Wallet
} from 'lucide-react';

// Phosphor Icons Light
import {
  House,
  MagnifyingGlass,
  User as UserPhosphor,
  Gear,
  Bell as BellPhosphor,
  Heart as HeartPhosphor,
  Calendar as CalendarPhosphor,
  CreditCard as CreditCardPhosphor,
  Question,
  Phone as PhonePhosphor,
  Buildings,
  MapPin as MapPinPhosphor,
  Briefcase as BriefcasePhosphor,
  ChartLine,
  ChatTeardrop,
  Star as StarPhosphor,
  Clock as ClockPhosphor,
  Wallet as WalletPhosphor,
  TrendUp,
  FileText as FileTextPhosphor,
  Shield as ShieldPhosphor,
  Lightning,
  Globe as GlobePhosphor,
  BookOpen as BookOpenPhosphor,
  Trophy,
  CaretRight,
  CaretLeft,
  Users as UsersPhosphor,
  SignOut,
  PencilSimple
} from '@phosphor-icons/react';
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
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Sempre renderizar o componente para navegação
  const isLoggedIn = user && profile

  // Categorias principais da sidebar com ícones Phosphor Light
  const sidebarCategories: SidebarCategory[] = [
    {
      id: 'main',
      title: 'Principal',
      icon: <House size={20} weight="light" />,
      color: 'blue',
      items: [
        {
          id: 'home',
          title: 'Home',
          href: '/home',
          icon: <House size={16} weight="light" />,
          description: 'Página inicial'
        },
      ]
    },
    {
      id: 'discovery',
      title: 'Descobrir',
      icon: <MagnifyingGlass size={20} weight="light" />,
      color: 'green',
      items: [
        {
          id: 'search',
          title: 'Buscar Profissionais',
          href: '/buscar',
          icon: <MagnifyingGlass size={16} weight="light" />,
          description: 'Encontre profissionais'
        },
        {
          id: 'classificados',
          title: 'Classificados',
          href: '/classificados',
          icon: <BriefcasePhosphor size={16} weight="light" />,
          description: 'Anúncios e ofertas'
        },
        {
          id: 'feed',
          title: 'Feed Social',
          href: '/feed',
          icon: <UsersPhosphor size={16} weight="light" />,
          description: 'Atualizações da comunidade'
        },
        {
          id: 'reviews',
          title: 'Avaliações',
          href: '/avaliacoes',
          icon: <StarPhosphor size={16} weight="light" />,
          description: 'Avalie e veja reviews'
        }
      ]
    },
    {
      id: 'communication',
      title: 'Comunicação',
      icon: <ChatTeardrop size={20} weight="light" />,
      color: 'purple',
      items: [
        ...(isLoggedIn ? [{
          id: 'messages',
          title: 'Mensagens',
          href: '#',
          icon: <ChatTeardrop size={16} weight="light" />,
          badge: unreadCount > 0 ? unreadCount.toString() : undefined,
          badgeColor: 'bg-red-500',
          description: 'Chat com profissionais',
          onClick: () => openChat()
        }, {
          id: 'notifications',
          title: 'Notificações',
          href: '/notificacoes',
          icon: <BellPhosphor size={16} weight="light" />,
          badge: unreadCount > 0 ? unreadCount.toString() : undefined,
          badgeColor: 'bg-blue-500',
          description: 'Alertas e avisos'
        }] : [{
          id: 'login',
          title: 'Fazer Login',
          href: '/auth',
          icon: <UserPhosphor size={16} weight="light" />,
          description: 'Acesse sua conta'
        }])
      ]
    },
    ...(isLoggedIn ? [{
      id: 'management',
      title: 'Gestão',
      icon: <CalendarPhosphor size={20} weight="light" />,
      color: 'orange',
      items: [
        {
          id: 'appointments',
          title: 'Agendamentos',
          href: '/agendamentos',
          icon: <CalendarPhosphor size={16} weight="light" />,
          description: 'Seus compromissos'
        },
        {
          id: 'agenda',
          title: 'Agenda Profissional',
          href: '/agenda',
          icon: <ClockPhosphor size={16} weight="light" />,
          description: 'Gerencie sua agenda'
        },
        {
          id: 'favorites',
          title: 'Favoritos',
          href: '/favoritos',
          icon: <HeartPhosphor size={16} weight="light" />,
          description: 'Profissionais favoritos'
        },
        {
          id: 'payments',
          title: 'Pagamentos',
          href: '/pagamentos',
          icon: <CreditCardPhosphor size={16} weight="light" />,
          description: 'Histórico financeiro'
        }
      ]
    }] : []),
    ...(isLoggedIn && profile?.user_type === 'professional' ? [{
      id: 'professional',
      title: 'Profissional',
      icon: <BriefcasePhosphor size={20} weight="light" />,
      color: 'indigo',
      items: [
        {
          id: 'portfolio',
          title: 'Meu Portfólio',
          href: '/portfolio',
          icon: <FileTextPhosphor size={16} weight="light" />,
          description: 'Mostre seu trabalho'
        },
        {
          id: 'earnings',
          title: 'Ganhos',
          href: '/ganhos',
          icon: <TrendUp size={16} weight="light" />,
          description: 'Acompanhe seus lucros'
        },
        {
          id: 'reputation',
          title: 'Reputação',
          href: '/reputacao',
          icon: <Trophy size={16} weight="light" />,
          description: 'Sua avaliação'
        }
      ]
    }] : []),
    {
      id: 'support',
      title: 'Suporte',
      icon: <Question size={20} weight="light" />,
      color: 'red',
      items: [
        {
          id: 'help',
          title: 'Central de Ajuda',
          href: '/ajuda',
          icon: <Question size={16} weight="light" />,
          description: 'Tire suas dúvidas'
        },
        {
          id: 'contact',
          title: 'Contato',
          href: '/_public/contato',
          icon: <PhonePhosphor size={16} weight="light" />,
          description: 'Fale conosco'
        },
        {
          id: 'about',
          title: 'Sobre Nós',
          href: '/sobre',
          icon: <Buildings size={16} weight="light" />,
          description: 'Conheça a ConfiLar'
        }
      ]
    },
    ...(isLoggedIn ? [{
      id: 'account',
      title: 'Conta',
      icon: <UserPhosphor size={20} weight="light" />,
      color: 'gray',
      items: [
        {
          id: 'profile',
          title: 'Meu Perfil',
          href: '/perfil',
          icon: <UserPhosphor size={16} weight="light" />,
          description: 'Editar perfil'
        },
        {
          id: 'edit-profile',
          title: 'Editar Perfil',
          href: '/editarperfil',
          icon: <PencilSimple size={16} weight="light" />,
          description: 'Atualizar informações'
        },
        {
          id: 'verification',
          title: 'Verificação',
          href: '/verificacao',
          icon: <ShieldPhosphor size={16} weight="light" />,
          description: 'Verificar identidade'
        },
        {
          id: 'logout',
          title: 'Sair',
          href: '/logout',
          icon: <SignOut size={16} weight="light" />,
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
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-72'
  const sidebarTransition = 'transition-all duration-300 ease-in-out'

  return (
    <>
      {/* Botão Mobile - Removido para evitar conflito com MobileHeader */}

      {/* Overlay Mobile - Melhorado */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Melhorada para Mobile */}
      <div className={`
        fixed left-0 top-0 h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-2xl z-30
        ${sidebarWidth} ${sidebarTransition}
        ${isMobileOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full lg:translate-x-0'}
        lg:bg-white lg:backdrop-blur-none
      `}>
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">ConfiLar</span>
                <p className="text-xs text-gray-600">Marketplace Profissional</p>
              </div>
            </div>
          )}
          
                     <Button
             variant="ghost"
             size="sm"
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="p-2 hover:bg-white/80 rounded-lg text-gray-600 hover:text-gray-900 transition-all"
           >
             {isCollapsed ? <CaretRight size={16} weight="light" /> : <CaretLeft size={16} weight="light" />}
           </Button>
        </div>

        {/* Conteúdo da Sidebar */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-4 px-3">
            {sidebarCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                {/* Cabeçalho da Categoria */}
                <div className="px-2 py-1">
                  {!isCollapsed && (
                    <div className={`flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg ${getCategoryColor(category.color || 'blue')}`}>
                      {category.icon}
                      <span>{category.title}</span>
                    </div>
                  )}
                </div>

                {/* Itens da Categoria */}
                <div className="space-y-1">
                  {category.items.map((item) => (
                    item.onClick ? (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.onClick?.()
                          setIsMobileOpen(false)
                        }}
                        className={`
                          group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left
                          ${isActive(item.href)
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-105'
                          }
                        `}
                      >
                        <div className={`flex-shrink-0 ${isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {item.icon}
                        </div>
                        
                        {!isCollapsed && (
                          <div className="flex-1 flex items-center justify-between">
                            <div className="flex-1">
                              <span className="block">{item.title}</span>
                              {item.description && (
                                <span className="text-xs opacity-70 block mt-0.5">
                                  {item.description}
                                </span>
                              )}
                            </div>
                            {item.badge && (
                              <Badge 
                                className={`text-xs ${item.badgeColor || 'bg-gray-500'} text-white ml-2`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        )}
                      </button>
                    ) : (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                          ${isActive(item.href)
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-105'
                          }
                        `}
                      >
                        <div className={`flex-shrink-0 ${isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {item.icon}
                        </div>
                        
                        {!isCollapsed && (
                          <div className="flex-1 flex items-center justify-between">
                            <div className="flex-1">
                              <span className="block">{item.title}</span>
                              {item.description && (
                                <span className="text-xs opacity-70 block mt-0.5">
                                  {item.description}
                                </span>
                              )}
                            </div>
                            {item.badge && (
                              <Badge 
                                className={`text-xs ${item.badgeColor || 'bg-gray-500'} text-white ml-2`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        )}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Informações do Usuário */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="space-y-3">
              {/* Status do Usuário */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 font-medium">
                  {profile?.user_type === 'professional' ? 'Profissional Ativo' : 'Cliente Ativo'}
                </span>
              </div>
              
                             {/* Localização */}
               {profile?.location_city && profile?.location_state && (
                 <div className="flex items-center space-x-2 text-xs text-gray-600">
                   <MapPinPhosphor size={12} weight="light" />
                   <span className="truncate">
                     {profile.location_city}, {profile.location_state}
                   </span>
                 </div>
               )}
               
               {/* Membro desde */}
               <div className="flex items-center space-x-2 text-xs text-gray-600">
                 <CalendarPhosphor size={12} weight="light" />
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
