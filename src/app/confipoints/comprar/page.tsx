'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Coins, 
  CreditCard, 
  CheckCircle,
  Star,
  Zap,
  Crown,
  Gift,
  TrendingUp,
  Info,
  Heart
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { usePoints } from '@/hooks/usePoints'

export default function ComprarPontosPage() {
  const { user, profile } = useAuthContext()
  const { balance: pointsData, loading: pointsLoading } = usePoints(user?.id)

  if (pointsLoading) {
    return (
      <MainLayout requireAuth={true}>
        <DashboardSkeleton />
      </MainLayout>
    )
  }

  const packages = [
    {
      id: 'starter',
      name: 'Pacote Iniciante',
      points: 100,
      price: 'R$ 10,00',
      bonus: 0,
      popular: false,
      description: 'Perfeito para começar',
      features: ['100 ConfiPoints', 'Posts premium básicos', 'Curtidas premium']
    },
    {
      id: 'popular',
      name: 'Pacote Popular',
      points: 500,
      price: 'R$ 45,00',
      bonus: 50,
      popular: true,
      description: 'Mais vendido',
      features: ['500 ConfiPoints', '+50 pontos bônus', 'Posts premium', 'Curtidas premium', 'Suporte prioritário']
    },
    {
      id: 'professional',
      name: 'Pacote Profissional',
      points: 1000,
      price: 'R$ 80,00',
      bonus: 200,
      popular: false,
      description: 'Para profissionais',
      features: ['1000 ConfiPoints', '+200 pontos bônus', 'Todos os recursos', 'Suporte VIP', 'Badge especial']
    },
    {
      id: 'enterprise',
      name: 'Pacote Empresarial',
      points: 2500,
      price: 'R$ 180,00',
      bonus: 750,
      popular: false,
      description: 'Para empresas',
      features: ['2500 ConfiPoints', '+750 pontos bônus', 'Recursos empresariais', 'Suporte dedicado', 'Relatórios avançados']
    }
  ]

  const benefits = [
    {
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      title: 'Posts Premium',
      description: 'Destaque seus posts com visual diferenciado e maior alcance'
    },
    {
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      title: 'Curtidas Premium',
      description: 'Curta posts com pontos e transfira para o autor'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: 'Maior Engajamento',
      description: 'Aumente o engajamento da sua comunidade'
    },
    {
      icon: <Gift className="w-6 h-6 text-blue-500" />,
      title: 'Recompensas',
      description: 'Recompense usuários por conteúdo criativo'
    }
  ]

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Comprar ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Adquira pontos para usar no ConfiLar
                  </p>
                </div>
              </div>
            </div>

            {/* Saldo Atual */}
            {user && (
              <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                        <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Atual</p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                          {pointsData?.balance || 0} ConfiPoints
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      {pointsData?.level || 'Bronze'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefícios */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                O que você pode fazer com ConfiPoints?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-3">
                        {benefit.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pacotes */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Escolha seu pacote
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.map((pkg) => (
                  <Card 
                    key={pkg.id} 
                    className={`relative hover:shadow-xl transition-all duration-300 ${
                      pkg.popular 
                        ? 'ring-2 ring-green-500 shadow-lg scale-105' 
                        : 'hover:scale-105'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-green-500 text-white px-3 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Mais Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {pkg.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pkg.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="text-center">
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {pkg.price}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Coins className="w-5 h-5 text-yellow-500" />
                          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            {pkg.points} ConfiPoints
                          </span>
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              +{pkg.bonus} pontos bônus
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <ul className="text-left space-y-2 mb-6">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full ${
                          pkg.popular 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        onClick={() => {
                          // TODO: Implementar integração com gateway de pagamento
                          alert(`Compra do ${pkg.name} será implementada em breve!`)
                        }}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Comprar Agora
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Informações Adicionais */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Informações Importantes
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• ConfiPoints não expiram e podem ser usados a qualquer momento</li>
                      <li>• Todos os pagamentos são processados de forma segura</li>
                      <li>• Você pode transferir pontos para outros usuários</li>
                      <li>• Suporte 24/7 para dúvidas sobre compras</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
