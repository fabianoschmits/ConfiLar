'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'
import { MentionInput } from '@/components/ui/MentionInput'
import { Edit, Loader2 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    title: string
    description: string
    images: string[]
    service?: string
  }
  onSave: (postId: string, updatedPost: {
    title: string
    description: string
    images: string[]
  }) => Promise<void>
}

export function EditPostModal({ isOpen, onClose, post, onSave }: EditPostModalProps) {
  const { profile } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [editedPost, setEditedPost] = useState({
    title: post.title,
    description: post.description,
    images: post.images,
    service: post.service || ''
  })

  // Atualizar o estado quando o post mudar
  useEffect(() => {
    setEditedPost({
      title: post.title,
      description: post.description,
      images: post.images,
      service: post.service || ''
    })
  }, [post])

  const handleSave = async () => {
    if (!editedPost.title.trim() || !editedPost.description.trim()) {
      return
    }

    try {
      setIsLoading(true)
      await onSave(post.id, {
        title: editedPost.title,
        description: editedPost.description,
        images: editedPost.images
      })
      onClose()
    } catch (error) {
      console.error('Erro ao salvar post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Post"
      size="lg"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
            <Edit className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Editar seu post</h3>
          <p className="text-gray-600 mb-4">
            Faça as alterações necessárias no seu post
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Serviço</label>
            <ServiceAutocomplete
              value={editedPost.service}
              onChange={(value) => setEditedPost({ ...editedPost, service: value })}
              placeholder="Selecione um serviço..."
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Título do Trabalho</label>
            <MentionInput
              value={editedPost.title}
              onChange={(value) => setEditedPost({ ...editedPost, title: value })}
              placeholder={profile?.user_type === 'professional' 
                ? "Ex: Reforma de Cozinha Moderna - Antes e Depois"
                : "Ex: Serviço de Limpeza Incrível!"
              }
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minHeight="40px"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Descrição</label>
            <MentionInput
              value={editedPost.description}
              onChange={(value) => setEditedPost({ ...editedPost, description: value })}
              placeholder={profile?.user_type === 'professional'
                ? "Descreva o trabalho realizado, materiais usados, tempo de execução, desafios superados..."
                : "Conte como foi a experiência, o que mais gostou, recomendações para outros clientes..."
              }
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minHeight="100px"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Fotos do Trabalho</label>
            <ImageUploadFeed
              currentImages={editedPost.images}
              onImagesUpload={(images) => setEditedPost({ ...editedPost, images })}
              maxImages={5}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!editedPost.title.trim() || !editedPost.description.trim() || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
