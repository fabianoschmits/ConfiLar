'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserListSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  MessageCircle,
  Eye,
  CheckCircle,
  Briefcase,
  User,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Wrench
} from 'lucide-react'
import { Profile } from '@/types/database'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { useAvailabilityContext } from '@/contexts/AvailabilityContext'
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'
import { useIBGE } from '@/hooks/useIBGE'
import { services } from '@/data/services'
import { useProfileViews } from '@/hooks/useProfileViews'
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews'
import { supabase } from '@/lib/supabase'
import { RecommendationButton } from '@/components/ui/RecommendationButton'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { SmartSearchBar } from '@/components/search/SmartSearchBar'
import { useTranslations } from 'next-intl'

export default function BuscarPage() {
  const router = useRouter()
  const t = useTranslations('search')
  const tCommon = useTranslations('common')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [profileViews, setProfileViews] = useState<Record<string, number>>({})
  const [profileStats, setProfileStats] = useState<Record<string, { rating: number; reviewCount: number }>>({})
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'professionals'>('all')
  const loadedProfilesRef = useRef<Set<string>>(new Set())
  const isLoadingRef = useRef(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    state: '',
    city: '',
    service: 'all',
    rating: 'all',
    availability: 'all',
    userType: 'all'
  })

  const { estados, cidades, loadCidades } = useIBGE()
  const { openChat } = useFloatingChat()
  const { userAvailability } = useAvailabilityContext()
  const { getViewStats, recordView } = useProfileViews()
  const { fetchUserReviewStats } = useSupabaseReviews()


  // Hook para busca avançada
  const {
    filteredUsers,
    loading,
    stats,
    executeSearch,
    updateFilters
  } = useAdvancedSearch()

  // Executar busca inicial para carregar todos os usuários
  useEffect(() => {
    executeSearch()
  }, [executeSearch])


  // Função para executar busca
  const handleSearch = useCallback(() => {
    executeSearch()
  }, [executeSearch])

  // Função para lidar com mudanças de filtros
  const handleFilterChange = (key: string, value: string) => {
    // Atualizar filtros locais para UI
    setFilters(prev => ({ ...prev, [key]: value }))
    
    // Atualizar filtros do hook de busca avançada
    if (key === 'state') {
      setFilters(prev => ({ ...prev, city: '' }))
      if (value) loadCidades(value)
      updateFilters({ state: value, city: '' })
    } else if (key === 'city') {
      updateFilters({ city: value })
    } else if (key === 'searchTerm') {
      updateFilters({ searchTerm: value })
    }
    
    // Executar busca após mudança de filtros
    setTimeout(() => executeSearch(), 100)
  }

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      state: '',
      city: '',
      service: 'all',
      rating: 'all',
      availability: 'all',
      userType: 'all'
    })
    
    // Limpar filtros do hook de busca avançada
    updateFilters({
      searchTerm: '',
      state: '',
      city: '',
      userType: 'all',
      category: 'all'
    })
    
    // Executar busca com filtros limpos
    setTimeout(() => executeSearch(), 100)
  }

  // Função para lidar com cliques no perfil
  const handleProfileClick = async (profileId: string) => {
    try {
      // Validar se é um UUID válido antes de tentar registrar
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      
      if (uuidRegex.test(profileId)) {
        // Tentar registrar visualização apenas para UUIDs válidos
        await recordView(profileId)
      }
    } catch (error) {
      // Se falhar ao registrar visualização, continuar mesmo assim
      console.log('Não foi possível registrar visualização:', error)
    }
    
    // Navegar para o perfil sempre
    router.push(`/perfil/${profileId}`)
  }

  // Removido dados mockados - usando apenas dados reais do Supabase

  // Filtrar por tipo de usuário baseado na aba ativa
  const getFilteredProfilesByTab = () => {
    // Usar apenas dados reais do Supabase
    const baseProfiles = filteredUsers
    
    switch (activeTab) {
      case 'clients':
        return baseProfiles.filter(profile => profile.user_type === 'client')
      case 'professionals':
        return baseProfiles.filter(profile => profile.user_type === 'professional')
      case 'all':
      default:
        return baseProfiles
    }
  }

  // Aplicar paginação
  const allFilteredProfiles = getFilteredProfilesByTab()
  const totalPages = Math.ceil(allFilteredProfiles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayProfiles = allFilteredProfiles.slice(startIndex, endIndex)

  // Reset página quando trocar aba ou filtros
  const resetToFirstPage = () => {
    setCurrentPage(1)
  }

  // Carregar estatísticas quando os resultados mudarem (SEM LOOPS)
  useEffect(() => {
    if (displayProfiles.length === 0 || isLoadingRef.current) return

    isLoadingRef.current = true
    
    const newViews: Record<string, number> = {}
    const newStats: Record<string, { rating: number; reviewCount: number }> = {}
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // Inicializar TODOS os perfis primeiro (sem setState)
    displayProfiles.forEach(profile => {
      if (!uuidRegex.test(profile.id)) {
        // Para dados mockados
        newViews[profile.id] = Math.floor(Math.random() * 300) + 50
        newStats[profile.id] = {
          rating: Math.round((Math.random() * 4 + 1) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 50) + 5
        }
      } else {
        // Para UUIDs reais, valor inicial
        newViews[profile.id] = 0
        newStats[profile.id] = { rating: 0, reviewCount: 0 }
      }
    })

    // Atualizar estados UMA ÚNICA VEZ
    setProfileViews(newViews)
    setProfileStats(newStats)

    // Carregar dados reais (sem setState dentro de loops)
    const loadRealData = async () => {
      const realViews = { ...newViews }
      const realStats = { ...newStats }
      
      const profilesToLoad = displayProfiles.filter(p => 
        uuidRegex.test(p.id) && !loadedProfilesRef.current.has(p.id)
      )

      if (profilesToLoad.length === 0) {
        isLoadingRef.current = false
        return
      }

      try {
        // Carregar TODOS os dados em paralelo
        const promises = profilesToLoad.map(async (profile) => {
          try {
            const [viewResult, reviewResult] = await Promise.all([
              supabase.from('profile_views').select('*').eq('viewed_profile_id', profile.id),
              supabase.from('reviews').select('rating_person').eq('reviewed_id', profile.id)
            ])

            const viewCount = viewResult.data?.length || 0
            realViews[profile.id] = viewCount

            if (reviewResult.data && reviewResult.data.length > 0) {
              const avgRating = reviewResult.data.reduce((sum, r) => sum + (r.rating_person || 0), 0) / reviewResult.data.length
              realStats[profile.id] = {
                rating: Math.round(avgRating * 10) / 10,
                reviewCount: reviewResult.data.length
              }
            }

            loadedProfilesRef.current.add(profile.id)
          } catch (error) {
            // Silenciar erros individuais
          }
        })

        await Promise.allSettled(promises)

        // Atualizar estados UMA ÚNICA VEZ no final
        setProfileViews(realViews)
        setProfileStats(realStats)
      } catch (error) {
        // Silenciar erros gerais
      }

      isLoadingRef.current = false
    }

    // Executar com delay pequeno
    setTimeout(loadRealData, 200)
  }, [displayProfiles.map(p => p.id).join(',')])

  // Reset página quando trocar aba
  useEffect(() => {
    resetToFirstPage()
    // Limpar cache de perfis carregados
    loadedProfilesRef.current.clear()
    isLoadingRef.current = false
    // Executar busca quando trocar aba
    executeSearch()
  }, [activeTab, executeSearch])


    return (
      <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">

          {/* Estatísticas - Card Compacto */}
          <Card className="mb-8 hover:shadow-xl transition-all duration-300">
            <CardContent className="py-2 px-3 sm:py-3 sm:px-4">
              <div className="flex flex-row items-center justify-around gap-1 sm:gap-2">
                {/* Total de Usuários */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('stats.total')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white dark:text-white">{stats?.totalUsers || 0}</p>
                </div>
                
                {/* Profissionais */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('stats.professionals')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white dark:text-white">{stats?.professionalsCount || 0}</p>
                </div>
                
                {/* Clientes */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('stats.clients')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white dark:text-white">{stats?.clientsCount || 0}</p>
                </div>
                
                {/* Resultados Filtrados */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Resultados</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white dark:text-white">{stats?.filteredCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Barra de Busca Inteligente */}
          <div className="mb-6">
            <SmartSearchBar
              onSearch={(query, searchFilters) => {
                setFilters(searchFilters)
                updateFilters({
                  searchTerm: searchFilters.searchTerm,
                  state: searchFilters.state,
                  city: searchFilters.city,
                  userType: searchFilters.userType,
                  category: searchFilters.service
                })
                executeSearch()
              }}
              onFiltersChange={(searchFilters) => {
                setFilters(searchFilters)
                updateFilters({
                  searchTerm: searchFilters.searchTerm,
                  state: searchFilters.state,
                  city: searchFilters.city,
                  userType: searchFilters.userType,
                  category: searchFilters.service
                })
              }}
              initialFilters={filters}
              placeholder={t('searchPlaceholder')}
              className="w-full"
            />
          </div>

          {/* Controles de Visualização */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {allFilteredProfiles.length} {allFilteredProfiles.length !== 1 ? t('resultadosPlural') : t('resultados')}
              </span>
            </div>
            
            <div className="flex border border-gray-200 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Abas de Filtro por Tipo de Usuário */}
          <div className="mb-6">
            <div className="flex items-center gap-1 sm:gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{t('all')}</span>
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                  {allFilteredProfiles.length}
                </Badge>
              </button>
              
              <button
                onClick={() => setActiveTab('clients')}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'clients'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{t('clients')}</span>
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                  {filteredUsers.filter(p => p.user_type === 'client').length}
                </Badge>
              </button>
              
              <button
                onClick={() => setActiveTab('professionals')}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'professionals'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{t('professionals')}</span>
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                  {filteredUsers.filter(p => p.user_type === 'professional').length}
                </Badge>
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {activeTab === 'all' ? t('all') : 
                 activeTab === 'clients' ? t('clients') : 
                 t('professionals')} ({displayProfiles.length})
              </h2>
            </div>

            {loading ? (
              <UserListSkeleton count={6} />
            ) : displayProfiles.length === 0 ? (
              <EmptyState
                icon={<Search className="h-12 w-12 text-gray-400" />}
                title={t('noResults')}
                description={
                  filters.searchTerm || filters.state || filters.city || filters.service !== 'all'
                    ? t('noResultsDescription')
                    : t('noUsersDescription')
                }
                action={
                  filters.searchTerm || filters.state || filters.city || filters.service !== 'all'
                    ? {
                        label: t('clearFilters'),
                        onClick: clearFilters
                      }
                    : undefined
                }
              />
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {displayProfiles.map((profile) => (
                  <Card key={profile.id} className="hover:shadow-md transition-shadow duration-200 relative">
                    <CardContent className="p-6">
                      {/* Badge de Serviços - Canto Superior Direito */}
                      {profile.user_type === 'professional' && 
                       profile.professional_services && 
                       profile.professional_services.length > 0 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-auto py-1 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <Wrench className="h-3 w-3 mr-1" />
                              Serviços
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="end">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2 border-b pb-2">
                                <Briefcase className="h-4 w-4 text-blue-600" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">Serviços Oferecidos</h4>
                              </div>
                              <div className="max-h-64 overflow-y-auto space-y-2">
                                {profile.professional_services.map((service, index) => (
                                  <div 
                                    key={index} 
                                    className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-900 dark:text-white">{service}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500 text-center pt-2 border-t">
                                {profile.professional_services.length} {profile.professional_services.length === 1 ? 'serviço' : 'serviços'}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      
                      {/* Header do Card */}
                      <div className="flex items-start space-x-3 mb-4">
                        <div 
                          onClick={() => handleProfileClick(profile.id)}
                          className="flex-shrink-0 cursor-pointer"
                        >
                          <UserAvatar
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            fallback={profile.full_name?.charAt(0).toUpperCase() || 'P'}
                            size="lg"
                            userId={profile.id}
                            showReferralBadge={true}
                            className="hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            onClick={() => handleProfileClick(profile.id)}
                            className="cursor-pointer"
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                              {profile.full_name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {/* Tag de Tipo de Usuário */}
                            <Badge 
                              variant={profile.user_type === 'professional' ? 'default' : 'secondary'}
                              className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300 ${
                                profile.user_type === 'professional'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm' 
                                  : 'bg-purple-100 text-purple-800 border border-purple-200 shadow-sm'
                              }`}
                            >
                              {profile.user_type === 'professional' ? (
                                <>
                                  <Briefcase className="h-3 w-3" />
                                  Profissional
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3" />
                                  Cliente
                                </>
                              )}
                            </Badge>
                            
                            {(() => {
                              // Usar disponibilidade do contexto se disponível, senão usar do perfil
                              const isAvailable = userAvailability[profile.id] !== undefined 
                                ? userAvailability[profile.id] 
                                : profile.is_available
                              
                              return (
                                <Badge 
                                  variant={isAvailable ? 'default' : 'secondary'}
                                  className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300 ${
                                    isAvailable 
                                      ? 'bg-green-100 text-green-800 border border-green-200 shadow-sm' 
                                      : 'bg-red-100 text-red-800 border border-red-200 shadow-sm'
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                                    isAvailable ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                  {isAvailable ? t('available') : t('unavailable')}
                                </Badge>
                              )
                            })()}
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {profile.location_city}, {profile.location_state}
                            </div>
              </div>
            </div>
          </div>

                      {/* Bio */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {profile.bio || 'Profissional qualificado e experiente.'}
                      </p>

                      {/* Avaliações */}
                      {(() => {
                        const stats = profileStats[profile.id]
                        const rating = stats?.rating || 0
                        const reviewCount = stats?.reviewCount || 0
                        
                        return (
                          <div className="flex items-center mb-4">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              {rating > 0 ? `${rating.toFixed(1)} (${reviewCount} avaliações)` : 'Sem avaliações'}
                            </span>
                          </div>
                        )
                      })()}

                      {/* Footer do Card */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center text-xs text-gray-500">
                          <div className="flex items-center mb-0.5">
                            <Eye className="h-3 w-3 mr-1" />
                            <span className="font-medium">{profileViews[profile.id] || 0}</span>
                          </div>
                          <span className="text-xs">{t('views')}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <FavoriteButton 
                            userId={profile.id}
                            userName={profile.full_name || 'Usuário'}
                            size="sm"
                            variant="outline"
                          />
                          <RecommendationButton 
                            userId={profile.id}
                            userName={profile.full_name || 'Usuário'}
                            size="sm"
                            variant="outline"
                            showCount={false}
                            className="text-xs"
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => handleProfileClick(profile.id)}
                          >
                            {t('viewProfile')}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => openChat(profile.id, profile.full_name || 'Usuário')}
                            className="bg-blue-600 hover:bg-blue-700"
                            title={t('contact')}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Paginação */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-1">
                {/* Botão Anterior */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Números das páginas */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                  // Mostrar no máximo 7 números: atual, 2 antes, 2 depois, primeira e última
                  const shouldShow = 
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)

                  if (!shouldShow) {
                    // Mostrar reticências apenas entre intervalos
                    if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                      return (
                        <span key={pageNumber} className="px-2 text-gray-500">
                          ...
                        </span>
                      )
                    }
                    return null
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 ${
                        currentPage === pageNumber 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : ''
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}

                {/* Botão Próximo */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Info da paginação */}
            {!loading && allFilteredProfiles.length > 0 && (
              <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                Mostrando {startIndex + 1} a {Math.min(endIndex, allFilteredProfiles.length)} de {allFilteredProfiles.length} resultados
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}