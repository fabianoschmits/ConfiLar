'use client'

import { useState, useRef } from 'react'
import { X, Camera, Upload, Loader2 } from 'lucide-react'
import { useStories } from '@/hooks/useStories'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface CreateStoryModalProps {
  isOpen: boolean
  onClose: () => void
  onStoryCreated?: () => void
}

export function CreateStoryModal({ isOpen, onClose, onStoryCreated }: CreateStoryModalProps) {
  const { user } = useAuthContext()
  const { createStory, isCreating } = useStories()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo - APENAS imagens, SEM vídeos
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem (foto)')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 10MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Armazenar o arquivo e criar preview (aceita qualquer resolução/orientação)
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.onerror = () => {
      toast.error('Erro ao carregar a imagem')
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedImage || !selectedFile || !user?.id) {
      console.error('❌ Erro: dados incompletos', { 
        hasImage: !!selectedImage, 
        hasFile: !!selectedFile, 
        hasUserId: !!user?.id 
      })
      toast.error('Erro: dados incompletos. Por favor, selecione a foto novamente.')
      return
    }

    const file = selectedFile

    console.log('📤 Iniciando upload do story...', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      userId: user.id 
    })

    setIsUploading(true)

    try {
      // Upload da imagem para o Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = `stories/${fileName}`

      console.log('📁 Caminho do arquivo:', filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('feed-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError)
        throw new Error(`Erro no upload: ${uploadError.message}`)
      }

      console.log('✅ Upload bem-sucedido:', uploadData)

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('feed-images')
        .getPublicUrl(filePath)

      console.log('🔗 URL pública:', publicUrl)

      // Criar story
      console.log('💾 Criando story no banco...')
      const storyData = await createStory(publicUrl)
      console.log('✅ Story criado:', storyData)

      toast.success('Story publicado com sucesso!')
      setSelectedImage(null)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onStoryCreated?.()
      onClose()
    } catch (error: any) {
      console.error('❌ Erro completo ao criar story:', error)
      const errorMessage = error?.message || error?.toString() || 'Erro desconhecido ao criar story'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-black rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Criar Story
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {!selectedImage ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Clique para selecionar uma foto
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PNG, JPG ou WEBP até 10MB
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                  Qualquer resolução ou orientação
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative w-full max-h-[600px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 pb-2 flex-shrink-0 sticky bottom-0 bg-white dark:bg-black">
                <button
                  onClick={() => {
                    setSelectedImage(null)
                    setSelectedFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  Trocar Foto
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || isCreating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {(isUploading || isCreating) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Publicar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

