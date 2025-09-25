'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MainLayout } from '@/components/layout/MainLayout'
import { 
  MessageCircle, 
  Shield, 
  Users, 
  Star, 
  Award, 
  Settings, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Info, 
  Check, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Smartphone, 
  Home, 
  Building, 
  Globe, 
  ChevronsDown, 
  Image, 
  Layout, 
  Bold, 
  Italic, 
  Underline, 
  LogOut 
} from 'lucide-react'
import { ClientOnly } from '@/components/ClientOnly'

export default function AjudaPage() {
  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header da Página */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Info className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Central de Ajuda
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Encontre respostas para suas dúvidas sobre o ConfiLar
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Seção: Como Funciona */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Info className="h-6 w-6 text-blue-600" />
                    </div>
                    Como Funciona o ConfiLar?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    O ConfiLar é uma plataforma que conecta clientes diretamente com profissionais 
                    qualificados, eliminando intermediários e facilitando a contratação de serviços.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Para Clientes</h4>
                        <p className="text-sm text-gray-600">
                          Encontre profissionais verificados, compare preços e contrate com segurança
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Star className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Para Profissionais</h4>
                        <p className="text-sm text-gray-600">
                          Divulgue seus serviços, receba pedidos e gerencie sua agenda
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seção: Recursos Principais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Zap className="h-6 w-6 text-yellow-600" />
                    </div>
                    Recursos Principais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Busca inteligente de profissionais</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Sistema de mensagens integrado</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Agendamento online</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Avaliações e recomendações</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Perfis verificados e seguros</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Sistema de classificação de serviços</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Notificações em tempo real</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Sistema de favoritos</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seção: Como Usar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    Como Usar a Plataforma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Crie sua conta</h4>
                        <p className="text-gray-600">
                          Registre-se como cliente ou profissional e complete seu perfil com informações detalhadas.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Busque ou ofereça serviços</h4>
                        <p className="text-gray-600">
                          Use nossa busca inteligente para encontrar profissionais ou divulgue seus serviços.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Converse e negocie</h4>
                        <p className="text-gray-600">
                          Use nosso sistema de mensagens para conversar diretamente com profissionais ou clientes.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Contrate e avalie</h4>
                        <p className="text-gray-600">
                          Feche o acordo e após o serviço, avalie a experiência para ajudar outros usuários.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seção: Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    Precisa de Mais Ajuda?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    Nossa equipe de suporte está sempre pronta para ajudar você.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">suporte@confilar.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Chat</p>
                        <p className="text-sm text-gray-600">Suporte online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Telefone</p>
                        <p className="text-sm text-gray-600">(11) 99999-9999</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </ClientOnly>
  )
}