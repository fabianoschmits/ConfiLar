'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Search, MapPin, Calendar, MessageCircle, Star, Clock, 
  Heart, Eye, Filter, SortAsc, Building2, Briefcase,
  Users, TrendingUp, Award, Shield, Zap, Plus, ArrowRight,
  DollarSign, CheckCircle, AlertTriangle, Info, Menu,
  Phone, Mail, Share2, Bookmark
} from 'lucide-react'

interface Listing {
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
  image_url?: string
}

export default function ClassificadosMobilePage() {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Imagens de exemplo para diferentes categorias
  const getCategoryImage = (category: string, adType: string) => {
    const images = {
      tecnologia: [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop'
      ],
      design: [
        'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop'
      ],
      marketing: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
      ],
      consultoria: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop'
      ],
      educacao: [
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
      ],
      saude: [
        'https://images.unsplash.com/photo-1559757148-5c350d0f3c56?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop'
      ]
    }
    
    const categoryImages = images[category as keyof typeof images] || images.tecnologia
    return categoryImages[Math.floor(Math.random() * categoryImages.length)]
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadListings(), loadFavorites()])
    } finally {
      setLoading(false)
    }
  }

  const loadListings = async () => {
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select(`
          *,
          profiles:client_id (
            full_name,
            avatar_url,
            user_type
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      const { data: listingsData, error: listingsError } = await supabase
        .from('service_listings')
        .select(`
          *,
          profiles:professional_id (
            full_name,
            avatar_url,
            user_type
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (requestsError || listingsError) {
        const mockListings: Listing[] = [
          {
            id: '1',
            user_id: 'user1',
            title: 'Preciso de um desenvolvedor React',
            description: 'Estou procurando um desenvolvedor experiente em React para um projeto de e-commerce.',
            category: 'tecnologia',
            location_state: 'SP',
            location_city: 'São Paulo',
            user_name: 'João Silva',
            user_type: 'client',
            created_at: new Date().toISOString(),
            is_active: true,
            views_count: 15,
            ad_type: 'service_request',
            budget: 5000,
            urgency: 'high',
            image_url: getCategoryImage('tecnologia', 'service_request')
          },
          {
            id: '2',
            user_id: 'user2',
            title: 'Ofereço serviços de design gráfico',
            description: 'Designer gráfico com 5 anos de experiência oferece serviços de identidade visual.',
            category: 'design',
            location_state: 'RJ',
            location_city: 'Rio de Janeiro',
            user_name: 'Maria Santos',
            user_type: 'professional',
            created_at: new Date().toISOString(),
            is_active: true,
            views_count: 23,
            ad_type: 'service_offer',
            price: 150,
            urgency: 'medium',
            image_url: getCategoryImage('design', 'service_offer')
          }
        ]
        setListings(mockListings)
        return
      }

      const requests = requestsData?.map(item => ({
        id: item.id,
        user_id: item.client_id,
        title: item.title,
        description: item.description,
        category: item.service_category_id,
        location_state: item.location_state,
        location_city: item.location_city,
        user_name: item.profiles?.full_name || 'Cliente',
        user_type: 'client' as const,
        created_at: item.created_at,
        is_active: item.is_active,
        views_count: 0,
        user_avatar_url: item.profiles?.avatar_url,
        ad_type: 'service_request' as const,
        budget: item.budget,
        urgency: 'medium' as const,
        image_url: getCategoryImage(item.service_category_id, 'service_request')
      })) || []

      const offers = listingsData?.map(item => ({
        id: item.id,
        user_id: item.professional_id,
        title: item.title,
        description: item.description,
        category: item.service_category_id,
        location_state: item.location_state,
        location_city: item.location_city,
        user_name: item.profiles?.full_name || 'Profissional',
        user_type: 'professional' as const,
        created_at: item.created_at,
        is_active: item.is_active,
        views_count: 0,
        user_avatar_url: item.profiles?.avatar_url,
        ad_type: 'service_offer' as const,
        price: item.price_min,
        urgency: 'medium' as const,
        image_url: getCategoryImage(item.service_category_id, 'service_offer')
      })) || []

      setListings([...requests, ...offers])
    } catch (error) {
      console.error('Erro ao carregar classificados:', error)
      toast.error('Erro ao carregar classificados')
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('service_favorites')
        .select('service_id')
        .eq('user_id', user.id)

      if (error) {
        const localFavorites = localStorage.getItem('favorites')
        if (localFavorites) {
          setFavorites(new Set(JSON.parse(localFavorites)))
        }
        return
      }

      const favoriteIds = new Set(data?.map(item => item.service_id) || [])
      setFavorites(favoriteIds)
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
    }
  }

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast.error('Faça login para favoritar')
      return
    }

    try {
      const isFavorited = favorites.has(listingId)

      if (isFavorited) {
        const { error } = await supabase
          .from('service_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', listingId)

        if (error) {
          const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
          const updatedFavorites = localFavorites.filter((id: string) => id !== listingId)
          localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
        }

        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(listingId)
          return newSet
        })
        toast.success('Removido dos favoritos')
      } else {
        const { error } = await supabase
          .from('service_favorites')
          .insert({
            user_id: user.id,
            service_id: listingId
          })

        if (error) {
          const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
          if (!localFavorites.includes(listingId)) {
            localFavorites.push(listingId)
            localStorage.setItem('favorites', JSON.stringify(localFavorites))
          }
        }

        setFavorites(prev => new Set(Array.from(prev).concat(listingId)))
        toast.success('Adicionado aos favoritos')
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error)
      toast.error('Erro ao favoritar')
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgente'
      case 'medium': return 'Médio'
      case 'low': return 'Baixo'
      default: return 'Normal'
    }
  }

  const filteredListings = listings
    .filter(listing => {
      const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (a.budget || a.price || 0) - (b.budget || b.price || 0)
        case 'price_high':
          return (b.budget || b.price || 0) - (a.budget || a.price || 0)
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-4">
          {/* Header Mobile */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Classificados ConfiLar
            </h1>
            <p className="text-sm text-gray-600">
              Otimizado para dispositivos móveis
            </p>
          </div>

          {/* Busca Mobile */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Filtros Mobile */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full h-12 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            
            {showFilters && (
              <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="consultoria">Consultoria</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="price_low">Menor preço</SelectItem>
                    <SelectItem value="price_high">Maior preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Lista Mobile */}
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                {/* Imagem Mobile */}
                {listing.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardContent className="p-4">
                  {/* Header Mobile */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.user_avatar_url} />
                      <AvatarFallback>
                        {listing.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base mb-1">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-600">{listing.user_name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(listing.id)}
                      className="p-2"
                    >
                      <Heart 
                        className={`h-5 w-5 ${
                          favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                        }`} 
                      />
                    </Button>
                  </div>

                  {/* Descrição Mobile */}
                  <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                    {listing.description}
                  </p>

                  {/* Tags Mobile */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge 
                      variant={listing.ad_type === 'service_request' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {listing.ad_type === 'service_request' ? 'Solicitação' : 'Oferta'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {listing.category}
                    </Badge>
                    <Badge className={getUrgencyColor(listing.urgency)}>
                      {getUrgencyText(listing.urgency)}
                    </Badge>
                  </div>

                  {/* Preço Mobile */}
                  {(listing.budget || listing.price) && (
                    <div className="mb-3">
                      <div className="text-lg font-bold text-cyan-600">
                        R$ {(listing.budget || listing.price)?.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Localização Mobile */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listing.location_city}, {listing.location_state}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Ações Mobile */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-12"
                      onClick={() => openChat(listing.user_id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contatar
                    </Button>
                    <Button variant="outline" size="sm" className="px-3">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="px-3">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <Card className="mt-8">
              <CardContent className="p-8 text-center">
                <Menu className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum classificado encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou criar um novo classificado.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Estatísticas Mobile */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center border">
              <div className="text-xl font-bold text-cyan-600">{filteredListings.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <div className="text-xl font-bold text-green-600">
                {filteredListings.filter(l => l.ad_type === 'service_request').length}
              </div>
              <div className="text-xs text-gray-600">Solicitações</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <div className="text-xl font-bold text-blue-600">
                {filteredListings.filter(l => l.ad_type === 'service_offer').length}
              </div>
              <div className="text-xs text-gray-600">Ofertas</div>
            </div>
          </div>

          {/* Call to Action Mobile */}
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-14 text-base"
            >
              <Plus className="h-5 w-5 mr-2" />
              Criar Novo Classificado
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
