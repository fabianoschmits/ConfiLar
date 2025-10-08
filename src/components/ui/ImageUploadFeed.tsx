'use client'

import { useState, useRef } from 'react'
import { Camera, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from './button'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { useImageCompression } from '@/hooks/useImageCompression'

interface ImageUploadFeedProps {
  onImagesUpload: (imageUrls: string[]) => void
  currentImages: string[]
  maxImages?: number
  className?: string
}

export function ImageUploadFeed({
  onImagesUpload,
  currentImages = [],
  maxImages = 5,
  className = ''
}: ImageUploadFeedProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthContext()
  const { compressImage, isCompressing, compressionProgress } = useImageCompression()

  const handleFileUpload = async (files: FileList) => {
    console.log('Iniciando upload de', files.length, 'arquivos')
    
    if (files.length === 0) {
      console.log('Nenhum arquivo selecionado')
      return
    }

    if (!user) {
      alert('Você precisa estar logado para fazer upload de imagens')
      return
    }

    // Verificar limite de imagens
    if (currentImages.length + files.length > maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens.`)
      return
    }

    try {
      setIsUploading(true)
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(`Processando arquivo ${i + 1}:`, file.name, file.type, file.size)

        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          console.log('Tipo de arquivo não permitido:', file.type)
          alert('Por favor, selecione apenas imagens (JPG, PNG ou WebP)')
          continue
        }

        // Comprimir imagem antes do upload
        console.log('Comprimindo imagem...')
        const compressedFile = await compressImage(file, {
          maxSizeMB: 1, // 1MB máximo após compressão
          maxWidthOrHeight: 1080 // 1080px máximo
        })
        
        console.log('Imagem comprimida:', {
          original: file.size,
          compressed: compressedFile.size,
          reduction: Math.round((1 - compressedFile.size / file.size) * 100) + '%'
        })

        // Gerar nome único para o arquivo
        const fileExt = file.name.split('.').pop()
        const fileName = `feed/${Date.now()}-${Math.random().toString(36).substring(2)}-${i}.${fileExt}`
        console.log('Nome do arquivo gerado:', fileName)

        // Upload para o bucket de imagens do feed
        console.log('Iniciando upload para Supabase...')
        const { data, error } = await supabase.storage
          .from('feed-images')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Erro no upload do Supabase:', error)
          throw error
        }

        console.log('Upload bem-sucedido:', data)

        // Obter URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('feed-images')
          .getPublicUrl(fileName)

        console.log('URL pública gerada:', publicUrl)
        uploadedUrls.push(publicUrl)
      }

      console.log('Todas as imagens foram processadas:', uploadedUrls)

      // Adicionar novas imagens às existentes
      const allImages = [...currentImages, ...uploadedUrls]
      console.log('Imagens finais:', allImages)
      onImagesUpload(allImages)

    } catch (error) {
      console.error('Erro no upload:', error)
      alert(`Erro ao fazer upload das imagens: ${error.message || 'Tente novamente.'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      handleFileUpload(files)
      // Reset do input para permitir selecionar o mesmo arquivo novamente
      event.target.value = ''
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files) {
      handleFileUpload(files)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index)
    onImagesUpload(newImages)
  }

  const openFileDialog = () => {
    console.log('Abrindo diálogo de arquivo')
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const canAddMore = currentImages.length < maxImages

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Preview das imagens atuais - Versão Compacta */}
      {currentImages.length > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex gap-2 flex-wrap justify-center max-w-md">
            {currentImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Imagem ${index + 1}`}
                  className="w-32 h-32 object-cover rounded border border-gray-300"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão de upload compacto e centralizado */}
      {canAddMore && (
        <div className="flex justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading || isCompressing ? (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {isCompressing ? `Comprimindo... ${compressionProgress}%` : 'Enviando...'}
              </span>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                openFileDialog()
              }}
              className="text-xs"
            >
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              {currentImages.length > 0 ? `Adicionar Fotos (${currentImages.length}/${maxImages})` : 'Selecionar Fotos'}
            </Button>
          )}
        </div>
      )}

      {/* Mensagem quando limite atingido */}
      {!canAddMore && (
        <div className="text-center">
          <p className="text-yellow-600 text-xs">
            Máximo de {maxImages} imagens atingido
          </p>
        </div>
      )}
    </div>
  )
}



