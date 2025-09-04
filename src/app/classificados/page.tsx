'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EstadoCombobox, CidadeCombobox, CategoriaCombobox } from '@/components/ui/LocationComboboxes'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { serviceCategories } from '@/data/serviceCategories'
import { Plus, MapPin, Calendar, User, Tag, MessageCircle, ArrowRight, Star, DollarSign, Clock, Shield, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface ClassifiedAd {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  location_state: string
  location_city: string
  user_name: string
  user_type: string
  created_at: string
  user_avatar_url?: string
}

interface ProfessionalService {
  id: string
  professional_id: string
  professional_name: string
  professional_avatar_url?: string
  category_id: string
  category_name: string
  category_icon: string
  title: string
  description: string | null
  price_min: number | null
  price_max: number | null
  service_type: 'hourly' | 'fixed' | 'negotiable'
  is_active: boolean
  created_at: string
  location_state: string
  location_city: string
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  insurance_coverage: boolean
  emergency_service: boolean
}

export default function ClassificadosPage() {
  const { user, profile } = useAuthContext()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<ClassifiedAd | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedState, setSelectedState] = useState('all')
  const [selectedCity, setSelectedCity] = useState('all')
  const [activeTab, setActiveTab] = useState<'ads' | 'services'>('services')
  const [loading, setLoading] = useState(true)
  
  // Estados para dados carregados do Supabase
  const [professionals, setProfessionals] = useState<Profile[]>([])
  const [professionalServices, setProfessionalServices] = useState<ProfessionalService[]>([])
  const [ads, setAds] = useState<ClassifiedAd[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_state: '',
    location_city: '',
    ad_type: 'procurar' as 'procurar' | 'oferecer'
  })

  // Carregar profissionais reais do Supabase (mesmo método da página de busca)
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'professional')
          .order('rating', { ascending: false })

        if (!error && data) {
          console.log('📊 Profissionais carregados para classificados:', data.length)
          setProfessionals(data as unknown as Profile[])
        } else {
          console.error('❌ Erro ao carregar profissionais:', error)
          setProfessionals([])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar profissionais:', error)
        setProfessionals([])
      } finally {
        setLoading(false)
      }
    }

    loadProfessionals()
  }, [])

  // Carregar serviços profissionais do Supabase
  useEffect(() => {
    const loadProfessionalServices = async () => {
      try {
        setLoading(true)
        
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

        if (!error && data) {
          console.log('📊 Serviços profissionais carregados:', data.length)
          
          // Transformar os dados para o formato esperado
          const transformedServices: ProfessionalService[] = (data || []).map((service: {
            id: string;
            professional_id: string;
            profiles?: { full_name?: string; avatar_url?: string; location_state?: string; location_city?: string };
            category_id: string;
            service_categories?: { name?: string; icon?: string };
            title: string;
            description: string;
            price_min?: number;
            price_max?: number;
            service_type?: string;
            is_active: boolean;
            created_at: string;
            experience_level?: string;
            insurance_coverage?: boolean;
            emergency_service?: boolean;
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
            service_type: service.service_type as 'hourly' | 'fixed' | 'negotiable' || 'fixed',
            is_active: service.is_active,
            created_at: service.created_at,
            location_state: service.profiles?.location_state || '',
            location_city: service.profiles?.location_city || '',
            experience_level: service.experience_level as 'beginner' | 'intermediate' | 'advanced' | 'expert' || 'intermediate',
            insurance_coverage: service.insurance_coverage || false,
            emergency_service: service.emergency_service || false
          }))

          setProfessionalServices(transformedServices)
        } else {
          console.error('❌ Erro ao carregar serviços profissionais:', error)
          setProfessionalServices([])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar serviços profissionais:', error)
        setProfessionalServices([])
      } finally {
        setLoading(false)
      }
    }

    loadProfessionalServices()
  }, [])

  // Carregar anúncios do Supabase
  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('classified_ads')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (!error && data) {
          console.log('📊 Anúncios carregados:', data.length)
          setAds(data)
        } else {
          console.error('❌ Erro ao carregar anúncios:', error)
          setAds([])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar anúncios:', error)
        setAds([])
      } finally {
        setLoading(false)
      }
    }

    loadAds()
  }, [])

  // Filtrar dados baseado nos filtros selecionados
  const filteredAds = ads.filter((ad: ClassifiedAd) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory
    const matchesState = selectedState === 'all' || ad.location_state === selectedState
    const matchesCity = selectedCity === 'all' || ad.location_city === selectedCity
    
    return matchesSearch && matchesCategory && matchesState && matchesCity
  })

  const filteredServices = professionalServices.filter((service: ProfessionalService) => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory
    const matchesState = selectedState === 'all' || service.location_state === selectedState
    const matchesCity = selectedCity === 'all' || service.location_city === selectedCity
    
    return matchesSearch && matchesCategory && matchesState && matchesCity
  })

  const handleCreateAd = async () => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para criar um anúncio')
      return
    }

    try {
      // Determinar o tipo de usuário baseado na escolha do anúncio
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

      // Adicionar o novo anúncio à lista local
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
      console.error('Erro ao criar anúncio:', error)
    }
  }

  const handleEditAd = async () => {
    if (!editingAd || !user) return
    
    // Verificar se o usuário é o dono do anúncio
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

      // Atualizar o anúncio na lista local
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
      console.error('Erro ao atualizar anúncio:', error)
    }
  }

  const handleDeleteAd = async (adId: string) => {
    // Encontrar o anúncio para verificar a propriedade
    const ad = ads.find(a => a.id === adId)
    if (!ad || !user) return
    
    // Verificar se o usuário é o dono do anúncio
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

        // Remover o anúncio da lista local
        setAds(prev => prev.filter(ad => ad.id !== adId))
        toast.success('Anúncio excluído com sucesso!')
      } catch (error) {
        toast.error('Erro ao excluir anúncio')
        console.error('Erro ao excluir anúncio:', error)
      }
    }
  }

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

  const handleChat = (ad: ClassifiedAd) => {
    if (!user) {
      toast.error('Você precisa estar logado para iniciar um chat')
      return
    }
    
    if (ad.user_id === user.id) {
      toast.error('Você não pode iniciar um chat consigo mesmo')
      return
    }
    
    // Redirecionar para a conversa direta com o usuário
    window.location.href = `/mensagens?user=${ad.user_id}&name=${encodeURIComponent(ad.user_name)}&type=direct`
  }

  const handleViewProfile = (userId: string) => {
    // Redirecionar para o perfil do usuário
    window.location.href = `/perfil/${userId}`
  }

  const handleServiceChat = (service: ProfessionalService) => {
    if (!user) {
      toast.error('Você precisa estar logado para iniciar um chat')
      return
    }
    
    if (service.professional_id === user.id) {
      toast.error('Você não pode iniciar um chat consigo mesmo')
      return
    }
    
    // Redirecionar para a conversa direta com o profissional
    window.location.href = `/mensagens?user=${service.professional_id}&name=${encodeURIComponent(service.professional_name)}&type=direct`
  }

  const handleServiceViewProfile = (professionalId: string) => {
    // Redirecionar para o perfil do profissional
    window.location.href = `/perfil/${professionalId}`
  }

  const formatPrice = (min: number | null, max: number | null, type: string) => {
    if (!min && !max) return 'Preço a combinar'
    
    if (min && max) {
      return `R$ ${min.toFixed(2)} - R$ ${max.toFixed(2)}`
    }
    
    if (min) return `A partir de R$ ${min.toFixed(2)}`
    if (max) return `Até R$ ${max.toFixed(2)}`
    
    return 'Preço a combinar'
  }

  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante'
      case 'intermediate': return 'Intermediário'
      case 'advanced': return 'Avançado'
      case 'expert': return 'Especialista'
      default: return 'Intermediário'
    }
  }

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
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Classificados</h1>
              <p className="text-gray-600 mb-4">
                Faça login para acessar os classificados.
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Classificados</h1>
            <p className="text-gray-600">Encontre serviços profissionais e publique anúncios</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Criar Anúncio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Anúncio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Seleção do tipo de anúncio */}
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
                        <div className="font-medium">Procurar Serviço</div>
                        <div className="text-xs text-gray-500">Você precisa de ajuda</div>
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
                        <div className="font-medium">Oferecer Serviço</div>
                        <div className="text-xs text-gray-500">Você tem habilidades</div>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div>
                  <Input
                    placeholder="Título do anúncio"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Descrição (máx. 144 caracteres)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength={144}
                    rows={3}
                  />
                </div>
                <div>
                  <CategoriaCombobox
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    placeholder="Selecione a categoria"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <EstadoCombobox
                    value={formData.location_state}
                    onValueChange={(state: string) => setFormData({ ...formData, location_state: state })}
                    placeholder="Estado"
                  />
                  <CidadeCombobox
                    value={formData.location_city}
                    onValueChange={(city: string) => setFormData({ ...formData, location_city: city })}
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

        {/* Tabs para alternar entre serviços e anúncios */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ads' | 'services')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Serviços Profissionais ({filteredServices.length})</TabsTrigger>
            <TabsTrigger value="ads">Anúncios ({filteredAds.length})</TabsTrigger>
          </TabsList>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <CategoriaCombobox
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              placeholder="Categoria"
            />
            <div className="grid grid-cols-2 gap-2">
              <EstadoCombobox
                value={selectedState}
                onValueChange={setSelectedState}
                placeholder="Estado"
              />
              <CidadeCombobox
                value={selectedCity}
                onValueChange={setSelectedCity}
                estadoSigla={selectedState}
                placeholder="Cidade"
                disabled={selectedState === 'all'}
              />
            </div>
          </div>

          {/* Conteúdo dos Tabs */}
          <TabsContent value="services" className="mt-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" style={{ animationDuration: '0.6s' }}></div>
                  <p className="text-muted-foreground">Carregando serviços...</p>
                </div>
              </div>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredServices.map((service: ProfessionalService) => (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-200 bg-card hover:bg-accent/50">
                  <CardContent className="p-4">
                    {/* Header do serviço */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        {/* Categoria */}
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-lg">{service.category_icon}</span>
                          <Badge variant="secondary" className="text-xs">
                            {service.category_name}
                          </Badge>
                        </div>
                        
                        {/* Título e descrição */}
                        <h3 className="font-bold text-base mb-1 text-foreground group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground text-xs leading-tight mb-2 line-clamp-2">
                          {service.description || 'Sem descrição'}
                        </p>
                      </div>
                      
                      {/* Botões de ação */}
                      <div className="flex flex-col gap-1 ml-2">
                        {user && service.professional_id !== user.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => handleServiceChat(service)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Contatar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Informações do serviço */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">{formatPrice(service.price_min, service.price_max, service.service_type)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{getServiceTypeText(service.service_type)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium">{service.location_city}, {service.location_state}</span>
                      </div>
                    </div>
                    
                    {/* Badges de experiência e recursos */}
                    <div className="flex flex-wrap gap-1 mb-3">
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
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {service.professional_avatar_url ? (
                            <img 
                              src={service.professional_avatar_url} 
                              alt={service.professional_name}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs">
                              {service.professional_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-xs text-foreground">{service.professional_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(service.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        {/* Link para perfil */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:text-primary hover:bg-accent"
                          onClick={() => handleServiceViewProfile(service.professional_id)}
                        >
                          Ver Perfil
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Estado vazio para serviços */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {professionalServices.length === 0 
                  ? 'Nenhum serviço profissional cadastrado'
                  : 'Nenhum serviço encontrado'
                }
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {professionalServices.length === 0 
                  ? 'Ainda não há serviços profissionais cadastrados no sistema.'
                  : searchTerm || selectedState !== 'all' || selectedCity !== 'all' || selectedCategory !== 'all'
                    ? 'Tente ajustar os filtros ou usar termos de busca diferentes.'
                    : 'Comece digitando o que você precisa na barra de busca acima.'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ads" className="mt-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" style={{ animationDuration: '0.6s' }}></div>
                  <p className="text-muted-foreground">Carregando anúncios...</p>
                </div>
              </div>
            </div>
          ) : filteredAds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAds.map((ad: ClassifiedAd) => (
                <Card key={ad.id} className={`group hover:shadow-lg transition-all duration-200 ${user && ad.user_id === user.id ? 'ring-1 ring-blue-200 bg-blue-50/50' : 'bg-card hover:bg-accent/50'}`}>
                  <CardContent className="p-3">
                    {/* Header do anúncio */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        {/* Tipo do anúncio */}
                        <div className="flex items-center gap-1 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ad.user_type === 'professional' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}>
                            {ad.user_type === 'professional' ? '🏗️ Oferecendo' : '🔍 Procurando'}
                          </span>
                          {user && ad.user_id === user.id && (
                            <span className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full border border-border">
                              Seu anúncio
                            </span>
                          )}
                        </div>
                        
                        {/* Título e descrição */}
                        <h3 className="font-bold text-base mb-1 text-foreground group-hover:text-primary transition-colors">
                          {ad.title}
                        </h3>
                        <p className="text-muted-foreground text-xs leading-tight mb-2 line-clamp-2">
                          {ad.description}
                        </p>
                      </div>
                      
                      {/* Botões de ação */}
                      <div className="flex flex-col gap-1 ml-2">
                        {/* Botão de chat (apenas para anúncios de outros usuários) */}
                        {user && ad.user_id !== user.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => handleChat(ad)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                        )}
                        
                        {/* Botões de edição (apenas para o dono) */}
                        {user && ad.user_id === user.id && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(ad)}
                              className="w-full h-7 text-xs"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAd(ad.id)}
                              className="w-full h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                            >
                              Excluir
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Informações do anúncio */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{serviceCategories.find(c => c.id === ad.category)?.name || ad.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{ad.location_city}, {ad.location_state}</span>
                      </div>
                    </div>
                    
                    {/* Perfil do usuário */}
                    <div className="border-t border-border pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {ad.user_avatar_url ? (
                            <img 
                              src={ad.user_avatar_url} 
                              alt={ad.user_name}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs">
                              {ad.user_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-xs text-foreground">{ad.user_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ad.user_type === 'professional' ? 'Profissional' : 'Cliente'} • 
                              {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        {/* Link para perfil */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:text-primary hover:bg-accent"
                          onClick={() => handleViewProfile(ad.user_id)}
                        >
                          Ver Perfil
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Estado vazio para anúncios */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {ads.length === 0 
                  ? 'Nenhum anúncio cadastrado'
                  : 'Nenhum anúncio encontrado'
                }
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {ads.length === 0 
                  ? 'Ainda não há anúncios cadastrados no sistema. Seja o primeiro a criar um!'
                  : searchTerm || selectedState !== 'all' || selectedCity !== 'all' || selectedCategory !== 'all'
                    ? 'Tente ajustar os filtros ou usar termos de busca diferentes.'
                    : 'Comece digitando o que você precisa na barra de busca acima.'
                }
              </p>
              {ads.length === 0 && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Criar Primeiro Anúncio
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Anúncio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Título do anúncio"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Descrição (máx. 144 caracteres)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={144}
                  rows={3}
                />
              </div>
              <div>
                <CategoriaCombobox
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  placeholder="Selecione a categoria"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <EstadoCombobox
                  value={formData.location_state}
                  onValueChange={(state: string) => setFormData({ ...formData, location_state: state })}
                  placeholder="Estado"
                />
                <CidadeCombobox
                  value={formData.location_city}
                  onValueChange={(city: string) => setFormData({ ...formData, location_city: city })}
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
