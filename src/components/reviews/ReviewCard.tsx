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
  MoreVertical,
  Flag
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
import { ReportButton } from '@/components/ReportButton'

interface ReviewCardProps {
  review: ReviewWithProfiles
  currentUserId?: string
  onEdit?: (review: ReviewWithProfiles) => void
  onDelete?: (reviewId: string) => void
  onRespond?: (reviewId: string, response: string) => void
  onMarkHelpful?: (reviewId: string) => void
  showActions?: boolean
  profileOwnerId?: string // ID do dono do perfil (quem foi avaliado)
}

export function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onRespond,
  onMarkHelpful,
  showActions = true,
  profileOwnerId
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)
  const [isEditingResponse, setIsEditingResponse] = useState(false)

  const isOwner = currentUserId === review.reviewer.id
  const isReviewed = currentUserId === review.reviewed.id
  const isProfileOwner = currentUserId === profileOwnerId

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
      setIsEditingResponse(false)
      toast.success(isEditingResponse ? 'Resposta editada com sucesso!' : 'Resposta enviada com sucesso!')
    } catch (error) {
      toast.error('Erro ao enviar resposta')
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  const handleEditResponse = () => {
    setResponseText(review.response_text || '')
    setIsEditingResponse(true)
    setShowResponseForm(true)
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
    <div className="modern-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="modern-heading-3 text-gray-900 truncate">
                  {review.reviewer.full_name}
                </h3>
                <span className="modern-badge-primary">
                  {review.reviewer.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                </span>
                {(review as any).is_recommended && (
                  <span className="modern-badge-success flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Recomendado
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Estrelas */}
                <div className="flex items-center">
                  {renderStars(review.rating_person)}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(review.rating_person)}`}>
                  {getRatingText(review.rating_person)}
                </span>
                <span className="modern-caption">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="modern-card">
                  {isOwner && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(review)} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {isOwner && onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(review.id)}
                      className="text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  )}
                  {isProfileOwner && review.response_text && (
                    <DropdownMenuItem 
                      onClick={handleEditResponse}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Resposta
                    </DropdownMenuItem>
                  )}
                  {isProfileOwner && onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(review.id)}
                      className="text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover Avaliação
                    </DropdownMenuItem>
                  )}
                  {!isOwner && !isProfileOwner && (
                    <DropdownMenuItem asChild>
                      <ReportButton 
                        type="review" 
                        targetId={review.id}
                        targetName="Avaliação"
                        asDropdownItem={true}
                        className="w-full justify-start p-0 h-auto font-normal"
                      />
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Título da Avaliação */}
          {(review as any).title && (
            <div className="mb-3">
              <h4 className="font-semibold text-gray-900 text-lg">
                {(review as any).title}
              </h4>
            </div>
          )}

          {/* Comentário */}
          {review.comment && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
              <p className="modern-body text-gray-700 whitespace-pre-wrap leading-relaxed">
                {review.comment}
              </p>
            </div>
          )}

          {/* Resposta do Avaliado */}
          {review.response_text && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200 ml-4">
              <div className="flex items-center gap-2 mb-2">
                <Reply className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Resposta de {review.reviewed.full_name}
                </span>
                {review.response_date && (
                  <span className="text-xs text-blue-600">
                    {formatDistanceToNow(new Date(review.response_date), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                )}
              </div>
              <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">
                {review.response_text}
              </p>
            </div>
          )}

          {/* Pontos Positivos e Negativos */}
          {((review as any).pros?.length > 0 || (review as any).positive_points?.length > 0 || 
            (review as any).cons?.length > 0 || (review as any).negative_points?.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Pontos Positivos */}
              {((review as any).pros?.length > 0 || (review as any).positive_points?.length > 0) && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Pontos Positivos</span>
                  </div>
                  <ul className="space-y-1">
                    {((review as any).pros || (review as any).positive_points || []).map((point: string, index: number) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-500 font-bold">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pontos Negativos */}
              {((review as any).cons?.length > 0 || (review as any).negative_points?.length > 0) && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Pontos a Melhorar</span>
                  </div>
                  <ul className="space-y-1">
                    {((review as any).cons || (review as any).negative_points || []).map((point: string, index: number) => (
                      <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Data do Serviço */}
          {(review as any).service_date && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Serviço realizado em: {new Date((review as any).service_date).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          )}

          {/* Formulário de Resposta */}
          {showResponseForm && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-4">
              <h5 className="font-medium text-blue-900 mb-3">
                {isEditingResponse ? 'Editar resposta' : 'Responder avaliação'}
              </h5>
              <Textarea
                placeholder="Digite sua resposta..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={3}
                className="modern-input mb-3"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowResponseForm(false)
                    setResponseText('')
                    setIsEditingResponse(false)
                  }}
                  className="modern-button-secondary px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={isSubmittingResponse || !responseText.trim()}
                  className="modern-button-primary px-4 py-2 disabled:opacity-50"
                >
                  {isSubmittingResponse ? 'Enviando...' : (isEditingResponse ? 'Salvar' : 'Responder')}
                </button>
              </div>
            </div>
          )}

          {/* Ações */}
          {showActions && (
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              {isReviewed && !showResponseForm && !review.response_text && (
                <button
                  onClick={() => setShowResponseForm(true)}
                  className="modern-button-outline px-4 py-2 flex items-center gap-2"
                >
                  <Reply className="h-4 w-4" />
                  Responder
                </button>
              )}
              
              {!isOwner && onMarkHelpful && (
                <button
                  onClick={handleMarkHelpful}
                  className="modern-button-outline px-4 py-2 flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Útil
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
