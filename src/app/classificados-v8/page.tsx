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
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Bookmark,
  Share2,
  MoreHorizontal,
  Gamepad2,
  Trophy,
  Target,
  Sword,
  Shield as ShieldIcon,
  Crown,
  Flame,
  Skull,
  Crosshair,
  Joystick
} from 'lucide-react'
import { services as servicesList } from '@/data/services'

interface GamingListing {
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
  level?: number
  rank?: string
  kills?: number
  deaths?: number
  assists?: number
}

export default function ClassificadosV8Page() {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  // Estados principais
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest')
  const [gameMode, setGameMode] = useState<'casual' | 'ranked' | 'tournament'>('casual')
  
  // Estados para dados
  const [listings, setListings] = useState<GamingListing[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Cores neon para diferentes categorias
  const neonColors = {
    blue: 'from-blue-400 to-cyan-400',
    purple: 'from-purple-400 to-pink-400',
    green: 'from-green-400 to-emerald-400',
    orange: 'from-orange-400 to-red-400',
    yellow: 'from-yellow-400 to-orange-400',
    pink: 'from-pink-400 to-rose-400'
  }

  const getNeonColor = (category: string) => {
    const colors = Object.values(neonColors)
    const index = category.charCodeAt(0) % colors.length
    return colors[index]
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

      // Adicionar dados fictícios de gaming
      const gamingListings: GamingListing[] = (data || []).map(listing => ({
        ...listing,
        level: Math.floor(Math.random() * 100) + 1,
        rank: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'][Math.floor(Math.random() * 7)],
        kills: Math.floor(Math.random() * 1000) + 100,
        deaths: Math.floor(Math.random() * 500) + 50,
        assists: Math.floor(Math.random() * 800) + 100
      }))

      setListings(gamingListings)
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
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
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

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Bronze': return 'text-orange-400'
      case 'Silver': return 'text-gray-300'
      case 'Gold': return 'text-yellow-400'
      case 'Platinum': return 'text-blue-400'
      case 'Diamond': return 'text-cyan-400'
      case 'Master': return 'text-purple-400'
      case 'Grandmaster': return 'text-pink-400'
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
  const renderGamingCard = (listing: GamingListing) => (
    <Card key={listing.id} className="group hover:scale-105 transition-all duration-500 border-0 bg-black/80 backdrop-blur-sm hover:bg-black/90 overflow-hidden relative">
      {/* Efeito neon no hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getNeonColor(listing.category)} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}></div>
      
      {/* Borda neon */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getNeonColor(listing.category)} opacity-0 group-hover:opacity-50 transition-opacity duration-500`} style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)'
      }}></div>
      
      <CardContent className="p-6 relative z-10">
        {/* Header gaming */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Gamepad2 className={`h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r ${getNeonColor(listing.category)}`} />
                <span className={`text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r ${getNeonColor(listing.category)} uppercase tracking-wider`}>
                  {listing.user_type === 'professional' ? 'BOOSTING' : 'LOOKING FOR'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className={`text-sm font-bold ${getRankColor(listing.rank || 'Bronze')}`}>
                  {listing.rank} LVL {listing.level}
                </span>
              </div>
            </div>
            
            <h3 className={`font-bold text-xl text-white mb-4 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${getNeonColor(listing.category)} transition-all duration-300`}>
              {listing.title}
            </h3>
            
            <p className="text-gray-300 text-sm line-clamp-2 mb-6 leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Stats gaming */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-green-400 font-bold text-lg">{listing.kills}</span>
            </div>
            <span className="text-xs text-gray-400">KILLS</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Skull className="h-4 w-4 text-red-400" />
              <span className="text-red-400 font-bold text-lg">{listing.deaths}</span>
            </div>
            <span className="text-xs text-gray-400">DEATHS</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Crosshair className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-bold text-lg">{listing.assists}</span>
            </div>
            <span className="text-xs text-gray-400">ASSISTS</span>
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-gray-300">{listing.location_city}, {listing.location_state}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-gray-300">{new Date(listing.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          
          {(listing.budget || listing.price) && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-green-400 font-bold">{formatPrice(listing.budget, listing.price)}</span>
            </div>
          )}
        </div>

        {/* Urgência neon */}
        <div className="mb-6">
          <Badge className={`text-xs font-bold px-3 py-1 rounded-lg border ${getUrgencyColor(listing.urgency)} shadow-lg`}>
            <Zap className="h-3 w-3 mr-1" />
            {getUrgencyLabel(listing.urgency)}
          </Badge>
        </div>

        {/* Footer gaming */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 ring-2 ring-purple-500/50">
                <AvatarImage src={listing.user_avatar_url || ''} />
                <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                  {listing.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-white text-sm">{listing.user_name}</p>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-400">4.9 (127)</span>
                  <Crown className="h-3 w-3 text-yellow-400" />
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
                    className={`h-10 w-10 p-0 rounded-lg transition-all duration-300 ${
                      favorites.has(listing.id) 
                        ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
                        : 'text-gray-400 hover:text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(listing.id) ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleChat(listing.user_id, listing.user_name)}
                    className="h-10 w-10 p-0 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 transition-all duration-300"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleViewProfile(listing.user_id)}
                className="h-10 w-10 p-0 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-300"
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
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-xl"></div>
            </div>
            <h2 className="text-xl font-medium text-white mb-2">Carregando Arena...</h2>
            <p className="text-gray-400">Preparando a batalha</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background gaming */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Header gaming */}
        <div className="relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Gamepad2 className="h-12 w-12 text-purple-400 animate-pulse" />
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 drop-shadow-2xl">
                  GAMING ARENA
                </h1>
                <Joystick className="h-12 w-12 text-blue-400 animate-pulse" />
              </div>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 drop-shadow-md">
                Encontre parceiros de equipe, boosters e oportunidades de gaming profissional
              </p>
              
              {/* Estatísticas gaming */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{listings.length}</div>
                  <div className="text-sm text-purple-300">Gamers Online</div>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{filteredListings.length}</div>
                  <div className="text-sm text-blue-300">Missões Ativas</div>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{favorites.size}</div>
                  <div className="text-sm text-green-300">Favoritos</div>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-yellow-300">Arena Online</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Barra de busca gaming */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 mb-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar gamers, boosters, equipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Filtros gaming */}
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-14 px-4 bg-black/50 border border-purple-500/30 text-white rounded-xl focus:border-purple-500 focus:ring-purple-500"
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
                  className="h-14 px-4 bg-black/50 border border-purple-500/30 text-white rounded-xl focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="price_low">Menor preço</option>
                  <option value="price_high">Maior preço</option>
                  <option value="rating">Melhor rank</option>
                </select>

                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value as 'casual' | 'ranked' | 'tournament')}
                  className="h-14 px-4 bg-black/50 border border-purple-500/30 text-white rounded-xl focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="casual">Casual</option>
                  <option value="ranked">Ranked</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão criar gaming */}
          <div className="text-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-5 text-xl rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
              <Plus className="h-6 w-6 mr-3" />
              Criar Missão
              <Sword className="h-6 w-6 ml-3" />
            </Button>
          </div>

          {/* Grid gaming */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map(renderGamingCard)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                {listings.length === 0 ? 'Nenhuma missão encontrada' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {listings.length === 0 
                  ? 'Seja o primeiro a criar uma missão!'
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

