'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, Download } from 'lucide-react'

export default function GanhosPage() {
  // Dados mockados para demonstração
  const ganhosData = {
    totalGanhos: 15420.50,
    ganhosMes: 3240.80,
    ganhosSemana: 890.30,
    servicosRealizados: 45,
    servicosMes: 12,
    servicosSemana: 3,
    crescimentoMes: 15.2,
    crescimentoSemana: -5.8
  }

  const transacoesRecentes = [
    {
      id: 1,
      cliente: 'Maria Silva',
      servico: 'Limpeza Residencial',
      valor: 120.00,
      data: '2024-01-15',
      status: 'pago'
    },
    {
      id: 2,
      cliente: 'João Santos',
      servico: 'Manutenção Elétrica',
      valor: 85.50,
      data: '2024-01-14',
      status: 'pago'
    },
    {
      id: 3,
      cliente: 'Ana Costa',
      servico: 'Pintura Residencial',
      valor: 450.00,
      data: '2024-01-13',
      status: 'pendente'
    },
    {
      id: 4,
      cliente: 'Pedro Lima',
      servico: 'Instalação de Ar Condicionado',
      valor: 280.00,
      data: '2024-01-12',
      status: 'pago'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago'
      case 'pendente':
        return 'Pendente'
      case 'cancelado':
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Ganhos</h1>
        <p className="text-gray-600">Acompanhe seus ganhos e performance financeira</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {ganhosData.totalGanhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600">Todos os tempos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {ganhosData.ganhosMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+{ganhosData.crescimentoMes}%</span>
              <span className="text-gray-600 ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos da Semana</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {ganhosData.ganhosSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs">
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              <span className="text-red-600">{ganhosData.crescimentoSemana}%</span>
              <span className="text-gray-600 ml-1">vs semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Realizados</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{ganhosData.servicosRealizados}</div>
            <p className="text-xs text-gray-600">Total de serviços</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Mensal</CardTitle>
            <CardDescription>Evolução dos seus ganhos nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Gráfico de performance em desenvolvimento</p>
                <p className="text-sm text-gray-400">Em breve você poderá visualizar sua evolução</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>Seus ganhos divididos por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Limpeza</span>
                </div>
                <span className="text-sm font-medium">R$ 5.240,00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Manutenção</span>
                </div>
                <span className="text-sm font-medium">R$ 4.180,50</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Pintura</span>
                </div>
                <span className="text-sm font-medium">R$ 3.600,00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Instalação</span>
                </div>
                <span className="text-sm font-medium">R$ 2.400,00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas transações e pagamentos recebidos</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transacoesRecentes.map((transacao) => (
              <div key={transacao.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transacao.cliente}</p>
                      <p className="text-sm text-gray-600">{transacao.servico}</p>
                      <p className="text-xs text-gray-500">{transacao.data}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(transacao.status)}>
                    {getStatusText(transacao.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
