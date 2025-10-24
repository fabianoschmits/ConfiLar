'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, User, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { useReferralDashboard } from '@/hooks/useReferralStats'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ReferralHistoryProps {
  userId: string
  className?: string
}

export function ReferralHistory({ userId, className }: ReferralHistoryProps) {
  const { dashboard, loading } = useReferralDashboard(userId)
  const [showAllPoints, setShowAllPoints] = useState(false)
  const [showAllReferrals, setShowAllReferrals] = useState(false)

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Suas Indicações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const referrals = dashboard?.referrals || []
  const recentPoints = dashboard?.recentPoints || []
  
  // Limitar exibição inicial
  const displayedPoints = showAllPoints ? recentPoints : recentPoints.slice(0, 10)
  const displayedReferrals = showAllReferrals ? referrals : referrals.slice(0, 10)

  if (referrals.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Suas Indicações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Você ainda não indicou ninguém
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Compartilhe seu link de indicação e comece a ganhar recompensas!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Suas Indicações</span>
          <Badge variant="secondary">{referrals.length} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Histórico de Pontos */}
        {recentPoints.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Histórico de Pontos
              </h3>
              <Badge variant="outline" className="ml-auto">
                {showAllPoints ? recentPoints.length : 'Últimas 10'} de {recentPoints.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {displayedPoints.map((point) => (
                <div
                  key={point.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {point.description || getActionTypeDescription(point.actionType)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(point.createdAt), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      +{point.points}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">pts</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botão Ver Mais/Menos - Pontos */}
            {recentPoints.length > 10 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllPoints(!showAllPoints)}
                  className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/20"
                >
                  {showAllPoints ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Ver mais ({recentPoints.length - 10} restantes)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Lista de Indicações */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Pessoas que Você Indicou
            </h3>
            <Badge variant="outline" className="ml-auto">
              {showAllReferrals ? referrals.length : 'Primeiras 10'} de {referrals.length}
            </Badge>
          </div>
          {displayedReferrals.map((referral) => (
            <div
              key={referral.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {/* Avatar e Nome - Link para perfil */}
              <Link 
                href={`/perfil/${referral.referredId}`}
                className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={referral.referredAvatar || undefined} />
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    {referral.referredName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate hover:underline">
                    {referral.referredName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(referral.createdAt), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Status */}
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={getStatusVariant(referral.status)}
                  className="text-xs"
                >
                  {getStatusText(referral.status)}
                </Badge>

                {/* Milestones */}
                <div className="flex items-center gap-1">
                  {referral.profileCompleted && (
                    <div title="Perfil completo">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  {referral.firstPostMade && (
                    <div title="Primeiro post">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  {!referral.profileCompleted && !referral.firstPostMade && (
                    <div title="Aguardando atividade">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Botão Ver Mais/Menos - Referrals */}
          {referrals.length > 10 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllReferrals(!showAllReferrals)}
                className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                {showAllReferrals ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Ver mais ({referrals.length - 10} restantes)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'active':
      return 'secondary'
    case 'pending':
      return 'outline'
    default:
      return 'outline'
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completo'
    case 'active':
      return 'Ativo'
    case 'pending':
      return 'Pendente'
    case 'inactive':
      return 'Inativo'
    default:
      return status
  }
}

function getActionTypeDescription(actionType: string): string {
  const descriptions: Record<string, string> = {
    'signup': 'Pessoa indicada se cadastrou',
    'profile_completed': 'Pessoa indicada completou perfil',
    'first_post': 'Pessoa indicada fez primeiro post',
    'first_review': 'Pessoa indicada fez primeira avaliação',
    'active_30_days': 'Pessoa indicada ficou ativa por 30 dias',
    'tier_upgrade': 'Você subiu de nível',
    'milestone_reached': 'Você alcançou um marco'
  }
  return descriptions[actionType] || actionType
}

