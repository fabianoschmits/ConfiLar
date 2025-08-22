'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Handshake,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react'
import { useContactAgreements, ContactAgreement, ContactAgreementCreate } from '@/hooks/useContactAgreements'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface ContactAgreementProposalProps {
  conversationId: string
  otherUserId: string
  otherUserName: string
  otherUserType: 'professional' | 'client'
}

export function ContactAgreementProposal({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserType 
}: ContactAgreementProposalProps) {
  const { profile } = useAuthContext()
  const { 
    agreements, 
    isLoading, 
    createAgreement, 
    acceptAgreement, 
    rejectAgreement,
    areContactsRevealed 
  } = useContactAgreements()

  const [isProposalOpen, setIsProposalOpen] = useState(false)
  const [contactsRevealed, setContactsRevealed] = useState(false)
  const [formData, setFormData] = useState({
    service_description: '',
    agreed_price: '',
    proposed_date: '',
    proposed_time: '',
    estimated_duration: '',
    notes: ''
  })

  // Verificar se contatos estão revelados
  useState(() => {
    areContactsRevealed(otherUserId).then(setContactsRevealed)
  })

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
      return
    }

    if (!formData.service_description.trim()) {
      toast.error('Descrição do serviço é obrigatória')
      return
    }

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
    } catch (error) {
      console.error('Erro ao criar proposta:', error)
      toast.error('Erro ao enviar proposta')
    }
  }

  const handleAcceptAgreement = async (agreementId: string) => {
    try {
      await acceptAgreement(agreementId)
      setContactsRevealed(true)
      toast.success('Acordo aceito! Dados de contato liberados.')
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
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Aceito</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-blue-500">Concluído</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-500">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Se os contatos já estão revelados
  if (contactsRevealed || acceptedAgreement) {
    return (
      <Card className="mb-4 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Dados de contato liberados!
              </p>
              <p className="text-sm text-green-600">
                Vocês podem trocar informações de contato livremente.
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
      <Card className="mb-4 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-yellow-800">
                    {isMyProposal ? 'Sua proposta foi enviada' : 'Nova proposta de acordo'}
                  </p>
                  {getStatusBadge(pendingAgreement.status)}
                </div>
                
                <div className="space-y-2 text-sm text-yellow-700">
                  <p><strong>Serviço:</strong> {pendingAgreement.service_description}</p>
                  
                  {pendingAgreement.agreed_price && (
                    <p><strong>Valor:</strong> R$ {pendingAgreement.agreed_price.toFixed(2)}</p>
                  )}
                  
                  {pendingAgreement.proposed_date && (
                    <p><strong>Data:</strong> {new Date(pendingAgreement.proposed_date).toLocaleDateString('pt-BR')}</p>
                  )}
                  
                  {pendingAgreement.proposed_time && (
                    <p><strong>Horário:</strong> {pendingAgreement.proposed_time}</p>
                  )}
                  
                  {pendingAgreement.estimated_duration && (
                    <p><strong>Duração:</strong> {pendingAgreement.estimated_duration}h</p>
                  )}
                  
                  {pendingAgreement.notes && (
                    <p><strong>Observações:</strong> {pendingAgreement.notes}</p>
                  )}
                </div>
              </div>
            </div>
            
            {!isMyProposal && (
              <div className="flex gap-2 ml-3">
                <Button
                  size="sm"
                  onClick={() => handleAcceptAgreement(pendingAgreement.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aceitar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectAgreement(pendingAgreement.id)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostrar botão para criar proposta
  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">
                Proteção de Privacidade Ativa
              </p>
              <p className="text-sm text-blue-600">
                Os dados de contato só serão liberados após um acordo.
              </p>
            </div>
          </div>

          <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Handshake className="h-4 w-4 mr-2" />
                Propor Acordo
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  Propor Acordo de Serviço
                </DialogTitle>
                <DialogDescription>
                  Crie uma proposta de trabalho para {otherUserName}. 
                  Após o acordo ser aceito, os dados de contato serão liberados.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Descrição do Serviço */}
                <div>
                  <Label htmlFor="service_description">Descrição do Serviço *</Label>
                  <Textarea
                    id="service_description"
                    value={formData.service_description}
                    onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                    placeholder="Descreva o serviço que precisa..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Valor */}
                <div>
                  <Label htmlFor="agreed_price">Valor Proposto (R$)</Label>
                  <Input
                    id="agreed_price"
                    type="number"
                    step="0.01"
                    value={formData.agreed_price}
                    onChange={(e) => setFormData({ ...formData, agreed_price: e.target.value })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="proposed_date">Data</Label>
                    <Input
                      id="proposed_date"
                      type="date"
                      value={formData.proposed_date}
                      onChange={(e) => setFormData({ ...formData, proposed_date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="proposed_time">Horário</Label>
                    <Input
                      id="proposed_time"
                      type="time"
                      value={formData.proposed_time}
                      onChange={(e) => setFormData({ ...formData, proposed_time: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Duração */}
                <div>
                  <Label htmlFor="estimated_duration">Duração Estimada (horas)</Label>
                  <Input
                    id="estimated_duration"
                    type="number"
                    min="1"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                    placeholder="Ex: 2"
                    className="mt-1"
                  />
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Informações adicionais..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsProposalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateProposal}
                  disabled={isLoading || !formData.service_description.trim()}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Proposta'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}






