'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Calendar, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download,
  Mail,
  Phone
} from 'lucide-react'
import Link from 'next/link'

export default function TermosPage() {
  const { user } = useAuthContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const Layout = user ? MainLayout : PublicLayout

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
                <p className="text-gray-600">ConfiLar - Plataforma de Confiança Profissional</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Última atualização: 15 de Janeiro de 2025
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Versão 1.0
              </div>
            </div>
          </div>

          {/* Aviso Importante */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Aviso Importante</h3>
                  <p className="text-amber-700 text-sm">
                    Ao usar a plataforma ConfiLar, você concorda com estes Termos de Uso. 
                    Leia atentamente antes de prosseguir. Se não concordar com qualquer parte 
                    destes termos, não utilize nossos serviços.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-8">
              
              {/* 1. Definições */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">1</span>
                    Definições
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Para os fins destes Termos:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>"ConfiLar"</strong> refere-se à plataforma digital de conexão entre profissionais e clientes.</li>
                      <li><strong>"Usuário"</strong> é qualquer pessoa que acesse ou utilize a plataforma.</li>
                      <li><strong>"Cliente"</strong> é o usuário que busca serviços na plataforma.</li>
                      <li><strong>"Profissional"</strong> é o usuário que oferece serviços na plataforma.</li>
                      <li><strong>"Serviços"</strong> são as funcionalidades oferecidas pela plataforma.</li>
                      <li><strong>"Conteúdo"</strong> inclui textos, imagens, vídeos e outros materiais publicados.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Aceitação dos Termos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">2</span>
                    Aceitação dos Termos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Estes Termos de Uso constituem um acordo legal entre você e o ConfiLar. 
                    Ao criar uma conta, acessar ou usar nossa plataforma, você confirma que:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Leu e compreendeu estes Termos de Uso
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Concorda em cumprir todas as disposições aqui estabelecidas
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Tem capacidade legal para celebrar este acordo
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Forneceu informações verdadeiras e atualizadas
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* 3. Descrição dos Serviços */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">3</span>
                    Descrição dos Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    O ConfiLar é uma plataforma digital que conecta profissionais qualificados 
                    com clientes que buscam serviços, oferecendo:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Para Clientes:</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• Busca de profissionais por localização e especialidade</li>
                        <li>• Sistema de avaliações e recomendações</li>
                        <li>• Chat direto com profissionais</li>
                        <li>• Histórico de serviços contratados</li>
                        <li>• Sistema de favoritos</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Para Profissionais:</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• Criação de perfil profissional</li>
                        <li>• Portfólio de trabalhos</li>
                        <li>• Sistema de classificação de serviços</li>
                        <li>• Comunicação com clientes</li>
                        <li>• Gestão de reputação</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Cadastro e Conta */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">4</span>
                    Cadastro e Conta de Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requisitos para Cadastro:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Ter pelo menos 18 anos de idade</li>
                      <li>• Fornecer informações verdadeiras e completas</li>
                      <li>• Manter dados atualizados</li>
                      <li>• Ser responsável pela segurança da conta</li>
                      <li>• Não criar múltiplas contas</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Responsabilidades do Usuário:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Manter confidenciais as credenciais de acesso</li>
                      <li>• Notificar imediatamente sobre uso não autorizado</li>
                      <li>• Não compartilhar conta com terceiros</li>
                      <li>• Respeitar os direitos de outros usuários</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Condutas Proibidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">5</span>
                    Condutas Proibidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    É expressamente proibido na plataforma:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Conteúdo Inadequado:</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• Conteúdo ofensivo, difamatório ou discriminatório</li>
                        <li>• Material pornográfico ou inadequado</li>
                        <li>• Spam ou conteúdo promocional não autorizado</li>
                        <li>• Informações falsas ou enganosas</li>
                        <li>• Violação de direitos autorais</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Comportamentos:</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• Assédio ou bullying</li>
                        <li>• Tentativas de fraude</li>
                        <li>• Uso de bots ou automação</li>
                        <li>• Manipulação de avaliações</li>
                        <li>• Atividades ilegais</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 6. Propriedade Intelectual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">6</span>
                    Propriedade Intelectual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Direitos do ConfiLar:</h4>
                    <p className="text-gray-700 mb-2">
                      A plataforma, incluindo design, código, funcionalidades e marca, 
                      são propriedade exclusiva do ConfiLar e protegidos por leis de 
                      propriedade intelectual.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Conteúdo do Usuário:</h4>
                    <p className="text-gray-700 mb-2">
                      Você mantém os direitos sobre o conteúdo que publica, mas concede 
                      ao ConfiLar uma licença não exclusiva para usar, exibir e distribuir 
                      esse conteúdo na plataforma.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 7. Privacidade e Proteção de Dados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">7</span>
                    Privacidade e Proteção de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    O tratamento de dados pessoais segue nossa 
                    <Link href="/privacidade" className="text-blue-600 hover:text-blue-700 underline">
                      Política de Privacidade
                    </Link> e está em conformidade com a LGPD.
                  </p>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Seus Direitos:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Acesso aos seus dados pessoais</li>
                      <li>• Correção de dados incorretos</li>
                      <li>• Exclusão de dados (direito ao esquecimento)</li>
                      <li>• Portabilidade de dados</li>
                      <li>• Revogação de consentimento</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 8. Limitação de Responsabilidade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">8</span>
                    Limitação de Responsabilidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    O ConfiLar atua como intermediário entre clientes e profissionais. 
                    Não somos responsáveis por:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Qualidade dos serviços prestados por terceiros</li>
                    <li>• Disputas entre usuários</li>
                    <li>• Danos decorrentes do uso da plataforma</li>
                    <li>• Interrupções temporárias do serviço</li>
                    <li>• Perda de dados devido a falhas técnicas</li>
                  </ul>
                </CardContent>
              </Card>

              {/* 9. Modificações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">9</span>
                    Modificações dos Termos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Reservamo-nos o direito de modificar estes Termos a qualquer momento. 
                    Alterações significativas serão comunicadas com 30 dias de antecedência 
                    através de:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Notificação na plataforma</li>
                    <li>• Email para usuários cadastrados</li>
                    <li>• Aviso na página inicial</li>
                  </ul>
                  <p className="text-gray-700">
                    O uso continuado da plataforma após as modificações constitui 
                    aceitação dos novos termos.
                  </p>
                </CardContent>
              </Card>

              {/* 10. Rescisão */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">10</span>
                    Rescisão
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Rescisão pelo Usuário:</h4>
                    <p className="text-gray-700">
                      Você pode encerrar sua conta a qualquer momento através das 
                      configurações da conta ou entrando em contato conosco.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Rescisão pelo ConfiLar:</h4>
                    <p className="text-gray-700">
                      Podemos suspender ou encerrar sua conta em caso de violação 
                      destes Termos, atividades suspeitas ou por motivos de segurança.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 11. Lei Aplicável */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">11</span>
                    Lei Aplicável e Foro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Estes Termos são regidos pela legislação brasileira. 
                    Qualquer disputa será resolvida no foro da comarca de São Paulo/SP.
                  </p>
                </CardContent>
              </Card>

              {/* 12. Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">12</span>
                    Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Para dúvidas sobre estes Termos de Uso, entre em contato:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">contato@confilar.com</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">(11) 99999-9999</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <ExternalLink className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">www.confilar.com</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">Central de Ajuda</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-500 mb-4 md:mb-0">
                <p>© 2025 ConfiLar. Todos os direitos reservados.</p>
                <p>Documento válido a partir de 15 de Janeiro de 2025</p>
              </div>
              
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/privacidade">
                    <Shield className="h-4 w-4 mr-2" />
                    Política de Privacidade
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/ajuda">
                    <Users className="h-4 w-4 mr-2" />
                    Central de Ajuda
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
