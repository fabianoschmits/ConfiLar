'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePWA } from '@/hooks/usePWA'

export function PWAUpdateNotification() {
  const { updateAvailable, updateApp } = usePWA()
  const [isVisible, setIsVisible] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (updateAvailable) {
      setIsVisible(true)
    }
  }, [updateAvailable])

  const handleUpdate = async () => {
    setIsUpdating(true)
    await updateApp()
    // updateApp já recarrega a página, então não precisa fazer nada aqui
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Mostrar novamente em 1 hora se ainda houver atualização
    setTimeout(() => {
      if (updateAvailable) {
        setIsVisible(true)
      }
    }, 3600000) // 1 hora
  }

  if (!isVisible || !updateAvailable) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="w-80 sm:w-96 shadow-lg border-blue-200 bg-blue-50">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-blue-900">
                  Nova Versão Disponível!
                </h4>
                <p className="text-xs text-blue-700">
                  Atualize para obter as últimas melhorias
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-6 w-6 text-blue-600 hover:bg-blue-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Informações sobre a atualização */}
          <div className="bg-white rounded-lg p-3 space-y-1">
            <p className="text-xs text-gray-600">
              ✨ Melhorias de performance
            </p>
            <p className="text-xs text-gray-600">
              🐛 Correções de bugs
            </p>
            <p className="text-xs text-gray-600">
              🆕 Novas funcionalidades
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {isUpdating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Atualizar Agora
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              size="sm"
              className="flex-1"
            >
              Mais Tarde
            </Button>
          </div>

          {/* Aviso */}
          <p className="text-xs text-blue-600 text-center">
            A página será recarregada automaticamente
          </p>
        </div>
      </Card>
    </div>
  )
}

