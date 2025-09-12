'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconShield, IconUsers, IconBolt, IconMapPin, IconPhone, IconMail } from '@tabler/icons-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function SobrePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-yellow-400">
        <div className="bg-white border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <span className="text-yellow-400 font-black text-xl">C</span>
                </div>
                <span className="text-2xl font-black text-black uppercase">CONFILAR</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-black mb-6 uppercase animate-fade-in">
              CONECTANDO PROFISSIONAIS E CLIENTES
            </h1>
            <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto leading-relaxed mb-8 font-bold animate-fade-in">
              A plataforma que facilita a contratação de serviços domésticos e comerciais de forma segura e confiável
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-400">
      {/* Header Brutalista */}
      <div className="bg-white border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                <span className="text-yellow-400 font-black text-xl">C</span>
              </div>
              <span className="text-2xl font-black text-black uppercase animate-fade-in">CONFILAR</span>
            </div>
            <div className="flex space-x-4">
              {mounted && (
                <>
                  <button className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase">
                    <Link href="/auth/auth">ENTRAR</Link>
                  </button>
                  <button className="px-4 py-2 text-sm font-black text-white bg-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase">
                    <Link href="/auth?tab=register">CRIAR CONTA</Link>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black text-black mb-6 uppercase animate-fade-in">
            CONECTANDO PROFISSIONAIS E CLIENTES
          </h1>
          <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto leading-relaxed mb-8 font-bold animate-fade-in">
            A plataforma que facilita a contratação de serviços domésticos e comerciais de forma segura e confiável
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {mounted && (
              <>
                <button className="px-8 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse uppercase">
                  <Link href="/auth?tab=register">COMEÇAR AGORA</Link>
                </button>
                <button className="px-8 py-4 text-lg font-black text-black bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse uppercase">
                  <Link href="/buscar">BUSCAR PROFISSIONAIS</Link>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-black text-center text-black mb-12 uppercase animate-fade-in">
          POR QUE ESCOLHER O CONFILAR?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 text-center animate-slide-in-up">
            <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-4 animate-pulse">
              <IconShield size={32} stroke={2} className="text-yellow-400 animate-spin" />
            </div>
            <h3 className="text-xl font-black text-black uppercase mb-4">SEGURANÇA GARANTIDA</h3>
            <p className="text-black font-bold">
              Todos os profissionais são verificados e as transações são protegidas para sua tranquilidade
            </p>
          </div>

          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 text-center animate-slide-in-up" style={{animationDelay: '0.1s'}}>
            <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-4 animate-pulse">
              <IconUsers size={32} stroke={2} className="text-yellow-400 animate-spin" />
            </div>
            <h3 className="text-xl font-black text-black uppercase mb-4">PROFISSIONAIS QUALIFICADOS</h3>
            <p className="text-black font-bold">
              Acesso a uma rede de profissionais experientes e bem avaliados pelos clientes
            </p>
          </div>

          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 text-center animate-slide-in-up" style={{animationDelay: '0.2s'}}>
            <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-4 animate-pulse">
              <IconBolt size={32} stroke={2} className="text-yellow-400 animate-spin" />
            </div>
            <h3 className="text-xl font-black text-black uppercase mb-4">PROCESSO RÁPIDO</h3>
            <p className="text-black font-bold">
              Cadastro simples e navegação intuitiva para encontrar o que você precisa rapidamente
            </p>
          </div>
        </div>
      </div>

      {/* Serviços */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-black text-center text-black mb-12 uppercase animate-fade-in">
          SERVIÇOS DISPONÍVEIS
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
            <div key={index} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all p-6 text-center animate-slide-in-up" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-lg font-black mb-2 text-black uppercase">{service.title}</h3>
              <p className="text-black font-bold">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Final */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-black border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center text-white">
          <h2 className="text-3xl font-black mb-4 uppercase animate-fade-in">
            PRONTO PARA COMEÇAR?
          </h2>
          <p className="text-xl mb-8 font-bold animate-fade-in">
            Junte-se a milhares de usuários que já confiam no ConfiLar
          </p>
          {mounted && (
            <button className="px-8 py-4 text-lg font-black text-black bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse uppercase">
              <Link href="/auth?tab=register">CRIAR CONTA GRATUITA</Link>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black text-white py-12 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <span className="text-black font-black">C</span>
                </div>
                <span className="text-xl font-black uppercase">CONFILAR</span>
              </div>
              <p className="text-yellow-400 font-bold">
                Conectando profissionais e clientes de forma segura e confiável.
              </p>
            </div>
            
            <div>
              <h3 className="font-black mb-4 uppercase">LINKS ÚTEIS</h3>
              <ul className="space-y-2 text-yellow-400">
                {mounted && (
                  <>
                    <li><Link href="/sobre" className="hover:text-white font-bold">SOBRE NÓS</Link></li>
                    <li><Link href="/buscar" className="hover:text-white font-bold">BUSCAR PROFISSIONAIS</Link></li>
                    <li><Link href="/classificados" className="hover:text-white font-bold">CLASSIFICADOS</Link></li>
                    <li><Link href="/editarperfil" className="hover:text-white font-bold">MEU PERFIL</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-black mb-4 uppercase">SUPORTE</h3>
              <ul className="space-y-2 text-yellow-400">
                {mounted && (
                  <>
                    <li><Link href="/ajuda" className="hover:text-white font-bold">CENTRAL DE AJUDA</Link></li>
                    <li><Link href="/_public/contato" className="hover:text-white font-bold">CONTATO</Link></li>
                    <li><Link href="/ajuda" className="hover:text-white font-bold">TERMOS DE USO</Link></li>
                    <li><Link href="/ajuda" className="hover:text-white font-bold">POLÍTICA DE PRIVACIDADE</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-black mb-4 uppercase">CONTATO</h3>
              <div className="space-y-2 text-yellow-400">
                <div className="flex items-center space-x-2">
                  <IconMail size={16} stroke={2} />
                  <span className="font-bold">contato@confilar.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <IconPhone size={16} stroke={2} />
                  <span className="font-bold">(11) 99999-9999</span>
                </div>
                <div className="flex items-center space-x-2">
                  <IconMapPin size={16} stroke={2} />
                  <span className="font-bold">São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t-4 border-yellow-400 mt-8 pt-8 text-center text-yellow-400">
            <p className="font-black uppercase">© 2024 CONFILAR. TODOS OS DIREITOS RESERVADOS.</p>
          </div>
        </div>
      </div>
      
      {/* Animações CSS Brutalistas */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}