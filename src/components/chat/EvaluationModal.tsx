'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Star, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface EvaluationModalProps {
  isOpen: boolean
  onClose: () => void
  targetUserId: string
  targetUserName: string
  requestId: string
  onEvaluationComplete: () => void
  isMutual?: boolean // Se é uma avaliação mútua
}

export function EvaluationModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  requestId,
  onEvaluationComplete,
  isMutual = false
}: EvaluationModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Função para verificar se ambos avaliaram e marcar como concluído
  const checkAndCompleteMutualEvaluation = async (requestId: string, currentUserId: string, targetUserId: string) => {
    try {
      // Verificar se existem avaliações de ambos os lados
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('reviewer_id, reviewed_id')
        .or(`and(reviewer_id.eq.${currentUserId},reviewed_id.eq.${targetUserId}),and(reviewer_id.eq.${targetUserId},reviewed_id.eq.${currentUserId})`)

      if (reviewsError) {
        console.error('Erro ao verificar avaliações mútuas:', reviewsError)
        return
      }

      // Verificar se ambos avaliaram
      const currentUserReviewed = reviews?.some(r => r.reviewer_id === currentUserId && r.reviewed_id === targetUserId)
      const targetUserReviewed = reviews?.some(r => r.reviewer_id === targetUserId && r.reviewed_id === currentUserId)

      if (currentUserReviewed && targetUserReviewed) {
        // Ambos avaliaram, marcar como concluído
        const { error: requestError } = await supabase
          .from('evaluation_requests')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId)

        if (requestError) {
          console.error('Erro ao marcar avaliação mútua como concluída:', requestError)
        } else {
          console.log('✅ Avaliação mútua concluída - ambos avaliaram')
        }
      }
    } catch (error) {
      console.error('Erro ao verificar avaliação mútua:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Obter dados do usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Criar a avaliação
      console.log('📝 Criando avaliação:', {
        reviewer_id: user.id,
        reviewed_id: targetUserId,
        rating: rating,
        comment: comment.trim() || null
      })

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewed_id: targetUserId,
          rating: rating,
          comment: comment.trim() || null,
          created_at: new Date().toISOString()
        })

      if (reviewError) {
        console.error('❌ Erro ao criar avaliação:', reviewError)
        throw new Error(`Erro ao salvar avaliação: ${reviewError.message}`)
      }

      console.log('✅ Avaliação criada com sucesso!')

      // Se for mútua, verificar se ambos já avaliaram
      if (isMutual) {
        await checkAndCompleteMutualEvaluation(requestId, user.id, targetUserId)
      } else {
        // Marcar solicitação como concluída se não for mútua
        const { error: requestError } = await supabase
          .from('evaluation_requests')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId)

        if (requestError) {
          console.error('Erro ao marcar solicitação como concluída:', requestError)
        }
      }

      toast.success(`Avaliação enviada para ${targetUserName} com sucesso!`)
      onEvaluationComplete()
      onClose()
      
      // Reset form
      setRating(5)
      setComment('')
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Star className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            {isMutual ? `Avaliar ${targetUserName} (Avaliação Mútua)` : `Avaliar ${targetUserName}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <Label htmlFor="rating" className="text-gray-700 dark:text-gray-300">Avaliação (1-5 estrelas)</Label>
            <div className="flex items-center space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 rounded-full transition-colors ${
                    star <= rating
                      ? 'text-yellow-400 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300'
                      : 'text-gray-300 hover:text-gray-400 dark:text-gray-600 dark:hover:text-gray-500'
                  }`}
                  disabled={isSubmitting}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {rating} de 5 estrelas
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-gray-700 dark:text-gray-300">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Deixe um comentário sobre sua experiência..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Enviar Avaliação
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
