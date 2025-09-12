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
  TrendingUp, Award, Shield, Clock, Eye, Square
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
      // Tentar carregar das tabelas principais primeiro
      let requestsData = null
      let listingsData = null
      
      try {
        // Carregar service_requests (clientes procurando serviços)
        const requestsResult = await supabase
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

        if (requestsResult.error) {
          console.warn('Tabela service_requests não encontrada ou erro:', requestsResult.error)
        } else {
          requestsData = requestsResult.data
        }
      } catch (error) {
        console.warn('Erro ao acessar service_requests:', error)
      }

      try {
        // Carregar service_listings (profissionais oferecendo serviços)
        const listingsResult = await supabase
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

        if (listingsResult.error) {
          console.warn('Tabela service_listings não encontrada ou erro:', listingsResult.error)
        } else {
          listingsData = listingsResult.data
        }
      } catch (error) {
        console.warn('Erro ao acessar service_listings:', error)
      }

      // Se ambas as tabelas falharam, usar dados mock
      if (!requestsData && !listingsData) {
        console.log('Usando dados mock para classificados')
        const mockListings: Listing[] = [
          {
            id: '1',
            user_id: 'user1',
            title: 'PRECISO DE ELETRICISTA URGENTE',
            description: 'Problema elétrico em casa, preciso resolver hoje mesmo. Orçamento até R$ 200.',
            category: 'Eletricista',
            location_state: 'SP',
            location_city: 'São Paulo',
            user_name: 'João Silva',
            user_type: 'client',
            created_at: new Date().toISOString(),
            is_active: true,
            views_count: 15,
            user_avatar_url: null,
            ad_type: 'service_request',
            budget: 200,
            urgency: 'high'
          },
          {
            id: '2',
            user_id: 'user2',
            title: 'SERVIÇOS DE PINTURA',
            description: 'Pintor profissional com 10 anos de experiência. Pintura residencial e comercial.',
            category: 'Pintor',
            location_state: 'RJ',
            location_city: 'Rio de Janeiro',
            user_name: 'Maria Santos',
            user_type: 'professional',
            created_at: new Date().toISOString(),
            is_active: true,
            views_count: 8,
            user_avatar_url: null,
            ad_type: 'service_offer',
            price: 50,
            urgency: 'low'
          },
          {
            id: '3',
            user_id: 'user3',
            title: 'ENCANADOR DISPONÍVEL',
            description: 'Serviços de encanamento 24h. Vazamentos, instalações e reparos.',
            category: 'Encanador',
            location_state: 'MG',
            location_city: 'Belo Horizonte',
            user_name: 'Pedro Costa',
            user_type: 'professional',
            created_at: new Date().toISOString(),
            is_active: true,
            views_count: 12,
            user_avatar_url: null,
            ad_type: 'service_offer',
            price: 80,
            urgency: 'medium'
          },
          {
            id: '4',
            user_id: 'user4',
            title: 'PROCURANDO DIARISTA',
            description: 'Preciso de diarista para limpeza semanal. Casa pequena, 2 quartos.',
            category: 'Diarista',
            location_state: 'RS',
            location_city: 'Porto Alegre',
            user_name: 'Ana Lima',
            user_type: 'client',
            created_at: new Date().toISOString(),
            is_active: true,
            views_count: 6,
            user_avatar_url: null,
            ad_type: 'service_request',
            budget: 150,
            urgency: 'low'
          },
          {
            id: '5',
            user_id: 'user5',
            title: 'MARCENEIRO ESPECIALIZADO',
            description: 'Móveis sob medida, reparos em madeira, restauração de móveis antigos.',
            category: 'Marceneiro',
            location_state: 'PR',
            location_city: 'Curitiba',
            user_name: 'Carlos Oliveira',
            user_type: 'professional',
            created_at: new Date().toISOString(),
            is_active: true,
            views_count: 20,
            user_avatar_url: null,
            ad_type: 'service_offer',
            price: 120,
            urgency: 'low'
          }
        ]
        setListings(mockListings)
        toast.info('USANDO DADOS DE DEMONSTRAÇÃO. VERIFIQUE A CONFIGURAÇÃO DO BANCO DE DADOS.')
        return
      }

      // Combinar dados das duas tabelas se disponíveis
      const requests = requestsData?.map(item => ({
        id: item.id,
        user_id: item.client_id,
        title: item.title || 'SERVIÇO SOLICITADO',
        description: item.description || 'Descrição não disponível',
        category: item.service_category_id || 'Geral',
        location_state: item.location_state || 'N/A',
        location_city: item.location_city || 'N/A',
        user_name: item.profiles?.full_name || 'Cliente',
        user_type: 'client' as const,
        created_at: item.created_at,
        is_active: item.is_active,
        views_count: item.views_count || 0,
        user_avatar_url: item.profiles?.avatar_url,
        ad_type: 'service_request' as const,
        budget: item.budget,
        urgency: item.urgency || 'medium' as const
      })) || []

      const offers = listingsData?.map(item => ({
        id: item.id,
        user_id: item.professional_id,
        title: item.title || 'SERVIÇO OFERECIDO',
        description: item.description || 'Descrição não disponível',
        category: item.service_category_id || 'Geral',
        location_state: item.location_state || 'N/A',
        location_city: item.location_city || 'N/A',
        user_name: item.profiles?.full_name || 'Profissional',
        user_type: 'professional' as const,
        created_at: item.created_at,
        is_active: item.is_active,
        views_count: item.views_count || 0,
        user_avatar_url: item.profiles?.avatar_url,
        ad_type: 'service_offer' as const,
        price: item.price_min,
        urgency: item.urgency || 'medium' as const
      })) || []

      setListings([...requests, ...offers])
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error)
      // Fallback para dados mock em caso de erro geral
      const mockListings: Listing[] = [
        {
          id: 'fallback1',
          user_id: 'fallback_user1',
          title: 'SISTEMA EM MANUTENÇÃO',
          description: 'Os dados estão sendo carregados. Tente novamente em alguns minutos.',
          category: 'Sistema',
          location_state: 'SP',
          location_city: 'São Paulo',
          user_name: 'Sistema',
          user_type: 'client',
          created_at: new Date().toISOString(),
          is_active: true,
          views_count: 0,
          user_avatar_url: null,
          ad_type: 'service_request',
          budget: 0,
          urgency: 'low'
        }
      ]
      setListings(mockListings)
      toast.error('ERRO AO CARREGAR CLASSIFICADOS. USANDO DADOS DE DEMONSTRAÇÃO.')
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
        console.warn('Erro ao carregar favoritos:', error)
        // Se a tabela service_favorites não existir, usar localStorage como fallback
        const localFavorites = localStorage.getItem('favorites')
        if (localFavorites) {
          try {
            const parsedFavorites = JSON.parse(localFavorites)
            setFavorites(new Set(parsedFavorites))
          } catch (parseError) {
            console.warn('Erro ao fazer parse dos favoritos do localStorage:', parseError)
            setFavorites(new Set())
          }
        } else {
          setFavorites(new Set())
        }
        return
      }

      const favoriteIds = new Set(data?.map(item => item.service_id) || [])
      setFavorites(favoriteIds)
    } catch (error) {
      console.warn('Erro geral ao carregar favoritos:', error)
      // Fallback para localStorage
      const localFavorites = localStorage.getItem('favorites')
      if (localFavorites) {
        try {
          const parsedFavorites = JSON.parse(localFavorites)
          setFavorites(new Set(parsedFavorites))
        } catch (parseError) {
          console.warn('Erro ao fazer parse dos favoritos do localStorage:', parseError)
          setFavorites(new Set())
        }
      } else {
        setFavorites(new Set())
      }
    }
  }

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast.error('FAÇA LOGIN PARA FAVORITAR')
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
        toast.success('REMOVIDO DOS FAVORITOS')
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
        toast.success('ADICIONADO AOS FAVORITOS')
      }
    } catch (error) {
      console.error('Erro geral ao alternar favorito:', error)
      toast.error('ERRO AO ATUALIZAR FAVORITOS')
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'URGENTE'
      case 'medium': return 'MÉDIO'
      case 'low': return 'BAIXO'
      default: return 'NORMAL'
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

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-yellow-400">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-yellow-400">
        <div className="container mx-auto px-4 py-8">
          {/* Header Brutalista */}
          <div className="text-center mb-12">
            <div className="inline-block p-8 bg-black text-yellow-400 border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h1 className="text-5xl font-black mb-4 tracking-wider">
                CLASSIFICADOS CONFILAR
              </h1>
              <p className="text-xl font-bold">
                DESIGN BRUTALISTA
              </p>
          </div>
        </div>

          {/* Busca Brutalista */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                  <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black h-6 w-6" />
                    <Input
                    placeholder="BUSCAR CLASSIFICADOS..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-16 bg-white text-black font-bold text-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48 h-16 bg-white text-black font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <SelectValue placeholder="CATEGORIA" />
                </SelectTrigger>
                <SelectContent className="bg-white border-4 border-black">
                  <SelectItem value="all">TODAS AS CATEGORIAS</SelectItem>
                  <SelectItem value="tecnologia">TECNOLOGIA</SelectItem>
                  <SelectItem value="design">DESIGN</SelectItem>
                  <SelectItem value="marketing">MARKETING</SelectItem>
                  <SelectItem value="consultoria">CONSULTORIA</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full lg:w-48 h-16 bg-white text-black font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <SelectValue placeholder="ORDENAR" />
                </SelectTrigger>
                <SelectContent className="bg-white border-4 border-black">
                  <SelectItem value="newest">MAIS RECENTES</SelectItem>
                  <SelectItem value="price_low">MENOR PREÇO</SelectItem>
                  <SelectItem value="price_high">MAIOR PREÇO</SelectItem>
                </SelectContent>
              </Select>
                          </div>
                        </div>

          {/* Estatísticas Brutalistas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-black text-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-4xl font-black mb-2">{filteredListings.length}</div>
              <div className="font-bold">TOTAL DE CLASSIFICADOS</div>
                          </div>
            <div className="p-6 bg-white text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-4xl font-black mb-2">
                {filteredListings.filter(l => l.ad_type === 'service_request').length}
                          </div>
              <div className="font-bold">SOLICITAÇÕES</div>
                          </div>
            <div className="p-6 bg-red-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-4xl font-black mb-2">
                {filteredListings.filter(l => l.ad_type === 'service_offer').length}
                        </div>
              <div className="font-bold">OFERTAS</div>
                              </div>
                            </div>
                            
          {/* Grid de Classificados Brutalistas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div 
                key={listing.id} 
                className="p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-black border-2 border-black">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.user_avatar_url} />
                      <AvatarFallback className="bg-yellow-400 text-black font-black">
                        {listing.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                            </div>
                  <div className="flex-1">
                    <h3 className="font-black text-black text-lg mb-1">
                      {listing.title.toUpperCase()}
                    </h3>
                    <p className="font-bold text-gray-700">{listing.user_name.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className="p-3 bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors"
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        favorites.has(listing.id) ? 'fill-white' : ''
                      }`} 
                    />
                  </button>
                </div>

                {/* Descrição */}
                <p className="text-black mb-6 leading-relaxed font-medium">
                  {listing.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 text-xs font-black border-2 border-black ${
                    listing.ad_type === 'service_request' 
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}>
                    {listing.ad_type === 'service_request' ? 'SOLICITAÇÃO' : 'OFERTA'}
                  </span>
                  <span className="px-3 py-1 text-xs font-black bg-yellow-400 text-black border-2 border-black">
                    {listing.category.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs font-black border-2 border-black ${getUrgencyColor(listing.urgency)}`}>
                    {getUrgencyText(listing.urgency)}
                            </span>
                          </div>

                {/* Preço */}
                {(listing.budget || listing.price) && (
                  <div className="mb-6">
                    <div className="text-3xl font-black text-black">
                      R$ {(listing.budget || listing.price)?.toLocaleString()}
                          </div>
                        </div>
                )}

                {/* Localização e Data */}
                <div className="flex items-center gap-4 text-sm font-bold text-gray-700 mb-6">
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
                  className="w-full py-4 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2 inline" />
                  CONTATAR
                </button>
                        </div>
                  ))}
                </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block p-8 bg-black text-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black mb-2">
                  NENHUM CLASSIFICADO ENCONTRADO
                    </h3>
                <p className="font-bold">
                  TENTE AJUSTAR OS FILTROS OU CRIAR UM NOVO CLASSIFICADO.
                </p>
              </div>
            </div>
          )}

          {/* Call to Action Brutalista */}
          <div className="mt-12 text-center">
            <button className="px-8 py-4 bg-red-500 text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xl">
              <Plus className="h-6 w-6 mr-2 inline" />
              CRIAR NOVO CLASSIFICADO
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}