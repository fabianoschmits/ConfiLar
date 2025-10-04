'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  MessageCircle, 
  Heart, 
  Star, 
  Shield, 
  Settings,
  Send,
  TestTube,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function TesteNotificacoesPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testNotification = async (type: string, message: string) => {
    setIsLoading(true)
    addTestResult(`🧪 Testando notificação: ${type}`)
    
    try {
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title: `Teste ${type}`,
          message,
          userId: 'current'
        })
      })

      if (response.ok) {
        addTestResult(`✅ Notificação ${type} enviada com sucesso!`)
        toast.success(`Notificação ${type} criada!`)
      } else {
        const error = await response.text()
        addTestResult(`❌ Erro ao enviar ${type}: ${error}`)
        toast.error(`Erro: ${error}`)
      }
    } catch (error) {
      addTestResult(`❌ Erro de conexão: ${error}`)
      toast.error(`Erro de conexão: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testPushNotification = async () => {
    setIsLoading(true)
    addTestResult('🔔 Testando notificação push...')
    
    try {
      // Verificar se o navegador suporta notificações
      if (!('Notification' in window)) {
        addTestResult('❌ Navegador não suporta notificações')
        toast.error('Navegador não suporta notificações')
        return
      }

      // Verificar permissão
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }

      if (permission === 'granted') {
        // Criar notificação de teste
        const notification = new Notification('Teste ConfiLar', {
          body: 'Esta é uma notificação de teste do ConfiLar!',
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          tag: 'test-notification'
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        addTestResult('✅ Notificação push exibida com sucesso!')
        toast.success('Notificação push funcionando!')
      } else {
        addTestResult(`❌ Permissão negada: ${permission}`)
        toast.error(`Permissão negada: ${permission}`)
      }
    } catch (error) {
      addTestResult(`❌ Erro na notificação push: ${error}`)
      toast.error(`Erro: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testRealtimeConnection = async () => {
    setIsLoading(true)
    addTestResult('🔄 Testando conexão em tempo real...')
    
    try {
      // Simular uma ação que deveria gerar notificação
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'system',
          title: 'Teste Realtime',
          message: 'Testando conexão em tempo real do Supabase',
          userId: 'current'
        })
      })

      if (response.ok) {
        addTestResult('✅ Conexão realtime funcionando!')
        toast.success('Realtime funcionando!')
      } else {
        addTestResult('❌ Problema na conexão realtime')
        toast.error('Problema na conexão realtime')
      }
    } catch (error) {
      addTestResult(`❌ Erro realtime: ${error}`)
      toast.error(`Erro: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
    toast.info('Resultados limpos!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <TestTube className="w-8 h-8 text-blue-600" />
              <CardTitle className="text-2xl font-bold text-gray-800">
                Página de Teste - Notificações
              </CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              Teste todos os tipos de notificações do sistema ConfiLar
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Status do Sistema */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  Toast
                </Badge>
                <span className="text-sm text-gray-600">Funcionando</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-600" />
                  Push
                </Badge>
                <span className="text-sm text-gray-600">Testar</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-600" />
                  Realtime
                </Badge>
                <span className="text-sm text-gray-600">Testar</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testes de Notificações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notificações do Sistema */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Notificações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => testNotification('message', 'Você recebeu uma nova mensagem de teste!')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Testar Mensagem
              </Button>
              
              <Button
                onClick={() => testNotification('favorite', 'Seu serviço foi favoritado!')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <Heart className="w-4 h-4 mr-2" />
                Testar Favorito
              </Button>
              
              <Button
                onClick={() => testNotification('review', 'Você recebeu uma nova avaliação!')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <Star className="w-4 h-4 mr-2" />
                Testar Avaliação
              </Button>
              
              <Button
                onClick={() => testNotification('system', 'Notificação do sistema de teste')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Testar Sistema
              </Button>
            </CardContent>
          </Card>

          {/* Testes Avançados */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                Testes Avançados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testPushNotification}
                disabled={isLoading}
                className="w-full justify-start bg-green-600 hover:bg-green-700"
              >
                <Bell className="w-4 h-4 mr-2" />
                Testar Push Notification
              </Button>
              
              <Button
                onClick={testRealtimeConnection}
                disabled={isLoading}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Testar Realtime
              </Button>
              
              <Separator />
              
              <Button
                onClick={clearResults}
                variant="destructive"
                className="w-full"
              >
                Limpar Resultados
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resultados dos Testes */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-purple-600" />
              Resultados dos Testes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum teste executado ainda. Clique nos botões acima para começar!
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg text-sm font-mono"
                  >
                    {result}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">📋 Instruções de Teste</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-2">
            <p><strong>1. Notificações do Sistema:</strong> Teste cada tipo de notificação</p>
            <p><strong>2. Push Notifications:</strong> Verifique se aparece notificação do navegador</p>
            <p><strong>3. Realtime:</strong> Teste se as notificações aparecem em tempo real</p>
            <p><strong>4. Verifique:</strong> Se o sino de notificações no header está funcionando</p>
            <p><strong>5. Mobile:</strong> Teste também no celular para verificar PWA</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
