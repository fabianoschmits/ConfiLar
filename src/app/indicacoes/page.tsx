'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { ReferralDashboard } from '@/components/referral/ReferralDashboard'
import { ReferralLinkCard } from '@/components/referral/ReferralLinkCard'
import { ReferralHistory } from '@/components/referral/ReferralHistory'
import { ReferralLeaderboard } from '@/components/referral/ReferralLeaderboard'
import { Card, CardContent } from '@/components/ui/card'
import { Users, TrendingUp, Award, Sparkles } from 'lucide-react'

export default function IndicacoesPage() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Faça login para acessar
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Você precisa estar logado para ver seu programa de indicações
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Programa de Indicações
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Indique amigos para o ConfiLar e ganhe recompensas incríveis! Quanto mais pessoas você indicar,
              mais badges e benefícios você desbloqueia.
            </p>
          </div>

          {/* Como Funciona */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Como Funciona
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Compartilhe seu link</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use seu código exclusivo para convidar amigos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Amigos se cadastram</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cada cadastro via seu link te dá pontos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Ganhe recompensas</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Desbloqueie badges e benefícios exclusivos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard de Estatísticas */}
          <ReferralDashboard userId={user.id} />

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Link de Indicação */}
            <ReferralLinkCard userId={user.id} />

            {/* Leaderboard */}
            <ReferralLeaderboard limit={5} />
          </div>

          {/* Histórico de Indicações */}
          <ReferralHistory userId={user.id} />

          {/* Tabela de Pontos */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                Como Ganhar Pontos
              </h3>
              <div className="space-y-3">
                {pointsTable.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
                      <span className="text-gray-900 dark:text-white">{item.action}</span>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      +{item.points} pontos
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Níveis e Recompensas */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Níveis e Benefícios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiersBenefits.map((tier, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <tier.icon className={`w-5 h-5 ${tier.color}`} />
                      <h4 className="font-bold text-gray-900 dark:text-white">{tier.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {tier.requirement}
                    </p>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                          <span className="text-green-600 dark:text-green-400">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

const pointsTable = [
  { action: 'Indicação se cadastra', points: 50 },
  { action: 'Indicação completa perfil', points: 50 },
  { action: 'Indicação faz primeiro post', points: 30 },
  { action: 'Indicação contrata serviço', points: 100 },
  { action: 'Indicação fica ativa por 30 dias', points: 150 }
]

const tiersBenefits = [
  {
    name: 'Bronze',
    icon: Award,
    color: 'text-amber-600',
    requirement: '1-4 indicações',
    benefits: ['Badge Bronze', 'Reconhecimento no perfil']
  },
  {
    name: 'Prata',
    icon: Award,
    color: 'text-gray-400',
    requirement: '5-9 indicações',
    benefits: ['Badge Prata', 'Destaque no perfil', 'Título especial']
  },
  {
    name: 'Ouro',
    icon: Award,
    color: 'text-yellow-500',
    requirement: '10-24 indicações',
    benefits: ['Badge Ouro', 'Prioridade em buscas', 'Badge no feed']
  },
  {
    name: 'Platina',
    icon: Award,
    color: 'text-cyan-500',
    requirement: '25-49 indicações',
    benefits: ['Badge Platina', 'Perfil Premium', 'Selo verificado']
  },
  {
    name: 'Diamante',
    icon: Sparkles,
    color: 'text-blue-500',
    requirement: '50+ indicações',
    benefits: ['Badge Diamante', 'Perfil VIP', 'Reconhecimento público', 'Features exclusivas']
  }
]

