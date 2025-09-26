import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, X, Image as ImageIcon } from 'lucide-react'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'
import { useAuthContext } from '@/contexts/AuthContext'

interface NewPostFormProps {
  onSubmit: (post: {
    title: string
    description: string
    images: string[]
    category: string
  }) => void
  onCancel: () => void
}

export function NewPostForm({ onSubmit, onCancel }: NewPostFormProps) {
  const { profile } = useAuthContext()
  const [post, setPost] = useState({
    title: '',
    description: '',
    images: [] as string[],
    category: ''
  })

  const categories = [
    'Construção e Reforma',
    'Limpeza',
    'Tecnologia',
    'Beleza',
    'Transporte',
    'Educação',
    'Saúde',
    'Eventos',
    'Jardinagem',
    'Pet Care'
  ]

  const handleSubmit = () => {
    if (post.title.trim() && post.description.trim() && post.category) {
      onSubmit(post)
      setPost({ title: '', description: '', images: [], category: '' })
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Compartilhar Trabalho</span>
        </CardTitle>
        <CardDescription>
          Mostre aos clientes o que você é capaz de fazer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Categoria do Serviço</label>
          <Select value={post.category} onValueChange={(value) => setPost({ ...post, category: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Título do Trabalho</label>
          <Input
            placeholder="Ex: Reforma de Cozinha Moderna"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Descrição</label>
          <Textarea
            placeholder="Descreva o trabalho realizado, materiais usados, tempo de execução..."
            value={post.description}
            onChange={(e) => setPost({ ...post, description: e.target.value })}
            className="mt-1"
            rows={3}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Fotos do Trabalho</label>
          <div className="mt-1">
            <ImageUploadFeed
              onImagesUpload={(imageUrls) => setPost({ ...post, images: imageUrls })}
              currentImages={post.images}
              maxImages={5}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            className="flex-1"
            disabled={!post.title.trim() || !post.description.trim() || post.images.length === 0}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4 mr-2" />
            {post.images.length === 0 ? 'Adicione fotos primeiro' : 'Publicar Trabalho'}
          </Button>
          <Button 
            variant="outline"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
