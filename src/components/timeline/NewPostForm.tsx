'use client'

import { useState, useRef } from 'react'
import { X, Send, Image as ImageIcon, Loader2, Info, Crown } from 'lucide-react'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { MentionInput } from '@/components/ui/MentionInput'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'
import { useAuthContext } from '@/contexts/AuthContext'
import { Switch } from '@/components/ui/switch'
import { usePoints } from '@/hooks/usePoints'
import { PREMIUM_PRICES } from '@/constants/premiumPrices'

interface NewPostFormProps {
  onSubmit: (post: {
    description: string
    images: string[]
    service: string
    isPremium?: boolean
    pointsToSpend?: number
    durationDays?: number
  }) => void
  onCancel: () => void
  isLoading?: boolean
  postStatus?: 'idle' | 'sending' | 'sent'
}

export function NewPostForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  postStatus = 'idle' 
}: NewPostFormProps) {
  const { profile } = useAuthContext()
  const { balance } = usePoints(profile?.id)
  const [post, setPost] = useState<{
    description: string
    images: string[]
    service: string
    isPremium: boolean
    pointsToSpend: number
    durationDays: number
  }>({
    description: '',
    images: [],
    service: '',
    isPremium: false,
    pointsToSpend: PREMIUM_PRICES.POST_1_DAY.POINTS,
    durationDays: 1
  })

  const isProfessional = profile?.user_type === 'professional'
  const charCount = post.description.length
  const maxChars = 2200

  const premiumOptions = [
    { 
      points: PREMIUM_PRICES.POST_1_DAY.POINTS, 
      label: '1 Dia', 
      days: 1
    },
    { 
      points: PREMIUM_PRICES.POST_7_DAYS.POINTS, 
      label: '7 Dias', 
      days: 7
    },
    { 
      points: PREMIUM_PRICES.POST_14_DAYS.POINTS, 
      label: '14 Dias', 
      days: 14
    },
    { 
      points: PREMIUM_PRICES.POST_30_DAYS.POINTS, 
      label: '30 Dias', 
      days: 30
    }
  ]

  const handleSubmit = () => {
    if (post.description.trim()) {
      onSubmit({
        description: post.description,
        images: post.images,
        service: post.service,
        isPremium: post.isPremium,
        pointsToSpend: post.isPremium ? post.pointsToSpend : undefined,
        durationDays: post.isPremium ? post.durationDays : undefined
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden">
      {/* HEADER FIXO */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onCancel}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isProfessional ? 'Novo Trabalho' : 'Compartilhar Experiência'}
          </h3>
          <LoadingButton
            onClick={handleSubmit}
            disabled={!post.description.trim() || isLoading}
            isLoading={isLoading}
            size="sm"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Publicando...' : 'Publicar'}
          </LoadingButton>
        </div>
      </div>

      {/* SCROLL CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 bg-white dark:bg-black">
        <div className="space-y-5 pt-4">

          {/* IMAGENS - CARROSSEL GRANDE */}
          <div>
            <ImageUploadFeed
              currentImages={post.images}
              onImagesUpload={(images) => setPost(prev => ({ ...prev, images }))}
              maxImages={5}
              className="rounded-xl overflow-hidden"
            />
            {post.images.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {post.images.length}/5 fotos • Arraste para reordenar
              </p>
            )}
          </div>

          {/* DESCRIÇÃO COM CONTADOR */}
          <div className="relative">
            <MentionInput
              value={post.description}
              onChange={(v) => setPost(prev => ({ ...prev, description: v }))}
              placeholder={isProfessional
                ? "Descreva o trabalho, materiais, tempo, desafios..."
                : "Conte sua experiência, o que mais gostou..."
              }
              disabled={isLoading}
              className="pr-16 min-h-32 resize-none text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              minHeight="120px"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                {charCount}/{maxChars}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Info className="h-3 w-3 text-green-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use @ para mencionar • Detalhes geram confiança
              </p>
            </div>
          </div>

          {/* SERVIÇO */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              Serviço <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <ServiceAutocomplete
              value={post.service}
              onChange={(v) => setPost(prev => ({ ...prev, service: v }))}
              placeholder="Selecione um serviço..."
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          {/* TOGGLE POST PREMIUM */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Post Premium
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Destaque seu post no feed
                </p>
              </div>
            </div>
            <Switch
              checked={post.isPremium}
              onCheckedChange={(checked) => setPost(prev => ({ ...prev, isPremium: checked }))}
              disabled={isLoading}
            />
          </div>

          {/* TIPOS DE POST PREMIUM (quando ativado) */}
          {post.isPremium && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Escolha a duração:
              </p>
              <div className="flex gap-2 flex-wrap">
                {premiumOptions.map((option) => {
                  const isSelected = post.pointsToSpend === option.points
                  const canAfford = (balance?.balance || 0) >= option.points
                  return (
                    <button
                      key={option.days}
                      type="button"
                      onClick={() => {
                        if (canAfford) {
                          setPost(prev => ({
                            ...prev,
                            pointsToSpend: option.points,
                            durationDays: option.days
                          }))
                        }
                      }}
                      disabled={isLoading || !canAfford}
                      className={`px-2 py-1 text-xs rounded-md border transition-all ${
                        isSelected
                          ? 'bg-yellow-500 text-white border-yellow-500'
                          : canAfford
                          ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-yellow-500'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-800 cursor-not-allowed'
                      }`}
                    >
                      {option.label}
                      <span className="block text-[10px] mt-0.5">
                        {option.points.toLocaleString('pt-BR')} pts
                      </span>
                    </button>
                  )
                })}
              </div>
              {post.isPremium && (
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Saldo: {(balance?.balance || 0).toLocaleString('pt-BR')} pts • 
                  Após: {((balance?.balance || 0) - post.pointsToSpend).toLocaleString('pt-BR')} pts
                </p>
              )}
            </div>
          )}

          {/* STATUS DE ENVIO */}
          {postStatus !== 'idle' && (
            <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
              postStatus === 'sending'
                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
            }`}>
              {postStatus === 'sending' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Enviando seu post...
                  </span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Post publicado com sucesso!
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
