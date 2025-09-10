'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MobileFloatingMenu } from '@/components/layout/MobileFloatingMenu'
import { PWABalloon } from '@/components/pwa/PWABalloon'
import { PWAStatus } from '@/components/pwa/PWAStatus'
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
import { services } from '@/data/services'
import { useHomeStats, formatStatNumber } from '@/hooks/useHomeStats'

function HomeContent() {
  const router = useRouter()
  const { user, loading, isReady, error } = useAuthContext()
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { professionalsCount, reviewsCount, citiesCount, servicesCount, loading: statsLoading } = useHomeStats()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirecionar usuários logados para o dashboard
  useEffect(() => {
    if (isReady && user) {
      router.push('/dashboard')
      return
    }
  }, [user, isReady, router])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Mostrar loading inteligente enquanto verifica autenticação
  if (loading || !isReady) {
    return <LoadingOverlay isLoading={true} message={loading ? 'Verificando autenticação...' : 'Preparando interface...'} />
  }

  // Se usuário está logado, não mostrar nada (já foi redirecionado)
  if (user) {
    return null
  }

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
    { label: "Profissionais Verificados", value: statsLoading ? "..." : formatStatNumber(professionalsCount), icon: <UserCheck className="h-4 w-4" /> },
    { label: "Avaliações Reais", value: statsLoading ? "..." : formatStatNumber(reviewsCount), icon: <Star className="h-4 w-4" /> },
    { label: "Cidades Atendidas", value: statsLoading ? "..." : formatStatNumber(citiesCount), icon: <MapPin className="h-4 w-4" /> },
    { label: "Serviços Realizados", value: statsLoading ? "..." : formatStatNumber(servicesCount), icon: <CheckCircle className="h-4 w-4" /> }
  ]

  // Selecionar algumas categorias principais para a página inicial
  const mainCategories = services.slice(0, 6).map(cat => ({
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
          
          {/* Menu desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#categorias" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Serviços
            </a>
            <a href="#estatisticas" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Números
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <PWAStatus />
            <Button variant="ghost" onClick={() => {
              if (mounted) {
                router.push('/auth')
              }
            }}>
              Entrar
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              if (mounted) {
                router.push('/auth')
              }
            }}>
              <Users className="h-4 w-4 mr-2" />
              Criar Conta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-12 md:py-24 text-center px-4">
        <div className={`mx-auto max-w-4xl space-y-6 md:space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="space-y-4">
            <Badge variant="secondary" className="px-3 py-1 text-xs md:text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Plataforma de Confiança
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
              Conecte-se{' '}
              <span className="text-primary">Diretamente</span>{' '}
              aos Profissionais
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              <strong>Sem intermediários.</strong> Sem taxas ocultas. Apenas você e o profissional, 
              conectados através de um sistema de confiança baseado em <strong>recomendações reais</strong> de outros usuários.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-3 md:gap-6 text-sm text-muted-foreground px-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-center">Encontre pedreiros, eletricistas, encanadores</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-center">Profissionais verificados e avaliados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-center">Preços diretos, sem surpresas</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 md:gap-4 w-full max-w-sm mx-auto">
            <Button size="lg" className="w-full" onClick={() => {
              if (mounted) {
                router.push('/buscar')
              }
            }}>
              <Search className="h-4 w-4 mr-2" />
              Buscar Profissionais
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button variant="outline" size="lg" className="w-full" onClick={() => {
              if (mounted) {
                router.push('/auth')
              }
            }}>
              <Users className="h-4 w-4 mr-2" />
              Criar Conta
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-12 md:py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-none">
              <CardHeader className="pb-3 text-center md:text-left">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 mx-auto md:mx-0">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center md:text-left">
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Como Funciona */}
      <section id="como-funciona" className="container py-16 md:py-24 px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Como Funciona
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Simples e direto. Em 4 passos você resolve seu problema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">{step.number}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-2">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Button size="lg" className="w-full max-w-sm" onClick={() => {
            if (mounted) {
              router.push('/buscar')
            }
          }}>
            Começar Agora
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      <Separator />

      {/* Benefícios */}
      <section className="container py-16 md:py-24 px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Por que Escolher a ConfiLar?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Descubra como nosso sistema ponto a ponto revoluciona a forma de encontrar profissionais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <Card className="border-0 shadow-none bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-800">
                Economia Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-green-700">
                <strong>Sem taxas de plataforma.</strong> Você paga apenas o que o profissional cobra. 
                Compare preços diretamente e escolha o melhor custo-benefício para seu orçamento.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-800">
                Profissionais Verificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-blue-700">
                <strong>Identidade confirmada</strong> e histórico de trabalho transparente. 
                Veja fotos, documentos e recomendações reais antes de contratar.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-purple-800">
                Comunicação Direta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-purple-700">
                <strong>Chat integrado</strong> para combinar detalhes, prazos e valores. 
                Sem intermediários, sem mal-entendidos. Conversa clara e objetiva.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-orange-800">
                Sistema de Reputação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-orange-700">
                <strong>Recomendações autênticas</strong> de quem realmente contratou. 
                Avaliações detalhadas e sistema de pontuação transparente para sua segurança.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Estatísticas */}
      <section id="estatisticas" className="container py-16 md:py-24 bg-muted/50 px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Números que Inspiram Confiança
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            <strong>Milhares de usuários</strong> já descobriram como é fácil encontrar profissionais 
            de qualidade através de recomendações reais. Veja por que eles escolheram a ConfiLar.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                {stat.icon}
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Categorias */}
      <section id="categorias" className="container py-16 md:py-24 px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Categorias de Serviços
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre profissionais verificados em todas as áreas que você precisa
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {mainCategories.map((category, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 md:pt-6">
                <div className="text-2xl md:text-3xl mb-2">{category.icon}</div>
                <CardTitle className="text-xs md:text-sm font-medium mb-1">
                  {category.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Para Profissionais */}
      <section className="container py-16 md:py-24 bg-muted/50 px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Para Profissionais
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            <strong>Transforme sua carreira</strong> conectando-se diretamente com clientes. 
            Sem taxas de plataforma, sem intermediários. Apenas você e seus clientes, 
            construindo reputação através de trabalho de qualidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <CardTitle>Aumente sua Renda</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conecte-se com mais clientes e expanda seu negócio
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Award className="h-6 w-6" />
              </div>
              <CardTitle>Construa Reputação</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receba avaliações e construa uma base sólida de clientes
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <CardTitle>Gerencie sua Agenda</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Controle sua disponibilidade e organize compromissos
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => {
            if (mounted) {
              router.push('/auth')
            }
          }}>
            <Users className="h-4 w-4 mr-2" />
            Cadastre-se como Profissional
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container py-16 md:py-24 px-4">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="pt-8 md:pt-12 pb-8 md:pb-12 text-center px-4 md:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto para resolver seus problemas?
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/80 mb-6 md:mb-8 max-w-3xl mx-auto">
              <strong>Milhares de usuários</strong> já descobriram como é fácil encontrar profissionais 
              de confiança através de recomendações reais. Sem intermediários, sem taxas ocultas. 
              Apenas conexões diretas e confiáveis.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-3 md:gap-4 w-full max-w-sm mx-auto">
              <Button variant="secondary" size="lg" className="w-full" onClick={() => {
                if (mounted) {
                  router.push('/buscar')
                }
              }}>
                <Search className="h-4 w-4 mr-2" />
                Buscar Profissionais
              </Button>
              
              <Button variant="secondary" size="lg" className="w-full" onClick={() => {
                if (mounted) {
                  router.push('/auth')
                }
              }}>
                <Users className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-8 md:py-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">C</span>
                </div>
                <span className="text-lg font-bold">ConfiLar</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A plataforma mais confiável para conectar clientes e profissionais no Brasil.
              </p>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h3 className="font-semibold">Para Clientes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a></li>
                <li><a href="/reputacao" className="hover:text-foreground transition-colors">Avaliações</a></li>
                <li><a href="/classificados" className="hover:text-foreground transition-colors">Classificados</a></li>
              </ul>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h3 className="font-semibold">Para Profissionais</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/auth" className="hover:text-foreground transition-colors">Cadastro</a></li>
                <li><Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors" onClick={() => {
                  if (mounted) {
                    router.push('/perfil')
                  }
                }}>Gerenciar Perfil</Button></li>
                <li><a href="/agenda" className="hover:text-foreground transition-colors">Agenda</a></li>
              </ul>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h3 className="font-semibold">Contato</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contato@confilar.com.br</li>
                <li>(51) 98427-6564</li>
                <li>Venâncio Aires, RS</li>
              </ul>
            </div>
          </div>

          <Separator className="my-6 md:my-8" />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ConfiLar. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Menu flutuante para mobile */}
      <MobileFloatingMenu />

      {/* PWA Balloon */}
      <PWABalloon />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <HomeContent />
    </Suspense>
  )
}
