'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  BellOff, 
  Settings, 
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
  Clock,
  Zap,
  Users,
  Mail,
  Phone,
  MapPin,
  X,
  Check,
  CheckCheck,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useAuth } from '@/hooks/useUnifiedAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useNotifications } from './NotificationProviderSimple'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

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

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
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
  
  const { openChat } = useFloatingChat()

  // Estados do formulário
  const [formData, setFormData] = useState({
    type: 'message',
    title: '',
    message: '',
    priority: 'normal',
    actionUrl: ''
  })

  // Estados dos filtros
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.is_read) ||
      (filter === 'read' && notification.is_read)
    
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || notification.type === selectedType
    
    return matchesFilter && matchesSearch && matchesType
  })

  // Obter tipos únicos para filtro
  const uniqueTypes = Array.from(new Set(notifications.map(n => n.type)))

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

  // Limpar filtros
  const clearFilters = () => {
    setFilter('all')
    setSearchTerm('')
    setSelectedType('all')
    setShowFilters(false)
  }

  if (!user) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 h-full">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5" />
                Configurações de Notificações
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription className="mt-1">
                Gerencie suas notificações e configurações do sistema
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="notifications" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mx-6 mt-4">
              <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notificações</TabsTrigger>
              <TabsTrigger value="create" className="text-xs sm:text-sm">Criar</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">Configurações</TabsTrigger>
              <TabsTrigger value="status" className="text-xs sm:text-sm">Status</TabsTrigger>
            </TabsList>

            {/* Aba de Notificações */}
            <TabsContent value="notifications" className="flex-1 overflow-hidden flex flex-col m-6 mt-4">
              {/* Barra de Busca e Filtros */}
              <div className="mb-4">
                <div className="space-y-3">
                  {/* Busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar notificações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 h-9 text-sm"
                    />
                  </div>

                  {/* Filtros */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="h-8 text-xs w-full sm:w-auto"
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      Filtros
                      {showFilters ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </Button>

                    {/* Filtros rápidos */}
                    <div className="flex gap-1 w-full sm:w-auto">
                      <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className="h-8 text-xs px-2 flex-1 sm:flex-none"
                      >
                        Todas
                      </Button>
                      <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('unread')}
                        className="h-8 text-xs px-2 flex-1 sm:flex-none"
                      >
                        Não lidas
                      </Button>
                    </div>

                    {/* Ações rápidas */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={markAllAsRead} disabled={unreadCount === 0}>
                          <CheckCheck className="w-4 h-4 mr-2" />
                          Marcar todas como lidas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={clearAll} disabled={notifications.length === 0}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Limpar todas
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Filtros expandidos */}
                  {showFilters && (
                    <div className="space-y-2 pt-2 border-t">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo</label>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            variant={selectedType === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedType('all')}
                            className="h-7 text-xs px-2"
                          >
                            Todos
                          </Button>
                          {uniqueTypes.map(type => (
                            <Button
                              key={type}
                              variant={selectedType === type ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedType(type)}
                              className="h-7 text-xs px-2"
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-7 text-xs"
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Notificações */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <BellOff className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || selectedType !== 'all' ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {searchTerm || selectedType !== 'all' 
                        ? 'Tente ajustar os filtros de busca' 
                        : 'Você será notificado quando houver novidades'
                      }
                    </p>
                    {(searchTerm || selectedType !== 'all') && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => {
                      const typeConfig = NOTIFICATION_TYPES.find(t => t.value === notification.type)
                      const priorityConfig = PRIORITY_LEVELS.find(p => p.value === notification.priority)
                      
                      return (
                        <Card 
                          key={notification.id} 
                          className={`transition-all duration-200 hover:shadow-md ${
                            !notification.is_read ? 'bg-blue-50/50 border-blue-200' : 'bg-white'
                          }`}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              {/* Ícone */}
                              <div className={`p-2 rounded-full ${typeConfig?.color || 'bg-gray-500'} text-white flex-shrink-0`}>
                                {typeConfig?.icon && <typeConfig.icon className="w-4 h-4" />}
                              </div>

                              {/* Conteúdo */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                                      {notification.title}
                                    </h4>
                                    
                                    {notification.message && (
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                      </p>
                                    )}

                                    {/* Metadados */}
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge className={`text-xs ${priorityConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                                        {priorityConfig?.label || notification.priority}
                                      </Badge>
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(notification.created_at), { 
                                          addSuffix: true, 
                                          locale: ptBR 
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Ações */}
                                  <div className="flex items-center gap-1">
                                    {!notification.is_read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => markAsRead(notification.id)}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Check className="w-3 h-3" />
                                      </Button>
                                    )}
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeNotification(notification.id)}
                                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Ação da notificação */}
                                {(notification.action_url || notification.type === 'message') && (
                                  <div className="mt-3 pt-3 border-t">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // Se for notificação de mensagem, abrir chat
                                        if (notification.type === 'message' && (notification as any).metadata?.conversation_id) {
                                          // Para conversation_id, não passar userName para que seja tratado como conversationId
                                          openChat((notification as any).metadata.conversation_id)
                                          markAsRead(notification.id)
                                        } else if (notification.type === 'message' && (notification as any).metadata?.sender_id) {
                                          const senderId = (notification as any).metadata.sender_id as string
                                          const senderName = ((notification as any).metadata.sender_name as string) || 'Usuário'
                                          openChat(senderId, senderName)
                                          markAsRead(notification.id)
                                        } else {
                                          // Para outros tipos de notificação, usar action_url
                                          window.open(notification.action_url, '_blank')
                                          markAsRead(notification.id)
                                        }
                                      }}
                                      className="w-full text-xs"
                                    >
                                      {notification.type === 'message' ? 'Abrir conversa' : 'Ver detalhes'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer com estatísticas */}
              {notifications.length > 0 && (
                <div className="p-4 border-t bg-gray-50/50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {unreadCount} não lidas de {notifications.length} total
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="h-7 text-xs"
                      >
                        Marcar todas
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="h-7 text-xs text-red-600 hover:text-red-700"
                      >
                        Limpar todas
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Aba de Criar Notificação */}
            <TabsContent value="create" className="flex-1 overflow-y-auto m-4 sm:m-6 mt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    Criar Notificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
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
              <Card className="mt-4 sm:mt-6">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    Notificações de Exemplo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {NOTIFICATION_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        size="sm"
                        onClick={() => addExampleNotification(type.value)}
                        className="h-auto p-2 flex flex-col items-center gap-1 text-xs"
                      >
                        <type.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs leading-tight">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba de Configurações */}
            <TabsContent value="settings" className="flex-1 overflow-y-auto m-4 sm:m-6 mt-4">
              <div className="space-y-4 sm:space-y-6">
                {/* Configurações de Push Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-green-600" />
                      Push Notifications
                    </CardTitle>
                    <CardDescription>
                      Configure as notificações push do navegador
                    </CardDescription>
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

                {/* Configurações por Tipo de Notificação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-purple-600" />
                      Tipos de Notificação
                    </CardTitle>
                    <CardDescription>
                      Configure quais tipos de notificação você deseja receber
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {NOTIFICATION_TYPES.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <div key={type.value} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${type.color} text-white`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <Label htmlFor={`type-${type.value}`} className="font-medium">
                                {type.label}
                              </Label>
                              <p className="text-sm text-gray-500">
                                Receber notificações de {type.label.toLowerCase()}
                              </p>
                            </div>
                          </div>
                          <Switch 
                            id={`type-${type.value}`} 
                            defaultChecked={['message', 'review', 'system'].includes(type.value)}
                          />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Configurações de Frequência */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Frequência e Horários
                    </CardTitle>
                    <CardDescription>
                      Configure quando e com que frequência receber notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="frequency">Frequência de notificações</Label>
                        <Select defaultValue="immediate">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Imediata</SelectItem>
                            <SelectItem value="hourly">A cada hora</SelectItem>
                            <SelectItem value="daily">Diária</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-time">Horário inicial</Label>
                          <Input 
                            id="start-time" 
                            type="time" 
                            defaultValue="08:00"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">Horário final</Label>
                          <Input 
                            id="end-time" 
                            type="time" 
                            defaultValue="22:00"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="quiet-hours">Horário silencioso</Label>
                          <p className="text-sm text-gray-500">Não receber notificações durante a noite</p>
                        </div>
                        <Switch id="quiet-hours" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Prioridade */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Prioridades
                    </CardTitle>
                    <CardDescription>
                      Configure quais prioridades de notificação receber
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {PRIORITY_LEVELS.map((priority) => (
                      <div key={priority.value} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={`${priority.color} text-xs`}>
                            {priority.label}
                          </Badge>
                          <div>
                            <Label htmlFor={`priority-${priority.value}`} className="font-medium">
                              Notificações {priority.label}
                            </Label>
                            <p className="text-sm text-gray-500">
                              Receber notificações de prioridade {priority.label.toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <Switch 
                          id={`priority-${priority.value}`} 
                          defaultChecked={['normal', 'high', 'urgent'].includes(priority.value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Configurações de Som e Vibração */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      Som e Vibração
                    </CardTitle>
                    <CardDescription>
                      Configure como as notificações são apresentadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sound">Som de notificação</Label>
                        <p className="text-sm text-gray-500">Reproduzir som ao receber notificações</p>
                      </div>
                      <Switch id="sound" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="vibration">Vibração</Label>
                        <p className="text-sm text-gray-500">Vibrar ao receber notificações</p>
                      </div>
                      <Switch id="vibration" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="desktop">Notificações desktop</Label>
                        <p className="text-sm text-gray-500">Mostrar notificações na área de trabalho</p>
                      </div>
                      <Switch id="desktop" defaultChecked />
                    </div>
                    
                    <div>
                      <Label htmlFor="sound-type">Tipo de som</Label>
                      <Select defaultValue="default">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o som" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Padrão</SelectItem>
                          <SelectItem value="gentle">Suave</SelectItem>
                          <SelectItem value="loud">Alto</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Email */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      Notificações por Email
                    </CardTitle>
                    <CardDescription>
                      Configure notificações por email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Notificações por email</Label>
                        <p className="text-sm text-gray-500">Receber notificações por email</p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-digest">Resumo diário</Label>
                        <p className="text-sm text-gray-500">Receber um resumo diário por email</p>
                      </div>
                      <Switch id="email-digest" defaultChecked />
                    </div>
                    
                    <div>
                      <Label htmlFor="email-frequency">Frequência do email</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Imediato</SelectItem>
                          <SelectItem value="hourly">A cada hora</SelectItem>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de SMS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      Notificações por SMS
                    </CardTitle>
                    <CardDescription>
                      Configure notificações por SMS (apenas para notificações urgentes)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications">SMS para urgências</Label>
                        <p className="text-sm text-gray-500">Receber SMS apenas para notificações urgentes</p>
                      </div>
                      <Switch id="sms-notifications" />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone-number">Número de telefone</Label>
                      <Input 
                        id="phone-number" 
                        type="tel" 
                        placeholder="(11) 99999-9999"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Localização */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-600" />
                      Notificações por Localização
                    </CardTitle>
                    <CardDescription>
                      Configure notificações baseadas na sua localização
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="location-notifications">Notificações por localização</Label>
                        <p className="text-sm text-gray-500">Receber notificações baseadas na localização</p>
                      </div>
                      <Switch id="location-notifications" />
                    </div>
                    
                    <div>
                      <Label htmlFor="location-radius">Raio de notificação (km)</Label>
                      <Select defaultValue="10">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o raio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 km</SelectItem>
                          <SelectItem value="5">5 km</SelectItem>
                          <SelectItem value="10">10 km</SelectItem>
                          <SelectItem value="25">25 km</SelectItem>
                          <SelectItem value="50">50 km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Privacidade */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      Privacidade
                    </CardTitle>
                    <CardDescription>
                      Configure as configurações de privacidade das notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-content">Mostrar conteúdo</Label>
                        <p className="text-sm text-gray-500">Mostrar conteúdo das notificações na tela de bloqueio</p>
                      </div>
                      <Switch id="show-content" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-sender">Mostrar remetente</Label>
                        <p className="text-sm text-gray-500">Mostrar nome do remetente nas notificações</p>
                      </div>
                      <Switch id="show-sender" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="group-notifications">Agrupar notificações</Label>
                        <p className="text-sm text-gray-500">Agrupar notificações do mesmo tipo</p>
                      </div>
                      <Switch id="group-notifications" defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações Avançadas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      Configurações Avançadas
                    </CardTitle>
                    <CardDescription>
                      Configurações avançadas do sistema de notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="max-notifications">Máximo de notificações</Label>
                      <Select defaultValue="50">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o máximo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 notificações</SelectItem>
                          <SelectItem value="25">25 notificações</SelectItem>
                          <SelectItem value="50">50 notificações</SelectItem>
                          <SelectItem value="100">100 notificações</SelectItem>
                          <SelectItem value="unlimited">Ilimitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="auto-delete">Auto-exclusão</Label>
                      <Select defaultValue="7">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 dia</SelectItem>
                          <SelectItem value="3">3 dias</SelectItem>
                          <SelectItem value="7">7 dias</SelectItem>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="never">Nunca</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="mark-read-auto">Marcar como lida automaticamente</Label>
                        <p className="text-sm text-gray-500">Marcar notificações como lidas após visualizar</p>
                      </div>
                      <Switch id="mark-read-auto" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sync-devices">Sincronizar entre dispositivos</Label>
                        <p className="text-sm text-gray-500">Sincronizar notificações entre todos os dispositivos</p>
                      </div>
                      <Switch id="sync-devices" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba de Status */}
            <TabsContent value="status" className="flex-1 overflow-y-auto m-4 sm:m-6 mt-4">
              <div className="space-y-4 sm:space-y-6">
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

                {/* Estatísticas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Estatísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                        <div className="text-sm text-blue-800">Total</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
                        <div className="text-sm text-red-800">Não lidas</div>
                      </div>
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
