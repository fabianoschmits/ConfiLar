'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
import { ResponsiveContainer } from '@/components/layout/ResponsiveLayout'
import {
  Search,
  Users,
  UserCheck,
  MessageSquare,
  ArrowRight,
  Briefcase,
  Star,
  TrendingUp,
  Calendar,
  FileText,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  const handleNavigateTo = (path: string) => {
    console.log('🔄 Navegando para:', path)
    router.push(path)
  }

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-white">
        <ResponsiveContainer spacing="lg" maxWidth="full">
          {/* Header */}
          <div className="text-center py-12 lg:py-16">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 lg:p-12">
              <Badge variant="outline" className="mb-6 text-gray-600 border-gray-300">
                <Users className="h-4 w-4 mr-2" />
                Plataforma ConfiLar
              </Badge>
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Como Funciona o ConfiLar
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Conectamos clientes e profissionais de forma segura e confiável. 
                Aprenda como usar nossa plataforma para encontrar os melhores profissionais ou oferecer seus serviços.
              </p>
            </div>
          </div>

          {/* Seção: Para Clientes */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-gray-600 border-gray-300">
                <Users className="h-4 w-4 mr-2" />
                Para Clientes
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Como Encontrar um Profissional</h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Siga estes passos para encontrar o profissional ideal para seu projeto
              </p>
            </div>

            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Passo 1 */}
              <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <UserCheck className="h-7 w-7 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">1. Complete seu Perfil</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Essencial</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Acesse <strong>Editar Perfil</strong> e mantenha todos seus dados atualizados:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Informações pessoais completas
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Foto de perfil profissional
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Localização e contatos
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Preferências de serviço
                    </li>
                  </ul>
                                     <Button 
                     onClick={() => handleNavigateTo('/editarperfil')}
                     className="w-full bg-gray-900 hover:bg-gray-800 mt-6"
                     size="lg"
                   >
                    Editar Perfil
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 2 */}
              <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <Search className="h-7 w-7 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">2. Busque Profissionais</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Encontrar</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Use nossa <strong>Busca Avançada</strong> para encontrar profissionais:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Filtre por categoria de serviço
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Defina sua localização
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Veja avaliações e portfólios
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Compare preços e disponibilidade
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/buscar')}
                    className="w-full bg-gray-900 hover:bg-gray-800 mt-6"
                    size="lg"
                  >
                    Buscar Profissionais
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 3 */}
              <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <MessageSquare className="h-7 w-7 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">3. Entre em Contato</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Comunicar</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    <strong>Converse diretamente</strong> com os profissionais:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Envie mensagens privadas
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Solicite orçamentos detalhados
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Agende reuniões ou visitas
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Negocie prazos e condições
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/mensagens')}
                    className="w-full bg-gray-900 hover:bg-gray-800 mt-6"
                    size="lg"
                  >
                    Ver Mensagens
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Seção: Para Profissionais */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-gray-600 border-gray-300">
                <Briefcase className="h-4 w-4 mr-2" />
                Para Profissionais
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Como Oferecer seus Serviços</h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Siga estes passos para expandir seu negócio e encontrar mais clientes
              </p>
            </div>

            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Passo 1 */}
              <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <FileText className="h-7 w-7 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">1. Crie seu Portfólio</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Apresentar</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Acesse <strong>Meu Portfólio</strong> e mostre seu trabalho:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Adicione fotos dos seus trabalhos
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Descreva seus serviços
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Defina seus preços
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Mostre sua experiência
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/portfolio')}
                    className="w-full bg-gray-900 hover:bg-gray-800 mt-6"
                    size="lg"
                  >
                    Criar Portfólio
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 2 */}
              <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <Star className="h-7 w-7 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">2. Construa Reputação</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Crescer</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Use nossa <strong>Sistema de Avaliações</strong> para crescer:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Receba avaliações dos clientes
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Responda aos comentários
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Mantenha alta qualidade
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Construa confiança
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/reputacao')}
                    className="w-full bg-gray-900 hover:bg-gray-800 mt-6"
                    size="lg"
                  >
                    Ver Reputação
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 3 */}
              <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <TrendingUp className="h-7 w-7 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">3. Acompanhe Ganhos</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Crescer</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Monitore seu <strong>Desempenho</strong> e crescimento:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Veja suas estatísticas
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Acompanhe seus ganhos
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Analise tendências
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3"></div>
                      Planeje crescimento
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/ganhos')}
                    className="w-full bg-gray-900 hover:bg-gray-800 mt-6"
                    size="lg"
                  >
                    Ver Ganhos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Final */}
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 lg:p-12 shadow-sm">
              <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
                Pronto para Começar?
              </h3>
              <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Junte-se à comunidade ConfiLar e descubra como podemos ajudar você
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button 
                  onClick={() => handleNavigateTo('/buscar')}
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-lg px-8 py-3"
                >
                  Buscar Profissionais
                </Button>
                <Button 
                  onClick={() => handleNavigateTo('/editarperfil')}
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 py-3"
                >
                  Criar Perfil
                </Button>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    </MainLayout>
  )
}
