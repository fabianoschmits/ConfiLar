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
    <div className={`space-y-4 ${className}`}>
      {/* Preview das imagens atuais - Estilo Instagram */}
      {currentImages.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Preview ({currentImages.length}/{maxImages} imagens)
          </div>
          <div className={`grid gap-1 ${
            currentImages.length === 1 ? 'grid-cols-1' :
            currentImages.length === 2 ? 'grid-cols-2' :
            currentImages.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {currentImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Imagem ${index + 1} do trabalho`}
                  className={`w-full object-cover rounded-lg border border-gray-200 ${
                    currentImages.length === 1 ? 'h-48' :
                    currentImages.length === 2 ? 'h-32' :
                    currentImages.length === 3 && index === 0 ? 'h-48' : 'h-24'
                  }`}
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover imagem"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de upload */}
      {canAddMore && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
            }
            ${currentImages.length > 0 ? 'bg-gray-50' : 'bg-white'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-3">
            {isUploading || isCompressing ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-blue-600">
                  {isCompressing ? `Comprimindo... ${compressionProgress}%` : 'Fazendo upload...'}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  {currentImages.length > 0 ? (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">
                    {currentImages.length > 0
                      ? 'Clique para adicionar mais fotos ou arraste novas imagens'
                      : 'Clique para selecionar fotos ou arraste imagens'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG ou WebP • Será comprimido para 1MB e 1080px • {currentImages.length}/{maxImages} imagens
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Botão clicado - abrindo diálogo')
                    openFileDialog()
                  }}
                  className="mt-2"
                >
                  {currentImages.length > 0 ? 'Adicionar Mais Fotos' : 'Selecionar Fotos'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mensagem quando limite atingido */}
      {!canAddMore && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            Limite de {maxImages} imagens atingido. Remova algumas para adicionar novas.
          </p>
        </div>
      )}

      {/* Dicas */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Use fotos de boa qualidade para mostrar seu trabalho</p>
        <p>• Mostre antes e depois quando possível</p>
        <p>• Inclua detalhes dos materiais e acabamentos</p>
      </div>
    </div>
  )
}



