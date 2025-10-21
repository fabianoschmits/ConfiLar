'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  Settings,
  CheckCircle,
  AlertTriangle,
  FileText,
  Database,
  Bell,
  Lock
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { DataPortabilityModal } from '@/components/lgpd/DataPortabilityModal'
import { RightToBeForgottenModal } from '@/components/lgpd/RightToBeForgottenModal'
import { ProfileVisibilitySettings } from '@/components/lgpd/ProfileVisibilitySettings'
import { NotificationPreferences } from '@/components/lgpd/NotificationPreferences'
import { LocationDataSettings } from '@/components/lgpd/LocationDataSettings'
import { toast } from 'sonner'

export default function ConfiguracoesPrivacidadePage() {
  const { user } = useAuthContext()
  const [mounted, setMounted] = useState(false)
  const [showDataPortability, setShowDataPortability] = useState(false)
  const [showRightToBeForgotten, setShowRightToBeForgotten] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                Acesso Restrito
              </h2>
              <p className="text-gray-600 mb-4">
                Você precisa estar logado para acessar as configurações de privacidade.
              </p>
              <Button asChild>
                <a href="/auth">Fazer Login</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const privacySettings = [
    {
      id: 'visibility',
      title: 'Disponibilidade',
      description: 'Controlar se você está disponível para receber propostas',
      icon: <Eye className="h-5 w-5" />,
      status: 'Ativo',
      action: 'Configurar'
    },
    {
      id: 'notifications',
      title: 'Notificações',
      description: 'Sistema de notificações em desenvolvimento',
      icon: <Bell className="h-5 w-5" />,
      status: 'Em Desenvolvimento',
      action: 'Em Breve'
    },
    {
      id: 'location',
      title: 'Dados de Localização',
      description: 'Sistema de localização em desenvolvimento',
      icon: <Database className="h-5 w-5" />,
      status: 'Em Desenvolvimento',
      action: 'Em Breve'
    }
  ]

  const lgpdRights = [
    {
      title: 'Acesso aos Dados',
      description: 'Visualizar todos os seus dados pessoais',
      icon: <Eye className="h-5 w-5" />,
      action: 'Visualizar',
      color: 'blue'
    },
    {
      title: 'Correção de Dados',
      description: 'Corrigir informações incorretas',
      icon: <CheckCircle className="h-5 w-5" />,
      action: 'Corrigir',
      color: 'green'
    },
    {
      title: 'Portabilidade',
      description: 'Exportar seus dados em formato legível',
      icon: <Download className="h-5 w-5" />,
      action: 'Exportar',
      color: 'purple'
    },
    {
      title: 'Direito ao Esquecimento',
      description: 'Excluir permanentemente sua conta e dados',
      icon: <Trash2 className="h-5 w-5" />,
      action: 'Excluir',
      color: 'red'
    }
  ]

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">Configurações de Privacidade</h1>
                <p className="text-gray-600">Gerencie seus dados pessoais conforme a LGPD</p>
              </div>
            </div>
          </div>

          {/* Status LGPD */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-green-800">Conformidade com LGPD</h3>
                  <p className="text-green-700 text-sm">
                    Sua conta está em conformidade com a Lei Geral de Proteção de Dados. 
                    Você tem controle total sobre seus dados pessoais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            
            {/* Configurações de Privacidade */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações de Privacidade
              </h2>
              
              {privacySettings.map((setting, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">
                          {setting.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white dark:text-white">{setting.title}</h3>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {setting.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveSection(activeSection === setting.id ? null : setting.id)}
                        >
                          {activeSection === setting.id ? 'Fechar' : setting.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Componentes Funcionais */}
            {activeSection === 'visibility' && (
              <ProfileVisibilitySettings />
            )}
            
            {activeSection === 'notifications' && (
              <NotificationPreferences />
            )}
            
            {activeSection === 'location' && (
              <LocationDataSettings />
            )}

            {/* Direitos LGPD */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Seus Direitos (LGPD)
              </h2>
              
              {lgpdRights.map((right, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`text-${right.color}-600`}>
                          {right.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white dark:text-white">{right.title}</h3>
                          <p className="text-sm text-gray-600">{right.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant={right.color === 'red' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => {
                          if (right.title === 'Portabilidade') {
                            setShowDataPortability(true)
                          } else if (right.title === 'Direito ao Esquecimento') {
                            setShowRightToBeForgotten(true)
                          } else {
                            toast.info(`Funcionalidade "${right.action}" em desenvolvimento`)
                          }
                        }}
                      >
                        {right.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Informações Importantes */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contato para Privacidade:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Email: privacidade@appconfilar.com.br</li>
                    <li>• DPO: privacidade@appconfilar.com.br</li>
                    <li>• Telefone: (11) 99999-9999</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Documentos Legais:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <a href="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</a></li>
                    <li>• <a href="/termos" className="text-blue-600 hover:underline">Termos de Uso</a></li>
                    <li>• <a href="/ajuda" className="text-blue-600 hover:underline">Central de Ajuda</a></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Última atualização: 15 de Janeiro de 2025 | 
              Conforme Lei Geral de Proteção de Dados (LGPD)
            </p>
          </div>
        </div>
      </div>

      {/* Modais */}
      <DataPortabilityModal 
        isOpen={showDataPortability}
        onClose={() => setShowDataPortability(false)}
      />
      
      <RightToBeForgottenModal 
        isOpen={showRightToBeForgotten}
        onClose={() => setShowRightToBeForgotten(false)}
      />
    </MainLayout>
  )
}
