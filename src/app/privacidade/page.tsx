'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Calendar, 
  FileText, 
  Users, 
  Database,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default function PrivacidadePage() {
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">Política de Privacidade</h1>
                <p className="text-gray-600">ConfiLar - Proteção de Dados Pessoais</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Última atualização: 15 de Janeiro de 2025
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Conforme LGPD
              </div>
            </div>
          </div>

          {/* Aviso LGPD */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Conformidade com LGPD</h3>
                  <p className="text-green-700 text-sm">
                    Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
                    e garante seus direitos fundamentais de privacidade e proteção de dados pessoais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            
            {/* 1. Introdução */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">1</span>
                  Introdução
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  O ConfiLar valoriza sua privacidade e está comprometido em proteger seus dados pessoais. 
                  Esta política explica como coletamos, usamos, armazenamos e protegemos suas informações.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Controlador de Dados:</h4>
                  <p className="text-blue-700 text-sm">
                    ConfiLar - Plataforma de Confiança Profissional<br/>
                    CNPJ: 00.000.000/0001-00<br/>
                    Email: privacidade@confilar.com
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Dados Coletados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">2</span>
                  Dados Pessoais Coletados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Dados de Identificação:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Nome completo</li>
                      <li>• Email</li>
                      <li>• Telefone</li>
                      <li>• CPF/CNPJ</li>
                      <li>• Data de nascimento</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Dados de Localização:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Estado</li>
                      <li>• Cidade</li>
                      <li>• Bairro</li>
                      <li>• Endereço</li>
                    </ul>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Dados Profissionais:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Tipo de usuário</li>
                      <li>• Serviços oferecidos</li>
                      <li>• Experiência profissional</li>
                      <li>• Certificações</li>
                      <li>• Portfólio</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Dados de Uso:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Histórico de navegação</li>
                      <li>• Interações na plataforma</li>
                      <li>• Mensagens trocadas</li>
                      <li>• Avaliações realizadas</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Finalidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">3</span>
                  Finalidades do Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Base Legal: Consentimento</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Cadastro na plataforma</li>
                      <li>• Comunicação entre usuários</li>
                      <li>• Envio de notificações</li>
                      <li>• Marketing direcionado</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Base Legal: Legítimo Interesse</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Melhoria dos serviços</li>
                      <li>• Análise de uso</li>
                      <li>• Prevenção de fraudes</li>
                      <li>• Segurança da plataforma</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Seus Direitos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">4</span>
                  Seus Direitos (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Eye className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Acesso</h4>
                        <p className="text-gray-700 text-sm">Visualizar seus dados pessoais</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Correção</h4>
                        <p className="text-gray-700 text-sm">Corrigir dados incorretos</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Download className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Portabilidade</h4>
                        <p className="text-gray-700 text-sm">Exportar seus dados</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Trash2 className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Exclusão</h4>
                        <p className="text-gray-700 text-sm">Direito ao esquecimento</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Oposição</h4>
                        <p className="text-gray-700 text-sm">Opor-se ao tratamento</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Revogação</h4>
                        <p className="text-gray-700 text-sm">Revogar consentimento</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Como Exercer Seus Direitos:</h4>
                  <p className="text-blue-700 text-sm">
                    Entre em contato através do email privacidade@confilar.com ou 
                    acesse as configurações da sua conta na plataforma.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 5. Compartilhamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">5</span>
                  Compartilhamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Seus dados pessoais podem ser compartilhados apenas nas seguintes situações:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Com outros usuários:</strong> Informações do perfil para conexão</li>
                  <li>• <strong>Prestadores de serviço:</strong> Empresas que nos auxiliam (hosting, email)</li>
                  <li>• <strong>Autoridades:</strong> Quando exigido por lei ou ordem judicial</li>
                  <li>• <strong>Proteção de direitos:</strong> Para proteger nossos direitos legais</li>
                </ul>
              </CardContent>
            </Card>

            {/* 6. Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">6</span>
                  Segurança dos Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Medidas Técnicas:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Criptografia de dados</li>
                      <li>• Conexões seguras (HTTPS)</li>
                      <li>• Backup regular</li>
                      <li>• Monitoramento de acesso</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Medidas Organizacionais:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Treinamento da equipe</li>
                      <li>• Políticas de acesso</li>
                      <li>• Auditorias regulares</li>
                      <li>• Plano de resposta a incidentes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7. Retenção */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">7</span>
                  Retenção de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades 
                  descritas nesta política:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Dados da conta:</strong> Enquanto a conta estiver ativa</li>
                  <li>• <strong>Dados de uso:</strong> 2 anos após a última atividade</li>
                  <li>• <strong>Dados de marketing:</strong> Até revogação do consentimento</li>
                  <li>• <strong>Dados legais:</strong> Conforme exigido por lei</li>
                </ul>
              </CardContent>
            </Card>

            {/* 8. Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">8</span>
                  Cookies e Tecnologias Similares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Utilizamos cookies para melhorar sua experiência na plataforma:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 text-sm">Essenciais</h4>
                    <p className="text-blue-700 text-xs">Necessários para funcionamento</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-green-800 text-sm">Funcionais</h4>
                    <p className="text-green-700 text-xs">Melhoram a experiência</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-orange-800 text-sm">Analíticos</h4>
                    <p className="text-orange-700 text-xs">Coletam estatísticas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 9. Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">9</span>
                  Contato e DPO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Para questões relacionadas à proteção de dados pessoais:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Encarregado de Proteção de Dados (DPO):</h4>
                  <p className="text-gray-700 text-sm">
                    Email: dpo@confilar.com<br/>
                    Telefone: (11) 99999-9999<br/>
                    Endereço: São Paulo, SP - Brasil
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-500 mb-4 md:mb-0">
                <p>© 2025 ConfiLar. Todos os direitos reservados.</p>
                <p>Política válida a partir de 15 de Janeiro de 2025</p>
              </div>
              
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/termos">
                    <FileText className="h-4 w-4 mr-2" />
                    Termos de Uso
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
