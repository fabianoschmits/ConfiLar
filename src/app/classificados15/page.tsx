'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
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
  Search, MapPin, Calendar, MessageCircle, Heart, 
  Users, Briefcase, Plus, Filter, Star, Zap, 
  TrendingUp, Award, Shield, Clock, Eye, Coffee,
  Music, Camera, Film, Radio
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
}

export default function ClassificadosVintagePage() {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest')
  const [listings, setListings] = useState<Listing[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

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
            urgency: 'high'
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
            urgency: 'medium'
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
        urgency: 'medium' as const
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
        urgency: 'medium' as const
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
      case 'high': return 'text-red-600'
      case 'medium': return 'text-amber-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
        {/* Vintage Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header Vintage */}
          <div className="text-center mb-12">
            <div className="inline-block p-8 bg-white/80 backdrop-blur-sm border-4 border-amber-600 shadow-lg">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Coffee className="h-8 w-8 text-amber-600" />
                <h1 className="text-4xl font-bold text-amber-800 font-serif">
                  Classificados ConfiLar
                </h1>
                <Music className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-xl text-amber-700 font-serif italic">
                Design Vintage & Retro
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Camera className="h-5 w-5 text-amber-600" />
                <Film className="h-5 w-5 text-amber-600" />
                <Radio className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Busca Vintage */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 h-5 w-5" />
                  <Input
                    placeholder="Buscar classificados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-white/80 border-2 border-amber-600 text-amber-800 placeholder-amber-600/60 font-serif focus:border-amber-800 focus:bg-white"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48 h-14 bg-white/80 border-2 border-amber-600 text-amber-800 font-serif">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-600">
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full lg:w-48 h-14 bg-white/80 border-2 border-amber-600 text-amber-800 font-serif">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-600">
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="price_low">Menor preço</SelectItem>
                  <SelectItem value="price_high">Maior preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estatísticas Vintage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-white/80 border-2 border-amber-600 shadow-lg text-center">
              <div className="text-3xl font-bold text-amber-800 mb-2 font-serif">{filteredListings.length}</div>
              <div className="text-amber-700 font-serif">Total de Classificados</div>
            </div>
            <div className="p-6 bg-white/80 border-2 border-orange-600 shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-800 mb-2 font-serif">
                {filteredListings.filter(l => l.ad_type === 'service_request').length}
              </div>
              <div className="text-orange-700 font-serif">Solicitações</div>
            </div>
            <div className="p-6 bg-white/80 border-2 border-red-600 shadow-lg text-center">
              <div className="text-3xl font-bold text-red-800 mb-2 font-serif">
                {filteredListings.filter(l => l.ad_type === 'service_offer').length}
              </div>
              <div className="text-red-700 font-serif">Ofertas</div>
            </div>
          </div>

          {/* Grid de Classificados Vintage */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div 
                key={listing.id} 
                className="p-6 bg-white/80 border-2 border-amber-600 shadow-lg hover:shadow-xl hover:border-amber-800 transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-amber-100 border border-amber-600">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.user_avatar_url} />
                      <AvatarFallback className="bg-amber-200 text-amber-800 font-serif">
                        {listing.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-800 text-lg mb-1 font-serif">
                      {listing.title}
                    </h3>
                    <p className="text-amber-700 font-serif">{listing.user_name}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className="p-3 bg-red-100 border border-red-600 hover:bg-red-200 transition-colors"
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        favorites.has(listing.id) ? 'fill-red-600 text-red-600' : 'text-red-600/60'
                      }`} 
                    />
                  </button>
                </div>

                {/* Descrição */}
                <p className="text-amber-700 mb-6 leading-relaxed font-serif">
                  {listing.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 text-xs font-serif border ${
                    listing.ad_type === 'service_request' 
                      ? 'border-blue-600 text-blue-800 bg-blue-100'
                      : 'border-green-600 text-green-800 bg-green-100'
                  }`}>
                    {listing.ad_type === 'service_request' ? 'Solicitação' : 'Oferta'}
                  </span>
                  <span className="px-3 py-1 text-xs font-serif border border-amber-600 text-amber-800 bg-amber-100">
                    {listing.category}
                  </span>
                  <span className={`px-3 py-1 text-xs font-serif border ${getUrgencyColor(listing.urgency)}`}>
                    {getUrgencyText(listing.urgency)}
                  </span>
                </div>

                {/* Preço */}
                {(listing.budget || listing.price) && (
                  <div className="mb-6">
                    <div className="text-2xl font-bold text-amber-800 font-serif">
                      R$ {(listing.budget || listing.price)?.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Localização e Data */}
                <div className="flex items-center gap-4 text-sm text-amber-700 mb-6 font-serif">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {listing.location_city}, {listing.location_state}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(listing.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Botão de Ação */}
                <button
                  onClick={() => openChat(listing.user_id)}
                  className="w-full py-4 bg-amber-600 text-white border-2 border-amber-800 hover:bg-amber-700 transition-colors font-serif font-bold"
                >
                  <MessageCircle className="h-5 w-5 mr-2 inline" />
                  Contatar
                </button>
              </div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block p-8 bg-white/80 border-2 border-amber-600 shadow-lg">
                <h3 className="text-xl font-bold text-amber-800 mb-2 font-serif">
                  Nenhum classificado encontrado
                </h3>
                <p className="text-amber-700 font-serif">
                  Tente ajustar os filtros ou criar um novo classificado.
                </p>
              </div>
            </div>
          )}

          {/* Call to Action Vintage */}
          <div className="mt-12 text-center">
            <button className="px-8 py-4 bg-amber-600 text-white border-2 border-amber-800 hover:bg-amber-700 transition-colors font-serif font-bold text-lg">
              <Plus className="h-6 w-6 mr-2 inline" />
              Criar Novo Classificado
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
