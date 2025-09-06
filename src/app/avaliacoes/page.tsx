'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Filter, Search } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { MainLayout } from '@/components/layout/MainLayout'

export default function AvaliacoesPage() {
  const [filter, setFilter] = useState('all')

  // Dados mockados para demonstração
  const avaliacoes = [
    {
      id: 1,
      cliente: 'Maria Silva',
      clienteAvatar: null,
      profissional: 'João Santos',
      profissionalAvatar: null,
      servico: 'Limpeza Residencial',
      nota: 5,
      comentario: 'Excelente trabalho! Muito profissional e pontual. Recomendo fortemente.',
      data: '2024-01-15',
      tipo: 'recebida'
    },
    {
      id: 2,
      cliente: 'Ana Costa',
      clienteAvatar: null,
      profissional: 'Pedro Lima',
      profissionalAvatar: null,
      servico: 'Manutenção Elétrica',
      nota: 4,
      comentario: 'Bom trabalho, mas poderia ter sido mais rápido.',
      data: '2024-01-14',
      tipo: 'recebida'
    },
    {
      id: 3,
      cliente: 'Carlos Oliveira',
      clienteAvatar: null,
      profissional: 'Maria Santos',
      profissionalAvatar: null,
      servico: 'Pintura Residencial',
      nota: 5,
      comentario: 'Perfeito! O resultado ficou exatamente como eu queria.',
      data: '2024-01-13',
      tipo: 'recebida'
    },
    {
      id: 4,
      cliente: 'Lucia Ferreira',
      clienteAvatar: null,
      profissional: 'Roberto Alves',
      profissionalAvatar: null,
      servico: 'Instalação de Ar Condicionado',
      nota: 3,
      comentario: 'Trabalho aceitável, mas demorou mais do que o esperado.',
      data: '2024-01-12',
      tipo: 'recebida'
    },
    {
      id: 5,
      cliente: 'Fernando Costa',
      clienteAvatar: null,
      profissional: 'Sofia Martins',
      profissionalAvatar: null,
      servico: 'Limpeza de Tapetes',
      nota: 5,
      comentario: 'Serviço impecável! Tapetes ficaram como novos.',
      data: '2024-01-11',
      tipo: 'enviada'
    }
  ]

  const estatisticas = {
    mediaGeral: 4.6,
    totalAvaliacoes: 127,
    cincoEstrelas: 89,
    quatroEstrelas: 25,
    tresEstrelas: 8,
    duasEstrelas: 3,
    umaEstrela: 2
  }

  const renderStars = (nota: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < nota ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getFilteredAvaliacoes = () => {
    if (filter === 'all') return avaliacoes
    return avaliacoes.filter(av => av.tipo === filter)
  }

  const getNotaText = (nota: number) => {
    switch (nota) {
      case 5:
        return 'Excelente'
      case 4:
        return 'Muito Bom'
      case 3:
        return 'Bom'
      case 2:
        return 'Regular'
      case 1:
        return 'Ruim'
      default:
        return 'Sem avaliação'
    }
  }

  const getNotaColor = (nota: number) => {
    switch (nota) {
      case 5:
        return 'bg-green-100 text-green-800'
      case 4:
        return 'bg-blue-100 text-blue-800'
      case 3:
        return 'bg-yellow-100 text-yellow-800'
      case 2:
        return 'bg-orange-100 text-orange-800'
      case 1:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Avaliações</h1>
        <p className="text-gray-600">Gerencie suas avaliações e feedback</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {estatisticas.mediaGeral}
            </div>
            <div className="flex items-center mt-1">
              {renderStars(Math.round(estatisticas.mediaGeral))}
            </div>
            <p className="text-xs text-gray-600 mt-1">{estatisticas.totalAvaliacoes} avaliações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estatisticas.totalAvaliacoes}
            </div>
            <p className="text-xs text-gray-600">Avaliações recebidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excelentes (5★)</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estatisticas.cincoEstrelas}
            </div>
            <p className="text-xs text-gray-600">
              {Math.round((estatisticas.cincoEstrelas / estatisticas.totalAvaliacoes) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baixas (1-2★)</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estatisticas.duasEstrelas + estatisticas.umaEstrela}
            </div>
            <p className="text-xs text-gray-600">
              {Math.round(((estatisticas.duasEstrelas + estatisticas.umaEstrela) / estatisticas.totalAvaliacoes) * 100)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'recebida' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('recebida')}
          >
            Recebidas
          </Button>
          <Button
            variant={filter === 'enviada' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('enviada')}
          >
            Enviadas
          </Button>
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {getFilteredAvaliacoes().map((avaliacao) => (
          <Card key={avaliacao.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <UserAvatar
                  src={avaliacao.tipo === 'recebida' ? avaliacao.clienteAvatar : avaliacao.profissionalAvatar}
                  alt={avaliacao.tipo === 'recebida' ? avaliacao.cliente : avaliacao.profissional}
                  fallback={(avaliacao.tipo === 'recebida' ? avaliacao.cliente : avaliacao.profissional).charAt(0)}
                  size="lg"
                />

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {avaliacao.tipo === 'recebida' ? avaliacao.cliente : avaliacao.profissional}
                      </h3>
                      <p className="text-sm text-gray-600">{avaliacao.servico}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getNotaColor(avaliacao.nota)}>
                        {avaliacao.nota}★ {getNotaText(avaliacao.nota)}
                      </Badge>
                      <span className="text-xs text-gray-500">{avaliacao.data}</span>
                    </div>
                  </div>

                  {/* Estrelas */}
                  <div className="flex items-center mb-3">
                    {renderStars(avaliacao.nota)}
                  </div>

                  {/* Comentário */}
                  <p className="text-gray-700 mb-3">{avaliacao.comentario}</p>

                  {/* Ações */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Responder
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Útil
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Distribuição */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Distribuição das Avaliações</CardTitle>
          <CardDescription>Como suas avaliações estão distribuídas por nota</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { nota: 5, quantidade: estatisticas.cincoEstrelas, cor: 'bg-green-500' },
              { nota: 4, quantidade: estatisticas.quatroEstrelas, cor: 'bg-blue-500' },
              { nota: 3, quantidade: estatisticas.tresEstrelas, cor: 'bg-yellow-500' },
              { nota: 2, quantidade: estatisticas.duasEstrelas, cor: 'bg-orange-500' },
              { nota: 1, quantidade: estatisticas.umaEstrela, cor: 'bg-red-500' }
            ].map((item) => (
              <div key={item.nota} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-12">
                  <span className="text-sm font-medium">{item.nota}★</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.cor}`}
                    style={{
                      width: `${(item.quantidade / estatisticas.totalAvaliacoes) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {item.quantidade}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </MainLayout>
  )
}
