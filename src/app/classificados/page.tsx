'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  MessageCircle, 
  Star,
  DollarSign,
  Clock,
  Shield,
  Zap,
  Tag,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { services as servicesList, Service } from '@/data/services'
import { ProfessionalService } from '@/types/database'
import { EstadoCombobox, CidadeCombobox, CategoriaCombobox } from '@/components/ui/LocationComboboxes'

interface ClassifiedAd {
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
  views_count?: number
  user_avatar_url?: string
}

export default function ClassificadosPage() {
  const { user, profile } = useAuthContext()
  const { openChat } = useFloatingChat()
  
  // Estados principais
  const [activeTab, setActiveTab] = useState<'ads' | 'services'>('ads')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  
  // Estados para dados
  const [ads, setAds] = useState<ClassifiedAd[]>([])
  const [services, setServices] = useState<ProfessionalService[]>([])
  
  // Estados para modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<ClassifiedAd | null>(null)
  
  // Estados para formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_state: '',
    location_city: '',
    ad_type: 'procurar' as 'procurar' | 'oferecer'
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar anúncios
  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true)
        console.log('🔍 Carregando anúncios...')
        
        const { data, error } = await supabase
          .from('classified_ads')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ Erro ao carregar anúncios:', error)
          if (error.code === 'PGRST116') {
            console.log('⚠️ Tabela classified_ads não existe')
            toast.info('Tabela de anúncios não encontrada. Execute o script SQL para criá-la.')
          }
          setAds([])
          return
        }

        console.log('✅ Anúncios carregados:', data?.length || 0)
        setAds(data || [])
      } catch (error) {
        console.error('❌ Erro geral:', error)
        setAds([])
      } finally {
        setLoading(false)
      }
    }

    loadAds()
  }, [])

  // Carregar serviços profissionais
  useEffect(() => {
    const loadServices = async () => {
      try {
        console.log('🔍 Carregando serviços profissionais...')
        
        const { data, error } = await supabase
          .from('professional_services')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url,
              location_state,
              location_city
            ),
            service_categories (
              name,
              icon
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ Erro ao carregar serviços:', error)
          if (error.code === 'PGRST116') {
            console.log('⚠️ Tabela professional_services não existe')
            toast.info('Tabela de serviços profissionais não encontrada.')
          }
          setServices([])
          return
        }

        // Transformar dados
        const transformedServices: ProfessionalService[] = (data || []).map((service: {
          id: string
          professional_id: string
          profiles?: {
            full_name?: string
            avatar_url?: string
            location_state?: string
            location_city?: string
          }
          title: string
          description: string
          category_id: string
          service_categories?: {
            name: string
            icon: string
          }
          price_range: string
          price_min?: number
          price_max?: number
          service_type?: 'hourly' | 'fixed' | 'negotiable'
          is_active?: boolean
          location_city: string
          location_state: string
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          insurance_coverage?: boolean
          emergency_service?: boolean
          created_at: string
        }) => ({
          id: service.id,
          professional_id: service.professional_id,
          professional_name: service.profiles?.full_name || 'Profissional',
          professional_avatar_url: service.profiles?.avatar_url,
          category_id: service.category_id,
          category_name: service.service_categories?.name || 'Serviço',
          category_icon: service.service_categories?.icon || '🔧',
          title: service.title,
          description: service.description,
          price_min: service.price_min,
          price_max: service.price_max,
          service_type: service.service_type || 'fixed',
          is_active: service.is_active,
          created_at: service.created_at,
          updated_at: service.created_at, // Usar created_at como fallback
          location_state: service.profiles?.location_state || '',
          location_city: service.profiles?.location_city || '',
          experience_level: service.experience_level || 'intermediate',
          insurance_coverage: service.insurance_coverage || false,
          emergency_service: service.emergency_service || false
        }))

        console.log('✅ Serviços carregados:', transformedServices.length)
        setServices(transformedServices)
      } catch (error) {
        console.error('❌ Erro geral:', error)
        setServices([])
      }
    }

    loadServices()
  }, [])

  // Filtrar anúncios
  const filteredAds = ads.filter(ad => {
    const matchesSearch = !searchTerm || 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory
    const matchesState = !selectedState || ad.location_state === selectedState
    const matchesCity = !selectedCity || ad.location_city === selectedCity
    
    return matchesSearch && matchesCategory && matchesState && matchesCity
  })

  // Filtrar serviços
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicesList.find(s => s.id === service.category_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory
    const matchesState = !selectedState || (service as ProfessionalService & { location_state?: string }).location_state === selectedState
    const matchesCity = !selectedCity || (service as ProfessionalService & { location_city?: string }).location_city === selectedCity
    
    return matchesSearch && matchesCategory && matchesState && matchesCity
  })

  // Criar anúncio
  const handleCreateAd = async () => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para criar um anúncio')
      return
    }

    try {
      const userType = formData.ad_type === 'oferecer' ? 'professional' : 'client'
      
      const { data, error } = await supabase
        .from('classified_ads')
        .insert({
          user_id: user.id,
          user_name: profile.full_name || 'Usuário',
          user_type: userType,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          location_state: formData.location_state,
          location_city: formData.location_city?.trim() || '',
          is_active: true,
          views_count: 0
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar anúncio:', error)
        toast.error('Erro ao criar anúncio')
        return
      }

      setAds(prev => [data, ...prev])
      setIsCreateModalOpen(false)
      setFormData({
        title: '',
        description: '',
        category: '',
        location_state: '',
        location_city: '',
        ad_type: 'procurar'
      })
      toast.success('Anúncio criado com sucesso!')
    } catch (error) {
      toast.error('Erro ao criar anúncio')
      console.error('Erro:', error)
    }
  }

  // Editar anúncio
  const handleEditAd = async () => {
    if (!editingAd || !user) return
    
    if (editingAd.user_id !== user.id) {
      toast.error('Você só pode editar seus próprios anúncios')
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('classified_ads')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location_state: formData.location_state,
          location_city: formData.location_city
        })
        .eq('id', editingAd.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar anúncio:', error)
        toast.error('Erro ao atualizar anúncio')
        return
      }

      setAds(prev => prev.map(ad => ad.id === editingAd.id ? data : ad))
      setIsEditModalOpen(false)
      setEditingAd(null)
      setFormData({
        title: '',
        description: '',
        category: '',
        location_state: '',
        location_city: '',
        ad_type: 'procurar'
      })
      toast.success('Anúncio atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar anúncio')
      console.error('Erro:', error)
    }
  }

  // Excluir anúncio
  const handleDeleteAd = async (adId: string) => {
    const ad = ads.find(a => a.id === adId)
    if (!ad || !user) return
    
    if (ad.user_id !== user.id) {
      toast.error('Você só pode excluir seus próprios anúncios')
      return
    }
    
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
      try {
        const { error } = await supabase
          .from('classified_ads')
          .delete()
          .eq('id', adId)

        if (error) {
          console.error('❌ Erro ao deletar anúncio:', error)
          toast.error('Erro ao deletar anúncio')
          return
        }

        setAds(prev => prev.filter(ad => ad.id !== adId))
        toast.success('Anúncio excluído com sucesso!')
      } catch (error) {
        toast.error('Erro ao excluir anúncio')
        console.error('Erro:', error)
      }
    }
  }

  // Abrir modal de edição
  const openEditModal = (ad: ClassifiedAd) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      description: ad.description,
      category: ad.category,
      location_state: ad.location_state,
      location_city: ad.location_city,
      ad_type: ad.user_type === 'professional' ? 'oferecer' : 'procurar'
    })
    setIsEditModalOpen(true)
  }

  // Iniciar chat
  const handleChat = (userId: string, userName: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para iniciar um chat')
      return
    }
    
    if (userId === user.id) {
      toast.error('Você não pode iniciar um chat consigo mesmo')
      return
    }
    
    // Abrir chat flutuante diretamente
    openChat(userId, userName)
  }

  // Ver perfil
  const handleViewProfile = (userId: string) => {
    window.location.href = `/perfil/${userId}`
  }

  // Formatar preço
  const formatPrice = (min: number | null, max: number | null, type: string) => {
    if (!min && !max) return 'Preço a combinar'
    
    if (min && max) {
      return `R$ ${min.toFixed(2)} - R$ ${max.toFixed(2)}`
    }
    
    if (min) return `A partir de R$ ${min.toFixed(2)}`
    if (max) return `Até R$ ${max.toFixed(2)}`
    
    return 'Preço a combinar'
  }

  // Obter texto do nível de experiência
  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante'
      case 'intermediate': return 'Intermediário'
      case 'advanced': return 'Avançado'
      case 'expert': return 'Especialista'
      default: return 'Intermediário'
    }
  }

  // Obter texto do tipo de serviço
  const getServiceTypeText = (type: string) => {
    switch (type) {
      case 'hourly': return 'Por hora'
      case 'fixed': return 'Preço fixo'
      case 'negotiable': return 'Negociável'
      default: return 'Preço fixo'
    }
  }

  if (!user) {
    return (
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Classificados</h1>
              <p className="text-gray-600 mb-6">
                Faça login para acessar os classificados e criar anúncios.
              </p>
              <Button onClick={() => window.location.href = '/auth'} className="w-full">
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (!mounted) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Carregando...
              </h1>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Classificados</h1>
                <p className="text-gray-600">
                  Encontre serviços profissionais e publique seus anúncios
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                      Criar Anúncio
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Anúncio</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Tipo de anúncio */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tipo de Anúncio
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, ad_type: 'procurar' })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.ad_type === 'procurar'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">🔍</div>
                            <div className="font-medium">Procurar</div>
                            <div className="text-xs text-gray-500">Preciso de ajuda</div>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, ad_type: 'oferecer' })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.ad_type === 'oferecer'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">🏗️</div>
                            <div className="font-medium">Oferecer</div>
                            <div className="text-xs text-gray-500">Tenho habilidades</div>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <Input
                      placeholder="Título do anúncio"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    
                    <Textarea
                      placeholder="Descrição (máx. 500 caracteres)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      maxLength={500}
                      rows={3}
                    />
                    
                    <CategoriaCombobox 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      placeholder="Selecione a categoria"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <EstadoCombobox 
                        value={formData.location_state} 
                        onValueChange={(value) => {
                          setFormData({ ...formData, location_state: value, location_city: '' })
                        }}
                        placeholder="Estado"
                      />
                      
                      <CidadeCombobox 
                        value={formData.location_city} 
                        onValueChange={(value) => setFormData({ ...formData, location_city: value })}
                        estadoSigla={formData.location_state}
                        placeholder="Cidade"
                        disabled={!formData.location_state}
                      />
                    </div>
                    
                    <Button onClick={handleCreateAd} className="w-full">
                      Criar Anúncio
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4 py-6">
          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar anúncios e serviços..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <CategoriaCombobox 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                  placeholder="Categoria"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <EstadoCombobox 
                    value={selectedState} 
                    onValueChange={(value) => {
                      setSelectedState(value)
                      setSelectedCity('') // Limpar cidade quando estado muda
                    }}
                    placeholder="Estado"
                  />
                  
                  <CidadeCombobox 
                    value={selectedCity} 
                    onValueChange={setSelectedCity}
                    estadoSigla={selectedState}
                    placeholder="Cidade"
                    disabled={!selectedState}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ads' | 'services')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="ads">
                Anúncios ({filteredAds.length})
              </TabsTrigger>
              <TabsTrigger value="services">
                Serviços ({filteredServices.length})
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo dos Anúncios */}
            <TabsContent value="ads">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Carregando anúncios...</p>
                  </div>
                </div>
              ) : filteredAds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAds.map((ad) => (
                    <Card key={ad.id} className={`hover:shadow-lg transition-all duration-200 ${
                      user && ad.user_id === user.id ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
                    }`}>
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">
                                {ad.user_type === 'professional' ? '🏗️' : '🔍'}
                              </span>
                              <Badge variant="secondary">
                                {typeof ad.category === 'string'
                                  ? (servicesList.find(c => c.id === ad.category)?.name || ad.category)
                                  : (ad.category as ProfessionalService).title || 'Serviço'
                                }
                              </Badge>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                              {ad.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                              {ad.description}
                            </p>
                          </div>
                        </div>

                        {/* Informações do anúncio */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{ad.location_city}, {ad.location_state}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{ad.user_type === 'professional' ? 'Oferecendo serviços' : 'Procurando serviços'}</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          <Badge variant="outline" className="text-xs">
                            {ad.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                          </Badge>
                          {user && ad.user_id === user.id && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Seu anúncio
                            </Badge>
                          )}
                        </div>

                        {/* Perfil do usuário */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={ad.user_avatar_url || ''} />
                                <AvatarFallback className="text-xs">
                                  {ad.user_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{ad.user_name}</p>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-500">4.8 (24)</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              {user && ad.user_id !== user.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleChat(ad.user_id, ad.user_name)}
                                  className="h-8 px-2"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewProfile(ad.user_id)}
                                className="h-8 px-2"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              
                              {user && ad.user_id === user.id && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEditModal(ad)}
                                    className="h-8 px-2 text-gray-500 hover:text-gray-700"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="h-8 px-2 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {ads.length === 0 ? 'Nenhum anúncio cadastrado' : 'Nenhum anúncio encontrado'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {ads.length === 0 
                        ? 'Seja o primeiro a criar um anúncio!'
                        : 'Tente ajustar os filtros de busca.'
                      }
                    </p>
                    {ads.length === 0 && (
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        Criar Primeiro Anúncio
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Conteúdo dos Serviços */}
            <TabsContent value="services">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Carregando serviços...</p>
                  </div>
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <Card key={service.id} className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{servicesList.find(s => s.id === service.category_id)?.icon || '🔧'}</span>
                              <Badge variant="secondary">{servicesList.find(s => s.id === service.category_id)?.name || 'Serviço'}</Badge>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                              {service.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                              {service.description || 'Sem descrição'}
                            </p>
                          </div>
                        </div>

                        {/* Informações do serviço */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">
                              {formatPrice(service.price_min, service.price_max, service.service_type)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{getServiceTypeText(service.service_type)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{(service as ProfessionalService & { location_city?: string; location_state?: string }).location_city || 'N/A'}, {(service as ProfessionalService & { location_state?: string }).location_state || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          <Badge variant="outline" className="text-xs">
                            {getExperienceLevelText(service.experience_level)}
                          </Badge>
                          {service.insurance_coverage && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <Shield className="h-3 w-3 mr-1" />
                              Seguro
                            </Badge>
                          )}
                          {service.emergency_service && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                              <Zap className="h-3 w-3 mr-1" />
                              Emergência
                            </Badge>
                          )}
                        </div>

                        {/* Perfil do profissional */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={(service as ProfessionalService & { professional_avatar_url?: string }).professional_avatar_url || ''} />
                                <AvatarFallback className="text-xs">
                                  {(service as ProfessionalService & { professional_name?: string }).professional_name?.charAt(0).toUpperCase() || 'P'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{(service as ProfessionalService & { professional_name?: string }).professional_name || 'Profissional'}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(service.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              {user && service.professional_id !== user.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleChat(service.professional_id, (service as ProfessionalService & { professional_name?: string }).professional_name || 'Profissional')}
                                  className="h-8 px-2"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewProfile(service.professional_id)}
                                className="h-8 px-2"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {services.length === 0 ? 'Nenhum serviço cadastrado' : 'Nenhum serviço encontrado'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {services.length === 0 
                        ? 'Ainda não há serviços profissionais cadastrados.'
                        : 'Tente ajustar os filtros de busca.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Anúncio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Título do anúncio"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              
              <Textarea
                placeholder="Descrição (máx. 500 caracteres)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
                rows={3}
              />
              
              <CategoriaCombobox 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                placeholder="Selecione a categoria"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <EstadoCombobox 
                  value={formData.location_state} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, location_state: value, location_city: '' })
                  }}
                  placeholder="Estado"
                />
                
                <CidadeCombobox 
                  value={formData.location_city} 
                  onValueChange={(value) => setFormData({ ...formData, location_city: value })}
                  estadoSigla={formData.location_state}
                  placeholder="Cidade"
                  disabled={!formData.location_state}
                />
              </div>
              
              <Button onClick={handleEditAd} className="w-full">
                Atualizar Anúncio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}