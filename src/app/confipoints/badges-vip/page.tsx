'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Award, 
  Crown, 
  Sparkles, 
  Zap, 
  Star,
  TrendingUp,
  Eye,
  Users,
  CheckCircle,
  ArrowRight,
  Info,
  Lightbulb,
  Gift,
  Clock,
  Target,
  DollarSign,
  Shield,
  Gem,
  Trophy,
  Medal
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePoints } from '@/hooks/usePoints'
import Link from 'next/link'

export default function BadgesVipPage() {
  const { user, profile } = useAuthContext()
  const { balance: pointsData, loading: pointsLoading } = usePoints(user?.id)

  const vipBadges = [
    {
      id: 'bronze',
      name: 'Bronze VIP',
      description: 'Primeiro nível VIP - Acesso básico aos recursos premium',
      icon: <Medal className="h-6 w-6 text-orange-500" />,
      color: 'from-orange-400 to-orange-500',
      requirements: '100 pontos gastos',
      benefits: [
        'Badge Bronze no perfil',
        'Acesso a recursos básicos premium',
        'Suporte prioritário',
        'Desconto de 5% na loja'
      ],
      price: 100,
      unlocked: false
    },
    {
      id: 'silver',
      name: 'Silver VIP',
      description: 'Segundo nível VIP - Recursos intermediários premium',
      icon: <Award className="h-6 w-6 text-gray-400" />,
      color: 'from-gray-300 to-gray-400',
      requirements: '500 pontos gastos',
      benefits: [
        'Badge Silver no perfil',
        'Acesso a recursos intermediários',
        'Suporte VIP',
        'Desconto de 10% na loja',
        'Posts premium ilimitados'
      ],
      price: 500,
      unlocked: false
    },
    {
      id: 'gold',
      name: 'Gold VIP',
      description: 'Terceiro nível VIP - Recursos avançados premium',
      icon: <Crown className="h-6 w-6 text-yellow-500" />,
      color: 'from-yellow-400 to-yellow-500',
      requirements: '1.000 pontos gastos',
      benefits: [
        'Badge Gold no perfil',
        'Acesso a todos os recursos',
        'Suporte VIP Premium',
        'Desconto de 15% na loja',
        'Posts e anúncios premium ilimitados',
        'Acesso antecipado a novas funcionalidades'
      ],
      price: 1000,
      unlocked: false
    },
    {
      id: 'diamond',
      name: 'Diamond VIP',
      description: 'Nível máximo VIP - Todos os recursos e benefícios',
      icon: <Gem className="h-6 w-6 text-blue-500" />,
      color: 'from-blue-400 to-blue-500',
      requirements: '2.500 pontos gastos',
      benefits: [
        'Badge Diamond no perfil',
        'Acesso completo a tudo',
        'Suporte VIP Diamond',
        'Desconto de 20% na loja',
        'Recursos ilimitados',
        'Acesso exclusivo a eventos',
        'Prioridade máxima em tudo'
      ],
      price: 2500,
      unlocked: false
    }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Gaste Pontos',
      description: 'Use seus ConfiPoints em posts e anúncios premium',
      icon: <Zap className="h-4 w-4" />
    },
    {
      step: 2,
      title: 'Acumule Gastos',
      description: 'Seus gastos são contabilizados automaticamente',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      step: 3,
      title: 'Desbloqueie Badges',
      description: 'Alcance os requisitos para novos níveis VIP',
      icon: <Award className="h-4 w-4" />
    },
    {
      step: 4,
      title: 'Aproveite Benefícios',
      description: 'Use seus privilégios VIP na plataforma',
      icon: <Crown className="h-4 w-4" />
    }
  ]

  const currentLevel = vipBadges.find(badge => badge.unlocked) || vipBadges[0]
  const nextLevel = vipBadges.find(badge => !badge.unlocked && badge.price > (pointsData?.balance || 0))

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
              Badges VIP
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Desbloqueie níveis VIP e aproveite benefícios exclusivos
          </p>
        </div>

        {/* Saldo Atual */}
        {user && (
          <Card className="mb-8 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-300 dark:border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-full">
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
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    <Gift className="h-4 w-4 mr-2" />
                    Comprar Pontos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Atual */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              Seu Status VIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 bg-gradient-to-r ${currentLevel.color} rounded-full`}>
                {currentLevel.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentLevel.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentLevel.description}
                </p>
              </div>
            </div>
            
            {nextLevel && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Próximo nível: {nextLevel.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {nextLevel.price - (pointsData?.balance || 0)} pontos restantes
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, ((pointsData?.balance || 0) / nextLevel.price) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges Disponíveis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {vipBadges.map((badge, index) => (
            <Card key={badge.id} className={`hover:shadow-lg transition-shadow ${
              badge.unlocked ? 'ring-2 ring-green-500' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-gradient-to-r ${badge.color} rounded-full`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {badge.name}
                      </h3>
                      {badge.unlocked && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Desbloqueado
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {badge.description}
                    </p>
                    <div className="space-y-1 mb-4">
                      {badge.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Requisito: {badge.requirements}
                      </span>
                      {!badge.unlocked && (
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          {badge.price} pontos
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Como Funciona */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-500" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {howItWorks.map((step, index) => (
                <div key={step.step} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
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

        {/* Benefícios VIP */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Benefícios Exclusivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Suporte prioritário</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Descontos na loja</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Recursos ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Acesso antecipado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-purple-500" />
                Status e Reconhecimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Badge exclusivo no perfil</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Reconhecimento da comunidade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Prioridade em rankings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Eventos exclusivos</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-300 dark:border-purple-700">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Comece sua jornada VIP hoje!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Use seus ConfiPoints para desbloquear benefícios exclusivos
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/feed">
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  Criar Post Premium
                </Button>
              </Link>
              <Link href="/classificados">
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                  <Award className="h-4 w-4 mr-2" />
                  Criar Anúncio Premium
                </Button>
              </Link>
              <Link href="/confipoints/loja">
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20">
                  <Gift className="h-4 w-4 mr-2" />
                  Comprar Pontos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
