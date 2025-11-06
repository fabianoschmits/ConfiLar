'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Coins, 
  TrendingUp, 
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Crown,
  Sparkles,
  Gift,
  Send,
  Wallet,
  Info,
  ChevronRight,
  DollarSign,
  Zap,
  Star
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePoints, usePointsHistory } from '@/hooks/usePoints'
import { PREMIUM_PRICES } from '@/constants/premiumPrices'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionSkeleton } from '@/components/ui/skeleton'

export default function ConfiPointsDashboardPage() {
  const { user, profile } = useAuthContext()
  const { balance, loading: loadingPoints } = usePoints(user?.id)
  const { transactions, loading: loadingHistory } = usePointsHistory(user?.id, { limit: 100 })
  
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [visibleTransactionsCount, setVisibleTransactionsCount] = useState(10)

  // Calcular nível baseado nos pontos
  const calculateLevel = (points: number) => {
    if (points >= 10000) return { name: 'Diamond', color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: '💎' }
    if (points >= 5000) return { name: 'Platinum', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '⚪' }
    if (points >= 2000) return { name: 'Gold', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '🟡' }
    if (points >= 500) return { name: 'Silver', color: 'text-gray-400', bgColor: 'bg-gray-50', icon: '⚪' }
    return { name: 'Bronze', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '🟤' }
  }

  const currentLevel = calculateLevel(balance?.balance || 0)
  
  // Próximo nível
  const getNextLevel = (points: number) => {
    if (points < 500) return { target: 500, name: 'Silver' }
    if (points < 2000) return { target: 2000, name: 'Gold' }
    if (points < 5000) return { target: 5000, name: 'Platinum' }
    if (points < 10000) return { target: 10000, name: 'Diamond' }
    return null
  }

  const nextLevel = getNextLevel(balance?.balance || 0)
  const progress = nextLevel ? ((balance?.balance || 0) / nextLevel.target) * 100 : 100

  // Mapear transações do histórico para formato da UI
  const allTransactions = (transactions || []).map((t: any) => {
    const isPositive = t.amount > 0 || t.type === 'earn' || t.type === 'purchase' || t.type === 'refund'
    
    let typeLabel = ''
    let description = t.description || ''
    
    // Determinar tipo e descrição baseado na transação
    switch (t.type) {
      case 'earn':
        typeLabel = 'received'
        if (!description) description = `Ganhou ${Math.abs(t.amount)} pontos`
        break
      case 'spend':
        typeLabel = 'spent'
        if (!description) description = `Gastou ${Math.abs(t.amount)} pontos`
        break
      case 'transfer':
        typeLabel = isPositive ? 'transfer_received' : 'transfer_sent'
        if (!description) {
          description = isPositive 
            ? `Recebeu transferência de ${Math.abs(t.amount)} pontos`
            : `Transferiu ${Math.abs(t.amount)} pontos`
        }
        break
      case 'purchase':
        typeLabel = 'purchase'
        if (!description) description = `Comprou ${Math.abs(t.amount)} pontos`
        break
      case 'refund':
        typeLabel = 'refund'
        if (!description) description = `Reembolso de ${Math.abs(t.amount)} pontos`
        break
      default:
        typeLabel = t.type || 'other'
        if (!description) description = `Transação de ${Math.abs(t.amount)} pontos`
    }

    // Adicionar informações sobre a fonte se disponível
    if (t.source) {
      const sourceLabels: Record<string, string> = {
        'referral': '(Indicação)',
        'post': '(Post)',
        'like': '(Curtida)',
        'daily': '(Bônus Diário)',
        'purchase': '(Compra)',
        'transfer': '(Transferência)',
        'premium_post': '(Post Premium)',
        'store': '(Loja)',
        'bonus': '(Bônus)'
      }
      if (sourceLabels[t.source]) {
        description += ` ${sourceLabels[t.source]}`
      }
    }

    return {
      id: t.id,
      type: typeLabel,
      amount: t.amount,
      description,
      date: t.created_at,
      status: 'completed',
      source: t.source,
      metadata: t.metadata
    }
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingBag className="h-4 w-4" />
      case 'transfer_sent': return <Send className="h-4 w-4" />
      case 'transfer_received': return <Gift className="h-4 w-4" />
      case 'spent': return <ArrowDownRight className="h-4 w-4" />
      case 'received': return <ArrowUpRight className="h-4 w-4" />
      case 'refund': return <History className="h-4 w-4" />
      default: return <Coins className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string, amount: number) => {
    // Se o amount é positivo, é verde; se negativo, é vermelho
    if (amount > 0 || type === 'purchase' || type === 'received' || type === 'transfer_received' || type === 'refund') {
      return 'text-green-600 dark:text-green-400'
    }
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Coins className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Meus ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                      Gerencie seus pontos e transações
                  </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Saldo Atual */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Saldo Atual
                    </div>
                    <Coins className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {loadingPoints ? '...' : (balance?.balance || 0).toLocaleString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${currentLevel.bgColor} ${currentLevel.color} border-0`}>
                      {currentLevel.icon} {currentLevel.name}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Total Ganho */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Ganho
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {loadingPoints ? '...' : (balance?.total_earned || 0).toLocaleString('pt-BR')}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pontos recebidos
                  </p>
                </CardContent>
              </Card>

              {/* Total Gasto */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Gasto
                    </div>
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {loadingPoints ? '...' : (balance?.total_spent || 0).toLocaleString('pt-BR')}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pontos utilizados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progresso para Próximo Nível */}
            {nextLevel && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Progresso para {nextLevel.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Faltam {(nextLevel.target - (balance?.balance || 0)).toLocaleString('pt-BR')} pontos
                      </p>
                    </div>
                    <Badge variant="outline">
                      {Math.round(progress)}%
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-3" />
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
                <TabsTrigger value="ganhar">Como Ganhar</TabsTrigger>
                <TabsTrigger value="usar">Como Usar</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>

              {/* Visão Geral */}
              <TabsContent value="visao-geral" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ações Rápidas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        Ações Rápidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link href="/confipoints/comprar">
                        <Button className="w-full justify-between" variant="outline">
                          <span className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Loja Premium
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/confipoints/transferir">
                        <Button className="w-full justify-between" variant="outline">
                          <span className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Transferir Pontos
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Transações Recentes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-600" />
                        Últimas Transações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {allTransactions.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          Nenhuma transação ainda
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {allTransactions.slice(0, 5).map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  transaction.amount > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                                }`}>
                                  <div className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {transaction.description}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(transaction.date), { addSuffix: true, locale: ptBR })}
                                  </p>
                                </div>
                              </div>
                              <div className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Como Ganhar */}
              <TabsContent value="ganhar" className="space-y-6">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Sistema de Ganho de Pontos
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Atualmente, a ÚNICA forma de ganhar ConfiPoints GRATUITAMENTE é através do{' '}
                          <strong>Sistema de Indicações</strong>. Você também pode comprar pontos diretamente.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Sistema de Indicações (Referral)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Indique amigos e ganhe pontos quando eles atingirem marcos na plataforma:
                    </p>
                    <div className="space-y-3">
                      {[
                        { action: 'Amigo se cadastrou', points: 200, icon: '👋' },
                        { action: 'Amigo completou perfil', points: 150, icon: '📋' },
                        { action: 'Amigo fez primeiro post', points: 100, icon: '📝' },
                        { action: 'Amigo fez primeira avaliação', points: 100, icon: '⭐' },
                        { action: 'Amigo ativo por 30 dias', points: 300, icon: '🔥' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.action}
                            </span>
                          </div>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0">
                            +{item.points} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                        💰 Total Possível por Indicação: 950 pontos (R$ 9,50)
                      </p>
                      <Link href="/indicacoes">
                        <Button className="w-full mt-2" variant="default">
                          <Users className="h-4 w-4 mr-2" />
                          Ir para Indicações
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                      Comprar Pontos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Você também pode comprar pontos diretamente para usar nas funcionalidades premium da plataforma.
                    </p>
                    <Link href="/confipoints/comprar">
                      <Button className="w-full" variant="outline">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Ver Pacotes de Pontos
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Como Usar */}
              <TabsContent value="usar" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Ações Premium na Plataforma
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'Curtida Premium', cost: PREMIUM_PRICES.LIKE.POINTS, description: PREMIUM_PRICES.LIKE.DESCRIPTION, icon: '💎', link: '/feed' },
                        { name: 'Comentário Premium', cost: PREMIUM_PRICES.COMMENT.POINTS, description: PREMIUM_PRICES.COMMENT.DESCRIPTION, icon: '💬', link: '/feed' },
                        { name: 'Post Premium', cost: PREMIUM_PRICES.POST.POINTS, description: `${PREMIUM_PRICES.POST.DESCRIPTION} (${PREMIUM_PRICES.POST.DURATION})`, icon: '🚀', link: '/feed' },
                        { name: 'Anúncio Premium', cost: PREMIUM_PRICES.AD.POINTS, description: `${PREMIUM_PRICES.AD.DESCRIPTION} (${PREMIUM_PRICES.AD.DURATION})`, icon: '⭐', link: '/classificados' }
                      ].map((item, index) => (
                        <Link key={index} href={item.link}>
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-3xl">{item.icon}</span>
                                <Badge variant="outline" className="text-purple-600 border-purple-600">
                                  -{item.cost} pts
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {item.description}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Crown className="h-5 w-5 text-yellow-600" />
                        Loja Premium
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Compre badges exclusivos, recursos especiais e muito mais.
                      </p>
                      <Link href="/confipoints/comprar">
                        <Button className="w-full" variant="outline">
                          Loja Premium
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Send className="h-5 w-5 text-blue-600" />
                        Transferir
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Envie pontos para outros usuários sem taxas.
                      </p>
                      <Link href="/confipoints/transferir">
                        <Button className="w-full" variant="outline">
                          Transferir
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                          Conversão de Pontos
                        </h3>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>100 pontos = R$ 1,00</strong>
                          <br />
                          Use seus pontos na loja, posts premium, curtidas e muito mais!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Histórico */}
              <TabsContent value="historico" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-gray-600" />
                      Todas as Transações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingHistory ? (
                      <TransactionSkeleton />
                    ) : allTransactions.length === 0 ? (
                      <EmptyState
                        icon={<History className="h-12 w-12 text-gray-400" />}
                        title="Nenhuma transação encontrada"
                        description="Você ainda não possui transações de ConfiPoints. Comece a usar a plataforma para ver seu histórico aqui."
                        variant="minimal"
                      />
                    ) : (
                      <>
                        <div className="space-y-3">
                          {allTransactions.slice(0, visibleTransactionsCount).map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  transaction.amount > 0 
                                    ? 'bg-green-100 dark:bg-green-900/20' 
                                    : 'bg-red-100 dark:bg-red-900/20'
                                }`}>
                                  <div className={getTransactionColor(transaction.type, transaction.amount)}>
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {transaction.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDistanceToNow(new Date(transaction.date), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })}
                                    </p>
                                    <Badge 
                                      variant={transaction.status === 'completed' ? 'default' : 'outline'}
                                      className="text-xs"
                                    >
                                      {transaction.status === 'completed' ? 'Concluído' : 
                                       transaction.status === 'pending' ? 'Pendente' : 
                                       transaction.status === 'processing' ? 'Processando' : 
                                       transaction.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-bold ${
                                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('pt-BR')}
                                </p>
                                <p className="text-xs text-gray-500">pontos</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {allTransactions.length > visibleTransactionsCount && (
                          <div className="mt-6 flex justify-center">
                            <Button
                              variant="outline"
                              onClick={() => setVisibleTransactionsCount(prev => Math.min(prev + 10, allTransactions.length))}
                              className="w-full sm:w-auto"
                            >
                              Ver mais ({allTransactions.length - visibleTransactionsCount} restantes)
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        )}
                        {allTransactions.length > 0 && visibleTransactionsCount >= allTransactions.length && (
                          <div className="mt-6 flex justify-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Todas as {allTransactions.length} transações foram exibidas
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
