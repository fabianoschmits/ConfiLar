'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { 
  Search,
  Users,
  UserCheck,
  MessageCircle,
  ArrowRight,
  Briefcase,
  Star,
  TrendingUp,
  Calendar,
  FileText,
  MapPin,
  Shield,
  Award,
  Heart,
  Eye,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, profile } = useAuthContext()

  const handleNavigateTo = (path: string) => {
    console.log('🔄 Navegando para:', path)
    router.push(path)
  }

  // Estatísticas mockadas
  const stats = {
    totalUsers: 1250,
    totalServices: 340,
    completedJobs: 890,
    averageRating: 4.8
  }

  // Cards de ação rápida
  const quickActions = [
    {
      title: 'Buscar Profissionais',
      description: 'Encontre profissionais qualificados',
      icon: Search,
      href: '/buscar',
      color: 'blue'
    },
    {
      title: 'Classificados',
      description: 'Veja ofertas e solicitações',
      icon: Briefcase,
      href: '/classificados',
      color: 'green'
    },
    {
      title: 'Mensagens',
      description: 'Converse com profissionais',
      icon: MessageCircle,
      href: '/mensagens',
      color: 'purple'
    },
    {
      title: 'Favoritos',
      description: 'Profissionais salvos',
      icon: Heart,
      href: '/favoritos',
      color: 'red'
    }
  ]

  // Passos para clientes
  const clientSteps = [
    {
      step: 1,
      title: 'Complete seu perfil',
      description: 'Mantenha seus dados atualizados para melhor experiência',
      icon: UserCheck,
      details: ['Informações pessoais', 'Foto profissional', 'Localização', 'Preferências']
    },
    {
      step: 2,
      title: 'Busque profissionais',
      description: 'Use filtros para encontrar o profissional ideal',
      icon: Search,
      details: ['Filtre por localização', 'Escolha a categoria', 'Veja avaliações', 'Compare perfis']
    },
    {
      step: 3,
      title: 'Entre em contato',
      description: 'Converse diretamente com o profissional',
      icon: MessageCircle,
      details: ['Chat integrado', 'Troca de informações', 'Negocie valores', 'Agende serviços']
    },
    {
      step: 4,
      title: 'Avalie o serviço',
      description: 'Deixe sua avaliação após o serviço',
      icon: Star,
      details: ['Avalie qualidade', 'Compartilhe experiência', 'Ajude outros usuários', 'Construa reputação']
    }
  ]

  // Passos para profissionais
  const professionalSteps = [
    {
      step: 1,
      title: 'Crie seu portfólio',
      description: 'Mostre seu trabalho e experiência',
      icon: FileText,
      details: ['Adicione fotos', 'Descreva serviços', 'Defina preços', 'Mostre especialidades']
    },
    {
      step: 2,
      title: 'Seja encontrado',
      description: 'Apareça nas buscas dos clientes',
      icon: Eye,
      details: ['Otimize seu perfil', 'Use palavras-chave', 'Mantenha disponibilidade', 'Responda rapidamente']
    },
    {
      step: 3,
      title: 'Receba propostas',
      description: 'Clientes entrarão em contato com você',
      icon: MessageCircle,
      details: ['Responda mensagens', 'Negocie valores', 'Agende serviços', 'Mantenha comunicação']
    },
    {
      step: 4,
      title: 'Construa reputação',
      description: 'Receba avaliações e cresça na plataforma',
      icon: Award,
      details: ['Entregue qualidade', 'Seja pontual', 'Comunique-se bem', 'Peça avaliações']
    }
  ]

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Plataforma ConfiLar
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Como Funciona o ConfiLar
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conectamos clientes e profissionais de forma segura e confiável. 
              Aprenda como usar nossa plataforma para encontrar os melhores profissionais ou oferecer seus serviços.
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Usuários</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Serviços</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Serviços Concluídos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedJobs.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => handleNavigateTo(action.href)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-${action.color}-100`}>
                        <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Seção: Para Clientes */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                <Users className="h-4 w-4 mr-2" />
                Para Clientes
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Encontrar um Profissional</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                      <div className="text-2xl font-bold text-gray-900">0{step.step}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{step.description}</p>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Oferecer Seus Serviços</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                      <div className="text-2xl font-bold text-gray-900">0{step.step}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{step.description}</p>
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

          {/* Call to Action */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Junte-se a milhares de usuários que já encontraram seus profissionais ideais
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => handleNavigateTo('/buscar')}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Buscar Profissionais
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => handleNavigateTo('/auth')}
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    <UserCheck className="h-5 w-5 mr-2" />
                    Criar Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}