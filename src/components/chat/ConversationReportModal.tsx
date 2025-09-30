'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Flag, AlertTriangle, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuthContext } from '@/contexts/AuthContext'

interface ConversationReportModalProps {
  conversationId: string
  clientId: string
  clientName: string
  professionalId: string
  professionalName: string
  messages: any[]
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

export function ConversationReportModal({ 
  conversationId,
  clientId,
  clientName,
  professionalId,
  professionalName,
  messages,
  className,
  variant = 'ghost',
  size = 'sm'
}: ConversationReportModalProps) {
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
        report_type: 'other', // Usando 'other' pois não há tipo 'conversation' na tabela
        reason: 'Denúncia de conversa completa',
        description: formData.description.trim(),
        priority: formData.priority,
        reporter_id: user.id,
        status: 'pending'
      }

      console.log('Enviando denúncia de conversa:', reportData)

      const { error } = await supabase
        .from('reports')
        .insert(reportData)

      if (error) {
        console.error('Erro ao enviar denúncia:', error)
        toast.error('Erro ao enviar denúncia. Tente novamente.')
        return
      }

      toast.success('Denúncia de conversa enviada com sucesso! Nossa equipe irá analisá-la.')
      setIsOpen(false)
      setFormData({ description: '', priority: 'medium' })
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error)
      toast.error('Erro ao enviar denúncia. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`flex items-center gap-1 text-gray-500 hover:text-red-600 hover:bg-red-50 ${className}`}
        >
          <Flag className="h-3 w-3" />
          <span className="text-xs">Denunciar Conversa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Denunciar Conversa Completa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Você está denunciando uma conversa completa
            </Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <p><strong>Conversa entre:</strong> {clientName} e {professionalName}</p>
                <p><strong>Total de mensagens:</strong> {messages.length}</p>
                <p><strong>IDs dos usuários:</strong> Cliente: {clientId} | Profissional: {professionalId}</p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição detalhada do problema *
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o problema encontrado na conversa..."
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
              <strong>Importante:</strong> Esta denúncia enviará toda a conversa para análise da administração. 
              Denúncias falsas podem resultar em suspensão da sua conta.
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
