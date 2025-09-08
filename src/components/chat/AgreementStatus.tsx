'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Star,
  Handshake,
  Calendar
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AgreementStatusProps {
  conversationId: string
  currentUserId: string
  otherUserId: string
  otherUserName: string
  otherUserType: 'client' | 'professional'
  currentUserType: 'client' | 'professional'
}

interface ContactAgreement {
  id: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  service_description: string
  agreed_price?: number
  proposed_date?: string
  proposed_time?: string
  contacts_revealed_at?: string
  created_at: string
  proposed_by: string
}

export function AgreementStatus({ 
  conversationId, 
  currentUserId, 
  otherUserId, 
  otherUserName,
  otherUserType,
  currentUserType 
}: AgreementStatusProps) {
  const [agreement, setAgreement] = useState<ContactAgreement | null>(null)
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAgreementStatus()
  }, [conversationId, currentUserId, otherUserId])

  const fetchAgreementStatus = async () => {
    try {
      setLoading(true)
      
      // Buscar acordo de contato para esta conversa
      const { data: agreementData, error: agreementError } = await supabase
        .from('contact_agreements')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (agreementError && agreementError.code !== 'PGRST116') {
        console.error('Erro ao buscar acordo:', agreementError)
        return
      }

      setAgreement(agreementData)

      // Verificar se pode avaliar
      if (agreementData && agreementData.status === 'accepted' && agreementData.contacts_revealed_at) {
        const revealedDate = new Date(agreementData.contacts_revealed_at)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        
        if (revealedDate <= oneDayAgo) {
          setCanReview(true)
        }
      }

    } catch (error) {
      console.error('Erro ao buscar status do acordo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgreement = async () => {
    try {
      const { error } = await supabase
        .from('contact_agreements')
        .insert({
          client_id: currentUserType === 'client' ? currentUserId : otherUserId,
          professional_id: currentUserType === 'professional' ? currentUserId : otherUserId,
          conversation_id: conversationId,
          service_description: 'Serviço a ser definido',
          proposed_by: currentUserId
        })

      if (error) throw error

      // Criar notificação para o outro usuário
      await createAgreementNotification()

      toast.success('Proposta de acordo enviada!')
      fetchAgreementStatus()
    } catch (error) {
      console.error('Erro ao criar acordo:', error)
      toast.error('Erro ao enviar proposta de acordo')
    }
  }

  const createAgreementNotification = async () => {
    try {
      const notificationData = {
        user_id: otherUserId,
        title: 'Nova Proposta de Acordo',
        message: `${otherUserName} propôs um acordo de contato. Clique para responder.`,
        type: 'agreement',
        is_read: false,
        action_url: `/chat/${conversationId}`,
        priority: 'high' as const
      }

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData)

      if (error) {
        console.error('Erro ao criar notificação de acordo:', error)
      }
    } catch (error) {
      console.error('Erro ao criar notificação de acordo:', error)
    }
  }

  const handleAcceptAgreement = async () => {
    if (!agreement) return

    try {
      const { error } = await supabase
        .from('contact_agreements')
        .update({ 
          status: 'accepted',
          contacts_revealed_at: new Date().toISOString()
        })
        .eq('id', agreement.id)

      if (error) throw error

      // Criar notificação para o outro usuário sobre aceitação
      await createAgreementResponseNotification('accepted')

      toast.success('Acordo aceito! Contatos foram revelados.')
      fetchAgreementStatus()
    } catch (error) {
      console.error('Erro ao aceitar acordo:', error)
      toast.error('Erro ao aceitar acordo')
    }
  }

  const handleRejectAgreement = async () => {
    if (!agreement) return

    try {
      const { error } = await supabase
        .from('contact_agreements')
        .update({ status: 'rejected' })
        .eq('id', agreement.id)

      if (error) throw error

      // Criar notificação para o outro usuário sobre rejeição
      await createAgreementResponseNotification('rejected')

      toast.success('Acordo rejeitado.')
      fetchAgreementStatus()
    } catch (error) {
      console.error('Erro ao rejeitar acordo:', error)
      toast.error('Erro ao rejeitar acordo')
    }
  }

  const createAgreementResponseNotification = async (response: 'accepted' | 'rejected') => {
    try {
      const responseText = response === 'accepted' ? 'aceitou' : 'rejeitou'
      const notificationData = {
        user_id: otherUserId,
        title: response === 'accepted' ? 'Acordo Aceito!' : 'Acordo Rejeitado',
        message: `${otherUserName} ${responseText} sua proposta de acordo.`,
        type: 'agreement',
        is_read: false,
        action_url: `/chat/${conversationId}`,
        priority: 'normal' as const
      }

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData)

      if (error) {
        console.error('Erro ao criar notificação de resposta:', error)
      }
    } catch (error) {
      console.error('Erro ao criar notificação de resposta:', error)
    }
  }

  const handleReviewUser = () => {
    router.push(`/perfil/${otherUserId}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-600" />
      case 'accepted':
        return <CheckCircle className="w-3 h-3 text-green-600" />
      case 'rejected':
        return <XCircle className="w-3 h-3 text-red-600" />
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-blue-600" />
      case 'cancelled':
        return <XCircle className="w-3 h-3 text-gray-600" />
      default:
        return <Handshake className="w-3 h-3 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'accepted':
        return 'Aceito'
      case 'rejected':
        return 'Rejeitado'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <span className="text-xs text-gray-500 ml-2">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mb-2">
      <div className="flex items-center gap-2">
        {!agreement ? (
          <>
            <Handshake className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Sem acordo</span>
          </>
        ) : (
          <>
            {getStatusIcon(agreement.status)}
            <span className="text-sm text-gray-700">Acordo:</span>
            <Badge className={`text-xs ${getStatusColor(agreement.status)}`}>
              {getStatusText(agreement.status)}
            </Badge>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        {!agreement ? (
          <Button 
            onClick={handleCreateAgreement}
            size="sm"
            className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Handshake className="w-3 h-3 mr-1" />
            Acordo
          </Button>
        ) : (
          <>
            {agreement.status === 'pending' && agreement.proposed_by !== currentUserId && (
              <>
                <Button 
                  onClick={handleAcceptAgreement}
                  size="sm"
                  className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-3 h-3" />
                </Button>
                <Button 
                  onClick={handleRejectAgreement}
                  size="sm"
                  className="h-6 px-2 text-xs bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-3 h-3" />
                </Button>
              </>
            )}
            
            {canReview && (
              <Button 
                onClick={handleReviewUser}
                size="sm"
                className="h-6 px-2 text-xs bg-yellow-600 hover:bg-yellow-700"
              >
                <Star className="w-3 h-3 mr-1" />
                Avaliar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
