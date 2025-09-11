'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
  Shield,
  Zap,
  Eye,
  Edit,
  Trash2,
  Heart,
  Share2,
  Award,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react'
import { services as servicesList } from '@/data/services'

// Tipos de dados
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
  availability?: string
  featured?: boolean
  premium?: boolean
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

export default function ClassificadosNovoPage() {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  // Estados principais
  const [activeTab, setActiveTab] = useState<'ads' | 'services'>('ads')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedAdType, setSelectedAdType] = useState<'all' | 'service_request' | 'service_offer'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest')
  
  // Estados para dados
  const [ads, setAds] = useState<ClassifiedAd[]>([])
  const [services, setServices] = useState<ProfessionalService[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  
  // Estados para modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadAds(),
        loadServices(),
        loadFavorites()
      ])
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
        profiles?: {
          full_name?: string
          avatar_url?: string
          location_state?: string
          location_city?: string
        }
        title: string
        description: string
        category_id: string
        service_categories?: {
          name: string
          icon: string
        }
        price_min?: number
        price_max?: number
        service_type?: 'hourly' | 'fixed' | 'negotiable'
        is_active?: boolean
        created_at: string
        experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        insurance_coverage?: boolean
        emergency_service?: boolean
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
        service_type: service.service_type || 'fixed',
        is_active: service.is_active,
        created_at: service.created_at,
        location_state: service.profiles?.location_state || '',
        location_city: service.profiles?.location_city || '',
        experience_level: service.experience_level || 'intermediate',
        insurance_coverage: service.insurance_coverage || false,
        emergency_service: service.emergency_service || false,
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        reviews_count: Math.floor(Math.random() * 100) + 1 // Mock reviews
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
    const matchesAdType = selectedAdType === 'all' || ad.ad_type === selectedAdType
    
    return matchesSearch && matchesCategory && matchesState && matchesCity && matchesAdType
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante'
      case 'intermediate': return 'Intermediário'
      case 'advanced': return 'Avançado'
      case 'expert': return 'Especialista'
      default: return 'Intermediário'
    }
  }

  const getServiceTypeText = (type: string) => {
    switch (type) {
      case 'hourly': return 'Por hora'
      case 'fixed': return 'Preço fixo'
      case 'negotiable': return 'Negociável'
      default: return 'Preço fixo'
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
        // Remover dos favoritos
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
        // Adicionar aos favoritos
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

  const handleShare = async (title: string, url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: url
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('❌ Erro ao compartilhar:', error)
      toast.error('Erro ao compartilhar')
    }
  }

  // Renderização de componentes
  const renderAdCard = (ad: ClassifiedAd) => (
    <Card key={ad.id} className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
      user && ad.user_id === user.id ? 'ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50' : 
      ad.premium ? 'ring-2 ring-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' :
      'bg-white hover:shadow-xl'
    }`}>
      <CardContent className="p-0">
        {/* Header com badges */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">
                  {ad.user_type === 'professional' ? '🏗️' : '🔍'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {servicesList.find(s => s.id === ad.category)?.name || ad.category}
                </Badge>
                {ad.premium && (
                  <Badge className="bg-yellow-500 text-white text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {ad.featured && (
                  <Badge className="bg-purple-500 text-white text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Destaque
                  </Badge>
                )}
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {ad.title}
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {ad.description}
              </p>
            </div>
          </div>

          {/* Informações do anúncio */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{ad.location_city}, {ad.location_state}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-green-500" />
              <span>{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            
            {(ad.budget || ad.price) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-600">
                  {ad.user_type === 'professional' ? `A partir de R$ ${(ad.price || 0).toFixed(2)}` : `Orçamento até R$ ${(ad.budget || 0).toFixed(2)}`}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className={`text-xs ${getUrgencyColor(ad.urgency)}`}>
                {getUrgencyLabel(ad.urgency)}
              </Badge>
            </div>
          </div>

          {/* Perfil do usuário */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                  <AvatarImage src={ad.user_avatar_url || ''} />
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {ad.user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{ad.user_name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-500">4.8 (24 avaliações)</span>
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
                      className={`h-8 w-8 p-0 ${favorites.has(ad.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart className={`h-4 w-4 ${favorites.has(ad.id) ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleChat(ad.user_id, ad.user_name)}
                      className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare(ad.title, window.location.href)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleViewProfile(ad.user_id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {user && ad.user_id === user.id && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {/* TODO: Implementar edição */}}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {/* TODO: Implementar exclusão */}}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderServiceCard = (service: ProfessionalService) => (
    <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
      <CardContent className="p-0">
        {/* Header com badges */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{service.category_icon}</span>
                <Badge variant="secondary" className="text-xs">
                  {service.category_name}
                </Badge>
                {service.emergency_service && (
                  <Badge className="bg-red-500 text-white text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    24h
                  </Badge>
                )}
                {service.insurance_coverage && (
                  <Badge className="bg-green-500 text-white text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Seguro
                  </Badge>
                )}
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {service.description || 'Sem descrição'}
              </p>
            </div>
          </div>

          {/* Informações do serviço */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-green-600">
                {formatPrice(service.price_min, service.price_max)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{getServiceTypeText(service.service_type)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>{service.location_city}, {service.location_state}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="h-4 w-4 text-purple-500" />
              <span>{getExperienceLevelText(service.experience_level)}</span>
            </div>
          </div>

          {/* Perfil do profissional */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                  <AvatarImage src={service.professional_avatar_url || ''} />
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-green-500 to-blue-600 text-white">
                    {service.professional_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{service.professional_name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-500">{service.rating?.toFixed(1)} ({service.reviews_count} avaliações)</span>
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
                      className={`h-8 w-8 p-0 ${favorites.has(service.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart className={`h-4 w-4 ${favorites.has(service.id) ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleChat(service.professional_id, service.professional_name)}
                      className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare(service.title, window.location.href)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleViewProfile(service.professional_id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Loading state
  if (loading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">Carregando classificados...</h2>
              <p className="text-gray-600">Aguarde enquanto buscamos as melhores oportunidades</p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
          <div className="relative container mx-auto px-4 py-16">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Classificados ConfiLar
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Encontre os melhores profissionais ou ofereça seus serviços
              </p>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                  <div className="text-2xl font-bold">{ads.length + services.length}</div>
                  <div className="text-sm text-blue-200">Oportunidades</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-200" />
                  <div className="text-2xl font-bold">{services.length}</div>
                  <div className="text-sm text-blue-200">Profissionais</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-yellow-200" />
                  <div className="text-2xl font-bold">{ads.length}</div>
                  <div className="text-sm text-blue-200">Solicitações</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/95">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Busca */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Buscar serviços e anúncios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Categoria */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 px-3 border-2 border-gray-200 rounded-md focus:border-blue-500 text-gray-700"
                  >
                    <option value="all">Todas as categorias</option>
                    {servicesList.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Estado */}
                <div>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value)
                      setSelectedCity('')
                    }}
                    className="w-full h-12 px-3 border-2 border-gray-200 rounded-md focus:border-blue-500 text-gray-700"
                  >
                    <option value="">Todos os estados</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PR">Paraná</option>
                  </select>
                </div>
                
                {/* Cidade */}
                <div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedState}
                    className="w-full h-12 px-3 border-2 border-gray-200 rounded-md focus:border-blue-500 text-gray-700 disabled:bg-gray-100"
                  >
                    <option value="">Todas as cidades</option>
                    {selectedState === 'SP' && (
                      <>
                        <option value="São Paulo">São Paulo</option>
                        <option value="Campinas">Campinas</option>
                        <option value="Santos">Santos</option>
                      </>
                    )}
                    {selectedState === 'RJ' && (
                      <>
                        <option value="Rio de Janeiro">Rio de Janeiro</option>
                        <option value="Niterói">Niterói</option>
                        <option value="Nova Iguaçu">Nova Iguaçu</option>
                      </>
                    )}
                  </select>
                </div>
                
                {/* Ordenação */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_low' | 'price_high' | 'rating')}
                    className="w-full h-12 px-3 border-2 border-gray-200 rounded-md focus:border-blue-500 text-gray-700"
                  >
                    <option value="newest">Mais recentes</option>
                    <option value="price_low">Menor preço</option>
                    <option value="price_high">Maior preço</option>
                    <option value="rating">Melhor avaliação</option>
                  </select>
                </div>
              </div>
              
              {/* Filtros adicionais */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant={selectedAdType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAdType('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={selectedAdType === 'service_request' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAdType('service_request')}
                >
                  🔍 Procurando serviços
                </Button>
                <Button
                  variant={selectedAdType === 'service_offer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAdType('service_offer')}
                >
                  🏗️ Oferecendo serviços
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4 py-8">
          {/* Botão de criar anúncio */}
          <div className="text-center mb-8">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Anúncio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Criar Novo Anúncio</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="text-center text-gray-600">
                    Funcionalidade em desenvolvimento...
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ads' | 'services')}>
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-lg">
              <TabsTrigger value="ads" className="text-lg py-4">
                🔍 Anúncios ({filteredAds.length})
              </TabsTrigger>
              <TabsTrigger value="services" className="text-lg py-4">
                🏗️ Serviços ({filteredServices.length})
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo dos Anúncios */}
            <TabsContent value="ads">
              {filteredAds.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAds.map(renderAdCard)}
                </div>
              ) : (
                <Card className="shadow-lg">
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {ads.length === 0 ? 'Nenhum anúncio cadastrado' : 'Nenhum anúncio encontrado'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {ads.length === 0 
                        ? 'Seja o primeiro a criar um anúncio e conectar-se com outros usuários!'
                        : 'Tente ajustar os filtros de busca para encontrar mais oportunidades.'
                      }
                    </p>
                    {ads.length === 0 && (
                      <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Anúncio
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Conteúdo dos Serviços */}
            <TabsContent value="services">
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredServices.map(renderServiceCard)}
                </div>
              ) : (
                <Card className="shadow-lg">
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {services.length === 0 ? 'Nenhum serviço cadastrado' : 'Nenhum serviço encontrado'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {services.length === 0 
                        ? 'Ainda não há serviços profissionais cadastrados. Seja o primeiro!'
                        : 'Tente ajustar os filtros de busca para encontrar mais profissionais.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}
