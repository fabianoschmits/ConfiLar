'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ThumbsUp, ThumbsDown, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSupabaseReviews, ReviewInsert, ReviewWithProfiles } from '@/hooks/useSupabaseReviews'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useEffect } from 'react'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Selecione uma nota').max(5, 'Nota inválida'),
  title: z.string().optional(),
  comment: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  is_recommended: z.boolean().optional(),
  service_date: z.string().optional()
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  reviewerId: string
  reviewedId: string
  reviewedName: string
  reviewedAvatar?: string
  reviewedUserType?: 'client' | 'professional'
  adId?: string
  adTitle?: string
  onSuccess?: () => void
  onCancel?: () => void
  // Novos props para edição
  editingReview?: ReviewWithProfiles | null
  isEditing?: boolean
}

export function ReviewForm({
  reviewerId,
  reviewedId,
  reviewedName,
  reviewedAvatar,
  reviewedUserType = 'professional',
  adId,
  adTitle,
  onSuccess,
  onCancel,
  editingReview = null,
  isEditing = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [proInput, setProInput] = useState('')
  const [conInput, setConInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canReview, setCanReview] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { createReview, updateReview, canUserReview } = useSupabaseReviews()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      is_recommended: false
    }
  })

  const watchedRating = watch('rating')

  // Carregar dados da avaliação quando editando
  useEffect(() => {
    if (isEditing && editingReview) {
      setRating(editingReview.rating_person)
      setValue('rating', editingReview.rating_person)
      setValue('title', (editingReview as any).title || '')
      setValue('comment', editingReview.comment || '')
      setValue('is_recommended', (editingReview as any).is_recommended || false)
      setValue('service_date', (editingReview as any).service_date || '')
      
      // Carregar pros e cons
      const reviewPros = (editingReview as any).pros || (editingReview as any).positive_points || []
      const reviewCons = (editingReview as any).cons || (editingReview as any).negative_points || []
      setPros(reviewPros)
      setCons(reviewCons)
      
      // Para edição, sempre pode editar a própria avaliação
      setCanReview(true)
    }
  }, [isEditing, editingReview, setValue])

  // Verificar se o usuário pode avaliar quando o componente é montado (apenas para criação)
  useEffect(() => {
    if (isEditing) return // Pular verificação se estiver editando
    
    const checkCanReview = async () => {
      if (!reviewerId || !reviewedId) return
      
      try {
        const canReviewUser = await canUserReview(reviewerId, reviewedId)
        setCanReview(canReviewUser)
        
        if (!canReviewUser) {
          setValidationError('Você não pode avaliar este usuário. É necessário ter um acordo aceito há pelo menos 1 dia.')
        }
      } catch (error) {
        console.error('Erro ao verificar se pode avaliar:', error)
        setCanReview(false)
        setValidationError('Erro ao verificar elegibilidade para avaliação.')
      }
    }

    checkCanReview()
  }, [reviewerId, reviewedId, canUserReview, isEditing])

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
    setValue('rating', selectedRating)
  }

  const handleRatingHover = (hoveredRating: number) => {
    setHoveredRating(hoveredRating)
  }

  const handleRatingLeave = () => {
    setHoveredRating(0)
  }

  const addPro = () => {
    if (proInput.trim() && !pros.includes(proInput.trim())) {
      setPros([...pros, proInput.trim()])
      setProInput('')
    }
  }

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index))
  }

  const addCon = () => {
    if (conInput.trim() && !cons.includes(conInput.trim())) {
      setCons([...cons, conInput.trim()])
      setConInput('')
    }
  }

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast.error('Selecione uma nota para a avaliação')
      return
    }

    if (!canReview) {
      toast.error('Você não pode avaliar este usuário')
      return
    }

    // Verificar novamente antes de enviar (apenas para criação)
    if (!isEditing) {
      try {
        const canReviewUser = await canUserReview(reviewerId, reviewedId)
        if (!canReviewUser) {
          toast.error('Você não pode avaliar este usuário. Verifique se há um acordo válido.')
          return
        }
      } catch (error) {
        toast.error('Erro ao verificar elegibilidade para avaliação')
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (isEditing && editingReview) {
        // Atualizar avaliação existente
        const updateData = {
          rating_person: rating,
          title: data.title || null,
          comment: data.comment || null,
          pros: pros.length > 0 ? pros : null,
          cons: cons.length > 0 ? cons : null,
          positive_points: pros.length > 0 ? pros : null, // Duplicado para compatibilidade
          negative_points: cons.length > 0 ? cons : null, // Duplicado para compatibilidade
          is_recommended: data.is_recommended || false,
          service_date: data.service_date || null,
        }

        const { data: updatedReview, error } = await updateReview(editingReview.id, updateData)

        if (error) {
          toast.error('Erro ao atualizar avaliação: ' + error)
          return
        }

        toast.success('Avaliação atualizada com sucesso!')
      } else {
        // Criar nova avaliação
        const reviewData: ReviewInsert = {
          reviewer_id: reviewerId,
          reviewed_id: reviewedId,
          ad_id: adId || null,
          review_type: 'professional',
          rating_person: rating,
          title: data.title || null,
          comment: data.comment || null,
          pros: pros.length > 0 ? pros : null,
          cons: cons.length > 0 ? cons : null,
          positive_points: pros.length > 0 ? pros : null, // Duplicado para compatibilidade
          negative_points: cons.length > 0 ? cons : null, // Duplicado para compatibilidade
          is_recommended: data.is_recommended || false,
          service_date: data.service_date || null,
          is_verified: false
        }

        const { data: newReview, error } = await createReview(reviewData)

        if (error) {
          toast.error('Erro ao enviar avaliação: ' + error)
          return
        }

        toast.success('Avaliação enviada com sucesso!')
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao processar avaliação:', error)
      toast.error('Erro ao processar avaliação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (currentRating: number, isInteractive = false) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starRating = i + 1
      const isFilled = starRating <= currentRating
      
      return (
        <Star
          key={i}
          className={`h-6 w-6 ${
            isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } ${isInteractive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
          onClick={isInteractive ? () => handleRatingClick(starRating) : undefined}
          onMouseEnter={isInteractive ? () => handleRatingHover(starRating) : undefined}
          onMouseLeave={isInteractive ? handleRatingLeave : undefined}
        />
      )
    })
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5: return 'Excelente'
      case 4: return 'Muito Bom'
      case 3: return 'Bom'
      case 2: return 'Regular'
      case 1: return 'Ruim'
      default: return 'Selecione uma nota'
    }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5: return 'text-green-600'
      case 4: return 'text-blue-600'
      case 3: return 'text-yellow-600'
      case 2: return 'text-orange-600'
      case 1: return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto modern-card p-8">
      {/* Header Moderno */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <UserAvatar
            src={reviewedAvatar}
            alt={reviewedName}
            fallback={reviewedName.charAt(0)}
            size="lg"
          />
          <div>
            <h2 className="modern-heading-1 text-gray-900">
              {isEditing ? `Editar avaliação de ${reviewedName}` : `Avaliar ${reviewedName}`}
            </h2>
            {adTitle && (
              <span className="modern-badge-primary">
                {adTitle}
              </span>
            )}
          </div>
        </div>
        <p className="modern-body text-gray-600">
          Compartilhe sua experiência e ajude outros usuários
        </p>
        
        {/* Mensagem de erro de validação */}
        {validationError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">
                  Avaliação não permitida
                </h4>
                <p className="text-sm text-red-700">
                  {validationError}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avaliação por Estrelas */}
        <div className="space-y-4">
          <Label className="modern-heading-3 text-gray-900">Sua Avaliação</Label>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              {renderStars(hoveredRating || rating, true)}
            </div>
            <div className="flex flex-col">
              <span className={`font-semibold ${getRatingColor(rating)}`}>
                {getRatingText(rating)}
              </span>
              {rating > 0 && (
                <span className="text-sm text-gray-500">
                  {rating} de 5 estrelas
                </span>
              )}
            </div>
          </div>
          {errors.rating && (
            <p className="text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        {/* Título da Avaliação */}
        <div className="space-y-2">
          <Label htmlFor="title" className="modern-heading-3 text-gray-900">Título da Avaliação</Label>
          <Input
            id="title"
            placeholder="Ex: Excelente trabalho e pontualidade"
            className="modern-input"
            {...register('title')}
          />
          <p className="text-sm text-gray-500">Resuma sua experiência em uma frase (opcional)</p>
        </div>

        {/* Comentário */}
        <div className="space-y-2">
          <Label htmlFor="comment" className="modern-heading-3 text-gray-900">Comentário</Label>
          <Textarea
            id="comment"
            placeholder={`Descreva detalhadamente sua experiência com este ${reviewedUserType === 'professional' ? 'profissional' : 'cliente'}...`}
            rows={4}
            className="modern-input resize-none"
            {...register('comment')}
          />
          {errors.comment && (
            <p className="text-sm text-red-600">{errors.comment.message}</p>
          )}
          </div>

        {/* Pontos Positivos */}
        <div className="space-y-3">
          <Label className="modern-heading-3 text-gray-900 flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-green-600" />
            Pontos Positivos
          </Label>
          <p className="text-sm text-gray-600">Destaque os aspectos que mais te impressionaram</p>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Pontual, comunicativo, caprichoso..."
              value={proInput}
              onChange={(e) => setProInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
              className="modern-input flex-1"
            />
            <button 
              type="button" 
              onClick={addPro}
              className="modern-button-primary px-4 py-2"
            >
              Adicionar
            </button>
          </div>
          {pros.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pros.map((pro, index) => (
                <span key={index} className="modern-badge-success flex items-center gap-2 px-3 py-1">
                  <ThumbsUp className="h-3 w-3" />
                  {pro}
                  <button
                    type="button"
                    onClick={() => removePro(index)}
                    className="ml-1 hover:text-red-600 text-green-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pontos Negativos */}
        <div className="space-y-3">
          <Label className="modern-heading-3 text-gray-900 flex items-center gap-2">
            <ThumbsDown className="h-4 w-4 text-orange-600" />
            Pontos a Melhorar
          </Label>
          <p className="text-sm text-gray-600">Feedback construtivo para ajudar na melhoria (opcional)</p>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Comunicação, tempo de resposta..."
              value={conInput}
              onChange={(e) => setConInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
              className="modern-input flex-1"
            />
            <button 
              type="button" 
              onClick={addCon}
              className="modern-button-secondary px-4 py-2"
            >
              Adicionar
            </button>
          </div>
          {cons.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cons.map((con, index) => (
                <span key={index} className="modern-badge-warning flex items-center gap-2 px-3 py-1">
                  <ThumbsDown className="h-3 w-3" />
                  {con}
                  <button
                    type="button"
                    onClick={() => removeCon(index)}
                    className="ml-1 hover:text-red-600 text-yellow-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Data do Serviço */}
        <div className="space-y-2">
          <Label htmlFor="service_date" className="modern-heading-3 text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Data do Serviço
          </Label>
          <Input
            id="service_date"
            type="date"
            className="modern-input"
            {...register('service_date')}
          />
          <p className="text-sm text-gray-500">Quando o serviço foi realizado? (opcional)</p>
        </div>

        {/* Recomendação */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_recommended"
              {...register('is_recommended')}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="is_recommended" className="modern-heading-3 text-gray-900 flex items-center gap-2 cursor-pointer">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Recomendo este {reviewedUserType === 'professional' ? 'profissional' : 'cliente'}
            </Label>
          </div>
          <p className="text-sm text-gray-600">Indicaria este {reviewedUserType === 'professional' ? 'profissional' : 'cliente'} para outros usuários?</p>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="modern-button-secondary px-6 py-3"
            >
              Cancelar
            </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting || rating === 0 || !canReview}
            className="modern-button-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (isEditing ? 'Atualizando...' : 'Enviando...') 
              : (isEditing ? 'Atualizar Avaliação' : 'Enviar Avaliação')
            }
          </button>
        </div>
      </form>
    </div>
  )
}
