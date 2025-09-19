'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Handshake, Info, CheckCircle, AlertCircle, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface AgreementButtonProps {
  conversationId: string
  otherUserId: string
  otherUserName: string
  otherUserType: 'professional' | 'client'
  onAgreementClick: () => void
  onProposeAgreement: () => void
}

export function AgreementButton({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserType,
  onAgreementClick,
  onProposeAgreement 
}: AgreementButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 text-xs rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Handshake className="h-3 w-3 mr-1" />
          Acordo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg">
              <Handshake className="h-4 w-4 sm:h-5 sm:w-5" />
              Sistema de Acordos
            </DialogTitle>
            <Button
              onClick={() => setIsModalOpen(false)}
              size="sm"
              className="text-white hover:bg-white/20 p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Como funciona o sistema de acordos?
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  O sistema de acordos permite que você faça propostas formais de serviço e seja avaliado após a conclusão.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">1</div>
                    <span className="text-sm text-gray-700">Você propõe um acordo detalhado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">2</div>
                    <span className="text-sm text-gray-700">O outro usuário recebe uma notificação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">3</div>
                    <span className="text-sm text-gray-700">Ele pode aceitar ou rejeitar a proposta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">4</div>
                    <span className="text-sm text-gray-700">Após 20 horas, ambos podem se avaliar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Benefícios do acordo:
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Compromisso formal e detalhado do serviço</li>
                  <li>• Proteção para ambas as partes</li>
                  <li>• Possibilidade de avaliação mútua após o serviço</li>
                  <li>• Acesso às informações de contato</li>
                  <li>• Histórico profissional para futuras referências</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Importante:
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• O acordo é um compromisso sério entre as partes</li>
                  <li>• Após aceito, vocês terão acesso aos dados de contato</li>
                  <li>• É necessário aguardar 20 horas para poder avaliar</li>
                  <li>• Cada usuário só pode avaliar o outro uma vez por acordo</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-700 mb-4 text-sm sm:text-base">
              Deseja propor um acordo de serviço para <strong>{otherUserName}</strong>?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm sm:text-base px-4 py-2 transition-all duration-200"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  onProposeAgreement()
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm sm:text-base px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Handshake className="h-4 w-4 mr-2" />
                Propor Acordo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
