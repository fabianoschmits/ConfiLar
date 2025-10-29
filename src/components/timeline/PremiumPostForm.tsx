'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Zap, Crown, Coins } from 'lucide-react'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { usePoints } from '@/hooks/usePoints'
import { useAuthContext } from '@/contexts/AuthContext'

interface PremiumPostFormProps {
  onSubmit: (postData: {
    title: string
    description: string
    images: string[]
    service: string
    pointsToSpend: number
  }) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  postStatus: 'idle' | 'sending' | 'sent'
}

export function PremiumPostForm({ onSubmit, onCancel, isLoading, postStatus }: PremiumPostFormProps) {
  const { profile } = useAuthContext()
  const { balance } = usePoints(profile?.id)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [] as string[],
    service: '',
    pointsToSpend: 50
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) return
    
    await onSubmit(formData)
  }

  const handleImagesUpload = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }))
  }

  const premiumOptions = [
    { points: 50, label: 'Básico', description: 'Destaque por 7 dias', color: '#FFD700' },
    { points: 100, label: 'Premium', description: 'Destaque por 14 dias', color: '#FF6B6B' },
    { points: 200, label: 'VIP', description: 'Destaque por 30 dias', color: '#9B59B6' }
  ]

  const canAfford = balance?.balance >= formData.pointsToSpend

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-yellow-600">Post Premium</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Destaque seu post com cores especiais e maior visibilidade
        </p>
      </div>

      {/* Saldo Atual */}
      <Card className="border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Seus ConfiPoints:</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100">
              {balance?.balance || 0} pontos
            </Badge>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Opções Premium */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Escolha o nível premium:</Label>
          <div className="grid grid-cols-3 gap-1">
            {premiumOptions.map((option) => (
              <Card 
                key={option.points}
                className={`cursor-pointer transition-all ${
                  formData.pointsToSpend === option.points 
                    ? 'ring-1 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                } ${!canAfford && option.points > (balance?.balance || 0) ? 'opacity-50' : ''}`}
                onClick={() => {
                  if (canAfford || option.points <= (balance?.balance || 0)) {
                    setFormData(prev => ({ ...prev, pointsToSpend: option.points }))
                  }
                }}
              >
                <CardContent className="p-1">
                  <div className="text-center space-y-1">
                    <div 
                      className="w-1.5 h-1.5 rounded-full border mx-auto"
                      style={{ 
                        backgroundColor: formData.pointsToSpend === option.points ? option.color : 'transparent',
                        borderColor: option.color
                      }}
                    />
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                      <Badge 
                        variant="outline" 
                        style={{ borderColor: option.color, color: option.color }}
                        className="bg-white dark:bg-gray-800 text-sm px-1 py-0"
                      >
                        {option.points}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{option.description}</p>
                    {option.points > (balance?.balance || 0) && (
                      <Badge variant="destructive" className="text-sm px-1 py-0">
                        Insuficiente
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-900 dark:text-gray-100">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Digite o título do seu post premium..."
            className="border-yellow-200 dark:border-yellow-600 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            required
          />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">Descrição *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Compartilhe sua experiência, dica ou conhecimento... Use @ para mencionar alguém"
            rows={4}
            className="border-yellow-200 dark:border-yellow-600 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            required
          />
        </div>

        {/* Upload de Imagens */}
        <div className="space-y-2">
          <Label className="text-gray-900 dark:text-gray-100">Imagens</Label>
          <ImageUploadFeed
            currentImages={formData.images}
            onImagesUpload={handleImagesUpload}
            maxImages={5}
          />
        </div>

        {/* Resumo do Custo */}
        <Card className="border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Custo do Post Premium:</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-sm">
                {formData.pointsToSpend} ConfiPoints
              </Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
              Saldo após criação: {(balance?.balance || 0) - formData.pointsToSpend} pontos
            </p>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
            disabled={isLoading || !canAfford || !formData.title.trim() || !formData.description.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {postStatus === 'sending' ? 'Criando...' : 'Enviado!'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Criar Post Premium
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}