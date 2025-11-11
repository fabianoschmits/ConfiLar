'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Combobox } from '@/components/ui/Combobox'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Crown, Coins, Zap, HandHeart, ShoppingCart, Loader2 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePremiumAd } from '@/hooks/usePremiumAd'
import { usePoints } from '@/hooks/usePoints'
import { useIBGE } from '@/hooks/useIBGE'
import { toast } from 'sonner'
import { PREMIUM_PRICES } from '@/constants/premiumPrices'
import { services } from '@/data/services'

interface PremiumAdFormProps {
  onSubmit: (ad: {
    title: string
    description: string
    service_type: string
    location_city: string
    location_state: string
    price_range: string
    images?: string[]
    pointsToSpend: number
    durationDays: number
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PremiumAdForm({ onSubmit, onCancel, isLoading = false }: PremiumAdFormProps) {
  const { profile, user } = useAuthContext()
  const { balance, loading: balanceLoading } = usePoints(user?.id)
  const { estados, cidades, loadCidades } = useIBGE()
  
  const [formData, setFormData] = useState<{
    title: string
    description: string
    category: string
    location_state: string
    location_city: string
    ad_type: 'offer' | 'request'
    price_range: string
    images: string[]
    pointsToSpend: number
    durationDays: number
  }>({
    title: '',
    description: '',
    category: '',
    location_state: '',
    location_city: '',
    ad_type: 'offer',
    price_range: '',
    images: [],
    pointsToSpend: PREMIUM_PRICES.AD_1_DAY.POINTS,
    durationDays: 1
  })

  const { createPremiumAd, isProcessing } = usePremiumAd({
    onSuccess: () => {
      toast.success('Anúncio premium criado com sucesso! 🌟')
      onSubmit({
        title: formData.title,
        description: formData.description,
        service_type: formData.category,
        location_city: formData.location_city,
        location_state: formData.location_state,
        price_range: formData.price_range,
        images: formData.images,
        pointsToSpend: formData.pointsToSpend,
        durationDays: formData.durationDays
      })
    },
    onError: (error) => {
      toast.error(`Erro ao criar anúncio premium: ${error}`)
    }
  })

  // Pré-preencher estado e cidade do usuário quando o componente for montado
  useEffect(() => {
    if (profile?.location_state && profile?.location_city) {
      // Carregar cidades do estado do usuário primeiro
      loadCidades(profile.location_state).then(() => {
        // Após carregar as cidades, definir o formulário
        setFormData(prev => ({
          ...prev,
          location_state: profile.location_state || '',
          location_city: profile.location_city || ''
        }))
      }).catch(() => {
        // Se falhar ao carregar cidades, ainda assim definir o estado e cidade
        setFormData(prev => ({
          ...prev,
          location_state: profile.location_state || '',
          location_city: profile.location_city || ''
        }))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.location_state, profile?.location_city])

  // Opções de categorias para o Combobox
  const categoryOptions = services.map(service => ({
    value: service.name,
    label: `${service.icon} ${service.name}`
  }))

  const priceRanges = [
    'Até R$ 100',
    'R$ 100 - R$ 500',
    'R$ 500 - R$ 1.000',
    'R$ 1.000 - R$ 5.000',
    'R$ 5.000 - R$ 10.000',
    'Acima de R$ 10.000',
    'A combinar'
  ]

  const premiumOptions = [
    { 
      points: PREMIUM_PRICES.AD_1_DAY.POINTS, 
      label: '1 Dia', 
      description: 'Destaque por 24 horas', 
      color: '#10B981',
      days: 1,
      badge: 'Teste'
    },
    { 
      points: PREMIUM_PRICES.AD_7_DAYS.POINTS, 
      label: '7 Dias', 
      description: 'Destaque por 1 semana', 
      color: '#FFD700',
      days: 7,
      badge: 'Popular'
    },
    { 
      points: PREMIUM_PRICES.AD_14_DAYS.POINTS, 
      label: '14 Dias', 
      description: 'Destaque por 2 semanas', 
      color: '#FF6B6B',
      days: 14,
      badge: 'Econômico'
    },
    { 
      points: PREMIUM_PRICES.AD_30_DAYS.POINTS, 
      label: '30 Dias', 
      description: 'Destaque por 1 mês', 
      color: '#9B59B6',
      days: 30,
      badge: 'Máximo'
    }
  ]

  const canAfford = balance?.balance ? balance.balance >= formData.pointsToSpend : false

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      toast.error('Título, descrição e categoria são obrigatórios')
      return
    }

    if (!formData.location_city.trim() || !formData.location_state.trim()) {
      toast.error('Localização é obrigatória')
      return
    }

    if (!balance) {
      toast.error('Carregando saldo, aguarde...')
      return
    }

    if (balance.balance < formData.pointsToSpend) {
      toast.error(`Saldo insuficiente. Necessário: ${formData.pointsToSpend.toLocaleString('pt-BR')} pontos`)
      return
    }

    try {
      await createPremiumAd({
        title: formData.title.trim(),
        description: formData.description.trim(),
        service_type: formData.category.trim(),
        location_city: formData.location_city.trim(),
        location_state: formData.location_state.trim(),
        ad_type: formData.ad_type === 'offer' ? 'oferecer' : 'procurar',
        price_range: formData.price_range || '',
        images: formData.images || [],
        pointsToSpend: formData.pointsToSpend,
        durationDays: formData.durationDays
      })
    } catch (error) {
      console.error('Erro ao criar anúncio premium:', error)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Premium */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
          <h3 className="text-lg sm:text-xl font-bold text-yellow-600">Anúncio Premium</h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 px-2">
          Escolha a duração do destaque para seu anúncio ter maior visibilidade
        </p>
      </div>

      {/* Saldo Atual */}
      <Card className="border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Seus ConfiPoints:</span>
            </div>
            {balanceLoading || !balance ? (
              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs sm:text-sm">
                Carregando...
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs sm:text-sm">
                {balance.balance.toLocaleString('pt-BR')} pontos
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opções Premium */}
      <div className="space-y-2 sm:space-y-3">
        <Label className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
          Escolha a duração do destaque:
        </Label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {premiumOptions.map((option) => (
            <Card 
              key={option.points}
              className={`cursor-pointer transition-all ${
                formData.pointsToSpend === option.points 
                  ? 'ring-1 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
              } ${!canAfford && option.points > (balance?.balance || 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (balance && option.points <= balance.balance) {
                  setFormData(prev => ({ 
                    ...prev, 
                    pointsToSpend: option.points,
                    durationDays: option.days
                  }))
                }
              }}
            >
              <CardContent className="p-2 sm:p-4">
                <div className="text-center space-y-1 sm:space-y-3">
                  {option.badge && (
                    <Badge 
                      className="mb-1 sm:mb-2 text-[8px] sm:text-xs px-1 sm:px-2"
                      style={{ 
                        backgroundColor: option.color,
                        color: 'white',
                        borderColor: option.color
                      }}
                    >
                      {option.badge}
                    </Badge>
                  )}
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 mx-auto flex items-center justify-center"
                    style={{ 
                      backgroundColor: formData.pointsToSpend === option.points ? option.color : 'transparent',
                      borderColor: option.color
                    }}
                  >
                    <span className="text-sm sm:text-xl font-bold" style={{ color: formData.pointsToSpend === option.points ? 'white' : option.color }}>
                      {option.days}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-base font-bold text-gray-900 dark:text-gray-100">{option.label}</div>
                    <Badge 
                      variant="outline" 
                      style={{ borderColor: option.color, color: option.color }}
                      className="bg-white dark:bg-gray-900 text-[10px] sm:text-sm font-semibold px-2 py-0.5 sm:px-3 sm:py-1"
                    >
                      {option.points.toLocaleString('pt-BR')} pts
                    </Badge>
                  </div>
                  <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-300">{option.description}</p>
                  {option.points > (balance?.balance || 0) && (
                    <Badge variant="destructive" className="text-[8px] sm:text-xs">
                      Saldo Insuficiente
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Formulário - Igual ao modal normal */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <Label htmlFor="title" className="text-xs sm:text-sm">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={
              formData.ad_type === 'offer' 
                ? "Ex: Ofereço serviços de pintura" 
                : "Ex: Preciso de um pedreiro"
            }
            className="text-sm sm:text-base h-9 sm:h-10"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-xs sm:text-sm">Descrição *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={
              formData.ad_type === 'offer' 
                ? "Descreva os serviços que você oferece, sua experiência, disponibilidade, etc..." 
                : "Descreva o que você precisa, quando precisa, orçamento disponível, etc..."
            }
            rows={4}
            className="text-sm sm:text-base resize-y"
          />
        </div>

        <div>
          <Label htmlFor="ad_type" className="text-xs sm:text-sm">Tipo de Anúncio *</Label>
          <Select 
            value={formData.ad_type} 
            onValueChange={(value: 'offer' | 'request') => setFormData(prev => ({ ...prev, ad_type: value }))}
          >
            <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
              <SelectValue placeholder="Selecione o tipo de anúncio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="offer">
                <div className="flex items-center gap-2">
                  <HandHeart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="font-medium text-emerald-700 dark:text-emerald-400 text-sm">Oferta de Serviço</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Estou oferecendo um serviço</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="request">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-medium text-blue-700 dark:text-blue-400 text-sm">Solicitação de Serviço</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Preciso de um serviço</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="category" className="text-xs sm:text-sm">Serviços *</Label>
            <Combobox
              options={categoryOptions}
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              placeholder="Selecione"
              searchPlaceholder="Buscar categoria..."
              emptyMessage="Nenhuma categoria encontrada."
            />
          </div>

          <div>
            <Label htmlFor="state" className="text-xs sm:text-sm">Estado *</Label>
            <EstadoCombobox
              value={formData.location_state}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, location_state: value, location_city: '' }))
                if (value) loadCidades(value)
              }}
            />
          </div>
        </div>

        {formData.location_state && (
          <div>
            <Label htmlFor="city" className="text-xs sm:text-sm">Cidade *</Label>
            <CidadeCombobox
              value={formData.location_city}
              onValueChange={(value) => setFormData(prev => ({ ...prev, location_city: value }))}
              estadoSigla={formData.location_state}
            />
          </div>
        )}

        <div>
          <Label htmlFor="price_range" className="text-xs sm:text-sm">Faixa de Preço</Label>
          <Select
            value={formData.price_range || undefined}
            onValueChange={(value) => setFormData(prev => ({ ...prev, price_range: value === 'none' ? '' : value }))}
          >
            <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
              <SelectValue placeholder="Selecione a faixa de preço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Não especificado</SelectItem>
              {priceRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs sm:text-sm">Fotos do Serviço</Label>
          <ImageUploadFeed
            currentImages={formData.images}
            onImagesUpload={(images) => setFormData(prev => ({ ...prev, images }))}
            maxImages={15}
          />
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Dica: Anúncios com fotos têm muito mais engajamento! (Máximo: 15 fotos)
          </p>
        </div>
      </div>

      {/* Resumo do Custo */}
      <Card className="border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="p-2 sm:p-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Custo do Anúncio Premium:</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs sm:text-sm">
              {formData.pointsToSpend.toLocaleString('pt-BR')} ConfiPoints
            </Badge>
          </div>
          {balance && (
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 mt-1 sm:mt-0.5">
              Saldo após criação: {(balance.balance - formData.pointsToSpend).toLocaleString('pt-BR')} pontos
            </p>
          )}
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isProcessing}
          className="flex-1 w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base"
        >
          Cancelar
        </Button>
        <LoadingButton
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || isProcessing || balanceLoading || !balance || !canAfford || !formData.title.trim() || !formData.description.trim() || !formData.category.trim()}
          isLoading={isProcessing}
          loadingText="Criando Anúncio Premium..."
          className="flex-1 w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 h-10 sm:h-11 text-sm sm:text-base font-medium"
        >
          <Crown className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="hidden sm:inline">Criar Anúncio Premium</span>
          <span className="sm:hidden">Criar Premium</span>
        </LoadingButton>
      </div>

      {/* Aviso sobre saldo insuficiente */}
      {balance && balance.balance < formData.pointsToSpend && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5 sm:p-3">
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">
            ⚠️ Saldo insuficiente. Você precisa de {formData.pointsToSpend.toLocaleString('pt-BR')} pontos para criar este anúncio premium.
            <br className="hidden sm:block" />
            <span className="font-medium block sm:inline mt-1 sm:mt-0">Seu saldo atual: {balance.balance.toLocaleString('pt-BR')} pontos</span>
          </p>
        </div>
      )}
      
      {/* Aviso sobre carregamento */}
      {balanceLoading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 sm:p-3">
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
            ⏳ Carregando informações do saldo...
          </p>
        </div>
      )}
    </div>
  )
}
