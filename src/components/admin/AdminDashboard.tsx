'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  MessageCircle,
  Eye,
  Heart,
  Star,
  Clock,
  RefreshCw,
  Shield,
  BarChart3,
  Settings,
  Trash2,
  UserCheck,
  UserX,
  Zap,
  TestTube,
  Play,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { ReportsManagement } from './ReportsManagement'
import { BansManagementEnhanced as BansManagement } from './BansManagementEnhanced'
import { TestsManagement } from './TestsManagement'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Interfaces para tipagem
interface UserStats {
  total_users: number
  active_users_24h: number
  new_users_today: number
  professional_users: number
  client_users: number
  verified_users: number
  users_by_state: Array<{ state: string; count: number }>
  users_by_month: Array<{ month: string; count: number }>
}

interface SystemStats {
  total_posts: number
  total_messages: number
  total_notifications: number
  total_reviews: number
  posts_last_24h: number
  messages_last_24h: number
  notifications_last_24h: number
  reviews_last_24h: number
}

interface ActiveUser {
  id: string
  full_name: string
  email: string
  user_type: 'client' | 'professional'
  is_verified: boolean
  last_activity: string
  posts_count: number
  messages_count: number
  login_count: number
  state: string
  city: string
}

interface SystemHealth {
  database_status: 'healthy' | 'warning' | 'error'
  api_response_time: number
  error_rate: number
  uptime: number
  memory_usage: number
  cpu_usage: number
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  // Estados para dados
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [topUsers, setTopUsers] = useState<ActiveUser[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchUserStats(),
        fetchSystemStats(),
        fetchActiveUsers(),
        fetchSystemHealth(),
        fetchTopUsers(),
        fetchRecentActivity()
      ])
      setLastUpdate(new Date())
      toast.success('Dados atualizados com sucesso!')
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      toast.error('Erro ao atualizar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })

      // Usuários ativos nas últimas 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count: activeUsers24h } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .gte('updated_at', yesterday)

      // Novos usuários hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .gte('created_at', today.toISOString())

      // Usuários por tipo
      const { count: professionalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('user_type', 'professional')

      const { count: clientUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('user_type', 'client')

      // Usuários verificados
      const { count: verifiedUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('is_verified', true)

      // Usuários por estado
      const { data: usersByState } = await supabase
        .from('profiles')
        .select('location_state')
        .not('location_state', 'is', null)

      const stateCounts = usersByState?.reduce((acc: any, user: any) => {
        const state = user.location_state
        acc[state] = (acc[state] || 0) + 1
        return acc
      }, {}) || {}

      const usersByStateArray = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Usuários por mês (últimos 12 meses)
      const { data: usersByMonth } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

      const monthCounts = usersByMonth?.reduce((acc: any, user: any) => {
        const date = new Date(user.created_at)
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {}) || {}

      const usersByMonthArray = Object.entries(monthCounts)
        .map(([month, count]) => ({ month, count: count as number }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12)

      setUserStats({
        total_users: totalUsers || 0,
        active_users_24h: activeUsers24h || 0,
        new_users_today: newUsersToday || 0,
        professional_users: professionalUsers || 0,
        client_users: clientUsers || 0,
        verified_users: verifiedUsers || 0,
        users_by_state: usersByStateArray,
        users_by_month: usersByMonthArray
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error)
    }
  }

  const fetchSystemStats = async () => {
    try {
      // Total de posts
      const { count: totalPosts } = await supabase
        .from('feed_posts')
        .select('*', { count: 'exact' })

      // Total de mensagens
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })

      // Total de notificações
      const { count: totalNotifications } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })

      // Total de avaliações
      const { count: totalReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })

      // Atividade das últimas 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { count: postsLast24h } = await supabase
        .from('feed_posts')
        .select('*', { count: 'exact' })
        .gte('created_at', yesterday)

      const { count: messagesLast24h } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .gte('created_at', yesterday)

      const { count: notificationsLast24h } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .gte('created_at', yesterday)

      const { count: reviewsLast24h } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .gte('created_at', yesterday)

      setSystemStats({
        total_posts: totalPosts || 0,
        total_messages: totalMessages || 0,
        total_notifications: totalNotifications || 0,
        total_reviews: totalReviews || 0,
        posts_last_24h: postsLast24h || 0,
        messages_last_24h: messagesLast24h || 0,
        notifications_last_24h: notificationsLast24h || 0,
        reviews_last_24h: reviewsLast24h || 0
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas do sistema:', error)
    }
  }

  const fetchActiveUsers = async () => {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data: users } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          user_type,
          is_verified,
          updated_at,
          location_state,
          location_city
        `)
        .gte('updated_at', yesterday)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (users) {
        // Buscar estatísticas adicionais para cada usuário
        const usersWithStats = await Promise.all(
          users.map(async (user) => {
            const [postsResult, messagesResult] = await Promise.all([
              supabase
                .from('feed_posts')
                .select('id', { count: 'exact' })
                .eq('professional_id', user.id),
              supabase
                .from('messages')
                .select('id', { count: 'exact' })
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            ])

            return {
              ...user,
              posts_count: postsResult.count || 0,
              messages_count: messagesResult.count || 0,
              login_count: 0 // Seria necessário implementar tracking de login
            }
          })
        )

        setActiveUsers(usersWithStats.map(user => ({
          ...user,
          last_activity: user.updated_at,
          state: user.location_state,
          city: user.location_city
        })))
      }
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error)
    }
  }

  const fetchSystemHealth = async () => {
    try {
      // Simular verificação de saúde do sistema
      const startTime = Date.now()
      
      // Teste de conectividade com o banco
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      const responseTime = Date.now() - startTime

      setSystemHealth({
        database_status: error ? 'error' : responseTime > 1000 ? 'warning' : 'healthy',
        api_response_time: responseTime,
        error_rate: error ? 100 : 0,
        uptime: 99.9, // Simulado
        memory_usage: 75, // Simulado
        cpu_usage: 45 // Simulado
      })
    } catch (error) {
      console.error('Erro ao verificar saúde do sistema:', error)
    }
  }

  const fetchTopUsers = async () => {
    try {
      // Buscar usuários mais ativos baseado em posts e mensagens
      const { data: topUsers } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          user_type,
          is_verified,
          location_state,
          location_city,
          updated_at
        `)
        .order('updated_at', { ascending: false })
        .limit(20)

      if (topUsers) {
        const usersWithActivity = await Promise.all(
          topUsers.map(async (user) => {
            const [postsResult, messagesResult] = await Promise.all([
              supabase
                .from('feed_posts')
                .select('id', { count: 'exact' })
                .eq('professional_id', user.id),
              supabase
                .from('messages')
                .select('id', { count: 'exact' })
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            ])

            const activityScore = (postsResult.count || 0) * 2 + (messagesResult.count || 0)
            
            return {
              ...user,
              posts_count: postsResult.count || 0,
              messages_count: messagesResult.count || 0,
              activity_score: activityScore,
              last_activity: user.updated_at
            }
          })
        )

        // Ordenar por score de atividade
        usersWithActivity.sort((a, b) => b.activity_score - a.activity_score)
        setTopUsers(usersWithActivity.slice(0, 10).map(user => ({
          ...user,
          login_count: 0,
          state: user.location_state,
          city: user.location_city
        })))
      }
    } catch (error) {
      console.error('Erro ao buscar top usuários:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Buscar atividade recente (posts, mensagens, etc.)
      const [postsResult, messagesResult, notificationsResult] = await Promise.all([
        supabase
          .from('feed_posts')
          .select(`
            id,
            title,
            created_at,
            professional:profiles!feed_posts_professional_id_fkey(full_name, user_type)
          `)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender:profiles!messages_sender_id_fkey(full_name, user_type)
          `)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('notifications')
          .select(`
            id,
            title,
            created_at,
            user:profiles!notifications_user_id_fkey(full_name, user_type)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      const recentActivity = [
        ...(postsResult.data || []).map(item => ({
          type: 'post',
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          user: item.professional
        })),
        ...(messagesResult.data || []).map(item => ({
          type: 'message',
          id: item.id,
          title: item.content?.substring(0, 50) + '...',
          created_at: item.created_at,
          user: item.sender
        })),
        ...(notificationsResult.data || []).map(item => ({
          type: 'notification',
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          user: item.user
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)

      setRecentActivity(recentActivity)
    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error)
    }
  }

  useEffect(() => {
    fetchAllData()
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchAllData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢'
      case 'warning': return '🟡'
      case 'error': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com atualização */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h2>
          {lastUpdate && (
            <p className="text-sm text-gray-600">
              Última atualização: {lastUpdate.toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={fetchAllData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Tabs principais - Responsivo com scroll horizontal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full sm:grid sm:grid-cols-9 gap-1 p-1">
            <TabsTrigger value="overview" className="whitespace-nowrap text-xs sm:text-sm">
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="whitespace-nowrap text-xs sm:text-sm">
              <span className="hidden sm:inline">Usuários</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="whitespace-nowrap text-xs sm:text-sm">
              <span className="hidden sm:inline">Atividade</span>
              <span className="sm:hidden">Ativ</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="whitespace-nowrap text-xs sm:text-sm">
              <span className="hidden sm:inline">Denúncias</span>
              <span className="sm:hidden">Denún</span>
            </TabsTrigger>
            <TabsTrigger value="bans" className="whitespace-nowrap text-xs sm:text-sm">
              <span className="hidden sm:inline">Banimentos</span>
              <span className="sm:hidden">Bans</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="whitespace-nowrap text-xs sm:text-sm">
              <span className="hidden sm:inline">Sistema</span>
              <span className="sm:hidden">Sist</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="whitespace-nowrap text-xs sm:text-sm">
              <span className="hidden sm:inline">Monitoramento</span>
              <span className="sm:hidden">Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="whitespace-nowrap text-xs sm:text-sm">
              <span className="hidden sm:inline">Ferramentas</span>
              <span className="sm:hidden">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="whitespace-nowrap text-xs sm:text-sm">
              <TestTube className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Testes</span>
              <span className="sm:hidden">Test</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Visão Geral - Layout Compacto */}
        <TabsContent value="overview" className="space-y-4">
          {/* Métricas principais - Cards compactos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Card compacto - Total Usuários */}
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">Usuários</p>
                  <p className="text-lg font-bold text-gray-900">{userStats?.total_users || 0}</p>
                </div>
              </div>
            </Card>

            {/* Card compacto - Ativos 24h */}
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">Ativos</p>
                  <p className="text-lg font-bold text-gray-900">{userStats?.active_users_24h || 0}</p>
                </div>
              </div>
            </Card>

            {/* Card compacto - Novos hoje */}
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">Novos</p>
                  <p className="text-lg font-bold text-gray-900">{userStats?.new_users_today || 0}</p>
                </div>
              </div>
            </Card>

            {/* Card compacto - Posts 24h */}
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">Posts</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.posts_last_24h || 0}</p>
                </div>
              </div>
            </Card>

            {/* Card compacto - Mensagens 24h */}
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-orange-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">Msgs</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.messages_last_24h || 0}</p>
                </div>
              </div>
            </Card>

            {/* Card compacto - Notificações 24h */}
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">Notif</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.notifications_last_24h || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Saúde do sistema - Cards compactos */}
          {systemHealth && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <div className="text-lg">{getHealthIcon(systemHealth.database_status)}</div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">DB Status</p>
                    <p className={`text-sm font-bold ${getHealthColor(systemHealth.database_status)}`}>
                      {systemHealth.database_status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Response</p>
                    <p className="text-sm font-bold text-gray-900">{systemHealth.api_response_time}ms</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Uptime</p>
                    <p className="text-sm font-bold text-gray-900">{systemHealth.uptime}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-orange-500" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Memory</p>
                    <p className="text-sm font-bold text-gray-900">{systemHealth.memory_usage}%</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab: Usuários - Layout Compacto */}
        <TabsContent value="users" className="space-y-4">
          {/* Métricas de usuários - Cards compactos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Profissionais</p>
                  <p className="text-lg font-bold text-gray-900">{userStats?.professional_users || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Clientes</p>
                  <p className="text-lg font-bold text-gray-900">{userStats?.client_users || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Verificados</p>
                  <p className="text-lg font-bold text-gray-900">{userStats?.verified_users || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Ativos 24h</p>
                  <p className="text-lg font-bold text-gray-900">{userStats?.active_users_24h || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Top 5 usuários mais ativos - Card compacto */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                Top 5 Usuários Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {topUsers.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{user.full_name}</div>
                        <div className="text-xs text-gray-600 truncate">
                          {user.user_type === 'professional' ? 'Prof' : 'Cliente'} • {user.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">{user.posts_count}</Badge>
                      <Badge variant="outline" className="text-xs">{user.messages_count}</Badge>
                      {user.is_verified && <Badge className="bg-green-100 text-green-700 text-xs">✓</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Atividade - Layout Compacto */}
        <TabsContent value="activity" className="space-y-4">
          {/* Métricas de atividade - Cards compactos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Usuários Ativos</p>
                  <p className="text-lg font-bold text-gray-900">{activeUsers.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Posts Hoje</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.posts_last_24h || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-orange-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Mensagens</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.messages_last_24h || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Notificações</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.notifications_last_24h || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Top 5 usuários ativos - Card compacto */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                Top 5 Usuários Ativos (24h)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {activeUsers.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{user.full_name}</div>
                        <div className="text-xs text-gray-600 truncate">
                          {user.user_type === 'professional' ? 'Prof' : 'Cliente'} • {user.city}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">{user.posts_count}</Badge>
                      <Badge variant="outline" className="text-xs">{user.messages_count}</Badge>
                      {user.is_verified && <Badge className="bg-green-100 text-green-700 text-xs">✓</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Atividade recente - Card compacto */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="flex-shrink-0">
                      {activity.type === 'post' && <TrendingUp className="h-3 w-3 text-blue-500" />}
                      {activity.type === 'message' && <MessageCircle className="h-3 w-3 text-green-500" />}
                      {activity.type === 'notification' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{activity.title}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {activity.user?.full_name} • {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Denúncias */}
        <TabsContent value="reports" className="space-y-6">
          <ReportsManagement />
        </TabsContent>

        {/* Tab: Banimentos */}
        <TabsContent value="bans" className="space-y-6">
          <BansManagement />
        </TabsContent>

        {/* Tab: Sistema - Layout Compacto */}
        <TabsContent value="system" className="space-y-4">
          {/* Métricas do sistema - Cards compactos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Posts Total</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.total_posts || 0}</p>
                  <p className="text-xs text-green-600">+{systemStats?.posts_last_24h || 0} hoje</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Mensagens</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.total_messages || 0}</p>
                  <p className="text-xs text-green-600">+{systemStats?.messages_last_24h || 0} hoje</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Notificações</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.total_notifications || 0}</p>
                  <p className="text-xs text-green-600">+{systemStats?.notifications_last_24h || 0} hoje</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Avaliações</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.total_reviews || 0}</p>
                  <p className="text-xs text-green-600">+{systemStats?.reviews_last_24h || 0} hoje</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Monitoramento - Layout Compacto */}
        <TabsContent value="monitoring" className="space-y-4">
          {/* Métricas de performance - Cards compactos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Response Time</p>
                  <p className="text-lg font-bold text-gray-900">{systemHealth?.api_response_time || 0}ms</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Error Rate</p>
                  <p className={`text-lg font-bold ${systemHealth?.error_rate === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {systemHealth?.error_rate || 0}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Uptime</p>
                  <p className="text-lg font-bold text-gray-900">{systemHealth?.uptime || 0}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-500" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Memory</p>
                  <p className={`text-lg font-bold ${systemHealth?.memory_usage && systemHealth.memory_usage > 80 ? 'text-red-600' : 'text-green-600'}`}>
                    {systemHealth?.memory_usage || 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Ferramentas - Layout Compacto */}
        <TabsContent value="tools" className="space-y-4">
          {/* Ferramentas de limpeza - Cards compactos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Limpeza de Dados</p>
                  <p className="text-xs text-gray-600">Manutenção do sistema</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Trash2 className="h-3 w-3 mr-2" />
                  Limpar Notificações
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Database className="h-3 w-3 mr-2" />
                  Limpar Dados de Teste
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Otimizar DB
                </Button>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Gerenciamento</p>
                  <p className="text-xs text-gray-600">Controle de usuários</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <UserCheck className="h-3 w-3 mr-2" />
                  Verificar Usuários
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <UserX className="h-3 w-3 mr-2" />
                  Suspender Usuários
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Shield className="h-3 w-3 mr-2" />
                  Verificar Permissões
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Testes - Sistema de Testes Automatizados */}
        <TabsContent value="tests" className="space-y-4">
          <TestsManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
