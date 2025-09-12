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
  DollarSign, Clock, Heart, Eye, Zap, Shield, Award,
  TrendingUp, Users, Sparkles, Filter, SortAsc, Grid3X3,
  List, Bookmark, Share2, MoreHorizontal, Diamond,
  Gem, Lightbulb, Sun, Moon, Cloud, Wind, Waves,
  Mountain, TreePine, Flower, Leaf, Sparkle, Crown, Circle
} from 'lucide-react'
import { services as servicesList } from '@/data/services'

interface GlassmorphismListing {
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
  clarity_level?: 'crystal' | 'diamond' | 'gem' | 'precious'
  transparency?: boolean
  refraction?: boolean
  premium_quality?: boolean
}

export default function ClassificadosV13Page() {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  // Estados principais
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest')
  const [crystal, setCrystal] = useState<'diamond' | 'emerald' | 'sapphire' | 'ruby'>('diamond')
  
  // Estados para dados
  const [listings, setListings] = useState<GlassmorphismListing[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Cores de cristal para diferentes tipos
  const crystalColors = {
    'diamond': 'from-white via-blue-100 to-cyan-100',
    'emerald': 'from-green-100 via-emerald-100 to-teal-100',
    'sapphire': 'from-blue-100 via-indigo-100 to-purple-100',
    'ruby': 'from-red-100 via-pink-100 to-rose-100'
  }

  const getCrystalIcon = (crystal: string) => {
    switch (crystal) {
      case 'diamond': return Diamond
      case 'emerald': return Gem
      case 'sapphire': return Diamond
      case 'ruby': return Gem
      default: return Diamond
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

      // Adicionar dados fictícios glassmorphism
      const glassmorphismListings: GlassmorphismListing[] = (data || []).map(listing => ({
        ...listing,
        clarity_level: ['crystal', 'diamond', 'gem', 'precious'][Math.floor(Math.random() * 4)] as 'crystal' | 'diamond' | 'gem' | 'precious',
        transparency: Math.random() > 0.2,
        refraction: Math.random() > 0.3,
        premium_quality: Math.random() > 0.4
      }))

      setListings(glassmorphismListings)
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
      case 'high': return 'bg-red-100/50 text-red-600 border-red-200/50'
      case 'medium': return 'bg-yellow-100/50 text-yellow-600 border-yellow-200/50'
      case 'low': return 'bg-green-100/50 text-green-600 border-green-200/50'
      default: return 'bg-gray-100/50 text-gray-600 border-gray-200/50'
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

  const getClarityColor = (level: string) => {
    switch (level) {
      case 'precious': return 'text-purple-600'
      case 'diamond': return 'text-blue-600'
      case 'gem': return 'text-green-600'
      case 'crystal': return 'text-gray-600'
      default: return 'text-gray-600'
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
  const renderGlassmorphismCard = (listing: GlassmorphismListing) => (
    <Card key={listing.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/10 backdrop-blur-lg hover:bg-white/20 overflow-hidden relative">
      {/* Efeito glassmorphism no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardContent className="p-6 relative z-10">
        {/* Header glassmorphism */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Diamond className="h-5 w-5 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                  {listing.user_type === 'professional' ? 'OFERECENDO' : 'PROCURANDO'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkle className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-600">
                  {listing.clarity_level?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <h3 className="font-bold text-xl text-gray-800 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
              {listing.title}
            </h3>
            
            <p className="text-gray-600 text-sm line-clamp-2 mb-6 leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Badges glassmorphism */}
        <div className="flex flex-wrap gap-2 mb-6">
          {listing.transparency && (
            <Badge className="bg-blue-100/50 text-blue-600 border-blue-200/50">
              <Circle className="h-3 w-3 mr-1" />
              TRANSPARENT
            </Badge>
          )}
          {listing.refraction && (
            <Badge className="bg-purple-100/50 text-purple-600 border-purple-200/50">
              <Sparkle className="h-3 w-3 mr-1" />
              REFRACTION
            </Badge>
          )}
          {listing.premium_quality && (
            <Badge className="bg-pink-100/50 text-pink-600 border-pink-200/50">
              <Crown className="h-3 w-3 mr-1" />
              PREMIUM
            </Badge>
          )}
          <Badge className={`${getUrgencyColor(listing.urgency)}`}>
            <Zap className="h-3 w-3 mr-1" />
            {getUrgencyLabel(listing.urgency)}
          </Badge>
        </div>

        {/* Informações glassmorphism */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-700">{listing.location_city}, {listing.location_state}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-gray-700">{new Date(listing.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          
          {(listing.budget || listing.price) && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-green-600 font-semibold">{formatPrice(listing.budget, listing.price)}</span>
            </div>
          )}
        </div>

        {/* Barra de clareza */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Nível de Clareza</span>
            <span className={`text-sm font-bold ${getClarityColor(listing.clarity_level || 'crystal')}`}>
              {listing.clarity_level?.toUpperCase()}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: listing.clarity_level === 'precious' ? '100%' : 
                       listing.clarity_level === 'diamond' ? '75%' : 
                       listing.clarity_level === 'gem' ? '50%' : '25%' 
              }}
            ></div>
          </div>
        </div>

        {/* Footer glassmorphism */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 ring-2 ring-white/30">
                <AvatarImage src={listing.user_avatar_url || ''} />
                <AvatarFallback className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                  {listing.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-gray-800 text-sm">{listing.user_name}</p>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">4.9 (89)</span>
                  <Diamond className="h-3 w-3 text-blue-500" />
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
                        ? 'text-pink-500 bg-pink-100/50 hover:bg-pink-100/70' 
                        : 'text-gray-400 hover:text-pink-500 hover:bg-pink-100/50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(listing.id) ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleChat(listing.user_id, listing.user_name)}
                    className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-100/50 transition-all duration-300"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleViewProfile(listing.user_id)}
                className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all duration-300"
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
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl"></div>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Cristalizando...</h2>
            <p className="text-gray-600">Preparando a transparência perfeita</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const CrystalIcon = getCrystalIcon(crystal)

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative overflow-hidden">
        {/* Background glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 via-purple-200/30 to-pink-200/30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        {/* Header glassmorphism */}
        <div className="relative z-10 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${crystalColors[crystal]} opacity-20`}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <CrystalIcon className="h-12 w-12 text-blue-600 animate-pulse" />
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg">
                  GLASSMORPHISM
                </h1>
                <Diamond className="h-12 w-12 text-purple-600 animate-pulse" />
              </div>
              
              <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
                Conecte-se com profissionais que brilham com transparência e clareza
              </p>
              
              {/* Estatísticas glassmorphism */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{listings.length}</div>
                  <div className="text-sm text-blue-600">Profissionais</div>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Diamond className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{filteredListings.length}</div>
                  <div className="text-sm text-purple-600">Serviços</div>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{favorites.size}</div>
                  <div className="text-sm text-pink-600">Favoritos</div>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">100%</div>
                  <div className="text-sm text-blue-600">Transparência</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Barra de busca glassmorphism */}
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 p-6 mb-8 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                  <Input
                    placeholder="Buscar serviços transparentes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-500 focus:bg-white/30 focus:border-white/50 focus:ring-white/50 rounded-xl backdrop-blur-sm"
                  />
                </div>
              </div>
              
              {/* Filtros glassmorphism */}
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-14 px-4 bg-white/20 border border-white/30 text-gray-900 rounded-xl focus:bg-white/30 focus:border-white/50 focus:ring-white/50 backdrop-blur-sm"
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
                  className="h-14 px-4 bg-white/20 border border-white/30 text-gray-900 rounded-xl focus:bg-white/30 focus:border-white/50 focus:ring-white/50 backdrop-blur-sm"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="price_low">Menor preço</option>
                  <option value="price_high">Maior preço</option>
                  <option value="rating">Mais transparente</option>
                </select>

                <select
                  value={crystal}
                  onChange={(e) => setCrystal(e.target.value as 'diamond' | 'emerald' | 'sapphire' | 'ruby')}
                  className="h-14 px-4 bg-white/20 border border-white/30 text-gray-900 rounded-xl focus:bg-white/30 focus:border-white/50 focus:ring-white/50 backdrop-blur-sm"
                >
                  <option value="diamond">Diamante</option>
                  <option value="emerald">Esmeralda</option>
                  <option value="sapphire">Safira</option>
                  <option value="ruby">Rubi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão criar glassmorphism */}
          <div className="text-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 text-xl rounded-xl shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
              <Plus className="h-6 w-6 mr-3" />
              Criar Transparência
              <Diamond className="h-6 w-6 ml-3" />
            </Button>
          </div>

          {/* Grid glassmorphism */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map(renderGlassmorphismCard)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Diamond className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                {listings.length === 0 ? 'Nenhum serviço transparente encontrado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {listings.length === 0 
                  ? 'Seja o primeiro a criar transparência!'
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

