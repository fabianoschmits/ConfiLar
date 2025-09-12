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
import { Star, ThumbsUp, ThumbsDown, Calendar, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSupabaseReviews, ReviewInsert } from '@/hooks/useSupabaseReviews'
import { UserAvatar } from '@/components/ui/UserAvatar'

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
  adId?: string
  adTitle?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({
  reviewerId,
  reviewedId,
  reviewedName,
  reviewedAvatar,
  adId,
  adTitle,
  onSuccess,
  onCancel
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [proInput, setProInput] = useState('')
  const [conInput, setConInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createReview } = useSupabaseReviews()

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
      toast.error('SELECIONE UMA NOTA PARA A AVALIAÇÃO')
      return
    }

    setIsSubmitting(true)
    try {
      const reviewData: ReviewInsert = {
        reviewer_id: reviewerId,
        reviewed_id: reviewedId,
        review_type: 'professional',
        rating_person: rating,
        comment: data.comment || null,
        is_verified: false
      }

      const { data: newReview, error } = await createReview(reviewData)

      if (error) {
        toast.error('ERRO AO ENVIAR AVALIAÇÃO: ' + error)
        return
      }

      toast.success('AVALIAÇÃO ENVIADA COM SUCESSO!')
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      toast.error('ERRO AO ENVIAR AVALIAÇÃO. TENTE NOVAMENTE.')
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <UserAvatar
            src={reviewedAvatar}
            alt={reviewedName}
            fallback={reviewedName.charAt(0)}
            size="md"
          />
          <div>
            <h3 className="text-lg font-semibold">Avaliar {reviewedName}</h3>
            {adTitle && (
              <Badge variant="secondary" className="mt-1">
                {adTitle}
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Compartilhe sua experiência e ajude outros usuários
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avaliação por Estrelas */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Sua Avaliação</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {renderStars(hoveredRating || rating, true)}
              </div>
              <div className="flex flex-col">
                <span className={`font-medium ${getRatingColor(rating)}`}>
                  {getRatingText(rating)}
                </span>
                {rating > 0 && (
                  <span className="text-sm text-gray-600">
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
            <Label htmlFor="title">Título da Avaliação (Opcional)</Label>
            <Input
              id="title"
              placeholder="Ex: Excelente trabalho!"
              {...register('title')}
            />
          </div>

          {/* Comentário */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentário</Label>
            <Textarea
              id="comment"
              placeholder="Descreva sua experiência com este profissional..."
              rows={4}
              {...register('comment')}
            />
            {errors.comment && (
              <p className="text-sm text-red-600">{errors.comment.message}</p>
            )}
          </div>

          {/* Pontos Positivos */}
          <div className="space-y-3">
            <Label>Pontos Positivos (Opcional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Pontual, profissional..."
                value={proInput}
                onChange={(e) => setProInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
              />
              <Button type="button" variant="outline" onClick={addPro}>
                Adicionar
              </Button>
            </div>
            {pros.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pros.map((pro, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {pro}
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Pontos Negativos */}
          <div className="space-y-3">
            <Label>Pontos a Melhorar (Opcional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Demorou mais que o esperado..."
                value={conInput}
                onChange={(e) => setConInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
              />
              <Button type="button" variant="outline" onClick={addCon}>
                Adicionar
              </Button>
            </div>
            {cons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cons.map((con, index) => (
                  <Badge key={index} variant="destructive" className="flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3" />
                    {con}
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Data do Serviço */}
          <div className="space-y-2">
            <Label htmlFor="service_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data do Serviço (Opcional)
            </Label>
            <Input
              id="service_date"
              type="date"
              {...register('service_date')}
            />
          </div>

          {/* Recomendação */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_recommended"
              {...register('is_recommended')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_recommended" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Recomendo este profissional
            </Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
