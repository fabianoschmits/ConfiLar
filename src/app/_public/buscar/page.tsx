'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ComboboxCategorias, ComboboxEstados } from '@/components/ui/Combobox'
import { 
  Search, 
  MapPin, 
  Star, 
  Filter,
  X,
  MessageCircle,
  Shield
} from 'lucide-react'
import { RecommendationButton } from '@/components/ui/RecommendationButton'
import { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchHistory as SearchHistoryComponent } from '@/components/features/SearchHistory'
import { CidadeCombobox } from '@/components/ui/LocationComboboxes'
import Link from 'next/link'

export default function BuscarPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('rating')
  const [professionals, setProfessionals] = useState<Profile[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<Profile[]>([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [loading, setLoading] = useState(true)

  // Hook para gerenciar histórico de busca
  const { saveSearch } = useSearchHistory()

  // Carregar profissionais reais do Supabase
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'professional')
          .order('rating', { ascending: false })

        if (!error && data) {
          console.log('📊 Profissionais carregados:', data.length)
          console.log('🔍 IDs dos profissionais:', data.map(p => ({ id: p.id, name: p.full_name })))
          setProfessionals(data as unknown as Profile[])
          setFilteredProfessionals(data as unknown as Profile[])
        } else {
          console.error('❌ Erro ao carregar profissionais:', error)
          // Fallback para dados de exemplo se não houver profissionais
          setProfessionals([])
          setFilteredProfessionals([])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar profissionais:', error)
        setProfessionals([])
        setFilteredProfessionals([])
      } finally {
        setLoading(false)
      }
    }

    loadProfessionals()
  }, [])

  // Filtrar profissionais baseado nos critérios selecionados
  useEffect(() => {
    let filtered = [...professionals]

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      console.log('🔍 Buscando por:', term)
      console.log('📊 Total de profissionais antes da busca:', filtered.length)
      
      filtered = filtered.filter(professional => {
        // Busca por nome
        const nameMatch = professional.full_name?.toLowerCase().includes(term)
        
        // Busca por bio
        const bioMatch = professional.bio?.toLowerCase().includes(term)
        
        // Busca por serviços profissionais
        const servicesMatch = professional.professional_services?.some(service => 
          service.toLowerCase().includes(term)
        ) || false
        
        // Busca por especialidades/certificações
        const certificationsMatch = professional.professional_certifications?.some(cert => 
          cert.toLowerCase().includes(term)
        ) || false
        
        // Log para debug
        if (nameMatch || bioMatch || servicesMatch || certificationsMatch) {
          console.log('✅ Profissional encontrado:', {
            name: professional.full_name,
            services: professional.professional_services,
            bio: professional.bio?.substring(0, 50)
          })
        }
        
        return nameMatch || bioMatch || servicesMatch || certificationsMatch
      })
      
      console.log('📊 Total de profissionais após a busca:', filtered.length)
    }

    // Filtro por categoria
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(professional => 
        professional.professional_services?.some(service => 
          service.toLowerCase().includes(selectedCategory.toLowerCase())
        ) || false
      )
    }

    // Filtro por estado
    if (selectedState) {
      filtered = filtered.filter(professional => 
        professional.location_state === selectedState
      )
    }

    // Filtro por cidade
    if (selectedCity) {
      filtered = filtered.filter(professional => 
        professional.location_city === selectedCity
      )
    }

    // Ordenação
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'reviews':
        // filtered.sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
        break
      case 'name':
        filtered.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
        break
      case 'verified':
        // filtered.sort((a, b) => (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0))
        break
    }

    setFilteredProfessionals(filtered)
  }, [professionals, searchTerm, selectedCategory, selectedState, selectedCity, sortBy])

  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedState('')
    setSelectedCity('')
    setSortBy('rating')
  }, [])

  // Função para executar busca e salvar no histórico
  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      const filters = {
        location_state: selectedState !== 'all' ? selectedState : undefined,
        location_city: selectedCity !== 'all' ? selectedCity : undefined,
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined
      }
      
      saveSearch(searchTerm, filters)
    }
  }, [searchTerm, selectedState, selectedCity, selectedCategory, saveSearch])

  const handleContact = useCallback((professional: Profile) => {
    console.log('🔍 Iniciando conversa com profissional:', {
      id: professional.id,
      name: professional.full_name,
      email: professional.email
    })
    // Redirecionar para página de mensagens com o ID do profissional para iniciar conversa
    window.location.href = `/mensagens?professional=${professional.id}&name=${encodeURIComponent(professional.full_name || 'Profissional')}`
  }, [])

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" style={{ animationDuration: '0.6s' }}></div>
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header da Página */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Encontre o Profissional Ideal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conectamos você aos melhores profissionais da sua região. 
              Filtre por localização, categoria e avaliações para encontrar quem você precisa.
            </p>
          </div>

          {/* Barra de Busca Principal */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Digite o que você precisa (ex: pedreiro, diarista, eletricista)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-xl"
              >
                Buscar
              </Button>
            </div>
          </div>

          {/* Filtros e Resultados */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de Filtros */}
            <div className="lg:w-80 flex-shrink-0">
              <Card className="sticky top-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filtros
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden"
                    >
                      {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Categoria - NOVO COMBOBOX */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Categoria
                    </label>
                    <ComboboxCategorias
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    />
                  </div>

                  {/* Estado - NOVO COMBOBOX */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Estado
                    </label>
                    <ComboboxEstados
                      value={selectedState}
                      onValueChange={setSelectedState}
                    />
                  </div>

                  {/* Cidade com busca automática */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Cidade
                    </label>
                    <CidadeCombobox
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                      estadoSigla={selectedState}
                      disabled={!selectedState}
                    />
                  </div>

                  {/* Ordenação */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Ordenar por
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Melhor Avaliação</SelectItem>
                        <SelectItem value="reviews">Mais Avaliações</SelectItem>
                        <SelectItem value="name">Nome A-Z</SelectItem>
                        <SelectItem value="verified">Verificados Primeiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botão Limpar Filtros */}
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full rounded-lg border-2 hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Resultados da Busca */}
            <div className="flex-1">
              {/* Estatísticas dos Resultados */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-primary">{filteredProfessionals.length}</span> profissional{filteredProfessionals.length !== 1 ? 'is' : ''} encontrado{filteredProfessionals.length !== 1 ? 's' : ''}
                      {professionals.length > 0 && filteredProfessionals.length !== professionals.length && (
                        <span className="text-muted-foreground ml-2">
                          de {professionals.length} total
                        </span>
                      )}
                    </p>
                    {(selectedState || selectedCity || searchTerm) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Filtros ativos:</span>
                        {selectedState && (
                          <Badge variant="secondary" className="text-xs">
                            Estado: {selectedState}
                          </Badge>
                        )}
                        {selectedCity && (
                          <Badge variant="secondary" className="text-xs">
                            Cidade: {selectedCity}
                          </Badge>
                        )}
                        {searchTerm && (
                          <Badge variant="secondary" className="text-xs">
                            Busca: &quot;{searchTerm}&quot;
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  {filteredProfessionals.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Ordenado por {sortBy === 'rating' ? 'avaliação' : sortBy === 'reviews' ? 'número de avaliações' : sortBy === 'name' ? 'nome' : 'verificação'}
                    </p>
                  )}
                </div>
              </div>

              {/* Lista de Profissionais */}
              {filteredProfessionals.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredProfessionals.map((professional) => (
                    <Card key={professional.id} className="hover:shadow-md transition-all duration-300 rounded-lg border border-border hover:border-primary/20 overflow-hidden">
                      <CardContent className="p-2">
                        <div className="text-center">
                          {/* Avatar com foto do usuário */}
                          <Avatar className="w-12 h-12 mx-auto mb-2">
                            <AvatarImage src={professional.avatar_url || ''} alt={professional.full_name || 'Usuário'} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {(professional.full_name || 'N').charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Nome como link */}
                          <Link 
                            href={`/perfil/${professional.id}`}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors block mb-1 line-clamp-1"
                          >
                            {professional.full_name || 'Nome não informado'}
                          </Link>

                          {/* Localização */}
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
                            <MapPin className="h-2 w-2" />
                            <span className="line-clamp-1 text-xs">
                              {professional.location_city || 'Cidade'}
                            </span>
                          </div>

                          {/* Badge de verificação */}
                          {professional.is_verified && (
                            <div className="flex items-center justify-center gap-1 text-xs text-primary mb-1">
                              <Shield className="h-2 w-2" />
                              <span className="text-xs">Verificado</span>
                            </div>
                          )}

                          {/* Avaliação */}
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Star className="h-2 w-2 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">
                              {professional.rating ? professional.rating.toFixed(1) : '0.0'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({professional.total_reviews || 0})
                            </span>
                          </div>

                          {/* Principal serviço */}
                          {professional.professional_services && professional.professional_services.length > 0 && (
                            <div className="mb-2">
                              <Badge variant="secondary" className="text-xs px-2 py-1">
                                {professional.professional_services[0]}
                              </Badge>
                              {professional.professional_services.length > 1 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  +{professional.professional_services.length - 1} mais
                                </div>
                              )}
                            </div>
                          )}

                          {/* Ações */}
                          <div className="flex flex-col gap-1">
                            <Button
                              onClick={() => handleContact(professional)}
                              size="sm"
                              className="px-2 py-1 h-6 text-xs w-full"
                            >
                              <MessageCircle className="h-2 w-2 mr-1" />
                              Chat
                            </Button>
                            
                            <RecommendationButton
                              userId={professional.id}
                              size="sm"
                              variant="outline"
                              showCount={true}
                              className="h-6 px-2 text-xs w-full"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                /* Estado vazio */
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {professionals.length === 0 
                      ? 'Nenhum profissional cadastrado'
                      : 'Nenhum profissional encontrado'
                    }
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {professionals.length === 0 
                      ? 'Ainda não há profissionais cadastrados no sistema. Seja o primeiro!'
                      : searchTerm || selectedState || selectedCity || selectedCategory !== 'all'
                        ? 'Tente ajustar os filtros ou usar termos de busca diferentes.'
                        : 'Comece digitando o que você precisa na barra de busca acima.'
                    }
                  </p>
                  {professionals.length === 0 ? (
                    <Button
                      onClick={() => window.location.href = '/auth/cadastro'}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Cadastrar como Profissional
                    </Button>
                  ) : (
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              )}
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
