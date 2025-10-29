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
import { usePoints } from '@/hooks/usePoints'
import { 
  usePointsPurchases, 
  usePointsWithdrawals, 
  usePointsTransfers 
} from '@/hooks/useEconomy'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ConfiPointsDashboardPage() {
  const { user, profile } = useAuthContext()
  const { balance, loading: loadingPoints } = usePoints(user?.id)
  const { purchases, loading: loadingPurchases } = usePointsPurchases(user?.id)
  const { withdrawals, loading: loadingWithdrawals } = usePointsWithdrawals(user?.id)
  const { transfers, loading: loadingTransfers } = usePointsTransfers(user?.id)
  
  const [activeTab, setActiveTab] = useState('visao-geral')

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

  // Combinar todas as transações
  const allTransactions = [
    ...(purchases?.map((p: any) => ({
      id: p.id,
      type: 'purchase',
      amount: p.points_amount,
      description: `Compra de ${p.points_amount} pontos`,
      date: p.created_at,
      status: p.status
    })) || []),
    ...(withdrawals?.map((w: any) => ({
      id: w.id,
      type: 'withdrawal',
      amount: -w.points_amount,
      description: `Saque de ${w.points_amount} pontos (R$ ${(w.points_amount / 100).toFixed(2)})`,
      date: w.created_at,
      status: w.status
    })) || []),
    ...(transfers?.map((t: any) => {
      const isSent = t.from_user_id === user?.id
      return {
        id: t.id,
        type: isSent ? 'transfer_sent' : 'transfer_received',
        amount: isSent ? -t.amount : t.amount,
        description: isSent 
          ? `Transferência para ${t.to_user?.full_name || 'Usuário'}`
          : `Recebido de ${t.from_user?.full_name || 'Usuário'}`,
        date: t.created_at,
        status: 'completed'
      }
    }) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingBag className="h-4 w-4" />
      case 'withdrawal': return <Wallet className="h-4 w-4" />
      case 'transfer_sent': return <Send className="h-4 w-4" />
      case 'transfer_received': return <Gift className="h-4 w-4" />
      default: return <Coins className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-600'
      case 'withdrawal': return 'text-red-600'
      case 'transfer_sent': return 'text-orange-600'
      case 'transfer_received': return 'text-green-600'
      default: return 'text-gray-600'
    }
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
                            <ShoppingBag className="h-4 w-4" />
                            Comprar Pontos
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
                      <Link href="/confipoints/saque">
                        <Button className="w-full justify-between" variant="outline">
                          <span className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Sacar Pontos
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/confipoints/loja">
                        <Button className="w-full justify-between" variant="outline">
                          <span className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Loja Premium
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
                        { name: 'Curtida Premium', cost: 5, description: 'Curtida com destaque especial', icon: '💎', link: '/feed' },
                        { name: 'Comentário Premium', cost: 10, description: 'Comentário destacado no topo', icon: '💬', link: '/feed' },
                        { name: 'Post Premium', cost: 50, description: 'Destaque por 7 dias no feed', icon: '🚀', link: '/feed' },
                        { name: 'Anúncio Premium', cost: 200, description: 'Destaque por 30 dias', icon: '⭐', link: '/classificados' }
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
                      <Link href="/confipoints/loja">
                        <Button className="w-full" variant="outline">
                          Ver Loja
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Wallet className="h-5 w-5 text-green-600" />
                        Sacar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Converta seus pontos em dinheiro real via PIX.
                      </p>
                      <Link href="/confipoints/saque">
                        <Button className="w-full" variant="outline">
                          Sacar
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
                          Saque mínimo: 10.000 pontos (R$ 100,00)
                          <br />
                          Taxa de saque: 5%
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
                    {(loadingPurchases || loadingWithdrawals || loadingTransfers) ? (
                      <p className="text-center py-8 text-gray-500">Carregando...</p>
                    ) : allTransactions.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        Nenhuma transação ainda
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {allTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transaction.amount > 0 
                                  ? 'bg-green-100 dark:bg-green-900/20' 
                                  : 'bg-red-100 dark:bg-red-900/20'
                              }`}>
                                <div className={getTransactionColor(transaction.type)}>
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
