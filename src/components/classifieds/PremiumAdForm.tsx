'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Crown, Loader2, Sparkles, Star, Zap, Target, TrendingUp } from 'lucide-react'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePremiumAd } from '@/hooks/usePremiumAd'
import { usePoints } from '@/hooks/usePoints'
import { useIBGE } from '@/hooks/useIBGE'
import { toast } from 'sonner'
import { PREMIUM_PRICES } from '@/constants/premiumPrices'

interface PremiumAdFormProps {
  onSubmit: (ad: {
    title: string
    description: string
    service_type: string
    location_city: string
    location_state: string
    price_range: string
    contact_phone?: string
    contact_email?: string
    images?: string[]
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PremiumAdForm({ onSubmit, onCancel, isLoading = false }: PremiumAdFormProps) {
  const { profile } = useAuthContext()
  const { balance } = usePoints()
  const { estados, cidades, loadCidades } = useIBGE()
  const { createPremiumAd, isProcessing } = usePremiumAd({
    onSuccess: () => {
      toast.success('Anúncio premium criado com sucesso! 🌟')
      onSubmit({
        title: '',
        description: '',
        service_type: '',
        location_city: '',
        location_state: '',
        price_range: '',
        contact_phone: '',
        contact_email: '',
        images: []
      })
    },
    onError: (error) => {
      toast.error(`Erro ao criar anúncio premium: ${error}`)
    }
  })

  const [ad, setAd] = useState({
    title: '',
    description: '',
    service_type: '',
    location_city: '',
    location_state: '',
    price_range: '',
    contact_phone: '',
    contact_email: '',
    images: [] as string[]
  })

  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false)

  const handleSubmit = async () => {
    if (!ad.title.trim() || !ad.description.trim() || !ad.service_type.trim()) {
      toast.error('Título, descrição e categoria são obrigatórios')
      return
    }

    if (!ad.location_city.trim() || !ad.location_state.trim()) {
      toast.error('Localização é obrigatória')
      return
    }

    if (balance.balance < PREMIUM_PRICES.AD.POINTS) {
      toast.error(`Saldo insuficiente. Necessário: ${PREMIUM_PRICES.AD.POINTS} pontos para anúncio premium (R$ ${PREMIUM_PRICES.AD.BRL.toFixed(2)})`)
      return
    }

    try {
      await createPremiumAd({
        title: ad.title,
        description: ad.description,
        service_type: ad.service_type,
        location_city: ad.location_city,
        location_state: ad.location_state,
        price_range: ad.price_range,
        contact_phone: ad.contact_phone,
        contact_email: ad.contact_email,
        images: ad.images
      })
    } catch (error) {
      console.error('Erro ao criar anúncio premium:', error)
    }
  }

  const premiumFeatures = [
    {
      icon: <Crown className="h-5 w-5 text-yellow-500" />,
      title: "Destaque Premium",
      description: "Seu anúncio aparece com borda dourada e ícone premium"
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      title: "Prioridade no Feed",
      description: "Aparece no topo dos resultados por 30 dias"
    },
    {
      icon: <Target className="h-5 w-5 text-blue-500" />,
      title: "Alcance Ampliado",
      description: "Visibilidade 5x maior que anúncios normais"
    },
    {
      icon: <Star className="h-5 w-5 text-purple-500" />,
      title: "Credibilidade Premium",
      description: "Badge premium aumenta confiança dos clientes"
    },
    {
      icon: <Zap className="h-5 w-5 text-orange-500" />,
      title: "Resposta Rápida",
      description: "Maior chance de ser contatado primeiro"
    },
    {
      icon: <Sparkles className="h-5 w-5 text-pink-500" />,
      title: "Duração Estendida",
      description: "Anúncio ativo por 30 dias (vs 7 dias normal)"
    }
  ]

  const priceRanges = [
    'Até R$ 100',
    'R$ 100 - R$ 500',
    'R$ 500 - R$ 1.000',
    'R$ 1.000 - R$ 5.000',
    'R$ 5.000 - R$ 10.000',
    'Acima de R$ 10.000',
    'A combinar'
  ]

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="text-center">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full shadow-lg">
          <Crown className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🌟 Criar Anúncio Premium
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Destaque seu serviço e alcance mais clientes com um anúncio premium!
        </p>
        
        {/* Saldo e Custo */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">Seu saldo:</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{balance.balance} pontos</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Custo:</p>
              <p className="text-lg font-bold text-yellow-600">{PREMIUM_PRICES.AD.POINTS} pontos</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">R$ {PREMIUM_PRICES.AD.BRL.toFixed(2)} / {PREMIUM_PRICES.AD.DURATION}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão para mostrar funcionalidades premium */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowPremiumFeatures(!showPremiumFeatures)}
        className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
      >
        <Crown className="h-4 w-4 mr-2" />
        {showPremiumFeatures ? 'Ocultar' : 'Ver'} Funcionalidades Premium
      </Button>

      {/* Funcionalidades Premium */}
      {showPremiumFeatures && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            O que você ganha com um Anúncio Premium:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                {feature.icon}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {feature.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Categoria do Serviço <span className="text-yellow-500">*</span>
          </label>
          <ServiceAutocomplete
            value={ad.service_type}
            onChange={(value) => setAd({ ...ad, service_type: value })}
            placeholder="Selecione a categoria do seu serviço..."
            disabled={isLoading || isProcessing}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Título do Anúncio <span className="text-yellow-500">*</span>
          </label>
          <Input
            placeholder="Ex: Reforma de Cozinha Completa - Qualidade Garantida"
            value={ad.title}
            onChange={(e) => setAd({ ...ad, title: e.target.value })}
            disabled={isLoading || isProcessing}
            className="border-gray-300 dark:border-gray-600 focus:ring-yellow-500"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Dica: Use um título que chame atenção e destaque seus diferenciais
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Descrição Detalhada <span className="text-yellow-500">*</span>
          </label>
          <Textarea
            placeholder="Descreva seu serviço em detalhes: experiência, materiais usados, garantias oferecidas, diferenciais..."
            value={ad.description}
            onChange={(e) => setAd({ ...ad, description: e.target.value })}
            disabled={isLoading || isProcessing}
            className="border-gray-300 dark:border-gray-600 focus:ring-yellow-500 min-h-[120px]"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Dica: Seja específico! Detalhes ajudam clientes a entenderem melhor seu serviço
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Estado <span className="text-yellow-500">*</span>
            </label>
            <select
              value={ad.location_state}
              onChange={(e) => {
                setAd({ ...ad, location_state: e.target.value, location_city: '' })
                loadCidades(e.target.value)
              }}
              disabled={isLoading || isProcessing}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Selecione o estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.sigla}>
                  {estado.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Cidade <span className="text-yellow-500">*</span>
            </label>
            <select
              value={ad.location_city}
              onChange={(e) => setAd({ ...ad, location_city: e.target.value })}
              disabled={isLoading || isProcessing || !ad.location_state}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Selecione a cidade</option>
              {cidades.map((cidade) => (
                <option key={cidade.id} value={cidade.nome}>
                  {cidade.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Faixa de Preço
          </label>
          <select
            value={ad.price_range}
            onChange={(e) => setAd({ ...ad, price_range: e.target.value })}
            disabled={isLoading || isProcessing}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Selecione a faixa de preço</option>
            {priceRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Telefone de Contato
            </label>
            <Input
              placeholder="(11) 99999-9999"
              value={ad.contact_phone}
              onChange={(e) => setAd({ ...ad, contact_phone: e.target.value })}
              disabled={isLoading || isProcessing}
              className="border-gray-300 dark:border-gray-600 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Email de Contato
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={ad.contact_email}
              onChange={(e) => setAd({ ...ad, contact_email: e.target.value })}
              disabled={isLoading || isProcessing}
              className="border-gray-300 dark:border-gray-600 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Fotos do Serviço
          </label>
          <ImageUploadFeed
            currentImages={ad.images}
            onImagesUpload={(images) => setAd({ ...ad, images })}
            maxImages={15}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Dica: Anúncios com fotos têm muito mais engajamento! (Máximo: 15 fotos)
          </p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isProcessing}
          className="flex-1"
        >
          Cancelar
        </Button>
        
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || isProcessing || balance.balance < 200}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando Anúncio Premium...
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Criar Anúncio Premium ({PREMIUM_PRICES.AD.POINTS} pontos)
            </>
          )}
        </Button>
      </div>

      {/* Aviso sobre saldo insuficiente */}
      {balance.balance < PREMIUM_PRICES.AD.POINTS && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">
            ⚠️ Saldo insuficiente. Você precisa de {PREMIUM_PRICES.AD.POINTS} pontos (R$ {PREMIUM_PRICES.AD.BRL.toFixed(2)}) para criar um anúncio premium.
            <br />
            <span className="font-medium">Seu saldo atual: {balance.balance} pontos</span>
          </p>
        </div>
      )}
    </div>
  )
}
