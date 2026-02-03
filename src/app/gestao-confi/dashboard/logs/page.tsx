'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Bug,
  Database,
  Server,
  Shield,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthContext } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'

interface SupabaseLog {
  id: string
  timestamp: string
  level: string
  message: string
  metadata?: Record<string, any>
  service: string
}

export default function AdminLogsPage() {
  const { user } = useAuthContext()
  const [logs, setLogs] = useState<SupabaseLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<SupabaseLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<string>('api')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('24h')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [projectId, setProjectId] = useState<string>('')

  useEffect(() => {
    // Extrair project ID da URL do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
    if (match) {
      setProjectId(match[1])
    }
  }, [])

  const fetchSupabaseLogs = useCallback(async () => {
    if (!projectId) {
      toast.error('Project ID não encontrado')
      return
    }

    setIsLoading(true)
    try {
      // Buscar logs via API do Supabase
      const response = await fetch(`/api/gestao-confi/logs/supabase?service=${selectedService}&projectId=${projectId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar logs')
      }

      const data = await response.json()

      // Se a API retornar logs, usar eles
      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs)
        if (data.logs.length === 0 && data.message) {
          toast.info(data.message)
        }
      } else {
        setLogs([])
      }
    } catch (error: any) {
      console.error('Erro ao buscar logs do Supabase:', error)
      toast.error(error.message || 'Erro ao carregar logs')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, selectedService])

  useEffect(() => {
    if (projectId) {
      fetchSupabaseLogs()
    }
  }, [projectId, selectedService, fetchSupabaseLogs])

  // Realtime Subscription
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel('system_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_logs'
        },
        async (payload) => {
          const newLog = payload.new as any

          // Verificar se o log pertence ao serviço selecionado ou se estamos vendo 'todos'
          const serviceMap: Record<string, string> = {
            'api': 'api',
            'auth': 'auth',
            'storage': 'storage',
            'realtime': 'realtime',
            'postgres': 'postgres',
            'edge-function': 'edge-function',
            'posts': 'posts',
            'classifieds': 'classifieds',
            'users': 'users',
            'points': 'points',
            'referrals': 'referrals',
            'system': 'system',
            'admin': 'admin'
          }

          const logService = serviceMap[newLog.category] || 'api'

          if (selectedService !== 'all' && logService !== selectedService) {
            return
          }

          // Buscar info de perfil se houver user_id
          let user_name = null
          let user_avatar = null

          if (newLog.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', newLog.user_id)
              .single()

            if (profile) {
              user_name = profile.full_name
              user_avatar = profile.avatar_url
            }
          }

          const formattedLog: SupabaseLog = {
            id: newLog.id,
            timestamp: newLog.created_at,
            level: newLog.level || 'INFO',
            message: newLog.message || newLog.action || '',
            service: logService,
            metadata: {
              ...newLog.details,
              category: newLog.category,
              action: newLog.action,
              endpoint: newLog.endpoint,
              status_code: newLog.status_code,
              user_id: newLog.user_id,
              user_name,
              user_avatar
            }
          }

          setLogs(currentLogs => [formattedLog, ...currentLogs].slice(0, 500))
          toast.info('Nova atividade registrada', {
            description: formattedLog.message,
            duration: 3000
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, selectedService])

  // Filtrar logs por busca e nível
  useEffect(() => {
    let filtered = logs

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log =>
        log.message?.toLowerCase().includes(query) ||
        log.level?.toLowerCase().includes(query) ||
        JSON.stringify(log.metadata || {}).toLowerCase().includes(query)
      )
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log =>
        log.level?.toLowerCase() === selectedLevel.toLowerCase()
      )
    }

    setFilteredLogs(filtered)
  }, [logs, searchQuery, selectedLevel])

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const getLevelIcon = (level: string) => {
    const levelLower = level?.toLowerCase() || ''
    if (levelLower.includes('error') || levelLower.includes('fatal')) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (levelLower.includes('warn')) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
    if (levelLower.includes('info')) {
      return <Info className="h-4 w-4 text-blue-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getLevelBadge = (level: string) => {
    const levelLower = level?.toLowerCase() || ''
    if (levelLower.includes('error') || levelLower.includes('fatal')) {
      return <Badge variant="destructive">ERROR</Badge>
    }
    if (levelLower.includes('warn')) {
      return <Badge variant="secondary" className="bg-orange-500">WARNING</Badge>
    }
    if (levelLower.includes('info')) {
      return <Badge variant="default" className="bg-blue-500">INFO</Badge>
    }
    return <Badge variant="default" className="bg-green-500">SUCCESS</Badge>
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'api':
        return <Globe className="h-4 w-4" />
      case 'auth':
        return <Shield className="h-4 w-4" />
      case 'storage':
        return <Database className="h-4 w-4" />
      case 'postgres':
      case 'database':
        return <Database className="h-4 w-4" />
      case 'realtime':
        return <Server className="h-4 w-4" />
      case 'edge-function':
        return <Bug className="h-4 w-4" />
      case 'all':
        return <Search className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getServiceBadge = (service: string) => {
    const s = service?.toLowerCase() || ''
    let colorClass = 'bg-gray-100 text-gray-800'

    if (s === 'api') colorClass = 'bg-blue-100 text-blue-800 border-blue-200'
    if (s === 'auth') colorClass = 'bg-purple-100 text-purple-800 border-purple-200'
    if (s === 'database' || s === 'postgres') colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (s === 'storage') colorClass = 'bg-amber-100 text-amber-800 border-amber-200'
    if (s === 'realtime') colorClass = 'bg-rose-100 text-rose-800 border-rose-200'
    if (s === 'edge-function') colorClass = 'bg-indigo-100 text-indigo-800 border-indigo-200'
    if (s === 'admin') colorClass = 'bg-orange-100 text-orange-800 border-orange-200'
    if (s === 'system') colorClass = 'bg-slate-100 text-slate-800 border-slate-200'
    if (s === 'posts') colorClass = 'bg-pink-100 text-pink-800 border-pink-200'
    if (s === 'classifieds') colorClass = 'bg-lime-100 text-lime-800 border-lime-200'
    if (s === 'points') colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (s === 'referrals') colorClass = 'bg-cyan-100 text-cyan-800 border-cyan-200'
    if (s === 'users') colorClass = 'bg-teal-100 text-teal-800 border-teal-200'

    return (
      <Badge variant="outline" className={`capitalize ${colorClass}`}>
        {service}
      </Badge>
    )
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `supabase-logs-${selectedService}-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Logs exportados com sucesso')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Logs do Supabase
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          Visualize logs diretamente do banco de dados Supabase
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Input
                placeholder="Buscar nos logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="auth">Autenticação</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="realtime">Realtime</SelectItem>
                <SelectItem value="edge-function">Edge Functions</SelectItem>
                <SelectItem value="admin">Administração</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
                <SelectItem value="classifieds">Classificados</SelectItem>
                <SelectItem value="points">Pontos</SelectItem>
                <SelectItem value="referrals">Indicações</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchSupabaseLogs}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                onClick={exportLogs}
                disabled={filteredLogs.length === 0}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardDescription className="text-xs md:text-sm">Total de Logs</CardDescription>
            <CardTitle className="text-xl md:text-2xl">{filteredLogs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardDescription className="text-xs md:text-sm">Erros</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-red-500">
              {filteredLogs.filter(l => l.level?.toLowerCase().includes('error')).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardDescription className="text-xs md:text-sm">Avisos</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-orange-500">
              {filteredLogs.filter(l => l.level?.toLowerCase().includes('warn')).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardDescription className="text-xs md:text-sm">Serviço</CardDescription>
            <CardTitle className="text-base md:text-lg flex items-center gap-2 truncate">
              {getServiceIcon(selectedService)}
              <span className="truncate">{selectedService === 'all' ? 'TODOS' : selectedService.toUpperCase()}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs do Supabase</CardTitle>
          <CardDescription>
            Logs do serviço {selectedService} (últimas 24 horas)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 px-4">
              <Info className="h-8 w-8 mx-auto mb-4 text-blue-500" />
              <p className="font-medium">Nenhum log encontrado nas últimas 24 horas</p>
              <div className="text-sm mt-3 space-y-2 max-w-md mx-auto">
                <p>
                  Os logs de infraestrutura (API interna, Auth, Banco) do Supabase não são espelhados automaticamente nesta tabela.
                </p>
                <p>
                  Esta página exibe eventos registrados manualmente pela aplicação (Logins, Erros, Ações de Admin, etc).
                </p>
                {projectId && (
                  <p className="text-xs pt-2 border-t font-mono">
                    Project ID: {projectId}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLogs.map((log) => (
                <Card
                  key={log.id}
                  className="flex flex-col h-full hover:shadow-md transition-shadow duration-200 border-gray-200 dark:border-gray-800"
                >
                  <CardHeader className="p-4 pb-2 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getLevelIcon(log.level)}
                        {getLevelBadge(log.level)}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                          locale: ptBR
                        }) : 'Agora'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getServiceBadge(log.service)}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 flex-grow space-y-4">
                    {/* Mensagem Principal */}
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 min-h-[2.5rem]">
                      {log.message}
                    </p>

                    {/* Informações do Usuário */}
                    {(log.metadata?.user_id || log.metadata?.user_name) && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                        {log.metadata?.user_avatar ? (
                          <img
                            src={log.metadata.user_avatar}
                            alt={log.metadata.user_name || 'User'}
                            className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <span className="text-xs font-bold">
                              {(log.metadata?.user_name || 'U').substring(0, 1).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {log.metadata?.user_name || 'Usuário Desconhecido'}
                          </span>
                          <span className="text-[10px] text-gray-500 truncate font-mono">
                            {log.metadata?.user_id?.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Botão de Detalhes */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLogExpansion(log.id)}
                          className="w-full h-8 justify-between hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <span className="text-xs font-medium">
                            {expandedLogs.has(log.id) ? 'Ocultar Detalhes' : `Ver Detalhes (${Object.keys(log.metadata).length})`}
                          </span>
                          {expandedLogs.has(log.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>

                        {expandedLogs.has(log.id) && (
                          <div className="mt-3 p-3 bg-gray-900 text-gray-300 rounded-md text-[10px] font-mono overflow-auto max-h-40 custom-scrollbar">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
