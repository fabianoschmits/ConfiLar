'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  AlertTriangle, 
  Database, 
  Users, 
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface RequestStats {
  total_requests: number
  requests_last_hour: number
  requests_last_10min: number
  first_request: string
  last_request: string
  user_id: string
}

interface LoopPattern {
  user_id: string
  title: string
  message: string
  duplicate_count: number
  first_occurrence: string
  last_occurrence: string
  avg_seconds_between: number
}

export function RequestMonitor() {
  const [stats, setStats] = useState<RequestStats[]>([])
  const [loops, setLoops] = useState<LoopPattern[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchRequestStats = async () => {
    setIsLoading(true)
    try {
      // Buscar estatísticas de requisições
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_request_stats')

      if (statsError) {
        console.error('Erro ao buscar estatísticas:', statsError)
        // Fallback: buscar diretamente da tabela
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('notifications')
          .select('user_id, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (fallbackError) throw fallbackError

        // Processar dados localmente
        const processedStats = fallbackData.reduce((acc, notification) => {
          const userId = notification.user_id
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              total_requests: 0,
              requests_last_hour: 0,
              requests_last_10min: 0,
              first_request: notification.created_at,
              last_request: notification.created_at
            }
          }
          acc[userId].total_requests++
          
          const now = new Date()
          const notificationTime = new Date(notification.created_at)
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
          const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
          
          if (notificationTime > oneHourAgo) {
            acc[userId].requests_last_hour++
          }
          if (notificationTime > tenMinutesAgo) {
            acc[userId].requests_last_10min++
          }
          
          if (notificationTime < new Date(acc[userId].first_request)) {
            acc[userId].first_request = notification.created_at
          }
          if (notificationTime > new Date(acc[userId].last_request)) {
            acc[userId].last_request = notification.created_at
          }
          
          return acc
        }, {} as Record<string, RequestStats>)

        setStats(Object.values(processedStats).sort((a, b) => b.total_requests - a.total_requests))
      } else {
        setStats(statsData || [])
      }

      // Buscar padrões de loop
      const { data: loopsData, error: loopsError } = await supabase
        .from('notifications')
        .select('user_id, title, message, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (loopsError) throw loopsError

      // Processar padrões de loop localmente
      const loopPatterns = loopsData.reduce((acc, notification) => {
        const key = `${notification.user_id}-${notification.title}-${notification.message}`
        if (!acc[key]) {
          acc[key] = {
            user_id: notification.user_id,
            title: notification.title,
            message: notification.message,
            duplicate_count: 0,
            first_occurrence: notification.created_at,
            last_occurrence: notification.created_at
          }
        }
        acc[key].duplicate_count++
        
        const notificationTime = new Date(notification.created_at)
        if (notificationTime < new Date(acc[key].first_occurrence)) {
          acc[key].first_occurrence = notification.created_at
        }
        if (notificationTime > new Date(acc[key].last_occurrence)) {
          acc[key].last_occurrence = notification.created_at
        }
        
        return acc
      }, {} as Record<string, LoopPattern>)

      const loopArray = Object.values(loopPatterns)
        .filter(pattern => pattern.duplicate_count > 10)
        .map(pattern => ({
          ...pattern,
          avg_seconds_between: (new Date(pattern.last_occurrence).getTime() - new Date(pattern.first_occurrence).getTime()) / (pattern.duplicate_count * 1000)
        }))
        .sort((a, b) => b.duplicate_count - a.duplicate_count)

      setLoops(loopArray)

      setLastUpdate(new Date())
      toast.success('Estatísticas atualizadas!')
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      toast.error('Erro ao buscar estatísticas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequestStats()
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchRequestStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (count: number) => {
    if (count > 1000) return 'bg-red-500'
    if (count > 500) return 'bg-orange-500'
    if (count > 100) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getSeverityText = (count: number) => {
    if (count > 1000) return 'CRÍTICO'
    if (count > 500) return 'ALTO'
    if (count > 100) return 'MÉDIO'
    return 'BAIXO'
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Requisições
            {lastUpdate && (
              <Badge variant="outline" className="ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                {lastUpdate.toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={fetchRequestStats} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Usuários Ativos</span>
                </div>
                <div className="text-2xl font-bold mt-1">{stats.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Total Requisições</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {stats.reduce((sum, stat) => sum + stat.total_requests, 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Última Hora</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {stats.reduce((sum, stat) => sum + stat.requests_last_hour, 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Padrões de Loop</span>
                </div>
                <div className="text-2xl font-bold mt-1">{loops.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Usuários com Mais Requisições */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usuários com Mais Requisições (24h)</h3>
            <div className="space-y-2">
              {stats.slice(0, 10).map((stat, index) => (
                <div key={stat.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{stat.user_id.slice(0, 8)}...</div>
                      <div className="text-sm text-gray-600">
                        {stat.requests_last_hour} na última hora • {stat.requests_last_10min} nos últimos 10min
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getSeverityColor(stat.total_requests)} text-white`}>
                      {stat.total_requests}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getSeverityText(stat.total_requests)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Padrões de Loop Detectados */}
          {loops.length > 0 && (
            <div className="space-y-4 mt-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>⚠️ Padrões de Loop Detectados!</strong><br/>
                  Encontrados {loops.length} padrões suspeitos de loop de notificações.
                </AlertDescription>
              </Alert>
              
              <h3 className="text-lg font-semibold">Padrões de Loop Suspeitos</h3>
              <div className="space-y-2">
                {loops.slice(0, 5).map((loop, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-red-500 text-white">
                        {loop.duplicate_count} repetições
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {loop.user_id.slice(0, 8)}...
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{loop.title}</div>
                      <div className="text-gray-600">{loop.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Intervalo médio: {Math.round(loop.avg_seconds_between)}s
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
