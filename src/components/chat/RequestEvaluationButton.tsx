'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star, Loader2 } from 'lucide-react'
import { useEvaluationRequests } from '@/hooks/useEvaluationRequests'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface RequestEvaluationButtonProps {
  targetUserId: string
  targetUserName: string
  className?: string
}

export function RequestEvaluationButton({ 
  targetUserId, 
  targetUserName, 
  className 
}: RequestEvaluationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const { createRequest } = useEvaluationRequests()

  const handleRequestEvaluation = async () => {
    try {
      setIsLoading(true)
      await createRequest(targetUserId)
      toast.success(`Solicitação de avaliação enviada para ${targetUserName}`)
      setShowDialog(false)
    } catch (error) {
      console.error('Erro ao solicitar avaliação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao solicitar avaliação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDialog(true)}
        className={`flex items-center gap-1 px-1 py-0.5 h-5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 opacity-70 hover:opacity-100 transition-opacity ${className}`}
        disabled={isLoading}
      >
        <Star className="h-3 w-3" />
        <span className="text-xs">Avaliar</span>
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Solicitar Avaliação</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Solicitar avaliação mútua com <strong>{targetUserName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel disabled={isLoading} className="text-xs px-3 py-1 h-8">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestEvaluation}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1 h-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
