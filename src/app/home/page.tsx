'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
import { ResponsiveContainer } from '@/components/layout/ResponsiveLayout'
import {
  IconSearch,
  IconUsers,
  IconUserCheck,
  IconMessageCircle,
  IconArrowRight,
  IconBriefcase,
  IconStar,
  IconTrendingUp,
  IconCalendar,
  IconFileText,
} from '@tabler/icons-react'

export default function HomePage() {
  const router = useRouter()

  const handleNavigateTo = (path: string) => {
    console.log('🔄 Navegando para:', path)
    router.push(path)
  }

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-yellow-400">
        <ResponsiveContainer spacing="lg" maxWidth="full">
          {/* Header Brutalista */}
          <div className="text-center py-12 lg:py-16">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 lg:p-12 animate-slide-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-black text-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 animate-pulse">
                <IconUsers size={16} stroke={2} className="mr-2" />
                <span className="font-black uppercase text-sm">PLATAFORMA CONFILAR</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-black mb-6 uppercase animate-fade-in">
                COMO FUNCIONA O CONFILAR
              </h1>
              <p className="text-lg lg:text-xl text-black max-w-4xl mx-auto leading-relaxed font-bold animate-fade-in">
                Conectamos clientes e profissionais de forma segura e confiável. 
                Aprenda como usar nossa plataforma para encontrar os melhores profissionais ou oferecer seus serviços.
              </p>
            </div>
          </div>

          {/* Seção: Para Clientes */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-black text-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 animate-pulse">
                <IconUsers size={16} stroke={2} className="mr-2" />
                <span className="font-black uppercase text-sm">PARA CLIENTES</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black mb-6 text-black uppercase animate-fade-in">COMO ENCONTRAR UM PROFISSIONAL</h2>
              <p className="text-lg lg:text-xl text-black max-w-3xl mx-auto font-bold animate-fade-in">
                Siga estes passos para encontrar o profissional ideal para seu projeto
              </p>
            </div>

            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Passo 1 */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 h-full animate-slide-in-up">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconUserCheck size={24} stroke={2} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black uppercase">1. COMPLETE SEU PERFIL</h3>
                    <div className="inline-block px-2 py-1 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase">
                      ESSENCIAL
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <p className="text-black leading-relaxed font-bold">
                    Acesse <strong>Editar Perfil</strong> e mantenha todos seus dados atualizados:
                  </p>
                  <ul className="text-sm space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Informações pessoais completas</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Foto de perfil profissional</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Localização e contatos</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Preferências de serviço</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => handleNavigateTo('/editarperfil')}
                    className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all mt-6 animate-pulse"
                  >
                    EDITAR PERFIL
                    <IconArrowRight size={20} stroke={2} className="ml-2 inline animate-bounce" />
                  </button>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 h-full animate-slide-in-up" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconSearch size={24} stroke={2} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black uppercase">2. BUSQUE PROFISSIONAIS</h3>
                    <div className="inline-block px-2 py-1 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase">
                      ENCONTRAR
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <p className="text-black leading-relaxed font-bold">
                    Use nossa <strong>Busca Avançada</strong> para encontrar profissionais:
                  </p>
                  <ul className="text-sm space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Filtre por categoria de serviço</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Defina sua localização</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Veja avaliações e portfólios</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Compare preços e disponibilidade</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => handleNavigateTo('/buscar')}
                    className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all mt-6 animate-pulse"
                  >
                    BUSCAR PROFISSIONAIS
                    <IconArrowRight size={20} stroke={2} className="ml-2 inline animate-bounce" />
                  </button>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 h-full animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconMessageCircle size={24} stroke={2} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black uppercase">3. ENTRE EM CONTATO</h3>
                    <div className="inline-block px-2 py-1 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase">
                      COMUNICAR
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <p className="text-black leading-relaxed font-bold">
                    <strong>Converse diretamente</strong> com os profissionais:
                  </p>
                  <ul className="text-sm space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Envie mensagens privadas</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Solicite orçamentos detalhados</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Agende reuniões ou visitas</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Negocie prazos e condições</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => handleNavigateTo('/mensagens')}
                    className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all mt-6 animate-pulse"
                  >
                    VER MENSAGENS
                    <IconArrowRight size={20} stroke={2} className="ml-2 inline animate-bounce" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Seção: Para Profissionais */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-black text-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 animate-pulse">
                <IconBriefcase size={16} stroke={2} className="mr-2" />
                <span className="font-black uppercase text-sm">PARA PROFISSIONAIS</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black mb-6 text-black uppercase animate-fade-in">COMO OFERECER SEUS SERVIÇOS</h2>
              <p className="text-lg lg:text-xl text-black max-w-3xl mx-auto font-bold animate-fade-in">
                Siga estes passos para expandir seu negócio e encontrar mais clientes
              </p>
            </div>

            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Passo 1 */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 h-full animate-slide-in-up">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconFileText size={24} stroke={2} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black uppercase">1. CRIE SEU PORTFÓLIO</h3>
                    <div className="inline-block px-2 py-1 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase">
                      APRESENTAR
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <p className="text-black leading-relaxed font-bold">
                    Acesse <strong>Meu Portfólio</strong> e mostre seu trabalho:
                  </p>
                  <ul className="text-sm space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Adicione fotos dos seus trabalhos</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Descreva seus serviços</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Defina seus preços</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Mostre sua experiência</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => handleNavigateTo('/portfolio')}
                    className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all mt-6 animate-pulse"
                  >
                    CRIAR PORTFÓLIO
                    <IconArrowRight size={20} stroke={2} className="ml-2 inline animate-bounce" />
                  </button>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 h-full animate-slide-in-up" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconStar size={24} stroke={2} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black uppercase">2. CONSTRUA REPUTAÇÃO</h3>
                    <div className="inline-block px-2 py-1 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase">
                      CRESCER
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <p className="text-black leading-relaxed font-bold">
                    Use nossa <strong>Sistema de Avaliações</strong> para crescer:
                  </p>
                  <ul className="text-sm space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Receba avaliações dos clientes</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Responda aos comentários</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Mantenha alta qualidade</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Construa confiança</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => handleNavigateTo('/reputacao')}
                    className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all mt-6 animate-pulse"
                  >
                    VER REPUTAÇÃO
                    <IconArrowRight size={20} stroke={2} className="ml-2 inline animate-bounce" />
                  </button>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 h-full animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconTrendingUp size={24} stroke={2} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black uppercase">3. ACOMPANHE CRESCIMENTO</h3>
                    <div className="inline-block px-2 py-1 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase">
                      CRESCER
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <p className="text-black leading-relaxed font-bold">
                    Monitore seu <strong>Desempenho</strong> e crescimento:
                  </p>
                  <ul className="text-sm space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Veja suas estatísticas</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Acompanhe seu crescimento</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Analise tendências</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-black border border-black mr-3"></div>
                      <span className="font-bold">Planeje crescimento</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => handleNavigateTo('/dashboard')}
                    className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all mt-6 animate-pulse"
                  >
                    VER DASHBOARD
                    <IconArrowRight size={20} stroke={2} className="ml-2 inline animate-bounce" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <div className="text-center py-12">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 lg:p-12 animate-slide-in-up">
              <h3 className="text-3xl lg:text-4xl font-black mb-6 text-black uppercase animate-fade-in">
                PRONTO PARA COMEÇAR?
              </h3>
              <p className="text-lg lg:text-xl text-black mb-8 max-w-2xl mx-auto font-bold animate-fade-in">
                Junte-se à comunidade ConfiLar e descubra como podemos ajudar você
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <button 
                  onClick={() => handleNavigateTo('/buscar')}
                  className="px-8 py-3 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse"
                >
                  BUSCAR PROFISSIONAIS
                </button>
                <button 
                  onClick={() => handleNavigateTo('/editarperfil')}
                  className="px-8 py-3 text-lg font-black text-black bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse"
                >
                  CRIAR PERFIL
                </button>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
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
    </MainLayout>
  )
}
