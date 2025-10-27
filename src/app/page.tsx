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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  ThumbsUp,
  Menu,
  X,
  ChevronDown,
  Play,
  Globe,
  Smartphone,
  Laptop,
  Tablet
} from 'lucide-react'
import { services, getServicesGroupedByCategory } from '@/data/services'
import { useHomeStats, formatStatNumber } from '@/hooks/useHomeStats'
import { DashboardSkeleton } from '@/components/ui/skeleton'

function HomeContent() {
  const router = useRouter()
  const { user, loading, isReady, error } = useAuthContext()
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const { professionalsCount, reviewsCount, citiesCount, servicesCount, loading: statsLoading } = useHomeStats()

  useEffect(() => {
    setMounted(true)
  }, [])

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
            <Image
              src="/imagens/logo/confilarlogo5.png"
              alt="ConfiLar Logo"
              width={40}
              height={40}
              priority
              className="w-full h-full object-contain"
            />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">ConfiLar</span>
              </Link>
            </div>

            {/* Desktop Navigation - Simplificado */}
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
                <Link href="/auth">Criar Conta</Link>
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

          {/* Mobile Menu - Simplificado */}
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
                    <Link href="/auth">Criar Conta</Link>
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Conecte-se com{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Profissionais
                </span>{' '}
                de Confiança
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                A plataforma que conecta clientes e profissionais qualificados de forma segura, 
                transparente e eficiente. Encontre os melhores serviços ou ofereça seus talentos.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                  <Link href="/auth">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3">
                  <Link href="/buscar">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Profissionais
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {statsLoading ? '...' : formatStatNumber(professionalsCount)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Profissionais</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {statsLoading ? '...' : formatStatNumber(reviewsCount)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avaliações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {statsLoading ? '...' : formatStatNumber(citiesCount)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cidades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {statsLoading ? '...' : formatStatNumber(servicesCount)}
                  </div>
                  <div className="text-sm text-gray-600">Serviços Oferecidos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Por que escolher o ConfiLar?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece todas as ferramentas necessárias para conectar 
              clientes e profissionais de forma segura e eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Segurança Garantida</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Sistema de verificação de identidade e avaliações para garantir 
                  a confiabilidade de todos os profissionais.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Busca Inteligente</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Encontre profissionais por localização, especialidade e avaliações 
                  com nosso sistema de busca avançado.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Comunicação Direta</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Sistema de mensagens integrado para facilitar a comunicação 
                  entre clientes e profissionais.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sistema de Avaliações</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Avalie e seja avaliado para construir uma reputação sólida 
                  na plataforma.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Classificados</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Publique ofertas de serviços ou solicitações de forma 
                  organizada e eficiente.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Favoritos</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Salve seus profissionais favoritos para contatar 
                  facilmente no futuro.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Categorias de Serviços
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encontre profissionais especializados em diversas áreas de atuação.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {services.slice(0, 12).map((service) => (
              <Card key={service.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <h3 className="text-xs font-medium text-gray-900 leading-tight">{service.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => setShowServicesModal(true)}
            >
              Ver Todas as Categorias
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simples, rápido e seguro. Veja como é fácil usar nossa plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Crie sua Conta</h3>
              <p className="text-gray-600 text-sm">
                Cadastre-se gratuitamente como cliente ou profissional 
                e complete seu perfil.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Busque ou Ofereça</h3>
              <p className="text-gray-600 text-sm">
                Encontre profissionais qualificados ou publique 
                seus serviços na plataforma.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conecte-se</h3>
              <p className="text-gray-600 text-sm">
                Entre em contato, negocie e realize o serviço 
                com segurança e transparência.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sistema de Recomendações e Favoritos */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Sistema de Confiança e Credibilidade
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma oferece ferramentas transparentes para você tomar decisões mais seguras 
              e confiáveis ao escolher profissionais.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Sistema de Recomendações */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Sistema de Recomendações</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Recomendações Públicas</h4>
                    <p className="text-sm text-gray-600">
                      Usuários podem recomendar profissionais que já contrataram, 
                      criando um histórico público de experiências positivas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Transparência Total</h4>
                    <p className="text-sm text-gray-600">
                      Você pode ver exatamente quem recomendou cada profissional, 
                      incluindo nome, foto e data da recomendação.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Credibilidade Comprovada</h4>
                    <p className="text-sm text-gray-600">
                      Cada recomendação é uma prova real de qualidade, 
                      ajudando você a escolher profissionais confiáveis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sistema de Favoritos */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Sistema de Favoritos</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-yellow-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Lista Pessoal</h4>
                    <p className="text-sm text-gray-600">
                      Salve profissionais que chamaram sua atenção em sua lista de favoritos 
                      para consultar facilmente depois.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-yellow-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Visibilidade Pública</h4>
                    <p className="text-sm text-gray-600">
                      Profissionais podem ver quantas pessoas os adicionaram aos favoritos, 
                      aumentando sua credibilidade na plataforma.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-yellow-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Indicador de Popularidade</h4>
                    <p className="text-sm text-gray-600">
                      O número de favoritos serve como um indicador de qualidade e 
                      popularidade entre os usuários da plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefícios do Sistema */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
              Por que isso é importante para você?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Mais Segurança</h4>
                <p className="text-sm text-gray-600">
                  Veja quem já contratou e aprovou o profissional antes de tomar sua decisão.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Comunidade Ativa</h4>
                <p className="text-sm text-gray-600">
                  Participe de uma rede de usuários que compartilham experiências reais.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Qualidade Garantida</h4>
                <p className="text-sm text-gray-600">
                  Profissionais com mais recomendações e favoritos são mais confiáveis.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Quer começar a usar essas ferramentas para encontrar os melhores profissionais?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/auth">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/buscar">
                  <Search className="mr-2 h-4 w-4" />
                  Explorar Profissionais
                </Link>
              </Button>
            </div>
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
            <Image
              src="/imagens/logo/confilarlogo5.png"
              alt="ConfiLar Logo"
              width={40}
              height={40}
              priority
              className="w-full h-full object-contain"
            />
                </div>
                <span className="text-xl font-bold">ConfiLar</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                A plataforma que conecta clientes e profissionais de forma segura, 
                transparente e eficiente. Construa relacionamentos de confiança.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">Sobre</Link></li>
                <li><Link href="/ajuda" className="text-gray-400 hover:text-white transition-colors">Ajuda</Link></li>
                <li><Link href="/buscar" className="text-gray-400 hover:text-white transition-colors">Buscar</Link></li>
                <li><Link href="/classificados" className="text-gray-400 hover:text-white transition-colors">Classificados</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  contato@appconfilar.com.br
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  (11) 99999-9999
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

      {/* Modal de Todas as Categorias */}
      {showServicesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Todas as Categorias de Serviços</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Explore todos os serviços disponíveis na plataforma</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowServicesModal(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-8">
                {Object.entries(getServicesGroupedByCategory()).map(([category, categoryServices]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span className="text-2xl mr-3">{categoryServices[0]?.icon}</span>
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {categoryServices.map((service) => (
                        <Card 
                          key={service.id} 
                          className="border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => {
                            setShowServicesModal(false)
                            router.push(`/buscar?service=${service.id}`)
                          }}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="text-xl mb-2">{service.icon}</div>
                            <h4 className="text-xs font-medium text-gray-900 dark:text-white leading-tight">{service.name}</h4>
                            {service.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{service.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Total de {services.length} serviços disponíveis
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowServicesModal(false)}
                >
                  Fechar
                </Button>
                <Button 
                  onClick={() => {
                    setShowServicesModal(false)
                    router.push('/buscar')
                  }}
                >
                  Buscar Profissionais
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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