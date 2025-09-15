'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  User, 
  MapPin, 
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useMessages } from '@/hooks/useMessages'
import { toast } from 'sonner'

interface ClassifiedAd {
  id: string
  title: string
  description: string
  category: string
  location: string
  price: number
  currency: string
  user_id: string
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url?: string
    user_type: 'client' | 'professional'
  }
}

interface StartConversationButtonProps {
  ad: ClassifiedAd
  className?: string
}

export function StartConversationButton({ ad, className }: StartConversationButtonProps) {
  const { user, profile } = useAuthContext()
  const { createConversation, conversations } = useMessages()
  const [loading, setLoading] = useState(false)

  // Verificar se já existe conversa com este anúncio
  const existingConversation = conversations.find(
    conv => conv.ad_id === ad.id && 
    ((conv.client_id === user?.id && conv.professional_id === ad.user_id) ||
     (conv.professional_id === user?.id && conv.client_id === ad.user_id))
  )

  // Não mostrar se for o próprio anúncio
  if (user?.id === ad.user_id) {
    return null
  }

  const handleStartConversation = async () => {
    if (!user?.id || !profile) {
      toast.error('Você precisa estar logado para iniciar uma conversa')
      return
    }

    try {
      setLoading(true)

      if (existingConversation) {
        // Se já existe conversa, apenas mostrar sucesso
        toast.success('Conversa já existe!')
        return
      }

      // Determinar quem é cliente e quem é profissional
      const isClient = profile.user_type === 'client'
      const clientId = isClient ? user.id : ad.user_id
      const professionalId = isClient ? ad.user_id : user.id

      const conversationId = await createConversation(clientId, professionalId, ad.id)
      
      // Conversa criada com sucesso
      if (conversationId) {
        toast.success('Conversa iniciada com sucesso!')
      } else {
        toast.error('Erro ao criar conversa')
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error)
      toast.error('Erro ao iniciar conversa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      {existingConversation ? (
        <Card className="bg-green-100 border-2 border-green-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-black text-green-800 uppercase text-sm">
                  CONVERSA ATIVA
                </h4>
                <p className="text-xs text-green-700 font-bold">
                  Você já está conversando com {ad.user.full_name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={handleStartConversation}
          disabled={loading}
          className="w-full bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black py-3 rounded-none"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          {loading ? 'INICIANDO...' : 'INICIAR CONVERSA'}
        </Button>
      )}
    </div>
  )
}

interface ContactAgreementCardProps {
  agreement: {
    id: string
    service_description: string
    agreed_price: number | null
    proposed_date: string | null
    proposed_time: string | null
    estimated_duration: number | null
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
    proposed_by: string
    notes: string | null
    created_at: string
  }
  currentUserId: string
  onAccept?: (agreementId: string) => void
  onReject?: (agreementId: string) => void
}

export function ContactAgreementCard({ 
  agreement, 
  currentUserId, 
  onAccept, 
  onReject 
}: ContactAgreementCardProps) {
  const isProposer = agreement.proposed_by === currentUserId
  const canRespond = !isProposer && agreement.status === 'pending'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'accepted': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      case 'completed': return 'bg-blue-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'PENDENTE'
      case 'accepted': return 'ACEITO'
      case 'rejected': return 'REJEITADO'
      case 'completed': return 'CONCLUÍDO'
      case 'cancelled': return 'CANCELADO'
      default: return 'DESCONHECIDO'
    }
  }

  return (
    <Card className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-black" />
            <h4 className="font-black text-black uppercase text-sm">
              ACORDO DE SERVIÇO
            </h4>
          </div>
          <Badge className={`${getStatusColor(agreement.status)} text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-xs`}>
            {getStatusText(agreement.status)}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <p className="font-bold text-black text-sm">
            {agreement.service_description}
          </p>

          {agreement.agreed_price && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-black" />
              <span className="font-black text-black text-sm">
                R$ {agreement.agreed_price.toFixed(2)}
              </span>
            </div>
          )}

          {agreement.proposed_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-black" />
              <span className="font-bold text-black text-sm">
                {new Date(agreement.proposed_date).toLocaleDateString('pt-BR')}
                {agreement.proposed_time && ` às ${agreement.proposed_time}`}
              </span>
            </div>
          )}

          {agreement.estimated_duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-black" />
              <span className="font-bold text-black text-sm">
                {agreement.estimated_duration} minutos
              </span>
            </div>
          )}

          {agreement.notes && (
            <div className="bg-gray-100 border-2 border-black p-2">
              <p className="text-xs font-bold text-black">
                <strong>Observações:</strong> {agreement.notes}
              </p>
            </div>
          )}
        </div>

        {canRespond && (
          <div className="flex gap-2">
            <Button
              onClick={() => onAccept?.(agreement.id)}
              className="flex-1 bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm rounded-none"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              ACEITAR
            </Button>
            <Button
              onClick={() => onReject?.(agreement.id)}
              className="flex-1 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm rounded-none"
            >
              <XCircle className="h-4 w-4 mr-1" />
              REJEITAR
            </Button>
          </div>
        )}

        {isProposer && agreement.status === 'pending' && (
          <div className="bg-yellow-100 border-2 border-yellow-500 p-2 mt-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-xs font-bold text-yellow-800">
                Aguardando resposta do outro usuário
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
