'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Heart, 
  FileText, 
  Briefcase, 
  Shield, 
  Star,
  TrendingUp,
  Eye,
  Target,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Info,
  Lightbulb,
  Gift,
  Clock,
  DollarSign
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePoints } from '@/hooks/usePoints'
import Link from 'next/link'

export default function SistemaPremiumPage() {
  const { user, profile } = useAuthContext()
  const { balance: pointsData, loading: pointsLoading } = usePoints(user?.id)
  const [activeTab, setActiveTab] = useState('overview')

  const premiumFeatures = [
    {
      id: 'posts-premium',
      title: 'Posts Premium',
      description: 'Crie posts destacados que aparecem primeiro no feed',
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      cost: 50,
      duration: '7 dias',
      benefits: [
        'Aparece no topo do feed',
        'Visual diferenciado com bordas douradas',
        'Maior visibilidade',
        'Efeito de brilho sutil'
      ],
      color: 'blue'
    },
    {
      id: 'ads-premium',
      title: 'Anúncios Premium',
      description: 'Destaque seus anúncios nos classificados',
      icon: <Briefcase className="h-6 w-6 text-emerald-600" />,
      cost: 200,
      duration: '30 dias',
      benefits: [
        'Aparece primeiro nos classificados',
        'Visual premium com efeitos especiais',
        '5x mais visibilidade',
        'Botão de contato destacado'
      ],
      color: 'emerald'
    },
    {
      id: 'likes-premium',
      title: 'Curtidas Premium',
      description: 'Curta posts usando pontos para dar mais destaque',
      icon: <Heart className="h-6 w-6 text-pink-600" />,
      cost: 5,
      duration: 'Instantâneo',
      benefits: [
        'Curtida com pontos',
        'Mostra engajamento premium',
        'Não pode curtir próprio post',
        'Efeito visual diferenciado'
      ],
      color: 'pink'
    }
  ]

  const vipBadges = [
    {
      id: 'bronze',
      name: 'Bronze',
      description: 'Usuário ativo',
      icon: <Award className="h-4 w-4 text-amber-600" />,
      color: 'amber',
      requirements: 'Ativo na plataforma',
      benefits: ['Badge básico', 'Reconhecimento']
    },
    {
      id: 'silver',
      name: 'Prata',
      description: 'Usuário premium',
      icon: <Star className="h-4 w-4 text-gray-400" />,
      color: 'gray',
      requirements: 'Usou recursos premium',
      benefits: ['Badge prata', 'Maior credibilidade']
    },
    {
      id: 'gold',
      name: 'Ouro',
      description: 'Usuário VIP',
      icon: <Crown className="h-4 w-4 text-yellow-500" />,
      color: 'yellow',
      requirements: 'Uso frequente de premium',
      benefits: ['Badge dourado', 'Status VIP', 'Prioridade']
    },
    {
      id: 'diamond',
      name: 'Diamante',
      description: 'Usuário Elite',
      icon: <Sparkles className="h-4 w-4 text-blue-500" />,
      color: 'blue',
      requirements: 'Grande investidor em premium',
      benefits: ['Badge diamante', 'Status Elite', 'Benefícios exclusivos']
    }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Escolha o Recurso',
      description: 'Selecione entre posts, anúncios ou curtidas premium',
      icon: <Target className="h-5 w-5" />
    },
    {
      step: 2,
      title: 'Confirme o Pagamento',
      description: 'Os pontos são deduzidos automaticamente do seu saldo',
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      step: 3,
      title: 'Aproveite o Destaque',
      description: 'Seu conteúdo aparece destacado para todos os usuários',
      icon: <Eye className="h-5 w-5" />
    }
  ]

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                Sistema Premium
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Destaque seu conteúdo e aumente sua visibilidade na plataforma usando ConfiPoints
            </p>
          </div>

          {/* Saldo Atual */}
          {user && (
            <Card className="mb-8 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500 rounded-full">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Seus ConfiPoints</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pointsLoading ? 'Carregando...' : `${pointsData?.balance || 0} pontos disponíveis`}
                      </p>
                    </div>
                  </div>
                  <Link href="/confipoints/loja">
                    <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white">
                      <Gift className="h-4 w-4 mr-2" />
                      Comprar Pontos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="features">Recursos</TabsTrigger>
              <TabsTrigger value="badges">Badges VIP</TabsTrigger>
              <TabsTrigger value="how-it-works">Como Funciona</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Por que ser Premium?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Maior Visibilidade
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Seu conteúdo aparece primeiro no feed e nos classificados, garantindo que mais pessoas vejam seus posts e anúncios.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        Visual Diferenciado
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Posts e anúncios premium têm visual especial com bordas douradas e efeitos sutis que chamam atenção.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        Maior Engajamento
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Conteúdo premium recebe mais curtidas, comentários e interações devido à maior visibilidade.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        Status VIP
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Usuários premium recebem badges especiais que mostram seu status na plataforma.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Posts Premium</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      50 pontos por 7 dias
                    </p>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      Destaque no Feed
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full w-fit mx-auto mb-4">
                      <Briefcase className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Anúncios Premium</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      200 pontos por 30 dias
                    </p>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                      5x Visibilidade
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-full w-fit mx-auto mb-4">
                      <Heart className="h-6 w-6 text-pink-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Curtidas Premium</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      5 pontos por curtida
                    </p>
                    <Badge variant="outline" className="text-pink-600 border-pink-300">
                      Engajamento Premium
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recursos */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid gap-6">
                {premiumFeatures.map((feature) => (
                  <Card key={feature.id} className={`border-${feature.color}-200 dark:border-${feature.color}-800`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-${feature.color}-100 dark:bg-${feature.color}-900/20 rounded-full`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {feature.title}
                            </h3>
                            <Badge className={`bg-${feature.color}-100 text-${feature.color}-700 dark:bg-${feature.color}-900/20 dark:text-${feature.color}-300`}>
                              {feature.cost} pontos
                            </Badge>
                            <Badge variant="outline" className="text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              {feature.duration}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {feature.description}
                          </p>
                          <div className="grid md:grid-cols-2 gap-2">
                            {feature.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {benefit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Badges VIP */}
            <TabsContent value="badges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-500" />
                    Sistema de Badges VIP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Os badges VIP são conquistados através do uso dos recursos premium e mostram seu status na plataforma.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {vipBadges.map((badge) => (
                      <Card key={badge.id} className={`border-${badge.color}-200 dark:border-${badge.color}-800`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 bg-${badge.color}-100 dark:bg-${badge.color}-900/20 rounded-full`}>
                              {badge.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Badge {badge.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {badge.description}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Requisitos:
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {badge.requirements}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Benefícios:
                              </h5>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {badge.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Como Funciona */}
            <TabsContent value="how-it-works" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Como Funciona o Sistema Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {howItWorks.map((step, index) => (
                      <div key={step.step} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {step.step}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {step.icon}
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {step.title}
                            </h4>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {step.description}
                          </p>
                        </div>
                        {index < howItWorks.length - 1 && (
                          <div className="flex-shrink-0 mt-4">
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Como Adquirir Pontos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Comprar na loja ConfiPoints</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Receber de outros usuários</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Participar de promoções</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Conquistar em missões</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Dicas de Uso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Use posts premium para anúncios importantes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Anúncios premium são ideais para serviços</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Curtidas premium aumentam engajamento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Combine recursos para máximo impacto</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="mt-8 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Pronto para ser Premium?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comece a destacar seu conteúdo agora mesmo!
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/confipoints/loja">
                  <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white">
                    <Gift className="h-4 w-4 mr-2" />
                    Comprar Pontos
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/20">
                    <FileText className="h-4 w-4 mr-2" />
                    Criar Post Premium
                  </Button>
                </Link>
                <Link href="/classificados">
                  <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/20">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Criar Anúncio Premium
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
