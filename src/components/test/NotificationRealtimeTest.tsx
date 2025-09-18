'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function NotificationRealtimeTest() {
  const { user } = useAuthContext()
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    isLoading,
    lastUpdate,
    addTestNotification 
  } = useRealtimeNotifications()
  
  const [sendingTest, setSendingTest] = useState(false)
  const [testResults, setTestResults] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'info'
    message: string
    timestamp: Date
  }>>([])

  const addTestResult = (type: 'success' | 'error' | 'info', message: string) => {
    setTestResults(prev => [{
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    }, ...prev.slice(0, 9)]) // Manter apenas os últimos 10
  }

  const sendTestNotification = async () => {
    if (!user) {
      toast.error('Usuário não logado')
      return
    }

    setSendingTest(true)
    try {
      const testMessage = `Teste de notificação em tempo real - ${new Date().toLocaleTimeString()}`
      
      // Criar notificação diretamente no banco
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: '🧪 Teste de Tempo Real',
          message: testMessage,
          type: 'info',
          is_read: false,
          priority: 'normal'
        })

      if (error) {
        console.error('❌ Erro ao criar notificação de teste:', error)
        addTestResult('error', `Erro: ${error.message}`)
        toast.error('Erro ao criar notificação de teste')
      } else {
        console.log('✅ Notificação de teste criada no banco')
        addTestResult('success', 'Notificação enviada para o banco')
        toast.success('Notificação de teste enviada!')
      }
    } catch (error) {
      console.error('❌ Erro geral:', error)
      addTestResult('error', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      toast.error('Erro ao enviar notificação de teste')
    } finally {
      setSendingTest(false)
    }
  }

  const sendTestToOtherUser = async () => {
    if (!user) {
      toast.error('Usuário não logado')
      return
    }

    setSendingTest(true)
    try {
      // Buscar outro usuário para enviar notificação
      const { data: otherUsers, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .neq('id', user.id)
        .limit(1)

      if (fetchError || !otherUsers || otherUsers.length === 0) {
        addTestResult('error', 'Nenhum outro usuário encontrado')
        toast.error('Nenhum outro usuário encontrado para teste')
        return
      }

      const otherUser = otherUsers[0]
      const testMessage = `Notificação de teste enviada por Usuário - ${new Date().toLocaleTimeString()}`
      
      // Criar notificação para outro usuário
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: otherUser.id,
          title: '🔔 Notificação de Teste',
          message: testMessage,
          type: 'info',
          is_read: false,
          priority: 'normal'
        })

      if (error) {
        console.error('❌ Erro ao criar notificação para outro usuário:', error)
        addTestResult('error', `Erro: ${error.message}`)
        toast.error('Erro ao enviar notificação para outro usuário')
      } else {
        console.log('✅ Notificação de teste enviada para:', otherUser.full_name)
        addTestResult('success', `Notificação enviada para ${otherUser.full_name}`)
        toast.success(`Notificação enviada para ${otherUser.full_name}!`)
      }
    } catch (error) {
      console.error('❌ Erro geral:', error)
      addTestResult('error', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      toast.error('Erro ao enviar notificação para outro usuário')
    } finally {
      setSendingTest(false)
    }
  }

  const getStatusIcon = () => {
    if (isLoading) return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
    if (isConnected) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <AlertCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusText = () => {
    if (isLoading) return 'Carregando...'
    if (isConnected) return 'Conectado'
    return 'Desconectado'
  }

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-100 text-yellow-800'
    if (isConnected) return 'bg-green-100 text-green-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Teste de Notificações em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Conexão */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium">Status da Conexão</p>
                <p className="text-sm text-gray-600">{getStatusText()}</p>
              </div>
            </div>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              <p className="text-sm text-blue-800">Não Lidas</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">{notifications.length}</p>
              <p className="text-sm text-purple-800">Total</p>
            </div>
          </div>

          {/* Última Atualização */}
          {lastUpdate && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Última atualização:</strong> {lastUpdate.toLocaleString('pt-BR')}
              </p>
            </div>
          )}

          {/* Botões de Teste */}
          <div className="flex gap-3">
            <Button 
              onClick={sendTestNotification}
              disabled={sendingTest || !isConnected}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendingTest ? 'Enviando...' : 'Teste para Mim'}
            </Button>
            
            <Button 
              onClick={sendTestToOtherUser}
              disabled={sendingTest || !isConnected}
              variant="outline"
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendingTest ? 'Enviando...' : 'Teste para Outro'}
            </Button>
          </div>

          {/* Resultados dos Testes */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Resultados dos Testes:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testResults.map((result) => (
                  <div 
                    key={result.id}
                    className={`p-2 rounded-lg text-sm ${
                      result.type === 'success' ? 'bg-green-50 text-green-800' :
                      result.type === 'error' ? 'bg-red-50 text-red-800' :
                      'bg-blue-50 text-blue-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{result.message}</span>
                      <span className="text-xs opacity-70">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notificações Recentes */}
          <div className="space-y-2">
            <h4 className="font-medium">Notificações Recentes:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.is_read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nenhuma notificação</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
