'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Calendar, 
  CheckCircle,
  Reply,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ReviewWithProfiles } from '@/hooks/useSupabaseReviews'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ReviewCardProps {
  review: ReviewWithProfiles
  currentUserId?: string
  onEdit?: (review: ReviewWithProfiles) => void
  onDelete?: (reviewId: string) => void
  onRespond?: (reviewId: string, response: string) => void
  onMarkHelpful?: (reviewId: string) => void
  showActions?: boolean
}

export function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onRespond,
  onMarkHelpful,
  showActions = true
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  const isOwner = currentUserId === review.reviewer.id
  const isReviewed = currentUserId === review.reviewed.id

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5: return 'Excelente'
      case 4: return 'Muito Bom'
      case 3: return 'Bom'
      case 2: return 'Regular'
      case 1: return 'Ruim'
      default: return 'Sem avaliação'
    }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5: return 'bg-green-100 text-green-800'
      case 4: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 2: return 'bg-orange-100 text-orange-800'
      case 1: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Digite uma resposta')
      return
    }

    setIsSubmittingResponse(true)
    try {
      await onRespond?.(review.id, responseText.trim())
      setResponseText('')
      setShowResponseForm(false)
      toast.success('Resposta enviada com sucesso!')
    } catch (error) {
      toast.error('Erro ao enviar resposta')
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  const handleMarkHelpful = async () => {
    try {
      await onMarkHelpful?.(review.id)
      toast.success('Marcado como útil!')
    } catch (error) {
      toast.error('Erro ao marcar como útil')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Data inválida'
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <UserAvatar
            src={review.reviewer.avatar_url}
            alt={review.reviewer.full_name}
            fallback={review.reviewer.full_name.charAt(0)}
            size="lg"
          />

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {review.reviewer.full_name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {review.reviewer.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                </Badge>
                {review.rating_person >= 4 && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Recomendado
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getRatingColor(review.rating_person)}>
                  {review.rating_person}★ {getRatingText(review.rating_person)}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDate(review.created_at)}
                </span>
                
                {showActions && (isOwner || isReviewed) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner && onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(review)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {isOwner && onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(review.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Estrelas */}
            <div className="flex items-center mb-3">
              {renderStars(review.rating_person)}
            </div>

            {/* Comentário */}
            {review.comment && (
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                {review.comment}
              </p>
            )}

            {/* Informações Adicionais */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              {/* Informações adicionais podem ser adicionadas aqui no futuro */}
            </div>

            {/* Formulário de Resposta */}
            {showResponseForm && (
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                  className="mb-3"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowResponseForm(false)
                      setResponseText('')
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitResponse}
                    disabled={isSubmittingResponse || !responseText.trim()}
                  >
                    {isSubmittingResponse ? 'Enviando...' : 'Responder'}
                  </Button>
                </div>
              </div>
            )}

            {/* Ações */}
            {showActions && (
              <div className="flex items-center gap-2">
                {isReviewed && !showResponseForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResponseForm(true)}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Responder
                  </Button>
                )}
                
                {!isOwner && onMarkHelpful && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkHelpful}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Útil
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
