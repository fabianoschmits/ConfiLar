'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Coins, 
  Trophy, 
  Target, 
  TrendingUp, 
  Gift, 
  Zap, 
  Star,
  Users,
  Heart,
  MessageCircle,
  Calendar,
  Briefcase,
  Award,
  History,
  BarChart3,
  TestTube,
  ChevronRight,
  CheckCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Gift as GiftIcon,
  Sparkles,
  Crown,
  Gem,
  Diamond
} from 'lucide-react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'

export default function ConfiPointsPage() {
  const { user } = useAuthContext()

  const levels = [
    { name: 'Bronze', min: 0, color: '#CD7F32', icon: '🟤', description: 'Iniciante' },
    { name: 'Silver', min: 500, color: '#C0C0C0', icon: '⚪', description: 'Ativo' },
    { name: 'Gold', min: 2000, color: '#FFD700', icon: '🟡', description: 'Engajado' },
    { name: 'Platinum', min: 5000, color: '#E5E4E2', icon: '⚪', description: 'Premium' },
    { name: 'Diamond', min: 10000, color: '#B9F2FF', icon: '💎', description: 'Elite' }
  ]

  const earningMethods = [
    {
      category: 'Sistema de Referral',
      color: 'green',
      icon: <Users className="w-5 h-5" />,
      methods: [
        { action: 'Pessoa indicada se cadastrou', points: 200, limit: 'Sem limite' },
        { action: 'Pessoa indicada completou perfil', points: 150, limit: 'Sem limite' },
        { action: 'Pessoa indicada fez primeiro post', points: 100, limit: 'Sem limite' },
        { action: 'Pessoa indicada fez primeira avaliação', points: 100, limit: 'Sem limite' },
        { action: 'Pessoa indicada ativa por 30 dias', points: 300, limit: 'Sem limite' }
      ]
    },
    {
      category: 'Sistema de Curtidas',
      color: 'blue',
      icon: <Heart className="w-5 h-5" />,
      methods: [
        { action: 'Receber curtida em post', points: 2, limit: '500/dia' },
        { action: 'Curtir um post', points: -2, limit: '500/dia' },
        { action: 'Receber comentário em post', points: 5, limit: '200/dia' },
        { action: 'Comentar um post', points: -1, limit: '200/dia' }
      ]
    },
    {
      category: 'Sistema de Atividade',
      color: 'purple',
      icon: <Zap className="w-5 h-5" />,
      methods: [
        { action: 'Login diário', points: 10, limit: '1x/dia' },
        { action: 'Completar perfil 100%', points: 150, limit: '1x' },
        { action: 'Primeiro post no feed', points: 50, limit: '1x' },
        { action: 'Criar anúncio de serviço', points: 100, limit: '10x/dia' }
      ]
    }
  ]

  const futureFeatures = [
    {
      phase: 'Fase 2 - Sistema de Economia',
      status: 'Em desenvolvimento',
      features: [
        'Loja de pontos (compra com PIX)',
        'Conversão de pontos para dinheiro',
        'Sistema de níveis avançado',
        'Gamificação completa'
      ]
    },
    {
      phase: 'Fase 3 - Gamificação',
      status: 'Planejado',
      features: [
        'Missões e badges especiais',
        'Anúncios premium com pontos',
        'Microtransações',
        'Analytics avançado'
      ]
    },
    {
      phase: 'Fase 4 - Monetização',
      status: 'Futuro',
      features: [
        'Sistema de assinatura premium',
        'Marketplace de pontos',
        'Programa de afiliados',
        'Economia sustentável'
      ]
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
                    Sistema de pontos e gamificação do ConfiLar
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="earning">Como Ganhar</TabsTrigger>
                <TabsTrigger value="levels">Níveis</TabsTrigger>
                <TabsTrigger value="future">Futuro</TabsTrigger>
              </TabsList>

              {/* Visão Geral */}
              <TabsContent value="overview" className="space-y-6">
                {/* O que é ConfiPoints */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-600" />
                      O que é ConfiPoints?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      ConfiPoints é o sistema de pontos e gamificação do ConfiLar. 
                      Ganhe pontos através de atividades, interações e indicações, 
                      suba de nível e participe do ranking global!
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Pontos</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ganhe pontos por atividades
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Níveis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Bronze → Silver → Gold → Platinum → Diamond
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Ranking</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Compete com outros usuários
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Benefícios */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-green-600" />
                      Benefícios do Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Para Usuários</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Gamificação e progressão</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Recompensas por atividades</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Competição saudável</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Histórico transparente</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Para a Plataforma</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Maior engajamento</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Retenção de usuários</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Viralização por indicações</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Base para monetização</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações Rápidas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      Ações Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link href="/confipoints/dashboard">
                        <Button className="w-full justify-start" variant="outline">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Ver Meus Pontos
                        </Button>
                      </Link>
                      <Link href="/confipoints/ranking">
                        <Button className="w-full justify-start" variant="outline">
                          <Trophy className="w-4 h-4 mr-2" />
                          Ver Ranking
                        </Button>
                      </Link>
                      <Link href="/teste-pontos">
                        <Button className="w-full justify-start" variant="outline">
                          <TestTube className="w-4 h-4 mr-2" />
                          Testar Sistema
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Como Ganhar */}
              <TabsContent value="earning" className="space-y-6">
                {earningMethods.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {category.icon}
                        <span className={`text-${category.color}-600 dark:text-${category.color}-400`}>
                          {category.category}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.methods.map((method, methodIndex) => (
                          <div key={methodIndex} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {method.action}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Limite: {method.limit}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${
                                method.points > 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {method.points > 0 ? '+' : ''}{method.points}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">pontos</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Níveis */}
              <TabsContent value="levels" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      Sistema de Níveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {levels.map((level, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-2xl">{level.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {level.name}
                              </h3>
                              <Badge variant="outline" style={{ color: level.color }}>
                                {level.description}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A partir de {level.min.toLocaleString()} pontos
                            </p>
                            {index < levels.length - 1 && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  <span>Progresso para {levels[index + 1].name}</span>
                                  <span>{level.min} / {levels[index + 1].min}</span>
                                </div>
                                <Progress 
                                  value={(level.min / levels[index + 1].min) * 100} 
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Futuro */}
              <TabsContent value="future" className="space-y-6">
                {futureFeatures.map((phase, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        {phase.phase}
                        <Badge variant="outline" className="ml-auto">
                          {phase.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {phase.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Roadmap Visual */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Roadmap de Desenvolvimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Fase 1 - Sistema Básico</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">✅ Implementado</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Fase 2 - Economia</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">🔄 Em desenvolvimento</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Fase 3 - Gamificação</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">📅 Planejado</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Fase 4 - Monetização</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">📅 Futuro</p>
                        </div>
                      </div>
                    </div>
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
