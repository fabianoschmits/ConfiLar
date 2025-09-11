'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Star,
  DollarSign,
  Clock,
  Heart,
  Eye,
  Zap,
  Shield,
  Grid3X3,
  List,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Layers,
  Target,
} from 'lucide-react'
import { services as servicesList } from '@/data/services'

interface ClassifiedAd {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  location_state: string
  location_city: string
  user_name: string
  user_type: 'client' | 'professional'
  created_at: string
  is_active: boolean
  views_count: number
  user_avatar_url?: string
  ad_type: 'service_request' | 'service_offer'
  budget?: number
  price?: number
  urgency: 'low' | 'medium' | 'high'
}

interface ProfessionalService {
  id: string
  professional_id: string
  professional_name: string
  professional_avatar_url?: string
  category_id: string
  category_name: string
  category_icon: string
  title: string
  description: string
  price_min?: number
  price_max?: number
  service_type: 'hourly' | 'fixed' | 'negotiable'
  is_active: boolean
  created_at: string
  location_state?: string
  location_city?: string
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  insurance_coverage: boolean
  emergency_service: boolean
  rating?: number
  reviews_count?: number
}

export default function ClassifiedsV4Page() {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  // Estados principais
  const [activeTab, setActiveTab] = useState<'ads' | 'services'>('ads')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>('grid')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  
  // Estados para dados
  const [ads, setAds] = useState<ClassifiedAd[]>([])
  const [services, setServices] = useState<ProfessionalService[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Carregar dados
  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadAds(), loadServices(), loadFavorites()])
    } finally {
      setLoading(false)
    }
  }

  const loadAds = async () => {
    try {
      const { data, error } = await supabase
        .from('classified_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao carregar anúncios:', error)
        setAds([])
        return
      }

      setAds(data || [])
    } catch (error) {
      console.error('❌ Erro geral:', error)
      setAds([])
    }
  }

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_services')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url,
            location_state,
            location_city
          ),
          service_categories (
            name,
            icon
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao carregar serviços:', error)
        setServices([])
        return
      }

      const transformedServices: ProfessionalService[] = (data || []).map((service: {
        id: string
        professional_id: string
        category_id: string
        title: string
        description: string
        price_min?: number
        price_max?: number
        service_type?: 'hourly' | 'fixed' | 'negotiable'
        is_active: boolean
        created_at: string
        experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        insurance_coverage?: boolean
        emergency_service?: boolean
        profiles?: {
          full_name?: string
          avatar_url?: string
          location_state?: string
          location_city?: string
        }
        service_categories?: {
          name?: string
          icon?: string
        }
      }) => ({
        id: service.id,
        professional_id: service.professional_id,
        professional_name: service.profiles?.full_name || 'Profissional',
        professional_avatar_url: service.profiles?.avatar_url,
        category_id: service.category_id,
        category_name: service.service_categories?.name || 'Serviço',
        category_icon: service.service_categories?.icon || '🔧',
        title: service.title,
        description: service.description,
        price_min: service.price_min,
        price_max: service.price_max,
        service_type: (service.service_type as 'hourly' | 'fixed' | 'negotiable') || 'fixed',
        is_active: service.is_active,
        created_at: service.created_at,
        location_state: service.profiles?.location_state || '',
        location_city: service.profiles?.location_city || '',
        experience_level: (service.experience_level as 'beginner' | 'intermediate' | 'advanced' | 'expert') || 'intermediate',
        insurance_coverage: service.insurance_coverage || false,
        emergency_service: service.emergency_service || false,
        rating: 4.5 + Math.random() * 0.5,
        reviews_count: Math.floor(Math.random() * 100) + 1
      }))

      setServices(transformedServices)
    } catch (error) {
      console.error('❌ Erro geral:', error)
      setServices([])
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'classified_ad')

      if (!error && data) {
        setFavorites(new Set(data.map(fav => fav.item_id)))
      }
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error)
    }
  }

  // Filtrar e ordenar dados
  const filteredAds = ads.filter(ad => {
    const matchesSearch = !searchTerm || 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory
    const matchesState = !selectedState || ad.location_state === selectedState
    const matchesCity = !selectedCity || ad.location_city === selectedCity
    
    return matchesSearch && matchesCategory && matchesState && matchesCity
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'price_low':
        return (a.budget || a.price || 0) - (b.budget || b.price || 0)
      case 'price_high':
        return (b.budget || b.price || 0) - (a.budget || a.price || 0)
      default:
        return 0
    }
  })

  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory
    const matchesState = !selectedState || service.location_state === selectedState
    const matchesCity = !selectedCity || service.location_city === selectedCity
    
    return matchesSearch && matchesCategory && matchesState && matchesCity
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'price_low':
        return (a.price_min || 0) - (b.price_min || 0)
      case 'price_high':
        return (b.price_min || 0) - (a.price_min || 0)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })

  // Paginação
  const totalItems = activeTab === 'ads' ? filteredAds.length : filteredServices.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = activeTab === 'ads' 
    ? filteredAds.slice(startIndex, endIndex)
    : filteredServices.slice(startIndex, endIndex)

  // Funções utilitárias
  const formatPrice = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Preço a combinar'
    
    if (min && max && min !== max) {
      return `R$ ${min.toFixed(2)} - R$ ${max.toFixed(2)}`
    }
    
    if (min) return `A partir de R$ ${min.toFixed(2)}`
    if (max) return `Até R$ ${max.toFixed(2)}`
    
    return 'Preço a combinar'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white'
      case 'medium': return 'bg-amber-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgente'
      case 'medium': return 'Normal'
      case 'low': return 'Baixa'
      default: return 'Normal'
    }
  }

  // Funções de interação
  const handleChat = (userId: string, userName: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para iniciar um chat')
      return
    }
    
    if (userId === user.id) {
      toast.error('Você não pode iniciar um chat consigo mesmo')
      return
    }
    
    openChat(userId, userName)
  }

  const handleViewProfile = (userId: string) => {
    window.location.href = `/perfil/${userId}`
  }

  const handleFavorite = async (itemId: string, itemType: 'classified_ad' | 'service') => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar')
      return
    }

    const isFavorited = favorites.has(itemId)
    
    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('item_type', itemType)

        if (error) throw error
        
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
        
        toast.success('Removido dos favoritos')
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            item_id: itemId,
            item_type: itemType
          })

        if (error) throw error
        
        setFavorites(prev => new Set(prev).add(itemId))
        
        toast.success('Adicionado aos favoritos')
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar favoritos:', error)
      toast.error('Erro ao atualizar favoritos')
    }
  }

  // Renderização de componentes
  const renderAdCard = (ad: ClassifiedAd, index: number) => (
    <Card key={ad.id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white hover:bg-gray-50/50 overflow-hidden">
      {/* Header com número de ordem */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {startIndex + index + 1}
          </div>
        </div>
        <div className="h-24 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-4xl opacity-20">
            {ad.user_type === 'professional' ? '🏗️' : '🔍'}
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Badge de categoria */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-xs font-medium">
            {servicesList.find(s => s.id === ad.category)?.name || ad.category}
          </Badge>
        </div>

        {/* Título */}
        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {ad.title}
        </h3>
        
        {/* Descrição */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {ad.description}
        </p>

        {/* Informações compactas */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{ad.location_city}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Preço */}
        {(ad.budget || ad.price) && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="font-bold text-green-600">
                {ad.user_type === 'professional' ? `R$ ${(ad.price || 0).toFixed(2)}` : `R$ ${(ad.budget || 0).toFixed(2)}`}
              </span>
            </div>
          </div>
        )}

        {/* Urgência */}
        <div className="mb-4">
          <Badge className={`text-xs px-2 py-1 ${getUrgencyColor(ad.urgency)}`}>
            <Zap className="h-3 w-3 mr-1" />
            {getUrgencyLabel(ad.urgency)}
          </Badge>
        </div>

        {/* Footer compacto */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={ad.user_avatar_url || ''} />
                <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                  {ad.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-xs text-gray-900">{ad.user_name}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-500">4.8</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              {user && ad.user_id !== user.id && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFavorite(ad.id, 'classified_ad')}
                    className={`h-7 w-7 p-0 ${favorites.has(ad.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart className={`h-3 w-3 ${favorites.has(ad.id) ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleChat(ad.user_id, ad.user_name)}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-blue-500"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleViewProfile(ad.user_id)}
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderServiceCard = (service: ProfessionalService, index: number) => (
    <Card key={service.id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white hover:bg-gray-50/50 overflow-hidden">
      {/* Header com número de ordem */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {startIndex + index + 1}
          </div>
        </div>
        <div className="h-24 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
          <div className="text-4xl opacity-20">{service.category_icon}</div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Badge de categoria */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-xs font-medium">
            {service.category_name}
          </Badge>
        </div>

        {/* Título */}
        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {service.title}
        </h3>
        
        {/* Descrição */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {service.description || 'Sem descrição'}
        </p>

        {/* Informações compactas */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{service.location_city}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            <span className="capitalize">{service.service_type}</span>
          </div>
        </div>

        {/* Preço */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="font-bold text-green-600">{formatPrice(service.price_min, service.price_max)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="outline" className="text-xs px-2 py-1">
            {service.experience_level}
          </Badge>
          {service.emergency_service && (
            <Badge variant="outline" className="text-xs px-2 py-1 bg-red-50 text-red-700 border-red-200">
              24h
            </Badge>
          )}
          {service.insurance_coverage && (
            <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Seguro
            </Badge>
          )}
        </div>

        {/* Footer compacto */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={service.professional_avatar_url || ''} />
                <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                  {service.professional_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-xs text-gray-900">{service.professional_name}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-500">{service.rating?.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              {user && service.professional_id !== user.id && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFavorite(service.id, 'service')}
                    className={`h-7 w-7 p-0 ${favorites.has(service.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart className={`h-3 w-3 ${favorites.has(service.id) ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleChat(service.professional_id, service.professional_name)}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-emerald-500"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleViewProfile(service.professional_id)}
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{animationDelay: '0.5s'}}></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando classificados...</h2>
            <p className="text-gray-600">Organizando as melhores oportunidades</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header com estatísticas */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Classificados
                </h1>
                <p className="text-gray-600 max-w-2xl">
                  Explore oportunidades organizadas e encontre exatamente o que você procura
                </p>
              </div>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{filteredServices.length}</div>
                  <div className="text-sm text-gray-600">Serviços</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{filteredAds.length}</div>
                  <div className="text-sm text-gray-600">Anúncios</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Barra de busca e controles */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar serviços e anúncios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Controles */}
              <div className="flex gap-2">
                {/* Modo de visualização */}
                <div className="flex border border-gray-200 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none border-r border-gray-200"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none border-r border-gray-200"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('masonry')}
                    className="rounded-l-none"
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Filtros avançados */}
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="h-12 px-4"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                  {showAdvancedFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>

            {/* Filtros avançados */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">Todas as categorias</option>
                      {servicesList.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value)
                        setSelectedCity('')
                      }}
                      className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Todos os estados</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PR">Paraná</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={!selectedState}
                      className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                    >
                      <option value="">Todas as cidades</option>
                      {selectedState === 'SP' && (
                        <>
                          <option value="São Paulo">São Paulo</option>
                          <option value="Campinas">Campinas</option>
                          <option value="Santos">Santos</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_low' | 'price_high' | 'rating')}
                      className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="newest">Mais recentes</option>
                      <option value="price_low">Menor preço</option>
                      <option value="price_high">Maior preço</option>
                      <option value="rating">Melhor avaliação</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão Criar Anúncio */}
          <div className="text-center mb-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg">
              <Plus className="h-5 w-5 mr-2" />
              Criar Anúncio
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ads' | 'services')}>
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-sm border border-gray-200">
              <TabsTrigger value="ads" className="text-base py-3">
                Anúncios ({filteredAds.length})
              </TabsTrigger>
              <TabsTrigger value="services" className="text-base py-3">
                Serviços ({filteredServices.length})
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo dos Anúncios */}
            <TabsContent value="ads">
              {filteredAds.length > 0 ? (
                <>
                  {/* Grid responsivo baseado no modo de visualização */}
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : viewMode === 'list'
                      ? 'grid-cols-1'
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}>
                    {currentItems.map((item: ClassifiedAd | ProfessionalService, index: number) => 
                      activeTab === 'ads' ? renderAdCard(item as ClassifiedAd, index) : renderServiceCard(item as ProfessionalService, index)
                    )}
                  </div>
                  
                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8">
                      <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} resultados
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-10"
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Próximo
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <Target className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {ads.length === 0 ? 'Nenhum anúncio encontrado' : 'Nenhum resultado encontrado'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {ads.length === 0 
                      ? 'Seja o primeiro a criar um anúncio!'
                      : 'Tente ajustar os filtros de busca.'
                    }
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Conteúdo dos Serviços */}
            <TabsContent value="services">
              {filteredServices.length > 0 ? (
                <>
                  {/* Grid responsivo baseado no modo de visualização */}
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : viewMode === 'list'
                      ? 'grid-cols-1'
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}>
                    {currentItems.map((item: ClassifiedAd | ProfessionalService, index: number) => 
                      activeTab === 'ads' ? renderAdCard(item as ClassifiedAd, index) : renderServiceCard(item as ProfessionalService, index)
                    )}
                  </div>
                  
                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8">
                      <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} resultados
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-10"
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Próximo
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <Target className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {services.length === 0 ? 'Nenhum serviço encontrado' : 'Nenhum resultado encontrado'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {services.length === 0 
                      ? 'Ainda não há serviços profissionais cadastrados.'
                      : 'Tente ajustar os filtros de busca.'
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}
