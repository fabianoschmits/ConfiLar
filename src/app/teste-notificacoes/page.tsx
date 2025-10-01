'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  BellOff, 
  Send, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle, 
  Star, 
  Calendar, 
  Shield, 
  Trophy, 
  Info,
  Settings,
  TestTube,
  Zap,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  Monitor,
  Smartphone,
  Search,
  X,
  Check,
  CheckCheck
} from 'lucide-react'
import { useAuth } from '@/hooks/useUnifiedAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useNotifications } from '@/components/notifications/NotificationProviderSimple'
import { useNotificationTester } from '@/hooks/useNotificationTester'
// import { useCompleteNotifications } from '@/hooks/useCompleteNotifications' // DESABILITADO - causava loop
import { HeaderNotificationDemo } from '@/components/notifications/HeaderNotificationDemo'
import { SimpleHeaderBell } from '@/components/notifications/SimpleHeaderBell'
import { ModernNotificationCenter } from '@/components/notifications/ModernNotificationCenter'
import { MobileNotificationCenter } from '@/components/notifications/MobileNotificationCenter'
import { toast } from 'sonner'

// Tipos de notificação disponíveis
const NOTIFICATION_TYPES = [
  { value: 'message', label: 'Mensagem de Chat', icon: MessageCircle, color: 'bg-blue-500' },
  { value: 'review', label: 'Avaliação', icon: Star, color: 'bg-yellow-500' },
  { value: 'booking', label: 'Agendamento', icon: Calendar, color: 'bg-green-500' },
  { value: 'system', label: 'Sistema', icon: Settings, color: 'bg-gray-500' },
  { value: 'achievement', label: 'Conquista', icon: Trophy, color: 'bg-purple-500' },
  { value: 'verification', label: 'Verificação', icon: Shield, color: 'bg-indigo-500' },
  { value: 'success', label: 'Sucesso', icon: CheckCircle, color: 'bg-emerald-500' },
  { value: 'warning', label: 'Aviso', icon: AlertCircle, color: 'bg-orange-500' },
  { value: 'error', label: 'Erro', icon: AlertCircle, color: 'bg-red-500' },
  { value: 'header', label: 'Header', icon: Bell, color: 'bg-cyan-500' }
]

// Prioridades disponíveis
const PRIORITY_LEVELS = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
]

