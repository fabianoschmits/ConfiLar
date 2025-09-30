'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Smartphone, 
  Settings, 
  Shield, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { useAuth } from '@/hooks/useUnifiedAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function NotificationSettings() {
  const { user } = useAuth()
  const {
    isSupported,
    isSubscribed,
    isGranted,
    isDenied,
    requestPermission,
    subscribe,
    unsubscribe
  } = usePushNotifications()

  const [isLoading, setIsLoading] = useState(false)
  const [testNotification, setTestNotification] = useState('')

  const handleRequestPermission = async () => {
    setIsLoading(true)
    try {
      await requestPermission()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async () => {
    setIsLoading(true)
    try {
      await subscribe()
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setIsLoading(true)
    try {
      await unsubscribe()
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = () => {
    if (!testNotification.trim()) return

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Teste - ConfiLar', {
        body: testNotification,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Status do navegador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Status do Navegador
          </CardTitle>
          <CardDescription>
            Informações sobre o suporte a notificações no seu navegador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <div>
                  <Label>Suporte a Notificações</Label>
                  <p className="text-sm text-gray-500">Navegador suporta notificações</p>
                </div>
              </div>
              <Badge variant={isSupported ? 'default' : 'destructive'}>
                {isSupported ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {isSupported ? 'Suportado' : 'Não suportado'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-gray-500" />
                <div>
                  <Label>Permissão</Label>
                  <p className="text-sm text-gray-500">Status da permissão</p>
                </div>
              </div>
              <Badge 
                variant={
                  isGranted ? 'default' : 
                  isDenied ? 'destructive' : 
                  'secondary'
                }
              >
                {isGranted ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : isDenied ? (
                  <XCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {isGranted ? 'Concedida' : isDenied ? 'Negada' : 'Não solicitada'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Gerencie suas notificações push
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported ? (
            <div className="text-center py-8 text-gray-500">
              <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Seu navegador não suporta notificações push</p>
              <p className="text-sm">Use Chrome, Firefox ou Edge para ativar notificações</p>
            </div>
          ) : (
            <div className="space-y-4">
              {!isGranted && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Ativar Notificações</p>
                      <p className="text-sm text-blue-700">Solicite permissão para receber notificações</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleRequestPermission}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Solicitando...' : 'Solicitar Permissão'}
                  </Button>
                </div>
              )}

              {isGranted && !isSubscribed && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Inscrever em Notificações</p>
                      <p className="text-sm text-green-700">Configure para receber notificações push</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Configurando...' : 'Inscrever'}
                  </Button>
                </div>
              )}

              {isGranted && isSubscribed && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Notificações Ativas</p>
                      <p className="text-sm text-gray-700">Você está recebendo notificações push</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleUnsubscribe}
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? 'Desinscrevendo...' : 'Desativar'}
                  </Button>
                </div>
              )}

              {isDenied && (
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Permissão Negada</p>
                      <p className="text-sm text-red-700">As notificações foram negadas. Ative nas configurações do navegador</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                    variant="outline"
                  >
                    Abrir Configurações
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste de notificação */}
      {isGranted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Teste de Notificação
            </CardTitle>
            <CardDescription>
              Teste se as notificações estão funcionando
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma mensagem de teste..."
                value={testNotification}
                onChange={(e) => setTestNotification(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={sendTestNotification}
                disabled={!testNotification.trim()}
                variant="outline"
              >
                Enviar Teste
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Uma notificação será enviada com a mensagem digitada
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informações técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Informações Técnicas
          </CardTitle>
          <CardDescription>
            Detalhes sobre o sistema de notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Navegador</Label>
              <p className="text-gray-600">{navigator.userAgent.split(' ')[0]}</p>
            </div>
            <div>
              <Label className="font-medium">Service Worker</Label>
              <p className="text-gray-600">
                {('serviceWorker' in navigator) ? 'Suportado' : 'Não suportado'}
              </p>
            </div>
            <div>
              <Label className="font-medium">Push Manager</Label>
              <p className="text-gray-600">
                {('PushManager' in window) ? 'Suportado' : 'Não suportado'}
              </p>
            </div>
            <div>
              <Label className="font-medium">Usuário</Label>
              <p className="text-gray-600">{user?.email || 'Não logado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações de limpeza */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Limpeza de Dados
          </CardTitle>
          <CardDescription>
            Gerencie os dados de notificação armazenados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Limpar Cache de Notificações</Label>
              <p className="text-sm text-gray-500">Remove dados temporários de notificação</p>
            </div>
            <Button variant="outline" size="sm">
              Limpar Cache
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Resetar Configurações</Label>
              <p className="text-sm text-gray-500">Volta às configurações padrão</p>
            </div>
            <Button variant="outline" size="sm">
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}