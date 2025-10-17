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
  MessageCircle
} from 'lucide-react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { user, profile } = useAuthContext()

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
    return null
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Plataforma ConfiLar
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Bem-vindo ao ConfiLar
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A plataforma que conecta clientes e profissionais de forma segura e confiável. 
              Encontre os melhores profissionais ou ofereça seus serviços com total transparência e segurança.
            </p>
          </div>

          {/* Estatísticas - Card Compacto */}
          <Card className="mb-8 hover:shadow-xl transition-all duration-300">
            <CardContent className="py-2 px-3 sm:py-3 sm:px-4">
              <div className="flex flex-row items-center justify-around gap-1 sm:gap-2">
                {/* Total de Usuários */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Total</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
                </div>
                
                {/* Profissionais */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Profissionais</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats?.professionalsCount || 0}</p>
                </div>
                
                {/* Clientes */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Clientes</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats?.clientsCount || 0}</p>
                </div>
                
                {/* Verificados */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Verificados</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats?.verifiedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>


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