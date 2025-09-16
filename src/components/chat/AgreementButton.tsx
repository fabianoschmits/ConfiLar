'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Handshake, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface AgreementButtonProps {
  conversationId: string
  otherUserId: string
  otherUserName: string
  otherUserType: 'professional' | 'client'
  onAgreementClick: () => void
}

export function AgreementButton({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserType,
  onAgreementClick 
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
      
      <DialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md">
        <DialogHeader className="bg-yellow-400 border-b-4 border-black p-4">
          <DialogTitle className="flex items-center gap-2 text-black font-black text-lg uppercase">
            <Handshake className="h-5 w-5" />
            SISTEMA DE ACORDOS
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <div className="bg-blue-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-white mt-0.5" />
              <div>
                <h4 className="font-black text-white mb-2 uppercase">
                  COMO FUNCIONA:
                </h4>
                <ul className="text-sm text-white font-bold space-y-1">
                  <li>• FAÇA UM ACORDO PARA PODER AVALIAR {otherUserName.toUpperCase()}</li>
                  <li>• APÓS O ACORDO SER ACEITO, VOCÊS PODERÃO SE AVALIAR</li>
                  <li>• É NECESSÁRIO AGUARDAR 1 DIA APÓS O ACORDO</li>
                  <li>• O ACORDO GARANTE TRANSPARÊNCIA E SEGURANÇA</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-black font-bold mb-4">
              Deseja propor um acordo de serviço para <strong>{otherUserName}</strong>?
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
              >
                CANCELAR
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  onAgreementClick()
                }}
                className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
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
