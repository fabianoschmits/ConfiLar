'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchHistory as SearchHistoryComponent } from '@/components/features/SearchHistory'
import { CidadeCombobox } from '@/components/ui/LocationComboboxes'
import Link from 'next/link'

export default function BuscarPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('rating')
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hook para gerenciar histórico de busca
  const { saveSearch } = useSearchHistory()
  const { openChat } = useFloatingChat()

  // Carregar todos os usuários (profissionais e clientes) do Supabase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('rating', { ascending: false })

        if (!error && data) {
          console.log('📊 Usuários carregados:', data.length)
          console.log('🔍 Tipos de usuários:', data.map(u => ({ id: u.id, name: u.full_name, type: u.user_type })))
          setUsers(data as unknown as Profile[])
          setFilteredUsers(data as unknown as Profile[])
        } else {
          console.error('❌ Erro ao carregar usuários:', error)
          // Fallback para dados de exemplo se não houver usuários
          setUsers([])
          setFilteredUsers([])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error)
        setUsers([])
        setFilteredUsers([])
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Filtrar usuários baseado nos critérios selecionados
  useEffect(() => {
    let filtered = [...users]

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      console.log('🔍 Buscando por:', term)
      console.log('📊 Total de usuários antes da busca:', filtered.length)
      
      filtered = filtered.filter(user => {
        // Busca por nome
        const nameMatch = user.full_name?.toLowerCase().includes(term)
        
        // Busca por bio
        const bioMatch = user.bio?.toLowerCase().includes(term)
        
        // Busca por serviços profissionais (apenas para profissionais)
        const servicesMatch = user.user_type === 'professional' && 
          user.professional_services?.some(service => 
            service.toLowerCase().includes(term)
          ) || false
        
        // Busca por especialidades/certificações (apenas para profissionais)
        const certificationsMatch = user.user_type === 'professional' && 
          user.professional_certifications?.some(cert => 
            cert.toLowerCase().includes(term)
          ) || false
        
        // Log para debug
        if (nameMatch || bioMatch || servicesMatch || certificationsMatch) {
          console.log('✅ Usuário encontrado:', {
            name: user.full_name,
            type: user.user_type,
            services: user.professional_services,
            bio: user.bio?.substring(0, 50)
          })
        }
        
        return nameMatch || bioMatch || servicesMatch || certificationsMatch
      })
      
      console.log('📊 Total de usuários após a busca:', filtered.length)
    }

    // Filtro por categoria (apenas para profissionais)
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(user => 
        user.user_type === 'professional' && 
        user.professional_services?.some(service => 
          service.toLowerCase().includes(selectedCategory.toLowerCase())
        ) || false
      )
    }

    // Filtro por estado
    if (selectedState) {
      filtered = filtered.filter(user => 
        user.location_state === selectedState
      )
    }

    // Filtro por cidade
    if (selectedCity) {
      filtered = filtered.filter(user => 
        user.location_city === selectedCity
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

    setFilteredUsers(filtered)
  }, [users, searchTerm, selectedCategory, selectedState, selectedCity, sortBy])

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
    // Abrir chat flutuante diretamente
    openChat(professional.id, professional.full_name || 'Profissional')
  }, [openChat])

  if (loading) {
    return (
      <MainLayout requireAuth={false}>
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
              Encontre Usuários
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conectamos você aos melhores profissionais e clientes da sua região. 
              Filtre por localização, categoria e avaliações para encontrar quem você precisa.
            </p>
          </div>

          {/* Barra de Busca Principal */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Digite o nome, profissão ou o que você precisa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              <Button
                onClick={() => {
                  if (mounted) {
                    handleSearch()
                  }
                }}
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
                      onClick={() => {
                        if (mounted) {
                          setShowFilters(!showFilters)
                        }
                      }}
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
                    onClick={() => {
                      if (mounted) {
                        handleClearFilters()
                      }
                    }}
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
                      <span className="font-semibold text-primary">{filteredUsers.length}</span> usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                      {users.length > 0 && filteredUsers.length !== users.length && (
                        <span className="text-muted-foreground ml-2">
                          de {users.length} total
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
                  {filteredUsers.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Ordenado por {sortBy === 'rating' ? 'avaliação' : sortBy === 'reviews' ? 'número de avaliações' : sortBy === 'name' ? 'nome' : 'verificação'}
                    </p>
                  )}
                </div>
              </div>

              {/* Lista de Usuários */}
              {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-all duration-300 rounded-lg border border-border hover:border-primary/20 overflow-hidden">
                      <CardContent className="p-2">
                        <div className="text-center">
                          {/* Avatar com foto do usuário */}
                          <Avatar className="w-12 h-12 mx-auto mb-2">
                            <AvatarImage src={user.avatar_url || ''} alt={user.full_name || 'Usuário'} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {(user.full_name || 'N').charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Nome como link */}
                          <Link 
                            href={`/perfil/${user.id}`}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors block mb-1 line-clamp-1"
                          >
                            {user.full_name || 'Nome não informado'}
                          </Link>

                          {/* Tag de tipo de usuário */}
                          <div className="mb-1">
                            <Badge 
                              variant={user.user_type === 'professional' ? 'default' : 'secondary'} 
                              className="text-xs px-2 py-1"
                            >
                              {user.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                            </Badge>
                          </div>

                          {/* Localização */}
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
                            <MapPin className="h-2 w-2" />
                            <span className="line-clamp-1 text-xs">
                              {user.location_city || 'Cidade'}
                            </span>
                          </div>

                          {/* Badge de verificação */}
                          {user.is_verified && (
                            <div className="flex items-center justify-center gap-1 text-xs text-primary mb-1">
                              <Shield className="h-2 w-2" />
                              <span className="text-xs">Verificado</span>
                            </div>
                          )}

                          {/* Avaliação */}
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Star className="h-2 w-2 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">
                              {user.rating ? user.rating.toFixed(1) : '0.0'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({user.total_reviews || 0})
                            </span>
                          </div>

                          {/* Principal serviço (apenas para profissionais) */}
                          {user.user_type === 'professional' && user.professional_services && user.professional_services.length > 0 && (
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                {user.professional_services[0]}
                              </Badge>
                              {user.professional_services.length > 1 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  +{user.professional_services.length - 1} mais
                                </div>
                              )}
                            </div>
                          )}

                          {/* Ações */}
                          <div className="flex flex-col gap-1">
                            <Button
                              onClick={() => {
                                if (mounted) {
                                  handleContact(user)
                                }
                              }}
                              size="sm"
                              className="px-2 py-1 h-6 text-xs w-full"
                            >
                              <MessageCircle className="h-2 w-2 mr-1" />
                              Chat
                            </Button>
                            
                            <RecommendationButton
                              userId={user.id}
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
                    {users.length === 0 
                      ? 'Nenhum usuário cadastrado'
                      : 'Nenhum usuário encontrado'
                    }
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {users.length === 0 
                      ? 'Ainda não há usuários cadastrados no sistema. Seja o primeiro!'
                      : searchTerm || selectedState || selectedCity || selectedCategory !== 'all'
                        ? 'Tente ajustar os filtros ou usar termos de busca diferentes.'
                        : 'Comece digitando o que você precisa na barra de busca acima.'
                    }
                  </p>
                  {users.length === 0 ? (
                    <Button
                      onClick={() => {
                        if (mounted) {
                          window.location.href = '/auth?tab=register'
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Cadastrar-se
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (mounted) {
                          handleClearFilters()
                        }
                      }}
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
              onClick={() => {
                if (mounted) {
                  setShowSearchHistory(!showSearchHistory)
                }
              }}
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
