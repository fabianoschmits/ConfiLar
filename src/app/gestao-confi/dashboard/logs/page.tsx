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

interface SupabaseLog {
  id: string
  timestamp: string
  level: string
  message: string
  metadata?: Record<string, any>
  service: 'api' | 'auth' | 'storage' | 'realtime' | 'postgres' | 'edge-function'
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
        return <Database className="h-4 w-4" />
      case 'realtime':
        return <Server className="h-4 w-4" />
      case 'edge-function':
        return <Bug className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
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
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="auth">Autenticação</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="realtime">Realtime</SelectItem>
                <SelectItem value="edge-function">Edge Functions</SelectItem>
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
              <span className="truncate">{selectedService.toUpperCase()}</span>
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
              <Info className="h-8 w-8 mx-auto mb-4" />
              <p>Nenhum log encontrado</p>
              <p className="text-sm mt-2 break-words">
                {projectId ? (
                  <>Project ID: {projectId}</>
                ) : (
                  <>Configure o Project ID para visualizar logs</>
                )}
              </p>
            </div>
          ) : (
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {getLevelIcon(log.level)}
                      {getLevelBadge(log.level)}
                      <Badge variant="outline" className="hidden sm:inline-flex">{log.service}</Badge>
                      <span className="text-xs text-gray-500 ml-auto">
                        {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                          locale: ptBR
                        }) : 'Agora'}
                      </span>
                    </div>

                    <p className="text-sm font-mono break-words whitespace-pre-wrap">{log.message}</p>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLogExpansion(log.id)}
                        className="mt-2 h-8 px-2"
                      >
                        {expandedLogs.has(log.id) ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            <span className="text-xs">Ocultar detalhes</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            <span className="text-xs">Mostrar detalhes</span>
                          </>
                        )}
                      </Button>
                    )}

                    {expandedLogs.has(log.id) && log.metadata && (
                      <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs font-mono overflow-x-auto">
                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
