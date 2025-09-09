'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Star,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react'
import { Profile } from '@/types/database'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { AdvancedSearchFilters } from '@/components/search/AdvancedSearchFilters'
import { SearchResults } from '@/components/search/SearchResults'
import { SearchBar } from '@/components/search/SearchBar'
import { ProximityFilter } from '@/components/search/ProximityFilter'
import { ProximityResults } from '@/components/search/ProximityResults'
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch'
import { useProximitySearch } from '@/hooks/useProximitySearch'
import { useGeolocation } from '@/hooks/useGeolocation'

export default function BuscarPage() {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mounted, setMounted] = useState(false)
  const [searchMode, setSearchMode] = useState<'advanced' | 'proximity'>('advanced')
  const [proximityRadius, setProximityRadius] = useState(10)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hook para busca avançada
  const {
    filters,
    filteredUsers,
    loading,
    stats,
    updateFilters,
    clearFilters,
    executeSearch
  } = useAdvancedSearch()

  // Hook para busca por proximidade
  const {
    results: proximityResults,
    loading: proximityLoading,
    error: proximityError,
    searchNearLocation,
    searchNearbyUsers
  } = useProximitySearch()

  // Hook para geolocalização
  const { location, getAndSaveLocation } = useGeolocation()

  const { openChat } = useFloatingChat()

  // Função para executar busca
  const handleSearch = useCallback(() => {
    executeSearch()
  }, [executeSearch])

  // Função para executar busca por proximidade
  const handleProximitySearch = useCallback(async () => {
    if (currentLocation) {
      await searchNearLocation(currentLocation.lat, currentLocation.lng, {
        radius_km: proximityRadius,
        user_type: 'professional',
        is_available: true
      })
    } else if (location) {
      await searchNearLocation(location.latitude, location.longitude, {
        radius_km: proximityRadius,
        user_type: 'professional',
        is_available: true
      })
    }
  }, [currentLocation, location, proximityRadius, searchNearLocation])

  // Executar busca por proximidade quando localização ou raio mudarem
  useEffect(() => {
    if ((currentLocation || location) && searchMode === 'proximity') {
      handleProximitySearch()
    }
  }, [currentLocation, location, proximityRadius, searchMode, handleProximitySearch])

  const handleContact = useCallback((professional: Profile) => {
    console.log('🔍 Iniciando conversa com profissional:', {
      id: professional.id,
      name: professional.full_name,
      email: professional.email
    })
    // Abrir chat flutuante diretamente
    openChat(professional.id, professional.full_name || 'Profissional')
  }, [openChat])

  const handleViewProfile = useCallback((userId: string) => {
    router.push(`/perfil/${userId}`)
  }, [router])

  const handleSearchTermChange = useCallback((term: string) => {
    updateFilters({ searchTerm: term })
  }, [updateFilters])


  // Sugestões de busca baseadas nos serviços disponíveis
  const suggestions = [
    'Eletricista', 'Encanador', 'Pintor', 'Pedreiro', 'Marceneiro',
    'Diarista', 'Faxineira', 'Jardineiro', 'Cabeleireiro', 'Manicure',
    'Personal Trainer', 'Babá', 'Cuidador', 'Técnico de Informática'
  ]

  if (loading) {
    return (
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!mounted) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Carregando...
              </h1>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header da Página */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Busca Avançada
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre os melhores profissionais e clientes com nossa busca inteligente. 
              Filtre por localização, categoria, avaliações e muito mais.
            </p>
          </div>

          {/* Estatísticas Gerais */}
          {stats.totalUsers > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total de Usuários</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.professionalsCount}</div>
                  <div className="text-sm text-muted-foreground">Profissionais</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.verifiedCount}</div>
                  <div className="text-sm text-muted-foreground">Verificados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.clientsCount}</div>
                  <div className="text-sm text-muted-foreground">Clientes</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Controles de Modo de Busca */}
          <div className="flex justify-center mb-6">
            <div className="bg-muted p-1 rounded-lg">
              <Button
                variant={searchMode === 'advanced' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSearchMode('advanced')}
                className="mr-1"
              >
                Busca Avançada
              </Button>
              <Button
                variant={searchMode === 'proximity' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSearchMode('proximity')}
              >
                Busca por Proximidade
              </Button>
            </div>
          </div>

          {/* Barra de Busca Principal */}
          <div className="max-w-4xl mx-auto mb-8">
            <SearchBar
              searchTerm={filters.searchTerm}
              onSearchChange={handleSearchTermChange}
              onSearch={handleSearch}
              filters={filters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              showFilters={showFilters}
              suggestions={suggestions}
            />
          </div>

          {/* Filtros e Resultados */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de Filtros */}
            <div className="w-full lg:w-80">
              {searchMode === 'advanced' ? (
                <AdvancedSearchFilters
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                  isMobile={true}
                  isOpen={showFilters}
                  onToggle={() => setShowFilters(!showFilters)}
                />
              ) : (
                <ProximityFilter
                  radius={proximityRadius}
                  onRadiusChange={setProximityRadius}
                  onLocationChange={setCurrentLocation}
                  currentLocation={currentLocation}
                />
              )}
            </div>

            {/* Resultados da Busca */}
            <div className="flex-1">
              {searchMode === 'advanced' ? (
                <SearchResults
                  users={filteredUsers}
                  filters={filters}
                  loading={loading}
                  onContact={handleContact}
                  onViewProfile={handleViewProfile}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              ) : (
                <ProximityResults
                  results={proximityResults}
                  loading={proximityLoading}
                  error={proximityError}
                  onUserClick={handleViewProfile}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}
