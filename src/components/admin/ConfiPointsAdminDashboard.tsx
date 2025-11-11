'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Zap,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  RefreshCw,
  Search,
  Clock,
  ExternalLink,
  Gift,
  Heart,
  FileText,
  Briefcase,
  ArrowRightLeft,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ALLOWED_USER_ORDER_BY, isValidOrderBy, type UserOrderBy } from '@/lib/admin-constants'
import { useAdminRateLimit } from '@/hooks/useAdminRateLimit'

interface AdminStats {
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

interface AdminUser {
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

interface AdminTransaction {
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

interface SourceStat {
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
  const [usersOrderBy, setUsersOrderBy] = useState<UserOrderBy>('balance_desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterUserId, setFilterUserId] = useState<string>('')
  const [activeMainTab, setActiveMainTab] = useState('overview') // Aba principal
  const [activeTab, setActiveTab] = useState('overview') // Aba de transações (dentro da aba de transações)
  const itemsPerPage = 20

  // Rate limiting para operações admin
  const { checkRateLimit, isLimited } = useAdminRateLimit({
    maxRequests: 30,
    windowMs: 60 * 1000 // 30 requisições por minuto
  })

  // Helper para timeout de queries
  const createQueryWithTimeout = <T,>(fn: () => Promise<T>, timeoutMs: number = 30000): Promise<T> => {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout após 30 segundos')), timeoutMs)
      )
    ])
  }

  // Buscar TODAS as transações para a aba detalhada (sem paginação inicial)
  const { data: allTransactionsData, isLoading: allTransactionsLoading } = useQuery({
    queryKey: ['admin-confipoints-all-transactions'],
    queryFn: async () => {
      return createQueryWithTimeout(async () => {
        try {
          const params: any = {
            p_limit: 1000, // Limite reduzido para melhor performance
            p_offset: 0
          }

          const { data, error } = await supabase.rpc('get_admin_confipoints_transactions', params)

          if (error) {
            // Log simplificado em produção
            if (process.env.NODE_ENV === 'development') {
              console.error('Erro ao buscar todas as transações:', error)
            } else {
              console.error('Erro ao buscar todas as transações:', error.message)
            }
            return []
          }

          // Se retornar um objeto único, converter para array
          if (data && !Array.isArray(data)) {
            return [data]
          }

          return data || []
        } catch (error: any) {
          // Log simplificado em produção
          if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao buscar todas as transações:', error)
          } else {
            console.error('Erro ao buscar todas as transações:', error?.message || 'Erro desconhecido')
          }
          return []
        }
      }, 30000)
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })

