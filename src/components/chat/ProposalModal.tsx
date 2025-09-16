'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Handshake,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  User,
  AlertCircle,
  X
} from 'lucide-react'
import { ContactAgreement } from '@/hooks/useContactAgreements'

interface ProposalModalProps {
  isOpen: boolean
  onClose: () => void
  agreement: ContactAgreement | null
  onAccept: (agreementId: string) => void
  onReject: (agreementId: string) => void
  isLoading?: boolean
}

export function ProposalModal({ 
  isOpen, 
  onClose, 
  agreement, 
  onAccept, 
  onReject, 
  isLoading = false 
}: ProposalModalProps) {
  if (!agreement) return null

  const handleAccept = () => {
    onAccept(agreement.id)
  }

  const handleReject = () => {
    onReject(agreement.id)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não especificado'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Não especificado'
    return timeString
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'A combinar'
    return `R$ ${price.toFixed(2)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-4 sm:mx-0">
        <DialogHeader className="bg-yellow-400 border-b-4 border-black p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-black font-black text-lg sm:text-xl uppercase">
              <Handshake className="h-5 w-5 sm:h-6 sm:w-6" />
              NOVA PROPOSTA DE ACORDO
            </DialogTitle>
            <Button
              onClick={onClose}
              size="sm"
              className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Informações do Proponente */}
          <Card className="bg-blue-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
                <div>
                  <p className="font-black text-white text-sm sm:text-base uppercase">
                    PROPOSTA ENVIADA POR
                  </p>
                  <p className="text-white font-bold text-sm sm:text-base">
                    {agreement.proposed_by === agreement.client_id
                      ? (agreement as any).client?.full_name || 'Cliente'
                      : (agreement as any).professional?.full_name || 'Profissional'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes da Proposta */}
          <Card className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-black text-black text-base sm:text-lg uppercase mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                DETALHES DA PROPOSTA
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Descrição do Serviço */}
                <div>
                  <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                    DESCRIÇÃO DO SERVIÇO
                  </label>
                  <div className="bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3">
                    <p className="text-black font-bold text-sm sm:text-base">{agreement.service_description}</p>
                  </div>
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                    VALOR PROPOSTO
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                    <span className="text-black font-bold text-base sm:text-lg">{formatPrice(agreement.agreed_price)}</span>
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                      DATA PROPOSTA
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                      <span className="text-black font-bold text-sm sm:text-base">{formatDate(agreement.proposed_date)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-black font-black text-xs sm:text-sm uppercase mb-2">
                      HORÁRIO
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                      <span className="text-black font-bold text-sm sm:text-base">{formatTime(agreement.proposed_time)}</span>
                    </div>
                  </div>
                </div>

                {/* Duração */}
                {agreement.estimated_duration && (
                  <div>
                    <label className="block text-black font-black text-sm uppercase mb-2">
                      DURAÇÃO ESTIMADA
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-black" />
                      <span className="text-black font-bold">{agreement.estimated_duration} horas</span>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {agreement.notes && (
                  <div>
                    <label className="block text-black font-black text-sm uppercase mb-2">
                      OBSERVAÇÕES
                    </label>
                    <div className="bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3">
                      <p className="text-black font-bold">{agreement.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações Importantes */}
          <Card className="bg-green-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-white mt-0.5" />
                <div>
                  <h4 className="font-black text-white mb-2 uppercase">
                    IMPORTANTE:
                  </h4>
                  <ul className="text-sm text-white font-bold space-y-1">
                    <li>• Ao aceitar, vocês terão acesso aos dados de contato</li>
                    <li>• Após 20 horas do acordo aceito, poderão se avaliar</li>
                    <li>• Este é um compromisso formal entre as partes</li>
                    <li>• Você pode rejeitar a proposta se não concordar</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="bg-gray-100 border-t-4 border-black p-3 sm:p-4 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="bg-white text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm sm:text-base px-4 py-2"
          >
            FECHAR
          </Button>
          <Button
            onClick={handleReject}
            disabled={isLoading}
            className="bg-red-500 text-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm sm:text-base px-4 py-2"
          >
            <XCircle className="h-4 w-4 mr-2" />
            REJEITAR
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="bg-green-500 text-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm sm:text-base px-4 py-2"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            ACEITAR ACORDO
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
