'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/ui/UserAvatar'
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
import { usePremiumNotifications } from '@/hooks/usePremiumNotifications'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { services } from '@/data/services'
import { ClassifiedsListSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { 
  Search, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Plus, 
  Filter, 
  Star,
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
  Flag,
  HandHeart,
  ShoppingCart,
  Crown,
  Sparkles
} from 'lucide-react'
import { ClientOnly } from '@/components/ClientOnly'
import { PremiumAdForm } from '@/components/classifieds/PremiumAdForm'
import { RenewPremiumAdForm } from '@/components/classifieds/RenewPremiumAdForm'
import { PremiumTimeRemaining } from '@/components/classifieds/PremiumTimeRemaining'
import { ReportButton } from '@/components/ReportButton'
import { useTranslations } from 'next-intl'

type AdType = 'all' | 'offers' | 'requests'

export default function ClassificadosPage() {
  const t = useTranslations('classifieds')
  const tCommon = useTranslations('common')
  const tLocation = useTranslations('location')
  const [mounted, setMounted] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPremiumAdDialog, setShowPremiumAdDialog] = useState(false)
  const [showRenewPremiumDialog, setShowRenewPremiumDialog] = useState(false)
  const [renewingAdId, setRenewingAdId] = useState<string | null>(null)
  const [isCreatingAd, setIsCreatingAd] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isEditingAd, setIsEditingAd] = useState(false)
  const [editingAdId, setEditingAdId] = useState<string | null>(null)
  const [showAdModal, setShowAdModal] = useState(false)
  const [selectedAd, setSelectedAd] = useState<any>(null)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [activeTab, setActiveTab] = useState<'all' | 'offers' | 'requests'>('all')
  
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

  // Verificar notificações premium automaticamente
  usePremiumNotifications()

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
    console.log('🔍 Executando busca com filtros:', filters)
    executeSearch(filters)
  }, [executeSearch, filters])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    const updatedFilters = {
      ...filters,
      adType: activeTab
    }
    console.log('🔍 Aplicando filtros:', { activeTab, updatedFilters })
    executeSearch(updatedFilters)
  }, [filters, activeTab, executeSearch])

  const { user, profile } = useAuthContext()

  // useEffect para mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Inicializar formulário com dados do usuário
  useEffect(() => {
    if (profile && profile.location_state && profile.location_city) {
      console.log('🏠 Inicializando formulário com dados do usuário:', {
        state: profile.location_state,
        city: profile.location_city
      })
      
      // Carregar cidades do estado do usuário primeiro
      if (profile.location_state) {
        console.log('🔄 Carregando cidades para o estado:', profile.location_state)
        loadCidades(profile.location_state).then(() => {
          // Após carregar as cidades, definir o formulário
          setFormData(prev => ({
            ...prev,
            location_state: profile.location_state,
            location_city: profile.location_city
          }))
        })
      } else {
        setFormData(prev => ({
          ...prev,
          location_state: profile.location_state,
          location_city: profile.location_city
        }))
      }
    }
  }, [profile, loadCidades])

  // Resetar página quando itemsPerPage mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

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
    const updatedFilters = { ...filters, ...newFilters }
    console.log('🔄 Atualizando filtros:', { newFilters, updatedFilters })
    setFilters(updatedFilters)
    setCurrentPage(1) // Reset para primeira página
    executeSearch(updatedFilters)
  }

  // Limpar filtros
  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      state: '',
      city: '',
      category: 'all',
      adType: 'all' as AdType
    }
    console.log('🧹 Limpando filtros:', clearedFilters)
    setFilters(clearedFilters)
    setCurrentPage(1)
    executeSearch(clearedFilters)
  }

  // Criar novo anúncio
  // Função para abrir o diálogo de criação
  const handleOpenCreateDialog = () => {
    // Inicializar com dados do usuário se disponíveis
    if (profile && profile.location_state && profile.location_city) {
      console.log('🏠 Abrindo diálogo com dados do usuário:', {
        state: profile.location_state,
        city: profile.location_city
      })
      
      // Carregar cidades do estado do usuário primeiro
      if (profile.location_state) {
        console.log('🔄 Carregando cidades para o estado:', profile.location_state)
        loadCidades(profile.location_state).then(() => {
          // Após carregar as cidades, definir o formulário
          setFormData(prev => ({
            ...prev,
            location_state: profile.location_state,
            location_city: profile.location_city
          }))
        })
      } else {
        setFormData(prev => ({
          ...prev,
          location_state: profile.location_state,
          location_city: profile.location_city
        }))
      }
    }
    setShowCreateDialog(true)
  }

  const handleCreateAd = async () => {
    console.log('🔍 Debug - Iniciando criação de anúncio')
    console.log('👤 User:', user)
    console.log('👤 Profile:', profile)
    
    if (!user || !profile) {
      console.log('❌ Usuário ou perfil não encontrado')
      toast.error('Login necessário', {
        description: 'Você precisa estar logado para criar anúncios. Faça login e tente novamente.'
      })
      return
    }

    if (!formData.title || !formData.description || !formData.category || !formData.ad_type) {
      console.log('❌ Campos obrigatórios não preenchidos')
      toast.error('Campos obrigatórios', {
        description: 'Por favor, preencha todos os campos obrigatórios antes de criar o anúncio.'
      })
      return
    }

    // Validar se a categoria escolhida é válida
    if (!isValidCategory(formData.category)) {
      console.log('❌ Categoria inválida:', formData.category)
      toast.error('Categoria inválida', {
        description: 'A categoria selecionada não é válida. Por favor, selecione uma categoria válida.'
      })
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
        is_active: true
      }

      console.log('📝 Dados do anúncio:', adData)

      const { data, error } = await supabase
        .from('classified_ads')
        .insert([adData])

      console.log('📊 Resultado da inserção:', { data, error })

      if (error) {
        console.error('❌ Erro ao criar anúncio:', error)
        throw error
      }

      console.log('✅ Anúncio criado com sucesso!')
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
    } catch (error: any) {
      console.error('❌ Erro ao criar anúncio:', error)
      toast.error('Erro ao criar anúncio', {
        description: error?.message || 'Não foi possível criar o anúncio. Verifique os dados e tente novamente.'
      })
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
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
              
          {/* Estatísticas Compactas */}
          {/* Estatísticas - Card Compacto */}
          <Card className="mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
            <CardContent className="py-2 px-3 sm:py-3 sm:px-4">
              <div className="flex flex-row items-center justify-around gap-1 sm:gap-2">
                {/* Total de Anúncios */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{tCommon('search')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                
                {/* Ofertas */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <HandHeart className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('offers')}</p>
                  <p className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400">{stats.offers}</p>
                </div>
                
                {/* Solicitações */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('requests')}</p>
                  <p className="text-sm sm:text-base font-bold text-green-700 dark:text-green-400">{stats.requests}</p>
                </div>
                
                {/* Categorias */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('category')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.categories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Barra de Busca com Filtros de Localização */}
          <div className="mb-6">
            <div className="flex gap-2">
              {/* Campo de busca */}
              <div className="relative flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={filters.searchTerm}
                    onChange={(e) => {
                      const newFilters = { ...filters, searchTerm: e.target.value }
                      setFilters(newFilters)
                      executeSearch(newFilters)
                    }}
                    placeholder={t('searchPlaceholder')}
                    className="pl-8 pr-4 h-10 text-sm border border-gray-300 focus:border-blue-500 rounded-lg"
                  />
                </div>
                
                {/* Sugestões de serviços */}
                {filters.searchTerm.length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {services
                      .filter(service => 
                        service.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
                      )
                      .slice(0, 8)
                      .map(service => (
                        <button
                          key={service.name}
                          onClick={() => {
                            const newFilters = { ...filters, searchTerm: service.name }
                            setFilters(newFilters)
                            executeSearch(newFilters)
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm dark:text-gray-300"
                        >
                          <span className="text-sm">{service.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{service.description}</div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Botão de filtro de localização */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-10 px-3 flex items-center gap-2 ${
                    (filters.state || filters.city) 
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400' 
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {filters.city ? filters.city : filters.state ? filters.state : t('location')}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {/* Dropdown de filtros de localização */}
                {showFilters && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-80 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {t('location')}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="h-5 w-5 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Estado */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">{tLocation('state')}</label>
                        <EstadoCombobox
                          value={filters.state}
                          onValueChange={(newState) => {
                            console.log('🏛️ Estado selecionado:', newState)
                            const newFilters = { ...filters, state: newState, city: '' }
                            setFilters(newFilters)
                            executeSearch(newFilters)
                            if (newState) {
                              console.log('🔄 Carregando cidades para o estado:', newState)
                              loadCidades(newState)
                            }
                          }}
                          placeholder={tLocation('selectState')}
                          className="w-full"
                        />
                      </div>

                      {/* Cidade */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">{tLocation('city')}</label>
                        <CidadeCombobox
                          value={filters.city}
                          onValueChange={(newCity) => {
                            console.log('🏙️ Cidade selecionada:', newCity)
                            const newFilters = { ...filters, city: newCity }
                            setFilters(newFilters)
                            executeSearch(newFilters)
                          }}
                          estadoSigla={filters.state}
                          placeholder={tLocation('selectCity')}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    {/* Botões de ação */}
                    <div className="flex justify-between gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFilters = { ...filters, state: '', city: '' }
                          setFilters(newFilters)
                          executeSearch(newFilters)
                        }}
                        className="text-gray-600 dark:text-gray-400 text-xs h-6 px-2"
                      >
                        {t('clearFilters')}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs h-6 px-3"
                      >
                        {t('applyFilters')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sistema de Abas */}
          <div className="mb-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{t('offers')}:</span> Profissionais oferecendo serviços • 
                <span className="font-medium"> {t('requests')}:</span> Clientes procurando serviços
              </p>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'all'
                      ? 'border-gray-500 dark:border-gray-400 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Todos ({stats.total})
                  </div>
                </button>
                  <button
                    onClick={() => setActiveTab('offers')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'offers'
                        ? 'border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <HandHeart className="h-4 w-4" />
                      {t('offers')} ({stats.offers})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'requests'
                        ? 'border-green-500 dark:border-green-400 text-green-700 dark:text-green-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {t('requests')} ({stats.requests})
                    </div>
                  </button>
              </nav>
            </div>
          </div>

          {/* Controles de Visualização e Botão Novo Anúncio */}
          <div className="flex justify-between items-center mb-6 gap-1 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {filteredAds.length} {filteredAds.length !== 1 ? t('resultadosPlural') : t('resultados')}
              </span>
              
              {/* Seletor de itens por página - Mobile e Desktop */}
              {!loading && filteredAds.length > 0 && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <label htmlFor="itemsPerPage" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {t('porPagina')}
                  </label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(parseInt(value))}
                  >
                    <SelectTrigger className="w-14 sm:w-20 h-7 sm:h-8 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Botões Grid/List - Apenas Desktop */}
              <div className="hidden sm:flex border border-gray-200 dark:border-gray-700 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-4">
              {user && (
                <>
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-[10px] sm:text-xs px-2 py-1.5 sm:px-3 sm:py-2 h-7 sm:h-8 whitespace-nowrap"
                        onClick={handleOpenCreateDialog}
                      >
                        <Plus className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Novo Anúncio</span>
                        <span className="sm:hidden ml-0.5">Novo</span>
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white">Criar Novo Anúncio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder={
                            formData.ad_type === 'offer' 
                              ? "Ex: Ofereço serviços de pintura" 
                              : "Ex: Preciso de um pedreiro"
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Descrição *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder={
                            formData.ad_type === 'offer' 
                              ? "Descreva os serviços que você oferece, sua experiência, disponibilidade, etc..." 
                              : "Descreva o que você precisa, quando precisa, orçamento disponível, etc..."
                          }
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
                                <HandHeart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <div>
                                  <div className="font-medium text-emerald-700 dark:text-emerald-400">Oferta de Serviço</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Estou oferecendo um serviço</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="request">
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <div>
                                  <div className="font-medium text-blue-700 dark:text-blue-400">Solicitação de Serviço</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Preciso de um serviço</div>
                                </div>
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
                          {isCreatingAd ? t('creating') : t('createAd')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Dialog de Renovar Premium */}
                <Dialog open={showRenewPremiumDialog} onOpenChange={setShowRenewPremiumDialog}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                        Renovar Anúncio Premium
                      </DialogTitle>
                    </DialogHeader>
                    {renewingAdId && (
                      <RenewPremiumAdForm
                        adId={renewingAdId}
                        adTitle={selectedAd?.title || classifiedAds.find(ad => ad.id === renewingAdId)?.title || 'Anúncio'}
                        onSubmit={() => {
                          setShowRenewPremiumDialog(false)
                          setRenewingAdId(null)
                          setSelectedAd(null)
                          // Recarregar anúncios
                          loadClassifiedAds()
                        }}
                        onCancel={() => {
                          setShowRenewPremiumDialog(false)
                          setRenewingAdId(null)
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                {/* Botão Premium */}
                <Dialog open={showPremiumAdDialog} onOpenChange={setShowPremiumAdDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-[10px] sm:text-xs px-2 py-1.5 sm:px-3 sm:py-2 h-7 sm:h-8 whitespace-nowrap shadow-lg"
                    >
                      <Crown className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Premium</span>
                      <span className="sm:hidden ml-0.5">⭐</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <DialogHeader className="mb-4 sm:mb-6">
                      <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                        <span>{t('premiumAd')}</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-1">
                      <PremiumAdForm
                        onSubmit={() => setShowPremiumAdDialog(false)}
                        onCancel={() => setShowPremiumAdDialog(false)}
                        isLoading={isCreatingAd}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                </>
              )}

              {/* Dialog de Edição */}
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">{t('editAd')}</DialogTitle>
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
                              <ShoppingCart className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                              <span>Oferta - Estou oferecendo um serviço</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="request">
                            <div className="flex items-center gap-2">
                              <HandHeart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
                <DialogContent className="w-[95vw] max-w-4xl max-h-[75vh] sm:max-h-[85vh] overflow-y-auto p-4 sm:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <DialogHeader className="pb-3 sm:pb-4">
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-bold leading-tight text-gray-900 dark:text-white">
                      {selectedAd?.title}
                    </DialogTitle>
                  </DialogHeader>
                  
                  {selectedAd && (
                    <div className="space-y-3 sm:space-y-6">
                      {/* Header com Avatar e Info do Usuário */}
                      <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-4 p-2.5 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="self-center sm:self-start">
                          <Link href={`/perfil/${selectedAd.user_id}`}>
                            <UserAvatar
                              src={selectedAd.user_avatar_url}
                              alt={selectedAd.user_name}
                              fallback={selectedAd.user_name.charAt(0).toUpperCase()}
                              size="md"
                              userId={selectedAd.user_id}
                              showReferralBadge={true}
                              className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-white shadow-md hover:ring-blue-500 transition-all duration-200 cursor-pointer"
                            />
                          </Link>
                        </div>
                        <div className="flex-1 w-full text-center sm:text-left">
                          <Link href={`/perfil/${selectedAd.user_id}`} className="block">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer">
                              {selectedAd.user_name}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                            <Badge 
                              variant="outline"
                              className={`text-xs ${
                                selectedAd.ad_type === 'oferecer' 
                                  ? 'border-gray-400 text-gray-800 bg-gray-100' 
                                  : 'border-gray-300 text-gray-600 bg-gray-50'
                              }`}
                            >
                              {selectedAd.ad_type === 'oferecer' ? 'Oferta' : 'Solicitação'}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                selectedAd.ad_type === 'oferecer' 
                                  ? 'border-gray-400 text-gray-800 bg-gray-100' 
                                  : 'border-gray-300 text-gray-600 bg-gray-50'
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
                      <div className="space-y-2 sm:space-y-3">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Descrição</h4>
                        <div className="prose max-w-none">
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {selectedAd.description}
                          </p>
                        </div>
                      </div>

                      {/* Galeria de Imagens */}
                      {selectedAd.images && selectedAd.images.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Fotos do Serviço</h4>
                          {expandedImage ? (
                            /* Imagem Expandida - Centralizada */
                            <div 
                              className="fixed inset-0 z-50 bg-black/90 dark:bg-black/95 flex items-center justify-center p-4"
                              onClick={() => setExpandedImage(null)}
                            >
                              <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setExpandedImage(null)
                                  }}
                                  className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm transition-all"
                                >
                                  <X className="h-6 w-6" />
                                </button>
                                <img
                                  src={expandedImage}
                                  alt={`${selectedAd.title} - Imagem expandida`}
                                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          ) : (
                            /* Grid de Miniaturas */
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                              {selectedAd.images.map((image: string, index: number) => (
                                <div 
                                  key={index} 
                                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all"
                                  onClick={() => setExpandedImage(image)}
                                >
                                  <img
                                    src={image}
                                    alt={`${selectedAd.title} - Foto ${index + 1}`}
                                    className="w-full h-32 sm:h-40 object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                                      Clique para expandir
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Informações de Contato (apenas para premium) */}
                      {(selectedAd.is_premium && !(selectedAd.premium_expires_at ? new Date(selectedAd.premium_expires_at) < new Date() : false)) && (selectedAd.contact_phone || selectedAd.contact_email) && (
                        <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <h4 className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-200 mb-2">Informações de Contato</h4>
                          <div className="space-y-2">
                            {selectedAd.contact_phone && (
                              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                                <span className="font-semibold">📞 Telefone:</span>
                                <span>{selectedAd.contact_phone}</span>
                              </div>
                            )}
                            {selectedAd.contact_email && (
                              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                                <span className="font-semibold">✉️ Email:</span>
                                <span>{selectedAd.contact_email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Faixa de Preço (se houver) */}
                      {selectedAd.price_range && (
                        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold mr-2">💰 Faixa de Preço:</span>
                            <span>{selectedAd.price_range}</span>
                          </div>
                        </div>
                      )}

                      {/* Informações do Anunciante */}
                      {(selectedAd as any).user_profile && (
                        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-200 mb-3">
                            📋 Sobre o Anunciante
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            {(selectedAd as any).user_profile.idade && (
                              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                <span className="font-semibold">Idade:</span>
                                <span>{(selectedAd as any).user_profile.idade} anos</span>
                              </div>
                            )}
                            {(selectedAd as any).user_profile.escolaridade && (
                              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                <span className="font-semibold">Escolaridade:</span>
                                <span>{
                                  (selectedAd as any).user_profile.escolaridade === 'ensino_fundamental_incompleto' ? 'Ensino Fundamental Incompleto' :
                                  (selectedAd as any).user_profile.escolaridade === 'ensino_fundamental_completo' ? 'Ensino Fundamental Completo' :
                                  (selectedAd as any).user_profile.escolaridade === 'ensino_medio_incompleto' ? 'Ensino Médio Incompleto' :
                                  (selectedAd as any).user_profile.escolaridade === 'ensino_medio_completo' ? 'Ensino Médio Completo' :
                                  (selectedAd as any).user_profile.escolaridade === 'ensino_superior_incompleto' ? 'Ensino Superior Incompleto' :
                                  (selectedAd as any).user_profile.escolaridade === 'ensino_superior_completo' ? 'Ensino Superior Completo' :
                                  (selectedAd as any).user_profile.escolaridade === 'pos_graduacao' ? 'Pós-Graduação' :
                                  (selectedAd as any).user_profile.escolaridade === 'mestrado' ? 'Mestrado' :
                                  (selectedAd as any).user_profile.escolaridade === 'doutorado' ? 'Doutorado' :
                                  (selectedAd as any).user_profile.escolaridade
                                }</span>
                              </div>
                            )}
                            {(selectedAd as any).user_profile.estado_civil && (
                              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                <span className="font-semibold">Estado Civil:</span>
                                <span>{
                                  (selectedAd as any).user_profile.estado_civil === 'solteiro' ? 'Solteiro(a)' :
                                  (selectedAd as any).user_profile.estado_civil === 'casado' ? 'Casado(a)' :
                                  (selectedAd as any).user_profile.estado_civil === 'divorciado' ? 'Divorciado(a)' :
                                  (selectedAd as any).user_profile.estado_civil === 'viuvo' ? 'Viúvo(a)' :
                                  (selectedAd as any).user_profile.estado_civil === 'uniao_estavel' ? 'União Estável' :
                                  (selectedAd as any).user_profile.estado_civil === 'outro' ? 'Outro' :
                                  (selectedAd as any).user_profile.estado_civil
                                }</span>
                              </div>
                            )}
                            {((selectedAd as any).user_profile.filhos !== undefined && (selectedAd as any).user_profile.filhos > 0) && (
                              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                <span className="font-semibold">Filhos:</span>
                                <span>{(selectedAd as any).user_profile.filhos} {(selectedAd as any).user_profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                              </div>
                            )}
                            {(selectedAd as any).user_profile.user_type === 'professional' && (
                              <>
                                {(selectedAd as any).user_profile.turno_trabalho && (
                                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                    <span className="font-semibold">Turno de Trabalho:</span>
                                    <span>{
                                      (selectedAd as any).user_profile.turno_trabalho === 'manha' ? 'Manhã' :
                                      (selectedAd as any).user_profile.turno_trabalho === 'tarde' ? 'Tarde' :
                                      (selectedAd as any).user_profile.turno_trabalho === 'noite' ? 'Noite' :
                                      (selectedAd as any).user_profile.turno_trabalho === 'integral' ? 'Turno Integral' :
                                      (selectedAd as any).user_profile.turno_trabalho === 'flexivel' ? 'Horário Flexível' :
                                      (selectedAd as any).user_profile.turno_trabalho
                                    }</span>
                                  </div>
                                )}
                                {(selectedAd as any).user_profile.professional_experience_years && (
                                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                    <span className="font-semibold">Experiência:</span>
                                    <span>{(selectedAd as any).user_profile.professional_experience_years} {((selectedAd as any).user_profile.professional_experience_years === 1) ? 'ano' : 'anos'}</span>
                                  </div>
                                )}
                                {(selectedAd as any).user_profile.referencia_profissional && (
                                  <div className="sm:col-span-2 mt-2">
                                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">Referência Profissional:</p>
                                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                      {(selectedAd as any).user_profile.referencia_profissional}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Informações Adicionais */}
                      <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          <span>Publicado em {formatDate(selectedAd.created_at)}</span>
                        </div>
                        {/* Duração do anúncio premium (apenas para o criador) */}
                        {user && selectedAd.user_id === user.id && selectedAd.is_premium && selectedAd.premium_expires_at && (
                          <div className="mt-2">
                            {new Date(selectedAd.premium_expires_at) < new Date() ? (
                              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
                                  ⚠️ Seu anúncio premium expirou. Renove para continuar em destaque!
                                </p>
                              </div>
                            ) : (
                              <PremiumTimeRemaining 
                                expiresAt={selectedAd.premium_expires_at}
                                isOwner={true}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="outline"
                          onClick={() => setShowAdModal(false)}
                          className="w-full sm:w-auto order-2 sm:order-1 text-sm"
                        >
                          Fechar
                        </Button>
                        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto order-1 sm:order-2">
                          {/* Menu de ações com 3 pontinhos */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0">
                                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Ações do dono do anúncio */}
                              {user && selectedAd.user_id === user.id && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setShowAdModal(false)
                                      setEditingAdId(selectedAd.id)
                                      setFormData({
                                        title: selectedAd.title,
                                        description: selectedAd.description,
                                        category: selectedAd.category,
                                        location_state: selectedAd.location_state,
                                        location_city: selectedAd.location_city,
                                        price_range: '',
                                        urgency_level: 'normal',
                                        ad_type: selectedAd.ad_type === 'oferecer' ? 'offer' : 'request'
                                      })
                                      setShowEditDialog(true)
                                    }}
                                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {t('editAd')}
                                  </DropdownMenuItem>
                                  
                                  {/* Botão de renovar premium se o anúncio expirou */}
                                  {selectedAd.is_premium && selectedAd.premium_expires_at && new Date(selectedAd.premium_expires_at) < new Date() && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setShowAdModal(false)
                                        setRenewingAdId(selectedAd.id)
                                        setShowRenewPremiumDialog(true)
                                      }}
                                      className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                                    >
                                      <Crown className="h-4 w-4 mr-2" />
                                      {t('renewPremium')}
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setShowAdModal(false)
                                      handleDeleteAd(selectedAd.id)
                                    }}
                                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t('deleteAd')}
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {/* Botão de denunciar (para usuários que não são donos do anúncio) */}
                              {user && selectedAd.user_id !== user.id && (
                                <DropdownMenuItem asChild>
                                  <ReportButton 
                                    type="classified" 
                                    targetId={selectedAd.id}
                                    targetName={selectedAd.title}
                                    asDropdownItem={true}
                                    className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                                  />
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            onClick={() => {
                              setShowAdModal(false)
                              handleContactUser(selectedAd.user_id, selectedAd.user_name)
                            }}
                            className={`flex-1 sm:flex-initial text-xs sm:text-sm px-3 py-2 sm:px-4 h-8 sm:h-9 ${
                              selectedAd.ad_type === 'oferecer' 
                                ? 'bg-gray-700 hover:bg-gray-800' 
                                : 'bg-gray-500 hover:bg-gray-600'
                            } text-white`}
                          >
                            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className="hidden sm:inline">{t('contact')}</span>
                            <span className="sm:hidden">{t('contact')}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

            </div>
          </div>

          {/* Lista de Anúncios */}
          {loading ? (
            <ClassifiedsListSkeleton viewMode={viewMode} />
          ) : paginatedAds.length === 0 ? (
            <EmptyState
              icon={<Search className="h-12 w-12 text-gray-400" />}
              title={t('noResults')}
              description={
                filters.searchTerm || filters.state || filters.city || filters.category !== 'all'
                  ? t('noResultsDescription')
                  : t('noAdsDescription')
              }
              action={
                filters.searchTerm || filters.state || filters.city || filters.category !== 'all'
                  ? {
                      label: t('clearFilters'),
                      onClick: clearFilters
                    }
                  : undefined
              }
            />
          ) : (
            <div className={`grid gap-5 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {paginatedAds.map((ad) => {
                // Verificar se é um anúncio premium
                const isPremiumAd = ad.is_premium || false
                const premiumExpired = ad.premium_expires_at 
                  ? new Date(ad.premium_expires_at) < new Date()
                  : false
                const isActivePremium = isPremiumAd && !premiumExpired
                
                // Card único para normal e premium (com estilos condicionais)
                return (
                <div 
                  key={ad.id} 
                  className={`group relative overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 hover:-translate-y-3 hover:scale-[1.02] ${
                    isActivePremium
                      ? 'bg-gradient-to-br from-amber-50/90 via-yellow-50/70 to-amber-100/50 dark:from-amber-900/20 dark:via-yellow-900/15 dark:to-amber-800/10 border-2 border-amber-300 dark:border-amber-700 shadow-amber-200/50 dark:shadow-amber-900/30'
                      : ad.ad_type === 'oferecer' 
                        ? 'bg-white dark:bg-gray-900 hover:animate-glow-blue border border-gray-200 dark:border-gray-700' 
                        : 'bg-white dark:bg-gray-900 hover:animate-glow-emerald border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Badge Premium - aparece apenas se for premium */}
                  {isActivePremium && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-lg flex items-center gap-1 px-2 py-1">
                        <Crown className="h-3 w-3" />
                        <span className="text-xs font-bold">PREMIUM</span>
                      </Badge>
                    </div>
                  )}
                  
                  {/* Ficha Técnica do Anunciante */}
                  {(ad as any).user_profile && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <div className="flex items-start gap-4">
                        {/* Foto do Usuário - Maior à Esquerda */}
                        <Link href={`/perfil/${ad.user_id}`} className="flex-shrink-0">
                          <UserAvatar
                            src={ad.user_avatar_url}
                            alt={ad.user_name}
                            fallback={ad.user_name?.charAt(0).toUpperCase() || 'U'}
                            size="lg"
                            userId={ad.user_id}
                            showReferralBadge={true}
                            className="w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-white dark:ring-gray-800 shadow-lg hover:ring-blue-500 transition-all duration-200 cursor-pointer"
                          />
                        </Link>
                        
                        {/* Dados do Anunciante - Lateral Direita */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/perfil/${ad.user_id}`} className="block">
                            <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {ad.user_name}
                            </h4>
                          </Link>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                            {(ad as any).user_profile.idade && (
                              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Idade:</span>
                                <span>{(ad as any).user_profile.idade} anos</span>
                              </div>
                            )}
                            {(ad as any).user_profile.escolaridade && (
                              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Escolaridade:</span>
                                <span className="truncate">{
                                  (ad as any).user_profile.escolaridade === 'ensino_fundamental_incompleto' ? 'Fund. Incompleto' :
                                  (ad as any).user_profile.escolaridade === 'ensino_fundamental_completo' ? 'Fund. Completo' :
                                  (ad as any).user_profile.escolaridade === 'ensino_medio_incompleto' ? 'Médio Incompleto' :
                                  (ad as any).user_profile.escolaridade === 'ensino_medio_completo' ? 'Médio Completo' :
                                  (ad as any).user_profile.escolaridade === 'ensino_superior_incompleto' ? 'Superior Incompleto' :
                                  (ad as any).user_profile.escolaridade === 'ensino_superior_completo' ? 'Superior Completo' :
                                  (ad as any).user_profile.escolaridade === 'pos_graduacao' ? 'Pós-Graduação' :
                                  (ad as any).user_profile.escolaridade === 'mestrado' ? 'Mestrado' :
                                  (ad as any).user_profile.escolaridade === 'doutorado' ? 'Doutorado' :
                                  (ad as any).user_profile.escolaridade
                                }</span>
                              </div>
                            )}
                            {(ad as any).user_profile.estado_civil && (
                              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Estado Civil:</span>
                                <span>{
                                  (ad as any).user_profile.estado_civil === 'solteiro' ? 'Solteiro(a)' :
                                  (ad as any).user_profile.estado_civil === 'casado' ? 'Casado(a)' :
                                  (ad as any).user_profile.estado_civil === 'divorciado' ? 'Divorciado(a)' :
                                  (ad as any).user_profile.estado_civil === 'viuvo' ? 'Viúvo(a)' :
                                  (ad as any).user_profile.estado_civil === 'uniao_estavel' ? 'União Estável' :
                                  (ad as any).user_profile.estado_civil === 'outro' ? 'Outro' :
                                  (ad as any).user_profile.estado_civil
                                }</span>
                              </div>
                            )}
                            {((ad as any).user_profile.filhos !== undefined && (ad as any).user_profile.filhos > 0) && (
                              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Filhos:</span>
                                <span>{(ad as any).user_profile.filhos} {(ad as any).user_profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                              </div>
                            )}
                            {(ad as any).user_profile.user_type === 'professional' && (ad as any).user_profile.turno_trabalho && (
                              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Turno:</span>
                                <span>{
                                  (ad as any).user_profile.turno_trabalho === 'manha' ? 'Manhã' :
                                  (ad as any).user_profile.turno_trabalho === 'tarde' ? 'Tarde' :
                                  (ad as any).user_profile.turno_trabalho === 'noite' ? 'Noite' :
                                  (ad as any).user_profile.turno_trabalho === 'integral' ? 'Integral' :
                                  (ad as any).user_profile.turno_trabalho === 'flexivel' ? 'Flexível' :
                                  (ad as any).user_profile.turno_trabalho
                                }</span>
                              </div>
                            )}
                            {(ad as any).user_profile.user_type === 'professional' && (ad as any).user_profile.professional_experience_years && (
                              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Experiência:</span>
                                <span>{(ad as any).user_profile.professional_experience_years} {((ad as any).user_profile.professional_experience_years === 1) ? 'ano' : 'anos'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Header com tipo de anúncio e menu */}
                  <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        isActivePremium
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                          : ad.ad_type === 'oferecer' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-emerald-500 text-white shadow-md'
                      }`}>
                        {ad.ad_type === 'oferecer' ? (
                          <>
                            <HandHeart className="h-3 w-3 text-white" />
                            OFERTA
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3 text-white" />
                            SOLICITAÇÃO
                          </>
                        )}
                      </div>
                      <div className={`flex items-center text-xs ${
                        isActivePremium 
                          ? 'text-amber-700 dark:text-amber-400 font-medium' 
                          : 'text-gray-500'
                      }`}>
                        <MapPin className="h-3 w-3 mr-1" />
                        {ad.location_city}
                      </div>
                    </div>
                    
                  </div>


                  {/* Conteúdo principal */}
                  <div className="px-4 pb-4">
                    {/* Título do serviço */}
                    <h3 
                      className={`font-bold mb-2 line-clamp-2 text-lg cursor-pointer transition-colors ${
                        isActivePremium
                          ? 'text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400'
                          : 'text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenAdModal(ad)
                      }}
                    >
                      {isActivePremium && <Sparkles className="h-4 w-4 inline mr-1.5 text-amber-500" />}
                      {ad.title}
                    </h3>

                    {/* Miniatura de imagem (se houver imagens) */}
                    {ad.images && ad.images.length > 0 && (
                      <div className="relative mb-3 cursor-pointer" onClick={(e) => {
                        e.stopPropagation()
                        handleOpenAdModal(ad)
                      }}>
                        <img
                          src={ad.images[0]}
                          alt={ad.title}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {ad.images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            +{ad.images.length - 1}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Descrição */}
                    <p 
                      className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenAdModal(ad)
                      }}
                    >
                      {ad.description}
                    </p>

                    {/* Informações de contato (apenas para premium) */}
                    {isActivePremium && (ad.contact_phone || ad.contact_email) && (
                      <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        {ad.contact_phone && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 mb-1">
                            <span className="font-semibold">📞</span>
                            <span>{ad.contact_phone}</span>
                          </div>
                        )}
                        {ad.contact_email && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                            <span className="font-semibold">✉️</span>
                            <span>{ad.contact_email}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Faixa de preço (se houver) */}
                    {ad.price_range && (
                      <div className="mb-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            isActivePremium
                              ? 'border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'
                              : 'border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30'
                          }`}
                        >
                          💰 {ad.price_range}
                        </Badge>
                      </div>
                    )}

                    {/* Duração do anúncio premium (apenas para o criador) */}
                    {isActivePremium && user && ad.user_id === user.id && ad.premium_expires_at && (
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-1.5 text-xs text-blue-800 dark:text-blue-300">
                          <Calendar className="h-3 w-3" />
                          <span className="font-semibold">Duração:</span>
                          <span>
                            {(() => {
                              const expiresAt = new Date(ad.premium_expires_at)
                              const now = new Date()
                              const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                              return `${daysRemaining} dia${daysRemaining > 1 ? 's' : ''} restante${daysRemaining > 1 ? 's' : ''}`
                            })()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Categoria */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium ${
                          isActivePremium
                            ? 'border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'
                            : ad.ad_type === 'oferecer' 
                              ? 'border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                              : 'border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                        }`}
                      >
                        {getCategoryIcon(ad.category)} {ad.category}
                      </Badge>
                    </div>

                    {/* Footer com usuário e ações */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      {/* Info do usuário */}
                      <Link href={`/perfil/${ad.user_id}`} className="flex items-center gap-2 group/user">
                        <Avatar className={`w-8 h-8 ring-2 shadow-sm transition-all duration-200 ${
                          isActivePremium
                            ? 'ring-amber-300 dark:ring-amber-700 group-hover/user:ring-amber-500 dark:group-hover/user:ring-amber-500'
                            : ad.ad_type === 'oferecer'
                              ? 'ring-blue-200 group-hover/user:ring-blue-400'
                              : 'ring-emerald-200 group-hover/user:ring-emerald-400'
                        }`}>
                          <AvatarImage src={ad.user_avatar_url || undefined} alt={`Avatar de ${ad.user_name}`} />
                          <AvatarFallback className={`text-xs font-medium ${
                            isActivePremium
                              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                              : ad.ad_type === 'oferecer' 
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' 
                                : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {ad.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover/user:text-blue-600 dark:group-hover/user:text-blue-400 transition-colors">
                            {ad.user_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(ad.created_at)}
                          </p>
                        </div>
                      </Link>

                      {/* Menu de ações e botão de contato */}
                      <div className="flex items-center gap-2">
                        {/* Menu de ações com 3 pontinhos */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Ações do dono do anúncio */}
                            {user && ad.user_id === user.id && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleEditAd(ad)}
                                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar anúncio
                                </DropdownMenuItem>
                                
                                {/* Botão de renovar premium se o anúncio expirou */}
                                {ad.is_premium && ad.premium_expires_at && new Date(ad.premium_expires_at) < new Date() && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRenewingAdId(ad.id)
                                      setShowRenewPremiumDialog(true)
                                    }}
                                    className="text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
                                  >
                                    <Crown className="h-4 w-4 mr-2" />
                                    Tornar Premium Novamente
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteAd(ad.id)}
                                  className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t('deleteAd')}
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {/* Botão de denunciar (para usuários que não são donos do anúncio) */}
                            {user && ad.user_id !== user.id && (
                              <DropdownMenuItem asChild>
                                <ReportButton 
                                  type="classified" 
                                  targetId={ad.id}
                                  targetName={ad.title}
                                  asDropdownItem={true}
                                  className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                                />
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Botão de contato */}
                        <Button
                          size="sm"
                          onClick={() => handleContactUser(ad.user_id, ad.user_name)}
                          className={`${
                            isActivePremium
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl'
                              : ad.ad_type === 'oferecer' 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
                          } transition-all duration-200 text-xs font-medium px-4 py-2`}
                        >
                          <MessageCircle className="h-3 w-3 mr-1.5" />
                          Contatar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Indicador visual lateral */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isActivePremium
                      ? 'bg-gradient-to-b from-amber-500 via-yellow-500 to-amber-600'
                      : ad.ad_type === 'oferecer' 
                        ? 'bg-blue-500' 
                        : 'bg-emerald-500'
                  }`} />
                </div>
                )
              })}
            </div>
          )}

          {/* Paginação */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 space-x-1">
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

          {/* Info da paginação */}
          {!loading && filteredAds.length > 0 && (
            <div className="text-center mt-4 text-sm text-gray-600">
              {t('mostrando')} {startIndex + 1} a {Math.min(endIndex, filteredAds.length)} {t('de')} {filteredAds.length} {t('resultadosPlural')}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
    </ClientOnly>
  )
}
