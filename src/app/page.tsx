'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { 
  Search, 
  Users, 
  Star, 
  Shield, 
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Zap,
  Target,
  Globe,
  ThumbsUp,
  UserCheck,
  FileText,
  MessageSquare,
  MapPin,
  Clock,
  Award,
  Sparkles
} from 'lucide-react'
import { serviceCategories } from '@/data/serviceCategories'

// Componente para a página Home (usuários logados)
function HomePage() {
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

// Componente para a landing page (usuários não logados)
function LandingPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Conexão Direta",
      description: "Sem intermediários. Você conversa diretamente com o profissional"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Recomendações Reais",
      description: "Veja quem outros usuários realmente recomendam e por quê"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Confiança Garantida",
      description: "Sistema de reputação transparente e verificações de identidade"
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Descreva sua necessidade",
      description: "Precisa de um pedreiro para reformar o banheiro? Um eletricista para instalar ventilador? Descreva exatamente o que precisa"
    },
    {
      number: "02", 
      title: "Encontre profissionais confiáveis",
      description: "Veja perfis com fotos, histórico de trabalho e recomendações reais de outros usuários que já contrataram"
    },
    {
      number: "03",
      title: "Converse diretamente",
      description: "Sem intermediários! Combine preço, prazo e detalhes diretamente com o profissional via chat"
    },
    {
      number: "04",
      title: "Avalie e ajude outros",
      description: "Após o serviço, deixe sua avaliação honesta. Sua experiência ajuda outros a escolherem melhor"
    }
  ]

  const stats = [
    { label: "Profissionais Verificados", value: "2.5k+", icon: <UserCheck className="h-4 w-4" /> },
    { label: "Avaliações Reais", value: "15k+", icon: <Star className="h-4 w-4" /> },
    { label: "Cidades Atendidas", value: "150+", icon: <MapPin className="h-4 w-4" /> },
    { label: "Serviços Realizados", value: "25k+", icon: <CheckCircle className="h-4 w-4" /> }
  ]

  // Selecionar algumas categorias principais para a página inicial
  const mainCategories = serviceCategories.slice(0, 6).map(cat => ({
    name: cat.name,
    icon: cat.icon,
    count: "1k+" // Placeholder - pode ser dinâmico no futuro
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold">ConfiLar</span>
          </div>
          
          {/* Menu mobile */}
          <div className="md:hidden">
            <MobileNavigation />
          </div>

          {/* Menu desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#categorias" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Categorias
            </a>
            <a href="#estatisticas" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Estatísticas
            </a>
          </nav>

          {/* Botões de ação */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/auth')}>
              Entrar
            </Button>
            <Button onClick={() => router.push('/auth/cadastro')}>
              Cadastrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container px-4 py-24 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Badge variant="secondary" className="w-fit">
                <Sparkles className="h-3 w-3 mr-1" />
                Plataforma de Confiança
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                Encontre Profissionais{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Confiáveis
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl">
                Conectamos você diretamente com profissionais verificados. 
                Sem intermediários, sem complicações. Apenas resultados.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => router.push('/auth/cadastro')} className="text-lg px-8 py-6">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push('/auth')} className="text-lg px-8 py-6">
                  Já tenho conta
                </Button>
              </div>
            </div>
            
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">João Silva</h3>
                        <p className="text-sm text-muted-foreground">Pedreiro • 4.9 ⭐</p>
                      </div>
                    </div>
                                         <p className="text-sm text-muted-foreground">
                       &quot;Excelente trabalho! Reformou meu banheiro em 3 dias, preço justo e qualidade superior.&quot;
                     </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Reforma • Banheiro</Badge>
                      <span className="text-sm text-muted-foreground">Há 2 dias</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Por que escolher o ConfiLar?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nossa plataforma foi criada para resolver os problemas que você enfrenta ao contratar serviços
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`text-center space-y-4 transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Como funciona</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Em apenas 4 passos simples, você encontra o profissional ideal
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className={`text-center space-y-4 transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="estatisticas" className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Números que falam por si</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Milhares de usuários já confiam no ConfiLar para encontrar profissionais
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center space-y-4 transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                  {stat.icon}
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categorias" className="py-24 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Principais Categorias</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Encontre profissionais para qualquer tipo de serviço
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainCategories.map((category, index) => (
              <Card key={index} className={`transition-all duration-1000 delay-${index * 100} hover:shadow-lg hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle>{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.count} profissionais</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={() => router.push('/auth/cadastro')}>
              Ver Todas as Categorias
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">Pronto para começar?</h2>
            <p className="text-xl opacity-90">
              Junte-se a milhares de usuários que já encontraram profissionais confiáveis através do ConfiLar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => router.push('/auth/cadastro')} className="text-lg px-8 py-6">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/auth')} className="text-lg px-8 py-6">
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 py-12 mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-bold">ConfiLar</span>
              </div>
              <p className="text-muted-foreground">
                Conectando clientes e profissionais de forma segura e confiável.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Produto</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Categorias</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Empresa</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreiras</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Suporte</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © 2024 ConfiLar. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Componente principal que decide qual página mostrar
function HomeContent() {
  const router = useRouter()
  const { user, loading } = useAuthContext()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se usuário está logado, mostrar a página Home
  if (user) {
    return <HomePage />
  }

  return <LandingPage />
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
