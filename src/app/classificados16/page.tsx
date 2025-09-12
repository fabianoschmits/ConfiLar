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
  TrendingUp, Award, Shield, Clock, Eye, Rocket,
  Satellite, Atom, Orbit, Layers
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

export default function ClassificadosFuturisticPage() {
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
      default: return 'text-blue-400'
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Futuristic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="border border-blue-400/20"></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header Futurista */}
          <div className="text-center mb-12">
            <div className="inline-block p-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-400/30 rounded-2xl">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Rocket className="h-8 w-8 text-blue-400" />
                <h1 className="text-4xl font-bold text-white font-mono tracking-wider">
                  CLASSIFICADOS_CONFILAR
                </h1>
                <Satellite className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-xl text-blue-300 font-mono">
                FUTURISTIC_INTERFACE_v3.0
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Atom className="h-5 w-5 text-blue-400" />
                <Orbit className="h-5 w-5 text-purple-400" />
                <Layers className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Busca Futurista */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                  <Input
                    placeholder="SCAN_CLASSIFICADOS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-slate-800/50 border border-blue-400/50 text-blue-300 placeholder-blue-400/60 font-mono focus:border-purple-400 focus:text-purple-300 backdrop-blur-sm"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48 h-14 bg-slate-800/50 border border-blue-400/50 text-blue-300 font-mono backdrop-blur-sm">
                  <SelectValue placeholder="CATEGORY" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border border-blue-400/50">
                  <SelectItem value="all">ALL_CATEGORIES</SelectItem>
                  <SelectItem value="tecnologia">TECHNOLOGY</SelectItem>
                  <SelectItem value="design">DESIGN</SelectItem>
                  <SelectItem value="marketing">MARKETING</SelectItem>
                  <SelectItem value="consultoria">CONSULTING</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full lg:w-48 h-14 bg-slate-800/50 border border-blue-400/50 text-blue-300 font-mono backdrop-blur-sm">
                  <SelectValue placeholder="SORT_BY" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border border-blue-400/50">
                  <SelectItem value="newest">NEWEST</SelectItem>
                  <SelectItem value="price_low">LOW_PRICE</SelectItem>
                  <SelectItem value="price_high">HIGH_PRICE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estatísticas Futuristas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 backdrop-blur-sm text-center rounded-xl">
              <div className="text-3xl font-bold text-blue-300 mb-2 font-mono">{filteredListings.length}</div>
              <div className="text-blue-400 font-mono">TOTAL_LISTINGS</div>
            </div>
            <div className="p-6 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 backdrop-blur-sm text-center rounded-xl">
              <div className="text-3xl font-bold text-purple-300 mb-2 font-mono">
                {filteredListings.filter(l => l.ad_type === 'service_request').length}
              </div>
              <div className="text-purple-400 font-mono">REQUESTS</div>
            </div>
            <div className="p-6 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-400/30 backdrop-blur-sm text-center rounded-xl">
              <div className="text-3xl font-bold text-cyan-300 mb-2 font-mono">
                {filteredListings.filter(l => l.ad_type === 'service_offer').length}
              </div>
              <div className="text-cyan-400 font-mono">OFFERS</div>
            </div>
          </div>

          {/* Grid de Classificados Futuristas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div 
                key={listing.id} 
                className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-400/30 backdrop-blur-sm hover:border-purple-400/50 hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300 group rounded-xl"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.user_avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 font-mono">
                        {listing.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1 font-mono">
                      {listing.title.toUpperCase()}
                    </h3>
                    <p className="text-blue-300 font-mono">{listing.user_name.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 hover:border-red-400/50 transition-all duration-300 rounded-lg"
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        favorites.has(listing.id) ? 'fill-red-400 text-red-400' : 'text-red-400/60'
                      }`} 
                    />
                  </button>
                </div>

                {/* Descrição */}
                <p className="text-blue-200/80 mb-6 leading-relaxed font-mono text-sm">
                  {listing.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 text-xs font-mono border rounded ${
                    listing.ad_type === 'service_request' 
                      ? 'border-blue-400 text-blue-300 bg-blue-500/20'
                      : 'border-green-400 text-green-300 bg-green-500/20'
                  }`}>
                    {listing.ad_type === 'service_request' ? 'REQUEST' : 'OFFER'}
                  </span>
                  <span className="px-3 py-1 text-xs font-mono border border-purple-400 text-purple-300 bg-purple-500/20 rounded">
                    {listing.category.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs font-mono border rounded ${getUrgencyColor(listing.urgency)}`}>
                    {getUrgencyText(listing.urgency)}
                  </span>
                </div>

                {/* Preço */}
                {(listing.budget || listing.price) && (
                  <div className="mb-6">
                    <div className="text-2xl font-bold text-cyan-300 font-mono">
                      ₿ {(listing.budget || listing.price)?.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Localização e Data */}
                <div className="flex items-center gap-4 text-sm text-blue-300/70 mb-6 font-mono">
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
                  className="w-full py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/50 text-blue-300 hover:border-purple-400/50 hover:text-purple-300 transition-all duration-300 font-mono font-bold backdrop-blur-sm rounded-lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2 inline" />
                  INITIATE_CONTACT
                </button>
              </div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block p-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-blue-400/30 backdrop-blur-sm rounded-xl">
                <h3 className="text-xl font-bold text-blue-300 mb-2 font-mono">
                  NO_LISTINGS_FOUND
                </h3>
                <p className="text-blue-400/80 font-mono">
                  ADJUST_FILTERS_OR_CREATE_NEW_LISTING
                </p>
              </div>
            </div>
          )}

          {/* Call to Action Futurista */}
          <div className="mt-12 text-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/50 text-blue-300 hover:border-purple-400/50 hover:text-purple-300 transition-all duration-300 font-mono font-bold text-lg backdrop-blur-sm rounded-xl">
              <Plus className="h-6 w-6 mr-2 inline" />
              CREATE_NEW_LISTING
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
