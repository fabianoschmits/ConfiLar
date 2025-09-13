'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EstadoCombobox, CidadeCombobox, CategoriaCombobox } from '@/components/ui/LocationComboboxes'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { services } from '@/data/services'
import { 
  Search, MapPin, Calendar, MessageCircle, Heart, 
  Users, Briefcase, Plus, Filter, Star, Zap, 
  TrendingUp, Award, Shield, Clock, Eye, Square,
  DollarSign, Clock3, Phone, Mail
} from 'lucide-react'

// Interface baseada na tabela classified_ads que realmente existe
interface ClassifiedAd {
  id: string
  user_id: string
  user_name: string
  user_type: 'client' | 'professional'
  title: string
  description: string
  category: string
  location_state: string
  location_city: string
  created_at: string
  is_active: boolean
  views: number
  user_avatar_url?: string
}

type AdType = 'all' | 'offers' | 'requests'

export default function ClassificadosPage() {
  const { user, profile } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'views'>('newest')
  const [activeTab, setActiveTab] = useState<AdType>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createAdType, setCreateAdType] = useState<'offer' | 'request' | null>(null)
  const [isCreatingAd, setIsCreatingAd] = useState(false)
  
  const [classifiedAds, setClassifiedAds] = useState<ClassifiedAd[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Estados do formulário de criação
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_state: '',
    location_city: '',
    neighborhood: '',
    price_range: '',
    urgency_level: 'normal',
    contact_preference: 'chat'
  })

  // Estados para controle de localização
  const [selectedEstado, setSelectedEstado] = useState('')
  const [selectedCidade, setSelectedCidade] = useState('')

  // Usar os serviços do arquivo de dados
  const availableServices = services

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadClassifiedAds(),
        loadFavorites()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar classificados')
    } finally {
      setLoading(false)
    }
  }

  const loadClassifiedAds = async () => {
    try {
      console.log('Carregando classificados...')
      
      const { data: ads, error } = await supabase
        .from('classified_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar classified_ads:', error)
        toast.error('Erro ao carregar classificados')
        return
      }

      console.log('Classificados encontrados:', ads?.length || 0)
      
      // Se não há dados, adicionar alguns exemplos para demonstração
      if (!ads || ads.length === 0) {
        console.log('Nenhum classificado encontrado, adicionando dados de exemplo...')
        const exampleAds: ClassifiedAd[] = [
          {
            id: 'example-1',
            user_id: 'example-user-1',
            user_name: 'João Silva',
            user_type: 'professional',
            title: 'Serviços de Elétrica Residencial',
            description: 'Instalação e manutenção elétrica residencial com garantia. Atendo toda região metropolitana.',
            category: 'Elétrica',
            location_state: 'São Paulo',
            location_city: 'São Paulo',
            is_active: true,
            views: 15,
            created_at: new Date().toISOString()
          },
          {
            id: 'example-2',
            user_id: 'example-user-2',
            user_name: 'Maria Santos',
            user_type: 'client',
            title: 'Preciso de Pedreiro Urgente',
            description: 'Preciso de um pedreiro para reforma no banheiro. Trabalho urgente para próxima semana.',
            category: 'Construção e Reforma',
            location_state: 'Rio de Janeiro',
            location_city: 'Rio de Janeiro',
            is_active: true,
            views: 8,
            created_at: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
          },
          {
            id: 'example-3',
            user_id: 'example-user-3',
            user_name: 'Carlos Oliveira',
            user_type: 'professional',
            title: 'Pintura Residencial e Comercial',
            description: 'Serviços de pintura com materiais de qualidade. Orçamento gratuito.',
            category: 'Pintura',
            location_state: 'Minas Gerais',
            location_city: 'Belo Horizonte',
            is_active: true,
            views: 22,
            created_at: new Date(Date.now() - 172800000).toISOString() // 2 dias atrás
          },
          {
            id: 'example-4',
            user_id: 'example-user-4',
            user_name: 'Ana Costa',
            user_type: 'professional',
            title: 'Serviços de Jardinagem',
            description: 'Manutenção de jardins, poda de árvores e paisagismo. Experiência de 5 anos.',
            category: 'Jardinagem',
            location_state: 'Bahia',
            location_city: 'Salvador',
            is_active: true,
            views: 12,
            created_at: new Date(Date.now() - 259200000).toISOString() // 3 dias atrás
          },
          {
            id: 'example-5',
            user_id: 'example-user-5',
            user_name: 'Roberto Lima',
            user_type: 'client',
            title: 'Preciso de Diarista',
            description: 'Procuro diarista para limpeza semanal da casa. Preferência por pessoa experiente.',
            category: 'Diarista',
            location_state: 'Ceará',
            location_city: 'Fortaleza',
            is_active: true,
            views: 6,
            created_at: new Date(Date.now() - 345600000).toISOString() // 4 dias atrás
          }
        ]
        setClassifiedAds(exampleAds)
        toast.info('Exibindo dados de exemplo. Crie seu primeiro anúncio!')
      } else {
        setClassifiedAds(ads)
      }
      
    } catch (error) {
      console.error('Erro ao carregar classificados:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    
    try {
      // Por enquanto, vamos usar um sistema simples de favoritos local
      // Em uma implementação completa, criaria uma tabela classified_favorites
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`)
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)))
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
    }
  }

  const toggleFavorite = async (adId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar')
      return
    }

    try {
      const isFavorited = favorites.has(adId)
      
      if (isFavorited) {
        // Remover dos favoritos
        const newFavorites = new Set(favorites)
        newFavorites.delete(adId)
        setFavorites(newFavorites)
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(Array.from(newFavorites)))
        toast.success('Removido dos favoritos')
      } else {
        // Adicionar aos favoritos
        const newFavorites = new Set([...Array.from(favorites), adId])
        setFavorites(newFavorites)
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(Array.from(newFavorites)))
        toast.success('Adicionado aos favoritos')
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error)
      toast.error('Erro ao alterar favorito')
    }
  }

  const handleContact = async (userId: string, adId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para entrar em contato')
      return
    }

    try {
      // Incrementar contador de contatos
      const { data: currentAd } = await supabase
        .from('classified_ads')
        .select('contact_agreements_count')
        .eq('id', adId)
        .single()

      if (currentAd) {
        await supabase
          .from('classified_ads')
          .update({ contact_agreements_count: (currentAd.contact_agreements_count || 0) + 1 })
          .eq('id', adId)
      }

      // Abrir chat
      openChat()
      toast.success('Chat aberto!')
    } catch (error) {
      console.error('Erro ao entrar em contato:', error)
      toast.error('Erro ao entrar em contato')
    }
  }

  const handleViewProfile = async (userId: string) => {
    try {
      window.location.href = `/perfil/${userId}`
    } catch (error) {
      console.error('Erro ao visualizar perfil:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location_state: '',
      location_city: '',
      neighborhood: '',
      price_range: '',
      urgency_level: 'normal',
      contact_preference: 'chat'
    })
    setSelectedEstado('')
    setSelectedCidade('')
    setCreateAdType(null)
  }

  const handleCreateAd = async () => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para criar anúncios')
      return
    }

    // Validação básica
    if (!formData.title.trim() || !formData.description.trim() || !formData.category || !selectedEstado || !selectedCidade) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsCreatingAd(true)

    try {
      const adData = {
        user_id: user.id,
        user_name: profile.full_name || 'Usuário',
        user_type: profile.user_type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location_state: selectedEstado,
        location_city: selectedCidade,
        is_active: true,
        views: 0
      }

      const { data, error } = await supabase
        .from('classified_ads')
        .insert([adData])
        .select()

      if (error) {
        console.error('Erro ao criar anúncio:', error)
        toast.error('Erro ao criar anúncio. Tente novamente.')
        return
      }

      toast.success('Anúncio criado com sucesso!')
      
      // Recarregar dados
      await loadClassifiedAds()
      
      // Fechar modal e resetar formulário
      setShowCreateDialog(false)
      resetForm()
      
    } catch (error) {
      console.error('Erro ao criar anúncio:', error)
      toast.error('Erro ao criar anúncio. Tente novamente.')
    } finally {
      setIsCreatingAd(false)
    }
  }

  // Filtrar e ordenar dados
  const getFilteredData = () => {
    let filteredAds = [...classifiedAds]

    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filteredAds = filteredAds.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por serviço
    if (selectedService !== 'all') {
      filteredAds = filteredAds.filter(item =>
        item.category.toLowerCase().includes(selectedService.toLowerCase())
      )
    }

    // Filtro por localização
    if (selectedLocation !== 'all') {
      filteredAds = filteredAds.filter(item =>
        item.location_state.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        item.location_city.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    // Ordenação
    const sortFunction = (a: ClassifiedAd, b: ClassifiedAd) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'price_low':
          return 0 // Sem campo de preço na tabela atual
        case 'price_high':
          return 0 // Sem campo de preço na tabela atual
        case 'views':
          return (b.views || 0) - (a.views || 0)
        default:
          return 0
      }
    }

    filteredAds.sort(sortFunction)

    return filteredAds
  }

  const filteredAds = getFilteredData()

  // Dados para exibição baseado na aba ativa
  const getDisplayData = () => {
    switch (activeTab) {
      case 'offers':
        return filteredAds.filter(ad => ad.user_type === 'professional')
      case 'requests':
        return filteredAds.filter(ad => ad.user_type === 'client')
      default:
        return filteredAds
    }
  }

  const displayData = getDisplayData()

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-yellow-400 flex items-center justify-center">
          <div className="text-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
            <h3 className="text-xl font-black text-black mb-2">CARREGANDO CLASSIFICADOS</h3>
            <p className="text-black font-bold">Aguarde enquanto buscamos os melhores anúncios...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-yellow-400">
        {/* Header Brutalista */}
        <div className="bg-black text-yellow-400 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-4">CLASSIFICADOS</h1>
            <p className="text-lg font-bold text-yellow-400">
              ENCONTRE SERVIÇOS OU OFEREÇA SEUS SERVIÇOS PROFISSIONAIS
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center bg-blue-500 border-4 border-black p-6">
              <div className="text-4xl font-black text-white mb-2">
                {classifiedAds.length}
              </div>
              <div className="text-lg font-bold text-white">TOTAL DE ANÚNCIOS</div>
            </div>
            <div className="text-center bg-green-500 border-4 border-black p-6">
              <div className="text-4xl font-black text-white mb-2">
                {classifiedAds.filter(ad => ad.user_type === 'client').length}
              </div>
              <div className="text-lg font-bold text-white">SOLICITAÇÕES</div>
            </div>
            <div className="text-center bg-purple-500 border-4 border-black p-6">
              <div className="text-4xl font-black text-white mb-2">
                {classifiedAds.filter(ad => ad.user_type === 'professional').length}
              </div>
              <div className="text-lg font-bold text-white">OFERTAS</div>
            </div>
            <div className="text-center bg-orange-500 border-4 border-black p-6">
              <div className="text-4xl font-black text-white mb-2">
                {availableServices.length}
              </div>
              <div className="text-lg font-bold text-white">SERVIÇOS</div>
            </div>
          </div>

          {/* Abas Brutalistas */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 font-black text-lg py-4 transition-all ${
                    activeTab === 'all'
                      ? 'bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black border-4 border-black hover:bg-gray-100'
                  }`}
                >
                  <Square className="h-5 w-5 mr-2" />
                  TODOS ({classifiedAds.length})
                </Button>
                <Button
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 font-black text-lg py-4 transition-all ${
                    activeTab === 'requests'
                      ? 'bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black border-4 border-black hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-5 w-5 mr-2" />
                  SOLICITAÇÕES ({classifiedAds.filter(ad => ad.user_type === 'client').length})
                </Button>
                <Button
                  onClick={() => setActiveTab('offers')}
                  className={`flex-1 font-black text-lg py-4 transition-all ${
                    activeTab === 'offers'
                      ? 'bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black border-4 border-black hover:bg-gray-100'
                  }`}
                >
                  <Briefcase className="h-5 w-5 mr-2" />
                  OFERTAS ({classifiedAds.filter(ad => ad.user_type === 'professional').length})
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="BUSCAR POR TÍTULO, DESCRIÇÃO OU CATEGORIA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 border-4 border-black font-black text-lg py-3"
                  />
                </div>
              </div>

              {/* Serviço */}
              <div>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="border-4 border-black font-black text-lg py-3">
                    <SelectValue placeholder="SERVIÇO" />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-black">
                    <SelectItem value="all" className="font-black">TODOS OS SERVIÇOS</SelectItem>
                    {availableServices.map(service => (
                      <SelectItem key={service.id} value={service.name} className="font-black">
                        <span className="mr-2">{service.icon}</span>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenação */}
              <div>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="border-4 border-black font-black text-lg py-3">
                    <SelectValue placeholder="ORDENAR" />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-black">
                    <SelectItem value="newest" className="font-black">MAIS RECENTES</SelectItem>
                    <SelectItem value="price_low" className="font-black">MENOR PREÇO</SelectItem>
                    <SelectItem value="price_high" className="font-black">MAIOR PREÇO</SelectItem>
                    <SelectItem value="views" className="font-black">MAIS VISTOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Botão Criar Anúncio */}
          <div className="flex justify-center mb-8">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-black text-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all px-8 py-4 font-black text-lg">
                  <Plus className="h-6 w-6 mr-2" />
                  CRIAR ANÚNCIO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-yellow-400 border-4 border-black max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-black">
                    CRIAR NOVO ANÚNCIO
                  </DialogTitle>
                </DialogHeader>
                
                {!createAdType ? (
                  <div className="p-6">
                    <p className="text-black font-bold mb-6 text-center">
                      Escolha o tipo de anúncio que deseja criar:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                      <Button
                        onClick={() => setCreateAdType('offer')}
                        className="bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all p-8 font-black text-lg flex flex-col items-center space-y-3 min-h-[120px] w-full"
                      >
                        <Briefcase className="h-10 w-10" />
                        <div className="text-center">
                          <div className="text-lg font-black">OFERECER SERVIÇO</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => setCreateAdType('request')}
                        className="bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all p-8 font-black text-lg flex flex-col items-center space-y-3 min-h-[120px] w-full"
                      >
                        <Users className="h-10 w-10" />
                        <div className="text-center">
                          <div className="text-lg font-black">SOLICITAR SERVIÇO</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-black">
                        {createAdType === 'offer' ? 'OFERECER SERVIÇO' : 'SOLICITAR SERVIÇO'}
                      </h3>
                      <Button
                        onClick={() => setCreateAdType(null)}
                        variant="outline"
                        className="border-2 border-black font-black"
                      >
                        VOLTAR
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Título */}
                      <div>
                        <Label className="text-black font-bold text-lg">TÍTULO DO ANÚNCIO *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Serviços de Elétrica Residencial"
                          className="border-4 border-black font-bold text-lg py-3 mt-2"
                        />
                      </div>

                      {/* Descrição */}
                      <div>
                        <Label className="text-black font-bold text-lg">DESCRIÇÃO *</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva detalhadamente o serviço que você oferece ou precisa..."
                          className="border-4 border-black font-bold text-lg py-3 mt-2 min-h-[120px]"
                        />
                      </div>

                      {/* Categoria */}
                      <div>
                        <Label className="text-black font-bold text-lg">CATEGORIA *</Label>
                        <CategoriaCombobox
                          value={formData.category}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                          placeholder="Selecione uma categoria"
                          className="border-4 border-black font-bold text-lg py-3 mt-2"
                        />
                      </div>

                      {/* Localização */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-black font-bold text-lg">ESTADO *</Label>
                          <EstadoCombobox
                            value={selectedEstado}
                            onValueChange={(value) => {
                              setSelectedEstado(value)
                              setSelectedCidade('') // Limpa cidade quando estado muda
                            }}
                            placeholder="Selecione o estado"
                            className="border-4 border-black font-bold text-lg py-3 mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-black font-bold text-lg">CIDADE *</Label>
                          <CidadeCombobox
                            value={selectedCidade}
                            onValueChange={(value) => setSelectedCidade(value)}
                            estadoSigla={selectedEstado}
                            placeholder={selectedEstado ? "Selecione a cidade" : "Primeiro selecione o estado"}
                            className="border-4 border-black font-bold text-lg py-3 mt-2"
                            disabled={!selectedEstado}
                          />
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex gap-4 pt-4">
                        <Button
                          onClick={handleCreateAd}
                          disabled={isCreatingAd}
                          className="flex-1 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all py-4 font-black text-lg"
                        >
                          {isCreatingAd ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mr-2"></div>
                              CRIANDO...
                            </>
                          ) : (
                            <>
                              <Plus className="h-6 w-6 mr-2" />
                              CRIAR ANÚNCIO
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowCreateDialog(false)
                            resetForm()
                          }}
                          variant="outline"
                          className="border-4 border-black font-black text-lg py-4"
                        >
                          CANCELAR
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Anúncios */}
          {displayData.length === 0 ? (
            <div className="text-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12">
              <div className="w-32 h-32 bg-black border-8 border-black flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-16 w-16 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-black text-black mb-4">
                {activeTab === 'all' && 'NENHUM CLASSIFICADO ENCONTRADO'}
                {activeTab === 'requests' && 'NENHUMA SOLICITAÇÃO ENCONTRADA'}
                {activeTab === 'offers' && 'NENHUMA OFERTA ENCONTRADA'}
              </h3>
              <p className="text-black font-bold text-lg mb-8">
                {searchTerm || selectedService !== 'all'
                  ? 'TENTE AJUSTAR OS FILTROS DE BUSCA'
                  : activeTab === 'requests' 
                    ? 'SEJA O PRIMEIRO A SOLICITAR UM SERVIÇO!'
                    : activeTab === 'offers'
                      ? 'SEJA O PRIMEIRO A OFERECER UM SERVIÇO!'
                      : 'SEJA O PRIMEIRO A CRIAR UM ANÚNCIO!'
                }
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-black text-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all px-8 py-4 font-black text-lg"
              >
                <Plus className="h-6 w-6 mr-2" />
                CRIAR ANÚNCIO
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayData.map((ad) => {
                const isOffer = ad.user_type === 'professional'
                
                // Buscar o ícone do serviço correspondente
                // Mapear nomes em inglês para português (caso existam dados antigos)
                const categoryMapping: { [key: string]: string } = {
                  'painting': 'Pintura',
                  'construction': 'Construção e Reforma',
                  'electrical': 'Elétrica',
                  'plumbing': 'Encanamento',
                  'cleaning': 'Limpeza e Higiene',
                  'gardening': 'Jardinagem',
                  'beauty': 'Beleza e Bem-estar',
                  'technology': 'Tecnologia',
                  'transport': 'Transporte'
                }
                
                const mappedCategory = categoryMapping[ad.category] || ad.category
                const serviceIcon = availableServices.find(service => service.name === mappedCategory)?.icon || '🔧'

                return (
                  <Card key={ad.id} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 overflow-hidden">
                    <CardHeader className="p-4 bg-black border-b-4 border-black">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-yellow-400 text-black font-black">
                              {ad.user_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-black text-yellow-400 text-sm">
                              {ad.user_name || 'Usuário'}
                            </h3>
                            <Badge className={`text-xs font-black ${
                              isOffer 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {isOffer ? 'OFERTA' : 'SOLICITAÇÃO'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-400">
                            {ad.location_city}, {ad.location_state}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-black text-black text-lg mb-1">
                            {ad.title}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-500 text-white text-xs font-black border-2 border-black flex items-center gap-1">
                              <span className="text-sm">{serviceIcon}</span>
                              {mappedCategory}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-700 line-clamp-2">
                            {ad.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-bold text-black">
                              {ad.user_type === 'professional' ? '4.5' : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-bold text-gray-600">
                              {ad.views || 0} visualizações
                            </span>
                          </div>
                        </div>


                        <div className="flex items-center justify-between pt-2">
                          <Button
                            onClick={() => handleViewProfile(ad.user_id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 mr-2 bg-white text-black border-2 border-black hover:bg-gray-100 font-black"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            VER PERFIL
                          </Button>
                          
                          <Button
                            onClick={() => toggleFavorite(ad.id)}
                            variant="outline"
                            size="sm"
                            className={`mr-2 border-2 font-black ${
                              favorites.has(ad.id)
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-black border-black hover:bg-red-100'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${favorites.has(ad.id) ? 'fill-current' : ''}`} />
                          </Button>
                          
                          <Button
                            onClick={() => handleContact(ad.user_id, ad.id)}
                            size="sm"
                            className="bg-red-500 text-white border-2 border-black hover:bg-red-600 font-black"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            CONTATAR
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}