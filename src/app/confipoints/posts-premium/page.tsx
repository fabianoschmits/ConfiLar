'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Crown, 
  Sparkles, 
  Zap, 
  Star,
  TrendingUp,
  Eye,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Info,
  Lightbulb,
  Gift,
  Clock
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { usePoints } from '@/hooks/usePoints'
import Link from 'next/link'

export default function PostsPremiumPage() {
  const { user, profile } = useAuthContext()
  const { balance: pointsData, loading: pointsLoading } = usePoints(user?.id)

  const premiumFeatures = [
    {
      title: 'Destaque Visual',
      description: 'Seu post aparece com bordas douradas e efeitos especiais',
      icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
      benefits: ['Bordas douradas', 'Efeito de brilho', 'Visual diferenciado']
    },
    {
      title: 'Prioridade no Feed',
      description: 'Posts premium aparecem primeiro na timeline',
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      benefits: ['Aparece no topo', 'Maior visibilidade', 'Mais engajamento']
    },
    {
      title: 'Maior Alcance',
      description: 'Seu conteúdo é visto por mais pessoas',
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      benefits: ['5x mais visualizações', 'Maior interação', 'Mais curtidas']
    },
    {
      title: 'Status Premium',
      description: 'Mostra que você investe em qualidade',
      icon: <Crown className="h-5 w-5 text-purple-500" />,
      benefits: ['Credibilidade', 'Status VIP', 'Reconhecimento']
    }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Crie seu Post',
      description: 'Escreva o conteúdo normalmente',
      icon: <FileText className="h-4 w-4" />
    },
    {
      step: 2,
      title: 'Escolha Premium',
      description: 'Clique no botão "Premium" para destacar',
      icon: <Crown className="h-4 w-4" />
    },
    {
      step: 3,
      title: 'Confirme o Pagamento',
      description: '50 pontos são deduzidos automaticamente',
      icon: <Zap className="h-4 w-4" />
    },
    {
      step: 4,
      title: 'Aproveite o Destaque',
      description: 'Seu post fica destacado por 7 dias',
      icon: <Star className="h-4 w-4" />
    }
  ]

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Posts Premium
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Destaque seus posts e aumente sua visibilidade na plataforma
          </p>
        </div>

        {/* Saldo Atual */}
        {user && (
          <Card className="mb-8 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-full">
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
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    <Gift className="h-4 w-4 mr-2" />
                    Comprar Pontos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefícios */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {feature.description}
                    </p>
                    <div className="space-y-1">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
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

        {/* Como Funciona */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Como Funciona
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

        {/* Informações Importantes */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Duração do Destaque
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">7 dias de destaque premium</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Aparece primeiro no feed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Visual diferenciado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Custo e Benefícios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">50 pontos por post premium</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">5x mais visibilidade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Maior engajamento</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-700">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Pronto para criar seu primeiro post premium?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece a destacar seu conteúdo agora mesmo!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/feed">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Criar Post Premium
                </Button>
              </Link>
              <Link href="/confipoints/loja">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20">
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
