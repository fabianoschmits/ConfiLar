'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { HomePageLayout } from '@/components/layout/HomePageLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Search, Users, Star, Shield, ArrowRight, MessageCircle,
  Briefcase, Eye, ThumbsUp, Gift, CheckCircle2, Menu, X, Mail, Instagram,
  TrendingUp, Award, Sparkles, Zap
} from 'lucide-react'
import { useHomeStats, formatStatNumber } from '@/hooks/useHomeStats'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { BrandLogo } from '@/components/common/BrandLogo'

// Página Inicial Principal - Hero com Imagem de Fundo Full + Overlay
function HomeContent() {
  const router = useRouter()
  const { user, loading, isReady } = useAuthContext()
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { professionalsCount, reviewsCount, citiesCount, servicesCount, loading: statsLoading } = useHomeStats()
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalUsersParticipating: 0,
    loading: true
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const { data } = await supabase.rpc('get_public_referral_stats')
        if (data) {
          setReferralStats({
            totalReferrals: data.total_referrals || 0,
            totalUsersParticipating: data.total_users_participating || 0,
            loading: false
          })
        }
      } catch (error) {
        setReferralStats({ totalReferrals: 0, totalUsersParticipating: 0, loading: false })
      }
    }
    if (mounted) fetchReferralStats()
  }, [mounted])

  useEffect(() => {
    if (mounted && isReady && user) {
      router.push('/feed')
    }
  }, [user, isReady, router, mounted])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (loading || !mounted) return <DashboardSkeleton />
  if (user) return null

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-950">
        {/* Header Flutuante Transparente */}
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
              <Link href="/" className="flex items-center">
                <Image
                  src="/imagens/logo/Logo branco - sem fundo - horizontal.png"
                  alt="ConfiLar"
                  width={360}
                  height={96}
                  quality={95}
                  priority
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/sobre" className="text-white hover:text-[#00b0b0] transition-colors font-medium">
                  Sobre
                </Link>
                <Link href="/ajuda" className="text-white hover:text-[#00b0b0] transition-colors font-medium">
                  Ajuda
                </Link>
              </nav>

              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" asChild className="text-white hover:text-[#00b0b0] hover:bg-white/10">
                  <Link href="/auth">Entrar</Link>
                </Button>
                <Button asChild className="bg-[#00b0b0] hover:bg-[#00a0a0] text-white shadow-lg shadow-[#00b0b0]/50">
                  <Link href="/auth?tab=register">Criar Conta Grátis</Link>
                </Button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden mt-4 bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <nav className="flex flex-col space-y-4">
                  <Link href="/sobre" className="text-white hover:text-[#00b0b0] transition-colors">Sobre</Link>
                  <Link href="/ajuda" className="text-white hover:text-[#00b0b0] transition-colors">Ajuda</Link>
                  <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
                    <Button variant="ghost" asChild className="justify-start text-white hover:bg-white/10">
                      <Link href="/auth">Entrar</Link>
                    </Button>
                    <Button asChild className="bg-[#00b0b0] hover:bg-[#00a0a0] text-white justify-start">
                      <Link href="/auth?tab=register">Criar Conta Grátis</Link>
                    </Button>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section com Imagem de Fundo */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Imagem de Fundo com Overlay */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-[#00b0b0]/30" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          </div>

          {/* Conteúdo Hero */}
          <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge className="mb-6 bg-[#00b0b0]/20 text-[#00b0b0] border-[#00b0b0]/50 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Plataforma de Confiança
            </Badge>
            
            <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                O que é o
              </h1>
              <Image
                src="/imagens/logo/Logo azul - sem fundo - horizontal.png"
                alt="ConfiLar"
                width={300}
                height={80}
                quality={95}
                priority
                className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto object-contain mt-5 sm:mt-6 md:mt-7 lg:mt-8"
              />
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                ?
              </h1>
            </div>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto font-medium leading-relaxed">
              Uma plataforma <strong className="text-white">transparente e confiável</strong> que conecta pessoas 
              que precisam de serviços com profissionais qualificados através de{' '}
              <strong className="text-white">indicações, recomendações e anúncios</strong>.
            </p>
            
            <p className="text-base sm:text-lg text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Aqui você encontra profissionais verificados, pode ver quem já contratou, ler recomendações reais 
              e publicar seus próprios anúncios de serviços de forma segura.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" asChild className="bg-[#00b0b0] hover:bg-[#00a0a0] text-white text-lg px-8 py-6 shadow-2xl shadow-[#00b0b0]/50 hover:shadow-[#00b0b0]/70 transition-all">
                <Link href="/auth?tab=register">
                  Começar Agora Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-white border-2 border-white/60 bg-white/10 hover:bg-white/20 text-lg px-8 py-6 backdrop-blur-sm">
                <Link href="/buscar">
                  <Search className="mr-2 h-5 w-5" />
                  Buscar Profissionais
                </Link>
              </Button>
            </div>

            {/* Stats Cards com Glassmorphism */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-4xl sm:text-5xl font-bold text-[#00b0b0] mb-2">
                  {statsLoading ? '...' : formatStatNumber(professionalsCount)}
                </div>
                <div className="text-sm text-gray-300 font-medium">Profissionais</div>
                <div className="text-xs text-gray-400 mt-1">Verificados</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-4xl sm:text-5xl font-bold text-[#00b0b0] mb-2">
                  {statsLoading ? '...' : formatStatNumber(reviewsCount)}
                </div>
                <div className="text-sm text-gray-300 font-medium">Avaliações</div>
                <div className="text-xs text-gray-400 mt-1">Reais</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-4xl sm:text-5xl font-bold text-[#00b0b0] mb-2">
                  {statsLoading ? '...' : formatStatNumber(citiesCount)}
                </div>
                <div className="text-sm text-gray-300 font-medium">Cidades</div>
                <div className="text-xs text-gray-400 mt-1">Atendidas</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-4xl sm:text-5xl font-bold text-[#00b0b0] mb-2">
                  {statsLoading ? '...' : formatStatNumber(servicesCount)}
                </div>
                <div className="text-sm text-gray-300 font-medium">Serviços</div>
                <div className="text-xs text-gray-400 mt-1">Categorias</div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/50 rounded-full" />
            </div>
          </div>
        </section>

        {/* Seção Como Funciona - Cards com Imagens */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-[#00b0b0]/10 text-[#00b0b0] border-[#00b0b0]/50">
                Como Funciona
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Simples, Transparente e Eficaz
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Quatro pilares que fazem do ConfiLar a plataforma ideal para conectar pessoas e profissionais
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Card 1 */}
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80')"}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-14 h-14 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Eye className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">🔍 Transparência Total</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Veja <strong>quem já contratou</strong> cada profissional, <strong>quem recomendou</strong> e 
                    todas as <strong>avaliações reais</strong>. Nada fica escondido - você decide com todas as informações.
                  </p>
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80')"}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-14 h-14 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">🤝 Sistema de Indicações</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong>Indique amigos</strong> e ganhe pontos, badges e benefícios! Quanto mais pessoas você indicar, 
                    mais você ganha. É um programa de recompensas baseado em confiança.
                  </p>
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80')"}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-14 h-14 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <ThumbsUp className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">👍 Recomendações Públicas</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Depois de contratar um profissional, você pode <strong>recomendá-lo publicamente</strong>. 
                    Sua recomendação aparece no perfil dele para todos verem, criando um histórico de confiança.
                  </p>
                </CardContent>
              </Card>

              {/* Card 4 */}
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80')"}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-14 h-14 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Briefcase className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">📢 Anúncios de Serviços</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong>Publique anúncios</strong> oferecendo seus serviços ou <strong>busque anúncios</strong> de quem 
                    precisa. Anúncios premium aparecem destacados e têm maior visibilidade.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Seção Funcionalidades Detalhadas - Layout Alternado */}
        <section className="py-24 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-[#00b0b0]/10 text-[#00b0b0] border-[#00b0b0]/50">
                Funcionalidades
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Tudo que Você Precisa
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Ferramentas poderosas para encontrar ou oferecer serviços com segurança
              </p>
            </div>

            <div className="space-y-24">
              {/* Feature 1 - Imagem à esquerda */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80')"}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00b0b0]/20 to-transparent" />
                </div>
                <div>
                  <div className="w-16 h-16 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Transparência e Confiança
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    No ConfiLar, <strong>tudo é transparente</strong>. Você pode ver:
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Quem já contratou</strong> cada profissional - você vê nomes, fotos e datas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Todas as avaliações e comentários</strong> de quem já usou o serviço</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Histórico completo</strong> de trabalhos realizados e recomendações</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Verificação de identidade</strong> para garantir autenticidade</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Feature 2 - Imagem à direita */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="w-16 h-16 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Indicações e Recomendações
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    Duas formas poderosas de construir confiança na plataforma:
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                      <Gift className="h-8 w-8 text-[#00b0b0] mb-3" />
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">Programa de Indicações</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ganhe pontos, badges e benefícios indicando amigos
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                      <ThumbsUp className="h-8 w-8 text-[#00b0b0] mb-3" />
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">Recomendações Públicas</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ajude outros a escolher melhor recomendando profissionais
                      </p>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80')"}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00b0b0]/20 to-transparent" />
                </div>
              </div>

              {/* Feature 3 - Imagem à esquerda */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80')"}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00b0b0]/20 to-transparent" />
                </div>
                <div>
                  <div className="w-16 h-16 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Anúncios de Serviços
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    Publique ou encontre serviços de forma simples e organizada:
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Ofereça seus serviços:</strong> Anúncios com fotos e descrições</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Solicite serviços:</strong> Receba propostas de profissionais</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Anúncios Premium:</strong> Destaque para maior visibilidade</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Programa de Indicações - Card Grande */}
        <section className="py-24 bg-gradient-to-br from-[#00b0b0] to-[#008080]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                🎁 Programa de Indicações
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Indique amigos e ganhe recompensas incríveis! Quanto mais você indica, mais benefícios você recebe.
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <Gift className="h-7 w-7 text-[#00b0b0]" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">Como Funciona?</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {[
                        { num: 1, title: 'Cadastre-se', desc: 'Crie sua conta e receba seu código único' },
                        { num: 2, title: 'Indique Amigos', desc: 'Compartilhe seu código e ganhe pontos' },
                        { num: 3, title: 'Ganhe Recompensas', desc: 'Badges e níveis (Bronze → Diamante)' },
                        { num: 4, title: 'Benefícios Exclusivos', desc: 'Anúncios premium grátis e mais' }
                      ].map((step) => (
                        <div key={step.num} className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[#00b0b0] shadow-lg">
                            {step.num}
                          </div>
                          <div>
                            <h4 className="font-bold text-white mb-1">{step.title}</h4>
                            <p className="text-sm text-white/80">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl">
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-6 text-center">
                      Estatísticas do Programa
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-6 bg-gradient-to-br from-[#00b0b0]/10 to-[#00b0b0]/5 rounded-2xl">
                        <div className="text-4xl font-bold text-[#00b0b0] mb-2">
                          {referralStats.loading ? '...' : formatStatNumber(referralStats.totalReferrals)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total de Indicações</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-[#00b0b0]/10 to-[#00b0b0]/5 rounded-2xl">
                        <div className="text-4xl font-bold text-[#00b0b0] mb-2">
                          {referralStats.loading ? '...' : formatStatNumber(referralStats.totalUsersParticipating)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Usuários Participando</div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Button asChild className="w-full bg-[#00b0b0] hover:bg-[#00a0a0] text-white py-6 text-lg shadow-xl">
                        <Link href="/auth?tab=register">
                          Começar a Indicar
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Por que escolher - Grid 3 colunas */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-[#00b0b0]/10 text-[#00b0b0] border-[#00b0b0]/50">
                Diferenciais
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Por que escolher o ConfiLar?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#00b0b0]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-10 w-10 text-[#00b0b0]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">100% Transparente</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Veja tudo: quem contratou, quem recomendou, todas as avaliações. 
                    Nada fica escondido - você decide com todas as informações.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#00b0b0]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-[#00b0b0]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Profissionais Verificados</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Sistema de verificação de identidade garante que você está lidando 
                    com pessoas reais e confiáveis.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#00b0b0]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-10 w-10 text-[#00b0b0]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Comunicação Direta</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Sistema de mensagens integrado para você negociar e fechar acordos 
                    diretamente com os profissionais.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <BrandLogo width={140} height={38} className="mb-6" />
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Plataforma transparente que conecta clientes e profissionais através de 
                  indicações, recomendações e anúncios de serviços. Confiança e transparência em primeiro lugar.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/sobre" className="text-gray-400 hover:text-[#00b0b0] transition-colors">Sobre Nós</Link></li>
                  <li><Link href="/ajuda" className="text-gray-400 hover:text-[#00b0b0] transition-colors">Central de Ajuda</Link></li>
                  <li><Link href="/termos" className="text-gray-400 hover:text-[#00b0b0] transition-colors">Termos de Uso</Link></li>
                  <li><Link href="/buscar" className="text-gray-400 hover:text-[#00b0b0] transition-colors">Buscar</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Contato</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center text-gray-400">
                    <Mail className="h-4 w-4 mr-2 text-[#00b0b0]" />
                    <a href="mailto:contato@appconfilar.com.br" className="hover:text-[#00b0b0] transition-colors">
                      contato@appconfilar.com.br
                    </a>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <Instagram className="h-4 w-4 mr-2 text-[#00b0b0]" />
                    <a href="https://www.instagram.com/appconfilar" target="_blank" rel="noopener noreferrer" className="hover:text-[#00b0b0] transition-colors">
                      @appconfilar
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-12 bg-gray-800" />

            <div className="text-center">
              <p className="text-gray-400 text-sm">&copy; 2024 ConfiLar. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  )
}

export default function Home() {
  return (
    <HomePageLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <HomeContent />
      </Suspense>
    </HomePageLayout>
  )
}


