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
          className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-3 py-1 text-xs"
        >
          <Handshake className="h-3 w-3 mr-1" />
          ACORDO
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-yellow-400 border-b-4 border-black p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-black font-black text-base sm:text-lg uppercase">
              <Handshake className="h-4 w-4 sm:h-5 sm:w-5" />
              SISTEMA DE ACORDOS
            </DialogTitle>
            <Button
              onClick={() => setIsModalOpen(false)}
              size="sm"
              className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Info className="h-5 w-5 sm:h-6 sm:w-6 text-black mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-black text-black mb-2 uppercase text-sm sm:text-base">
                  COMO FUNCIONA O SISTEMA DE ACORDOS?
                </h3>
                <p className="text-xs sm:text-sm text-black font-bold mb-3">
                  O sistema de acordos permite que você faça propostas formais de serviço e seja avaliado após a conclusão.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black text-yellow-400 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-xs font-black flex-shrink-0">1</div>
                    <span className="text-xs sm:text-sm text-black font-bold">Você propõe um acordo detalhado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black text-yellow-400 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-xs font-black flex-shrink-0">2</div>
                    <span className="text-xs sm:text-sm text-black font-bold">O outro usuário recebe uma notificação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black text-yellow-400 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-xs font-black flex-shrink-0">3</div>
                    <span className="text-xs sm:text-sm text-black font-bold">Ele pode aceitar ou rejeitar a proposta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black text-yellow-400 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-xs font-black flex-shrink-0">4</div>
                    <span className="text-xs sm:text-sm text-black font-bold">Após 20 horas, ambos podem se avaliar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-black text-white mb-2 uppercase text-sm sm:text-base">
                  BENEFÍCIOS DO ACORDO:
                </h3>
                <ul className="text-xs sm:text-sm text-white font-bold space-y-1">
                  <li>• Compromisso formal e detalhado do serviço</li>
                  <li>• Proteção para ambas as partes</li>
                  <li>• Possibilidade de avaliação mútua após o serviço</li>
                  <li>• Acesso às informações de contato</li>
                  <li>• Histórico profissional para futuras referências</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-black text-white mb-2 uppercase text-sm sm:text-base">
                  IMPORTANTE:
                </h3>
                <ul className="text-xs sm:text-sm text-white font-bold space-y-1">
                  <li>• O acordo é um compromisso sério entre as partes</li>
                  <li>• Após aceito, vocês terão acesso aos dados de contato</li>
                  <li>• É necessário aguardar 20 horas para poder avaliar</li>
                  <li>• Cada usuário só pode avaliar o outro uma vez por acordo</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-black font-bold mb-4 text-sm sm:text-base">
              Deseja propor um acordo de serviço para <strong>{otherUserName}</strong>?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm sm:text-base px-4 py-2"
              >
                CANCELAR
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  onProposeAgreement()
                }}
                className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm sm:text-base px-4 py-2"
              >
                <Handshake className="h-4 w-4 mr-2" />
                PROPOR ACORDO
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
