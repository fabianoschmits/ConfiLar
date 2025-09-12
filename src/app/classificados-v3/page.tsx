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
  Award,
  TrendingUp,
  Users,
  Sparkles,
  Hexagon,
  Cpu,
  Atom,
  Brain,
  Rocket,
  Satellite
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

export default function ClassifiedsV3Page() {
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
        profiles?: { full_name?: string; avatar_url?: string; location_state?: string; location_city?: string }
        category_id: string
        service_categories?: { name?: string; icon?: string }
        title: string
        description?: string
        price_min?: number
        price_max?: number
        service_type?: 'hourly' | 'fixed' | 'negotiable'
        is_active: boolean
        created_at: string
        experience_level?: ProfessionalService['experience_level']
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

  // Funções utilitárias
  const formatPrice = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Preço a combinar'
    
    if (min && max && min !== max) {
      return `R$ ${(min || 0).toFixed(2)} - R$ ${(max || 0).toFixed(2)}`
    }
    
    if (min) return `A partir de R$ ${(min || 0).toFixed(2)}`
    if (max) return `Até R$ ${(max || 0).toFixed(2)}`
    
    return 'Preço a combinar'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-gradient-to-r from-red-400/20 to-pink-400/20 text-red-300 border-red-400/30'
      case 'medium': return 'bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-300 border-amber-400/30'
      case 'low': return 'bg-gradient-to-r from-emerald-400/20 to-green-400/20 text-emerald-300 border-emerald-400/30'
      default: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 text-gray-300 border-gray-400/30'
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
  const renderAdCard = (ad: ClassifiedAd) => (
    <Card key={ad.id} className="group hover:scale-105 transition-all duration-700 border-0 bg-white/10 backdrop-blur-xl hover:bg-white/20 shadow-2xl hover:shadow-cyan-500/25 overflow-hidden">
      {/* Header com efeito glassmorphism */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-blue-400/10 to-purple-400/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative h-32 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Hexagon className="h-8 w-8 text-cyan-400" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-cyan-300 uppercase tracking-wider">
                {ad.user_type === 'professional' ? 'OFERECENDO' : 'PROCURANDO'}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent"></div>
            </div>
            
            <h3 className="font-bold text-xl text-white mb-4 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-500">
              {ad.title}
            </h3>
            
            <p className="text-white/70 text-sm line-clamp-3 mb-6 leading-relaxed">
              {ad.description}
            </p>
          </div>
        </div>

        {/* Informações com ícones futuristas */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-cyan-400/30">
              <MapPin className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-white/80 font-medium">{ad.location_city}, {ad.location_state}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-white/80 font-medium">{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          
          {(ad.budget || ad.price) && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-emerald-400/30">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-emerald-300 font-bold">
                {ad.user_type === 'professional' ? `R$ ${(ad.price || 0).toFixed(2)}` : `Orçamento: R$ ${(ad.budget || 0).toFixed(2)}`}
              </span>
            </div>
          )}
        </div>

        {/* Urgência com efeito neon */}
        <div className="mb-6">
          <Badge className={`text-xs font-medium px-4 py-2 rounded-full border backdrop-blur-sm ${getUrgencyColor(ad.urgency)}`}>
            <Zap className="h-3 w-3 mr-1" />
            {getUrgencyLabel(ad.urgency)}
          </Badge>
        </div>

        {/* Footer com glassmorphism */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 ring-2 ring-cyan-400/50 backdrop-blur-sm">
                <AvatarImage src={ad.user_avatar_url || ''} />
                <AvatarFallback className="text-sm bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold">
                  {ad.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-white text-sm">{ad.user_name}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-white/60">4.8 (24)</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {user && ad.user_id !== user.id && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFavorite(ad.id, 'classified_ad')}
                    className={`h-10 w-10 p-0 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-500 ${
                      favorites.has(ad.id) 
                        ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
                        : 'text-white/60 hover:text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(ad.id) ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleChat(ad.user_id, ad.user_name)}
                    className="h-10 w-10 p-0 rounded-xl backdrop-blur-sm border border-white/20 text-white/60 hover:text-cyan-400 hover:bg-cyan-500/20 transition-all duration-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleViewProfile(ad.user_id)}
                className="h-10 w-10 p-0 rounded-xl backdrop-blur-sm border border-white/20 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-500"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderServiceCard = (service: ProfessionalService) => (
    <Card key={service.id} className="group hover:scale-105 transition-all duration-700 border-0 bg-white/10 backdrop-blur-xl hover:bg-white/20 shadow-2xl hover:shadow-emerald-500/25 overflow-hidden">
      {/* Header com efeito glassmorphism */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-cyan-400/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative h-32 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Atom className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{service.category_icon}</span>
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-300 uppercase tracking-wider">
                {service.category_name}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
            </div>
            
            <h3 className="font-bold text-xl text-white mb-4 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-400 transition-all duration-500">
              {service.title}
            </h3>
            
            <p className="text-white/70 text-sm line-clamp-3 mb-6 leading-relaxed">
              {service.description || 'Sem descrição'}
            </p>
          </div>
        </div>

        {/* Informações com ícones futuristas */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-emerald-400/30">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-emerald-300 font-bold">{formatPrice(service.price_min, service.price_max)}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-white/80 font-medium">{service.location_city}, {service.location_state}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-white/80 font-medium capitalize">{service.service_type}</span>
          </div>
        </div>

        {/* Badges futuristas */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm">
            <Award className="h-3 w-3 mr-1" />
            {service.experience_level}
          </Badge>
          {service.emergency_service && (
            <Badge className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-red-400/20 to-pink-400/20 text-red-300 border border-red-400/30 backdrop-blur-sm">
              <Zap className="h-3 w-3 mr-1" />
              24h
            </Badge>
          )}
          {service.insurance_coverage && (
            <Badge className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-300 border border-green-400/30 backdrop-blur-sm">
              <Shield className="h-3 w-3 mr-1" />
              Seguro
            </Badge>
          )}
        </div>

        {/* Footer com glassmorphism */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 ring-2 ring-emerald-400/50 backdrop-blur-sm">
                <AvatarImage src={service.professional_avatar_url || ''} />
                <AvatarFallback className="text-sm bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold">
                  {service.professional_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-white text-sm">{service.professional_name}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-white/60">{(service.rating || 0).toFixed(1)} ({service.reviews_count})</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {user && service.professional_id !== user.id && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFavorite(service.id, 'service')}
                    className={`h-10 w-10 p-0 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-500 ${
                      favorites.has(service.id) 
                        ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
                        : 'text-white/60 hover:text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(service.id) ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleChat(service.professional_id, service.professional_name)}
                    className="h-10 w-10 p-0 rounded-xl backdrop-blur-sm border border-white/20 text-white/60 hover:text-emerald-400 hover:bg-emerald-500/20 transition-all duration-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleViewProfile(service.professional_id)}
                className="h-10 w-10 p-0 rounded-xl backdrop-blur-sm border border-white/20 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-500"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl animate-pulse mx-auto mb-6 backdrop-blur-sm border border-cyan-400/30"></div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl animate-ping mx-auto opacity-20"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Carregando classificados...</h2>
            <p className="text-white/60">Preparando a experiência futurista</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background com efeitos */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-blue-500/5"></div>
        
        {/* Header Futurista */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-8">
                <Rocket className="h-12 w-12 text-cyan-400 animate-pulse" />
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 drop-shadow-2xl">
                  Classificados
                </h1>
                <Satellite className="h-12 w-12 text-blue-400 animate-pulse" />
              </div>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 drop-shadow-md">
                Explore o futuro das conexões profissionais com tecnologia de ponta
              </p>
              
              {/* Estatísticas futuristas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-cyan-400/30">
                    <Users className="h-8 w-8 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{ads.length + services.length}</div>
                  <div className="text-sm text-white/60">Oportunidades</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-emerald-400/30">
                    <TrendingUp className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{services.length}</div>
                  <div className="text-sm text-white/60">Profissionais</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-purple-400/30">
                    <Sparkles className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{ads.length}</div>
                  <div className="text-sm text-white/60">Solicitações</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Barra de Busca Futurista */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 mb-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-6 w-6" />
                  <Input
                    placeholder="Buscar serviços e anúncios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 rounded-2xl backdrop-blur-sm"
                  />
                </div>
              </div>
              
              {/* Filtros futuristas */}
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-14 px-4 bg-white/10 border border-white/20 text-white rounded-2xl focus:border-cyan-400 focus:ring-cyan-400 backdrop-blur-sm"
                >
                  <option value="all">Todas as categorias</option>
                  {servicesList.map(service => (
                    <option key={service.id} value={service.id} className="bg-slate-800 text-white">
                      {service.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_low' | 'price_high' | 'rating')}
                  className="h-14 px-4 bg-white/10 border border-white/20 text-white rounded-2xl focus:border-purple-400 focus:ring-purple-400 backdrop-blur-sm"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="price_low">Menor preço</option>
                  <option value="price_high">Maior preço</option>
                  <option value="rating">Melhor avaliação</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão Criar Anúncio Futurista */}
          <div className="text-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-10 py-5 text-xl rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 hover:scale-105 backdrop-blur-sm border border-white/20">
              <Plus className="h-6 w-6 mr-3" />
              Criar Anúncio
              <Rocket className="h-6 w-6 ml-3" />
            </Button>
          </div>

          {/* Tabs Futuristas */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ads' | 'services')}>
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
              <TabsTrigger value="ads" className="text-lg py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl font-bold backdrop-blur-sm">
                Anúncios ({filteredAds.length})
              </TabsTrigger>
              <TabsTrigger value="services" className="text-lg py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-xl font-bold backdrop-blur-sm">
                Serviços ({filteredServices.length})
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo dos Anúncios */}
            <TabsContent value="ads">
              {filteredAds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredAds.map(renderAdCard)}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-cyan-400/30">
                    <Cpu className="h-16 w-16 text-cyan-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {ads.length === 0 ? 'Nenhum anúncio encontrado' : 'Nenhum resultado encontrado'}
                  </h3>
                  <p className="text-white/60 max-w-md mx-auto text-lg">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredServices.map(renderServiceCard)}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-emerald-400/30">
                    <Brain className="h-16 w-16 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {services.length === 0 ? 'Nenhum serviço encontrado' : 'Nenhum resultado encontrado'}
                  </h3>
                  <p className="text-white/60 max-w-md mx-auto text-lg">
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