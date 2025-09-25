'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { NotificationCleanupTool } from '@/components/admin/NotificationCleanupTool'

export default function AdminNotificationsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ Ferramenta de Administração
          </h1>
          <p className="text-gray-600">
            Limpeza de notificações em massa
          </p>
        </div>
        
        <NotificationCleanupTool />
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">📋 Instruções:</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <strong>Para usuário específico:</strong> Digite o ID do usuário e clique em "Verificar"
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <strong>Limpar todas:</strong> Clique em "Limpar Todas as Notificações deste Usuário"
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <strong>Para operações complexas:</strong> Use o script SQL fornecido
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <strong>Limpeza geral:</strong> Use os botões de "Limpar Notificações Antigas"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
