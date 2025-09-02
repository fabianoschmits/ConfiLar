'use client'

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
import { Plus, Search, MapPin, Calendar, User, Tag } from 'lucide-react'
import { toast } from 'sonner'

interface ClassifiedAd {
  id: string
  title: string
  description: string
  category: string
  location_state: string
  location_city: string
  user_name: string
  created_at: string
}

export default function ClassificadosPage() {
  const { ads, loading, createAd, updateAd, deleteAd } = useClassifiedAds()
  const { user, profile } = useAuthContext()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<ClassifiedAd | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_state: '',
    location_city: ''
  })

  const handleCreateAd = async () => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para criar um anúncio')
      return
    }

    try {
      await createAd(
        formData,
        user.id,
        profile.full_name || 'Usuário',
        profile.user_type || 'client'
      )
      setIsCreateModalOpen(false)
      setFormData({
        title: '',
        description: '',
        category: '',
        location_state: '',
        location_city: ''
      })
      toast.success('Anúncio criado com sucesso!')
    } catch (error) {
      toast.error('Erro ao criar anúncio')
      console.error('Erro ao criar anúncio:', error)
    }
  }

  const handleEditAd = async () => {
    if (!editingAd) return
    
    try {
      await updateAd(editingAd.id, formData)
      setIsEditModalOpen(false)
      setEditingAd(null)
      setFormData({
        title: '',
        description: '',
        category: '',
        location_state: '',
        location_city: ''
      })
      toast.success('Anúncio atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar anúncio')
      console.error('Erro ao atualizar anúncio:', error)
    }
  }

  const handleDeleteAd = async (adId: string) => {
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
      location_city: ad.location_city
    })
    setIsEditModalOpen(true)
  }

  const filteredAds = ads.filter((ad: ClassifiedAd) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || ad.category === selectedCategory
    const matchesState = !selectedState || ad.location_state === selectedState
    const matchesCity = !selectedCity || ad.location_city === selectedCity
    
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
            <SelectItem value="">Todas as categorias</SelectItem>
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
            <SelectItem value="">Todos os estados</SelectItem>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad: ClassifiedAd) => (
            <Card key={ad.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{ad.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(ad)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAd(ad.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>{serviceCategories.find(c => c.id === ad.category)?.name || ad.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{ad.location_city}, {ad.location_state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{ad.user_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
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