  // Buscar estatísticas gerais
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<AdminStats>({
    queryKey: ['admin-confipoints-stats'],
    queryFn: async () => {
      return createQueryWithTimeout(async () => {
        const { data, error } = await supabase.rpc('get_admin_confipoints_stats')

        if (error) {
          // Log simplificado em produção
          if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao buscar estatísticas:', error)
          } else {
            console.error('Erro ao buscar estatísticas:', error.message)
          }
          throw error
        }

        return data as AdminStats
      }, 30000).catch((error: any) => {
        if (error?.message?.includes('timeout')) {
          console.error('Timeout ao buscar estatísticas após 30 segundos')
        }
        throw error
      })
    },
    staleTime: 1 * 60 * 1000, // 1 minuto (estatísticas mudam frequentemente)
    gcTime: 3 * 60 * 1000, // 3 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })

  // Buscar usuários
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery<AdminUser[]>({
    queryKey: ['admin-confipoints-users', usersPage, usersOrderBy],
    queryFn: async () => {
      return createQueryWithTimeout(async () => {
        // Validar order_by antes de enviar
        const validOrderBy = isValidOrderBy(usersOrderBy) ? usersOrderBy : 'balance_desc'
        
        const params: any = {
          p_limit: itemsPerPage,
          p_offset: usersPage * itemsPerPage,
          p_order_by: validOrderBy
        }

        const { data, error } = await supabase.rpc('get_admin_confipoints_users', params)

        if (error) {
          // Log simplificado em produção (menos detalhes sensíveis)
          if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao buscar usuários:', JSON.stringify({
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            }, null, 2))
          } else {
            console.error('Erro ao buscar usuários:', error.message)
          }
          throw error
        }

        // Se retornar um objeto único, converter para array
        if (data && !Array.isArray(data)) {
          return [data]
        }

        return data || []
      }, 30000).catch((error: any) => {
        if (error?.message?.includes('timeout')) {
          console.error('Timeout ao buscar usuários após 30 segundos')
        }
        throw error
      })
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })

  // Buscar transações paginadas
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<AdminTransaction[]>({
    queryKey: ['admin-confipoints-transactions', transactionsPage, filterType, filterUserId],
    queryFn: async () => {
      return createQueryWithTimeout(async () => {
        const params: any = {
          p_limit: itemsPerPage,
          p_offset: transactionsPage * itemsPerPage
        }

        if (filterType !== 'all') {
          params.p_type = filterType
        }

        if (filterUserId) {
          params.p_user_id = filterUserId
        }

        const { data, error } = await supabase.rpc('get_admin_confipoints_transactions', params)

        if (error) {
          // Log simplificado em produção (menos detalhes sensíveis)
          if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao buscar transações:', JSON.stringify({
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            }, null, 2))
          } else {
            console.error('Erro ao buscar transações:', error.message)
          }
          throw error
        }

        // Se retornar um objeto único, converter para array
        if (data && !Array.isArray(data)) {
          return [data]
        }

        return data || []
      }, 30000).catch((error: any) => {
        if (error?.message?.includes('timeout')) {
          console.error('Timeout ao buscar transações após 30 segundos')
        }
        throw error
      })
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })

  // Buscar estatísticas por fonte
  const { data: sourceStats, isLoading: sourceStatsLoading, refetch: refetchSourceStats } = useQuery<SourceStat[]>({
    queryKey: ['admin-confipoints-by-source'],
    queryFn: async () => {
      return createQueryWithTimeout(async () => {
        const { data, error } = await supabase.rpc('get_admin_confipoints_by_source')

        if (error) {
          // Log simplificado em produção
          if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao buscar estatísticas por fonte:', error)
          } else {
            console.error('Erro ao buscar estatísticas por fonte:', error.message)
          }
          throw error
        }

        // Se retornar um objeto único, converter para array
        if (data && !Array.isArray(data)) {
          return [data]
        }

        return data || []
      }, 30000).catch((error: any) => {
        if (error?.message?.includes('timeout')) {
          console.error('Timeout ao buscar estatísticas por fonte após 30 segundos')
        }
        throw error
      })
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false
  })

  // Filtrar usuários por termo de busca
  const filteredUsers = useMemo(() => {
    if (!usersData) return []
    if (!searchTerm) return usersData

    const term = searchTerm.toLowerCase()
    return usersData.filter(user =>
      user.full_name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    )
  }, [usersData, searchTerm])

  // Agrupar transações por categoria
  const groupedTransactions = useMemo(() => {
    if (!allTransactionsData || !Array.isArray(allTransactionsData)) return {}

    const grouped: Record<string, AdminTransaction[]> = {}

    allTransactionsData.forEach((transaction) => {
      const category = getSourceCategory(transaction.source)
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(transaction)
    })

    return grouped
  }, [allTransactionsData])

  // Funções auxiliares
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email
    const [localPart, domain] = email.split('@')
    if (localPart.length <= 2) return email
    const maskedLocal = localPart.substring(0, 2) + '***'
    const [domainName, domainExt] = domain.split('.')
    const maskedDomain = domainName.substring(0, 2) + '***.' + domainExt
    return `${maskedLocal}@${maskedDomain}`
  }

  function getTransactionTypeBadge(type: 'earn' | 'spend') {
    return type === 'earn' ? 'default' : 'destructive'
  }

  function getTransactionTypeColor(type: 'earn' | 'spend') {
    return type === 'earn'
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
  }

  // Função para categorizar fonte
  function getSourceCategory(source: string): string {
    if (source === 'referral_bonus' || source === 'receive_referral_bonus') {
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Cabeçalho - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
            <span>Dashboard de ConfiPoints</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Visão completa das atividades, emissões e gastos do sistema de ConfiPoints
          </p>
        </div>
        <Button
          onClick={() => {
            if (!checkRateLimit()) {
              alert('Muitas requisições. Aguarde um momento antes de atualizar novamente.')
              return
            }
            refetchStats()
            refetchUsers()
            refetchTransactions()
            refetchSourceStats()
          }}
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          size="sm"
          disabled={isLimited}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Atualizar</span>
        </Button>
      </div>

      {/* Tabs Principais - Responsivo */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-max min-w-full sm:grid sm:grid-cols-4 gap-1 p-1 bg-gray-100 dark:bg-gray-900">
            <TabsTrigger 
              value="overview" 
              className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" />
              <span className="hidden sm:inline">Usuários</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" />
              <span className="hidden sm:inline">Transações</span>
              <span className="sm:hidden">Trans.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sources" 
              className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" />
              <span className="hidden sm:inline">Por Fonte</span>
              <span className="sm:hidden">Fonte</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Aba: Visão Geral */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4">
          {/* Estatísticas Gerais */}
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    Usuários com Pontos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.total_users_with_points)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Usuários ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    Pontos em Circulação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(stats.total_points_in_circulation)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Saldo total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    Total Ganho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(stats.total_points_earned_all_time)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Desde o início
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    Total Gasto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Transações:</span>
                      <span className="font-semibold">{stats.transactions_today}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-green-600 dark:text-green-400">Ganhos:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        +{formatCurrency(stats.points_earned_today)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-red-600 dark:text-red-400">Gastos:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        -{formatCurrency(stats.points_spent_today)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Este Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Transações:</span>
                      <span className="font-semibold">{stats.transactions_this_month}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-green-600 dark:text-green-400">Ganhos:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        +{formatCurrency(stats.points_earned_this_month)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-red-600 dark:text-red-400">Gastos:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        -{formatCurrency(stats.points_spent_this_month)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                    Total de Transações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.total_transactions)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Todas as transações
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Aba: Usuários */}
        <TabsContent value="users" className="space-y-4 sm:space-y-6 mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Usuários e Saldos
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full sm:w-64 text-sm"
                    />
                  </div>
                  <Select 
                    value={usersOrderBy} 
                    onValueChange={(value: string) => {
                      if (isValidOrderBy(value)) {
                        setUsersOrderBy(value)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-48 text-sm">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_USER_ORDER_BY.map((orderBy) => {
                        const labels: Record<UserOrderBy, string> = {
                          balance_desc: 'Saldo (Maior)',
                          balance_asc: 'Saldo (Menor)',
                          earned_desc: 'Ganhos (Maior)',
                          spent_desc: 'Gastos (Maior)',
                          name_asc: 'Nome (A-Z)'
                        }
                        return (
                          <SelectItem key={orderBy} value={orderBy}>
                            {labels[orderBy]}
                          </SelectItem>
                        )
                      })}
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
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Usuário</TableHead>
                          <TableHead className="text-right text-xs sm:text-sm">Saldo</TableHead>
                          <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">Total Ganho</TableHead>
                          <TableHead className="text-right text-xs sm:text-sm hidden lg:table-cell">Total Gasto</TableHead>
                          <TableHead className="text-right text-xs sm:text-sm hidden lg:table-cell">Transações</TableHead>
                          <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Última Transação</TableHead>
                          <TableHead className="text-xs sm:text-sm">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                                  <AvatarImage src={user.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {user.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="font-medium text-xs sm:text-sm truncate">{user.full_name}</div>
                                  <div className="text-xs text-gray-500 truncate hidden sm:block">
                                    {user.email ? maskEmail(user.email) : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm">
                                {formatCurrency(user.balance)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-green-600 dark:text-green-400 hidden sm:table-cell text-xs sm:text-sm">
                              {formatCurrency(user.total_earned)}
                            </TableCell>
                            <TableCell className="text-right text-red-600 dark:text-red-400 hidden lg:table-cell text-xs sm:text-sm">
                              {formatCurrency(user.total_spent)}
                            </TableCell>
                            <TableCell className="text-right hidden lg:table-cell text-xs sm:text-sm">
                              {formatCurrency(user.transaction_count)}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                {user.last_transaction_date ? formatDate(user.last_transaction_date) : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link href={`/perfil/${user.user_id}`}>
                                <Button variant="ghost" size="sm" className="gap-1 h-7 sm:h-8 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="hidden sm:inline">Ver Perfil</span>
                                  <span className="sm:hidden">Ver</span>
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                      Mostrando {filteredUsers.length} de {usersData?.length || 0} usuários
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage(Math.max(0, usersPage - 1))}
                        disabled={usersPage === 0}
                        className="text-xs"
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage(usersPage + 1)}
                        disabled={filteredUsers.length < itemsPerPage}
                        className="text-xs"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Transações */}
        <TabsContent value="transactions" className="space-y-4 sm:space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Transações Detalhadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <TabsList className="grid w-full grid-cols-2 gap-1">
                    <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
                    <TabsTrigger value="detailed" className="text-xs sm:text-sm">Detalhado por Tipo</TabsTrigger>
                  </TabsList>
                </div>

                {/* Aba: Visão Geral */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-4">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-40 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="earn">Ganhos</SelectItem>
                        <SelectItem value="spend">Gastos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {transactionsLoading ? (
                    <div className="text-center py-8">Carregando transações...</div>
                  ) : transactionsData && transactionsData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Nenhuma transação encontrada</div>
                  ) : (
                    <>
                      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs sm:text-sm">Usuário</TableHead>
                              <TableHead className="text-xs sm:text-sm">Tipo</TableHead>
                              <TableHead className="text-xs sm:text-sm">Valor</TableHead>
                              <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Fonte</TableHead>
                              <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Descrição</TableHead>
                              <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Data</TableHead>
                              <TableHead className="text-xs sm:text-sm">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactionsData?.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                                      <AvatarImage src={transaction.user_avatar_url || undefined} />
                                      <AvatarFallback className="text-xs">
                                        {transaction.user_name?.charAt(0) || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <div className="font-medium text-xs sm:text-sm truncate">{transaction.user_name}</div>
                                      <div className="text-xs text-gray-500 truncate hidden sm:block">
                                        {transaction.user_email ? maskEmail(transaction.user_email) : 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getTransactionTypeBadge(transaction.type)} className="text-xs">
                                    {transaction.type === 'earn' ? 'Ganho' : 'Gasto'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className={`font-semibold text-xs sm:text-sm ${getTransactionTypeColor(transaction.type)}`}>
                                    {transaction.type === 'earn' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                  </span>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <span className="text-xs sm:text-sm">{transaction.source}</span>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {transaction.description || 'N/A'}
                                  </span>
                                </TableCell>
                                <TableCell className="hidden xl:table-cell">
                                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(transaction.created_at)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Link href={`/perfil/${transaction.user_id}`}>
                                    <Button variant="ghost" size="sm" className="gap-1 h-7 sm:h-8 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                      <span className="hidden sm:inline">Perfil</span>
                                      <span className="sm:hidden">Ver</span>
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Página {transactionsPage + 1}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTransactionsPage(Math.max(0, transactionsPage - 1))}
                            disabled={transactionsPage === 0}
                            className="text-xs"
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTransactionsPage(transactionsPage + 1)}
                            disabled={(transactionsData?.length || 0) < itemsPerPage}
                            className="text-xs"
                          >
                            Próxima
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Aba: Detalhado por Tipo */}
                <TabsContent value="detailed" className="space-y-4 sm:space-y-6 mt-4">
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
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                {getCategoryIcon(category)}
                                <span>{category}</span>
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {transactions.length} transações
                                </Badge>
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
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
                            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs sm:text-sm">Usuário</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Relacionado</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Tipo</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Valor</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Fonte</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Data</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Ações</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {transactions
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                    .map((transaction) => (
                                      <TableRow key={transaction.id}>
                                        <TableCell>
                                          <Link href={`/perfil/${transaction.user_id}`} className="flex items-center gap-2 hover:underline">
                                            <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                                              <AvatarImage src={transaction.user_avatar_url || undefined} />
                                              <AvatarFallback className="text-xs">
                                                {transaction.user_name?.charAt(0) || 'U'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                              <div className="font-medium text-xs sm:text-sm truncate">{transaction.user_name}</div>
                                              <div className="text-xs text-gray-500 truncate hidden sm:block">
                                                {transaction.user_email ? maskEmail(transaction.user_email) : 'N/A'}
                                              </div>
                                            </div>
                                          </Link>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          {transaction.related_user_id && transaction.related_user_name ? (
                                            <Link href={`/perfil/${transaction.related_user_id}`} className="flex items-center gap-2 hover:underline">
                                              <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                                                <AvatarFallback className="text-xs">
                                                  {transaction.related_user_name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 truncate">
                                                {transaction.related_user_name}
                                              </span>
                                            </Link>
                                          ) : (
                                            <span className="text-xs sm:text-sm text-gray-400">-</span>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={getTransactionTypeBadge(transaction.type)} className="text-xs">
                                            {transaction.type === 'earn' ? 'Ganho' : 'Gasto'}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <span className={`font-semibold text-xs sm:text-sm ${getTransactionTypeColor(transaction.type)}`}>
                                            {transaction.type === 'earn' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                          </span>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                          <span className="text-xs sm:text-sm font-medium">{transaction.source}</span>
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell">
                                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(transaction.created_at)}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Link href={`/perfil/${transaction.user_id}`}>
                                            <Button variant="ghost" size="sm" className="gap-1 h-7 sm:h-8 text-xs">
                                              <ExternalLink className="h-3 w-3" />
                                              <span className="hidden sm:inline">Perfil</span>
                                              <span className="sm:hidden">Ver</span>
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
        </TabsContent>

        {/* Aba: Por Fonte */}
        <TabsContent value="sources" className="space-y-4 sm:space-y-6 mt-4">
          {sourceStatsLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse">Carregando...</div>
              </CardContent>
            </Card>
          ) : sourceStats && sourceStats.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  Estatísticas por Fonte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Fonte</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Ganhos</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Gastos</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">Saldo Líquido</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm hidden lg:table-cell">Transações</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm hidden xl:table-cell">Usuários Únicos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sourceStats.map((source, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-xs sm:text-sm">{source.source}</TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400 text-xs sm:text-sm">
                            +{formatCurrency(source.total_earned)}
                          </TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400 text-xs sm:text-sm">
                            -{formatCurrency(source.total_spent)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold hidden sm:table-cell text-xs sm:text-sm ${
                            source.net_points >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {source.net_points >= 0 ? '+' : ''}{formatCurrency(source.net_points)}
                          </TableCell>
                          <TableCell className="text-right hidden lg:table-cell text-xs sm:text-sm">{formatCurrency(source.transaction_count)}</TableCell>
                          <TableCell className="text-right hidden xl:table-cell text-xs sm:text-sm">{formatCurrency(source.unique_users)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Nenhuma estatística por fonte disponível
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
