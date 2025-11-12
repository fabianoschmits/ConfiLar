'use client'

import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface YouTubePlayerProps {
  videoId: string
  title?: string
  thumbnail?: string
  className?: string
}

export function YouTubePlayer({ 
  videoId, 
  title, 
  thumbnail,
  className = '' 
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
    setIsLoading(true)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
  }

  if (isPlaying) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
          title={title || 'YouTube Video'}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
        />
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div className="relative group cursor-pointer h-full w-full" onClick={handlePlay}>
        {/* Thumbnail */}
        <div className="relative w-full h-full bg-gray-100 dark:bg-gray-900">
          <img
            src={thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title || 'YouTube Video Thumbnail'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback para thumbnail padrão se a imagem falhar
              const target = e.target as HTMLImageElement
              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            }}
          />
          
          {/* Overlay com botão de play */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200">
            <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-all duration-200">
              <Play className="h-8 w-8 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Badge do YouTube */}
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            YouTube
          </div>
        </div>
      </div>
    </div>
  )
}
