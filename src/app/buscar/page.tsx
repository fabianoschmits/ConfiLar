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
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchHistory as SearchHistoryComponent } from '@/components/features/SearchHistory'
import { AdvancedSearchFilters } from '@/components/search/AdvancedSearchFilters'
import { SearchResults } from '@/components/search/SearchResults'
import { SearchBar } from '@/components/search/SearchBar'
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch'

export default function BuscarPage() {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mounted, setMounted] = useState(false)

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

  // Hook para gerenciar histórico de busca
  const { saveSearch, searchHistory } = useSearchHistory()
  const { openChat } = useFloatingChat()

  // Função para executar busca e salvar no histórico
  const handleSearch = useCallback(() => {
    if (filters.searchTerm.trim()) {
      const searchFilters = {
        location_state: filters.state !== 'all' ? filters.state : undefined,
        location_city: filters.city !== 'all' ? filters.city : undefined,
        category_id: filters.category !== 'all' ? filters.category : undefined
      }
      
      saveSearch(filters.searchTerm, searchFilters)
    }
    executeSearch()
  }, [filters, saveSearch, executeSearch])

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

  const handleRecentSearchClick = useCallback((term: string) => {
    updateFilters({ searchTerm: term })
  }, [updateFilters])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    updateFilters({ searchTerm: suggestion })
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

          {/* Barra de Busca Principal */}
          <div className="max-w-4xl mx-auto mb-8">
            <SearchBar
              searchTerm={filters.searchTerm}
              onSearchChange={handleSearchTermChange}
              onSearch={handleSearch}
              filters={filters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              showFilters={showFilters}
              recentSearches={searchHistory.map(item => item.search_query)}
              onRecentSearchClick={handleRecentSearchClick}
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>

          {/* Filtros e Resultados */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de Filtros Avançados */}
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              isMobile={true}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />

            {/* Resultados da Busca */}
            <div className="flex-1">
              <SearchResults
                users={filteredUsers}
                filters={filters}
                loading={loading}
                onContact={handleContact}
                onViewProfile={handleViewProfile}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>

          {/* Histórico de Buscas */}
          <div className="mt-12 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowSearchHistory(!showSearchHistory)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              {showSearchHistory ? 'Ocultar' : 'Ver'} Histórico de Buscas
            </Button>
          </div>

          {showSearchHistory && (
            <div className="mt-6">
              <SearchHistoryComponent />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
