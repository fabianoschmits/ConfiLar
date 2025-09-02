'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MainLayout } from '@/components/layout/MainLayout'
import { 
  MessageSquare, 
  Shield, 
  Users, 
  Star, 
  Award, 
  Settings, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Info, 
  CheckCircle, 
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
  ChevronsUpDown, 
  ImageIcon, 
  Layout, 
  Bold, 
  Italic, 
  Underline, 
  LogOut 
} from 'lucide-react'

export default function AjudaPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Central de Ajuda</h1>
            <p className="text-xl text-gray-600">
              Encontre respostas para suas dúvidas sobre o ConfiLar
            </p>
          </div>

          <div className="grid gap-6">
            {/* Seção: Como Funciona */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Como Funciona o ConfiLar?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  O ConfiLar é uma plataforma que conecta clientes diretamente com profissionais 
                  qualificados, eliminando intermediários e facilitando a contratação de serviços.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Para Clientes</h4>
                      <p className="text-sm text-gray-600">
                        Encontre profissionais verificados, compare preços e contrate com segurança
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Star className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Para Profissionais</h4>
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
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recursos Principais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Busca inteligente de profissionais</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Sistema de mensagens integrado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Agendamento online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Avaliações e recomendações</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Perfis verificados e seguros</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Sistema de classificação de serviços</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Notificações em tempo real</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Suporte ao cliente 24/7</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção: Dúvidas Frequentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Dúvidas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Como posso contratar um profissional?</h4>
                    <p className="text-gray-600 text-sm">
                      Use a busca para encontrar profissionais, visualize seus perfis e avaliações, 
                      e inicie uma conversa através do chat integrado.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Como funciona o sistema de pagamentos?</h4>
                    <p className="text-gray-600 text-sm">
                      Os pagamentos são negociados diretamente entre cliente e profissional. 
                      O ConfiLar não cobra taxas sobre transações.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Como posso verificar a qualidade de um profissional?</h4>
                    <p className="text-gray-600 text-sm">
                      Verifique as avaliações, recomendações de outros usuários, histórico de trabalho 
                      e documentos de verificação no perfil do profissional.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção: Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Precisa de Mais Ajuda?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Nossa equipe de suporte está sempre pronta para ajudar você.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email de Suporte
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat Online
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}






