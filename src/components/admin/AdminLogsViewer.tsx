'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Bug
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface SystemLog {
  id: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'DEBUG'
  category: string
  action: string
  message: string
  details: Record<string, any>
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  endpoint: string | null
  status_code: number | null
  created_at: string
  user?: {
    full_name: string
    email: string
  }
}

export function AdminLogsViewer() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('1h')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      // Calcular data inicial baseado no filtro de tempo
      const now = new Date()
      let startDate: Date
      
      switch (timeFilter) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }

      // Construir query
      let query = supabase
        .from('system_logs')
        .select(`
          *,
          user:profiles!system_logs_user_id_fkey(full_name, email)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500)

      // Aplicar filtros
      if (selectedLevel !== 'all') {
        query = query.eq('level', selectedLevel)
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar logs:', error)
        toast.error('Erro ao carregar logs')
        return
      }

      setLogs(data || [])
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      toast.error('Erro ao carregar logs')
    } finally {
      setIsLoading(false)
    }
  }, [timeFilter, selectedLevel, selectedCategory])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Filtrar logs por busca
  useEffect(() => {
    let filtered = logs

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.category.toLowerCase().includes(query) ||
        log.endpoint?.toLowerCase().includes(query) ||
        log.user?.full_name?.toLowerCase().includes(query) ||
        log.user?.email?.toLowerCase().includes(query)
      )
    }

    setFilteredLogs(filtered)
  }, [logs, searchQuery])

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
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'DEBUG':
        return <Bug className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      ERROR: 'destructive',
      WARNING: 'default',
      SUCCESS: 'default',
      INFO: 'secondary',
      DEBUG: 'outline'
    }
    return colors[level] || 'outline'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMessage = (log: SystemLog) => {
    // Se a mensagem já está em português e bem formatada, retornar direto
    return log.message
  }

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Level', 'Category', 'Action', 'Message', 'User', 'Endpoint', 'Status Code'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
        log.level,
        log.category,
        log.action,
        `"${log.message.replace(/"/g, '""')}"`,
        log.user?.email || '',
        log.endpoint || '',
        log.status_code || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `confilar-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Logs exportados com sucesso!')
  }

  // Estatísticas rápidas
  const stats = {
    total: filteredLogs.length,
    errors: filteredLogs.filter(l => l.level === 'ERROR').length,
    warnings: filteredLogs.filter(l => l.level === 'WARNING').length,
    success: filteredLogs.filter(l => l.level === 'SUCCESS').length
  }

  // Categorias únicas para filtro
  const categories = Array.from(new Set(logs.map(l => l.category))).sort()

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Logs do Sistema
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                disabled={filteredLogs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-600">Total de eventos</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              <p className="text-xs text-gray-600">Erros</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{stats.warnings}</p>
              <p className="text-xs text-gray-600">Avisos</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              <p className="text-xs text-gray-600">Sucessos</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="ERROR">❌ Erros</SelectItem>
                <SelectItem value="WARNING">⚠️ Avisos</SelectItem>
                <SelectItem value="INFO">ℹ️ Informações</SelectItem>
                <SelectItem value="SUCCESS">✅ Sucessos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(cat => {
                  const categoryNames: Record<string, string> = {
                    auth: '🔐 Autenticação',
                    posts: '📝 Posts',
                    classifieds: '📢 Anúncios',
                    users: '👤 Usuários',
                    points: '💰 Pontos',
                    referrals: '👥 Indicações',
                    admin: '🛡️ Administração',
                    system: '⚙️ Sistema'
                  }
                  return (
                    <SelectItem key={cat} value={cat}>
                      {categoryNames[cat] || cat}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de logs */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Carregando logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Filter className="h-6 w-6 mx-auto mb-2" />
                <p>Nenhum log encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                    onClick={() => toggleLogExpansion(log.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getLevelBadge(log.level) as any} className="text-xs">
                            {log.level}
                          </Badge>
                          <span className="text-xs text-gray-500">{log.category}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{formatTimestamp(log.created_at)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {formatMessage(log)}
                        </p>
                        {log.user && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Usuário:</span> {log.user.full_name || log.user.email}
                          </div>
                        )}
                        
                        {/* Detalhes expandidos */}
                        {expandedLogs.has(log.id) && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs space-y-2">
                            {log.endpoint && (
                              <div>
                                <strong>Endpoint:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{log.endpoint}</code>
                              </div>
                            )}
                            {log.status_code && (
                              <div>
                                <strong>Status:</strong> <span className={log.status_code >= 400 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>{log.status_code}</span>
                              </div>
                            )}
                            {log.ip_address && (
                              <div>
                                <strong>IP:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{log.ip_address}</code>
                              </div>
                            )}
                            {Object.keys(log.details).length > 0 && (
                              <div>
                                <strong>Informações adicionais:</strong>
                                <pre className="mt-1 p-2 bg-gray-200 dark:bg-gray-800 rounded overflow-x-auto text-[10px]">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {expandedLogs.has(log.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

