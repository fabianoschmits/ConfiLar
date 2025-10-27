'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
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
  Clock,
  Target,
  DollarSign
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePoints } from '@/hooks/usePoints'
import Link from 'next/link'

export default function AnunciosPremiumPage() {
  const { user, profile } = useAuthContext()
  const { balance: pointsData, loading: pointsLoading } = usePoints(user?.id)

  const premiumFeatures = [
    {
      title: 'Destaque Visual',
      description: 'Seu anúncio aparece com bordas douradas e efeitos especiais',
      icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
      benefits: ['Bordas douradas', 'Efeito de brilho', 'Visual diferenciado']
    },
    {
      title: 'Prioridade na Listagem',
      description: 'Anúncios premium aparecem primeiro nos resultados',
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      benefits: ['Aparece no topo', 'Maior visibilidade', 'Mais cliques']
    },
    {
      title: 'Maior Alcance',
      description: 'Seu anúncio é visto por mais pessoas interessadas',
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      benefits: ['10x mais visualizações', 'Maior conversão', 'Mais vendas']
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
      title: 'Crie seu Anúncio',
      description: 'Preencha os dados do seu produto/serviço',
      icon: <Briefcase className="h-4 w-4" />
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
      description: '200 pontos são deduzidos automaticamente',
      icon: <Zap className="h-4 w-4" />
    },
    {
      step: 4,
      title: 'Aproveite o Destaque',
      description: 'Seu anúncio fica destacado por 14 dias',
      icon: <Star className="h-4 w-4" />
    }
  ]

  const categories = [
    { name: 'Produtos', icon: <Gift className="h-4 w-4" />, count: '1.2k+' },
    { name: 'Serviços', icon: <Briefcase className="h-4 w-4" />, count: '850+' },
    { name: 'Imóveis', icon: <Target className="h-4 w-4" />, count: '320+' },
    { name: 'Veículos', icon: <Zap className="h-4 w-4" />, count: '180+' },
    { name: 'Emprego', icon: <Users className="h-4 w-4" />, count: '95+' },
    { name: 'Outros', icon: <Star className="h-4 w-4" />, count: '420+' }
  ]

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent">
              Anúncios Premium
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Destaque seus produtos e serviços para aumentar suas vendas
          </p>
        </div>

        {/* Saldo Atual */}
        {user && (
          <Card className="mb-8 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 border-green-300 dark:border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-full">
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
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
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
              <Info className="h-5 w-5 text-green-500" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {howItWorks.map((step, index) => (
                <div key={step.step} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
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

        {/* Categorias Populares */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Categorias Mais Procuradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    {category.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.count} anúncios
                    </p>
                  </div>
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
                <span className="text-sm">14 dias de destaque premium</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Aparece primeiro na busca</span>
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
                <DollarSign className="h-5 w-5 text-green-500" />
                Custo e Benefícios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">200 pontos por anúncio premium</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">10x mais visualizações</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Maior taxa de conversão</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 border-green-300 dark:border-green-700">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Pronto para criar seu primeiro anúncio premium?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece a vender mais agora mesmo!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/classificados">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Criar Anúncio Premium
                </Button>
              </Link>
              <Link href="/confipoints/loja">
                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20">
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
