'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  RotateCcw, 
  WifiOff,
  Smartphone
} from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export function PWAStatus() {
  const { isInstallable, isInstalled, updateAvailable, isOnline, installApp, updateApp } = usePWA()

  // Se não há ações disponíveis, não mostrar nada
  if (!isInstallable && !updateAvailable && isOnline) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status offline */}
      {!isOnline && (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )}

      {/* Atualização disponível */}
      {updateAvailable && (
        <Button
          size="sm"
          variant="outline"
          onClick={updateApp}
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Atualizar
        </Button>
      )}

      {/* Botão de instalação */}
      {isInstallable && !isInstalled && (
        <Button
          size="sm"
          onClick={installApp}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Download className="h-3 w-3 mr-1" />
          <span className="hidden md:inline">Instalar App</span>
          <Smartphone className="h-3 w-3 md:hidden" />
        </Button>
      )}

      {/* Status instalado */}
      {isInstalled && !updateAvailable && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Smartphone className="h-3 w-3 mr-1" />
          <span className="hidden md:inline">App Instalado</span>
          <span className="md:hidden">App</span>
        </Badge>
      )}
    </div>
  )
}
