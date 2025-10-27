'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Crown, 
  Coins, 
  Star, 
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  Gift
} from 'lucide-react'
import { usePointsStore } from '@/hooks/useEconomy'
import { usePoints } from '@/hooks/usePoints'
import { useAuthContext } from '@/contexts/AuthContext'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function LojaPremiumPage() {
  const { user } = useAuthContext()
  const { items, myPurchases: purchases, loading, purchaseItem, isPurchasing } = usePointsStore(user?.id)
  const { balance } = usePoints(user?.id)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const handlePurchase = async (itemId: string) => {
    try {
      setSelectedItem(itemId)
      await purchaseItem(itemId)
      toast.success('Item comprado com sucesso!')
      setSelectedItem(null)
    } catch (error: any) {
      console.error('Erro ao comprar item:', error)
      toast.error(error.message || 'Erro ao processar compra')
      setSelectedItem(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'boost':
        return <Zap className="w-5 h-5" />
      case 'badge':
        return <Star className="w-5 h-5" />
      case 'feature':
        return <Crown className="w-5 h-5" />
      case 'visibility':
        return <Eye className="w-5 h-5" />
      default:
        return <Gift className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'boost':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'badge':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20'
      case 'feature':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
      case 'visibility':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'boost':
        return 'Impulso'
      case 'badge':
        return 'Emblema'
      case 'feature':
        return 'Recurso'
      case 'visibility':
        return 'Visibilidade'
      default:
        return category
    }
  }

  const groupedItems = items.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  if (loading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="container py-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center animate-pulse">
                    <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Loja Premium
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Carregando itens...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Loja Premium
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Itens exclusivos e benefícios especiais
                  </p>
                </div>
              </div>
            </div>

            {/* Saldo Atual */}
            {balance && (
              <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Seu saldo
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {balance.balance.toLocaleString()} pontos
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                      Nível {balance.level}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Itens por Categoria */}
            {Object.entries(groupedItems).map(([category, categoryItems]: [string, any]) => (
              <div key={category} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getCategoryColor(category))}>
                    {getCategoryIcon(category)}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getCategoryName(category)}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map((item: any) => {
                    const userHasItem = purchases?.some(
                      (p: any) => p.item_id === item.id && 
                      (!p.expires_at || new Date(p.expires_at) > new Date())
                    )

                    return (
                      <Card 
                        key={item.id}
                        className={cn(
                          "relative overflow-hidden transition-all duration-200",
                          userHasItem && "border-2 border-green-400 dark:border-green-600"
                        )}
                      >
                        {userHasItem && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-green-500 text-white px-3 py-1 rounded-bl-lg flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span className="text-xs font-bold">ATIVO</span>
                            </div>
                          </div>
                        )}

                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-lg">{item.name}</span>
                            {item.duration_days && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.duration_days}d
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Descrição */}
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>

                          {/* Ícone/Visual */}
                          {item.icon_url && (
                            <div className="flex justify-center">
                              <img 
                                src={item.icon_url} 
                                alt={item.name}
                                className="w-16 h-16 object-contain"
                              />
                            </div>
                          )}

                          {/* Preço */}
                          <div className="text-center py-3">
                            <div className="flex items-center justify-center gap-2">
                              <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {item.points_price.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              pontos
                            </p>
                          </div>

                          {/* Botão de Compra */}
                          <Button
                            onClick={() => handlePurchase(item.id)}
                            disabled={isPurchasing || userHasItem || (balance && balance.balance < item.points_price)}
                            className={cn(
                              "w-full",
                              userHasItem 
                                ? "bg-gray-400 cursor-not-allowed" 
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            )}
                          >
                            {isPurchasing && selectedItem === item.id ? (
                              <>
                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processando...
                              </>
                            ) : userHasItem ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Já Possui
                              </>
                            ) : (
                              <>
                                <Crown className="w-4 h-4 mr-2" />
                                Comprar
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Meus Itens Ativos */}
            {purchases && purchases.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Meus Itens Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchases
                      .filter((p: any) => !p.expires_at || new Date(p.expires_at) > new Date())
                      .map((purchase: any) => (
                        <div 
                          key={purchase.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/10"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {purchase.item?.name || 'Item'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Comprado em {new Date(purchase.purchased_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            {purchase.expires_at ? (
                              <>
                                <Badge variant="outline" className="text-yellow-700 dark:text-yellow-300">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Expira em {new Date(purchase.expires_at).toLocaleDateString('pt-BR')}
                                </Badge>
                              </>
                            ) : (
                              <Badge variant="default" className="bg-green-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Permanente
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações */}
            <Alert className="mt-8 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <AlertDescription className="text-purple-800 dark:text-purple-200">
                <strong className="block mb-2">Sobre os itens premium:</strong>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Alguns itens têm duração temporária</li>
                  <li>Itens permanentes ficam ativos para sempre</li>
                  <li>Novos itens são adicionados regularmente</li>
                  <li>Itens ativos aparecem no seu perfil</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
