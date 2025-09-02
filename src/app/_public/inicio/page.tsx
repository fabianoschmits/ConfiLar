'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
import { 
  UserCheck, 
  Search, 
  MessageSquare, 
  Shield, 
  Users,
  Star,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthReady } from '@/hooks/useAuthReady'

export default function InicioPage() {
  const router = useRouter()
  const { user, isReady, loading } = useAuthReady()
  
  // Mostrar loading se ainda não estiver pronto
  if (!isReady || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const handleNavigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-8 border">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Como Funciona o ConfiLar
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
            <p className="text-lg text-muted-foreground">
              Siga estes passos para encontrar o profissional ideal para seu projeto
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Passo 1 */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">1. Complete seu Perfil</CardTitle>
                    <Badge variant="secondary" className="text-xs">Essencial</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Acesse <strong>Editar Perfil</strong> e mantenha todos seus dados atualizados:
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
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
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">2. Busque Profissionais</CardTitle>
                    <Badge variant="secondary" className="text-xs">Encontrar</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Use nossa <strong>Busca Avançada</strong> para encontrar profissionais:
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
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
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">3. Entre em Contato</CardTitle>
                    <Badge variant="secondary" className="text-xs">Comunicar</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Converse diretamente</strong> com os profissionais:
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
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
              <Shield className="h-4 w-4 mr-2" />
              Para Profissionais
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Como Oferecer seus Serviços</h2>
            <p className="text-lg text-muted-foreground">
              Aprenda como se destacar e atrair mais clientes na plataforma
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Passo 1 */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">1. Perfil Profissional</CardTitle>
                    <Badge variant="secondary" className="text-xs">Apresentação</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Crie um <strong>perfil atrativo</strong> e profissional:
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Descrição detalhada dos serviços</li>
                  <li>• Experiência e qualificações</li>
                  <li>• Portfólio com trabalhos realizados</li>
                  <li>• Preços e condições claras</li>
                </ul>
              </CardContent>
            </Card>

            {/* Passo 2 */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">2. Construa Reputação</CardTitle>
                    <Badge variant="secondary" className="text-xs">Credibilidade</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Mantenha alta qualidade</strong> em todos os serviços:
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Responda rapidamente aos clientes</li>
                  <li>• Cumpra prazos e compromissos</li>
                  <li>• Solicite avaliações dos clientes</li>
                  <li>• Mantenha preços competitivos</li>
                </ul>
              </CardContent>
            </Card>

            {/* Passo 3 */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">3. Gerencie Agendamentos</CardTitle>
                    <Badge variant="secondary" className="text-xs">Organização</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Use o <strong>sistema de agendamento</strong> para organizar:
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Disponibilidade de horários</li>
                  <li>• Confirmação de compromissos</li>
                  <li>• Lembretes automáticos</li>
                  <li>• Histórico de atendimentos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-8 border">
          <h2 className="text-2xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-lg text-muted-foreground mb-6">
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
    </MainLayout>
  )
}
