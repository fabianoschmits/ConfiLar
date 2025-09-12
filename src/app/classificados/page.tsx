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
  Search, MapPin, Calendar, MessageCircle, Star, Clock, 
  Heart, Eye, Filter, SortAsc, Building2, Briefcase,
  Users, TrendingUp, Award, Shield, Zap, Plus, ArrowRight,
  DollarSign, CheckCircle, AlertTriangle, Info
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

export default function ClassificadosPage() {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest')
  const [listings, setListings] = useState<Listing[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

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
      // Usar as tabelas corretas que já existem no banco
      // Carregar service_requests (clientes procurando serviços)
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

      // Carregar service_listings (profissionais oferecendo serviços)
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
        console.error('Erro ao carregar dados:', requestsError || listingsError)
        // Usar dados mock se houver erro
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
        toast.info('Usando dados de demonstração. Verifique a configuração do banco de dados.')
        return
      }

      // Combinar os dados das duas tabelas
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
      toast.error('Erro ao carregar classificados. Verifique a configuração do banco de dados.')
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
        console.error('Erro ao carregar favoritos:', error)
        // Se a tabela service_favorites não existir, usar localStorage como fallback
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
        // Tentar remover do banco de dados
        const { error } = await supabase
          .from('service_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', listingId)

        if (error) {
          console.error('Erro ao remover favorito do banco:', error)
          // Fallback para localStorage
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
        // Tentar adicionar ao banco de dados
        const { error } = await supabase
          .from('service_favorites')
          .insert({
            user_id: user.id,
            service_id: listingId
          })

        if (error) {
          console.error('Erro ao adicionar favorito ao banco:', error)
          // Fallback para localStorage
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
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
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

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return AlertTriangle
      case 'medium': return Clock
      case 'low': return CheckCircle
      default: return Info
    }
  }

  // Filtrar e ordenar dados
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

  // Separar em duas colunas
  const serviceRequests = filteredListings.filter(listing => listing.ad_type === 'service_request')
  const serviceOffers = filteredListings.filter(listing => listing.ad_type === 'service_offer')

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header com gradiente */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 mb-12">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 text-center text-white">
              <h1 className="text-5xl font-bold mb-4">
                Classificados ConfiLar
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Conecte-se com profissionais qualificados ou encontre clientes para seus serviços
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">{serviceRequests.length} Solicitações</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Briefcase className="h-5 w-5" />
                  <span className="font-medium">{serviceOffers.length} Ofertas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de filtros moderna */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar por título ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-56 h-12 border-gray-200">
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
                <SelectTrigger className="w-full lg:w-56 h-12 border-gray-200">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="price_low">Menor preço</SelectItem>
                  <SelectItem value="price_high">Maior preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Layout em duas colunas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* Coluna 1: Clientes Procurando Serviços */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Clientes Procurando Serviços
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {serviceRequests.length} solicitações disponíveis
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {serviceRequests.map((listing, index) => {
                  const UrgencyIcon = getUrgencyIcon(listing.urgency)
                  return (
                    <div 
                      key={listing.id} 
                      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Barra lateral colorida */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                      
                      <div className="p-6 pl-8">
                        {/* Header do item */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                              <AvatarImage src={listing.user_avatar_url} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                {listing.user_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {listing.title}
                              </h3>
                              <p className="text-gray-600 font-medium">{listing.user_name}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(listing.id)}
                            className="hover:bg-red-50"
                          >
                            <Heart 
                              className={`h-5 w-5 ${
                                favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                              }`} 
                            />
                          </Button>
                        </div>

                        {/* Descrição */}
                        <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
                          {listing.description}
                        </p>

                        {/* Tags e informações */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                            {listing.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{listing.location_city}, {listing.location_state}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{new Date(listing.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Footer com urgência e ações */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getUrgencyColor(listing.urgency)}`}>
                              <UrgencyIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{getUrgencyText(listing.urgency)}</span>
                            </div>
                            {listing.budget && (
                              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm font-medium">R$ {listing.budget.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium"
                            onClick={() => openChat(listing.user_id)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contatar
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {serviceRequests.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Nenhuma solicitação encontrada
                    </h3>
                    <p className="text-gray-600">
                      Não há solicitações de serviços no momento.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 2: Profissionais Oferecendo Serviços */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-green-100 rounded-2xl">
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Profissionais Oferecendo Serviços
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {serviceOffers.length} ofertas disponíveis
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {serviceOffers.map((listing, index) => {
                  const UrgencyIcon = getUrgencyIcon(listing.urgency)
                  return (
                    <div 
                      key={listing.id} 
                      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Barra lateral colorida */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500"></div>
                      
                      <div className="p-6 pl-8">
                        {/* Header do item */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 ring-2 ring-green-100">
                              <AvatarImage src={listing.user_avatar_url} />
                              <AvatarFallback className="bg-green-100 text-green-600 font-semibold">
                                {listing.user_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                {listing.title}
                              </h3>
                              <p className="text-gray-600 font-medium">{listing.user_name}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(listing.id)}
                            className="hover:bg-red-50"
                          >
                            <Heart 
                              className={`h-5 w-5 ${
                                favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                              }`} 
                            />
                          </Button>
                        </div>

                        {/* Descrição */}
                        <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
                          {listing.description}
                        </p>

                        {/* Tags e informações */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                            {listing.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{listing.location_city}, {listing.location_state}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{new Date(listing.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Footer com urgência e ações */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getUrgencyColor(listing.urgency)}`}>
                              <UrgencyIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{getUrgencyText(listing.urgency)}</span>
                            </div>
                            {listing.price && (
                              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm font-medium">R$ {listing.price.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl font-medium"
                            onClick={() => openChat(listing.user_id)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contatar
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {serviceOffers.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Nenhuma oferta encontrada
                    </h3>
                    <p className="text-gray-600">
                      Não há ofertas de serviços no momento.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Pronto para conectar?</h3>
              <p className="text-lg opacity-90 mb-6">
                Crie seu próprio classificado e encontre os melhores profissionais ou clientes
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
              >
                <Plus className="h-6 w-6 mr-2" />
                Criar Novo Classificado
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}