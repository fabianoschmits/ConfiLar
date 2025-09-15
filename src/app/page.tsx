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
import { PWABalloon } from '@/components/pwa/PWABalloon'
import { PWAStatus } from '@/components/pwa/PWAStatus'
// Tabler Icons - Estilo Brutalista
import {
  IconSearch,
  IconUsers,
  IconStar,
  IconShield,
  IconCheck,
  IconArrowRight,
  IconTrendingUp,
  IconUserCheck,
  IconMapPin,
  IconSparkles,
  IconMessageCircle,
  IconAward,
  IconClock,
  IconBolt,
  IconHeart,
  IconBriefcase,
  IconPhone,
  IconMail,
  IconBuilding
} from '@tabler/icons-react'
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
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin"></div>
            <span className="font-black text-black">CARREGANDO...</span>
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
      icon: <IconUsers size={24} stroke={2} />,
      title: "Conexão Direta",
      description: "Sem intermediários. Você conversa diretamente com o profissional"
    },
    {
      icon: <IconStar size={24} stroke={2} />,
      title: "Recomendações Reais",
      description: "Veja quem outros usuários realmente recomendam e por quê"
    },
    {
      icon: <IconShield size={24} stroke={2} />,
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
    { label: "Profissionais Verificados", value: statsLoading ? "..." : formatStatNumber(professionalsCount), icon: <IconUserCheck size={20} stroke={2} /> },
    { label: "Avaliações Reais", value: statsLoading ? "..." : formatStatNumber(reviewsCount), icon: <IconStar size={20} stroke={2} /> },
    { label: "Cidades Atendidas", value: statsLoading ? "..." : formatStatNumber(citiesCount), icon: <IconMapPin size={20} stroke={2} /> },
    { label: "Serviços Realizados", value: statsLoading ? "..." : formatStatNumber(servicesCount), icon: <IconCheck size={20} stroke={2} /> }
  ]

  // Selecionar algumas categorias principais para a página inicial
  const mainCategories = services.slice(0, 6).map(cat => ({
    name: cat.name,
    icon: cat.icon,
    count: "1k+" // Placeholder - pode ser dinâmico no futuro
  }))

  return (
    <div className="min-h-screen bg-yellow-400">
      {/* Header Brutalista */}
      <header className="bg-white border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)] sticky top-0 z-50 relative overflow-hidden">
        {/* Efeito de partículas brutais */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 border border-black animate-ping"></div>
          <div className="absolute top-4 right-8 w-1 h-1 bg-black animate-pulse"></div>
          <div className="absolute bottom-2 left-12 w-1 h-1 bg-yellow-400 animate-bounce"></div>
          <div className="absolute top-6 right-16 w-2 h-2 bg-black border border-black animate-ping"></div>
        </div>
        
        <div className="container flex h-16 items-center justify-between px-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
              <span className="text-yellow-400 font-black text-lg">C</span>
            </div>
            <span className="text-xl font-black text-black uppercase tracking-wider animate-fade-in">CONFILAR</span>
          </div>
          
          {/* Menu desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#como-funciona" className="text-sm font-black text-black hover:text-yellow-500 transition-colors uppercase animate-fade-in">
              COMO FUNCIONA
            </a>
            <a href="#categorias" className="text-sm font-black text-black hover:text-yellow-500 transition-colors uppercase animate-fade-in">
              SERVIÇOS
            </a>
            <a href="#estatisticas" className="text-sm font-black text-black hover:text-yellow-500 transition-colors uppercase animate-fade-in">
              NÚMEROS
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <PWAStatus />
            <button 
              className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all animate-fade-in"
              onClick={() => {
                if (mounted) {
                  router.push('/auth')
                }
              }}
            >
              ENTRAR
            </button>
            <button 
              className="px-4 py-2 text-sm font-black text-white bg-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all animate-fade-in"
              onClick={() => {
                if (mounted) {
                  router.push('/auth')
                }
              }}
            >
              <IconUsers size={16} stroke={2} className="mr-2" />
              CRIAR CONTA
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section Brutalista */}
      <section className="container py-12 md:py-24 text-center px-4">
        <div className={`mx-auto max-w-4xl space-y-6 md:space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-black text-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              <div className="flex items-center gap-2">
                <IconSparkles size={16} stroke={2} />
                <span className="text-sm font-black uppercase">PLATAFORMA DE CONFIANÇA</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight leading-tight text-black">
              CONECTE-SE{' '}
              <span className="text-black bg-yellow-400 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-1 py-0.5 animate-bounce">DIRETAMENTE</span>{' '}
              AOS PROFISSIONAIS
            </h1>
            
            <p className="text-lg md:text-xl text-black max-w-3xl mx-auto leading-relaxed px-4 font-bold">
              <strong>SEM INTERMEDIÁRIOS.</strong> SEM TAXAS OCULTAS. APENAS VOCÊ E O PROFISSIONAL, 
              CONECTADOS ATRAVÉS DE UM SISTEMA DE CONFIANÇA BASEADO EM <strong>RECOMENDAÇÕES REAIS</strong> DE OUTROS USUÁRIOS.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-3 md:gap-6 text-sm text-black px-4">
              <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <IconCheck size={20} stroke={2} className="text-green-600 flex-shrink-0 animate-pulse" />
                <span className="text-center font-black uppercase">ENCONTRE PEDREIROS, ELETRICISTAS, ENCANADORES</span>
              </div>
              <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <IconCheck size={20} stroke={2} className="text-green-600 flex-shrink-0 animate-pulse" />
                <span className="text-center font-black uppercase">PROFISSIONAIS VERIFICADOS E AVALIADOS</span>
              </div>
              <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <IconCheck size={20} stroke={2} className="text-green-600 flex-shrink-0 animate-pulse" />
                <span className="text-center font-black uppercase">PREÇOS DIRETOS, SEM SURPRESAS</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 md:gap-4 w-full max-w-sm mx-auto">
            <button 
              className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse hover:animate-none"
              onClick={() => {
                if (mounted) {
                  router.push('/buscar')
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <IconSearch size={20} stroke={2} className="animate-bounce" />
                <span>BUSCAR PROFISSIONAIS</span>
                <IconArrowRight size={20} stroke={2} className="animate-bounce" />
              </div>
            </button>
            
            <button 
              className="w-full px-6 py-4 text-lg font-black text-black bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:animate-pulse"
              onClick={() => {
                if (mounted) {
                  router.push('/auth')
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <IconUsers size={20} stroke={2} />
                <span>CRIAR CONTA</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Features Brutalista */}
      <section className="container py-12 md:py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all animate-slide-in-up hover:animate-wiggle"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="text-center md:text-left">
                <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4 mx-auto md:mx-0 animate-pulse">
                  <div className="text-yellow-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-black text-black uppercase mb-3 animate-fade-in">{feature.title}</h3>
                <p className="text-base text-black font-bold leading-relaxed animate-fade-in">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Como Funciona Brutalista */}
      <section id="como-funciona" className="container py-16 md:py-24 px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4 text-black uppercase animate-fade-in">
            COMO FUNCIONA
          </h2>
          <p className="text-base md:text-lg text-black max-w-2xl mx-auto font-bold animate-fade-in">
            SIMPLES E DIRETO. EM 4 PASSOS VOCÊ RESOLVE SEU PROBLEMA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4 animate-slide-in-up" style={{ animationDelay: `${index * 0.3}s` }}>
              <div className="w-20 h-20 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto animate-bounce">
                <span className="text-3xl font-black text-yellow-400">{step.number}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black uppercase animate-fade-in">{step.title}</h3>
                <p className="text-black text-sm leading-relaxed px-2 font-bold animate-fade-in">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <button 
            className="px-8 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse hover:animate-none"
            onClick={() => {
              if (mounted) {
                router.push('/buscar')
              }
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <span>COMEÇAR AGORA</span>
              <IconArrowRight size={20} stroke={2} className="animate-bounce" />
            </div>
          </button>
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
                <IconTrendingUp size={24} stroke={2} className="text-green-600" />
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
                <IconUserCheck size={24} stroke={2} className="text-blue-600" />
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
                <IconMessageCircle size={24} stroke={2} className="text-purple-600" />
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
                <IconStar size={24} stroke={2} className="text-orange-600" />
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

      {/* Estatísticas Brutalista */}
      <section id="estatisticas" className="container py-16 md:py-24 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4 text-black uppercase animate-fade-in">
            NÚMEROS QUE INSPIRAM CONFIANÇA
          </h2>
          <p className="text-base md:text-lg text-black max-w-3xl mx-auto font-bold animate-fade-in">
            <strong>MILHARES DE USUÁRIOS</strong> JÁ DESCOBRIRAM COMO É FÁCIL ENCONTRAR PROFISSIONAIS 
            DE QUALIDADE ATRAVÉS DE RECOMENDAÇÕES REAIS. VEJA POR QUE ELES ESCOLHERAM A CONFILAR.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-3 animate-slide-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto animate-pulse">
                <div className="text-yellow-400">
                  {stat.icon}
                </div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-black animate-count-up">{stat.value}</div>
                <div className="text-xs md:text-sm text-black font-bold uppercase">{stat.label}</div>
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
                <IconTrendingUp size={24} stroke={2} />
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
                <IconAward size={24} stroke={2} />
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
                <IconClock size={24} stroke={2} />
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
            <IconUsers size={20} stroke={2} className="mr-2" />
            Cadastre-se como Profissional
            <IconArrowRight size={20} stroke={2} className="ml-2" />
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
                <IconSearch size={20} stroke={2} className="mr-2" />
                Buscar Profissionais
              </Button>
              
              <Button variant="secondary" size="lg" className="w-full" onClick={() => {
                if (mounted) {
                  router.push('/auth')
                }
              }}>
                <IconUsers size={20} stroke={2} className="mr-2" />
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

        /* Efeito de hover brutalista */
        .brutalist-hover:hover {
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
