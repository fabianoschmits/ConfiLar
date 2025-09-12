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
  TrendingUp, Award, Shield, Clock, Eye, Terminal,
  Cpu, Wifi, Battery, Activity
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

export default function ClassificadosCyberpunkPage() {
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
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-cyan-400'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'CRÍTICO'
      case 'medium': return 'MÉDIO'
      case 'low': return 'BAIXO'
      default: return 'NORMAL'
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
        <div className="min-h-screen bg-black">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-cyan-400/30"></div>
            ))}
          </div>
        </div>

        {/* Animated Lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse"></div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header Cyberpunk */}
          <div className="text-center mb-12">
            <div className="inline-block p-8 border-2 border-cyan-400 bg-black/50 backdrop-blur-sm">
              <h1 className="text-4xl font-bold text-cyan-400 mb-4 font-mono tracking-wider">
                &gt; CLASSIFICADOS_CONFILAR.EXE
              </h1>
              <p className="text-xl text-pink-400 font-mono">
                CYBERPUNK_INTERFACE_v2.0
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Terminal className="h-6 w-6 text-cyan-400" />
                <Cpu className="h-6 w-6 text-pink-400" />
                <Wifi className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          {/* Busca Cyberpunk */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5" />
                  <Input
                    placeholder="SCAN_FOR_CLASSIFICADOS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-black/50 border-2 border-cyan-400 text-cyan-400 placeholder-cyan-400/60 font-mono focus:border-pink-400 focus:text-pink-400"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48 h-14 bg-black/50 border-2 border-cyan-400 text-cyan-400 font-mono">
                  <SelectValue placeholder="CATEGORY" />
                </SelectTrigger>
                <SelectContent className="bg-black border-2 border-cyan-400">
                  <SelectItem value="all">ALL_CATEGORIES</SelectItem>
                  <SelectItem value="tecnologia">TECHNOLOGY</SelectItem>
                  <SelectItem value="design">DESIGN</SelectItem>
                  <SelectItem value="marketing">MARKETING</SelectItem>
                  <SelectItem value="consultoria">CONSULTING</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full lg:w-48 h-14 bg-black/50 border-2 border-cyan-400 text-cyan-400 font-mono">
                  <SelectValue placeholder="SORT_BY" />
                </SelectTrigger>
                <SelectContent className="bg-black border-2 border-cyan-400">
                  <SelectItem value="newest">NEWEST</SelectItem>
                  <SelectItem value="price_low">LOW_PRICE</SelectItem>
                  <SelectItem value="price_high">HIGH_PRICE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estatísticas Cyberpunk */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 border-2 border-cyan-400 bg-black/50 backdrop-blur-sm text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2 font-mono">{filteredListings.length}</div>
              <div className="text-cyan-400/80 font-mono">TOTAL_LISTINGS</div>
            </div>
            <div className="p-6 border-2 border-pink-400 bg-black/50 backdrop-blur-sm text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2 font-mono">
                {filteredListings.filter(l => l.ad_type === 'service_request').length}
              </div>
              <div className="text-pink-400/80 font-mono">REQUESTS</div>
            </div>
            <div className="p-6 border-2 border-green-400 bg-black/50 backdrop-blur-sm text-center">
              <div className="text-3xl font-bold text-green-400 mb-2 font-mono">
                {filteredListings.filter(l => l.ad_type === 'service_offer').length}
              </div>
              <div className="text-green-400/80 font-mono">OFFERS</div>
            </div>
          </div>

          {/* Grid de Classificados Cyberpunk */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div 
                key={listing.id} 
                className="p-6 border-2 border-cyan-400 bg-black/50 backdrop-blur-sm hover:border-pink-400 hover:bg-black/70 transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 border border-cyan-400 bg-black/30">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.user_avatar_url} />
                      <AvatarFallback className="bg-cyan-400/20 text-cyan-400 font-mono">
                        {listing.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-cyan-400 text-lg mb-1 font-mono">
                      {listing.title.toUpperCase()}
                    </h3>
                    <p className="text-pink-400 font-mono">{listing.user_name.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className="p-3 border border-red-400 bg-black/30 hover:bg-red-400/20 transition-all duration-300"
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        favorites.has(listing.id) ? 'fill-red-400 text-red-400' : 'text-red-400/60'
                      }`} 
                    />
                  </button>
                </div>

                {/* Descrição */}
                <p className="text-cyan-400/80 mb-6 leading-relaxed font-mono text-sm">
                  {listing.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 text-xs font-mono border ${
                    listing.ad_type === 'service_request' 
                      ? 'border-blue-400 text-blue-400 bg-blue-400/10'
                      : 'border-green-400 text-green-400 bg-green-400/10'
                  }`}>
                    {listing.ad_type === 'service_request' ? 'REQUEST' : 'OFFER'}
                  </span>
                  <span className="px-3 py-1 text-xs font-mono border border-yellow-400 text-yellow-400 bg-yellow-400/10">
                    {listing.category.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs font-mono border ${getUrgencyColor(listing.urgency)}`}>
                    {getUrgencyText(listing.urgency)}
                  </span>
                </div>

                {/* Preço */}
                {(listing.budget || listing.price) && (
                  <div className="mb-6">
                    <div className="text-2xl font-bold text-pink-400 font-mono">
                      ₿ {(listing.budget || listing.price)?.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Localização e Data */}
                <div className="flex items-center gap-4 text-sm text-cyan-400/70 mb-6 font-mono">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {listing.location_city.toUpperCase()}, {listing.location_state}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(listing.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Botão de Ação */}
                <button
                  onClick={() => openChat(listing.user_id)}
                  className="w-full py-4 border-2 border-pink-400 bg-black/30 text-pink-400 hover:bg-pink-400 hover:text-black transition-all duration-300 font-mono font-bold"
                >
                  <MessageCircle className="h-5 w-5 mr-2 inline" />
                  INITIATE_CONTACT
                </button>
              </div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block p-8 border-2 border-red-400 bg-black/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-red-400 mb-2 font-mono">
                  NO_LISTINGS_FOUND
                </h3>
                <p className="text-red-400/80 font-mono">
                  ADJUST_FILTERS_OR_CREATE_NEW_LISTING
                </p>
              </div>
            </div>
          )}

          {/* Call to Action Cyberpunk */}
          <div className="mt-12 text-center">
            <button className="px-8 py-4 border-2 border-green-400 bg-black/30 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-300 font-mono font-bold text-lg">
              <Plus className="h-6 w-6 mr-2 inline" />
              CREATE_NEW_LISTING
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
