'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Coins, 
  FileText, 
  Heart, 
  Briefcase,
  Star,
  Zap,
  Gift,
  TrendingUp,
  Users,
  CheckCircle,
  Info,
  ArrowRight
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { usePoints } from '@/hooks/usePoints'
import Link from 'next/link'

export default function UsarPontosPage() {
  const { user, profile } = useAuthContext()
  const { balance: pointsData, loading: pointsLoading } = usePoints(user?.id)

  if (pointsLoading) {
    return (
      <MainLayout requireAuth={true}>
        <DashboardSkeleton />
      </MainLayout>
    )
  }

  const features = [
    {
      id: 'posts-premium',
      title: 'Posts Premium',
      description: 'Destaque seus posts com visual diferenciado e maior alcance',
      cost: 50,
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      benefits: [
        'Visual dourado diferenciado',
        'Prioridade no feed',
        '7 dias de destaque',
        'Maior visibilidade'
      ],
      available: true,
      action: 'Criar Post Premium',
      href: '/feed'
    },
    {
      id: 'curtidas-premium',
      title: 'Curtidas Premium',
      description: 'Curta posts com pontos e transfira para o autor',
      cost: 5,
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      benefits: [
        'Transfere 5 pontos para o autor',
        'Post fica destacado temporariamente',
        'Mostra engajamento premium',
        'Apoia criadores de conteúdo'
      ],
      available: true,
      action: 'Usar no Feed',
      href: '/feed'
    },
    {
      id: 'anuncios-premium',
      title: 'Anúncios Premium',
      description: 'Destaque seus produtos e serviços nos classificados',
      cost: 200,
      icon: <Briefcase className="w-8 h-8 text-green-500" />,
      benefits: [
        'Visual diferenciado',
        'Prioridade na busca',
        '14 dias de destaque',
        'Maior conversão'
      ],
      available: false,
      action: 'Em Breve',
      href: '/classificados'
    },
    {
      id: 'recompensas',
      title: 'Recompensar Usuários',
      description: 'Recompense usuários por conteúdo criativo e engajamento',
      cost: 10,
      icon: <Gift className="w-8 h-8 text-purple-500" />,
      benefits: [
        'Incentiva conteúdo de qualidade',
        'Aumenta engajamento',
        'Recompensa criatividade',
        'Fortalece comunidade'
      ],
      available: false,
      action: 'Em Breve',
      href: '#'
    }
  ]

  const tips = [
    {
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      title: 'Maximize o Alcance',
      description: 'Posts premium têm 3x mais alcance que posts normais'
    },
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: 'Engaje a Comunidade',
      description: 'Curtidas premium incentivam outros usuários a criar conteúdo'
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      title: 'Seja Reconhecido',
      description: 'Usuários que recebem curtidas premium ganham destaque'
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
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Usar ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Transforme seus pontos em recursos premium
                  </p>
                </div>
              </div>
            </div>

            {/* Saldo Atual */}
            {user && (
              <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <Coins className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Disponível</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {pointsData?.balance || 0} ConfiPoints
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {pointsData?.level || 'Bronze'}
                      </Badge>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Nível VIP
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recursos Disponíveis */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Recursos Premium Disponíveis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <Card 
                    key={feature.id} 
                    className={`hover:shadow-lg transition-all duration-300 ${
                      !feature.available ? 'opacity-60' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {feature.icon}
                          <div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {feature.cost}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ConfiPoints</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Benefícios:
                          </h4>
                          <ul className="space-y-1">
                            {feature.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          {feature.available ? (
                            <Link href={feature.href}>
                              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                {feature.action}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          ) : (
                            <Button 
                              disabled 
                              className="w-full bg-gray-400 cursor-not-allowed"
                            >
                              {feature.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Dicas */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                💡 Dicas para Maximizar seus ConfiPoints
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tips.map((tip, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        {tip.icon}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {tip.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {tip.description}
                          </p>
                        </div>
                      </div>
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
                      Como Funciona
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• ConfiPoints são debitados automaticamente quando você usa um recurso premium</li>
                      <li>• Posts premium ficam destacados por 7 dias</li>
                      <li>• Curtidas premium transferem pontos diretamente para o autor do post</li>
                      <li>• Você pode ver seu histórico de gastos no dashboard</li>
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
