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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg border-2">
        <CardContent className="p-6">
          {!showSettings ? (
            // Banner Principal
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Cookie className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    🍪 Usamos cookies para melhorar sua experiência
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Utilizamos cookies essenciais para o funcionamento da plataforma e cookies opcionais 
                    para análise e personalização. Você pode escolher quais aceitar.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aceitar Todos
                </Button>
                
                <Button 
                  onClick={handleRejectAll}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Apenas Essenciais
                </Button>
                
                <Button 
                  onClick={() => setShowSettings(true)}
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Personalizar
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                Ao continuar navegando, você concorda com nossa{' '}
                <Link href="/privacidade" className="text-blue-600 hover:underline">
                  Política de Privacidade
                </Link>
                {' '}e{' '}
                <Link href="/termos" className="text-blue-600 hover:underline">
                  Termos de Uso
                </Link>
                .
              </div>
            </div>
          ) : (
            // Configurações Detalhadas
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Configurações de Cookies
                </h3>
                <Button 
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Cookies Essenciais */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Cookies Essenciais</h4>
                      <p className="text-sm text-gray-600">
                        Necessários para o funcionamento básico da plataforma
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Sempre Ativo
                  </Badge>
                </div>

                {/* Cookies Funcionais */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Cookies Funcionais</h4>
                      <p className="text-sm text-gray-600">
                        Melhoram a funcionalidade e personalização
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => togglePreference('functional')}
                    variant={preferences.functional ? "default" : "outline"}
                    size="sm"
                  >
                    {preferences.functional ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>

                {/* Cookies Analíticos */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Cookies Analíticos</h4>
                      <p className="text-sm text-gray-600">
                        Coletam dados para análise e melhorias
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => togglePreference('analytical')}
                    variant={preferences.analytical ? "default" : "outline"}
                    size="sm"
                  >
                    {preferences.analytical ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>

                {/* Cookies de Marketing */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Cookie className="h-5 w-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Cookies de Marketing</h4>
                      <p className="text-sm text-gray-600">
                        Para publicidade personalizada e remarketing
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => togglePreference('marketing')}
                    variant={preferences.marketing ? "default" : "outline"}
                    size="sm"
                  >
                    {preferences.marketing ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  onClick={handleSavePreferences}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Preferências
                </Button>
                
                <Button 
                  onClick={handleAcceptAll}
                  variant="outline"
                >
                  Aceitar Todos
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                Você pode alterar essas configurações a qualquer momento nas configurações da sua conta.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
