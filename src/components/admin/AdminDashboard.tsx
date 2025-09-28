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
  Zap
} from 'lucide-react'
import { ReportsManagement } from './ReportsManagement'
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

        setActiveUsers(usersWithStats)
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
        setTopUsers(usersWithActivity.slice(0, 10))
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

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="reports">Denúncias</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                    <p className="text-3xl font-bold text-gray-900">{userStats?.total_users || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-green-600">
                    +{userStats?.new_users_today || 0} hoje
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuários Ativos (24h)</p>
                    <p className="text-3xl font-bold text-gray-900">{userStats?.active_users_24h || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-blue-600">
                    {Math.round(((userStats?.active_users_24h || 0) / (userStats?.total_users || 1)) * 100)}% ativos
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Posts (24h)</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.posts_last_24h || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-purple-600">
                    {systemStats?.total_posts || 0} total
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mensagens (24h)</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.messages_last_24h || 0}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-orange-600">
                    {systemStats?.total_messages || 0} total
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Saúde do sistema */}
          {systemHealth && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Saúde do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {getHealthIcon(systemHealth.database_status)}
                    </div>
                    <div className="text-sm text-gray-600">Banco de Dados</div>
                    <div className={`text-xs ${getHealthColor(systemHealth.database_status)}`}>
                      {systemHealth.database_status.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {systemHealth.api_response_time}ms
                    </div>
                    <div className="text-sm text-gray-600">Tempo de Resposta</div>
                    <div className="text-xs text-gray-500">API</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {systemHealth.uptime}%
                    </div>
                    <div className="text-sm text-gray-600">Uptime</div>
                    <div className="text-xs text-gray-500">Disponibilidade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {systemHealth.memory_usage}%
                    </div>
                    <div className="text-sm text-gray-600">Memória</div>
                    <div className="text-xs text-gray-500">Uso</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Usuários */}
        <TabsContent value="users" className="space-y-6">
          {/* Estatísticas de usuários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profissionais</span>
                    <Badge variant="outline">{userStats?.professional_users || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clientes</span>
                    <Badge variant="outline">{userStats?.client_users || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Verificados</span>
                    <Badge variant="outline" className="text-green-600">
                      {userStats?.verified_users || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usuários por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userStats?.users_by_state.slice(0, 10).map((state, index) => (
                    <div key={state.state} className="flex justify-between items-center">
                      <span className="text-sm">{state.state}</span>
                      <Badge variant="outline">{state.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Crescimento Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userStats?.users_by_month.slice(-6).map((month, index) => (
                    <div key={month.month} className="flex justify-between items-center">
                      <span className="text-sm">{month.month}</span>
                      <Badge variant="outline">{month.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usuários mais ativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Usuários Mais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topUsers.slice(0, 10).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-600">
                          {user.user_type === 'professional' ? 'Profissional' : 'Cliente'} • {user.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{user.posts_count} posts</Badge>
                      <Badge variant="outline">{user.messages_count} msgs</Badge>
                      {user.is_verified && <Badge className="bg-green-100 text-green-700">✓</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Atividade */}
        <TabsContent value="activity" className="space-y-6">
          {/* Usuários ativos nas últimas 24h */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Usuários Ativos (Últimas 24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeUsers.slice(0, 20).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-600">
                          {user.user_type === 'professional' ? 'Profissional' : 'Cliente'} • {user.city}, {user.state}
                        </div>
                        <div className="text-xs text-gray-500">
                          Última atividade: {new Date(user.last_activity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{user.posts_count} posts</Badge>
                      <Badge variant="outline">{user.messages_count} msgs</Badge>
                      {user.is_verified && <Badge className="bg-green-100 text-green-700">✓</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Atividade recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'post' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'message' && <MessageCircle className="h-4 w-4 text-green-500" />}
                      {activity.type === 'notification' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{activity.title}</div>
                      <div className="text-xs text-gray-500">
                        {activity.user?.full_name} • {new Date(activity.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
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

        {/* Tab: Sistema */}
        <TabsContent value="system" className="space-y-6">
          {/* Estatísticas do sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats?.total_posts || 0}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-blue-600">
                    +{systemStats?.posts_last_24h || 0} hoje
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Mensagens</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats?.total_messages || 0}</p>
                  </div>
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-green-600">
                    +{systemStats?.messages_last_24h || 0} hoje
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notificações</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats?.total_notifications || 0}</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-orange-600">
                    +{systemStats?.notifications_last_24h || 0} hoje
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avaliações</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats?.total_reviews || 0}</p>
                  </div>
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-yellow-600">
                    +{systemStats?.reviews_last_24h || 0} hoje
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Monitoramento */}
        <TabsContent value="monitoring" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Monitoramento Avançado:</strong> Esta seção mostra métricas detalhadas de performance e saúde do sistema.
            </AlertDescription>
          </Alert>

          {/* Métricas de performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo de Resposta da API</span>
                    <Badge variant="outline">{systemHealth?.api_response_time || 0}ms</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Erro</span>
                    <Badge variant="outline" className={systemHealth?.error_rate === 0 ? 'text-green-600' : 'text-red-600'}>
                      {systemHealth?.error_rate || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <Badge variant="outline" className="text-green-600">
                      {systemHealth?.uptime || 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uso de Memória</span>
                    <Badge variant="outline" className={systemHealth?.memory_usage && systemHealth.memory_usage > 80 ? 'text-red-600' : 'text-green-600'}>
                      {systemHealth?.memory_usage || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uso de CPU</span>
                    <Badge variant="outline" className={systemHealth?.cpu_usage && systemHealth.cpu_usage > 80 ? 'text-red-600' : 'text-green-600'}>
                      {systemHealth?.cpu_usage || 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Ferramentas */}
        <TabsContent value="tools" className="space-y-6">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Ferramentas Administrativas:</strong> Use estas ferramentas para gerenciar o sistema e resolver problemas.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Limpeza de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Notificações Antigas
                </Button>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Limpar Dados de Teste
                </Button>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Otimizar Banco de Dados
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Gerenciamento de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Verificar Usuários
                </Button>
                <Button variant="outline" className="w-full">
                  <UserX className="h-4 w-4 mr-2" />
                  Suspender Usuários
                </Button>
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar Permissões
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
