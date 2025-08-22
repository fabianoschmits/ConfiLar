'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeIn } from '@/components/animations/FadeIn'

// Dados mockados para demonstração
const mockPayments = [
  {
    id: 1,
    service: 'Limpeza Residencial',
    professional: 'Maria Silva',
    amount: 150.00,
    status: 'completed',
    date: '2024-01-15',
    method: 'Cartão de Crédito',
    last4: '1234',
    invoice: 'INV-001'
  },
  {
    id: 2,
    service: 'Manutenção Elétrica',
    professional: 'João Santos',
    amount: 300.00,
    status: 'pending',
    date: '2024-01-18',
    method: 'PIX',
    last4: null,
    invoice: 'INV-002'
  },
  {
    id: 3,
    service: 'Pintura Residencial',
    professional: 'Pedro Costa',
    amount: 800.00,
    status: 'failed',
    date: '2024-01-20',
    method: 'Boleto Bancário',
    last4: null,
    invoice: 'INV-003'
  },
  {
    id: 4,
    service: 'Jardinagem',
    professional: 'Ana Oliveira',
    amount: 120.00,
    status: 'completed',
    date: '2024-01-22',
    method: 'Cartão de Débito',
    last4: '5678',
    invoice: 'INV-004'
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Concluído</span>
        </Badge>
      )
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Pendente</span>
        </Badge>
      )
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center space-x-1">
          <XCircle className="h-3 w-3" />
          <span>Falhou</span>
        </Badge>
      )
    default:
      return <Badge variant="outline">Desconhecido</Badge>
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />
  }
}

export default function PagamentosPage() {
  const totalAmount = mockPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const completedAmount = mockPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0)
  const pendingAmount = mockPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <FadeIn>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pagamentos</h1>
              <p className="text-gray-600">
                Histórico e gerenciamento de todos os seus pagamentos
              </p>
            </div>
          </FadeIn>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FadeIn delay={0.1}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Gasto</p>
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Concluídos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {completedAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {pendingAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Pagamentos */}
            <div className="lg:col-span-2 space-y-6">
              <FadeIn delay={0.4}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Histórico de Pagamentos</span>
                    </CardTitle>
                    <CardDescription>
                      Todos os seus pagamentos e transações
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getStatusIcon(payment.status)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {payment.service}
                                </h3>
                                <p className="text-gray-600">
                                  Profissional: {payment.professional}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                R$ {payment.amount.toFixed(2)}
                              </p>
                              {getStatusBadge(payment.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(payment.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4" />
                              <span>{payment.method}</span>
                              {payment.last4 && (
                                <span className="text-gray-500">•••• {payment.last4}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Fatura: {payment.invoice}
                            </div>
                            <div className="flex space-x-2">
                              {payment.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline">
                                    Tentar Novamente
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Alterar Método
                                  </Button>
                                </>
                              )}
                              {payment.status === 'failed' && (
                                <>
                                  <Button size="sm" variant="outline">
                                    Tentar Novamente
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Suporte
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                Ver Detalhes
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            {/* Sidebar com Estatísticas */}
            <div className="space-y-6">
              <FadeIn delay={0.5}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Métodos de Pagamento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {Array.from(new Set(mockPayments.map(p => p.method))).map((method) => (
                        <div key={method} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{method}</span>
                          <Badge variant="outline">
                            {mockPayments.filter(p => p.method === method).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.6}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Últimos 30 Dias</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockPayments
                        .filter(payment => {
                          const paymentDate = new Date(payment.date)
                          const thirtyDaysAgo = new Date()
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                          return paymentDate >= thirtyDaysAgo
                        })
                        .slice(0, 3)
                        .map((payment) => (
                          <div key={payment.id} className="border-l-4 border-blue-500 pl-3">
                            <p className="font-medium text-gray-900 text-sm">
                              {payment.service}
                            </p>
                            <p className="text-gray-600 text-xs">
                              R$ {payment.amount.toFixed(2)} - {new Date(payment.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.7}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Dicas de Economia</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900 mb-1">Pacotes de Serviços</p>
                        <p className="text-blue-700">Combine múltiplos serviços para obter desconto</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-900 mb-1">Pagamento Antecipado</p>
                        <p className="text-green-700">Alguns profissionais oferecem desconto para pagamento à vista</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  )
}










