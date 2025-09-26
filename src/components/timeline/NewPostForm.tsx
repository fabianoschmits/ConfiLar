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
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compartilhe seu trabalho!</h3>
              <p className="text-gray-600 mb-4">
                {profile?.user_type === 'professional' 
                  ? 'Mostre aos clientes o que você é capaz de fazer e inspire outros profissionais'
                  : 'Compartilhe trabalhos que foram feitos para você e ajude outros a encontrar bons profissionais'
                }
              </p>
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
            placeholder={profile?.user_type === 'professional' 
              ? "Ex: Reforma de Cozinha Moderna - Antes e Depois"
              : "Ex: Serviço de Limpeza Incrível!"
            }
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Dica: Use um título que chame atenção e descreva o resultado
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Descrição</label>
          <Textarea
            placeholder={profile?.user_type === 'professional'
              ? "Descreva o trabalho realizado, materiais usados, tempo de execução, desafios superados..."
              : "Conte como foi a experiência, o que mais gostou, recomendações para outros clientes..."
            }
            value={post.description}
            onChange={(e) => setPost({ ...post, description: e.target.value })}
            className="min-h-[100px]"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Dica: Seja específico! Detalhes ajudam outros a entenderem melhor o trabalho
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Fotos do Trabalho</label>
          <ImageUploadFeed
            currentImages={post.images}
            onImagesUpload={(images) => setPost({ ...post, images })}
            maxImages={5}
          />
          <p className="text-xs text-gray-500 mt-1">
            📸 Dica: Fotos de antes e depois são muito valorizadas! Mostre o processo e o resultado final
          </p>
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