export default function TesteNotificacoesPage() {
  const { user } = useAuth()
  const { 
    isSupported, 
    isGranted, 
    isSubscribed, 
    isLoading, 
    error, 
    requestPermission, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications()
  
  const { 
    notifications, 
    unreadCount, 
    addNotification, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications()
  
  // Novos hooks para sistema completo
  const notificationTester = useNotificationTester()
  // const completeNotifications = useCompleteNotifications() // DESABILITADO - causava loop

  // Estados do formulário
  const [formData, setFormData] = useState({
    type: 'message',
    title: '',
    message: '',
    priority: 'normal',
    actionUrl: ''
  })

  // Estados dos modais
  const [showModernModal, setShowModernModal] = useState(false)
  const [showMobileModal, setShowMobileModal] = useState(false)

  // Função para enviar notificação
  const handleSendNotification = () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    const notification = {
      type: formData.type as "error" | "success" | "message" | "review" | "info" | "system" | "warning" | "booking" | "verification" | "achievement",
      title: formData.title,
      message: formData.message || '',
      priority: formData.priority as "low" | "high" | "normal" | "urgent",
      action_url: formData.actionUrl || null,
      user_id: user?.id || 'test'
    }

    addNotification(notification)
    toast.success('Notificação adicionada!')
    
    // Limpar formulário
    setFormData({
      type: 'message',
      title: '',
      message: '',
      priority: 'normal',
      actionUrl: ''
    })
  }

  // Função para adicionar notificação de exemplo
  const addExampleNotification = (type: string) => {
    const examples = {
      message: {
        title: 'Nova mensagem de João',
        message: 'Olá! Como está o projeto?',
        priority: 'normal'
      },
      review: {
        title: 'Nova avaliação recebida',
        message: 'Maria avaliou seu serviço com 5 estrelas',
        priority: 'high'
      },
      booking: {
        title: 'Agendamento confirmado',
        message: 'Seu agendamento para amanhã foi confirmado',
        priority: 'normal'
      },
      system: {
        title: 'Sistema atualizado',
        message: 'Nova versão disponível com melhorias',
        priority: 'low'
      },
      achievement: {
        title: 'Nova conquista desbloqueada',
        message: 'Você completou 10 serviços!',
        priority: 'high'
      },
      verification: {
        title: 'Perfil verificado',
        message: 'Seu perfil foi verificado com sucesso',
        priority: 'normal'
      },
      success: {
        title: 'Ação realizada com sucesso',
        message: 'Sua solicitação foi processada',
        priority: 'normal'
      },
      warning: {
        title: 'Aviso importante',
        message: 'Sua assinatura expira em 7 dias',
        priority: 'high'
      },
      error: {
        title: 'Erro no sistema',
        message: 'Falha ao processar sua solicitação',
        priority: 'urgent'
      },
      header: {
        title: 'Notificação do Header',
        message: 'Esta é uma notificação de teste criada pelo componente do header',
        priority: 'normal'
      }
    }

    const example = examples[type as keyof typeof examples]
    if (example) {
      addNotification({
        type: type as "error" | "success" | "message" | "review" | "info" | "system" | "warning" | "booking" | "verification" | "achievement",
        title: example.title,
        message: example.message,
        priority: example.priority as "low" | "high" | "normal" | "urgent",
        action_url: null,
        user_id: user?.id || 'test'
      })
      toast.success('Notificação de exemplo adicionada!')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-gray-600">
              Você precisa estar logado para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Teste de Notificações
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Página completa para testar todas as funcionalidades do sistema de notificações do ConfiLar
          </p>
        </div>

        {/* Demonstração do Header Notification Bell */}
        <div className="mb-8">
          <HeaderNotificationDemo />
        </div>

        {/* Versão Corrigida - Sino Sempre Visível */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                Versão Corrigida - Sino Sempre Visível
              </CardTitle>
              <CardDescription>
                Esta versão garante que o sino sempre apareça, mesmo com notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-blue-600">
                    ConfiLar
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">Home</Button>
                    <Button variant="ghost" size="sm">Feed</Button>
                    <Button variant="ghost" size="sm">Buscar</Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Versão corrigida do sino */}
                    <SimpleHeaderBell />
                    
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      Perfil
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Problema Resolvido!</h4>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✅ Sino sempre visível (não desaparece com notificações)</li>
                  <li>✅ Contador sobreposto ao sino</li>
                  <li>✅ Funcionalidade completa mantida</li>
                  <li>✅ Design limpo e consistente</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modais Modernos e Responsivos */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Modais Modernos e Responsivos
              </CardTitle>
              <CardDescription>
                Novos modais otimizados para desktop e mobile com design moderno
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Botões de Teste */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setShowModernModal(true)}
                  className="w-full"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Testar Modal Desktop
                </Button>
                
                <Button 
                  onClick={() => setShowMobileModal(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Testar Modal Mobile
                </Button>
              </div>

              {/* Características dos Novos Modais */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Características dos Novos Modais</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-purple-800 mb-2">Desktop</h5>
                    <ul className="text-purple-700 space-y-1">
                      <li>✅ Design moderno e clean</li>
                      <li>✅ Filtros avançados</li>
                      <li>✅ Busca em tempo real</li>
                      <li>✅ Ações em lote</li>
                      <li>✅ Layout otimizado</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-purple-800 mb-2">Mobile</h5>
                    <ul className="text-purple-700 space-y-1">
                      <li>✅ Interface touch-friendly</li>
                      <li>✅ Botões maiores</li>
                      <li>✅ Layout vertical otimizado</li>
                      <li>✅ Performance mobile</li>
                      <li>✅ Gestos intuitivos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Configurações e Status */}
          <div className="space-y-6">
            {/* Status do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Push Notifications</span>
                  <Badge variant={isSupported ? 'default' : 'destructive'}>
                    {isSupported ? 'Suportado' : 'Não suportado'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Permissão</span>
                  <Badge variant={isGranted ? 'default' : 'destructive'}>
                    {isGranted ? 'Concedida' : 'Negada'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inscrito</span>
                  <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                    {isSubscribed ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Notificações</span>
                  <Badge variant="default">
                    {notifications.length} total
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Não lidas</span>
                  <Badge variant="destructive">
                    {unreadCount}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Controles de Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isGranted && (
                  <Button 
                    onClick={requestPermission}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Solicitar Permissão
                  </Button>
                )}
                
                {isGranted && !isSubscribed && (
                  <Button 
                    onClick={subscribe}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Ativar Notificações
                  </Button>
                )}
                
                {isSubscribed && (
                  <Button 
                    onClick={unsubscribe}
                    disabled={isLoading}
                    variant="destructive"
                    className="w-full"
                  >
                    <BellOff className="w-4 h-4 mr-2" />
                    Desativar Notificações
                  </Button>
                )}
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Criar Notificação */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-600" />
                  Criar Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título da notificação"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Digite a mensagem da notificação"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={priority.color}>
                              {priority.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="actionUrl">URL de Ação</Label>
                  <Input
                    id="actionUrl"
                    value={formData.actionUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                    placeholder="https://exemplo.com"
                  />
                </div>

                <Button onClick={handleSendNotification} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Notificação
                </Button>
              </CardContent>
            </Card>

            {/* Notificações de Exemplo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-orange-600" />
                  Notificações de Exemplo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {NOTIFICATION_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      onClick={() => addExampleNotification(type.value)}
                      className="h-auto p-2 flex flex-col items-center gap-1"
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 3: Gerenciar Notificações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Gerenciar Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <Badge variant="default">{notifications.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Não lidas</span>
                  <Badge variant="destructive">{unreadCount}</Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button 
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    variant="outline"
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar Todas como Lidas
                  </Button>
                  
                  <Button 
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Todas
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notificações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => {
                      const typeConfig = NOTIFICATION_TYPES.find(t => t.value === notification.type)
                      const priorityConfig = PRIORITY_LEVELS.find(p => p.value === notification.priority)
                      
                      return (
                        <div
                          key={notification.id}
                          className={`p-3 border rounded-lg ${
                            !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-1 rounded-full ${typeConfig?.color || 'bg-gray-500'} text-white`}>
                              {typeConfig?.icon && <typeConfig.icon className="w-3 h-3" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              
                              {notification.message && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${priorityConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                                  {priorityConfig?.label || notification.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(notification.created_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeNotification(notification.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Teste do Sistema Completo */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-purple-600" />
                Sistema Completo de Notificações
              </CardTitle>
              <CardDescription>
                Teste todas as funcionalidades do sistema de notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Teste de Mensagens */}
                <Button
                  onClick={notificationTester.testMessageNotification}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <span className="font-medium">Testar Mensagem</span>
                  <span className="text-xs text-gray-500">Nova mensagem de chat</span>
                </Button>

                {/* Teste de Avaliação */}
                <Button
                  onClick={notificationTester.testReviewNotification}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Star className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium">Testar Avaliação</span>
                  <span className="text-xs text-gray-500">Nova avaliação recebida</span>
                </Button>

                {/* Teste de Favorito */}
                <Button
                  onClick={notificationTester.testFavoriteNotification}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Users className="w-6 h-6 text-green-600" />
                  <span className="font-medium">Testar Favorito</span>
                  <span className="text-xs text-gray-500">Adicionado aos favoritos</span>
                </Button>

                {/* Teste de Conquista */}
                <Button
                  onClick={notificationTester.testAchievementNotification}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Trophy className="w-6 h-6 text-orange-600" />
                  <span className="font-medium">Testar Conquista</span>
                  <span className="text-xs text-gray-500">Nova conquista desbloqueada</span>
                </Button>

                {/* Teste de Sistema */}
                <Button
                  onClick={notificationTester.testSystemNotification}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Settings className="w-6 h-6 text-gray-600" />
                  <span className="font-medium">Testar Sistema</span>
                  <span className="text-xs text-gray-500">Notificação do sistema</span>
                </Button>

                {/* Teste de Segurança */}
                <Button
                  onClick={notificationTester.testSecurityNotification}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Shield className="w-6 h-6 text-red-600" />
                  <span className="font-medium">Testar Segurança</span>
                  <span className="text-xs text-gray-500">Alerta de segurança</span>
                </Button>

                {/* Teste de Manutenção */}
                <Button
                  onClick={notificationTester.testMaintenanceNotification}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Clock className="w-6 h-6 text-purple-600" />
                  <span className="font-medium">Testar Manutenção</span>
                  <span className="text-xs text-gray-500">Aviso de manutenção</span>
                </Button>

                {/* Teste de Atualização */}
                <Button
                  onClick={notificationTester.testUpdateNotification}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Zap className="w-6 h-6 text-cyan-600" />
                  <span className="font-medium">Testar Atualização</span>
                  <span className="text-xs text-gray-500">Nova versão disponível</span>
                </Button>

                {/* Teste de Lembrete */}
                <Button
                  onClick={notificationTester.testReminderNotification}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  <span className="font-medium">Testar Lembrete</span>
                  <span className="text-xs text-gray-500">Lembrete personalizado</span>
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Botão para testar todas as notificações */}
              <div className="text-center">
                <Button
                  onClick={notificationTester.testAllNotifications}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <TestTube className="w-5 h-5 mr-2" />
                  Testar Todas as Notificações
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Cria todas as notificações de teste em sequência
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modais */}
      <ModernNotificationCenter 
        isOpen={showModernModal} 
        onClose={() => setShowModernModal(false)} 
      />
      
      <MobileNotificationCenter 
        isOpen={showMobileModal} 
        onClose={() => setShowMobileModal(false)} 
      />
    </div>
  )
}
