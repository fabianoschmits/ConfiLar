'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch'
import { ReferralBadge } from '@/components/referral/ReferralBadge'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { 
  Users,
  UserCheck,
  ArrowRight,
  Briefcase,
  Star,
  TrendingUp,
  Calendar,
  FileText,
  MapPin,
  Shield,
  Award,
  Eye,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  Search,
  MessageCircle,
  UserPlus,
  Gift,
  Zap
} from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { user, profile } = useAuthContext()
  const t = useTranslations('home')

  // Hook para busca avançada para obter estatísticas reais
  const {
    stats,
    executeSearch
  } = useAdvancedSearch()

  useEffect(() => {
    setMounted(true)
    // Executar busca para carregar estatísticas
    executeSearch()
  }, [executeSearch])

  if (!mounted) {
    return <DashboardSkeleton />
  }



  // Passos para clientes
  const clientSteps = [
    {
      step: 1,
      title: 'Complete seu perfil',
      description: 'Crie um perfil completo para ser encontrado facilmente',
      icon: UserCheck,
      details: ['Dados pessoais', 'Foto de perfil', 'Localização', 'Preferências de serviço']
    },
    {
      step: 2,
      title: 'Busque profissionais',
      description: 'Encontre profissionais qualificados na sua região',
      icon: Search,
      details: ['Filtre por localização', 'Escolha categoria de serviço', 'Veja avaliações reais', 'Compare perfis']
    },
    {
      step: 3,
      title: 'Entre em contato',
      description: 'Converse diretamente com o profissional escolhido',
      icon: MessageCircle,
      details: ['Chat seguro', 'Troca de informações', 'Negocie valores', 'Agende o serviço']
    },
    {
      step: 4,
      title: 'Avalie o serviço',
      description: 'Deixe sua avaliação honesta após o serviço',
      icon: Star,
      details: ['Avalie qualidade', 'Compartilhe experiência', 'Ajude outros clientes', 'Construa confiança']
    }
  ]

  // Passos para profissionais
  const professionalSteps = [
    {
      step: 1,
      title: 'Crie seu portfólio',
      description: 'Mostre seu trabalho e experiência profissional',
      icon: FileText,
      details: ['Adicione fotos do trabalho', 'Descreva seus serviços', 'Defina preços justos', 'Mostre especialidades']
    },
    {
      step: 2,
      title: 'Seja encontrado',
      description: 'Apareça nas buscas dos clientes interessados',
      icon: Eye,
      details: ['Otimize seu perfil', 'Use palavras-chave relevantes', 'Mantenha disponibilidade', 'Responda rapidamente']
    },
    {
      step: 3,
      title: 'Receba propostas',
      description: 'Clientes entrarão em contato com você',
      icon: MessageCircle,
      details: ['Responda mensagens', 'Negocie valores', 'Agende serviços', 'Mantenha comunicação clara']
    },
    {
      step: 4,
      title: 'Construa reputação',
      description: 'Receba avaliações e cresça na plataforma',
      icon: Award,
      details: ['Entregue qualidade', 'Seja pontual', 'Comunique-se bem', 'Peça avaliações honestas']
    }
  ]

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              {t('platform')}
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('welcome')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Estatísticas - Card Compacto */}
          <Card className="mb-8 hover:shadow-xl transition-all duration-300">
            <CardContent className="py-2 px-3 sm:py-3 sm:px-4">
              <div className="flex flex-row items-center justify-around gap-1 sm:gap-2">
                {/* Total de Usuários */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('stats.total')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
                </div>
                
                {/* Profissionais */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('stats.professionals')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats?.professionalsCount || 0}</p>
                </div>
                
                {/* Clientes */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('stats.clients')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats?.clientsCount || 0}</p>
                </div>
                
                {/* Verificados */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('stats.verified')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats?.verifiedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção: Programa de Indicações */}
          <section className="mb-16">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Ícone */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <UserPlus className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center gap-3 justify-center lg:justify-start mb-3">
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                        {t('referralProgram.title')}
                      </h2>
                      <Badge className="bg-green-600 hover:bg-green-700 text-white">
                        {t('referralProgram.new')}
                      </Badge>
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                      {t('referralProgram.description')} 
                      Quanto mais pessoas você indicar, mais badges e benefícios você desbloqueia.
                    </p>

                    {/* Benefícios em Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/30 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Gift className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            Ganhe Pontos
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Até 380 pontos por indicação
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/30 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-600 dark:bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            Badges Exclusivos
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            5 níveis: Bronze ao Diamante
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/30 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            Benefícios VIP
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Destaque e prioridade
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push('/indicacoes')}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Começar a Indicar Agora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>

                  {/* Ilustração de Níveis */}
                  <div className="flex-shrink-0 hidden xl:block">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center mb-1">
                        Níveis Disponíveis
                      </p>
                      <div className="flex gap-2">
                        {[
                          { tier: 'bronze' as const, refs: 1 },
                          { tier: 'silver' as const, refs: 5 },
                          { tier: 'gold' as const, refs: 10 },
                          { tier: 'platinum' as const, refs: 25 },
                          { tier: 'diamond' as const, refs: 50 }
                        ].map((level) => (
                          <div key={level.tier} className="flex flex-col items-center">
                            <ReferralBadge
                              tier={level.tier}
                              totalReferrals={level.refs}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Seção: Para Clientes */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                <Users className="h-4 w-4 mr-2" />
                Para Clientes
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Como Encontrar um Profissional</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Siga estes passos para encontrar o profissional ideal para seu projeto
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {clientSteps.map((step, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <step.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">0{step.step}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Seção: Para Profissionais */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                <Briefcase className="h-4 w-4 mr-2" />
                Para Profissionais
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Como Oferecer Seus Serviços</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Transforme sua experiência em oportunidades de negócio
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {professionalSteps.map((step, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <step.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">0{step.step}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </div>
    </MainLayout>
  )
}