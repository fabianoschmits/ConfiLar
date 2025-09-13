'use client'

import { useState } from 'react'
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
    <div className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="p-2 bg-black border-2 border-black">
            <UserAvatar
              src={review.reviewer.avatar_url}
              alt={review.reviewer.full_name}
              fallback={review.reviewer.full_name.charAt(0)}
              size="lg"
            />
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-black truncate text-lg">
                  {review.reviewer.full_name.toUpperCase()}
                </h3>
                <div className="px-2 py-1 bg-blue-500 text-white border-2 border-black font-black text-xs">
                  {review.reviewer.user_type === 'professional' ? 'PROFISSIONAL' : 'CLIENTE'}
                </div>
                {review.rating_person >= 4 && (
                  <div className="px-2 py-1 bg-green-500 text-white border-2 border-black font-black text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    RECOMENDADO
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 border-2 border-black font-black text-sm ${
                  review.rating_person === 5 ? 'bg-green-500 text-white' :
                  review.rating_person === 4 ? 'bg-blue-500 text-white' :
                  review.rating_person === 3 ? 'bg-yellow-500 text-black' :
                  review.rating_person === 2 ? 'bg-orange-500 text-white' :
                  review.rating_person === 1 ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {review.rating_person}★ {getRatingText(review.rating_person).toUpperCase()}
                </div>
                <span className="text-xs text-black font-bold">
                  {formatDate(review.created_at).toUpperCase()}
                </span>
                
                {showActions && (isOwner || isReviewed) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-gray-500 text-white border-2 border-black hover:bg-gray-600 font-black">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-4 border-black">
                      {isOwner && onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(review)} className="font-black">
                          <Edit className="h-4 w-4 mr-2" />
                          EDITAR
                        </DropdownMenuItem>
                      )}
                      {isOwner && onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(review.id)}
                          className="text-red-600 font-black"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          EXCLUIR
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Estrelas */}
            <div className="flex items-center mb-4">
              {renderStars(review.rating_person)}
            </div>

            {/* Comentário */}
            {review.comment && (
              <div className="bg-gray-100 border-2 border-black p-4 mb-4">
                <p className="text-black font-bold whitespace-pre-wrap">
                  {review.comment.toUpperCase()}
                </p>
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="flex items-center gap-4 text-sm text-black font-bold mb-4">
              {/* Informações adicionais podem ser adicionadas aqui no futuro */}
            </div>

            {/* Formulário de Resposta */}
            {showResponseForm && (
              <div className="bg-yellow-400 border-4 border-black p-4 mb-4">
                <Textarea
                  placeholder="DIGITE SUA RESPOSTA..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                  className="mb-3 border-2 border-black font-black"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setShowResponseForm(false)
                      setResponseText('')
                    }}
                    className="bg-red-500 text-white border-2 border-black hover:bg-red-600 font-black"
                  >
                    CANCELAR
                  </Button>
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={isSubmittingResponse || !responseText.trim()}
                    className="bg-green-500 text-white border-2 border-black hover:bg-green-600 font-black"
                  >
                    {isSubmittingResponse ? 'ENVIANDO...' : 'RESPONDER'}
                  </Button>
                </div>
              </div>
            )}

            {/* Ações */}
            {showActions && (
              <div className="flex items-center gap-2">
                {isReviewed && !showResponseForm && (
                  <Button
                    onClick={() => setShowResponseForm(true)}
                    className="bg-blue-500 text-white border-2 border-black hover:bg-blue-600 font-black"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    RESPONDER
                  </Button>
                )}
                
                {!isOwner && onMarkHelpful && (
                  <Button
                    onClick={handleMarkHelpful}
                    className="bg-green-500 text-white border-2 border-black hover:bg-green-600 font-black"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    ÚTIL
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
