import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'
import { useAuthContext } from '@/contexts/AuthContext'

interface NewPostFormProps {
  onSubmit: (post: {
    title: string
    description: string
    images: string[]
    service: string
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

export function NewPostForm({ onSubmit, onCancel, isLoading = false }: NewPostFormProps) {
  const { profile } = useAuthContext()
  const [post, setPost] = useState({
    title: '',
    description: '',
    images: [] as string[],
    service: ''
  })

  const handleSubmit = () => {
    if (post.title.trim() && post.description.trim() && post.service) {
      onSubmit(post)
      setPost({ title: '', description: '', images: [], service: '' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full">
          <ImageIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Compartilhar Trabalho</h3>
        <p className="text-sm text-gray-500">Mostre aos clientes o que você é capaz de fazer</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Serviço</label>
          <ServiceAutocomplete
            value={post.service}
            onChange={(value) => setPost({ ...post, service: value })}
            placeholder="Selecione um serviço..."
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Título do Trabalho</label>
          <Input
            placeholder="Ex: Reforma de Cozinha Moderna"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Descrição</label>
          <Textarea
            placeholder="Descreva o trabalho realizado, materiais usados, desafios superados..."
            value={post.description}
            onChange={(e) => setPost({ ...post, description: e.target.value })}
            className="min-h-[100px]"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Fotos do Trabalho</label>
          <ImageUploadFeed
            currentImages={post.images}
            onImagesUpload={(images) => setPost({ ...post, images })}
            maxImages={5}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!post.title.trim() || !post.description.trim() || !post.service || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Publicar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}