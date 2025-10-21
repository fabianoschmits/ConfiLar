'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Star, Loader2, CheckCircle, Clock } from 'lucide-react'
import { useEvaluationRequests } from '@/hooks/useEvaluationRequests'
import { useAuthContext } from '@/contexts/AuthContext'
import { EvaluationModal } from './EvaluationModal'
import { toast } from 'sonner'

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
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<any>(null)
  const { createRequest, requests, acceptRequest, loadRequests } = useEvaluationRequests()

  // Verificar se existe uma solicitação entre os usuários
  const existingRequest = requests.find(req => 
    (req.requester_id === user?.id && req.target_id === targetUserId) ||
    (req.requester_id === targetUserId && req.target_id === user?.id)
  )

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

  const handleAcceptRequest = async () => {
    if (!existingRequest) return
    
    try {
      setIsLoading(true)
      await acceptRequest(existingRequest.id)
      toast.success(`Solicitação aceita! Agora você pode avaliar ${targetUserName}`)
      setCurrentRequest(existingRequest)
      setShowEvaluationModal(true)
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao aceitar solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEvaluationComplete = () => {
    loadRequests() // Recarregar solicitações
    setCurrentRequest(null)
  }

  // Determinar o estado do botão
  const getButtonState = () => {
    if (!existingRequest) {
      return {
        text: 'Avaliar',
        icon: <Star className="h-3 w-3" />,
        onClick: () => setShowDialog(true),
        variant: 'ghost' as const,
        disabled: isLoading
      }
    }

    if (existingRequest.status === 'pending') {
      if (existingRequest.target_id === user?.id) {
        // Usuário recebeu uma solicitação pendente
        return {
          text: 'Aceitar',
          icon: <CheckCircle className="h-3 w-3" />,
          onClick: handleAcceptRequest,
          variant: 'default' as const,
          disabled: isLoading
        }
      } else {
        // Usuário enviou uma solicitação pendente
        return {
          text: 'Pendente',
          icon: <Clock className="h-3 w-3" />,
          onClick: () => {},
          variant: 'ghost' as const,
          disabled: true
        }
      }
    }

    if (existingRequest.status === 'accepted') {
      // Ambos os usuários podem avaliar quando aceito
      return {
        text: 'Avaliar',
        icon: <Star className="h-3 w-3" />,
        onClick: () => {
          setCurrentRequest(existingRequest)
          setShowEvaluationModal(true)
        },
        variant: 'default' as const,
        disabled: isLoading
      }
    }

    if (existingRequest.status === 'completed') {
      return {
        text: 'Concluída',
        icon: <CheckCircle className="h-3 w-3" />,
        onClick: () => {},
        variant: 'ghost' as const,
        disabled: true
      }
    }

    return {
      text: 'Avaliar',
      icon: <Star className="h-3 w-3" />,
      onClick: () => setShowDialog(true),
      variant: 'ghost' as const,
      disabled: isLoading
    }
  }

  const buttonState = getButtonState()

  return (
    <>
      <Button
        variant={buttonState.variant}
        size="sm"
        onClick={buttonState.onClick}
        className={`flex items-center gap-1 px-1 py-0.5 h-5 text-xs transition-opacity ${className} ${
          buttonState.variant === 'ghost' 
            ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 opacity-70 hover:opacity-100' 
            : 'text-white bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={buttonState.disabled}
      >
        {buttonState.icon}
        <span className="text-xs">{buttonState.text}</span>
      </Button>

      {/* Dialog para solicitar avaliação */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Solicitar Avaliação
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você deseja solicitar uma avaliação de {targetUserName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestEvaluation} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Solicitar'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de avaliação */}
      {showEvaluationModal && currentRequest && (
        <EvaluationModal
          isOpen={showEvaluationModal}
          onClose={() => setShowEvaluationModal(false)}
          targetUserId={targetUserId}
          targetUserName={targetUserName}
          requestId={currentRequest.id}
          onEvaluationComplete={handleEvaluationComplete}
          isMutual={currentRequest.status === 'accepted'}
        />
      )}
    </>
  )
}