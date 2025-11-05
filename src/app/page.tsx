'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"
import { PublicLayout } from '@/components/layout/PublicLayout'
import { HomePageLayout } from '@/components/layout/HomePageLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Eye,
  Heart,
  Briefcase,
  Phone,
  Mail,
  Menu,
  X,
  ThumbsUp,
  CheckCircle2,
  Gift,
  Zap,
  BarChart3,
} from 'lucide-react'
import { useHomeStats, formatStatNumber } from '@/hooks/useHomeStats'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { BrandLogo } from '@/components/common/BrandLogo'

function HomeContent() {
  const router = useRouter()
  const { user, loading, isReady, error } = useAuthContext()
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { professionalsCount, reviewsCount, citiesCount, servicesCount, loading: statsLoading } = useHomeStats()
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number
    totalUsersParticipating: number
    loading: boolean
  }>({
    totalReferrals: 0,
    totalUsersParticipating: 0,
    loading: true
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Buscar estatísticas do programa de referal
  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        setReferralStats(prev => ({ ...prev, loading: true }))

        // Usar função RPC pública para obter estatísticas agregadas
        const { data, error } = await supabase.rpc('get_public_referral_stats')

        if (error) {
          console.error('Erro ao buscar estatísticas de referal:', error)
          setReferralStats({
            totalReferrals: 0,
            totalUsersParticipating: 0,
            loading: false
          })
        } else if (data) {
          setReferralStats({
            totalReferrals: data.total_referrals || 0,
            totalUsersParticipating: data.total_users_participating || 0,
            loading: false
          })
        } else {
          setReferralStats({
            totalReferrals: 0,
            totalUsersParticipating: 0,
            loading: false
          })
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas de referal:', error)
        setReferralStats({
          totalReferrals: 0,
          totalUsersParticipating: 0,
          loading: false
        })
      }
    }

    if (mounted) {
      fetchReferralStats()
    }
  }, [mounted])

  // Redirecionar usuários logados para o feed social
  useEffect(() => {
    if (mounted && isReady && user) {
      router.push('/feed')
      return
    }
  }, [user, isReady, router, mounted])

  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (loading || !mounted) {
    return <DashboardSkeleton />
  }

  // Se usuário está logado, não mostrar nada (já foi redirecionado)
  if (user) {
    return null
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <BrandLogo width={40} height={40} />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">ConfiLar</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/sobre" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                Sobre
              </Link>
              <Link href="/ajuda" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                Ajuda
              </Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" asChild className="text-gray-700 hover:text-gray-900">
                <Link href="/auth">Entrar</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/auth?tab=register">Criar Conta</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/sobre" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                  Sobre
                </Link>
                <Link href="/ajuda" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                  Ajuda
                </Link>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Button variant="ghost" asChild className="justify-start text-gray-700">
                    <Link href="/auth">Entrar</Link>
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white justify-start">
                    <Link href="/auth?tab=register">Criar Conta</Link>
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Explicação Didática */}
      <section className="relative py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                O que é o{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ConfiLar
                </span>?
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 max-w-4xl mx-auto font-medium">
                Uma plataforma <strong>transparente e confiável</strong> que conecta pessoas que precisam de serviços 
                com profissionais qualificados através de <strong>indicações, recomendações e anúncios</strong>.
              </p>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                Aqui você encontra profissionais verificados, pode ver quem já contratou, ler recomendações reais 
                e publicar seus próprios anúncios de serviços de forma segura.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6">
                  <Link href="/auth?tab=register">
                    Começar Agora Grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-2">
                  <Link href="/buscar">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Profissionais
                  </Link>
                </Button>
              </div>

              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12">
                <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {statsLoading ? '...' : formatStatNumber(professionalsCount)}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">Profissionais</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Verificados na plataforma</div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {statsLoading ? '...' : formatStatNumber(reviewsCount)}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">Avaliações</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Experiências compartilhadas</div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {statsLoading ? '...' : formatStatNumber(citiesCount)}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">Cidades</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Em todo o Brasil</div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                      {statsLoading ? '...' : formatStatNumber(servicesCount)}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">Serviços</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Diferentes categorias</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Como Funciona - Didática */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Como o ConfiLar Funciona?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Uma plataforma simples, transparente e focada em <strong>confiança</strong>. Veja as principais formas de usar:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* 1. Transparência */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-center">🔍 Transparência Total</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Veja <strong>quem já contratou</strong> cada profissional, <strong>quem recomendou</strong> e 
                  todas as <strong>avaliações reais</strong>. Nada fica escondido - você decide com todas as informações.
                </p>
              </CardContent>
            </Card>

            {/* 2. Indicações */}
            <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-center">🤝 Sistema de Indicações</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Indique amigos</strong> e ganhe pontos, badges e benefícios! Quanto mais pessoas você indicar, 
                  mais você ganha. É um programa de recompensas baseado em confiança.
                </p>
              </CardContent>
            </Card>

            {/* 3. Recomendações */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-center">👍 Recomendações Públicas</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Depois de contratar um profissional, você pode <strong>recomendá-lo publicamente</strong>. 
                  Sua recomendação aparece no perfil dele para todos verem, criando um histórico de confiança.
                </p>
              </CardContent>
            </Card>

            {/* 4. Anúncios de Serviços */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-center">📢 Anúncios de Serviços</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Publique anúncios</strong> oferecendo seus serviços ou <strong>busque anúncios</strong> de quem 
                  precisa. Anúncios premium aparecem destacados e têm maior visibilidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção: Principais Funcionalidades Detalhadas */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nossas Principais Funcionalidades
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Tudo que você precisa para encontrar ou oferecer serviços com segurança e transparência.
            </p>
          </div>

          <div className="space-y-8">
            {/* 1. Transparência e Confiança */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Transparência e Confiança
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                      No ConfiLar, <strong>tudo é transparente</strong>. Você pode ver:
                    </p>
                    <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Quem já contratou</strong> cada profissional - você vê nomes, fotos e datas</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Todas as avaliações e comentários</strong> de quem já usou o serviço</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Histórico completo</strong> de trabalhos realizados e recomendações recebidas</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Verificação de identidade</strong> para garantir que o profissional é quem diz ser</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Sistema de Indicações e Recomendações */}
            <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Indicações e Recomendações
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                      Duas formas poderosas de construir confiança na plataforma:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Gift className="h-5 w-5 text-green-600" />
                          Programa de Indicações
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Indique amigos</strong> e ganhe recompensas:
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                          <li>• Ganhe pontos por cada indicação</li>
                          <li>• Desbloqueie badges exclusivos</li>
                          <li>• Suba de nível (Bronze, Prata, Ouro, Platina, Diamante)</li>
                          <li>• Acesse benefícios especiais</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <ThumbsUp className="h-5 w-5 text-purple-600" />
                          Recomendações Públicas
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Recomende profissionais</strong> que você contratou:
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                          <li>• Sua recomendação aparece publicamente</li>
                          <li>• Ajuda outros usuários a escolherem melhor</li>
                          <li>• Cria um histórico confiável para o profissional</li>
                          <li>• Você contribui para a transparência da plataforma</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Anúncios de Serviços */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Anúncios de Serviços entre Usuários
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                      Publique ou encontre serviços de forma simples e organizada:
                    </p>
                    <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Ofereça seus serviços:</strong> Crie anúncios detalhados com fotos, descrição e preços</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Solicite serviços:</strong> Publique o que você precisa e receba propostas</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Anúncios Premium:</strong> Destaque seu anúncio para maior visibilidade</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Busca inteligente:</strong> Filtre por categoria, localização e tipo de anúncio</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Card do Programa de Referal */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🎁 Programa de Indicações
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Indique amigos e ganhe recompensas incríveis! Quanto mais você indica, mais benefícios você recebe.
            </p>
          </div>

          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Como Funciona?
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Cadastre-se</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Crie sua conta gratuitamente e receba seu código único de indicação
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Indique Amigos</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Compartilhe seu código com amigos. Quando eles se cadastrarem usando seu código, você ganha pontos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Ganhe Recompensas</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Acumule pontos, desbloqueie badges e suba de nível (Bronze → Prata → Ouro → Platina → Diamante)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Benefícios Exclusivos</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cada nível desbloqueia benefícios especiais, como anúncios premium grátis e maior visibilidade
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 text-center">
                    Estatísticas do Programa
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {referralStats.loading ? (
                          <span className="text-gray-400">...</span>
                        ) : (
                          formatStatNumber(referralStats.totalReferrals)
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total de Indicações</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {referralStats.loading ? (
                          <span className="text-gray-400">...</span>
                        ) : (
                          formatStatNumber(referralStats.totalUsersParticipating)
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Usuários Participando</div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href="/auth?tab=register">
                        Começar a Indicar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção: Por que escolher o ConfiLar */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Por que escolher o ConfiLar?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">100% Transparente</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Veja tudo: quem contratou, quem recomendou, todas as avaliações. 
                  Nada fica escondido - você decide com todas as informações.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Profissionais Verificados</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistema de verificação de identidade garante que você está lidando 
                  com pessoas reais e confiáveis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Comunicação Direta</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistema de mensagens integrado para você negociar e fechar acordos 
                  diretamente com os profissionais.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de pessoas que já confiam no ConfiLar para encontrar 
            os melhores profissionais ou oferecer seus serviços.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
              <Link href="/auth?tab=register">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
              <Link href="/buscar">
                <Search className="mr-2 h-5 w-5" />
                Explorar Agora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <BrandLogo width={40} height={40} />
                </div>
                <span className="text-xl font-bold">ConfiLar</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Plataforma transparente que conecta clientes e profissionais através de 
                indicações, recomendações e anúncios de serviços. Confiança e transparência em primeiro lugar.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">Sobre Nós</Link></li>
                <li><Link href="/ajuda" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/termos" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link href="/buscar" className="text-gray-400 hover:text-white transition-colors">Buscar</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:contato@appconfilar.com.br" className="hover:text-white transition-colors">
                    contato@appconfilar.com.br
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2024 ConfiLar. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
      </div>
    </PublicLayout>
  )
}

export default function HomePage() {
  return (
    <HomePageLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <HomeContent />
      </Suspense>
    </HomePageLayout>
  )
}
