'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
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

  // Renderização condicional para evitar problemas de hidratação
  if (typeof window === 'undefined') {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Carregando...</h1>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-blue-600/10 rounded-xl p-8 border">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Como Funciona o ConfiLar
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Conectamos clientes e profissionais de forma segura e confiável. 
                Aprenda como usar nossa plataforma para encontrar os melhores profissionais ou oferecer seus serviços.
              </p>
            </div>
          </div>

          {/* Seção: Para Clientes */}
          <section>
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Users className="h-4 w-4 mr-2" />
                Para Clientes
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Como Encontrar um Profissional</h2>
              <p className="text-lg text-gray-600">
                Siga estes passos para encontrar o profissional ideal para seu projeto
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Passo 1 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">1. Complete seu Perfil</CardTitle>
                      <Badge variant="secondary" className="text-xs">Essencial</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Acesse <strong>Editar Perfil</strong> e mantenha todos seus dados atualizados:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Informações pessoais completas</li>
                    <li>• Foto de perfil profissional</li>
                    <li>• Localização e contatos</li>
                    <li>• Preferências de serviço</li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/perfil')}
                    className="w-full"
                    size="sm"
                  >
                    Editar Perfil
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 2 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">2. Busque Profissionais</CardTitle>
                      <Badge variant="secondary" className="text-xs">Encontrar</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Use nossa <strong>Busca Avançada</strong> para encontrar profissionais:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Filtre por categoria de serviço</li>
                    <li>• Defina sua localização</li>
                    <li>• Veja avaliações e portfólios</li>
                    <li>• Compare preços e disponibilidade</li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/buscar')}
                    className="w-full"
                    size="sm"
                  >
                    Buscar Profissionais
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 3 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">3. Entre em Contato</CardTitle>
                      <Badge variant="secondary" className="text-xs">Comunicar</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    <strong>Converse diretamente</strong> com os profissionais:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Envie mensagens privadas</li>
                    <li>• Solicite orçamentos detalhados</li>
                    <li>• Agende reuniões ou visitas</li>
                    <li>• Negocie prazos e condições</li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/mensagens')}
                    className="w-full"
                    size="sm"
                  >
                    Ver Mensagens
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Seção: Para Profissionais */}
          <section>
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Briefcase className="h-4 w-4 mr-2" />
                Para Profissionais
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Como Oferecer seus Serviços</h2>
              <p className="text-lg text-gray-600">
                Siga estes passos para expandir seu negócio e encontrar mais clientes
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Passo 1 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">1. Crie seu Portfólio</CardTitle>
                      <Badge variant="secondary" className="text-xs">Essencial</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Acesse <strong>Meu Portfólio</strong> e mostre seu trabalho:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Adicione fotos dos seus trabalhos</li>
                    <li>• Descreva seus serviços</li>
                    <li>• Defina seus preços</li>
                    <li>• Configure sua disponibilidade</li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/portfolio')}
                    className="w-full"
                    size="sm"
                  >
                    Criar Portfólio
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 2 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">2. Construa sua Reputação</CardTitle>
                      <Badge variant="secondary" className="text-xs">Crescimento</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Use nossa <strong>Sistema de Avaliações</strong> para crescer:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Receba avaliações dos clientes</li>
                    <li>• Responda aos comentários</li>
                    <li>• Melhore seu perfil</li>
                    <li>• Ganhe destaque na busca</li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/reputacao')}
                    className="w-full"
                    size="sm"
                  >
                    Ver Reputação
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 3 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">3. Gerencie seus Ganhos</CardTitle>
                      <Badge variant="secondary" className="text-xs">Financeiro</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    <strong>Acompanhe seu crescimento</strong> financeiro:
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Veja seus ganhos mensais</li>
                    <li>• Analise estatísticas</li>
                    <li>• Gerencie sua agenda</li>
                    <li>• Planeje seu crescimento</li>
                  </ul>
                  <Button 
                    onClick={() => handleNavigateTo('/ganhos')}
                    className="w-full"
                    size="sm"
                  >
                    Ver Ganhos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Final */}
          <div className="text-center bg-gradient-to-r from-blue-500/5 to-blue-600/10 rounded-xl p-8 border">
            <h2 className="text-2xl font-bold mb-4">Pronto para Começar?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Junte-se à comunidade ConfiLar e descubra como podemos ajudar você
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleNavigateTo('/buscar')}
                size="lg"
                className="min-w-[200px]"
              >
                Buscar Profissionais
                <Search className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                onClick={() => handleNavigateTo('/perfil')}
                variant="outline"
                size="lg"
                className="min-w-[200px]"
              >
                Criar Perfil
                <UserCheck className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
