import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { ServiceAutocomplete } from '@/components/ui/ServiceAutocomplete'
import { MentionInput } from '@/components/ui/MentionInput'
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
  postStatus?: 'idle' | 'sending' | 'sent'
}

export function NewPostForm({ onSubmit, onCancel, isLoading = false, postStatus = 'idle' }: NewPostFormProps) {
  const { profile } = useAuthContext()
  const [post, setPost] = useState({
    title: '',
    description: '',
    images: [] as string[],
    service: ''
  })

  const handleSubmit = () => {
    if (post.title.trim() && post.description.trim()) {
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Compartilhe seu trabalho!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {profile?.user_type === 'professional' 
                  ? 'Mostre aos clientes o que você é capaz de fazer e inspire outros profissionais'
                  : 'Compartilhe trabalhos que foram feitos para você e ajude outros a encontrar bons profissionais'
                }
              </p>
            </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Título do Trabalho</label>
          <MentionInput
            value={post.title}
            onChange={(value) => setPost({ ...post, title: value })}
            placeholder={profile?.user_type === 'professional' 
              ? "Ex: Reforma de Cozinha Moderna - Antes e Depois"
              : "Ex: Serviço de Limpeza Incrível!"
            }
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minHeight="40px"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Dica: Use um título que chame atenção e descreva o resultado • Digite @ para mencionar alguém
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Descrição</label>
          <MentionInput
            value={post.description}
            onChange={(value) => setPost({ ...post, description: value })}
            placeholder={profile?.user_type === 'professional'
              ? "Descreva o trabalho realizado, materiais usados, tempo de execução, desafios superados..."
              : "Conte como foi a experiência, o que mais gostou, recomendações para outros clientes..."
            }
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minHeight="100px"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Dica: Seja específico! Detalhes ajudam outros a entenderem melhor o trabalho • Digite @ para mencionar alguém
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Serviço <span className="text-gray-500 dark:text-gray-400 font-normal">(opcional)</span>
          </label>
          <ServiceAutocomplete
            value={post.service}
            onChange={(value) => setPost({ ...post, service: value })}
            placeholder="Selecione um serviço..."
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Fotos do Trabalho <span className="text-gray-500 dark:text-gray-400 font-normal">(opcional)</span>
          </label>
          <ImageUploadFeed
            currentImages={post.images}
            onImagesUpload={(images) => setPost({ ...post, images })}
            maxImages={5}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            📸 Fotos são opcionais, mas posts com imagens recebem mais atenção!
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Mensagem de status */}
        {postStatus !== 'idle' && (
          <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
            postStatus === 'sending' 
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
              : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
          }`}>
            {postStatus === 'sending' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Enviando post...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Post enviado com sucesso!</span>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            disabled={!post.title.trim() || !post.description.trim() || isLoading}
            isLoading={isLoading}
            loadingText="Publicando..."
            className="min-w-[120px]"
          >
            <Send className="h-4 w-4 mr-2" />
            Publicar
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}