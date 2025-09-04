'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'
import { MainLayout } from '@/components/layout/MainLayout'
import { useClassifiedAds } from '@/hooks/useClassifiedAds'
import { useAuthContext } from '@/contexts/AuthContext'
import { serviceCategories } from '@/data/serviceCategories'
import { Plus, MapPin, Calendar, User, Tag, MessageCircle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

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

export default function ClassificadosPage() {
  const { ads, loading, createAd, updateAd, deleteAd } = useClassifiedAds()
  const { user, profile } = useAuthContext()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<ClassifiedAd | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedState, setSelectedState] = useState('all')
  const [selectedCity, setSelectedCity] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_state: '',
    location_city: '',
    ad_type: 'procurar' as 'procurar' | 'oferecer'
  })

  const handleCreateAd = async () => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para criar um anúncio')
      return
    }

    try {
      // Determinar o tipo de usuário baseado na escolha do anúncio
      const userType = formData.ad_type === 'oferecer' ? 'professional' : 'client'
      
      await createAd(
        formData,
        user.id,
        profile.full_name || 'Usuário',
        userType
      )
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
      await updateAd(editingAd.id, formData)
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
        await deleteAd(adId)
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

  const filteredAds = ads.filter((ad: ClassifiedAd) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || ad.category === selectedCategory
    const matchesState = !selectedState || selectedState === 'all' || ad.location_state === selectedState
    const matchesCity = !selectedCity || selectedCity === 'all' || ad.location_city === selectedCity
    
    return matchesSearch && matchesCategory && matchesState && matchesCity
  })

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
          <p className="text-gray-600">Encontre e publique anúncios de serviços</p>
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
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Buscar anúncios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {serviceCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            {/* Estados brasileiros */}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Anúncios */}
      {loading ? (
        <div className="text-center py-8">
          <p>Carregando anúncios...</p>
        </div>
      ) : (
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
      )}

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
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
