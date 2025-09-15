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
import { LocationSearch } from '@/components/ui/LocationSearch'
import { AvailabilityIndicator } from '@/components/ui/AvailabilityIndicator'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { services } from '@/data/services'
import { 
  Search, MapPin, Calendar, MessageCircle, Heart, 
  Users, Briefcase, Plus, Filter, Star, Zap, 
  TrendingUp, Award, Shield, Clock, Eye, Square,
  DollarSign, Clock3, Phone, Mail, ChevronsUpDown
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
  const [selectedEstado, setSelectedEstado] = useState('')
  const [selectedCidade, setSelectedCidade] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'views'>('newest')
  const [activeTab, setActiveTab] = useState<AdType>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createAdType, setCreateAdType] = useState<'offer' | 'request' | null>(null)
  const [isCreatingAd, setIsCreatingAd] = useState(false)
  
  const [classifiedAds, setClassifiedAds] = useState<ClassifiedAd[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showStats, setShowStats] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

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
      const { data: favoritesData, error } = await supabase
        .from('favorites')
        .select('favorite_id')
        .eq('user_id', user.id)
        .eq('favorite_type', 'service')

      if (error) {
        console.error('Erro ao carregar favoritos:', error)
        // Fallback para localStorage se houver erro
        const savedFavorites = localStorage.getItem(`favorites_${user.id}`)
        if (savedFavorites) {
          setFavorites(new Set(JSON.parse(savedFavorites)))
        }
        return
      }

      const favoriteIds = favoritesData?.map(fav => fav.favorite_id) || []
      setFavorites(new Set(favoriteIds))
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
      // Fallback para localStorage se houver erro
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`)
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)))
      }
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
        // Remover dos favoritos no banco
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('favorite_id', adId)
          .eq('favorite_type', 'service')

        if (error) {
          console.error('Erro ao remover favorito:', error)
          toast.error('Erro ao remover favorito')
          return
        }

        // Atualizar estado local
        const newFavorites = new Set(favorites)
        newFavorites.delete(adId)
        setFavorites(newFavorites)
        toast.success('Removido dos favoritos')
      } else {
        // Adicionar aos favoritos no banco
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            favorite_id: adId,
            favorite_type: 'service'
          })

        if (error) {
          console.error('Erro ao adicionar favorito:', error)
          toast.error('Erro ao adicionar favorito')
          return
        }

        // Atualizar estado local
        const newFavorites = new Set([...Array.from(favorites), adId])
        setFavorites(newFavorites)
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
      // Incrementar contador de visualizações
      const { data: currentAd } = await supabase
        .from('classified_ads')
        .select('views')
        .eq('id', adId)
        .single()

      if (currentAd) {
        await supabase
          .from('classified_ads')
          .update({ views: (currentAd.views || 0) + 1 })
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

    // Filtro por localização (apenas se selecionado)
    if (selectedLocation !== 'all') {
      filteredAds = filteredAds.filter(item =>
        item.location_state.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        item.location_city.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    // Filtro por estado específico (prioridade sobre localização geral)
    if (selectedEstado) {
      filteredAds = filteredAds.filter(item =>
        item.location_state.toLowerCase().includes(selectedEstado.toLowerCase())
      )
    }

    // Filtro por cidade específica (maior prioridade)
    if (selectedCidade) {
      filteredAds = filteredAds.filter(item =>
        item.location_city.toLowerCase().includes(selectedCidade.toLowerCase())
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
        <div className="bg-black text-yellow-400 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-2 sm:mb-4">CLASSIFICADOS</h1>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-yellow-400 mb-4 sm:mb-6 px-2">
              ENCONTRE SERVIÇOS OU OFEREÇA SEUS SERVIÇOS PROFISSIONAIS
            </p>
            
            {/* Seção de Categorias Destacadas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8">
              {availableServices.slice(0, 6).map((service) => (
                <div
                  key={service.id}
                  className="bg-yellow-400 border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all cursor-pointer p-2 sm:p-3 lg:p-4 transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  onClick={() => {
                    setSelectedService(service.name)
                    setActiveTab('offers')
                  }}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2 lg:mb-3">{service.icon}</div>
                    <div className="text-xs sm:text-sm font-black text-black uppercase tracking-wide leading-tight">{service.name}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 sm:mt-4">
              <Button
                onClick={() => setSelectedService('all')}
                className="bg-yellow-400 text-black border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all px-4 sm:px-6 lg:px-8 py-2 sm:py-3 font-black text-sm sm:text-base lg:text-lg transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                VER TODAS AS CATEGORIAS
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estatísticas Compactas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center bg-blue-500 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer" onClick={() => setActiveTab('all')}>
              <div className="text-3xl font-black text-white mb-2">
                {classifiedAds.length}
              </div>
              <div className="text-sm font-black text-white uppercase tracking-wide">TOTAL</div>
            </div>
            <div className="text-center bg-red-500 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer" onClick={() => setActiveTab('requests')}>
              <div className="text-3xl font-black text-white mb-2">
                {classifiedAds.filter(ad => ad.user_type === 'client').length}
              </div>
              <div className="text-sm font-black text-white uppercase tracking-wide">SOLICITAÇÕES</div>
            </div>
            <div className="text-center bg-green-500 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer" onClick={() => setActiveTab('offers')}>
              <div className="text-3xl font-black text-white mb-2">
                {classifiedAds.filter(ad => ad.user_type === 'professional').length}
              </div>
              <div className="text-sm font-black text-white uppercase tracking-wide">OFERTAS</div>
            </div>
            <div className="text-center bg-purple-500 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer" onClick={() => setSelectedService('all')}>
              <div className="text-3xl font-black text-white mb-2">
                {availableServices.length}
              </div>
              <div className="text-sm font-black text-white uppercase tracking-wide">CATEGORIAS</div>
            </div>
          </div>

          {/* Estatísticas de Localização - Condicional */}
          {classifiedAds.length > 0 && showStats && (
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8 transition-all duration-300">
              <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-500" />
                ESTATÍSTICAS POR LOCALIZAÇÃO
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Estados mais ativos */}
                <div className="bg-blue-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                  <h4 className="font-black text-white text-xl mb-4 uppercase tracking-wide">ESTADOS MAIS ATIVOS</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      classifiedAds.reduce((acc, ad) => {
                        acc[ad.location_state] = (acc[ad.location_state] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    )
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([estado, count]) => (
                        <div key={estado} className="flex justify-between items-center bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <span className="font-black text-black text-lg">{estado}</span>
                          <Badge className="bg-black text-white text-sm font-black border-2 border-black px-3 py-1">
                            {count} ANÚNCIOS
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Cidades mais ativas */}
                <div className="bg-green-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                  <h4 className="font-black text-white text-xl mb-4 uppercase tracking-wide">CIDADES MAIS ATIVAS</h4>
                  <div className="space-y-3">
                    {Object.entries(
                      classifiedAds.reduce((acc, ad) => {
                        acc[ad.location_city] = (acc[ad.location_city] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    )
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([cidade, count]) => (
                        <div key={cidade} className="flex justify-between items-center bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <span className="font-black text-black text-lg">{cidade}</span>
                          <Badge className="bg-black text-white text-sm font-black border-2 border-black px-3 py-1">
                            {count} ANÚNCIOS
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Distribuição por tipo */}
                <div className="bg-purple-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                  <h4 className="font-black text-white text-xl mb-4 uppercase tracking-wide">DISTRIBUIÇÃO</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <span className="font-black text-black text-lg">PROFISSIONAIS</span>
                      <Badge className="bg-green-500 text-white text-sm font-black border-2 border-black px-3 py-1">
                        {classifiedAds.filter(ad => ad.user_type === 'professional').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <span className="font-black text-black text-lg">CLIENTES</span>
                      <Badge className="bg-red-500 text-white text-sm font-black border-2 border-black px-3 py-1">
                        {classifiedAds.filter(ad => ad.user_type === 'client').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <span className="font-black text-black text-lg">TOTAL</span>
                      <Badge className="bg-black text-white text-sm font-black border-2 border-black px-3 py-1">
                        {classifiedAds.length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Abas Brutalistas */}
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-4 mb-8">
            <div className="flex gap-4">
              <Button
                onClick={() => setActiveTab('all')}
                className={`flex-1 font-black text-xl py-6 transition-all ${
                  activeTab === 'all'
                    ? 'bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black border-4 border-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Square className="h-6 w-6 mr-2" />
                TODOS ({classifiedAds.length})
              </Button>
              <Button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 font-black text-xl py-6 transition-all ${
                  activeTab === 'requests'
                    ? 'bg-red-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black border-4 border-black hover:bg-red-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Users className="h-6 w-6 mr-2" />
                SOLICITAÇÕES ({classifiedAds.filter(ad => ad.user_type === 'client').length})
              </Button>
              <Button
                onClick={() => setActiveTab('offers')}
                className={`flex-1 font-black text-xl py-6 transition-all ${
                  activeTab === 'offers'
                    ? 'bg-green-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black border-4 border-black hover:bg-green-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Briefcase className="h-6 w-6 mr-2" />
                OFERTAS ({classifiedAds.filter(ad => ad.user_type === 'professional').length})
              </Button>
            </div>
          </div>

          {/* Botões de Controle - Filtros e Estatísticas */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
            {/* Botão para mostrar/esconder estatísticas */}
            {classifiedAds.length > 0 && (
              <Button
                onClick={() => setShowStats(!showStats)}
                className={`border-2 sm:border-4 border-black font-black text-sm sm:text-base lg:text-lg px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 transition-all ${
                  showStats 
                    ? 'bg-red-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-blue-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{showStats ? 'ESCONDER ESTATÍSTICAS' : 'VER ESTATÍSTICAS'}</span>
                <span className="sm:hidden">{showStats ? 'ESCONDER' : 'ESTATÍSTICAS'}</span>
              </Button>
            )}
            
            {/* Botão para mostrar/esconder filtros */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`border-2 sm:border-4 border-black font-black text-sm sm:text-base lg:text-lg px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 transition-all ${
                showFilters 
                  ? 'bg-red-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-green-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{showFilters ? 'ESCONDER FILTROS' : 'VER FILTROS'}</span>
              <span className="sm:hidden">{showFilters ? 'ESCONDER' : 'FILTROS'}</span>
            </Button>
          </div>

          {/* Filtros - Condicional */}
          {showFilters && (
            <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                <h3 className="text-lg sm:text-xl font-black text-black flex items-center gap-2">
                  <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                  FILTROS E BUSCA
                </h3>
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedService('all')
                    setSelectedLocation('all')
                    setSelectedEstado('')
                    setSelectedCidade('')
                    setSortBy('newest')
                  }}
                  variant="outline"
                  className="border-2 sm:border-4 border-black font-black text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  LIMPAR FILTROS
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {/* Busca */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <Input
                      placeholder="BUSCAR ANÚNCIOS..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 sm:pl-12 border-2 sm:border-4 border-black font-black text-base sm:text-lg py-3 sm:py-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                    />
                  </div>
                </div>

                {/* Serviço */}
                <div>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="border-2 sm:border-4 border-black font-black text-base sm:text-lg py-3 sm:py-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                      <SelectValue placeholder="SERVIÇO" />
                    </SelectTrigger>
                    <SelectContent className="border-2 sm:border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <SelectItem value="all" className="font-black text-base sm:text-lg py-2 sm:py-3 hover:bg-gray-100 border-b-2 border-gray-200 last:border-b-0">TODOS OS SERVIÇOS</SelectItem>
                      {availableServices.map(service => (
                        <SelectItem key={service.id} value={service.name} className="font-black text-base sm:text-lg py-2 sm:py-3 hover:bg-gray-100 border-b-2 border-gray-200 last:border-b-0">
                          <span className="mr-2 text-lg sm:text-xl">{service.icon}</span>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Busca por Localização */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 sm:border-t-4 border-gray-200">
                <h4 className="text-base sm:text-lg font-black text-black mb-3 sm:mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  LOCALIZAÇÃO
                </h4>
                <LocationSearch
                  estadoValue={selectedEstado}
                  cidadeValue={selectedCidade}
                  onEstadoChange={setSelectedEstado}
                  onCidadeChange={setSelectedCidade}
                />
              </div>
              
              {/* Filtros ativos */}
              {(searchTerm || selectedService !== 'all' || selectedLocation !== 'all' || selectedEstado || selectedCidade) && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 sm:border-t-4 border-gray-200">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-sm sm:text-lg font-black text-gray-600">FILTROS ATIVOS:</span>
                    {searchTerm && (
                      <Badge className="bg-blue-500 text-white text-xs sm:text-sm font-black px-2 sm:px-4 py-1 sm:py-2 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Busca: "{searchTerm}"
                      </Badge>
                    )}
                    {selectedService !== 'all' && (
                      <Badge className="bg-green-500 text-white text-xs sm:text-sm font-black px-2 sm:px-4 py-1 sm:py-2 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Serviço: {selectedService}
                      </Badge>
                    )}
                    {selectedLocation !== 'all' && (
                      <Badge className="bg-purple-500 text-white text-xs sm:text-sm font-black px-2 sm:px-4 py-1 sm:py-2 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Local: {selectedLocation}
                      </Badge>
                    )}
                    {selectedEstado && (
                      <Badge className="bg-orange-500 text-white text-xs sm:text-sm font-black px-2 sm:px-4 py-1 sm:py-2 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Estado: {selectedEstado}
                      </Badge>
                    )}
                    {selectedCidade && (
                      <Badge className="bg-pink-500 text-white text-xs sm:text-sm font-black px-2 sm:px-4 py-1 sm:py-2 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Cidade: {selectedCidade}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botão Criar Anúncio */}
          <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-black text-yellow-400 border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 font-black text-base sm:text-lg lg:text-xl transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">CRIAR ANÚNCIO</span>
                  <span className="sm:hidden">CRIAR</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-4xl bg-yellow-400 border-2 sm:border-4 border-black max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-black">
                    CRIAR NOVO ANÚNCIO
                  </DialogTitle>
                </DialogHeader>
                
                {!createAdType ? (
                  <div className="p-3 sm:p-4 lg:p-6">
                    <p className="text-black font-bold mb-4 sm:mb-6 text-center text-sm sm:text-base">
                      Escolha o tipo de anúncio que deseja criar:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto">
                      <Button
                        onClick={() => setCreateAdType('offer')}
                        className="bg-green-500 text-white border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all p-4 sm:p-6 lg:p-8 font-black text-base sm:text-lg lg:text-xl flex flex-col items-center space-y-2 sm:space-y-3 min-h-[100px] sm:min-h-[120px] w-full transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
                        <div className="text-center">
                          <div className="text-sm sm:text-base lg:text-xl font-black">OFERECER SERVIÇO</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => setCreateAdType('request')}
                        className="bg-red-500 text-white border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all p-4 sm:p-6 lg:p-8 font-black text-base sm:text-lg lg:text-xl flex flex-col items-center space-y-2 sm:space-y-3 min-h-[100px] sm:min-h-[120px] w-full transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Users className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
                        <div className="text-center">
                          <div className="text-sm sm:text-base lg:text-xl font-black">SOLICITAR SERVIÇO</div>
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
                        <Label className="text-black font-black text-base sm:text-lg lg:text-xl">TÍTULO DO ANÚNCIO *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Serviços de Elétrica Residencial"
                          className="border-2 sm:border-4 border-black font-black text-base sm:text-lg lg:text-xl py-3 sm:py-4 mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                        />
                      </div>

                      {/* Descrição */}
                      <div>
                        <Label className="text-black font-black text-base sm:text-lg lg:text-xl">DESCRIÇÃO *</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva detalhadamente o serviço que você oferece ou precisa..."
                          className="border-2 sm:border-4 border-black font-black text-base sm:text-lg lg:text-xl py-3 sm:py-4 mt-2 min-h-[100px] sm:min-h-[120px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
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
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 pt-4 sm:pt-6">
                        <Button
                          onClick={handleCreateAd}
                          disabled={isCreatingAd}
                          className="flex-1 bg-black text-yellow-400 border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all py-4 sm:py-5 lg:py-6 font-black text-base sm:text-lg lg:text-xl transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          {isCreatingAd ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 border-b-2 border-yellow-400 mr-1 sm:mr-2"></div>
                              <span className="hidden sm:inline">CRIANDO...</span>
                              <span className="sm:hidden">CRIANDO...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">CRIAR ANÚNCIO</span>
                              <span className="sm:hidden">CRIAR</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowCreateDialog(false)
                            resetForm()
                          }}
                          variant="outline"
                          className="border-2 sm:border-4 border-black font-black text-base sm:text-lg lg:text-xl py-4 sm:py-5 lg:py-6 px-4 sm:px-6 lg:px-8 bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
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

          {/* Seção de Serviços Profissionais em Destaque */}
          {activeTab === 'offers' && displayData.length > 0 && (
            <div className="mb-8">
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-black flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-green-500" />
                    SERVIÇOS PROFISSIONAIS EM DESTAQUE
                  </h2>
                  <Badge className="bg-green-500 text-white text-sm font-black px-3 py-1">
                    {displayData.length} PROFISSIONAIS ATIVOS
                  </Badge>
                </div>
                
                {/* Cards de serviços mais populares */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableServices.slice(0, 3).map((service) => {
                    const serviceAds = displayData.filter(ad => 
                      ad.category.toLowerCase().includes(service.name.toLowerCase())
                    )
                    
                    return (
                      <div
                        key={service.id}
                        className="bg-gradient-to-br from-green-50 to-green-100 border-4 border-green-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                        onClick={() => setSelectedService(service.name)}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">{service.icon}</div>
                          <h3 className="font-black text-green-800 text-lg mb-1">{service.name}</h3>
                          <p className="text-sm font-bold text-green-700 mb-2">
                            {serviceAds.length} profissional{serviceAds.length !== 1 ? 'is' : ''} disponível{serviceAds.length !== 1 ? 'eis' : ''}
                          </p>
                          <Badge className="bg-green-500 text-white text-xs font-black">
                            VER OFERTAS
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Informações de Resultados Brutalistas */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black text-black">
                  RESULTADOS ENCONTRADOS
                </h3>
                <Badge className="bg-blue-500 text-white text-lg font-black px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {displayData.length} de {classifiedAds.length} anúncios
                </Badge>
              </div>
              
              {/* Indicador de filtros ativos */}
              {(searchTerm || selectedService !== 'all' || selectedLocation !== 'all' || selectedEstado || selectedCidade) && (
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-gray-600">FILTROS APLICADOS:</span>
                  <Badge className="bg-orange-500 text-white text-sm font-black px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {[
                      searchTerm && 'Busca',
                      selectedService !== 'all' && 'Serviço',
                      selectedLocation !== 'all' && 'Local',
                      selectedEstado && 'Estado',
                      selectedCidade && 'Cidade'
                    ].filter(Boolean).length} filtro(s)
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Sugestão de filtros */}
            {displayData.length === 0 && classifiedAds.length > 0 && (
              <div className="mt-6 p-6 bg-yellow-50 border-4 border-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-3">
                  <Search className="h-6 w-6 text-yellow-600" />
                  <span className="font-black text-yellow-800 text-lg">NENHUM RESULTADO ENCONTRADO</span>
                </div>
                <p className="text-base text-yellow-700 mb-4 font-bold">
                  Tente ajustar os filtros ou limpar a busca para ver todos os anúncios disponíveis.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedService('all')
                    setSelectedLocation('all')
                    setSelectedEstado('')
                    setSelectedCidade('')
                    setSortBy('newest')
                  }}
                  variant="outline"
                  className="border-4 border-yellow-400 text-yellow-800 font-black hover:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all px-6 py-3"
                >
                  VER TODOS OS ANÚNCIOS
                </Button>
              </div>
            )}
          </div>

          {/* Lista de Anúncios */}
          {displayData.length === 0 ? (
            <div className="text-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12">
              <div className="w-32 h-32 bg-black border-8 border-black flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Briefcase className="h-16 w-16 text-yellow-400" />
              </div>
              
              {/* Mensagem baseada no contexto */}
              {classifiedAds.length === 0 ? (
                <>
                  <h3 className="text-3xl font-black text-black mb-6">
                    NENHUM ANÚNCIO CADASTRADO
                  </h3>
                  <p className="text-black font-black text-xl mb-8">
                    SEJA O PRIMEIRO A CRIAR UM ANÚNCIO!
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-black text-black mb-6">
                    NENHUM RESULTADO ENCONTRADO
                  </h3>
                  <p className="text-black font-black text-xl mb-6">
                    {activeTab === 'requests' && 'NENHUMA SOLICITAÇÃO ENCONTRADA'}
                    {activeTab === 'offers' && 'NENHUMA OFERTA ENCONTRADA'}
                    {activeTab === 'all' && 'NENHUM ANÚNCIO ENCONTRADO'}
                  </p>
                  
                  {/* Sugestões específicas baseadas nos filtros */}
                  <div className="bg-yellow-50 border-4 border-yellow-300 p-6 mb-8 max-w-md mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-lg text-yellow-800 font-black mb-4">
                      💡 SUGESTÕES:
                    </p>
                    <ul className="text-base text-yellow-700 text-left space-y-2 font-bold">
                      {(selectedEstado || selectedCidade) && (
                        <li>• Tente buscar em outras cidades ou estados</li>
                      )}
                      {selectedService !== 'all' && (
                        <li>• Verifique outras categorias de serviços</li>
                      )}
                      {searchTerm && (
                        <li>• Tente termos de busca diferentes</li>
                      )}
                      <li>• Limpe os filtros para ver todos os anúncios</li>
                    </ul>
                  </div>
                </>
              )}
              
              <div className="flex gap-6 justify-center">
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedService('all')
                    setSelectedLocation('all')
                    setSelectedEstado('')
                    setSelectedCidade('')
                    setSortBy('newest')
                  }}
                  variant="outline"
                  className="border-4 border-black font-black text-lg px-8 py-4 bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  VER TODOS OS ANÚNCIOS
                </Button>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-black text-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all px-10 py-6 font-black text-xl transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Plus className="h-6 w-6 mr-2" />
                  CRIAR ANÚNCIO
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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

                // Verificar se o anúncio corresponde à localização selecionada
                const matchesLocation = selectedCidade 
                  ? ad.location_city.toLowerCase().includes(selectedCidade.toLowerCase())
                  : selectedEstado 
                    ? ad.location_state.toLowerCase().includes(selectedEstado.toLowerCase())
                    : true

                return (
                  <Card key={ad.id} className={`bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-200 overflow-hidden transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    isOffer ? 'ring-2 ring-green-500 ring-opacity-50' : 'ring-2 ring-red-500 ring-opacity-50'
                  } ${matchesLocation && (selectedEstado || selectedCidade) ? 'ring-4 ring-blue-500 ring-opacity-75' : ''}`}>
                    {/* Header com gradiente baseado no tipo */}
                    <CardHeader className={`p-3 sm:p-4 border-b-2 sm:border-b-4 border-black ${
                      isOffer ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 border-2 sm:border-4 border-white">
                            <AvatarFallback className="bg-yellow-400 text-black font-black text-sm sm:text-base lg:text-lg">
                              {ad.user_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-black text-white text-sm sm:text-base">
                              {ad.user_name || 'Usuário'}
                            </h3>
                            <Badge className={`text-xs font-black ${
                              isOffer 
                                ? 'bg-white text-green-600' 
                                : 'bg-white text-red-600'
                            }`}>
                              {isOffer ? 'PROFISSIONAL' : 'CLIENTE'}
                            </Badge>
                            <AvailabilityIndicator 
                              isAvailable={ad.is_active || false} 
                              size="sm" 
                              showText={true}
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {ad.location_city}, {ad.location_state}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-3 sm:p-4 lg:p-5">
                      <div className="space-y-3 sm:space-y-4">
                        {/* Título e categoria */}
                        <div>
                          <h4 className="font-black text-black text-lg sm:text-xl mb-2">
                            {ad.title}
                          </h4>
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge className="bg-blue-500 text-white text-xs sm:text-sm font-black border-2 border-black flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1">
                              <span className="text-sm sm:text-lg">{serviceIcon}</span>
                              {mappedCategory}
                            </Badge>
                            <Badge className={`text-xs font-black px-2 py-1 ${
                              isOffer 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {isOffer ? 'OFERECENDO' : 'SOLICITANDO'}
                            </Badge>
                            {matchesLocation && (selectedEstado || selectedCidade) && (
                              <Badge className="bg-blue-500 text-white text-xs font-black px-2 py-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                LOCAL
                              </Badge>
                            )}
                          </div>
                          
                          {/* Descrição - sempre visível */}
                          <p className="text-sm font-medium text-gray-700 leading-relaxed">
                            {ad.description}
                          </p>
                        </div>

                        {/* Informações adicionais - sempre visível */}
                        <div className="bg-gray-50 border-2 border-gray-200 p-2 sm:p-3 rounded-lg">
                          <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                              <span className="text-xs sm:text-sm font-bold text-black">
                                {ad.user_type === 'professional' ? '4.5 ⭐' : 'Novo'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              <span className="text-xs font-bold text-gray-600">
                                {ad.views || 0} views
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                              <span className="text-xs font-bold text-gray-600">
                                {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              <span className="text-xs font-bold text-gray-600">
                                Verificado
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botões de ação - sempre visível */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2 pt-2">
                          <Button
                            onClick={() => handleViewProfile(ad.user_id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white text-black border-2 sm:border-4 border-black hover:bg-gray-100 font-black text-xs sm:text-sm shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            PERFIL
                          </Button>
                          
                          <Button
                            onClick={() => toggleFavorite(ad.id)}
                            variant="outline"
                            size="sm"
                            className={`border-2 sm:border-4 font-black text-xs sm:text-sm shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                              favorites.has(ad.id)
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-black border-black hover:bg-red-100'
                            }`}
                          >
                            <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${favorites.has(ad.id) ? 'fill-current' : ''}`} />
                          </Button>
                          
                          <Button
                            onClick={() => handleContact(ad.user_id, ad.id)}
                            size="sm"
                            className={`font-black text-xs sm:text-sm border-2 sm:border-4 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                              isOffer 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                          >
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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