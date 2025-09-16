'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Handshake,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Info,
  Zap,
  X
} from 'lucide-react'
import { useContactAgreements, ContactAgreement, ContactAgreementCreate } from '@/hooks/useContactAgreements'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { ProposalModal } from './ProposalModal'

interface ContactAgreementChatProps {
  conversationId: string
  otherUserId: string
  otherUserName: string
  otherUserType: 'professional' | 'client'
  isInModal?: boolean // Nova prop para indicar se está dentro de um modal
  onClose?: () => void // Callback para fechar o modal pai
}

export function ContactAgreementChat({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserType,
  isInModal = false,
  onClose
}: ContactAgreementChatProps) {
  const { profile } = useAuthContext()
  const { 
    agreements, 
    isLoading, 
    createAgreement, 
    acceptAgreement, 
    rejectAgreement,
    hasAcceptedAgreement 
  } = useContactAgreements()

  const [isProposalOpen, setIsProposalOpen] = useState(false)
  const [hasAgreement, setHasAgreement] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [formData, setFormData] = useState({
    service_description: '',
    agreed_price: '',
    proposed_date: '',
    proposed_time: '',
    estimated_duration: '',
    notes: ''
  })

  // Verificar se existe acordo aceito
  useEffect(() => {
    hasAcceptedAgreement(otherUserId).then(setHasAgreement)
  }, [otherUserId, hasAcceptedAgreement])

  // Encontrar acordos para esta conversa
  const conversationAgreements = agreements.filter(
    agreement => agreement.conversation_id === conversationId
  )

  const pendingAgreement = conversationAgreements.find(
    agreement => agreement.status === 'pending'
  )

  const acceptedAgreement = conversationAgreements.find(
    agreement => agreement.status === 'accepted'
  )


  const handleCreateProposal = async () => {
    if (!profile?.id) {
      toast.error('Usuário não autenticado')
      console.error('❌ Profile não encontrado:', profile)
      return
    }

    if (!formData.service_description.trim()) {
      toast.error('Descrição do serviço é obrigatória')
      return
    }

    console.log('🚀 Iniciando criação de proposta:', {
      profileId: profile.id,
      otherUserId,
      otherUserType,
      conversationId,
      formData
    })

    setIsSubmitting(true)
    
    try {
      const agreementData: ContactAgreementCreate = {
        client_id: otherUserType === 'professional' ? profile.id : otherUserId,
        professional_id: otherUserType === 'professional' ? otherUserId : profile.id,
        conversation_id: conversationId,
        service_description: formData.service_description,
        agreed_price: formData.agreed_price ? parseFloat(formData.agreed_price) : undefined,
        proposed_date: formData.proposed_date || undefined,
        proposed_time: formData.proposed_time || undefined,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined,
        notes: formData.notes || undefined
      }

      console.log('📋 Dados do acordo:', agreementData)

      await createAgreement(agreementData)
      
      setIsProposalOpen(false)
      setFormData({
        service_description: '',
        agreed_price: '',
        proposed_date: '',
        proposed_time: '',
        estimated_duration: '',
        notes: ''
      })

      toast.success('Proposta de acordo enviada!')
      
      // Se está dentro de um modal, fechar o modal pai
      if (isInModal && onClose) {
        onClose()
      }
    } catch (error) {
      console.error('❌ Erro ao criar proposta:', error)
      toast.error(`Erro ao enviar proposta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptAgreement = async (agreementId: string) => {
    try {
      await acceptAgreement(agreementId)
      setHasAgreement(true)
      toast.success('Acordo aceito! Agora vocês podem se avaliar após 1 dia.')
    } catch (error) {
      console.error('Erro ao aceitar acordo:', error)
      toast.error('Erro ao aceitar acordo')
    }
  }

  const handleRejectAgreement = async (agreementId: string) => {
    try {
      await rejectAgreement(agreementId)
      toast.success('Acordo rejeitado')
    } catch (error) {
      console.error('Erro ao rejeitar acordo:', error)
      toast.error('Erro ao rejeitar acordo')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
            PENDENTE
          </Badge>
        )
      case 'accepted':
        return (
          <Badge className="bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
            ACEITO
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
            REJEITADO
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-blue-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
            CONCLUÍDO
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-gray-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
            CANCELADO
          </Badge>
        )
      default:
        return (
          <Badge className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
            {status.toUpperCase()}
          </Badge>
        )
    }
  }

  // Se há acordo aceito
  if (hasAgreement || acceptedAgreement) {
    return (
      <Card className="mb-4 bg-green-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-white" />
            <div>
              <p className="font-black text-white text-lg uppercase">
                ACORDO ACEITO!
              </p>
              <p className="text-white font-bold">
                Vocês podem se avaliar após 20 horas do acordo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Se há uma proposta pendente
  if (pendingAgreement) {
    const isMyProposal = pendingAgreement.proposed_by === profile?.id
    
    return (
      <>
        <Card className="mb-4 bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-black mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="font-black text-black text-lg uppercase">
                      {isMyProposal ? 'SUA PROPOSTA FOI ENVIADA' : 'NOVA PROPOSTA DE ACORDO'}
                    </p>
                    {getStatusBadge(pendingAgreement.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-black font-bold">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span><strong>SERVIÇO:</strong> {pendingAgreement.service_description}</span>
                    </div>
                    
                    {pendingAgreement.agreed_price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span><strong>VALOR:</strong> R$ {pendingAgreement.agreed_price.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {!isMyProposal && (
                <div className="flex gap-2 ml-3">
                  <Button
                    size="sm"
                    onClick={() => setShowProposalModal(true)}
                    className="bg-blue-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    VER DETALHES
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptAgreement(pendingAgreement.id)}
                    className="bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    ACEITAR
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRejectAgreement(pendingAgreement.id)}
                    className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    REJEITAR
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Proposta */}
        <ProposalModal
          isOpen={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          agreement={pendingAgreement}
          onAccept={handleAcceptAgreement}
          onReject={handleRejectAgreement}
          isLoading={isLoading}
        />
      </>
    )
  }

  // Se está dentro de um modal, renderizar o formulário diretamente
  if (isInModal) {
    return (
      <div className="p-6 space-y-4">
        {/* Descrição do Serviço */}
        <div>
          <label className="block text-black font-black text-sm uppercase mb-2">
            DESCRIÇÃO DO SERVIÇO *
          </label>
          <Textarea
            value={formData.service_description}
            onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
            placeholder="Descreva o serviço que precisa..."
            className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            rows={3}
          />
        </div>

        {/* Valor */}
        <div>
          <label className="block text-black font-black text-sm uppercase mb-2">
            VALOR PROPOSTO (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.agreed_price}
            onChange={(e) => setFormData({ ...formData, agreed_price: e.target.value })}
            placeholder="0.00"
            className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
          />
        </div>

        {/* Data e Horário */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-black font-black text-sm uppercase mb-2">
              DATA
            </label>
            <Input
              type="date"
              value={formData.proposed_date}
              onChange={(e) => setFormData({ ...formData, proposed_date: e.target.value })}
              className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
          </div>
          <div>
            <label className="block text-black font-black text-sm uppercase mb-2">
              HORÁRIO
            </label>
            <Input
              type="time"
              value={formData.proposed_time}
              onChange={(e) => setFormData({ ...formData, proposed_time: e.target.value })}
              className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
          </div>
        </div>

        {/* Duração */}
        <div>
          <label className="block text-black font-black text-sm uppercase mb-2">
            DURAÇÃO ESTIMADA (HORAS)
          </label>
          <Input
            type="number"
            min="1"
            value={formData.estimated_duration}
            onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
            placeholder="Ex: 2"
            className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
          />
        </div>

        {/* Observações */}
        <div>
          <label className="block text-black font-black text-sm uppercase mb-2">
            OBSERVAÇÕES
          </label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Informações adicionais..."
            className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            rows={2}
          />
        </div>

        {/* Informações sobre o Sistema */}
        <div className="bg-blue-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-white mt-0.5" />
            <div>
              <h4 className="font-black text-white mb-1 uppercase">
                COMO FUNCIONA:
              </h4>
              <ul className="text-sm text-white font-bold space-y-1">
                <li>• APÓS O ACORDO SER ACEITO, VOCÊS PODERÃO SE AVALIAR</li>
                <li>• É NECESSÁRIO AGUARDAR 20 HORAS APÓS O ACORDO PARA AVALIAR</li>
                <li>• O ACORDO GARANTE TRANSPARÊNCIA E SEGURANÇA</li>
                <li>• OS DADOS DE CONTATO SÃO SEMPRE VISÍVEIS</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end">
          <Button 
            onClick={() => onClose && onClose()}
            className="bg-white text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
          >
            CANCELAR
          </Button>
          <Button 
            onClick={handleCreateProposal}
            disabled={isSubmitting || !formData.service_description.trim()}
            className="bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-6 py-3"
          >
            {isSubmitting ? 'ENVIANDO...' : 'ENVIAR PROPOSTA'}
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar botão para criar proposta (apenas quando não está em modal)
  return (
    <Card className="mb-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Handshake className="h-6 w-6 text-black" />
            <div>
              <p className="font-black text-black text-lg uppercase">
                SISTEMA DE ACORDOS PARA AVALIAÇÕES
              </p>
              <p className="text-black font-bold">
                Faça um acordo para poder avaliar este usuário após o serviço.
              </p>
            </div>
          </div>

          <Button 
            onClick={() => setIsProposalOpen(true)}
            className="bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-6 py-3"
          >
            <Handshake className="h-4 w-4 mr-2" />
            PROPOR ACORDO
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Modal de Proposta - Brutalista
  if (isProposalOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[95vh] overflow-y-auto mx-2 sm:mx-0">
          <div className="bg-yellow-400 border-b-4 border-black p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Handshake className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                <h2 className="text-lg sm:text-xl font-black text-black uppercase">
                  PROPOR ACORDO DE SERVIÇO
                </h2>
              </div>
              <Button
                onClick={onClose}
                size="sm"
                className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-black font-bold mt-2 text-sm sm:text-base">
              Crie uma proposta de trabalho para {otherUserName}. 
              Após o acordo ser aceito, vocês poderão se avaliar após 20 horas.
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Descrição do Serviço */}
            <div>
              <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                DESCRIÇÃO DO SERVIÇO *
              </label>
              <Textarea
                value={formData.service_description}
                onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                placeholder="Descreva o serviço que precisa..."
                className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-sm sm:text-base"
                rows={3}
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                VALOR PROPOSTO (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.agreed_price}
                onChange={(e) => setFormData({ ...formData, agreed_price: e.target.value })}
                placeholder="0.00"
                className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-sm sm:text-base"
              />
            </div>

            {/* Data e Horário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                  DATA
                </label>
                <Input
                  type="date"
                  value={formData.proposed_date}
                  onChange={(e) => setFormData({ ...formData, proposed_date: e.target.value })}
                  className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                  HORÁRIO
                </label>
                <Input
                  type="time"
                  value={formData.proposed_time}
                  onChange={(e) => setFormData({ ...formData, proposed_time: e.target.value })}
                  className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Duração */}
            <div>
              <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                DURAÇÃO ESTIMADA (HORAS)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                placeholder="Ex: 2"
                className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-sm sm:text-base"
              />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                OBSERVAÇÕES
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais..."
                className="bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-sm sm:text-base"
                rows={2}
              />
            </div>

            {/* Informações sobre o Sistema */}
            <div className="bg-blue-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-white mt-0.5" />
                <div>
                  <h4 className="font-black text-white mb-1 uppercase">
                    COMO FUNCIONA:
                  </h4>
                  <ul className="text-sm text-white font-bold space-y-1">
                    <li>• APÓS O ACORDO SER ACEITO, VOCÊS PODERÃO SE AVALIAR</li>
                    <li>• É NECESSÁRIO AGUARDAR 1 DIA APÓS O ACORDO PARA AVALIAR</li>
                    <li>• O ACORDO GARANTE TRANSPARÊNCIA E SEGURANÇA</li>
                    <li>• OS DADOS DE CONTATO SÃO SEMPRE VISÍVEIS</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 border-t-4 border-black p-3 sm:p-4 flex flex-col sm:flex-row justify-end gap-3">
            <Button 
              onClick={() => setIsProposalOpen(false)}
              className="bg-white text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm sm:text-base px-4 py-2"
            >
              CANCELAR
            </Button>
            <Button 
              onClick={handleCreateProposal}
              disabled={isSubmitting || !formData.service_description.trim()}
              className="bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
              {isSubmitting ? 'ENVIANDO...' : 'ENVIAR PROPOSTA'}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

