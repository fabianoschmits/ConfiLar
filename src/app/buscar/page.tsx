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
        <div className="min-h-screen bg-yellow-400">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-3" />
                <p className="text-black font-bold">CARREGANDO...</p>
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
        <div className="min-h-screen bg-yellow-400">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-black text-black mb-4">
                CARREGANDO...
              </h1>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-yellow-400">
        <div className="container mx-auto px-4 py-8">
          {/* Header Brutalista */}
          <div className="text-center mb-12">
            <div className="inline-block p-8 bg-black text-yellow-400 border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h1 className="text-5xl font-black mb-4 tracking-wider">
                BUSCA AVANÇADA
              </h1>
              <p className="text-xl font-bold">
                ENCONTRE OS MELHORES PROFISSIONAIS
              </p>
            </div>
          </div>

          {/* Estatísticas Brutalistas */}
          {stats.totalUsers > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-black text-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <div className="text-3xl font-black">{stats.totalUsers}</div>
                <div className="font-bold">TOTAL DE USUÁRIOS</div>
              </div>
              <div className="p-6 bg-white text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <div className="text-3xl font-black">{stats.professionalsCount}</div>
                <div className="font-bold">PROFISSIONAIS</div>
              </div>
              <div className="p-6 bg-red-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                <Star className="h-8 w-8 mx-auto mb-2" />
                <div className="text-3xl font-black">{stats.verifiedCount}</div>
                <div className="font-bold">VERIFICADOS</div>
              </div>
              <div className="p-6 bg-green-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <div className="text-3xl font-black">{stats.clientsCount}</div>
                <div className="font-bold">CLIENTES</div>
              </div>
            </div>
          )}

          {/* Controles de Modo de Busca Brutalistas */}
          <div className="flex justify-center mb-8">
            <div className="bg-black p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Button
                variant={searchMode === 'advanced' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSearchMode('advanced')}
                className={`mr-2 font-black ${
                  searchMode === 'advanced' 
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                    : 'bg-transparent text-yellow-400 hover:bg-yellow-400 hover:text-black'
                }`}
              >
                BUSCA AVANÇADA
              </Button>
              <Button
                variant={searchMode === 'proximity' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSearchMode('proximity')}
                className={`font-black ${
                  searchMode === 'proximity' 
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                    : 'bg-transparent text-yellow-400 hover:bg-yellow-400 hover:text-black'
                }`}
              >
                BUSCA POR PROXIMIDADE
              </Button>
            </div>
          </div>

          {/* Barra de Busca Principal Brutalista */}
          <div className="max-w-4xl mx-auto mb-4">
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
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
          </div>

          {/* Filtros e Resultados */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de Filtros Brutalista */}
            <div className="w-full lg:w-80">
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
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
            </div>

            {/* Resultados da Busca Brutalista */}
            <div className="flex-1">
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
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
      </div>
    </MainLayout>
  )
}
