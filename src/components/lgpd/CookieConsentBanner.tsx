'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Cookie, 
  Settings, 
  Check, 
  X, 
  Shield,
  BarChart3,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytical: boolean
  marketing: boolean
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Sempre true
    functional: false,
    analytical: false,
    marketing: false
  })

  useEffect(() => {
    // Verificar se o usuário já deu consentimento
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    } else {
      // Carregar preferências salvas
      const savedPreferences = localStorage.getItem('cookie-preferences')
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytical: true,
      marketing: true
    }
    
    setPreferences(allAccepted)
    savePreferences(allAccepted)
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      functional: false,
      analytical: false,
      marketing: false
    }
    
    setPreferences(onlyEssential)
    savePreferences(onlyEssential)
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    savePreferences(preferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', 'true')
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs))
    
    // Aplicar preferências (aqui você implementaria a lógica real)
    console.log('Cookie preferences saved:', prefs)
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return // Não pode ser desabilitado
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4">
      <Card className="max-w-2xl mx-auto shadow-lg border bg-white/95 backdrop-blur-sm">
        <CardContent className="p-3 sm:p-4">
          {!showSettings ? (
            // Banner Principal - Compacto
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="h-3 w-3 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    🍪 Cookies
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Usamos cookies essenciais. Você pode personalizar.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleAcceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  <Check className="h-3 w-3 mr-1 sm:mr-2" />
                  Aceitar
                </Button>
                
                <Button 
                  onClick={handleRejectAll}
                  variant="outline"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  <X className="h-3 w-3 mr-1 sm:mr-2" />
                  Apenas Essenciais
                </Button>
                
                <Button 
                  onClick={() => setShowSettings(true)}
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  <Settings className="h-3 w-3 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Personalizar</span>
                  <span className="sm:hidden">Opções</span>
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Ao continuar, você concorda com nossa{' '}
                <Link href="/privacidade" className="text-blue-600 hover:underline">
                  Política de Privacidade
                </Link>
                .
              </div>
            </div>
          ) : (
            // Configurações Detalhadas - Compactas
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Configurações de Cookies
                </h3>
                <Button 
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-2">
                {/* Cookies Essenciais */}
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-xs sm:text-sm">Essenciais</h4>
                      <p className="text-xs text-gray-600 hidden sm:block">
                        Funcionamento básico
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Sempre
                  </Badge>
                </div>

                {/* Cookies Funcionais */}
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-xs sm:text-sm">Funcionais</h4>
                      <p className="text-xs text-gray-600 hidden sm:block">
                        Personalização
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => togglePreference('functional')}
                    variant={preferences.functional ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-xs"
                  >
                    {preferences.functional ? 'Sim' : 'Não'}
                  </Button>
                </div>

                {/* Cookies Analíticos */}
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-xs sm:text-sm">Analíticos</h4>
                      <p className="text-xs text-gray-600 hidden sm:block">
                        Análise e melhorias
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => togglePreference('analytical')}
                    variant={preferences.analytical ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-xs"
                  >
                    {preferences.analytical ? 'Sim' : 'Não'}
                  </Button>
                </div>

                {/* Cookies de Marketing */}
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Cookie className="h-4 w-4 text-orange-600" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-xs sm:text-sm">Marketing</h4>
                      <p className="text-xs text-gray-600 hidden sm:block">
                        Publicidade
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => togglePreference('marketing')}
                    variant={preferences.marketing ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-xs"
                  >
                    {preferences.marketing ? 'Sim' : 'Não'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
                <Button 
                  onClick={handleSavePreferences}
                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  <Check className="h-3 w-3 mr-1 sm:mr-2" />
                  Salvar
                </Button>
                
                <Button 
                  onClick={handleAcceptAll}
                  variant="outline"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  Aceitar Todos
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Você pode alterar essas configurações a qualquer momento.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
