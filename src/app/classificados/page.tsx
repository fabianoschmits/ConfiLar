'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'
import { useIBGE } from '@/hooks/useIBGE'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { useClassifiedSearch } from '@/hooks/useClassifiedSearch'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { services } from '@/data/services'
import { 
  Search, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Plus, 
  Filter, 
  Star, 
  Eye,
  Briefcase,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  TrendingUp,
  Users,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

type AdType = 'all' | 'offers' | 'requests'

export default function ClassificadosPage() {
  const { user, profile } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isCreatingAd, setIsCreatingAd] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    state: '',
    city: '',
    category: 'all',
    adType: 'all' as AdType
  })

  // Estados do formulário de criação
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_state: '',
    location_city: '',
    price_range: '',
    urgency_level: 'normal',
    ad_type: 'offer' as 'offer' | 'request'
  })

  const { estados, cidades, loading: loadingIBGE, loadCidades } = useIBGE()
  
  // Hook para busca de classificados
  const {
    classifiedAds,
    filteredAds,
    loading,
    stats,
    executeSearch,
    loadClassifiedAds
  } = useClassifiedSearch()

  // Executar busca inicial
  useEffect(() => {
    executeSearch(filters)
  }, [executeSearch])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    executeSearch(filters)
  }, [filters, executeSearch])

  // Paginação
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAds = filteredAds.slice(startIndex, endIndex)

  // Função para atualizar filtros
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset para primeira página
  }

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      state: '',
      city: '',
      category: 'all',
      adType: 'all'
    })
    setCurrentPage(1)
  }

  // Criar novo anúncio
  const handleCreateAd = async () => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para criar anúncios')
      return
    }

    if (!formData.title || !formData.description || !formData.category || !formData.ad_type) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setIsCreatingAd(true)

      const adData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location_state: formData.location_state,
        location_city: formData.location_city,
        ad_type: formData.ad_type,
        is_active: true,
        views: 0
      }

      const { error } = await supabase
        .from('classified_ads')
        .insert([adData])

      if (error) throw error

      toast.success('Anúncio criado com sucesso!')
      setShowCreateDialog(false)
      setFormData({
        title: '',
        description: '',
        category: '',
        location_state: '',
        location_city: '',
        price_range: '',
        urgency_level: 'normal',
        ad_type: 'offer'
      })
      
      // Recarregar anúncios
      await loadClassifiedAds()
    } catch (error) {
      console.error('Erro ao criar anúncio:', error)
      toast.error('Erro ao criar anúncio')
    } finally {
      setIsCreatingAd(false)
    }
  }

  // Abrir chat com usuário
  const handleContactUser = (userId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para entrar em contato')
      return
    }
    openChat()
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Hoje'
    if (diffDays === 2) return 'Ontem'
    if (diffDays <= 7) return `${diffDays} dias atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  // Função para mudar página
  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

    return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header da Página */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Classificados
                </h1>
                <p className="text-gray-600">
                  Encontre serviços ou ofereça seus serviços profissionais
                </p>
            </div>
            
              {user && (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Anúncio
              </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Anúncio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Preciso de um pedreiro"
                        />
        </div>

                      <div>
                        <Label htmlFor="description">Descrição *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o que você precisa ou oferece..."
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="ad_type">Tipo de Anúncio *</Label>
                        <Select 
                          value={formData.ad_type} 
                          onValueChange={(value: 'offer' | 'request') => setFormData(prev => ({ ...prev, ad_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de anúncio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="offer">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span>Oferta - Estou oferecendo um serviço</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="request">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-orange-600" />
                                <span>Solicitação - Preciso de um serviço</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Categoria *</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] overflow-y-auto">
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.name}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>{service.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="state">Estado</Label>
                          <EstadoCombobox
                            value={formData.location_state}
                            onValueChange={(value) => {
                              setFormData(prev => ({ ...prev, location_state: value, location_city: '' }))
                              if (value) loadCidades(value)
                            }}
                          />
                  </div>
                </div>

                      {formData.location_state && (
                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <CidadeCombobox
                            value={formData.location_city}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, location_city: value }))}
                            estadoSigla={formData.location_state}
                          />
            </div>
          )}

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancelar
              </Button>
                        <Button onClick={handleCreateAd} disabled={isCreatingAd}>
                          {isCreatingAd ? 'Criando...' : 'Criar Anúncio'}
              </Button>
            </div>
          </div>
                  </DialogContent>
                </Dialog>
              )}
          </div>
              </div>
              
          {/* Estatísticas Compactas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Ofertas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.offers}</p>
              </div>
              </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Solicitações</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.requests}</p>
                </div>
            </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="h-5 w-5 text-purple-600" />
                        </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Categorias</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
                        </div>
                    </div>
              </CardContent>
            </Card>
                    </div>

          {/* Filtros e Busca Avançados */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Barra de Busca */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar anúncios por título, descrição ou categoria..."
                        value={filters.searchTerm}
                        onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Controles de Visualização */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Botão de Filtros */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Filtros Expandíveis */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Tipo de Anúncio */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Tipo de anúncio</Label>
                        <Select value={filters.adType} onValueChange={(value) => updateFilters({ adType: value as AdType })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os tipos</SelectItem>
                            <SelectItem value="offers">Ofertas (Profissionais)</SelectItem>
                            <SelectItem value="requests">Solicitações (Clientes)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Estado */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Estado</Label>
                        <EstadoCombobox
                          value={filters.state}
                          onValueChange={(value) => {
                            updateFilters({ state: value, city: '' })
                            if (value) loadCidades(value)
                          }}
                        />
                      </div>
                      
                      {/* Cidade */}
                      {filters.state && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Cidade</Label>
                          <CidadeCombobox
                            value={filters.city}
                            onValueChange={(value) => updateFilters({ city: value })}
                            estadoSigla={filters.state}
                          />
                        </div>
                      )}
                      
                      {/* Categoria */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Categoria</Label>
                        <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas as categorias" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.name}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Botão Limpar Filtros */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Tipo */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'all', label: 'Todos', count: stats.total },
                  { id: 'offers', label: 'Ofertas', count: stats.offers },
                  { id: 'requests', label: 'Solicitações', count: stats.requests }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => updateFilters({ adType: tab.id as AdType })}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      filters.adType === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <Badge variant="secondary" className="text-xs">
                      {tab.count}
                    </Badge>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Resultados e Paginação */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAds.length)} de {filteredAds.length} anúncios
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                {/* Botão Anterior */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
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
                      onClick={() => goToPage(pageNumber)}
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
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Lista de Anúncios */}
          {loading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : paginatedAds.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum anúncio encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou criar um novo anúncio.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {paginatedAds.map((ad) => (
                <Card key={ad.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    {/* Header do Card com Avatar e Info do Usuário */}
                    <div className="flex items-start space-x-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={ad.user_avatar_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                          {ad.user_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {ad.user_name}
                            </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={ad.user_type === 'professional' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {ad.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                            </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {ad.location_city}, {ad.location_state}
                          </div>
                        </div>
                        </div>
                      </div>

                    {/* Conteúdo do Anúncio */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {ad.title}
                          </h4>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                            {ad.description}
                          </p>
                      <Badge variant="outline" className="text-xs">
                        {ad.category}
                      </Badge>
                        </div>

                    {/* Footer do Card */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(ad.created_at)}
                        <span className="mx-2">•</span>
                        <Eye className="h-3 w-3 mr-1" />
                        {ad.views} visualizações
                        </div>

                          <Button
                            size="sm"
                        onClick={() => handleContactUser(ad.user_id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Contatar
                          </Button>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
