'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, User, Calendar } from 'lucide-react'
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
        <div className="space-y-3">
          {referrals.map((referral) => (
            <div
              key={referral.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={referral.referredAvatar || undefined} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                  {referral.referredName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
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

