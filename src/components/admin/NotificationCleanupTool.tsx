'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Database,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function NotificationCleanupTool() {
  const [userId, setUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userStats, setUserStats] = useState<{
    total: number
    unread: number
    userExists: boolean
  } | null>(null)

  const checkUserNotifications = async () => {
    if (!userId.trim()) {
      toast.error('Digite um ID de usuário')
      return
    }

    setIsLoading(true)
    try {
      // Verificar se o usuário existe
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .single()

      if (userError || !userData) {
        setUserStats({
          total: 0,
          unread: 0,
          userExists: false
        })
        toast.error('Usuário não encontrado')
        return
      }

      // Contar notificações do usuário
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('id, is_read')
        .eq('user_id', userId)

      if (notifError) throw notifError

      const total = notifications?.length || 0
      const unread = notifications?.filter(n => !n.is_read).length || 0

      setUserStats({
        total,
        unread,
        userExists: true
      })

      toast.success(`Usuário encontrado: ${userData.full_name}`)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      toast.error('Erro ao verificar usuário')
    } finally {
      setIsLoading(false)
    }
  }

  const clearUserNotifications = async () => {
    if (!userId.trim() || !userStats?.userExists) {
      toast.error('Verifique o usuário primeiro')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      toast.success(`✅ ${userStats.total} notificações removidas com sucesso!`)
      setUserStats({
        total: 0,
        unread: 0,
        userExists: true
      })
    } catch (error) {
      console.error('Erro ao limpar notificações:', error)
      toast.error('Erro ao limpar notificações')
    } finally {
      setIsLoading(false)
    }
  }

  const clearDuplicateNotifications = async () => {
    setIsLoading(true)
    try {
      // Esta operação precisa ser feita via SQL direto
      // Por enquanto, vamos mostrar uma mensagem explicativa
      toast.info('Use o script SQL para remover duplicatas')
    } catch (error) {
      console.error('Erro ao limpar duplicatas:', error)
      toast.error('Erro ao limpar duplicatas')
    } finally {
      setIsLoading(false)
    }
  }

  const clearOldNotifications = async () => {
    setIsLoading(true)
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())

      if (error) throw error

      toast.success('Notificações antigas removidas!')
    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error)
      toast.error('Erro ao limpar notificações antigas')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Ferramenta de Limpeza de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta ferramenta permite limpar notificações em massa. Use com cuidado!
            </AlertDescription>
          </Alert>

          {/* Verificar usuário específico */}
          <div className="space-y-3">
            <Label htmlFor="userId">ID do Usuário</Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Digite o ID do usuário"
                className="flex-1"
              />
              <Button 
                onClick={checkUserNotifications}
                disabled={isLoading}
                variant="outline"
              >
                <User className="h-4 w-4 mr-2" />
                Verificar
              </Button>
            </div>
          </div>

          {/* Estatísticas do usuário */}
          {userStats && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Estatísticas do Usuário:</span>
                {userStats.userExists ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Usuário Existe
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Usuário Não Encontrado
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats.unread}</div>
                  <div className="text-sm text-gray-600">Não Lidas</div>
                </div>
              </div>

              {userStats.userExists && userStats.total > 0 && (
                <Button 
                  onClick={clearUserNotifications}
                  disabled={isLoading}
                  className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todas as Notificações deste Usuário
                </Button>
              )}
            </div>
          )}

          {/* Ações gerais */}
          <div className="space-y-3">
            <h3 className="font-medium">Ações Gerais:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                onClick={clearOldNotifications}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar Notificações Antigas (30+ dias)
              </Button>

              <Button 
                onClick={clearDuplicateNotifications}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Database className="h-4 w-4 mr-2" />
                Limpar Duplicatas (via SQL)
              </Button>
            </div>
          </div>

          {/* Instruções */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Para operações mais complexas:</strong><br/>
              1. Use o script SQL: <code>scripts/limpar-notificacoes-em-massa.sql</code><br/>
              2. Execute no Supabase SQL Editor<br/>
              3. Substitua 'USER_ID_AQUI' pelo ID do usuário problemático
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
