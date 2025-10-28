'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { supabase } from '@/lib/supabase'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { SimpleHeaderBell } from '@/components/notifications/SimpleHeaderBell'
import { UserReportsModal } from '@/components/UserReportsModal'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { AvailabilityToggleCompact } from '@/components/ui/AvailabilityToggle'
import { useAvailability } from '@/hooks/useAvailability'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
  ThumbsUp,
  BarChart3,
  ShieldCheck,
  Flag,
  FileText,
  UserPlus,
  Coins,
  Target,
  History,
  Gift,
  Zap,
  ShoppingCart,
  DollarSign,
  Send,
  Crown,
  ShoppingBag,
  Phone,
  Building,
  Edit,
  Trophy,
  Clock,
  CreditCard,
  Wallet
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  
  // Verificar se o usuário é admin
  const isAdmin = user?.id === 'f7444305-a3bd-4d71-874a-bb95fd27f96a'
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

      // Carregar recomendações da tabela user_recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('user_recommendations')
        .select('id')
        .eq('recommended_id', profile.id)

      if (recommendationsError) {
        console.error('📊 Header - Erro ao carregar recomendações:', recommendationsError)
      }

      console.log('📊 Header - Avaliações carregadas:', reviewsData?.length || 0)
      console.log('📊 Header - Dados das avaliações:', reviewsData)
      console.log('📊 Header - Recomendações carregadas:', recommendationsData?.length || 0)
      console.log('📊 Header - Dados das recomendações:', recommendationsData)

      // Calcular estatísticas
      const totalReviews = reviewsData?.length || 0
      const totalRecommendations = recommendationsData?.length || 0
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
    try {
      console.log('Navegando para:', path)
      setIsMenuExpanded(false)
      router.push(path)
    } catch (error) {
      console.error('Erro na navegação:', error)
      // Fallback para window.location
      window.location.href = path
    }
  }

  // Função para alternar seções
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
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
    // Redirecionar diretamente para a página de login
    window.location.href = '/auth'
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
      {/* Header Moderno - Flutuante no Mobile */}
      <div className="lg:sticky fixed lg:top-0 top-5 left-1/2 -translate-x-1/2 w-[95%] lg:w-full lg:left-0 lg:translate-x-0 z-50 lg:shadow-sm bg-white dark:bg-[#1b1b1b] lg:bg-white lg:dark:bg-gray-900 border rounded-full lg:rounded-none lg:border-b border-gray-200 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl backdrop-blur-md lg:backdrop-blur-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
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
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image 
                    src="/imagens/logo/confilarlogo5.png" 
                    alt="ConfiLar Logo" 
                    width={48}
                    height={48}
                    priority
                    className="w-[120%] h-[120%] object-contain"
                  />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white hidden sm:block">ConfiLar</span>
              </Link>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                {getPageTitle()}
              </h1>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center">
              {/* Toggle de Disponibilidade */}
              <AvailabilityToggleCompact />
              
              {/* Toggle de Tema */}
              <div className="relative -ml-1">
                <ThemeToggle />
              </div>
              
              {/* Notificações */}
              <div className="relative -ml-1">
                <SimpleHeaderBell />
              </div>
              
              {/* Avatar e Menu do Usuário */}
              <div className="relative -ml-1">
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
                    userId={user?.id}
                    showReferralBadge={false}
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {profile?.full_name || 'Usuário'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>

                {/* Menu Expandido */}
                {isMenuExpanded && (
                  <div className="absolute top-full right-0 mt-2 w-80 sm:w-80 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-[75vh] overflow-hidden">
                    <div className="p-3 sm:p-4 overflow-y-auto max-h-[75vh]">
                      {/* Header do Perfil */}
                      <div className="flex items-center space-x-2 sm:space-x-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                        <UserAvatar 
                          src={profile?.avatar_url}
                          alt={profile?.full_name || 'Usuário'}
                          fallback={profile?.full_name?.charAt(0) || 'U'}
                          size="lg"
                          className="w-11 h-11 sm:w-17 sm:h-17"
                          userId={user?.id}
                          showReferralBadge={true}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                            {profile?.full_name || 'Usuário'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
                      <div className="py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">Minha Reputação</h4>
                        <div className="flex justify-between gap-1">
                          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                            <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 dark:text-blue-400 mb-0.5" />
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{reputationStats.totalViews}</div>
                          </div>
                          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-50 dark:bg-green-900/30 rounded-md">
                            <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 dark:text-green-400 mb-0.5" />
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{reputationStats.totalRecommendations}</div>
                          </div>
                          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 dark:bg-orange-900/30 rounded-md">
                            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-600 dark:text-orange-400 mb-0.5" />
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{reputationStats.totalReviews}</div>
                          </div>
                          {profile?.user_type === 'professional' && reputationStats.averageRating > 0 && (
                            <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 dark:bg-gray-700 rounded-md">
                              <div className="mb-0.5">
                                <StarRating 
                                  rating={reputationStats.averageRating} 
                                  size="sm" 
                                  variant="compact"
                                  showValue={false}
                                  className="scale-75 sm:scale-75"
                                />
                              </div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white">{reputationStats.averageRating.toFixed(1)}</div>
                            </div>
                          )}
                        </div>
                        {/* Labels */}
                        <div className="flex justify-between gap-1 mt-1">
                          <div className="w-10 sm:w-12 text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Views</div>
                          </div>
                          <div className="w-10 sm:w-12 text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Recom.</div>
                          </div>
                          <div className="w-10 sm:w-12 text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Aval.</div>
                          </div>
                          {profile?.user_type === 'professional' && reputationStats.averageRating > 0 && (
                            <div className="w-10 sm:w-12 text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Nota</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PRINCIPAL */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection('principal')}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <Home className="h-3 w-3" />
                            PRINCIPAL
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has('principal') ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.has('principal') && (
                          <div className="space-y-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/home')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Home className="h-3 w-3" />
                              <span>HOME</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* DESCOBRIR */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection('descobrir')}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="h-3 w-3" />
                            DESCOBRIR
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has('descobrir') ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.has('descobrir') && (
                          <div className="space-y-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/buscar')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Search className="h-3 w-3" />
                              <span>BUSCAR PROFISSIONAIS</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/classificados')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Briefcase className="h-3 w-3" />
                              <span>CLASSIFICADOS</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/feed')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Users className="h-3 w-3" />
                              <span>FEED SOCIAL</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/avaliacoes')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Star className="h-3 w-3" />
                              <span>AVALIAÇÕES</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* COMUNICAÇÃO */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection('comunicacao')}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3 w-3" />
                            COMUNICAÇÃO
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has('comunicacao') ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.has('comunicacao') && (
                          <div className="space-y-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                openChat()
                                setIsMenuExpanded(false)
                              }}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>MENSAGENS</span>
                              {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-auto text-xs px-1 py-0">
                                  {unreadCount}
                                </Badge>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* GESTÃO */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection('gestao')}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            GESTÃO
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has('gestao') ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.has('gestao') && (
                          <div className="space-y-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/favoritos')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Heart className="h-3 w-3" />
                              <span>FAVORITOS</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* CONFIPOINTS */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection('confipoints')}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            CONFIPOINTS
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has('confipoints') ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.has('confipoints') && (
                          <div className="space-y-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Zap className="h-3 w-3" />
                              <span>MEUS PONTOS</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/historico')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Clock className="h-3 w-3" />
                              <span>HISTÓRICO</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/sistema-premium')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Award className="h-3 w-3" />
                              <span>SISTEMA PREMIUM</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/posts-premium')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <FileText className="h-3 w-3" />
                              <span>POSTS PREMIUM</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/anuncios-premium')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Briefcase className="h-3 w-3" />
                              <span>ANÚNCIOS PREMIUM</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/curtidas-premium')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Heart className="h-3 w-3" />
                              <span>CURTIDAS PREMIUM</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/badges-vip')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Shield className="h-3 w-3" />
                              <span>BADGES VIP</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/loja')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <CreditCard className="h-3 w-3" />
                              <span>LOJA</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/saque')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Wallet className="h-3 w-3" />
                              <span>SACAR</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/transferir')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <TrendingUp className="h-3 w-3" />
                              <span>TRANSFERIR</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/confipoints/minhas-compras')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <BarChart3 className="h-3 w-3" />
                              <span>MINHAS COMPRAS</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* PROFISSIONAL */}
                      {profile?.user_type === 'professional' && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => toggleSection('profissional')}
                            className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                          >
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-3 w-3" />
                              PROFISSIONAL
                            </div>
                            <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has('profissional') ? 'rotate-180' : ''}`} />
                          </button>
                          {expandedSections.has('profissional') && (
                            <div className="space-y-1 px-2 pb-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNavigation('/portfolio')}
                                className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                              >
                                <FileText className="h-3 w-3" />
                                <span>MEU PORTFÓLIO</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNavigation('/reputacao')}
                                className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                              >
                                <Trophy className="h-3 w-3" />
                                <span>REPUTAÇÃO</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUPORTE */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection('suporte')}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-3 w-3" />
                            SUPORTE
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has('suporte') ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.has('suporte') && (
                          <div className="space-y-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/ajuda')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <HelpCircle className="h-3 w-3" />
                              <span>CENTRAL DE AJUDA</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/contato')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Phone className="h-3 w-3" />
                              <span>CONTATO</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/sobre')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Building className="h-3 w-3" />
                              <span>SOBRE NÓS</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/termos')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <FileText className="h-3 w-3" />
                              <span>TERMOS DE USO</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/privacidade')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Shield className="h-3 w-3" />
                              <span>POLÍTICA DE PRIVACIDADE</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Administração - Apenas para Admin */}
                      {isAdmin && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => toggleSection('administracao')}
                            className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                          >
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-3 w-3" />
                              Administração
                            </div>
                            <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has('administracao') ? 'rotate-180' : ''}`} />
                          </button>
                          {expandedSections.has('administracao') && (
                            <div className="grid grid-cols-1 gap-1 px-2 pb-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNavigation('/admin/dashboard')}
                                className="flex items-center gap-1 text-xs py-1 h-7 bg-gray-100 hover:bg-gray-200"
                              >
                                <ShieldCheck className="h-3 w-3" />
                                <span className="truncate">Painel Admin</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* CONTA */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection('conta')}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            CONTA
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has('conta') ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.has('conta') && (
                          <div className="space-y-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation(`/perfil/${profile?.id}`)}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <User className="h-3 w-3" />
                              <span>MEU PERFIL</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/editarperfil')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Edit className="h-3 w-3" />
                              <span>EDITAR PERFIL</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/configuracoes-privacidade')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Shield className="h-3 w-3" />
                              <span>PRIVACIDADE</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation('/verificacao')}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start"
                            >
                              <Shield className="h-3 w-3" />
                              <span>VERIFICAÇÃO</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSignOut}
                              className="flex items-center gap-2 text-xs py-1 h-7 w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <LogOut className="h-3 w-3" />
                              <span>SAIR</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Informações do Usuário */}
                      <div className="pt-2 sm:pt-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                          <div className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
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
