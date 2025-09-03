'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
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
  Users as UsersPhosphor,
  Plus,
  List,
  Gear,
  Question,
  Phone as PhonePhosphor,
  Buildings,
  Globe as GlobePhosphor,
  FileText as FileTextPhosphor,
  TrendUp,
  Trophy,
  Clock as ClockPhosphor,
  Wallet as WalletPhosphor,
  CreditCard as CreditCardPhosphor,
  Bookmark as BookmarkPhosphor,
  MapPin as MapPinPhosphor
} from '@phosphor-icons/react'

export function MobileQuickActions() {
  const pathname = usePathname()
  const { user, profile } = useAuthContext()
  const { unreadCount } = useSupabaseNotifications()
  const [isOpen, setIsOpen] = useState(false)

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  const quickActions = [
    {
      id: 'search',
      label: 'Buscar Profissionais',
      href: '/buscar',
      icon: MagnifyingGlass,
      color: 'bg-blue-500',
      description: 'Encontre profissionais'
    },
    {
      id: 'classificados',
      label: 'Classificados',
      href: '/classificados',
      icon: BriefcasePhosphor,
      color: 'bg-green-500',
      description: 'Anúncios e ofertas'
    },
    {
      id: 'feed',
      label: 'Feed Social',
      href: '/feed',
      icon: UsersPhosphor,
      color: 'bg-purple-500',
      description: 'Atualizações da comunidade'
    },
    {
      id: 'appointments',
      label: 'Agendamentos',
      href: '/agendamentos',
      icon: CalendarPhosphor,
      color: 'bg-orange-500',
      description: 'Seus compromissos'
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      href: '/favoritos',
      icon: HeartPhosphor,
      color: 'bg-red-500',
      description: 'Profissionais favoritos'
    },
    {
      id: 'portfolio',
      label: 'Meu Portfólio',
      href: '/portfolio',
      icon: FileTextPhosphor,
      color: 'bg-indigo-500',
      description: 'Mostre seu trabalho'
    },
    {
      id: 'earnings',
      label: 'Ganhos',
      href: '/ganhos',
      icon: TrendUp,
      color: 'bg-emerald-500',
      description: 'Acompanhe seus lucros'
    },
    {
      id: 'reputation',
      label: 'Reputação',
      href: '/reputacao',
      icon: Trophy,
      color: 'bg-yellow-500',
      description: 'Sua avaliação'
    }
  ]

  const supportActions = [
    {
      id: 'help',
      label: 'Central de Ajuda',
      href: '/ajuda',
      icon: Question,
      color: 'bg-gray-500',
      description: 'Tire suas dúvidas'
    },
    {
      id: 'contact',
      label: 'Contato',
      href: '/contato',
      icon: PhonePhosphor,
      color: 'bg-teal-500',
      description: 'Fale conosco'
    },
    {
      id: 'about',
      label: 'Sobre Nós',
      href: '/sobre',
      icon: Buildings,
      color: 'bg-slate-500',
      description: 'Conheça a ConfiLar'
    }
  ]

  const handleNavigation = (href: string) => {
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden fixed top-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/95 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-gray-50 h-10 w-10 p-0 rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-80 p-0 bg-white/95 backdrop-blur-sm">
          <SheetHeader className="p-4 border-b border-gray-200">
            <SheetTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold">Ações Rápidas</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Ações Principais */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                Navegação Rápida
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  const active = pathname.startsWith(action.href)
                  
                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      onClick={() => handleNavigation(action.href)}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl transition-all duration-200 border",
                        active
                          ? "bg-blue-50 border-blue-200 shadow-md"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                        action.color
                      )}>
                        <Icon size={20} weight="light" className="text-white" />
                      </div>
                      <span className={cn(
                        "text-xs font-medium text-center",
                        active ? "text-blue-700" : "text-gray-700"
                      )}>
                        {action.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Suporte */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                Suporte
              </h3>
              <div className="space-y-2">
                {supportActions.map((action) => {
                  const Icon = action.icon
                  const active = pathname.startsWith(action.href)
                  
                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      onClick={() => handleNavigation(action.href)}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        action.color
                      )}>
                        <Icon size={16} weight="light" className="text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium">{action.label}</span>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Informações do Usuário */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 font-medium">
                    {profile?.user_type === 'professional' ? 'Profissional Ativo' : 'Cliente Ativo'}
                  </span>
                </div>
                
                {profile?.location_city && profile?.location_state && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <MapPinPhosphor size={12} weight="light" />
                    <span className="truncate">
                      {profile.location_city}, {profile.location_state}
                    </span>
                  </div>
                )}
                
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
