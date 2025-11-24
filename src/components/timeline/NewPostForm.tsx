'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Image as ImageIcon, Loader2, Info, Crown, AlertCircle, MapPin } from 'lucide-react'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { MentionInput } from '@/components/ui/MentionInput'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'
import { useAuthContext } from '@/contexts/AuthContext'
import { Switch } from '@/components/ui/switch'
import { usePoints } from '@/hooks/usePoints'
import { PREMIUM_PRICES } from '@/constants/premiumPrices'
import { detectYouTubeUrls, removeYouTubeUrls } from '@/utils/youtube'
import { toast } from 'sonner'
import { LocationComboboxesMultiCountry } from '@/components/ui/LocationComboboxesMultiCountry'
import { useIBGE } from '@/hooks/useIBGE'
import { getEstadoBySigla, getEstadoByNome } from '@/lib/ibge'
import { useLocale } from '@/contexts/LocaleContext'

interface NewPostFormProps {
  onSubmit: (post: {
    description: string
    images: string[]
    service: string
    isPremium?: boolean
    pointsToSpend?: number
    durationDays?: number
    location_country?: string
    location_state?: string
    location_city?: string
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
  const { country: contextCountry } = useLocale()
  const { estados, loadCidades } = useIBGE()
  const [showLocation, setShowLocation] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>((profile as any)?.country || contextCountry || 'BR')
  const [selectedState, setSelectedState] = useState<string>(profile?.location_state || '')
  const [selectedStateSigla, setSelectedStateSigla] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>(profile?.location_city || '')
  
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

  // Inicializar estado e cidade do perfil
  useEffect(() => {
    if (profile?.location_state && profile?.location_city) {
      // Se o estado é uma sigla (2 caracteres), buscar nome completo
      if (profile.location_state.length === 2) {
        const estado = estados.find(e => e.sigla === profile.location_state)
        if (estado) {
          setSelectedState(estado.nome)
          setSelectedStateSigla(estado.sigla)
          loadCidades(estado.sigla)
        } else {
          // Tentar buscar via API
          getEstadoBySigla(profile.location_state).then(estado => {
            if (estado) {
              setSelectedState(estado.nome)
              setSelectedStateSigla(estado.sigla)
              loadCidades(estado.sigla)
            }
          }).catch(() => {
            setSelectedState(profile.location_state)
            setSelectedStateSigla(profile.location_state)
          })
        }
      } else {
        // Já é nome completo
        setSelectedState(profile.location_state)
        const estado = estados.find(e => e.nome === profile.location_state)
        if (estado) {
          setSelectedStateSigla(estado.sigla)
          loadCidades(estado.sigla)
        } else {
          getEstadoByNome(profile.location_state).then(estado => {
            if (estado) {
              setSelectedStateSigla(estado.sigla)
              loadCidades(estado.sigla)
            }
          })
        }
      }
      setSelectedCity(profile.location_city)
    }
  }, [profile, estados, loadCidades])

  const isProfessional = profile?.user_type === 'professional'
  const charCount = post.description.length
  const maxChars = 2200

  // Detectar vídeos do YouTube na descrição
  const youtubeVideos = detectYouTubeUrls(post.description)
  const hasMultipleVideos = youtubeVideos.length > 1
  const firstVideo = youtubeVideos.length > 0 ? youtubeVideos[0] : null
  
  // Ref para evitar múltiplos toasts
  const hasProcessedMultipleVideos = useRef(false)

  // Remover vídeos extras da descrição (manter apenas o primeiro)
  useEffect(() => {
    // Resetar flag se não houver múltiplos vídeos
    if (!hasMultipleVideos) {
      hasProcessedMultipleVideos.current = false
      return
    }

    // Processar apenas uma vez quando múltiplos vídeos são detectados
    if (hasMultipleVideos && youtubeVideos.length > 1 && !hasProcessedMultipleVideos.current) {
      // Manter apenas o primeiro vídeo na descrição
      const firstVideoUrl = youtubeVideos[0].url
      const otherVideoUrls = youtubeVideos.slice(1).map(v => v.url)
      
      let cleanedDescription = post.description
      // Remover URLs dos vídeos extras, mantendo apenas o primeiro
      otherVideoUrls.forEach(videoUrl => {
        // Escapar caracteres especiais da URL para usar em regex
        const escapedUrl = videoUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        cleanedDescription = cleanedDescription.replace(new RegExp(escapedUrl, 'g'), '').trim()
      })
      // Limpar espaços múltiplos e quebras de linha
      cleanedDescription = cleanedDescription.replace(/\s+/g, ' ').trim()
      
      // Atualizar descrição apenas se mudou e ainda não processamos
      if (cleanedDescription !== post.description && cleanedDescription.length > 0) {
        hasProcessedMultipleVideos.current = true
        setPost(prev => ({ ...prev, description: cleanedDescription }))
        toast.warning(
          `Apenas o primeiro vídeo do YouTube será publicado. ${youtubeVideos.length - 1} vídeo(s) extra(s) foram removidos.`,
          { duration: 4000 }
        )
      }
    }
  }, [post.description, hasMultipleVideos, youtubeVideos])

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
      // Normalizar estado: se for sigla, manter sigla; se for nome, converter para sigla se necessário
      let finalState = selectedState
      if (selectedStateSigla && selectedState.length > 2) {
        // Se temos sigla e o estado é nome completo, usar sigla para salvar (padrão do banco)
        finalState = selectedStateSigla
      } else if (selectedState.length === 2) {
        // Já é sigla
        finalState = selectedState
      } else if (selectedState && selectedState.length > 2) {
        // É nome completo, buscar sigla
        const estado = estados.find(e => e.nome === selectedState)
        if (estado) {
          finalState = estado.sigla
        }
      }
      
      // NÃO remover URLs do YouTube aqui - deixar o hook fazer isso após detectar o vídeo
      // Isso garante que o vídeo seja detectado e salvo no metadata antes de remover o link
      // IMPORTANTE: Se showLocation está true, usar os valores selecionados mesmo se vazios
      // Isso garante que quando o usuário seleciona uma cidade, ela seja salva corretamente
      const finalCity = showLocation ? (selectedCity || '') : (selectedCity || profile?.location_city || '')
      const finalStateValue = showLocation ? (finalState || '') : (finalState || profile?.location_state || '')
      
      onSubmit({
        description: post.description.trim(), // Enviar descrição completa (com link se houver)
        images: post.images,
        service: post.service,
        isPremium: post.isPremium,
        pointsToSpend: post.isPremium ? post.pointsToSpend : undefined,
        durationDays: post.isPremium ? post.durationDays : undefined,
        location_country: selectedCountry || (profile as any)?.country || 'BR',
        location_state: finalStateValue,
        location_city: finalCity
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
      {/* HEADER FIXO */}
      <div className="flex-shrink-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <button
            onClick={onCancel}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {isProfessional ? 'Novo Trabalho' : 'Compartilhar Experiência'}
          </h3>
          <LoadingButton
            onClick={handleSubmit}
            disabled={!post.description.trim() || isLoading}
            isLoading={isLoading}
            size="sm"
            className="text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4"
          >
            {isLoading ? 'Publicando...' : 'Publicar'}
          </LoadingButton>
        </div>
      </div>

      {/* SCROLL CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 sm:pb-6 bg-white dark:bg-black">
        <div className="space-y-4 sm:space-y-5 pt-3 sm:pt-4">

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
                Use @ para mencionar • Cole um link do YouTube para adicionar vídeo
              </p>
            </div>
            
            {/* Aviso sobre vídeos do YouTube */}
            {firstVideo && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                      Vídeo do YouTube detectado
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                      O vídeo será exibido acima da descrição no post
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Aviso sobre múltiplos vídeos */}
            {hasMultipleVideos && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium">
                      Múltiplos vídeos detectados
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                      Apenas o primeiro vídeo será publicado. Os demais serão removidos automaticamente.
                    </p>
                  </div>
                </div>
              </div>
            )}
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

          {/* LOCALIZAÇÃO - Botão para mostrar/esconder */}
          <div>
            <button
              type="button"
              onClick={() => {
                setShowLocation(!showLocation)
                // Scroll suave para os campos de localização quando abrir
                if (!showLocation) {
                  setTimeout(() => {
                    const locationElement = document.querySelector('[data-location-fields]')
                    locationElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }, 100)
                }
              }}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
            >
              <MapPin className={`h-4 w-4 flex-shrink-0 ${showLocation ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="font-medium">
                {showLocation ? 'Ocultar' : 'Alterar'} localização
              </span>
              {!showLocation && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto truncate">
                  {selectedCity && selectedState ? `${selectedCity}, ${selectedState}` : 'Usar localização do perfil'}
                </span>
              )}
            </button>

            {/* Campos de localização (mostrar apenas quando showLocation for true) */}
            {showLocation && (
              <div 
                data-location-fields
                className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Localização do Post
                </label>
                <LocationComboboxesMultiCountry
                  country={selectedCountry}
                  stateCode={selectedStateSigla}
                  city={selectedCity}
                  onCountryChange={(newCountry) => {
                    setSelectedCountry(newCountry)
                    setSelectedState('')
                    setSelectedStateSigla('')
                    setSelectedCity('')
                  }}
                  onStateChange={(stateCode) => {
                    setSelectedStateSigla(stateCode)
                    const estado = estados.find(e => e.sigla === stateCode)
                    if (estado) {
                      setSelectedState(estado.nome)
                      loadCidades(estado.sigla)
                    }
                    setSelectedCity('')
                  }}
                  onCityChange={(city) => {
                    setSelectedCity(city)
                  }}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Por padrão, usa a localização do seu perfil. Você pode alterar aqui.
                </p>
              </div>
            )}
          </div>

          {/* TOGGLE POST PREMIUM */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-900">
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
                          ? 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-yellow-500'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-900 cursor-not-allowed'
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
