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
  Users, Briefcase, Plus, ArrowRight, Minus, Maximize2
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

export default function ClassificadosMinimalPage() {
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
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Minimalista */}
          <div className="text-center mb-16">
            <h1 className="text-3xl font-light text-gray-900 mb-4">
              Classificados
            </h1>
            <p className="text-gray-600 font-light">
              Conecte-se de forma simples e direta
            </p>
          </div>

          {/* Busca Minimalista */}
          <div className="mb-12">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-none"
              />
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32 border-gray-200 rounded-none">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32 border-gray-200 rounded-none">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Recentes</SelectItem>
                  <SelectItem value="price_low">Menor preço</SelectItem>
                  <SelectItem value="price_high">Maior preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista Minimalista */}
          <div className="space-y-1">
            {filteredListings.map((listing) => (
              <div 
                key={listing.id} 
                className="group border-b border-gray-100 hover:bg-gray-50 transition-colors py-6"
              >
                <div className="flex items-center justify-between">
                  {/* Conteúdo Principal */}
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.user_avatar_url} />
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        {listing.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs border-gray-300 text-gray-600"
                          >
                            {listing.ad_type === 'service_request' ? 'Solicitação' : 'Oferta'}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-gray-300 text-gray-600"
                          >
                            {listing.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {listing.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="font-medium">{listing.user_name}</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.location_city}, {listing.location_state}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(listing.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações Secundárias */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* Preço */}
                    {(listing.budget || listing.price) && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          R$ {(listing.budget || listing.price)?.toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(listing.id)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openChat(listing.user_id)}
                        className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-none"
                      >
                        Contatar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Minus className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="text-lg font-light text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600 font-light">
                Tente ajustar sua busca
              </p>
            </div>
          )}

          {/* Estatísticas Minimalistas */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex justify-center gap-12 text-center">
              <div>
                <div className="text-2xl font-light text-gray-900">{filteredListings.length}</div>
                <div className="text-sm text-gray-600 font-light">Total</div>
              </div>
              <div>
                <div className="text-2xl font-light text-gray-900">
                  {filteredListings.filter(l => l.ad_type === 'service_request').length}
                </div>
                <div className="text-sm text-gray-600 font-light">Solicitações</div>
              </div>
              <div>
                <div className="text-2xl font-light text-gray-900">
                  {filteredListings.filter(l => l.ad_type === 'service_offer').length}
                </div>
                <div className="text-sm text-gray-600 font-light">Ofertas</div>
              </div>
            </div>
          </div>

          {/* Call to Action Minimalista */}
          <div className="mt-16 text-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-none px-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Classificado
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
