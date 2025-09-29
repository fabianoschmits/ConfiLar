'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  UserX, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Calendar,
  MessageSquare
} from 'lucide-react'
import { useBanCheck } from '@/hooks/useBanCheck'

interface BanNotificationProps {
  children: React.ReactNode
}

export function BanNotification({ children }: BanNotificationProps) {
  const { isBanned, banInfo, isLoading } = useBanCheck()

  if (isLoading) {
    return <>{children}</>
  }

  if (!isBanned || !banInfo) {
    return <>{children}</>
  }

  const getBanTypeColor = (type: string) => {
    switch (type) {
      case 'permanent': return 'bg-red-100 text-red-800'
      case 'temporary': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBanTypeIcon = (type: string) => {
    switch (type) {
      case 'permanent': return <Shield className="h-4 w-4" />
      case 'temporary': return <Clock className="h-4 w-4" />
      default: return <UserX className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-900">
              Conta Suspensa
            </CardTitle>
            <p className="text-red-700 mt-2">
              Sua conta foi suspensa devido a violação das regras da plataforma.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informações do banimento */}
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Detalhes da Suspensão</h3>
                <Badge className={`${getBanTypeColor(banInfo.ban_type)} flex items-center gap-1`}>
                  {getBanTypeIcon(banInfo.ban_type)}
                  {banInfo.ban_type === 'permanent' ? 'Permanente' : 'Temporário'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Motivo:</p>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                    {banInfo.reason}
                  </p>
                </div>

                {banInfo.expires_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Expira em:</p>
                    <div className="flex items-center gap-2 text-gray-900 bg-gray-50 p-2 rounded border">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(banInfo.expires_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      {banInfo.days_remaining && banInfo.days_remaining > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {banInfo.days_remaining} dias restantes
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {banInfo.admin_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Notas do Administrador:</p>
                    <p className="text-gray-900 bg-blue-50 p-2 rounded border border-blue-200">
                      {banInfo.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ações disponíveis */}
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-gray-900 mb-3">O que você pode fazer:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>Entre em contato com o suporte para contestar a suspensão</span>
                </div>
                {banInfo.ban_type === 'temporary' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Aguarde o prazo de expiração para retornar à plataforma</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Revise as regras da plataforma para evitar futuras suspensões</span>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = '/ajuda'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contatar Suporte
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = '/sobre'}
              >
                <Shield className="h-4 w-4 mr-2" />
                Ver Regras
              </Button>
            </div>

            {/* Informações adicionais */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Durante a suspensão, você não poderá acessar a plataforma. 
                {banInfo.ban_type === 'temporary' 
                  ? ' Sua conta será reativada automaticamente após o prazo de expiração.'
                  : ' Esta suspensão é permanente e requer revisão manual para ser removida.'
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
