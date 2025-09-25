'use client'

import { Shield, Users, Zap, MapPin, Phone, Mail, CheckCircle } from 'lucide-react'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function SobrePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">C</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">ConfiLar</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="modern-heading-1 text-gray-900 mb-6">
              Conectando profissionais e clientes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              A plataforma que facilita a contratação de serviços domésticos e comerciais de forma segura e confiável
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Moderno */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">ConfiLar</span>
            </div>
            <div className="flex space-x-3">
              {mounted && (
                <>
                  <Link href="/auth" className="modern-button-outline px-4 py-2">
                    Entrar
                  </Link>
                  <Link href="/auth?tab=register" className="modern-button-primary px-4 py-2">
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Conectando profissionais e clientes
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            A plataforma que facilita a contratação de serviços domésticos e comerciais de forma segura e confiável
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {mounted && (
              <>
                <Link href="/auth?tab=register" className="modern-button-primary px-8 py-4 text-lg">
                  Começar agora
                </Link>
                <Link href="/buscar" className="modern-button-outline px-8 py-4 text-lg">
                  Buscar profissionais
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <h2 className="modern-heading-2 text-center text-gray-900 mb-12">
          Por que escolher o ConfiLar?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="modern-card p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield size={32} className="text-blue-600" />
            </div>
            <h3 className="modern-heading-3 text-gray-900 mb-4">Segurança garantida</h3>
            <p className="modern-body text-gray-600">
              Todos os profissionais são verificados e as transações são protegidas para sua tranquilidade
            </p>
          </div>

          <div className="modern-card p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={32} className="text-green-600" />
            </div>
            <h3 className="modern-heading-3 text-gray-900 mb-4">Profissionais qualificados</h3>
            <p className="modern-body text-gray-600">
              Acesso a uma rede de profissionais experientes e bem avaliados pelos clientes
            </p>
          </div>

          <div className="modern-card p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={32} className="text-purple-600" />
            </div>
            <h3 className="modern-heading-3 text-gray-900 mb-4">Processo rápido</h3>
            <p className="modern-body text-gray-600">
              Cadastro simples e navegação intuitiva para encontrar o que você precisa rapidamente
            </p>
          </div>
        </div>
      </div>

      {/* Serviços */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="modern-heading-2 text-center text-gray-900 mb-12">
          Serviços disponíveis
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🏠', title: 'Limpeza', desc: 'Limpeza residencial e comercial' },
            { icon: '🔧', title: 'Manutenção', desc: 'Reparos e manutenção geral' },
            { icon: '🎨', title: 'Decoração', desc: 'Design e decoração de interiores' },
            { icon: '🌱', title: 'Jardinagem', desc: 'Cuidados com plantas e jardim' },
            { icon: '📱', title: 'Tecnologia', desc: 'Suporte técnico e TI' },
            { icon: '🚗', title: 'Transporte', desc: 'Serviços de transporte' },
            { icon: '📚', title: 'Educação', desc: 'Professores particulares e tutores' },
            { icon: '🎯', title: 'Outros', desc: 'Diversos serviços especializados' }
          ].map((service, index) => (
            <div key={index} className="modern-card p-6 text-center hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-600">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já confiam no ConfiLar para encontrar e contratar serviços
          </p>
          {mounted && (
            <Link href="/auth?tab=register" className="modern-button-primary bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Criar conta gratuita
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">C</span>
                </div>
                <span className="text-xl font-bold">ConfiLar</span>
              </div>
              <p className="text-gray-300">
                Conectando profissionais e clientes de forma segura e confiável.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Links úteis</h3>
              <ul className="space-y-2 text-gray-300">
                {mounted && (
                  <>
                    <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre nós</Link></li>
                    <li><Link href="/buscar" className="hover:text-white transition-colors">Buscar profissionais</Link></li>
                    <li><Link href="/classificados" className="hover:text-white transition-colors">Classificados</Link></li>
                    <li><Link href="/editarperfil" className="hover:text-white transition-colors">Meu perfil</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Suporte</h3>
              <ul className="space-y-2 text-gray-300">
                {mounted && (
                  <>
                    <li><Link href="/ajuda" className="hover:text-white transition-colors">Central de ajuda</Link></li>
                    <li><Link href="/_public/contato" className="hover:text-white transition-colors">Contato</Link></li>
                    <li><Link href="/ajuda" className="hover:text-white transition-colors">Termos de uso</Link></li>
                    <li><Link href="/ajuda" className="hover:text-white transition-colors">Política de privacidade</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Contato</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>contato@confilar.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>(11) 99999-9999</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 ConfiLar. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}