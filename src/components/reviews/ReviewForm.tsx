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
import { useSupabaseReviews, ReviewInsert } from '@/hooks/useSupabaseReviews'
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
  const [canReview, setCanReview] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { createReview, canUserReview } = useSupabaseReviews()

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

  // Verificar se o usuário pode avaliar quando o componente é montado
  useEffect(() => {
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
  }, [reviewerId, reviewedId, canUserReview])

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

    if (!canReview) {
      toast.error('VOCÊ NÃO PODE AVALIAR ESTE USUÁRIO')
      return
    }

    // Verificar novamente antes de enviar
    try {
      const canReviewUser = await canUserReview(reviewerId, reviewedId)
      if (!canReviewUser) {
        toast.error('VOCÊ NÃO PODE AVALIAR ESTE USUÁRIO. VERIFIQUE SE HÁ UM ACORDO VÁLIDO.')
        return
      }
    } catch (error) {
      toast.error('ERRO AO VERIFICAR ELEGIBILIDADE PARA AVALIAÇÃO')
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
    <div className="w-full max-w-2xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Header Brutalista */}
      <div className="bg-yellow-400 border-b-4 border-black p-6">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={reviewedAvatar}
            alt={reviewedName}
            fallback={reviewedName.charAt(0)}
            size="md"
          />
          <div>
            <h3 className="text-lg font-black text-black uppercase">AVALIAR {reviewedName.toUpperCase()}</h3>
            {adTitle && (
              <div className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-1 mt-1 inline-block">
                <span className="text-xs font-black">{adTitle.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-black font-bold mt-2">
          COMPARTILHE SUA EXPERIÊNCIA E AJUDE OUTROS USUÁRIOS
        </p>
      </div>

      {/* Conteúdo Brutalista */}
      <div className="p-6">
        {/* Mensagem de erro de validação */}
        {validationError && (
          <div className="mb-6 bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-white mt-0.5" />
              <div>
                <h4 className="font-black text-white mb-1 uppercase">
                  AVALIAÇÃO NÃO PERMITIDA
                </h4>
                <p className="text-sm text-white font-bold">
                  {validationError}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avaliação por Estrelas */}
          <div className="space-y-3">
            <Label className="text-base font-black text-black uppercase">SUA AVALIAÇÃO</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {renderStars(hoveredRating || rating, true)}
              </div>
              <div className="flex flex-col">
                <span className={`font-black text-black ${getRatingColor(rating)}`}>
                  {getRatingText(rating).toUpperCase()}
                </span>
                {rating > 0 && (
                  <span className="text-sm text-black font-bold">
                    {rating} DE 5 ESTRELAS
                  </span>
                )}
              </div>
            </div>
            {errors.rating && (
              <p className="text-sm text-red-600 font-bold">{errors.rating.message}</p>
            )}
          </div>

          {/* Título da Avaliação */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-black font-black uppercase">TÍTULO DA AVALIAÇÃO (OPCIONAL)</Label>
            <Input
              id="title"
              placeholder="EX: EXCELENTE TRABALHO!"
              className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              {...register('title')}
            />
          </div>

          {/* Comentário */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-black font-black uppercase">COMENTÁRIO</Label>
            <Textarea
              id="comment"
              placeholder="DESCREVA SUA EXPERIÊNCIA COM ESTE PROFISSIONAL..."
              rows={4}
              className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all resize-none"
              {...register('comment')}
            />
            {errors.comment && (
              <p className="text-sm text-red-600 font-bold">{errors.comment.message}</p>
            )}
          </div>

          {/* Pontos Positivos */}
          <div className="space-y-3">
            <Label className="text-black font-black uppercase">PONTOS POSITIVOS (OPCIONAL)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="EX: PONTUAL, PROFISSIONAL..."
                value={proInput}
                onChange={(e) => setProInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addPro}
                className="bg-white text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
              >
                ADICIONAR
              </Button>
            </div>
            {pros.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pros.map((pro, index) => (
                  <div key={index} className="bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-1 flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span className="text-xs font-black">{pro.toUpperCase()}</span>
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="ml-1 hover:text-red-300 font-black"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pontos Negativos */}
          <div className="space-y-3">
            <Label className="text-black font-black uppercase">PONTOS A MELHORAR (OPCIONAL)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="EX: DEMOROU MAIS QUE O ESPERADO..."
                value={conInput}
                onChange={(e) => setConInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addCon}
                className="bg-white text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
              >
                ADICIONAR
              </Button>
            </div>
            {cons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cons.map((con, index) => (
                  <div key={index} className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-1 flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3" />
                    <span className="text-xs font-black">{con.toUpperCase()}</span>
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="ml-1 hover:text-red-300 font-black"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data do Serviço */}
          <div className="space-y-2">
            <Label htmlFor="service_date" className="flex items-center gap-2 text-black font-black uppercase">
              <Calendar className="h-4 w-4" />
              DATA DO SERVIÇO (OPCIONAL)
            </Label>
            <Input
              id="service_date"
              type="date"
              className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              {...register('service_date')}
            />
          </div>

          {/* Recomendação */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_recommended"
              {...register('is_recommended')}
              className="w-4 h-4 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            <Label htmlFor="is_recommended" className="flex items-center gap-2 text-black font-black uppercase">
              <CheckCircle className="h-4 w-4" />
              RECOMENDO ESTE PROFISSIONAL
            </Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="bg-white text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
              >
                CANCELAR
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0 || !canReview}
              className="bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'ENVIANDO...' : 'ENVIAR AVALIAÇÃO'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
