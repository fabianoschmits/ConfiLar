/**
 * Utilitários para trabalhar com vídeos do YouTube
 */

export interface YouTubeVideoInfo {
  id: string
  url: string
  title?: string
  thumbnail?: string
}

/**
 * Extrai o ID do vídeo do YouTube de uma URL
 * Suporta diferentes formatos de URL do YouTube
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null

  // Remove espaços e quebras de linha
  const cleanUrl = url.trim()

  // Padrões de URL do YouTube
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/v/VIDEO_ID
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Detecta se uma string contém URLs do YouTube
 */
export function detectYouTubeUrls(text: string): YouTubeVideoInfo[] {
  if (!text) return []

  const urls: YouTubeVideoInfo[] = []
  
  // Regex para encontrar URLs (incluindo youtube)
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = text.match(urlRegex)

  if (matches) {
    for (const url of matches) {
      const videoId = extractYouTubeVideoId(url)
      if (videoId) {
        urls.push({
          id: videoId,
          url: url,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        })
      }
    }
  }

  return urls
}

/**
 * Remove URLs do YouTube do texto, mantendo apenas o texto
 */
export function removeYouTubeUrls(text: string): string {
  if (!text) return text

  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, (url) => {
    const videoId = extractYouTubeVideoId(url)
    return videoId ? '' : url
  }).trim()
}

/**
 * Gera URL de embed do YouTube
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`
}

/**
 * Gera URL de thumbnail do YouTube
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'maxres'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
}

/**
 * Busca informações do vídeo do YouTube usando a API pública
 * Nota: Esta é uma implementação simples que pode não funcionar devido a CORS
 * Em produção, seria melhor usar uma API route do Next.js
 */
export async function getYouTubeVideoInfo(videoId: string): Promise<{ title: string; description: string } | null> {
  try {
    // Tentativa de usar a API pública do YouTube (pode falhar por CORS)
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    
    if (response.ok) {
      const data = await response.json()
      return {
        title: data.title || 'Vídeo do YouTube',
        description: data.author_name || 'YouTube'
      }
    }
  } catch (error) {
    console.log('Erro ao buscar informações do vídeo:', error)
  }
  
  return null
}

/**
 * Hook para buscar informações do vídeo (versão simplificada)
 * Retorna informações básicas baseadas no ID do vídeo
 */
export function getYouTubeVideoTitle(videoId: string): string {
  // Por enquanto, retornamos um título genérico
  // Em uma implementação completa, isso seria buscado via API
  return 'Vídeo do YouTube'
}
