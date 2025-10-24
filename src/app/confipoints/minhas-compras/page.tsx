'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingBag,
  DollarSign,
  Send,
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Gift,
  Coins
} from 'lucide-react'
import { usePointsPurchases, usePointsWithdrawals, usePointsTransfers, usePointsStore } from '@/hooks/useEconomy'
import { useAuthContext } from '@/contexts/AuthContext'
import { formatBRL } from '@/types/economy'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function MinhasComprasPage() {
  const { user } = useAuthContext()
  const { purchases: pointsPurchases, loading: purchasesLoading } = usePointsPurchases(user?.id)
  const { withdrawals, loading: withdrawalsLoading } = usePointsWithdrawals(user?.id)
  const { transfers, loading: transfersLoading } = usePointsTransfers(user?.id)
  const { myPurchases: storePurchases, loading: storeLoading } = usePointsStore(user?.id)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Clock className="w-3 h-3 mr-1" /> Pendente
        </Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" /> Aprovado
        </Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <Clock className="w-3 h-3 mr-1" /> Processando
        </Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" /> Concluído
        </Badge>
      case 'rejected':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" /> Rejeitado
        </Badge>
      case 'cancelled':
        return <Badge variant="secondary">
          <XCircle className="w-3 h-3 mr-1" /> Cancelado
        </Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Minhas Transações
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Histórico completo de compras, saques e transferências
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="purchases" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 dark:bg-gray-900">
                <TabsTrigger value="purchases" className="dark:data-[state=active]:bg-gray-800">
                  <Coins className="w-4 h-4 mr-2" />
                  Compras de Pontos
                </TabsTrigger>
                <TabsTrigger value="withdrawals" className="dark:data-[state=active]:bg-gray-800">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Saques
                </TabsTrigger>
                <TabsTrigger value="transfers" className="dark:data-[state=active]:bg-gray-800">
                  <Send className="w-4 h-4 mr-2" />
                  Transferências
                </TabsTrigger>
                <TabsTrigger value="store" className="dark:data-[state=active]:bg-gray-800">
                  <Crown className="w-4 h-4 mr-2" />
                  Loja Premium
                </TabsTrigger>
              </TabsList>

              {/* Compras de Pontos */}
              <TabsContent value="purchases">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-600" />
                      Compras de Pontos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {purchasesLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
                      </div>
                    ) : pointsPurchases && pointsPurchases.length > 0 ? (
                      <div className="space-y-3">
                        {pointsPurchases.map((purchase: any) => (
                          <div 
                            key={purchase.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {purchase.package?.name || 'Pacote de Pontos'}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(purchase.created_at).toLocaleDateString('pt-BR')} às {new Date(purchase.created_at).toLocaleTimeString('pt-BR')}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Método: {purchase.payment_method === 'pix' ? 'PIX' : purchase.payment_method === 'credit_card' ? 'Cartão' : 'Boleto'}
                              </p>
                            </div>
                            <div className="text-right mr-4">
                              <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                                +{purchase.points_received.toLocaleString()} pts
                              </p>
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                {formatBRL(purchase.amount_brl)}
                              </p>
                            </div>
                            {getStatusBadge(purchase.status)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Gift className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Você ainda não comprou pontos
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Saques */}
              <TabsContent value="withdrawals">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Saques Realizados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {withdrawalsLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
                      </div>
                    ) : withdrawals && withdrawals.length > 0 ? (
                      <div className="space-y-3">
                        {withdrawals.map((withdrawal: any) => (
                          <div 
                            key={withdrawal.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <p className="font-medium text-gray-900 dark:text-white">
                                  Saque de {withdrawal.points_amount.toLocaleString()} pontos
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(withdrawal.created_at).toLocaleDateString('pt-BR')} às {new Date(withdrawal.created_at).toLocaleTimeString('pt-BR')}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                PIX: {withdrawal.pix_key_type} • {withdrawal.pix_key}
                              </p>
                            </div>
                            <div className="text-right mr-4">
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                {formatBRL(withdrawal.net_amount_brl)}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Taxa: {formatBRL(withdrawal.fee_brl)}
                              </p>
                            </div>
                            {getStatusBadge(withdrawal.status)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <DollarSign className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Você ainda não realizou saques
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transferências */}
              <TabsContent value="transfers">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="w-5 h-5 text-purple-600" />
                      Transferências
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transfersLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
                      </div>
                    ) : transfers && transfers.length > 0 ? (
                      <div className="space-y-3">
                        {transfers.map((transfer: any) => {
                          const isSent = transfer.from_user_id === user?.id
                          const otherUser = isSent ? transfer.to_user : transfer.from_user
                          
                          return (
                            <div 
                              key={transfer.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {isSent ? (
                                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                                ) : (
                                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                )}
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={otherUser?.avatar_url} />
                                  <AvatarFallback>
                                    {otherUser?.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {isSent ? 'Enviado para' : 'Recebido de'} {otherUser?.full_name || 'Usuário'}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(transfer.created_at).toLocaleDateString('pt-BR')} às {new Date(transfer.created_at).toLocaleTimeString('pt-BR')}
                                  </p>
                                  {transfer.message && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                                      "{transfer.message}"
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold text-lg ${isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                  {isSent ? '-' : '+'}{transfer.points_amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  pontos
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Send className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Você ainda não realizou transferências
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Loja Premium */}
              <TabsContent value="store">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-purple-600" />
                      Itens Premium Comprados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {storeLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
                      </div>
                    ) : storePurchases && storePurchases.length > 0 ? (
                      <div className="space-y-3">
                        {storePurchases.map((purchase: any) => {
                          const isActive = !purchase.expires_at || new Date(purchase.expires_at) > new Date()
                          
                          return (
                            <div 
                              key={purchase.id}
                              className={`flex items-center justify-between p-4 rounded-lg border ${
                                isActive 
                                  ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                                  : 'border-gray-200 dark:border-gray-700 opacity-60'
                              }`}
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {purchase.item?.name || 'Item Premium'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Comprado em {new Date(purchase.purchased_at).toLocaleDateString('pt-BR')}
                                </p>
                                {purchase.item?.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {purchase.item.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right mr-4">
                                <p className="font-semibold text-purple-600 dark:text-purple-400">
                                  {purchase.points_spent.toLocaleString()} pts
                                </p>
                                {purchase.expires_at && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {isActive ? 'Expira em' : 'Expirou em'} {new Date(purchase.expires_at).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                              </div>
                              {isActive ? (
                                <Badge variant="default" className="bg-green-500 text-white">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Expirado
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Crown className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Você ainda não comprou itens premium
                        </p>
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
