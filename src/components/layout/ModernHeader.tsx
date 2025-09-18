'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { supabase } from '@/lib/supabase'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { AvailabilityToggleCompact } from '@/components/ui/AvailabilityToggle'
import { useAvailability } from '@/hooks/useAvailability'
import { 
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
  MessageCircle,
  Heart,
  Star,
  Calendar,
  Briefcase,
  Home,
  Users,
  TrendingUp,
  Shield,
  Award,
  Eye,
  ThumbsUp
} from 'lucide-react'

interface ModernHeaderProps {
  showBackButton?: boolean
  title?: string
  showMenuButton?: boolean
  onBackClick?: () => void
  onMenuClick?: () => void
}

export function ModernHeader({
  showBackButton = false,
  title,
  showMenuButton = false,
  onBackClick,
  onMenuClick
}: ModernHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuthContext()
  const { openChat } = useFloatingChat()
  const { unreadCount } = useSupabaseNotifications()
  const { isAvailable } = useAvailability()
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [reputationStats, setReputationStats] = useState({
    totalViews: 0,
    totalRecommendations: 0,
    totalReviews: 0,
    averageRating: 0
  })

  // Carregar estatísticas de reputação
  useEffect(() => {
    if (profile?.id) {
      loadReputationStats()
    }
  }, [profile?.id])

  const loadReputationStats = async () => {
    if (!profile?.id) return

    try {
      // Carregar avaliações
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating_person, is_recommended')
        .eq('reviewed_id', profile.id)

      if (reviewsError) throw reviewsError

      // Carregar visualizações
      const { data: viewsData, error: viewsError } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewed_profile_id', profile.id)

      if (viewsError) throw viewsError

      // Calcular estatísticas
      const totalReviews = reviewsData?.length || 0
      const totalRecommendations = reviewsData?.filter(r => r.is_recommended === true).length || 0
      const averageRating = totalReviews > 0 
        ? parseFloat((reviewsData.reduce((sum, r) => sum + r.rating_person, 0) / totalReviews).toFixed(1))
        : 0
      const totalViews = viewsData?.length || 0

      setReputationStats({
        totalViews,
        totalRecommendations,
        totalReviews,
        averageRating
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas de reputação:', error)
    }
  }

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  // Função de navegação simplificada
  const handleNavigation = (path: string) => {
    console.log('Navegando para:', path)
    setIsMenuExpanded(false)
    window.location.href = path
  }

  const getPageTitle = () => {
    if (title) return title
    
    const pathTitles: Record<string, string> = {
      '/home': 'Dashboard',
      '/buscar': 'Buscar Profissionais',
      '/classificados': 'Classificados',
      '/feed': 'Feed Social',
      '/perfil': 'Meu Perfil',
      '/favoritos': 'Favoritos',
      '/portfolio': 'Meu Portfólio',
      '/reputacao': 'Reputação',
      '/ajuda': 'Central de Ajuda',
      '/contato': 'Contato',
      '/sobre': 'Sobre Nós'
    }
    
    return pathTitles[pathname] || 'ConfiLar'
  }

  const handleSignOut = async () => {
    console.log('Executando logout...')
    setIsMenuExpanded(false)
    await signOut()
    window.location.href = '/logout'
  }

  // Dados do usuário
  const accountStats = {
    memberSince: profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024',
    verificationStatus: profile?.user_type === 'professional' ? 'verified' : 'basic',
    premiumStatus: false
  }

  const getVerificationBadge = () => {
    if (accountStats.verificationStatus === 'verified') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Verificado</Badge>
    }
    return <Badge variant="secondary">Básico</Badge>
  }

  const getPremiumBadge = () => {
    if (accountStats.premiumStatus) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Premium</Badge>
    }
    return null
  }

  return (
    <>
      {/* Header Moderno */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackClick}
                  className="p-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
              )}
              
              {showMenuButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMenuClick}
                  className="p-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              
              {/* Logo */}
              <Link href="/home" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="font-semibold text-gray-900 hidden sm:block">ConfiLar</span>
              </Link>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {getPageTitle()}
              </h1>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              {/* Toggle de Disponibilidade */}
              <AvailabilityToggleCompact />
              
              {/* Notificações */}
              <div className="relative">
                <NotificationDropdown />
              </div>
              
              {/* Avatar e Menu do Usuário */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <UserAvatar 
                    src={profile?.avatar_url}
                    alt={profile?.full_name || 'Usuário'}
                    fallback={profile?.full_name?.charAt(0) || 'U'}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {profile?.full_name || 'Usuário'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>

                {/* Menu Expandido */}
                {isMenuExpanded && (
                  <div className="absolute top-full right-0 mt-2 w-80 sm:w-80 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-[85vh] overflow-hidden">
                    <div className="p-3 sm:p-4 overflow-y-auto max-h-[85vh]">
                      {/* Header do Perfil */}
                      <div className="flex items-center space-x-2 sm:space-x-3 pb-3 sm:pb-4 border-b border-gray-200">
                        <UserAvatar 
                          src={profile?.avatar_url}
                          alt={profile?.full_name || 'Usuário'}
                          fallback={profile?.full_name?.charAt(0) || 'U'}
                          size="sm"
                          className="sm:w-10 sm:h-10"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                            {profile?.full_name || 'Usuário'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <div className="text-xs">
                              {getVerificationBadge()}
                              {getPremiumBadge()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estatísticas de Reputação */}
                      <div className="py-2 sm:py-3 border-b border-gray-200">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Minha Reputação</h4>
                        <div className="flex justify-between gap-1">
                          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-md">
                            <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 mb-0.5" />
                            <div className="text-xs font-semibold text-gray-900">{reputationStats.totalViews}</div>
                          </div>
                          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-md">
                            <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 mb-0.5" />
                            <div className="text-xs font-semibold text-gray-900">{reputationStats.totalRecommendations}</div>
                          </div>
                          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-md">
                            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-600 mb-0.5" />
                            <div className="text-xs font-semibold text-gray-900">{reputationStats.totalReviews}</div>
                          </div>
                          {profile?.user_type === 'professional' && reputationStats.averageRating > 0 && (
                            <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-md">
                              <div className="mb-0.5">
                                <StarRating 
                                  rating={reputationStats.averageRating} 
                                  size="sm" 
                                  variant="compact"
                                  showValue={false}
                                  className="scale-75 sm:scale-75"
                                />
                              </div>
                              <div className="text-xs font-semibold text-gray-900">{reputationStats.averageRating.toFixed(1)}</div>
                            </div>
                          )}
                        </div>
                        {/* Labels */}
                        <div className="flex justify-between gap-1 mt-1">
                          <div className="w-10 sm:w-12 text-center">
                            <div className="text-xs text-gray-500 leading-tight">Views</div>
                          </div>
                          <div className="w-10 sm:w-12 text-center">
                            <div className="text-xs text-gray-500 leading-tight">Recom.</div>
                          </div>
                          <div className="w-10 sm:w-12 text-center">
                            <div className="text-xs text-gray-500 leading-tight">Aval.</div>
                          </div>
                          {profile?.user_type === 'professional' && reputationStats.averageRating > 0 && (
                            <div className="w-10 sm:w-12 text-center">
                              <div className="text-xs text-gray-500 leading-tight">Nota</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações Rápidas */}
                      <div className="py-3 sm:py-4 border-b border-gray-200">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Ações Rápidas</h4>
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              openChat()
                              setIsMenuExpanded(false)
                            }}
                            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                          >
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Mensagens</span>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="ml-auto text-xs scale-75 sm:scale-100">
                                {unreadCount}
                              </Badge>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavigation('/favoritos')}
                            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                          >
                            <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Favoritos</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavigation('/buscar')}
                            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                          >
                            <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Buscar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavigation('/classificados')}
                            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                          >
                            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Classificados</span>
                          </Button>
                        </div>
                      </div>

                      {/* Menu de Conta */}
                      <div className="py-3 sm:py-4">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Minha Conta</h4>
                        <div className="space-y-0.5 sm:space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNavigation(`/perfil/${profile?.id}`)}
                            className="w-full justify-start text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                          >
                            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Ver Perfil
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNavigation('/editarperfil')}
                            className="w-full justify-start text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                          >
                            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Editar Perfil
                          </Button>
                          {profile?.user_type === 'professional' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/portfolio')}
                              className="w-full justify-start text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                            >
                              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                              Portfólio
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNavigation('/ajuda')}
                            className="w-full justify-start text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                          >
                            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Ajuda
                          </Button>
                        </div>
                      </div>

                      {/* Botão de Sair */}
                      <div className="pt-3 sm:pt-4 border-t border-gray-200">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleSignOut}
                          className="w-full text-xs sm:text-sm py-1.5 sm:py-2"
                        >
                          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          Sair da Conta
                        </Button>
                      </div>

                      {/* Informações do Usuário */}
                      <div className="pt-2 sm:pt-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                          <div className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-gray-600 font-medium leading-tight">
                            {profile?.user_type === 'professional' ? 'Profissional Ativo' : 'Cliente Ativo'}
                            {profile?.location_city && profile?.location_state && (
                              <> - {profile.location_city}, {profile.location_state}</>
                            )}
                            {' - Membro desde '}
                            {profile?.created_at 
                              ? new Date(profile.created_at).getFullYear() 
                              : '2024'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar menu */}
      {isMenuExpanded && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={() => setIsMenuExpanded(false)}
        />
      )}
    </>
  )
}
