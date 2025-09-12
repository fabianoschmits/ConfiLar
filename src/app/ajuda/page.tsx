'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MainLayout } from '@/components/layout/MainLayout'
import { 
  IconMessageCircle, 
  IconShield, 
  IconUsers, 
  IconStar, 
  IconAward, 
  IconSettings, 
  IconBolt, 
  IconTrendingUp, 
  IconChartBar, 
  IconInfoCircle, 
  IconCheck, 
  IconAlertCircle, 
  IconFileText, 
  IconCalendar, 
  IconPhone, 
  IconMail, 
  IconMapPin, 
  IconCreditCard, 
  IconDeviceMobile, 
  IconHome, 
  IconBuilding, 
  IconWorld, 
  IconChevronsDown, 
  IconPhoto, 
  IconLayout, 
  IconBold, 
  IconItalic, 
  IconUnderline, 
  IconLogout 
} from '@tabler/icons-react'

export default function AjudaPage() {
  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-yellow-400">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-slide-in-up">
                <h1 className="text-4xl font-black mb-4 text-black uppercase animate-fade-in">CENTRAL DE AJUDA</h1>
                <p className="text-xl text-black font-bold animate-fade-in">
                  Encontre respostas para suas dúvidas sobre o ConfiLar
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Seção: Como Funciona */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 animate-slide-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconInfoCircle size={24} stroke={2} className="text-yellow-400 animate-spin" />
                  </div>
                  <h2 className="text-xl font-black text-black uppercase">COMO FUNCIONA O CONFILAR?</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-black font-bold">
                    O ConfiLar é uma plataforma que conecta clientes diretamente com profissionais 
                    qualificados, eliminando intermediários e facilitando a contratação de serviços.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                        <IconUsers size={20} stroke={2} className="text-yellow-400 animate-spin" />
                      </div>
                      <div>
                        <h4 className="font-black text-black uppercase">PARA CLIENTES</h4>
                        <p className="text-sm text-black font-bold">
                          Encontre profissionais verificados, compare preços e contrate com segurança
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                        <IconStar size={20} stroke={2} className="text-yellow-400 animate-spin" />
                      </div>
                      <div>
                        <h4 className="font-black text-black uppercase">PARA PROFISSIONAIS</h4>
                        <p className="text-sm text-black font-bold">
                          Divulgue seus serviços, receba pedidos e gerencie sua agenda
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Recursos Principais */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 animate-slide-in-up" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconBolt size={24} stroke={2} className="text-yellow-400 animate-spin" />
                  </div>
                  <h2 className="text-xl font-black text-black uppercase">RECURSOS PRINCIPAIS</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconCheck size={16} stroke={2} className="text-black" />
                      <span className="font-bold text-black">Busca inteligente de profissionais</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck size={16} stroke={2} className="text-black" />
                      <span className="font-bold text-black">Sistema de mensagens integrado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck size={16} stroke={2} className="text-black" />
                      <span className="font-bold text-black">Agendamento online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck size={16} stroke={2} className="text-black" />
                      <span className="font-bold text-black">Avaliações e recomendações</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconCheck size={16} stroke={2} className="text-black" />
                      <span className="font-bold text-black">Perfis verificados e seguros</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck size={16} stroke={2} className="text-black" />
                      <span className="font-bold text-black">Sistema de classificação de serviços</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck size={16} stroke={2} className="text-black" />
                      <span className="font-bold text-black">Notificações em tempo real</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck size={16} stroke={2} className="text-black" />
                      <span className="font-bold text-black">Suporte ao cliente 24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Dúvidas Frequentes */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconMessageCircle size={24} stroke={2} className="text-yellow-400 animate-spin" />
                  </div>
                  <h2 className="text-xl font-black text-black uppercase">DÚVIDAS FREQUENTES</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-black mb-2 text-black uppercase">COMO POSSO CONTRATAR UM PROFISSIONAL?</h4>
                      <p className="text-black font-bold text-sm">
                        Use a busca para encontrar profissionais, visualize seus perfis e avaliações, 
                        e inicie uma conversa através do chat integrado.
                      </p>
                    </div>
                    <div className="h-1 bg-black border border-black"></div>
                    <div>
                      <h4 className="font-black mb-2 text-black uppercase">COMO FUNCIONA O SISTEMA DE PAGAMENTOS?</h4>
                      <p className="text-black font-bold text-sm">
                        Os pagamentos são negociados diretamente entre cliente e profissional. 
                        O ConfiLar não cobra taxas sobre transações.
                      </p>
                    </div>
                    <div className="h-1 bg-black border border-black"></div>
                    <div>
                      <h4 className="font-black mb-2 text-black uppercase">COMO POSSO VERIFICAR A QUALIDADE DE UM PROFISSIONAL?</h4>
                      <p className="text-black font-bold text-sm">
                        Verifique as avaliações, recomendações de outros usuários, histórico de trabalho 
                        e documentos de verificação no perfil do profissional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Contato */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all p-6 animate-slide-in-up" style={{animationDelay: '0.3s'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
                    <IconMessageCircle size={24} stroke={2} className="text-yellow-400 animate-spin" />
                  </div>
                  <h2 className="text-xl font-black text-black uppercase">PRECISA DE MAIS AJUDA?</h2>
                </div>
                <p className="text-black font-bold mb-4">
                  Nossa equipe de suporte está sempre pronta para ajudar você.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 uppercase">
                    <IconMail size={16} stroke={2} />
                    EMAIL DE SUPORTE
                  </button>
                  <button className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 uppercase">
                    <IconMessageCircle size={16} stroke={2} />
                    CHAT ONLINE
                  </button>
                  <button className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 uppercase">
                    <IconPhone size={16} stroke={2} />
                    TELEFONE
                  </button>
                </div>
              </div>
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
    </MainLayout>
  )
}






