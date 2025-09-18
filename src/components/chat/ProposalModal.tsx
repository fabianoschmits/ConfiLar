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
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto bg-white border-0 shadow-xl rounded-xl mx-4 sm:mx-0">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 rounded-t-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-gray-900 font-semibold text-lg sm:text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Handshake className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              Nova proposta de acordo
            </DialogTitle>
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Informações do Proponente */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm rounded-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-900 text-sm sm:text-base mb-1">
                    Proposta enviada por
                  </p>
                  <p className="text-blue-800 font-semibold text-base sm:text-lg">
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
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Detalhes da proposta
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Descrição do Serviço */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">
                    Descrição do serviço
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-900 text-sm sm:text-base">{agreement.service_description}</p>
                  </div>
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">
                    Valor proposto
                  </label>
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-semibold text-base sm:text-lg">{formatPrice(agreement.agreed_price)}</span>
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-2">
                      Data proposta
                    </label>
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800 font-medium text-sm sm:text-base">{formatDate(agreement.proposed_date)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-2">
                      Horário
                    </label>
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800 font-medium text-sm sm:text-base">{formatTime(agreement.proposed_time)}</span>
                    </div>
                  </div>
                </div>

                {/* Duração */}
                {agreement.estimated_duration && (
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-2">
                      Duração estimada
                    </label>
                    <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-purple-800 font-medium">{agreement.estimated_duration} horas</span>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {agreement.notes && (
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-2">
                      Observações
                    </label>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-amber-900 text-sm">{agreement.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações Importantes */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 shadow-sm rounded-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900 mb-3">
                    Informações importantes:
                  </h4>
                  <ul className="text-sm text-orange-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Ao aceitar, vocês terão acesso aos dados de contato</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Após 20 horas do acordo aceito, poderão se avaliar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Este é um compromisso formal entre as partes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Você pode rejeitar a proposta se não concordar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 justify-end rounded-b-xl">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Fechar
          </Button>
          <Button
            onClick={handleReject}
            disabled={isLoading}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeitar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aceitar acordo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
