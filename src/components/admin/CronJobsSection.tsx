'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Bell, Trash2, CheckCircle2, XCircle, Clock, AlertCircle, Eye, EyeOff, Key, HelpCircle, BookOpen, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationResult {
  success: boolean
  message: string
  expiring_notifications: number
  expired_notifications: number
  expiring_post_ids: string[]
  expired_post_ids: string[]
  timestamp: string
}

interface StoriesCleanupResult {
  success: boolean
  message: string
  stories_deleted: number
  story_ids: string[]
  timestamp: string
}

export function CronJobsSection() {
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [loadingStories, setLoadingStories] = useState(false)
  const [notificationResult, setNotificationResult] = useState<NotificationResult | null>(null)
  const [storiesResult, setStoriesResult] = useState<StoriesCleanupResult | null>(null)
  const [notificationError, setNotificationError] = useState<string | null>(null)
  const [storiesError, setStoriesError] = useState<string | null>(null)
  const [serviceRoleKey, setServiceRoleKey] = useState<string>('')
  const [showServiceRoleKey, setShowServiceRoleKey] = useState(false)

  const executeNotifications = async () => {
    setLoadingNotifications(true)
    setNotificationError(null)
    setNotificationResult(null)

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Se service role key for fornecida, usar ela
      if (serviceRoleKey.trim()) {
        headers['Authorization'] = `Bearer ${serviceRoleKey.trim()}`
        headers['X-Service-Role-Key'] = 'true'
      }

      const response = await fetch('/api/cron/premium-posts-notifications', {
        method: 'GET',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao executar notificações')
      }

      setNotificationResult(data)
      toast.success('Notificações executadas com sucesso!', {
        description: `${data.expiring_notifications} expirando e ${data.expired_notifications} expiradas`,
      })
    } catch (err: any) {
      setNotificationError(err.message || 'Erro ao executar notificações')
      toast.error('Erro ao executar notificações', {
        description: err.message,
      })
    } finally {
      setLoadingNotifications(false)
    }
  }

  const executeStoriesCleanup = async () => {
    setLoadingStories(true)
    setStoriesError(null)
    setStoriesResult(null)

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Se service role key for fornecida, usar ela
      if (serviceRoleKey.trim()) {
        headers['Authorization'] = `Bearer ${serviceRoleKey.trim()}`
        headers['X-Service-Role-Key'] = 'true'
      }

      const response = await fetch('/api/cron/cleanup-stories', {
        method: 'GET',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao limpar stories')
      }

      setStoriesResult(data)
      toast.success('Stories limpos com sucesso!', {
        description: `${data.stories_deleted} stories deletados`,
      })
    } catch (err: any) {
      setStoriesError(err.message || 'Erro ao limpar stories')
      toast.error('Erro ao limpar stories', {
        description: err.message,
      })
    } finally {
      setLoadingStories(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Cron Jobs Manuais
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Execute manualmente os cron jobs do sistema
        </p>
      </div>

      {/* Campo para Service Role Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Service Role Key
          </CardTitle>
          <CardDescription>
            Insira a Service Role Key do Supabase para executar os cron jobs. Esta key não é armazenada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-role-key">Service Role Key</Label>
              <div className="relative">
                <Input
                  id="service-role-key"
                  type={showServiceRoleKey ? 'text' : 'password'}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={serviceRoleKey}
                  onChange={(e) => setServiceRoleKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowServiceRoleKey(!showServiceRoleKey)}
                >
                  {showServiceRoleKey ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A key será usada apenas durante a execução dos cron jobs. Ela não é salva ou armazenada.
              </p>
            </div>
            {serviceRoleKey && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Service Role Key configurada. Os cron jobs usarão esta key para autenticação.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notificações de Posts Premium */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações de Posts Premium
            </CardTitle>
            <CardDescription>
              Cria notificações para posts premium expirando em 24h e posts premium expirados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={executeNotifications}
                disabled={loadingNotifications}
                className="w-full"
                size="lg"
              >
                {loadingNotifications ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Executar Notificações
                  </>
                )}
              </Button>

              {notificationError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Erro</span>
                  </div>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">{notificationError}</p>
                </div>
              )}

              {notificationResult && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Sucesso!</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    {notificationResult.message}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expirando (24h)
                        </span>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        {notificationResult.expiring_notifications}
                      </Badge>
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expirados
                        </span>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        {notificationResult.expired_notifications}
                      </Badge>
                    </div>
                  </div>

                  {notificationResult.timestamp && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Executado em: {new Date(notificationResult.timestamp).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Limpeza de Stories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Limpeza de Stories
            </CardTitle>
            <CardDescription>
              Deleta stories que já passaram de 24 horas (expiraram) do banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={executeStoriesCleanup}
                disabled={loadingStories}
                className="w-full"
                size="lg"
                variant="destructive"
              >
                {loadingStories ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Stories Antigos
                  </>
                )}
              </Button>

              {storiesError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Erro</span>
                  </div>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">{storiesError}</p>
                </div>
              )}

              {storiesResult && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Sucesso!</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    {storiesResult.message}
                  </p>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stories Deletados
                      </span>
                    </div>
                    <Badge variant="outline" className="text-lg">
                      {storiesResult.stories_deleted}
                    </Badge>
                  </div>

                  {storiesResult.timestamp && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Executado em: {new Date(storiesResult.timestamp).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Instruções - Como Executar */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <BookOpen className="h-5 w-5" />
            Como Executar os Cron Jobs
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Guia passo a passo para executar os cron jobs manualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Passo 1: Service Role Key */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Configurar Service Role Key
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>O que é:</strong> A Service Role Key é uma chave de autenticação do Supabase que permite executar operações administrativas no banco de dados.
                </p>
                <p>
                  <strong>Onde encontrar:</strong> Acesse o <strong>Supabase Dashboard</strong> → <strong>Settings</strong> → <strong>API</strong> → <strong>service_role key</strong>
                </p>
                <p>
                  <strong>Como usar:</strong> Copie a Service Role Key e cole no campo acima. A key não é armazenada, apenas usada durante a execução dos cron jobs.
                </p>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mt-2">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    ⚠️ <strong>Importante:</strong> Mantenha a Service Role Key em segredo. Ela tem acesso total ao banco de dados.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 2: Executar Notificações */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Executar Notificações de Posts Premium
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>O que faz:</strong> Cria notificações para usuários quando seus posts premium estão expirando (24h antes) ou já expiraram.
                </p>
                <p>
                  <strong>Como executar:</strong> Clique no botão <strong>"Executar Notificações"</strong> acima.
                </p>
                <p>
                  <strong>Quando executar:</strong> Execute algumas vezes ao dia (manhã, tarde, noite) para garantir que todas as notificações sejam criadas em tempo hábil.
                </p>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mt-2">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    ✅ <strong>Resultado esperado:</strong> Você verá a quantidade de notificações criadas (expirando e expiradas) e os IDs dos posts afetados.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 3: Executar Limpeza */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Executar Limpeza de Stories Antigos
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>O que faz:</strong> Deleta stories que já passaram de 24 horas (expiraram) e suas visualizações associadas do banco de dados.
                </p>
                <p>
                  <strong>Como executar:</strong> Clique no botão <strong>"Limpar Stories Antigos"</strong> acima.
                </p>
                <p>
                  <strong>Quando executar:</strong> Execute algumas vezes ao dia (manhã, tarde, noite) para manter o banco de dados limpo.
                </p>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mt-2">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    ✅ <strong>Resultado esperado:</strong> Você verá a quantidade de stories deletados e os IDs dos stories removidos.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 4: Monitoramento */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Monitorar Resultados
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Notificações:</strong> Verifique se as notificações foram criadas corretamente no app. Os usuários receberão notificações quando seus posts premium estiverem expirando ou expirados.
                </p>
                <p>
                  <strong>Stories:</strong> Verifique se os stories antigos foram deletados. Stories que já passaram de 24 horas não devem mais aparecer no app.
                </p>
                <p>
                  <strong>Logs:</strong> Os resultados de cada execução são exibidos abaixo dos botões. Verifique se há erros ou avisos.
                </p>
              </div>
            </div>

            {/* Dica Final */}
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-semibold">💡 Dica:</p>
                  <p>
                    Para garantir que todas as tarefas sejam executadas em tempo hábil, execute os cron jobs manualmente algumas vezes ao dia:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>Manhã (08:00):</strong> Executar notificações e limpeza</li>
                    <li><strong>Tarde (14:00):</strong> Executar notificações e limpeza</li>
                    <li><strong>Noite (20:00):</strong> Executar notificações e limpeza</li>
                  </ul>
                  <p className="text-xs mt-2">
                    <strong>Nota:</strong> Como estamos usando o plano free da Vercel, não podemos usar cron jobs automáticos. Por isso, a execução manual é necessária.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Informações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Notificações de Posts Premium
              </h3>
              <p>
                Cria notificações para posts premium que vão expirar nas próximas 24 horas e para
                posts premium que expiraram nas últimas 24 horas. Execute algumas vezes ao dia para
                garantir que todas as notificações sejam criadas.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Limpeza de Stories
              </h3>
              <p>
                Deleta stories que já passaram de 24 horas (expiraram) do banco de dados. Isso
                ajuda a manter o banco limpo e reduzir o uso de armazenamento. Execute algumas
                vezes ao dia.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Frequência Recomendada
              </h3>
              <p>
                Execute manualmente algumas vezes ao dia (manhã, tarde, noite) para garantir que
                todas as tarefas sejam executadas em tempo hábil.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

