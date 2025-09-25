'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MobileFloatingMenu } from '@/components/layout/MobileFloatingMenu'
import { PWAStatus } from '@/components/pwa/PWAStatus'
// Lucide Icons - Tema Moderno
import {
  Search,
  Users,
  Star,
  Shield,
  Check,
  ArrowRight,
  TrendingUp,
  UserCheck,
  MapPin,
  Sparkles,
  MessageCircle,
  Award,
  Clock,
  Zap,
  Heart,
  Briefcase,
  Phone,
  Mail,
  Building,
  Eye,
  ThumbsUp
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
    if (mounted && isReady && user) {
      router.push('/dashboard')
      return
    }
  }, [user, isReady, router, mounted])

  useEffect(() => {
    if (mounted) {
      setIsVisible(true)
    }
  }, [mounted])

  // Não renderizar nada até estar montado no cliente
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-300 shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border border-gray-300 border-t-transparent animate-spin"></div>
            <span className="font-semibold text-gray-900">CARREGANDO...</span>
          </div>
        </div>
      </div>
    )
  }

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
      icon: <Users size={24} strokeWidth={2} />,
      title: "Conexão Direta",
      description: "Sem intermediários. Você conversa diretamente com o profissional"
    },
    {
      icon: <Star size={24} strokeWidth={2} />,
      title: "Recomendações Reais",
      description: "Veja quem outros usuários realmente recomendam e por quê"
    },
    {
      icon: <Shield size={24} strokeWidth={2} />,
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
    { label: "Profissionais Verificados", value: statsLoading ? "..." : formatStatNumber(professionalsCount), icon: <UserCheck size={20} strokeWidth={2} /> },
    { label: "Avaliações Reais", value: statsLoading ? "..." : formatStatNumber(reviewsCount), icon: <Star size={20} strokeWidth={2} /> },
    { label: "Cidades Atendidas", value: statsLoading ? "..." : formatStatNumber(citiesCount), icon: <MapPin size={20} strokeWidth={2} /> },
    { label: "Serviços Realizados", value: statsLoading ? "..." : formatStatNumber(servicesCount), icon: <Check size={20} strokeWidth={2} /> }
  ]

  // Selecionar algumas categorias principais para a página inicial
  const mainCategories = services.slice(0, 6).map(cat => ({
    name: cat.name,
    icon: cat.icon,
    count: statsLoading ? "..." : `${Math.floor(professionalsCount / 6)}+` // Distribuir profissionais entre categorias
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Moderno */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ConfiLar</span>
          </div>
          
          {/* Menu desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#como-funciona" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Como Funciona
            </a>
            <a href="#categorias" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Serviços
            </a>
            <a href="#estatisticas" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Números
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <PWAStatus />
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => {
                if (mounted) {
                  router.push('/auth')
                }
              }}
            >
              Entrar
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                if (mounted) {
                  router.push('/auth')
                }
              }}
            >
              <Users size={16} strokeWidth={2} className="mr-2" />
              Criar Conta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section Moderno */}
      <section className="container py-16 md:py-24 text-center px-4">
        <div className={`mx-auto max-w-4xl space-y-6 md:space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-200">
              <Sparkles size={16} strokeWidth={2} />
              <span className="text-sm font-medium">Plataforma de Confiança</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-gray-900">
              Conecte-se{' '}
              <span className="text-blue-600 relative">
                diretamente
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-blue-100 rounded-full -z-10"></div>
              </span>{' '}
              aos profissionais
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              <strong>Sem intermediários.</strong> Sem taxas ocultas. Apenas você e o profissional, 
              conectados através de um sistema de confiança baseado em <strong>recomendações reais</strong> de outros usuários.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-3 text-sm text-gray-600 px-4">
              <div className="flex items-center gap-2" style={{ animationDelay: '0.1s' }}>
                <Check size={20} strokeWidth={2} className="text-green-600 flex-shrink-0" />
                <span className="text-center font-medium">Encontre pedreiros, eletricistas, encanadores</span>
              </div>
              <div className="flex items-center gap-2" style={{ animationDelay: '0.2s' }}>
                <Check size={20} strokeWidth={2} className="text-green-600 flex-shrink-0" />
                <span className="text-center font-medium">Profissionais verificados e avaliados</span>
              </div>
              <div className="flex items-center gap-2" style={{ animationDelay: '0.3s' }}>
                <Check size={20} strokeWidth={2} className="text-green-600 flex-shrink-0" />
                <span className="text-center font-medium">Preços diretos, sem surpresas</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
            <Button 
              size="lg"
              className="w-full"
              onClick={() => {
                if (mounted) {
                  router.push('/buscar')
                }
              }}
            >
              <Search size={20} strokeWidth={2} className="mr-2" />
              Buscar Profissionais
            </Button>
            
            <Button 
              variant="outline"
              size="lg" 
              className="w-full"
              onClick={() => {
                if (mounted) {
                  router.push('/auth')
                }
              }}
            >
              <Users size={20} strokeWidth={2} className="mr-2" />
              Criar Conta
            </Button>
          </div>
        </div>
      </section>

      {/* Features Modernas */}
      <section className="container py-16 md:py-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 backdrop-blur-sm"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Como Funciona Moderno */}
      <section id="como-funciona" className="container py-16 md:py-24 px-4 bg-white/30 backdrop-blur-sm">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
            Como Funciona
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Simples e direto. Em 4 passos você resolve seu problema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-2xl font-bold text-white">{step.number}</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed px-2">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => {
              if (mounted) {
                router.push('/buscar')
              }
            }}
          >
            <span>Começar Agora</span>
            <ArrowRight size={20} strokeWidth={2} className="ml-2" />
          </Button>
        </div>
      </section>

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
                <TrendingUp size={24} strokeWidth={2} className="text-green-600" />
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
                <UserCheck size={24} strokeWidth={2} className="text-blue-600" />
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
                <MessageCircle size={24} strokeWidth={2} className="text-purple-600" />
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
                <Star size={24} strokeWidth={2} className="text-orange-600" />
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

      {/* Estatísticas Modernas */}
      <section id="estatisticas" className="container py-16 md:py-24 px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
            Números que Inspiram Confiança
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            <strong>Milhares de usuários</strong> já descobriram como é fácil encontrar profissionais 
            de qualidade através de recomendações reais. Veja por que eles escolheram a ConfiLar.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categorias */}
      <section id="categorias" className="container py-16 md:py-24 px-4 bg-white/30 backdrop-blur-sm">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
            Categorias de Serviços
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
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

      {/* Para Profissionais */}
      <section className="container py-16 md:py-24 px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
            Para Profissionais
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            <strong>Transforme sua carreira</strong> conectando-se diretamente com clientes. 
            Sem taxas de plataforma, sem intermediários. Apenas você e seus clientes, 
            construindo reputação através de trabalho de qualidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp size={24} strokeWidth={2} className="text-blue-600" />
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Award size={24} strokeWidth={2} className="text-green-600" />
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Clock size={24} strokeWidth={2} className="text-purple-600" />
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
            <Users size={20} strokeWidth={2} className="mr-2" />
            Cadastre-se como Profissional
            <ArrowRight size={20} strokeWidth={2} className="ml-2" />
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
                <Search size={20} strokeWidth={2} className="mr-2" />
                Buscar Profissionais
              </Button>
              
              <Button variant="secondary" size="lg" className="w-full" onClick={() => {
                if (mounted) {
                  router.push('/auth')
                }
              }}>
                <Users size={20} strokeWidth={2} className="mr-2" />
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
              </ul>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h3 className="font-semibold">Contato</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contato@confilar.com.br</li>
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

      {/* Animações CSS Customizadas */}
      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-up {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-2deg);
          }
          75% {
            transform: rotate(2deg);
          }
        }

        @keyframes count-up {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }

        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }

        .animate-count-up {
          animation: count-up 1s ease-out forwards;
          opacity: 0;
        }

        /* Efeito de hover moderno */
        .modern-hover:hover {
          transform: translate(-2px, -2px);
          box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
        }

        /* Animação de entrada escalonada */
        .stagger-animation > * {
          animation-delay: calc(var(--stagger-delay, 0) * 0.1s);
        }
      `}</style>
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
