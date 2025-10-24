'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ShoppingCart, 
  Coins, 
  Check, 
  Star, 
  Sparkles,
  AlertCircle,
  CreditCard,
  Gift
} from 'lucide-react'
import { usePointsPackages, usePointsPurchases } from '@/hooks/useEconomy'
import { usePoints } from '@/hooks/usePoints'
import { useAuthContext } from '@/contexts/AuthContext'
import { formatBRL } from '@/types/economy'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function LojaConfiPointsPage() {
  const { user } = useAuthContext()
  const { packages, loading: packagesLoading } = usePointsPackages()
  const { balance } = usePoints(user?.id)
  const { purchases, loading: purchasesLoading, createPurchase, isCreating } = usePointsPurchases(user?.id)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    try {
      setSelectedPackage(packageId)
      
      // Por enquanto, usar método 'pix' (integração será implementada depois)
      await createPurchase({
        package_id: packageId,
        payment_method: 'pix'
      })

      toast.success('Compra criada! A integração de pagamento será implementada em breve.')
      setSelectedPackage(null)
    } catch (error: any) {
      console.error('Erro ao criar compra:', error)
      toast.error(error.message || 'Erro ao processar compra')
      setSelectedPackage(null)
    }
  }

  if (packagesLoading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="container py-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center animate-pulse">
                    <ShoppingCart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Loja de ConfiPoints
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Carregando pacotes...
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
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Loja de ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Compre pontos e aproveite todas as funcionalidades
                  </p>
                </div>
              </div>
            </div>

            {/* Saldo Atual */}
            {balance && (
              <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Seu saldo atual
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {balance.balance.toLocaleString()} pontos
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
                      Nível {balance.level}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aviso sobre integração */}
            <Alert className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Integração de pagamento em desenvolvimento:</strong> A funcionalidade de compra com PIX/Cartão será implementada em breve. Por enquanto, você pode ver os pacotes disponíveis.
              </AlertDescription>
            </Alert>

            {/* Grid de Pacotes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-200",
                    pkg.is_featured && "border-2 border-yellow-400 dark:border-yellow-600 shadow-lg"
                  )}
                >
                  {/* Badge de Destaque */}
                  {pkg.is_featured && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-yellow-400 dark:bg-yellow-600 text-white px-3 py-1 rounded-bl-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">POPULAR</span>
                      </div>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-xl">{pkg.name}</span>
                      {pkg.bonus_percentage > 0 && (
                        <Badge variant="default" className="bg-green-500 text-white">
                          +{pkg.bonus_percentage}%
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Descrição */}
                    {pkg.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pkg.description}
                      </p>
                    )}

                    {/* Pontos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Pontos base:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {pkg.points.toLocaleString()}
                        </span>
                      </div>
                      
                      {pkg.bonus_percentage > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Bônus ({pkg.bonus_percentage}%):
                          </span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            +{(pkg.points * pkg.bonus_percentage / 100).toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            Total:
                          </span>
                          <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                            {pkg.total_points.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preço */}
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatBRL(pkg.price_brl)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(pkg.price_brl / pkg.total_points * 100).toFixed(2)} centavos por ponto
                      </p>
                    </div>

                    {/* Botão de Compra */}
                    <Button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={isCreating}
                      className={cn(
                        "w-full",
                        pkg.is_featured 
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      {isCreating && selectedPackage === pkg.id ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar Agora
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Compras Recentes */}
            {purchases && purchases.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    Minhas Compras Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchases.slice(0, 5).map((purchase: any) => (
                      <div 
                        key={purchase.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {purchase.package?.name || 'Pacote'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                            {purchase.points_received.toLocaleString()} pts
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatBRL(purchase.amount_brl)}
                          </p>
                        </div>
                        <Badge 
                          variant={purchase.status === 'approved' ? 'default' : 'secondary'}
                          className="ml-4"
                        >
                          {purchase.status === 'approved' ? 'Aprovado' : 
                           purchase.status === 'pending' ? 'Pendente' : 
                           purchase.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Sparkles className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Bônus Progressivo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quanto maior o pacote, maior o bônus de pontos!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Pagamento Seguro
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    PIX, Cartão e Boleto (em breve)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Crédito Instantâneo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pontos na conta após confirmação
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
