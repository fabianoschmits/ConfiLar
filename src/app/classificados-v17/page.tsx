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
  DollarSign, Heart, Eye, Zap, Users, Skull,
  Flame
} from 'lucide-react'
import { services as servicesList } from '@/data/services'

interface NeonPunkListing {
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
  punk_level?: 'poser' | 'punk' | 'hardcore' | 'anarchist'
  neon_power?: number
  underground?: boolean
  rebellious?: boolean
}

export default function ClassificadosV17Page() {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  // Estados principais
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest')
  const [scene, setScene] = useState<'underground' | 'street' | 'club' | 'riot'>('underground')
  
  // Estados para dados
  const [listings, setListings] = useState<NeonPunkListing[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Cores neon punk para diferentes cenas
  const sceneColors = {
    'underground': 'from-purple-500 via-pink-500 to-red-500',
    'street': 'from-green-500 via-cyan-500 to-blue-500',
    'club': 'from-yellow-500 via-orange-500 to-red-500',
    'riot': 'from-red-500 via-pink-500 to-purple-500'
  }

  const getSceneIcon = (scene: string) => {
    switch (scene) {
      case 'underground': return Skull
      case 'street': return Flame
      case 'club': return Zap
      case 'riot': return Zap
      default: return Skull
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

      // Adicionar dados fictícios neon punk
      const neonPunkListings: NeonPunkListing[] = (data || []).map(listing => ({
        ...listing,
        punk_level: ['poser', 'punk', 'hardcore', 'anarchist'][Math.floor(Math.random() * 4)] as 'poser' | 'punk' | 'hardcore' | 'anarchist',
        neon_power: Math.floor(Math.random() * 40) + 60, // 60-100
        underground: Math.random() > 0.3,
        rebellious: Math.random() > 0.4
      }))

      setListings(neonPunkListings)
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
      case 'high': return 'bg-red-900/50 text-red-400 border-red-500/50'
      case 'medium': return 'bg-yellow-900/50 text-yellow-400 border-yellow-500/50'
      case 'low': return 'bg-green-900/50 text-green-400 border-green-500/50'
      default: return 'bg-gray-900/50 text-gray-400 border-gray-500/50'
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'EXTREME'
      case 'medium': return 'NORMAL'
      case 'low': return 'CHILL'
      default: return 'NORMAL'
    }
  }

  const getPunkLevelColor = (level: string) => {
    switch (level) {
      case 'anarchist': return 'text-red-400'
      case 'hardcore': return 'text-pink-400'
      case 'punk': return 'text-purple-400'
      case 'poser': return 'text-gray-400'
      default: return 'text-gray-400'
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
  const renderNeonPunkCard = (listing: NeonPunkListing) => (
    <Card key={listing.id} className="group hover:shadow-2xl transition-all duration-500 border border-purple-500/20 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 hover:from-gray-800 hover:via-purple-800 hover:to-pink-800 overflow-hidden relative">
      {/* Efeito neon punk no hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardContent className="p-6 relative z-10">
        {/* Header neon punk */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Skull className="h-5 w-5 text-purple-400" />
                <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                  {listing.user_type === 'professional' ? 'RADICAL' : 'REBELDE'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-pink-400" />
                <span className="text-sm font-medium text-pink-400">
                  {listing.punk_level?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <h3 className="font-bold text-xl text-white mb-4 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
              {listing.title}
            </h3>
            
            <p className="text-gray-300 text-sm line-clamp-2 mb-6 leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Badges neon punk */}
        <div className="flex flex-wrap gap-2 mb-6">
          {listing.underground && (
            <Badge className="bg-purple-900/50 text-purple-300 border-purple-500/50">
              <Skull className="h-3 w-3 mr-1" />
              UNDERGROUND
            </Badge>
          )}
          {listing.rebellious && (
            <Badge className="bg-pink-900/50 text-pink-300 border-pink-500/50">
              <Zap className="h-3 w-3 mr-1" />
              REBELLIOUS
            </Badge>
          )}
          <Badge className={`${getUrgencyColor(listing.urgency)}`}>
            <Zap className="h-3 w-3 mr-1" />
            {getUrgencyLabel(listing.urgency)}
          </Badge>
        </div>

        {/* Informações neon punk */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-300">{listing.location_city}, {listing.location_state}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-300">{new Date(listing.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          
          {(listing.budget || listing.price) && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <span className="text-pink-300 font-semibold">{formatPrice(listing.budget, listing.price)}</span>
            </div>
          )}
        </div>

        {/* Barra de neon power */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Neon Power</span>
            <span className={`text-sm font-bold ${getPunkLevelColor(listing.punk_level || 'poser')}`}>
              {listing.neon_power}/100
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${listing.neon_power || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Footer neon punk */}
        <div className="border-t border-purple-500/20 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 ring-2 ring-purple-500/50">
                <AvatarImage src={listing.user_avatar_url || ''} />
                <AvatarFallback className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                  {listing.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-white text-sm">{listing.user_name}</p>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-400">4.9 (89)</span>
                  <Skull className="h-3 w-3 text-purple-400" />
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
                        ? 'text-pink-400 bg-pink-900/20 hover:bg-pink-900/30' 
                        : 'text-gray-400 hover:text-pink-400 hover:bg-pink-900/20'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(listing.id) ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleChat(listing.user_id, listing.user_name)}
                    className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-purple-400 hover:bg-purple-900/20 transition-all duration-300"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleViewProfile(listing.user_id)}
                className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-all duration-300"
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center relative overflow-hidden">
          {/* Efeitos visuais de fundo */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-400 rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-400 rounded-full animate-pulse delay-1500"></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-xl"></div>
            </div>
            <h2 className="text-2xl font-medium text-white mb-2">Inicializando rebelião...</h2>
            <p className="text-gray-300">Preparando o caos</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const SceneIcon = getSceneIcon(scene)

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Background neon punk */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-purple-900/90 to-pink-900/90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
        
        {/* Header neon punk */}
        <div className="relative z-10 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${sceneColors[scene]} opacity-10`}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <SceneIcon className="h-12 w-12 text-purple-400 animate-pulse" />
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 drop-shadow-lg">
                  NEON PUNK
                </h1>
                <Skull className="h-12 w-12 text-pink-400 animate-pulse" />
              </div>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Conecte-se com rebeldes e punks que quebram as regras com estilo neon
              </p>
              
              {/* Estatísticas neon punk */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{listings.length}</div>
                  <div className="text-sm text-purple-400">Rebeldes</div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/20 shadow-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Skull className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{filteredListings.length}</div>
                  <div className="text-sm text-pink-400">Serviços Punk</div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 shadow-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{favorites.size}</div>
                  <div className="text-sm text-red-400">Favoritos</div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">∞</div>
                  <div className="text-sm text-purple-400">Caos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Barra de busca neon punk */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 mb-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar rebeldes e punks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:bg-gray-700/50 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Filtros neon punk */}
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-14 px-4 bg-gray-800/50 border border-purple-500/30 text-white rounded-xl focus:bg-gray-700/50 focus:border-purple-400 focus:ring-purple-400"
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
                  className="h-14 px-4 bg-gray-800/50 border border-purple-500/30 text-white rounded-xl focus:bg-gray-700/50 focus:border-purple-400 focus:ring-purple-400"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="price_low">Menor preço</option>
                  <option value="price_high">Maior preço</option>
                  <option value="rating">Mais punk</option>
                </select>

                <select
                  value={scene}
                  onChange={(e) => setScene(e.target.value as 'underground' | 'street' | 'club' | 'riot')}
                  className="h-14 px-4 bg-gray-800/50 border border-purple-500/30 text-white rounded-xl focus:bg-gray-700/50 focus:border-purple-400 focus:ring-purple-400"
                >
                  <option value="underground">Underground</option>
                  <option value="street">Street</option>
                  <option value="club">Club</option>
                  <option value="riot">Riot</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão criar neon punk */}
          <div className="text-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-5 text-xl rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
              <Plus className="h-6 w-6 mr-3" />
              Criar Caos
              <Skull className="h-6 w-6 ml-3" />
            </Button>
          </div>

          {/* Grid neon punk */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map(renderNeonPunkCard)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Skull className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                {listings.length === 0 ? 'Nenhum rebelde encontrado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-300 max-w-md mx-auto">
                {listings.length === 0 
                  ? 'Seja o primeiro a criar caos!'
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

