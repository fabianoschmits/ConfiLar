'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  User,
  Briefcase
} from 'lucide-react'
import { EstadoCombobox, CidadeCombobox, CategoriaCombobox } from '@/components/ui/LocationComboboxes'

interface CreateAdFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export function CreateAdForm({ onSubmit, onCancel, loading = false }: CreateAdFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_state: '',
    location_city: '',
    ad_type: 'service_request' as 'service_request' | 'service_offer',
    budget: '',
    price: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    availability: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'Baixa'
      case 'medium': return 'Média'
      case 'high': return 'Alta'
      default: return 'Média'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Anúncio */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Tipo de Anúncio</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={formData.ad_type === 'service_request' ? 'default' : 'outline'}
            onClick={() => handleInputChange('ad_type', 'service_request')}
            className="h-12 flex flex-col items-center gap-1"
          >
            <User className="h-5 w-5" />
            <span className="text-sm">Pedido de Serviço</span>
          </Button>
          <Button
            type="button"
            variant={formData.ad_type === 'service_offer' ? 'default' : 'outline'}
            onClick={() => handleInputChange('ad_type', 'service_offer')}
            className="h-12 flex flex-col items-center gap-1"
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-sm">Oferta de Serviço</span>
          </Button>
        </div>
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título do Anúncio *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Ex: Preciso de um pedreiro para reforma"
          required
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descreva detalhadamente o que você precisa ou oferece..."
          rows={4}
          required
        />
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoria *</Label>
        <CategoriaCombobox
          value={formData.category}
          onValueChange={(value) => handleInputChange('category', value)}
          placeholder="Selecione uma categoria"
        />
      </div>

      {/* Localização */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">Estado *</Label>
          <EstadoCombobox
            value={formData.location_state}
            onValueChange={(value) => handleInputChange('location_state', value)}
            placeholder="Selecione o estado"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Cidade *</Label>
          <CidadeCombobox
            value={formData.location_city}
            onValueChange={(value) => handleInputChange('location_city', value)}
            placeholder="Selecione a cidade"
            disabled={!formData.location_state}
          />
        </div>
      </div>

      {/* Campos específicos baseados no tipo */}
      {formData.ad_type === 'service_request' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalhes do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento Disponível (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgência</Label>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Baixa - Posso esperar
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Média - Preciso em algumas semanas
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      Alta - Urgente, preciso logo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.ad_type === 'service_offer' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Detalhes da Oferta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço do Serviço (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilidade</Label>
              <Textarea
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                placeholder="Ex: Segunda a sexta, 8h às 18h. Fins de semana sob consulta."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Criando...' : 'Criar Anúncio'}
        </Button>
      </div>
    </form>
  )
}
