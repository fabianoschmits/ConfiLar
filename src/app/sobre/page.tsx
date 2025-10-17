'use client'

import { Shield, Users, Zap, MapPin, Phone, Mail, CheckCircle } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function SobrePage() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuthContext()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Se o usuário estiver logado, usar MainLayout
  if (user) {
    return (
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header da Página */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                Sobre o ConfiLar
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                A plataforma que conecta profissionais e clientes de forma segura e confiável
              </p>
            </div>

            {/* Benefícios */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                Por que escolher o ConfiLar?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield size={32} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Segurança garantida</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Todos os profissionais são verificados e as transações são protegidas para sua tranquilidade
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users size={32} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profissionais qualificados</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Acesso a uma rede de profissionais experientes e bem avaliados pelos clientes
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Zap size={32} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Processo rápido</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Cadastro simples e navegação intuitiva para encontrar o que você precisa rapidamente
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Serviços */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                Serviços disponíveis
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: '🏠', title: 'Limpeza', desc: 'Limpeza residencial e comercial' },
                  { icon: '🔧', title: 'Manutenção', desc: 'Reparos e manutenção geral' },
                  { icon: '🌱', title: 'Jardinagem', desc: 'Cuidados com plantas e jardins' },
                  { icon: '📱', title: 'Tecnologia', desc: 'Suporte técnico e instalações' },
                  { icon: '🎨', title: 'Decoração', desc: 'Design e organização de espaços' },
                  { icon: '🚗', title: 'Transporte', desc: 'Serviços de mobilidade' },
                  { icon: '📚', title: 'Educação', desc: 'Aulas particulares e cursos' },
                  { icon: '💼', title: 'Consultoria', desc: 'Orientações profissionais' }
                ].map((service, index) => (
                  <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                    <CardContent>
                      <div className="text-4xl mb-4">{service.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{service.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contato */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Entre em contato
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" className="px-6 py-3">
                  <Link href="/ajuda">
                    <Mail className="h-5 w-5 mr-2" />
                    Central de Ajuda
                  </Link>
                </Button>
                <Button asChild className="px-6 py-3">
                  <Link href="/buscar">
                    <Users className="h-5 w-5 mr-2" />
                    Buscar Profissionais
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Se o usuário não estiver logado, mostrar página pública
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header Moderno */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">ConfiLar</span>
            </div>
            <div className="flex space-x-3">
              <Link href="/auth" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Entrar
              </Link>
              <Link href="/auth?tab=register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Conectando profissionais e clientes
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            A plataforma que facilita a contratação de serviços domésticos e comerciais de forma segura e confiável
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?tab=register" className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
              Começar agora
            </Link>
            <Link href="/buscar" className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Buscar profissionais
            </Link>
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Por que escolher o ConfiLar?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <CardContent>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Segurança garantida</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todos os profissionais são verificados e as transações são protegidas para sua tranquilidade
              </p>
            </CardContent>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <CardContent>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profissionais qualificados</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Acesso a uma rede de profissionais experientes e bem avaliados pelos clientes
              </p>
            </CardContent>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <CardContent>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap size={32} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Processo rápido</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cadastro simples e navegação intuitiva para encontrar o que você precisa rapidamente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Serviços */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Serviços disponíveis
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🏠', title: 'Limpeza', desc: 'Limpeza residencial e comercial' },
            { icon: '🔧', title: 'Manutenção', desc: 'Reparos e manutenção geral' },
            { icon: '🌱', title: 'Jardinagem', desc: 'Cuidados com plantas e jardins' },
            { icon: '📱', title: 'Tecnologia', desc: 'Suporte técnico e instalações' },
            { icon: '🎨', title: 'Decoração', desc: 'Design e organização de espaços' },
            { icon: '🚗', title: 'Transporte', desc: 'Serviços de mobilidade' },
            { icon: '📚', title: 'Educação', desc: 'Aulas particulares e cursos' },
            { icon: '💼', title: 'Consultoria', desc: 'Orientações profissionais' }
          ].map((service, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{service.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contato */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Entre em contato
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/ajuda" className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Central de Ajuda
          </Link>
          <Link href="/buscar" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Buscar Profissionais
          </Link>
        </div>
      </div>
    </div>
  )
}