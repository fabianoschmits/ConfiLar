'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Heart, Coins, Play } from 'lucide-react'
import { YouTubePlayer } from '@/components/ui/YouTubePlayer'
import { detectYouTubeUrls } from '@/utils/youtube'

interface PostMediaProps {
  images: string[]
  description?: string
  youtubeVideoId?: string | null
  onDoubleClick?: () => void
  isLiking?: boolean
  isPremiumLiking?: boolean
}

export function PostMedia({ 
  images, 
  description = '', 
  youtubeVideoId,
  onDoubleClick,
  isLiking = false,
  isPremiumLiking = false
}: PostMediaProps) {
  // Detectar vídeos do YouTube: primeiro verificar se há vídeo passado via prop (metadata), depois descrição
  // Isso permite que o componente receba o vídeo diretamente (via metadata) ou detecte na descrição (posts antigos)
  const firstVideo = youtubeVideoId 
    ? { id: youtubeVideoId, url: '', thumbnail: `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg` }
    : (detectYouTubeUrls(description).length > 0 ? detectYouTubeUrls(description)[0] : null)
  
  // Combinar mídia: vídeo primeiro (se houver), depois fotos
  const allMedia: Array<{ type: 'image' | 'video', content: string }> = [
    ...(firstVideo ? [{ type: 'video' as const, content: firstVideo.id }] : []),
    ...images.map(img => ({ type: 'image' as const, content: img }))
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentMedia = allMedia[currentIndex]
  const hasMultipleMedia = allMedia.length > 1
  const canGoPrev = hasMultipleMedia && currentIndex > 0
  const canGoNext = hasMultipleMedia && currentIndex < allMedia.length - 1

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // Se não há mídia, retornar null
  if (allMedia.length === 0) {
    return null
  }

  return (
    <div 
      className="relative w-full aspect-square bg-gray-100 dark:bg-gray-900"
      onDoubleClick={onDoubleClick}
    >
      {/* Conteúdo atual (foto ou vídeo) */}
      {currentMedia.type === 'image' ? (
        <Image
          src={currentMedia.content}
          alt="Post"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 640px"
        />
      ) : (
        <div className="w-full h-full bg-black relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full">
              <YouTubePlayer
                videoId={currentMedia.content}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Animações de like */}
      {isLiking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart className="h-20 w-20 text-red-500 fill-red-500 animate-ping" />
        </div>
      )}
      {isPremiumLiking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="relative h-20 w-20">
            <Coins 
              className="h-20 w-20 absolute inset-0 text-yellow-500 animate-ping"
              style={{
                fill: '#eab308',
                stroke: 'none',
                zIndex: 1
              }}
            />
            <Coins 
              className="h-20 w-20 absolute inset-0 text-gray-700 dark:text-gray-300 animate-ping"
              style={{
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 3,
                zIndex: 2
              }}
            />
          </div>
        </div>
      )}

      {/* Seta esquerda (anterior) - mais transparente */}
      {canGoPrev && (
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
      )}

      {/* Seta direita (próximo) - mais transparente */}
      {canGoNext && (
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100"
          aria-label="Próximo"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      )}

      {/* Indicadores de posição (miniaturas das fotos) */}
      {hasMultipleMedia && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 items-center justify-center">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`relative transition-all duration-200 rounded-full overflow-hidden border-2 backdrop-blur-sm ${
                index === currentIndex
                  ? 'w-10 h-10 border-white/80 shadow-lg scale-110 opacity-90'
                  : 'w-8 h-8 border-white/40 opacity-30 hover:opacity-50 hover:scale-105'
              }`}
              aria-label={`Ir para ${index + 1}`}
            >
              {media.type === 'image' ? (
                <div className="w-full h-full opacity-90">
                  <Image
                    src={media.content}
                    alt={`Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-black relative opacity-90">
                  <img
                    src={`https://img.youtube.com/vi/${media.content}/hqdefault.jpg`}
                    alt="Vídeo do YouTube"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://img.youtube.com/vi/${media.content}/default.jpg`
                    }}
                  />
                  {/* Ícone de play sobre a miniatura do vídeo */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5 opacity-80" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

