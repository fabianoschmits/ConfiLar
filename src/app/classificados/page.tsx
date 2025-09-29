'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'
import { Combobox } from '@/components/ui/Combobox'
import { useIBGE } from '@/hooks/useIBGE'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { useClassifiedSearch } from '@/hooks/useClassifiedSearch'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { services } from '@/data/services'
import { SmartSearchBar } from '@/components/search/SmartSearchBar'
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
  ChevronRight,
  Trash2,
  MoreVertical,
  Edit,
  Flag
} from 'lucide-react'
import { ClientOnly } from '@/components/ClientOnly'
import { ReportButton } from '@/components/ReportButton'

type AdType = 'all' | 'offers' | 'requests'

export default function ClassificadosPage() {
  const [mounted, setMounted] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isCreatingAd, setIsCreatingAd] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isEditingAd, setIsEditingAd] = useState(false)
  const [editingAdId, setEditingAdId] = useState<string | null>(null)
  const [showAdModal, setShowAdModal] = useState(false)
  const [selectedAd, setSelectedAd] = useState<any>(null)
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
  const { openChat } = useFloatingChat()
  
  // Hook para busca de classificados
  const {
    classifiedAds,
    filteredAds,
    loading,
    stats,
    executeSearch,
    loadClassifiedAds
  } = useClassifiedSearch()

  // Opções de categorias para o Combobox
  const categoryOptions = services.map(service => ({
    value: service.name,
    label: `${service.icon} ${service.name}` // Adicionar ícone para melhor visualização
  }))

  // Função para validar se a categoria é válida
  const isValidCategory = (category: string): boolean => {
    return services.some(service => service.name === category)
  }

  // Função para obter o ícone da categoria
  const getCategoryIcon = (category: string): string => {
    const service = services.find(service => service.name === category)
    return service?.icon || '🔧'
  }

  // Executar busca inicial
  useEffect(() => {
    executeSearch(filters)
  }, [executeSearch])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    executeSearch(filters)
  }, [filters, executeSearch])

  // useEffect para mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  const { user, profile } = useAuthContext()

  if (!mounted) {
    return null
  }

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

    // Validar se a categoria escolhida é válida
    if (!isValidCategory(formData.category)) {
      toast.error('Categoria selecionada não é válida')
      return
    }

    try {
      setIsCreatingAd(true)

      const adData = {
        user_id: user.id,
        user_name: profile?.full_name || user.email?.split('@')[0] || 'Usuário',
        user_type: profile?.user_type || 'client',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location_state: formData.location_state,
        location_city: formData.location_city,
        ad_type: formData.ad_type === 'offer' ? 'oferecer' : 'procurar',
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
  const handleContactUser = (userId: string, userName?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para entrar em contato')
      return
    }
    
    if (userId === user.id) {
      toast.error('Você não pode entrar em contato consigo mesmo')
      return
    }
    
    // Abrir chat flutuante
    openChat(userId, userName || 'Usuário')
    toast.success('Iniciando conversa...')
  }

  // Deletar anúncio
  const handleDeleteAd = async (adId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para deletar anúncios')
      return
    }

    if (!confirm('Tem certeza que deseja deletar este anúncio? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('classified_ads')
        .delete()
        .eq('id', adId)
        .eq('user_id', user.id) // Garantir que só o dono pode deletar

      if (error) throw error

      toast.success('Anúncio deletado com sucesso!')
      
      // Recarregar anúncios
      await loadClassifiedAds()
    } catch (error) {
      console.error('Erro ao deletar anúncio:', error)
      toast.error('Erro ao deletar anúncio')
    }
  }

  // Editar anúncio
  const handleEditAd = (ad: any) => {
    setEditingAdId(ad.id)
    setFormData({
      title: ad.title,
      description: ad.description,
      category: ad.category,
      location_state: ad.location_state,
      location_city: ad.location_city,
      price_range: '',
      urgency_level: 'normal',
      ad_type: ad.ad_type === 'oferecer' ? 'offer' : 'request'
    })
    setShowEditDialog(true)
  }

  // Abrir modal do anúncio
  const handleOpenAdModal = (ad: any) => {
    setSelectedAd(ad)
    setShowAdModal(true)
  }

  // Salvar edição do anúncio
  const handleSaveEdit = async () => {
    if (!user || !editingAdId) {
      toast.error('Erro ao editar anúncio')
      return
    }

    if (!formData.title || !formData.description || !formData.category || !formData.ad_type) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setIsEditingAd(true)

      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location_state: formData.location_state,
        location_city: formData.location_city,
        ad_type: formData.ad_type === 'offer' ? 'oferecer' : 'procurar'
      }

      const { error } = await supabase
        .from('classified_ads')
        .update(updateData)
        .eq('id', editingAdId)
        .eq('user_id', user.id) // Garantir que só o dono pode editar

      if (error) throw error

      toast.success('Anúncio atualizado com sucesso!')
      setShowEditDialog(false)
      setEditingAdId(null)
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
      console.error('Erro ao editar anúncio:', error)
      toast.error('Erro ao editar anúncio')
    } finally {
      setIsEditingAd(false)
    }
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
    <ClientOnly>
      <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header da Página */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Classificados
              </h1>
              <p className="text-gray-600">
                Encontre serviços ou ofereça seus serviços profissionais
              </p>
            </div>
          </div>
              
          {/* Estatísticas Compactas */}
          {/* Estatísticas - Card Compacto */}
          <Card className="mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
            <CardContent className="py-2 px-3 sm:py-3 sm:px-4">
              <div className="flex flex-row items-center justify-around gap-1 sm:gap-2">
                {/* Total de Anúncios */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                  <p className="text-xs text-gray-500 text-center">Total</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">{stats.total}</p>
                </div>
                
                {/* Ofertas */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                  <p className="text-xs text-gray-500 text-center">Ofertas</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">{stats.offers}</p>
                </div>
                
                {/* Solicitações */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                  <p className="text-xs text-gray-500 text-center">Solicitações</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">{stats.requests}</p>
                </div>
                
                {/* Categorias */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                  <p className="text-xs text-gray-500 text-center">Categorias</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">{stats.categories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Barra de Busca Inteligente */}
          <div className="mb-6">
            <SmartSearchBar
              onSearch={(query, searchFilters) => {
                const newFilters = {
                  searchTerm: searchFilters.searchTerm,
                  state: searchFilters.state,
                  city: searchFilters.city,
                  category: searchFilters.service,
                  adType: 'all' as AdType
                }
                setFilters(newFilters)
                executeSearch(newFilters)
              }}
              onFiltersChange={(searchFilters) => {
                const newFilters = {
                  searchTerm: searchFilters.searchTerm,
                  state: searchFilters.state,
                  city: searchFilters.city,
                  category: searchFilters.service,
                  adType: 'all' as AdType
                }
                setFilters(newFilters)
                executeSearch(newFilters)
              }}
              initialFilters={{
                searchTerm: filters.searchTerm,
                state: filters.state,
                city: filters.city,
                service: filters.category,
                userType: 'all',
                rating: 'all',
                availability: 'all'
              }}
              placeholder="Buscar anúncios, serviços, categorias..."
              className="w-full"
            />
          </div>

          {/* Controles de Visualização */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredAds.length} resultado{filteredAds.length !== 1 ? 's' : ''}
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


          {/* Resultados e Paginação */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAds.length)} de {filteredAds.length} anúncios
            </div>
            
            <div className="flex items-center gap-4">
              {/* Botão Novo Anúncio */}
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
                          <Label htmlFor="category">Serviços *</Label>
                          <Combobox
                            options={categoryOptions}
                            value={formData.category}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                            placeholder="Selecione"
                            searchPlaceholder="Buscar categoria..."
                            emptyMessage="Nenhuma categoria encontrada."
                          />
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

              {/* Dialog de Edição */}
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Editar Anúncio</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Título *</Label>
                      <Input
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Preciso de um pedreiro"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-description">Descrição *</Label>
                      <Textarea
                        id="edit-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o que você precisa ou oferece..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-ad_type">Tipo de Anúncio *</Label>
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
                        <Label htmlFor="edit-category">Serviços *</Label>
                        <Combobox
                          options={categoryOptions}
                          value={formData.category}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                          placeholder="Selecione"
                          searchPlaceholder="Buscar categoria..."
                          emptyMessage="Nenhuma categoria encontrada."
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-state">Estado</Label>
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
                        <Label htmlFor="edit-city">Cidade</Label>
                        <CidadeCombobox
                          value={formData.location_city}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, location_city: value }))}
                          estadoSigla={formData.location_state}
                        />
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveEdit} disabled={isEditingAd}>
                        {isEditingAd ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Modal de Visualização do Anúncio */}
              <Dialog open={showAdModal} onOpenChange={setShowAdModal}>
                <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="text-lg sm:text-xl font-bold leading-tight">
                      {selectedAd?.title}
                    </DialogTitle>
                  </DialogHeader>
                  
                  {selectedAd && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Header com Avatar e Info do Usuário */}
                      <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-white shadow-md self-center sm:self-start">
                          <AvatarImage src={selectedAd.user_avatar_url} />
                          <AvatarFallback className={`font-medium text-sm sm:text-lg ${
                            selectedAd.user_type === 'professional' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {selectedAd.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 w-full text-center sm:text-left">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                            {selectedAd.user_name}
                          </h3>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                            <Badge 
                              variant={selectedAd.user_type === 'professional' ? 'default' : 'secondary'}
                              className={`text-xs ${
                                selectedAd.user_type === 'professional' 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-orange-600 hover:bg-orange-700'
                              }`}
                            >
                              {selectedAd.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                selectedAd.user_type === 'professional' 
                                  ? 'border-green-300 text-green-700 bg-green-50' 
                                  : 'border-orange-300 text-orange-700 bg-orange-50'
                              }`}
                            >
                              {getCategoryIcon(selectedAd.category)} {selectedAd.category}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-gray-600">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {selectedAd.location_city}, {selectedAd.location_state}
                          </div>
                        </div>
                      </div>

                      {/* Descrição Completa */}
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">Descrição</h4>
                        <div className="prose max-w-none">
                          <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {selectedAd.description}
                          </p>
                        </div>
                      </div>

                      {/* Informações Adicionais */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          <span>Publicado em {formatDate(selectedAd.created_at)}</span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          <span>{selectedAd.views} visualizações</span>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setShowAdModal(false)}
                          className="w-full sm:w-auto order-2 sm:order-1"
                        >
                          Fechar
                        </Button>
                        <Button
                          onClick={() => {
                            setShowAdModal(false)
                            handleContactUser(selectedAd.user_id, selectedAd.user_name)
                          }}
                          className={`w-full sm:w-auto order-1 sm:order-2 ${
                            selectedAd.user_type === 'professional' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-orange-600 hover:bg-orange-700'
                          } text-white`}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Entrar em Contato
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Paginação */}
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
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum anúncio encontrado
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {filters.searchTerm || filters.state || filters.city || filters.category !== 'all' 
                  ? 'Tente ajustar os filtros de busca ou usar termos diferentes.'
                  : 'Não há anúncios cadastrados no sistema ainda.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpar Filtros
                </Button>
                <Button
                  onClick={() => setFilters(prev => ({ ...prev, searchTerm: '', state: '', city: '', category: 'all' }))}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Nova Busca
                </Button>
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {paginatedAds.map((ad) => (
                <Card 
                  key={ad.id} 
                  className={`hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                    ad.user_type === 'professional' 
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                      : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                  }`}
                >
                  <CardContent className="p-4 sm:p-6">
                    {/* Header do Card com Avatar e Info do Usuário */}
                    <div className="flex items-start space-x-3 mb-4">
                      <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                        <AvatarImage src={ad.user_avatar_url} />
                        <AvatarFallback className={`font-medium ${
                          ad.user_type === 'professional' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {ad.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {ad.user_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={ad.user_type === 'professional' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              ad.user_type === 'professional' 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-orange-600 hover:bg-orange-700'
                            }`}
                          >
                            {ad.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {ad.location_city}, {ad.location_state}
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu de ações */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Ações do dono do anúncio */}
                          {user && ad.user_id === user.id && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleEditAd(ad)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar anúncio
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteAd(ad.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deletar anúncio
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {/* Botão de denunciar (para todos os usuários, exceto o dono) */}
                          {user && ad.user_id !== user.id && (
                            <DropdownMenuItem className="p-0">
                              <ReportButton 
                                type="classified" 
                                targetId={ad.id}
                                targetName={ad.title}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                              />
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Conteúdo do Anúncio */}
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">
                        {ad.title}
                      </h4>
                      <p 
                        className="text-gray-600 text-sm line-clamp-3 mb-3 cursor-pointer hover:text-gray-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenAdModal(ad)
                        }}
                      >
                        {ad.description}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          ad.user_type === 'professional' 
                            ? 'border-green-300 text-green-700 bg-green-50' 
                            : 'border-orange-300 text-orange-700 bg-orange-50'
                        }`}
                      >
                        {getCategoryIcon(ad.category)} {ad.category}
                      </Badge>
                    </div>

                    {/* Footer do Card */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(ad.created_at)}
                        <span className="mx-2">•</span>
                        <Eye className="h-3 w-3 mr-1" />
                        {ad.views} visualizações
                      </div>

                        <Button
                          size="sm"
                          onClick={() => handleContactUser(ad.user_id, ad.user_name)}
                          className={`${
                            ad.user_type === 'professional' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-orange-600 hover:bg-orange-700'
                          } text-white shadow-md hover:shadow-lg transition-all duration-200`}
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
    </ClientOnly>
  )
}
