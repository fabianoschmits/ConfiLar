'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Handshake, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react'
import { useContactAgreements, ContactAgreement } from '@/hooks/useContactAgreements'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface AgreementStatusCardProps {
  conversationId: string
  otherUserId: string
  otherUserName: string
  otherUserType: 'professional' | 'client'
  onAgreementClick: () => void
}

export function AgreementStatusCard({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserType,
  onAgreementClick 
}: AgreementStatusCardProps) {
  const { profile } = useAuthContext()
  const router = useRouter()
  const { 
    agreements, 
    isLoading, 
    acceptAgreement, 
    rejectAgreement 
  } = useContactAgreements()

  const [agreement, setAgreement] = useState<ContactAgreement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Encontrar acordo para esta conversa
    const conversationAgreement = agreements.find(
      a => a.conversation_id === conversationId
    )
    setAgreement(conversationAgreement || null)
  }, [agreements, conversationId])

  const handleAcceptAgreement = async () => {
    if (!agreement) return
    
    setIsProcessing(true)
    try {
      await acceptAgreement(agreement.id)
      toast.success('Acordo aceito! Redirecionando para página do acordo...')
      // Redirecionar para a página do acordo
      router.push(`/acordo/${agreement.id}`)
    } catch (error) {
      console.error('Erro ao aceitar acordo:', error)
      toast.error('Erro ao aceitar acordo')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectAgreement = async () => {
    if (!agreement) return
    
    if (!confirm('Tem certeza que deseja rejeitar este acordo?')) return
    
    setIsProcessing(true)
    try {
      await rejectAgreement(agreement.id)
      toast.success('Acordo rejeitado.')
    } catch (error) {
      console.error('Erro ao rejeitar acordo:', error)
      toast.error('Erro ao rejeitar acordo')
    } finally {
      setIsProcessing(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Data não disponível'
    }
  }

  const isCurrentUserProposer = agreement?.proposed_by === profile?.id

  if (isLoading) {
    return (
      <Card className="mb-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-black border-t-transparent"></div>
            <span className="ml-2 font-black text-black">CARREGANDO ACORDO...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sem acordo - mostrar botão para propor
  if (!agreement) {
    return (
      <Card className="mb-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Handshake className="h-6 w-6 text-black" />
              <div>
                <p className="font-black text-black text-lg uppercase">
                  SISTEMA DE ACORDOS
                </p>
                <p className="text-black font-bold">
                  Faça um acordo para poder avaliar {otherUserName} após o serviço.
                </p>
              </div>
            </div>

            <Button 
              onClick={onAgreementClick}
              className="bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-6 py-3"
            >
              <Handshake className="h-4 w-4 mr-2" />
              PROPOR ACORDO
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Acordo pendente
  if (agreement.status === 'pending') {
    return (
      <Card className="mb-4 bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-black" />
              <div>
                <p className="font-black text-black text-lg uppercase">
                  {isCurrentUserProposer ? 'ACORDO PENDENTE' : 'ACORDO RECEBIDO'}
                </p>
                <p className="text-black font-bold">
                  {isCurrentUserProposer 
                    ? `Aguardando ${otherUserName} aceitar sua proposta`
                    : `${otherUserName} enviou uma proposta de acordo`
                  }
                </p>
                <p className="text-sm text-black font-bold">
                  Proposto {getTimeAgo(agreement.created_at)}
                </p>
              </div>
            </div>

            {!isCurrentUserProposer && (
              <div className="flex gap-2">
                <Button
                  onClick={handleRejectAgreement}
                  disabled={isProcessing}
                  className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  REJEITAR
                </Button>
                <Button
                  onClick={handleAcceptAgreement}
                  disabled={isProcessing}
                  className="bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  ACEITAR
                </Button>
              </div>
            )}
          </div>

          {/* Detalhes do acordo */}
          <div className="mt-4 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-black" />
                <span className="text-sm font-black text-black">SERVIÇO:</span>
                <span className="text-sm font-bold text-black">{agreement.service_description}</span>
              </div>
              
              {agreement.agreed_price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-black" />
                  <span className="text-sm font-black text-black">VALOR:</span>
                  <span className="text-sm font-bold text-black">R$ {agreement.agreed_price}</span>
                </div>
              )}
              
              {agreement.proposed_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-black" />
                  <span className="text-sm font-black text-black">DATA:</span>
                  <span className="text-sm font-bold text-black">
                    {new Date(agreement.proposed_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              
              {agreement.estimated_duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-black" />
                  <span className="text-sm font-black text-black">DURAÇÃO:</span>
                  <span className="text-sm font-bold text-black">{agreement.estimated_duration}h</span>
                </div>
              )}
            </div>
            
            {agreement.notes && (
              <div className="mt-2">
                <span className="text-sm font-black text-black">OBSERVAÇÕES:</span>
                <p className="text-sm font-bold text-black">{agreement.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Acordo aceito
  if (agreement.status === 'accepted') {
    const canReview = agreement.contacts_revealed_at && 
      new Date(agreement.contacts_revealed_at) <= new Date(Date.now() - 20 * 60 * 60 * 1000)

    return (
      <Card className="mb-4 bg-green-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-white" />
              <div>
                <p className="font-black text-white text-lg uppercase">
                  ACORDO ACEITO
                </p>
                <p className="text-white font-bold">
                  Acordo aceito {getTimeAgo(agreement.contacts_revealed_at || agreement.updated_at)}
                </p>
                {canReview ? (
                  <p className="text-sm text-white font-bold">
                    ✅ Vocês já podem se avaliar mutuamente
                  </p>
                ) : (
                  <p className="text-sm text-white font-bold">
                    ⏳ Aguardando 20 horas para poder avaliar
                  </p>
                )}
              </div>
            </div>

            <Badge className="bg-white text-green-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
              ACEITO
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Acordo rejeitado
  if (agreement.status === 'rejected') {
    return (
      <Card className="mb-4 bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-white" />
              <div>
                <p className="font-black text-white text-lg uppercase">
                  ACORDO REJEITADO
                </p>
                <p className="text-white font-bold">
                  Acordo rejeitado {getTimeAgo(agreement.updated_at)}
                </p>
              </div>
            </div>

            <Button 
              onClick={onAgreementClick}
              className="bg-white text-red-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
            >
              <Handshake className="h-4 w-4 mr-2" />
              NOVA PROPOSTA
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
