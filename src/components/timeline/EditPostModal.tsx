'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Loader2, Info, AlertCircle } from 'lucide-react'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'
import { MentionInput } from '@/components/ui/MentionInput'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { useAuthContext } from '@/contexts/AuthContext'
import { detectYouTubeUrls, removeYouTubeUrls } from '@/utils/youtube'
import { toast } from 'sonner'

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    description: string
    images: string[]
    service?: string
  }
  onSave: (postId: string, updatedPost: {
    description: string
    images: string[]
  }) => Promise<void>
}

export function EditPostModal({ isOpen, onClose, post, onSave }: EditPostModalProps) {
  const { profile } = useAuthContext()
  const isProfessional = profile?.user_type === 'professional'
  const [isLoading, setIsLoading] = useState(false)
  const [editedPost, setEditedPost] = useState({
    description: post.description || '',
    images: post.images || [],
    service: post.service || ''
  })

  // Detectar vídeos do YouTube
  const youtubeVideos = detectYouTubeUrls(editedPost.description || '')
  const firstVideo = youtubeVideos.length > 0 ? youtubeVideos[0] : null
  const hasMultipleVideos = youtubeVideos.length > 1

  // Contador de caracteres
  const charCount = editedPost.description.length
  const maxChars = 2200

  // Ref para controlar se já processamos múltiplos vídeos
  const hasProcessedMultipleVideos = useRef(false)

  // Processar múltiplos vídeos
  useEffect(() => {
    if (hasMultipleVideos && youtubeVideos.length > 1 && !hasProcessedMultipleVideos.current) {
      // Pegar apenas o primeiro vídeo
      const firstVideoUrl = youtubeVideos[0].url
      
      // Remover todos os outros vídeos da descrição
      const otherVideoUrls = youtubeVideos.slice(1).map(v => v.url)
      let cleanedDescription = editedPost.description
      
      otherVideoUrls.forEach(videoUrl => {
        // Escapar caracteres especiais da URL para usar em regex
        const escapedUrl = videoUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        cleanedDescription = cleanedDescription.replace(new RegExp(escapedUrl, 'g'), '').trim()
      })
      // Limpar espaços múltiplos e quebras de linha
      cleanedDescription = cleanedDescription.replace(/\s+/g, ' ').trim()
      
      // Atualizar descrição apenas se mudou e ainda não processamos
      if (cleanedDescription !== editedPost.description && cleanedDescription.length > 0) {
        hasProcessedMultipleVideos.current = true
        setEditedPost(prev => ({ ...prev, description: cleanedDescription }))
        
        // Mostrar aviso apenas uma vez
        toast.warning(`${youtubeVideos.length - 1} vídeo(s) removido(s)`, {
          description: 'Apenas um vídeo por post é permitido. Apenas o primeiro vídeo será mantido.'
        })
      }
    }
    
    // Resetar o flag se não há múltiplos vídeos
    if (!hasMultipleVideos) {
      hasProcessedMultipleVideos.current = false
    }
  }, [hasMultipleVideos, youtubeVideos.length, editedPost.description])

  // Atualizar o estado quando o post mudar
  useEffect(() => {
    setEditedPost({
      description: post.description || '',
      images: post.images || [],
      service: post.service || ''
    })
  }, [post])

  const handleSave = async () => {
    if (!editedPost.description.trim()) {
      return
    }

    try {
      setIsLoading(true)
      // Remover URLs do YouTube da descrição antes de salvar
      const cleanedDescription = removeYouTubeUrls(editedPost.description.trim())
      
      await onSave(post.id, {
        description: cleanedDescription,
        images: editedPost.images
      })
      onClose()
    } catch (error) {
      console.error('Erro ao salvar post:', error)
      toast.error('Erro ao salvar post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="flex flex-col h-[85vh] max-h-[85vh] w-full max-w-2xl mx-4 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER FIXO */}
        <div className="flex-shrink-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={handleClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Editar Post
            </h3>
            <LoadingButton
              onClick={handleSave}
              disabled={!editedPost.description.trim() || isLoading}
              isLoading={isLoading}
              size="sm"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </LoadingButton>
          </div>
        </div>

        {/* SCROLL CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-white dark:bg-black min-h-0">
          <div className="space-y-4">

            {/* IMAGENS - CARROSSEL GRANDE */}
            <div>
              <ImageUploadFeed
                currentImages={editedPost.images}
                onImagesUpload={(images) => setEditedPost(prev => ({ ...prev, images }))}
                maxImages={5}
                className="rounded-xl overflow-hidden"
              />
              {editedPost.images.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-center">
                  {editedPost.images.length}/5 fotos • Arraste para reordenar
                </p>
              )}
            </div>

            {/* DESCRIÇÃO COM CONTADOR */}
            <div className="relative">
              <MentionInput
                value={editedPost.description}
                onChange={(v) => setEditedPost(prev => ({ ...prev, description: v }))}
                placeholder={isProfessional
                  ? "Descreva o trabalho, materiais, tempo, desafios..."
                  : "Conte sua experiência, o que mais gostou..."
                }
                disabled={isLoading}
                className="pr-16 min-h-24 resize-none text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                minHeight="96px"
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
                <div className="mt-1.5 p-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
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
                <div className="mt-1.5 p-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-1.5">
                Serviço <span className="text-gray-500 font-normal">(opcional)</span>
              </label>
              <ServiceAutocomplete
                value={editedPost.service}
                onChange={(v) => setEditedPost(prev => ({ ...prev, service: v }))}
                placeholder="Selecione um serviço..."
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
