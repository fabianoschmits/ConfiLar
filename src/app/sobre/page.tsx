'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Users, Zap, Star, CheckCircle, MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'

export default function SobrePage() {
  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">ConfiLar</span>
              </div>
              <div className="flex space-x-4">
                <Link href="/auth/auth">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link href="/auth/cadastro">
                  <Button>Criar Conta</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Conectando Profissionais e Clientes
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              A plataforma que facilita a contratação de serviços domésticos e comerciais de forma segura e confiável
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/cadastro">
                <Button size="lg" className="text-lg px-8 py-4">
                  Começar Agora
                </Button>
              </Link>
              <Link href="/buscar">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Buscar Profissionais
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher o ConfiLar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Segurança Garantida</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Todos os profissionais são verificados e as transações são protegidas para sua tranquilidade
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Profissionais Qualificados</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Acesso a uma rede de profissionais experientes e bem avaliados pelos clientes
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Processo Rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Cadastro simples e navegação intuitiva para encontrar o que você precisa rapidamente
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Serviços */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Serviços Disponíveis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🏠', title: 'Limpeza', desc: 'Limpeza residencial e comercial' },
              { icon: '🔧', title: 'Manutenção', desc: 'Reparos e manutenção geral' },
              { icon: '🎨', title: 'Decoração', desc: 'Design e decoração de interiores' },
              { icon: '🌱', title: 'Jardinagem', desc: 'Cuidados com plantas e jardim' },
              { icon: '📱', title: 'Tecnologia', desc: 'Suporte técnico e TI' },
              { icon: '🚗', title: 'Transporte', desc: 'Serviços de transporte' },
              { icon: '📚', title: 'Educação', desc: 'Professores particulares e tutores' }
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-blue-600">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a milhares de usuários que já confiam no ConfiLar
            </p>
            <Link href="/auth/cadastro">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Criar Conta Gratuita
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">C</span>
                  </div>
                  <span className="text-xl font-bold">ConfiLar</span>
                </div>
                <p className="text-gray-400">
                  Conectando profissionais e clientes de forma segura e confiável.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Links Úteis</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/sobre" className="hover:text-white">Sobre Nós</Link></li>
                  <li><Link href="/buscar" className="hover:text-white">Buscar Profissionais</Link></li>
                  <li><Link href="/classificados" className="hover:text-white">Classificados</Link></li>
                  <li><Link href="/editarperfil" className="hover:text-white">Meu Perfil</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Suporte</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/ajuda" className="hover:text-white">Central de Ajuda</Link></li>
                  <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
                  <li><Link href="/termos" className="hover:text-white">Termos de Uso</Link></li>
                  <li><Link href="/privacidade" className="hover:text-white">Política de Privacidade</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Contato</h3>
                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>contato@confilar.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>(11) 99999-9999</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>São Paulo, SP</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>© 2024 ConfiLar. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}






