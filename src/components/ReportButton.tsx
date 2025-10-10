'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Flag, AlertTriangle, User, FileText, MessageCircle, Star, MoreVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuthContext } from '@/contexts/AuthContext'

interface ReportButtonProps {
  type: 'user' | 'post' | 'message' | 'review' | 'classified'
  targetId: string
  targetName?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  asDropdownItem?: boolean
}

const REPORT_REASONS = {
  user: [
    'Comportamento inadequado',
    'Spam ou mensagens repetitivas',
    'Perfil falso ou enganoso',
    'Conteúdo ofensivo',
    'Assédio ou bullying',
    'Outros'
  ],
  post: [
    'Conteúdo inapropriado',
    'Informações falsas',
    'Spam ou propaganda',
    'Conteúdo ofensivo',
    'Violação de direitos autorais',
    'Outros'
  ],
  message: [
    'Mensagem ofensiva',
    'Spam',
    'Assédio',
    'Conteúdo inapropriado',
    'Ameaças',
    'Outros'
  ],
  review: [
    'Avaliação falsa',
    'Conteúdo ofensivo',
    'Spam',
    'Avaliação inadequada',
    'Outros'
  ],
  classified: [
    'Anúncio falso ou enganoso',
    'Preços abusivos',
    'Spam ou propaganda excessiva',
    'Conteúdo inapropriado',
    'Serviço não prestado',
    'Outros'
  ]
}

export function ReportButton({ 
  type, 
  targetId, 
  targetName, 
  className, 
  variant = 'ghost',
  size = 'sm',
  asDropdownItem = false
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium'
  })
  const { user } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error('Você precisa estar logado para fazer uma denúncia')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Por favor, preencha a descrição')
      return
    }

    setIsSubmitting(true)

    try {
      const reportData = {
        type: type, // Campo correto no banco de dados
        reason: 'Denúncia de conteúdo',
        description: formData.description.trim(),
        priority: formData.priority,
        reporter_id: user.id,
        ...(type === 'user' && { reported_user_id: targetId }),
        ...(type === 'post' && { reported_post_id: targetId }),
        ...(type === 'message' && { reported_message_id: targetId }),
        ...(type === 'review' && { reported_user_id: targetId }), // Para reviews, usar reported_user_id
        ...(type === 'classified' && { reported_classified_id: targetId })
      }

      console.log('Enviando dados da denúncia:', reportData)

      const { error } = await supabase
        .from('reports')
        .insert(reportData)

      if (error) {
        console.error('Erro ao enviar denúncia:', error)
        toast.error('Erro ao enviar denúncia. Tente novamente.')
        return
      }

      toast.success('Denúncia enviada com sucesso! Nossa equipe irá analisá-la.')
      setIsOpen(false)
      setFormData({ description: '', priority: 'medium' })
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error)
      toast.error('Erro ao enviar denúncia. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'user': return <User className="h-4 w-4" />
      case 'post': return <FileText className="h-4 w-4" />
      case 'message': return <MessageCircle className="h-4 w-4" />
      case 'review': return <Star className="h-4 w-4" />
      case 'classified': return <FileText className="h-4 w-4" />
      default: return <Flag className="h-4 w-4" />
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'user': return 'Usuário'
      case 'post': return 'Post'
      case 'message': return 'Mensagem'
      case 'review': return 'Avaliação'
      case 'classified': return 'Anúncio'
      default: return 'Item'
    }
  }

  const handleButtonClick = () => {
    setIsOpen(true)
  }

  // Se for usado como item de dropdown, renderizar apenas o botão sem Dialog
  if (asDropdownItem) {
    return (
      <button
        onClick={handleButtonClick}
        className={`flex items-center gap-1 text-gray-700 hover:text-red-600 hover:bg-red-50 w-full justify-start text-sm rounded-md px-2 py-1.5 ${className}`}
      >
        <MoreVertical className="h-3 w-3" />
        <span>Denunciar</span>
      </button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`flex items-center gap-1 text-gray-500 hover:text-red-600 hover:bg-red-50 ${className}`}
          onClick={handleButtonClick}
        >
          <MoreVertical className="h-3 w-3" />
          <span className="text-xs">Denunciar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Denunciar {getTypeLabel()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Você está denunciando: <span className="text-gray-600">{targetName || getTypeLabel()}</span>
            </Label>
          </div>


          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição detalhada *
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o problema encontrado..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="priority" className="text-sm font-medium">
              Prioridade
            </Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData({...formData, priority: value})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Importante:</strong> Denúncias falsas podem resultar em suspensão da sua conta. 
              Use este recurso com responsabilidade.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.description.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
