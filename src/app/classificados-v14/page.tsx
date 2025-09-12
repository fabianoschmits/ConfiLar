'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Plus, Search, MapPin, Calendar, MessageCircle, Star,
  DollarSign, Heart, Eye, Zap, Users, Sun, Waves
} from 'lucide-react'
import { services as servicesList } from '@/data/services'

interface TropicalListing {
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
  tropical_vibes?: 'beach' | 'jungle' | 'island' | 'paradise'
  exotic_level?: number
  beach_ready?: boolean
  island_style?: boolean
}

export default function ClassificadosV14Page() {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  // Estados principais
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest')
  const [island, setIsland] = useState<'hawaii' | 'bali' | 'maldives' | 'caribbean'>('hawaii')
  
  // Estados para dados
  const [listings, setListings] = useState<TropicalListing[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Cores tropicais para diferentes ilhas
  const islandColors = {
    'hawaii': 'from-orange-400 via-red-400 to-pink-400',
    'bali': 'from-green-400 via-emerald-400 to-teal-400',
    'maldives': 'from-blue-400 via-cyan-400 to-teal-400',
    'caribbean': 'from-yellow-400 via-orange-400 to-red-400'
  }

  const getIslandIcon = (island: string) => {
    switch (island) {
      case 'hawaii': return Waves
      case 'bali': return Sun
      case 'maldives': return Waves
      case 'caribbean': return Sun
      default: return Sun
    }
  }

  // Carregar dados
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
      const { data, error } = await supabase
        .from('classified_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao carregar anúncios:', error)
        setListings([])
        return
      }

      // Adicionar dados fictícios tropicais
      const tropicalListings: TropicalListing[] = (data || []).map(listing => ({
        ...listing,
        tropical_vibes: ['beach', 'jungle', 'island', 'paradise'][Math.floor(Math.random() * 4)] as 'beach' | 'jungle' | 'island' | 'paradise',
        exotic_level: Math.floor(Math.random() * 40) + 60, // 60-100
        beach_ready: Math.random() > 0.3,
        island_style: Math.random() > 0.4
      }))

      setListings(tropicalListings)
    } catch (error) {
      console.error('❌ Erro geral:', error)
      setListings([])
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
  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchTerm || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory
    
    return matchesSearch && matchesCategory
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

  // Funções utilitárias
  const formatPrice = (budget?: number, price?: number) => {
    const value = budget || price
    if (!value) return 'Preço a combinar'
    return `${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
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
      case 'high': return 'URGENTE'
      case 'medium': return 'NORMAL'
      case 'low': return 'BAIXA'
      default: return 'NORMAL'
    }
  }

  const getExoticColor = (level: number) => {
    if (level >= 90) return 'text-orange-600'
    if (level >= 80) return 'text-red-600'
    if (level >= 70) return 'text-yellow-600'
    return 'text-green-600'
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

  const handleFavorite = async (itemId: string) => {
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
          .eq('item_type', 'classified_ad')

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
            item_type: 'classified_ad'
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
  const renderTropicalCard = (listing: TropicalListing) => (
    <Card key={listing.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 hover:from-orange-100 hover:via-yellow-100 hover:to-red-100 overflow-hidden relative">
      {/* Efeito tropical no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200/10 via-yellow-200/10 to-red-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardContent className="p-6 relative z-10">
        {/* Header tropical */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-700 uppercase tracking-wider">
                  {listing.user_type === 'professional' ? 'OFERECENDO' : 'PROCURANDO'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  {listing.tropical_vibes?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <h3 className="font-bold text-xl text-gray-900 mb-4 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
              {listing.title}
            </h3>
            
            <p className="text-gray-700 text-sm line-clamp-2 mb-6 leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Badges tropicais */}
        <div className="flex flex-wrap gap-2 mb-6">
          {listing.beach_ready && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Waves className="h-3 w-3 mr-1" />
              BEACH READY
            </Badge>
          )}
          {listing.island_style && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Waves className="h-3 w-3 mr-1" />
              ISLAND STYLE
            </Badge>
          )}
          <Badge className={`${getUrgencyColor(listing.urgency)}`}>
            <Zap className="h-3 w-3 mr-1" />
            {getUrgencyLabel(listing.urgency)}
          </Badge>
        </div>

        {/* Informações tropicais */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-700">{listing.location_city}, {listing.location_state}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-700">{new Date(listing.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          
          {(listing.budget || listing.price) && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <span className="text-red-700 font-semibold">{formatPrice(listing.budget, listing.price)}</span>
            </div>
          )}
        </div>

        {/* Barra de exotismo */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Nível Exótico</span>
            <span className={`text-sm font-bold ${getExoticColor(listing.exotic_level || 0)}`}>
              {listing.exotic_level}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${listing.exotic_level || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Footer tropical */}
        <div className="border-t border-orange-200 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 ring-2 ring-orange-300">
                <AvatarImage src={listing.user_avatar_url || ''} />
                <AvatarFallback className="text-sm bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold">
                  {listing.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-gray-900 text-sm">{listing.user_name}</p>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">4.9 (89)</span>
                  <Sun className="h-3 w-3 text-orange-500" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {user && listing.user_id !== user.id && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFavorite(listing.id)}
                    className={`h-10 w-10 p-0 rounded-full transition-all duration-300 ${
                      favorites.has(listing.id) 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(listing.id) ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleChat(listing.user_id, listing.user_name)}
                    className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleViewProfile(listing.user_id)}
                className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-300"
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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 animate-pulse rounded-full bg-orange-500/20 blur-xl"></div>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Preparando o paraíso...</h2>
            <p className="text-gray-600">Coletando as melhores ondas</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const IslandIcon = getIslandIcon(island)

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
        {/* Background tropical */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 via-yellow-100/30 to-red-100/30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ea580c%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        {/* Header tropical */}
        <div className="relative z-10 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${islandColors[island]} opacity-10`}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <IslandIcon className="h-12 w-12 text-orange-600 animate-pulse" />
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-yellow-600 to-red-600 drop-shadow-lg">
                  TROPICAL
                </h1>
                <Sun className="h-12 w-12 text-yellow-600 animate-pulse" />
              </div>
              
              <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
                Conecte-se com profissionais que trazem o calor e a energia das ilhas tropicais
              </p>
              
              {/* Estatísticas tropicais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
                  <div className="text-sm text-orange-700">Profissionais</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sun className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{filteredListings.length}</div>
                  <div className="text-sm text-yellow-700">Serviços Tropicais</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-red-200 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{favorites.size}</div>
                  <div className="text-sm text-red-700">Favoritos</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Waves className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-orange-700">Tropical</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Barra de busca tropical */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-orange-200 p-6 mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 h-5 w-5" />
                  <Input
                    placeholder="Buscar serviços tropicais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-orange-50/50 border-orange-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Filtros tropicais */}
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-14 px-4 bg-orange-50/50 border border-orange-200 text-gray-900 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-orange-400"
                >
                  <option value="all">Todas as categorias</option>
                  {servicesList.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_low' | 'price_high' | 'rating')}
                  className="h-14 px-4 bg-orange-50/50 border border-orange-200 text-gray-900 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-orange-400"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="price_low">Menor preço</option>
                  <option value="price_high">Maior preço</option>
                  <option value="rating">Mais tropical</option>
                </select>

                <select
                  value={island}
                  onChange={(e) => setIsland(e.target.value as 'hawaii' | 'bali' | 'maldives' | 'caribbean')}
                  className="h-14 px-4 bg-orange-50/50 border border-orange-200 text-gray-900 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-orange-400"
                >
                  <option value="hawaii">Havaí</option>
                  <option value="bali">Bali</option>
                  <option value="maldives">Maldivas</option>
                  <option value="caribbean">Caribe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão criar tropical */}
          <div className="text-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-10 py-5 text-xl rounded-xl shadow-xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105">
              <Plus className="h-6 w-6 mr-3" />
              Criar Paraíso
              <Sun className="h-6 w-6 ml-3" />
            </Button>
          </div>

          {/* Grid tropical */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map(renderTropicalCard)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sun className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                {listings.length === 0 ? 'Nenhum serviço tropical encontrado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {listings.length === 0 
                  ? 'Seja o primeiro a criar um paraíso!'
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

