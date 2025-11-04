'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  Calendar,
  ArrowUpDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  ExternalLink,
  User,
  Clock,
  Gift,
  Heart,
  FileText,
  Briefcase,
  ArrowRightLeft,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ConfiPointsStats {
  total_users_with_points: number
  total_points_in_circulation: number
  total_points_earned_all_time: number
  total_points_spent_all_time: number
  total_transactions: number
  transactions_today: number
  points_earned_today: number
  points_spent_today: number
  transactions_this_month: number
  points_earned_this_month: number
  points_spent_this_month: number
}

interface ConfiPointsUser {
  user_id: string
  full_name: string
  email: string
  avatar_url: string | null
  balance: number
  total_earned: number
  total_spent: number
  available_balance: number
  last_transaction_date: string | null
  transaction_count: number
}

interface ConfiPointsTransaction {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar_url: string | null
  amount: number
  type: 'earn' | 'spend'
  source: string
  description: string | null
  metadata: any
  related_user_id: string | null
  related_user_name: string | null
  created_at: string
}

interface SourceStats {
  source: string
  total_earned: number
  total_spent: number
  net_points: number
  transaction_count: number
  unique_users: number
}

export function ConfiPointsAdminDashboard() {
  const [usersPage, setUsersPage] = useState(0)
  const [transactionsPage, setTransactionsPage] = useState(0)
  const [usersOrderBy, setUsersOrderBy] = useState<'balance_desc' | 'balance_asc' | 'earned_desc' | 'spent_desc' | 'name_asc'>('balance_desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterUserId, setFilterUserId] = useState<string>('')
  const [activeTab, setActiveTab] = useState('overview')
  const itemsPerPage = 20

  // Buscar TODAS as transações para a aba detalhada (sem paginação inicial)
  const { data: allTransactionsData, isLoading: allTransactionsLoading } = useQuery({
    queryKey: ['admin-confipoints-all-transactions'],
    queryFn: async () => {
      // Construir parâmetros dinamicamente, omitindo valores null
      const params: any = {
        p_limit: 1000, // Buscar mais transações para análise
        p_offset: 0
      }
      
      const { data, error } = await supabase.rpc('get_admin_confipoints_transactions', params)
      if (error) {
        console.error('Erro ao buscar todas as transações:', error)
        throw error
      }
      if (Array.isArray(data)) {
        return data as ConfiPointsTransaction[]
      }
      return []
    },
    enabled: activeTab === 'detailed', // Só buscar quando a aba estiver ativa
    retry: 2,
  })

  // Buscar estatísticas gerais
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-confipoints-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_confipoints_stats')
      if (error) {
        console.error('Erro ao buscar estatísticas:', error)
        throw error
      }
      return data as ConfiPointsStats
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    retry: 2, // Tentar apenas 2 vezes
  })

  // Buscar usuários
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-confipoints-users', usersPage, usersOrderBy],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_admin_confipoints_users', {
          p_limit: itemsPerPage,
          p_offset: usersPage * itemsPerPage,
          p_order_by: usersOrderBy
        })
        
        if (error) {
          console.error('Erro ao buscar usuários:', error)
          console.error('Detalhes do erro (JSON):', JSON.stringify({
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            fullError: error
          }, null, 2))
          throw error
        }
        
        // Se retornar null, retornar array vazio
        if (data === null || data === undefined) {
          return []
        }
        
        // Garantir que retorna array
        if (Array.isArray(data)) {
          return data as ConfiPointsUser[]
        }
        
        // Se for objeto único, converter para array
        if (typeof data === 'object') {
          return [data] as ConfiPointsUser[]
        }
        
        return []
      } catch (err: any) {
        console.error('Erro na query de usuários:', err)
        throw err
      }
    },
    retry: 1,
  })

  // Buscar transações
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['admin-confipoints-transactions', transactionsPage, filterType, filterUserId],
    queryFn: async () => {
      try {
        // Construir parâmetros dinamicamente, omitindo valores null
        const params: any = {
          p_limit: itemsPerPage,
          p_offset: transactionsPage * itemsPerPage
        }
        
        // Adicionar apenas parâmetros não nulos
        if (filterUserId) {
          params.p_user_id = filterUserId
        }
        if (filterType && filterType !== 'all') {
          params.p_type = filterType
        }
        
        console.log('Chamando RPC com parâmetros:', JSON.stringify(params, null, 2))
        
        const { data, error } = await supabase.rpc('get_admin_confipoints_transactions', params)
        
        if (error) {
          console.error('Erro ao buscar transações:', error)
          console.error('Detalhes do erro (JSON):', JSON.stringify({
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            fullError: error
          }, null, 2))
          throw error
        }
        
        // Se retornar null, retornar array vazio
        if (data === null || data === undefined) {
          return []
        }
        
        // Garantir que retorna array
        if (Array.isArray(data)) {
          return data as ConfiPointsTransaction[]
        }
        
        // Se for objeto único, converter para array
        if (typeof data === 'object') {
          return [data] as ConfiPointsTransaction[]
        }
        
        return []
      } catch (err: any) {
        console.error('Erro na query de transações:', err)
        throw err
      }
    },
    retry: 1,
  })

  // Buscar estatísticas por fonte
  const { data: sourceStats, isLoading: sourceStatsLoading } = useQuery({
    queryKey: ['admin-confipoints-sources'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_confipoints_by_source')
      if (error) {
        console.error('Erro ao buscar estatísticas por fonte:', error)
        throw error
      }
      // Garantir que retorna array
      if (Array.isArray(data)) {
        return data as SourceStats[]
      }
      return []
    },
    retry: 2,
  })

  // Filtrar usuários por termo de busca
  const filteredUsers = usersData?.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  const getTransactionTypeColor = (type: string) => {
    return type === 'earn' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const getTransactionTypeBadge = (type: string) => {
    return type === 'earn' ? 'default' : 'destructive'
  }

  // Agrupar transações por tipo/fonte
  const groupedTransactions = allTransactionsData?.reduce((acc, transaction) => {
    const source = transaction.source || 'outros'
    const category = getSourceCategory(source)
    
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(transaction)
    return acc
  }, {} as Record<string, ConfiPointsTransaction[]>) || {}

  // Função para categorizar sources
  function getSourceCategory(source: string): string {
    if (source.startsWith('referral_') || source === 'referral') {
      return 'Bônus de Indicações'
    }
    if (source === 'premium_like' || source === 'receive_premium_like') {
      return 'Likes Premium'
    }
    if (source === 'premium_post' || source === 'create_premium_post') {
      return 'Posts Premium'
    }
    if (source === 'premium_ad' || source === 'premium_classified') {
      return 'Classificados Premium'
    }
    if (source === 'transfer' || source === 'receive_transfer') {
      return 'Transferências entre Usuários'
    }
    if (source === 'premium_comment' || source === 'receive_premium_comment') {
      return 'Comentários Premium'
    }
    if (source.startsWith('receive_') || source.includes('receive')) {
      return 'Ganhos Gerais'
    }
    if (source.startsWith('premium_') || source.includes('premium')) {
      return 'Gastos Premium'
    }
    return 'Outros'
  }

  // Função para obter ícone da categoria
  function getCategoryIcon(category: string) {
    switch (category) {
      case 'Bônus de Indicações':
        return <Gift className="h-4 w-4" />
      case 'Likes Premium':
        return <Heart className="h-4 w-4" />
      case 'Posts Premium':
        return <FileText className="h-4 w-4" />
      case 'Classificados Premium':
        return <Briefcase className="h-4 w-4" />
      case 'Transferências entre Usuários':
        return <ArrowRightLeft className="h-4 w-4" />
      case 'Comentários Premium':
        return <Activity className="h-4 w-4" />
      case 'Ganhos Gerais':
        return <TrendingUp className="h-4 w-4" />
      case 'Gastos Premium':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  // Ordenar categorias por importância
  const categoryOrder = [
    'Transferências entre Usuários',
    'Bônus de Indicações',
    'Likes Premium',
    'Posts Premium',
    'Classificados Premium',
    'Comentários Premium',
    'Ganhos Gerais',
    'Gastos Premium',
    'Outros'
  ]

  const sortedCategories = categoryOrder.filter(cat => groupedTransactions[cat]?.length > 0)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Dashboard de ConfiPoints
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão completa das atividades, emissões e gastos do sistema de ConfiPoints
          </p>
        </div>
        <Button
          onClick={() => {
            refetchStats()
            refetchUsers()
            refetchTransactions()
          }}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários com Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.total_users_with_points)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Usuários ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                Pontos em Circulação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(stats.total_points_in_circulation)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Saldo total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Total Ganho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.total_points_earned_all_time)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Desde o início
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Total Gasto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats.total_points_spent_all_time)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Desde o início
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Estatísticas do Dia */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Transações:</span>
                  <span className="font-semibold">{stats.transactions_today}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 dark:text-green-400">Ganhos:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +{formatCurrency(stats.points_earned_today)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600 dark:text-red-400">Gastos:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(stats.points_spent_today)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Este Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Transações:</span>
                  <span className="font-semibold">{stats.transactions_this_month}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 dark:text-green-400">Ganhos:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +{formatCurrency(stats.points_earned_this_month)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600 dark:text-red-400">Gastos:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(stats.points_spent_this_month)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.total_transactions)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Todas as transações
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estatísticas por Fonte */}
      {sourceStatsLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">Carregando...</div>
          </CardContent>
        </Card>
      ) : sourceStats && sourceStats.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estatísticas por Fonte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fonte</TableHead>
                    <TableHead className="text-right">Ganhos</TableHead>
                    <TableHead className="text-right">Gastos</TableHead>
                    <TableHead className="text-right">Saldo Líquido</TableHead>
                    <TableHead className="text-right">Transações</TableHead>
                    <TableHead className="text-right">Usuários Únicos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceStats.map((source, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{source.source}</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400">
                        +{formatCurrency(source.total_earned)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        -{formatCurrency(source.total_spent)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        source.net_points >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {source.net_points >= 0 ? '+' : ''}{formatCurrency(source.net_points)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(source.transaction_count)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(source.unique_users)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários e Saldos
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={usersOrderBy} onValueChange={(value: any) => setUsersOrderBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance_desc">Saldo (Maior)</SelectItem>
                  <SelectItem value="balance_asc">Saldo (Menor)</SelectItem>
                  <SelectItem value="earned_desc">Ganhos (Maior)</SelectItem>
                  <SelectItem value="spent_desc">Gastos (Maior)</SelectItem>
                  <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8">Carregando usuários...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead className="text-right">Total Ganho</TableHead>
                      <TableHead className="text-right">Total Gasto</TableHead>
                      <TableHead className="text-right">Transações</TableHead>
                      <TableHead>Última Transação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>
                                {user.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.full_name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                            {formatCurrency(user.balance)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-400">
                          {formatCurrency(user.total_earned)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-400">
                          {formatCurrency(user.total_spent)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(user.transaction_count)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {user.last_transaction_date ? formatDate(user.last_transaction_date) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/perfil/${user.user_id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Ver Perfil
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {filteredUsers.length} de {usersData?.length || 0} usuários
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsersPage(Math.max(0, usersPage - 1))}
                    disabled={usersPage === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsersPage(usersPage + 1)}
                    disabled={filteredUsers.length < itemsPerPage}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transações com Abas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transações Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="detailed">Detalhado por Tipo</TabsTrigger>
            </TabsList>

            {/* Aba: Visão Geral */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="earn">Ganhos</SelectItem>
                      <SelectItem value="spend">Gastos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {transactionsLoading ? (
                <div className="text-center py-8">Carregando transações...</div>
              ) : transactionsData && transactionsData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma transação encontrada</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Fonte</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactionsData?.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={transaction.user_avatar_url || undefined} />
                                  <AvatarFallback>
                                    {transaction.user_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm">{transaction.user_name}</div>
                                  <div className="text-xs text-gray-500">{transaction.user_email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getTransactionTypeBadge(transaction.type)}>
                                {transaction.type === 'earn' ? 'Ganho' : 'Gasto'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                                {transaction.type === 'earn' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{transaction.source}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {transaction.description || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                {formatDate(transaction.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link href={`/perfil/${transaction.user_id}`}>
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  Perfil
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Página {transactionsPage + 1}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTransactionsPage(Math.max(0, transactionsPage - 1))}
                        disabled={transactionsPage === 0}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTransactionsPage(transactionsPage + 1)}
                        disabled={(transactionsData?.length || 0) < itemsPerPage}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Aba: Detalhado por Tipo */}
            <TabsContent value="detailed" className="space-y-6 mt-4">
              {allTransactionsLoading ? (
                <div className="text-center py-8">Carregando todas as transações...</div>
              ) : sortedCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma transação encontrada</div>
              ) : (
                sortedCategories.map((category) => {
                  const transactions = groupedTransactions[category] || []
                  const totalEarned = transactions
                    .filter(t => t.type === 'earn')
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  const totalSpent = transactions
                    .filter(t => t.type === 'spend')
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  const netPoints = totalEarned - totalSpent

                  return (
                    <Card key={category}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span>{category}</span>
                            <Badge variant="secondary" className="ml-2">
                              {transactions.length} transações
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-green-600 dark:text-green-400">
                              Ganhos: +{formatCurrency(totalEarned)}
                            </div>
                            <div className="text-red-600 dark:text-red-400">
                              Gastos: -{formatCurrency(totalSpent)}
                            </div>
                            <div className={`font-semibold ${netPoints >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Líquido: {netPoints >= 0 ? '+' : ''}{formatCurrency(netPoints)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Relacionado</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Fonte</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {transactions
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map((transaction) => (
                                  <TableRow key={transaction.id}>
                                    <TableCell>
                                      <Link href={`/perfil/${transaction.user_id}`} className="flex items-center gap-2 hover:underline">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={transaction.user_avatar_url || undefined} />
                                          <AvatarFallback>
                                            {transaction.user_name?.charAt(0) || 'U'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium text-sm">{transaction.user_name}</div>
                                          <div className="text-xs text-gray-500">{transaction.user_email}</div>
                                        </div>
                                      </Link>
                                    </TableCell>
                                    <TableCell>
                                      {transaction.related_user_id && transaction.related_user_name ? (
                                        <Link href={`/perfil/${transaction.related_user_id}`} className="flex items-center gap-2 hover:underline">
                                          <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-xs">
                                              {transaction.related_user_name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm text-blue-600 dark:text-blue-400">
                                            {transaction.related_user_name}
                                          </span>
                                        </Link>
                                      ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={getTransactionTypeBadge(transaction.type)}>
                                        {transaction.type === 'earn' ? 'Ganho' : 'Gasto'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <span className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                                        {transaction.type === 'earn' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm font-medium">{transaction.source}</span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {transaction.description || 'N/A'}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(transaction.created_at)}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Link href={`/perfil/${transaction.user_id}`}>
                                        <Button variant="ghost" size="sm" className="gap-1">
                                          <ExternalLink className="h-3 w-3" />
                                          Perfil
                                        </Button>
                                      </Link>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

