'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Coins, 
  Target, 
  TrendingUp, 
  Gift, 
  Zap, 
  Star,
  Users,
  Award,
  BarChart3,
  CheckCircle,
  Crown,
  Sparkles,
  Gem,
  Diamond,
  ShoppingCart,
  CreditCard,
  FileText,
  Briefcase,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePoints } from '@/hooks/usePoints'

export default function ConfiPointsPage() {
  const { user, profile } = useAuthContext()
  const { balance: pointsData, loading: pointsLoading } = usePoints(user?.id)

  const premiumFeatures = [
    {
      title: 'Posts Premium',
      description: 'Destaque seus posts com visual diferenciado',
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      cost: '50 pontos',
      benefits: ['Visual diferenciado', 'Prioridade no feed', '7 dias de destaque']
    },
    {
      title: 'Anúncios Premium',
      description: 'Destaque seus produtos e serviços',
      icon: <Briefcase className="w-5 h-5 text-green-500" />,
      cost: '200 pontos',
      benefits: ['Visual diferenciado', 'Prioridade na busca', '14 dias de destaque']
    },
    {
      title: 'Curtidas Premium',
      description: 'Curta posts com pontos e transfira para o autor',
      icon: <Star className="w-5 h-5 text-pink-500" />,
      cost: '5 pontos',
      benefits: ['Transfere pontos', 'Post fica destacado', 'Mostra engajamento']
    }
  ]

  const vipLevels = [
    {
      name: 'Bronze VIP',
      description: 'Primeiro nível VIP',
      icon: <Award className="h-5 w-5 text-orange-500" />,
      requirements: '100 pontos gastos',
      benefits: ['Badge Bronze', 'Suporte prioritário', 'Desconto 5%']
    },
    {
      name: 'Silver VIP',
      description: 'Segundo nível VIP',
      icon: <Award className="h-5 w-5 text-gray-400" />,
      requirements: '500 pontos gastos',
      benefits: ['Badge Silver', 'Suporte VIP', 'Desconto 10%']
    },
    {
      name: 'Gold VIP',
      description: 'Terceiro nível VIP',
      icon: <Crown className="h-5 w-5 text-yellow-500" />,
      requirements: '1.000 pontos gastos',
      benefits: ['Badge Gold', 'Suporte Premium', 'Desconto 15%']
    },
    {
      name: 'Diamond VIP',
      description: 'Nível máximo VIP',
      icon: <Gem className="h-5 w-5 text-blue-500" />,
      requirements: '2.500 pontos gastos',
      benefits: ['Badge Diamond', 'Suporte Diamond', 'Desconto 20%']
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
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Coins className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sistema premium de pontos do ConfiLar
                  </p>
                </div>
              </div>
            </div>

            {/* Saldo do Usuário */}
            {user && (
              <Card className="mb-8 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-500 rounded-full">
                        <Coins className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Seus ConfiPoints
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {pointsLoading ? 'Carregando...' : `${pointsData?.balance || 0} pontos disponíveis`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link href="/confipoints/loja">
                        <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Comprar Pontos
                        </Button>
                      </Link>
                      <Link href="/confipoints/dashboard">
                        <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/20">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Ver Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

                {/* O que é ConfiPoints */}
            <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-600" />
                      O que é ConfiPoints?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                  ConfiPoints é o sistema premium de pontos do ConfiLar. Com seus pontos, você pode 
                  destacar posts, criar anúncios premium, curtir com pontos e desbloquear níveis VIP 
                  com benefícios exclusivos!
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Posts Premium</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                      Destaque seus posts
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Briefcase className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Anúncios Premium</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Destaque seus produtos
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Níveis VIP</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                      Desbloqueie benefícios
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

            {/* Recursos Premium */}
            <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Recursos Premium Disponíveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {feature.description}
                          </p>
                          <div className="space-y-1 mb-3">
                            {feature.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {benefit}
                                </span>
                              </div>
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {feature.cost}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Níveis VIP */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Sistema de Níveis VIP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vipLevels.map((level, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                          {level.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {level.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {level.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Requisito: {level.requirements}
                          </p>
                          <div className="space-y-1">
                            {level.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {benefit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Ações Rápidas */}
            <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      Ações Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/feed">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Criar Post Premium
                    </Button>
                  </Link>
                  <Link href="/classificados">
                        <Button className="w-full justify-start" variant="outline">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Criar Anúncio Premium
                        </Button>
                      </Link>
                  <Link href="/confipoints/loja">
                        <Button className="w-full justify-start" variant="outline">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Comprar Pontos
                        </Button>
                      </Link>
                  <Link href="/confipoints/dashboard">
                        <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Ver Dashboard
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

            {/* Informações Importantes */}
            <Card className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500 rounded-full">
                    <Info className="h-5 w-5 text-white" />
                            </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Como Funciona o Sistema Premium
                              </h3>
                    <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>• <strong>Compre pontos</strong> na loja usando PIX ou cartão</p>
                      <p>• <strong>Use os pontos</strong> para destacar posts e anúncios</p>
                      <p>• <strong>Ganhe pontos</strong> através do sistema de indicações</p>
                      <p>• <strong>Desbloqueie níveis VIP</strong> gastando pontos em recursos premium</p>
                      <p>• <strong>Aproveite benefícios exclusivos</strong> conforme seu nível VIP</p>
                        </div>
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