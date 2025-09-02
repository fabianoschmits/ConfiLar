'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MainLayout } from '@/components/layout/MainLayout'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeIn } from '@/components/animations/FadeIn'
import { 
  UserCheck, 
  Search, 
  MessageSquare, 
  Shield, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Users,
  Star,
  MapPin,
  Clock,
  Camera,
  HandHeart,
  Award,
  Lock,
  Eye
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthReady } from '@/hooks/useAuthReady'

function InicioContent() {
  const router = useRouter()
  const { user, isReady, loading } = useAuthReady()
  
  // Mostrar loading se ainda não estiver pronto
  if (!isReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const handleNavigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <FadeIn delay={0.1}>
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
        </FadeIn>

        {/* Seção: Para Clientes */}
        <FadeIn delay={0.2}>
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
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Nome completo e telefone</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Endereço completo</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Camera className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Foto do perfil (obrigatória)</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleNavigateTo('/perfil')}
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
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">2. Publique um Anúncio</CardTitle>
                      <Badge variant="secondary" className="text-xs">Classificados</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Vá até <strong>Classificados</strong> e crie um anúncio descrevendo o trabalho que precisa:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Tipo de serviço necessário</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Descrição detalhada</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Orçamento e prazo</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleNavigateTo('/classificados')}
                  >
                    Ver Classificados
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
                      <CardTitle className="text-lg">3. Receba Propostas</CardTitle>
                      <Badge variant="secondary" className="text-xs">Chat</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Profissionais interessados entrarão em contato através do chat:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Converse com os profissionais</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <HandHeart className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Negocie preços e prazos</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Use o botão &quot;Fazer Acordo&quot;</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleNavigateTo('/mensagens')}
                  >
                    Acessar Chat
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </FadeIn>

        <Separator />

        {/* Seção: Para Profissionais */}
        <FadeIn delay={0.3}>
          <section>
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Award className="h-4 w-4 mr-2" />
                Para Profissionais
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Como Oferecer seus Serviços</h2>
              <p className="text-lg text-muted-foreground">
                Construa sua reputação e encontre novos clientes na nossa plataforma
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Passo 1 Profissional */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">1. Complete seu Perfil</CardTitle>
                      <Badge variant="outline" className="text-xs">Profissional</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Mantenha seu perfil profissional sempre atualizado:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <Camera className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Foto profissional</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Certificações e experiência</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Áreas de atendimento</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleNavigateTo('/perfil')}
                  >
                    Editar Perfil
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 2 Profissional */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">2. Anuncie seus Serviços</CardTitle>
                      <Badge variant="outline" className="text-xs">Classificados</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Crie anúncios dos serviços que você oferece:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Especialidades e habilidades</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Horários disponíveis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Preços e condições</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleNavigateTo('/classificados')}
                  >
                    Criar Anúncio
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Passo 3 Profissional */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Search className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">3. Busque Oportunidades</CardTitle>
                      <Badge variant="outline" className="text-xs">Ativo</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Seja proativo na busca por novos clientes:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Procure anúncios de clientes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Envie propostas via chat</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <HandHeart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Construa relacionamentos</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleNavigateTo('/classificados')}
                  >
                    Buscar Trabalhos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </FadeIn>

        <Separator />

        {/* Seção: Segurança e Acordo */}
        <FadeIn delay={0.4}>
          <section>
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Shield className="h-4 w-4 mr-2" />
                Segurança e Privacidade
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Sistema de Acordos e Proteção de Dados</h2>
              <p className="text-lg text-muted-foreground">
                Sua segurança e privacidade são nossas prioridades
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Card Proteção de Dados */}
              <Card className="border-2 border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Lock className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-orange-800">Proteção de Dados Pessoais</CardTitle>
                      <CardDescription className="text-orange-600">
                        Seus dados ficam protegidos até o acordo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Eye className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800">Dados Ocultos</h4>
                        <p className="text-sm text-orange-600">
                          Telefone, endereço e dados pessoais ficam ocultos até que vocês façam um acordo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800">Chat Seguro</h4>
                        <p className="text-sm text-orange-600">
                          Toda comunicação inicial acontece através do chat interno da plataforma
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800">Ambiente Controlado</h4>
                        <p className="text-sm text-orange-600">
                          Você controla quando e com quem compartilhar suas informações pessoais
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Sistema de Acordo */}
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <HandHeart className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-green-800">Sistema de Acordo</CardTitle>
                      <CardDescription className="text-green-600">
                        Como funciona o botão &quot;Fazer Acordo&quot;
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium text-green-800">Conversem e Negociem</h4>
                        <p className="text-sm text-green-600">
                          Usem o chat para discutir detalhes, preços e prazos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium text-green-800">Clique em &quot;Fazer Acordo&quot;</h4>
                        <p className="text-sm text-green-600">
                          Um dos usuários inicia o processo de acordo no chat
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium text-green-800">Ambos Aceitam</h4>
                        <p className="text-sm text-green-600">
                          <strong>Os dois usuários</strong> precisam aceitar o acordo para os dados serem liberados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Dados Liberados</h4>
                        <p className="text-sm text-green-600">
                          Após ambos aceitarem, telefones e endereços ficam visíveis para os dois
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </FadeIn>

        {/* Call to Action */}
        <FadeIn delay={0.5}>
          <section className="text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold mb-4">Pronto para Começar?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {user ? 
                    'Agora que você entende como funciona, complete seu perfil e comece a usar a plataforma!' :
                    'Crie sua conta gratuita e comece a conectar-se com profissionais ou clientes hoje mesmo!'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => handleNavigateTo('/perfil')}
                      >
                        Completar Perfil
                        <UserCheck className="h-5 w-5 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => handleNavigateTo('/classificados')}
                      >
                        Ver Classificados
                        <Search className="h-5 w-5 ml-2" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => handleNavigateTo('/auth')}
                      >
                        Criar Conta Gratuita
                        <UserCheck className="h-5 w-5 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => handleNavigateTo('/auth')}
                      >
                        Fazer Login
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </FadeIn>
      </div>
    </PageTransition>
  )
}

export default function InicioPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <InicioContent />
      </div>
    </MainLayout>
  )
}
