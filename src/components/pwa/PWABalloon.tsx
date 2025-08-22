'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  X, 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  RotateCcw,
  HandHeart
} from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import { useMobile } from '@/hooks/useMobile'

export function PWABalloon() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { isInstallable, isInstalled, updateAvailable, isOnline, installApp, updateApp } = usePWA()
  const { isMobile } = useMobile()

  useEffect(() => {
    // Verificar se já foi dispensado
    const dismissed = localStorage.getItem('pwa-balloon-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Mostrar após 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-balloon-dismissed', 'true')
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsVisible(false)
    }
  }

  const handleUpdate = async () => {
    await updateApp()
  }

  // Não mostrar se foi dispensado ou se já está instalado e não há atualizações
  if (isDismissed || (isInstalled && !updateAvailable)) {
    return null
  }

  return (
    <>
      {/* Overlay escuro */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={handleDismiss}
        />
      )}

      {/* Balão PWA */}
      <div className={`
        fixed 
        ${isMobile ? 'bottom-6 left-4 right-4' : 'top-20 right-6 w-96'} 
        z-50 
        transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}>
        <Card className="bg-gray-100 border-gray-300 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <HandHeart className="h-6 w-6 text-gray-100" />
                </div>
                <div>
                  <CardTitle className="text-black text-lg">ConfiLar App</CardTitle>
                  <CardDescription className="text-gray-600">
                    Instale nosso aplicativo
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="text-gray-500 hover:text-black"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status da conexão */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
              
              {isInstalled && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  ✓ Instalado
                </Badge>
              )}
            </div>

            {/* Atualização disponível */}
            {updateAvailable && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Atualização Disponível</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Uma nova versão está disponível com melhorias e correções.
                </p>
                <Button 
                  size="sm" 
                  onClick={handleUpdate}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Atualizar Agora
                </Button>
              </div>
            )}

            {/* Informações de instalação */}
            {!isInstalled && (
              <>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    <strong>Transforme em app:</strong> Instale a ConfiLar no seu dispositivo 
                    para acesso rápido e experiência completa.
                  </p>

                  <Separator className="bg-gray-300" />

                  {/* Benefícios */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {isMobile ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Monitor className="h-4 w-4" />
                      )}
                      <span>Ícone na tela inicial</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Wifi className="h-4 w-4" />
                      <span>Funciona offline</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RotateCcw className="h-4 w-4" />
                      <span>Atualizações automáticas</span>
                    </div>
                  </div>
                </div>

                {/* Botão de instalação */}
                {isInstallable ? (
                  <Button 
                    onClick={handleInstall} 
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Instalar App
                  </Button>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                      {isMobile ? (
                        <>
                          No <strong>Safari</strong>: toque em <strong>Compartilhar</strong> → <strong>Adicionar à Tela de Início</strong><br/>
                          No <strong>Chrome</strong>: toque no menu → <strong>Instalar app</strong>
                        </>
                      ) : (
                        <>
                          No <strong>Chrome</strong>: clique no ícone de instalação na barra de endereços<br/>
                          No <strong>Edge</strong>: clique em <strong>⋯</strong> → <strong>Apps</strong> → <strong>Instalar este site como um app</strong>
                        </>
                      )}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Botão dispensar */}
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="w-full border-gray-300 text-gray-600 hover:text-black"
              size="sm"
            >
              Agora não
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}




