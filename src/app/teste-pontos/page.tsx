'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Coins, 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  History
} from 'lucide-react'
import { usePoints, usePointsHistory, usePointsLeaderboard } from '@/hooks/usePoints'
import { useAuthContext } from '@/contexts/AuthContext'
import { PointsDashboard } from '@/components/points/PointsDashboard'
import { AddPointsRequest, PointSource } from '@/types/points'
import { toast } from 'sonner'

export default function TestePontosPage() {
  const { user } = useAuthContext()
  const { addPoints, isAddingPoints, addPointsError } = usePoints(user?.id)
  const { transactions, loading: historyLoading } = usePointsHistory(user?.id, { limit: 5 })
  const { leaderboard, loading: leaderboardLoading } = usePointsLeaderboard(5)
  
  const [testAction, setTestAction] = useState<PointSource>('daily_login')
  const [testDescription, setTestDescription] = useState('')
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const testActions: { value: PointSource; label: string; points: number }[] = [
    { value: 'daily_login', label: 'Login Diário', points: 10 },
    { value: 'profile_completion', label: 'Perfil Completo', points: 150 },
    { value: 'first_post', label: 'Primeiro Post', points: 50 },
    { value: 'create_classified', label: 'Criar Anúncio', points: 100 },
    { value: 'receive_like', label: 'Receber Curtida', points: 2 },
    { value: 'give_like', label: 'Dar Curtida', points: -2 },
    { value: 'receive_comment', label: 'Receber Comentário', points: 5 },
    { value: 'give_comment', label: 'Fazer Comentário', points: -1 },
  ]

  const runTest = async () => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsRunningTest(true)
    const startTime = Date.now()

    try {
      const request: AddPointsRequest = {
        action_type: testAction,
        description: testDescription || `Teste: ${testActions.find(a => a.value === testAction)?.label}`,
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      }

      const result = await addPoints(request)
      const endTime = Date.now()
      const duration = endTime - startTime

      const testResult = {
        id: Date.now(),
        action: testAction,
        points: result,
        duration,
        success: true,
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]) // Manter últimos 10
      toast.success(`Teste executado! +${result} pontos em ${duration}ms`)
      
    } catch (error: any) {
      const endTime = Date.now()
      const duration = endTime - startTime

      const testResult = {
        id: Date.now(),
        action: testAction,
        points: 0,
        duration,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => [testResult, ...prev.slice(0, 9)])
      toast.error(`Erro no teste: ${error.message}`)
    } finally {
      setIsRunningTest(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
    toast.info('Resultados limpos')
  }

  if (!user) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Acesso Negado
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Você precisa estar logado para acessar esta página.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <TestTube className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Teste do Sistema de Pontos
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Teste todas as funcionalidades do sistema de pontos
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Painel de Testes */}
              <div className="lg:col-span-1 space-y-6">
                {/* Teste Manual */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-blue-600" />
                      Teste Manual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-action">Ação de Teste</Label>
                      <Select value={testAction} onValueChange={(value) => setTestAction(value as PointSource)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma ação" />
                        </SelectTrigger>
                        <SelectContent>
                          {testActions.map((action) => (
                            <SelectItem key={action.value} value={action.value}>
                              {action.label} ({action.points > 0 ? '+' : ''}{action.points} pontos)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="test-description">Descrição (opcional)</Label>
                      <Input
                        id="test-description"
                        value={testDescription}
                        onChange={(e) => setTestDescription(e.target.value)}
                        placeholder="Descrição personalizada..."
                      />
                    </div>

                    <Button
                      onClick={runTest}
                      disabled={isRunningTest || isAddingPoints}
                      className="w-full"
                    >
                      {isRunningTest || isAddingPoints ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Executando...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Executar Teste
                        </>
                      )}
                    </Button>

                    {addPointsError && (
                      <Alert variant="destructive">
                        <XCircle className="w-4 h-4" />
                        <AlertDescription>
                          Erro: {addPointsError.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Resultados dos Testes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Resultados
                      </div>
                      {testResults.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearResults}
                        >
                          Limpar
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        Nenhum teste executado ainda
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {testResults.map((result) => (
                          <div
                            key={result.id}
                            className={`p-3 rounded-lg border ${
                              result.success
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {result.success ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span className="font-medium text-sm">
                                  {testActions.find(a => a.value === result.action)?.label}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-medium ${
                                  result.success ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {result.success ? `+${result.points}` : 'Erro'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {result.duration}ms
                                </div>
                              </div>
                            </div>
                            {result.error && (
                              <p className="text-xs text-red-600 mt-1">
                                {result.error}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Dashboard de Pontos */}
              <div className="lg:col-span-2">
                <PointsDashboard />
              </div>
            </div>

            {/* Informações do Sistema */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    Informações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Sistema de Pontos
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ganhe pontos através de atividades e interações no ConfiLar
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Ranking Global
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Compete com outros usuários e suba no ranking
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Histórico Completo
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Acompanhe todas as suas transações de pontos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
