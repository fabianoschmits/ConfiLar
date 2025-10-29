'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { usePoints, usePointsHistory, usePointsDashboard } from '@/hooks/usePoints'
import { usePointsPackages, usePointsPurchases, usePointsWithdrawals, usePointsTransfers, usePointsStore } from '@/hooks/useEconomy'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Loader2, Play, RefreshCw } from 'lucide-react'
import { PointSource } from '@/types/points'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  details?: any
}

interface BalanceResult {
  balance: number
  level: number
  total_earned: number
  total_spent: number
  locked_balance: number
  available_balance: number
}

export default function TesteSistemaPontos() {
  const { user } = useAuthContext()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')
  
  // Hooks
  const { balance, addPoints, checkDailyLimit } = usePoints(user?.id)
  const { transactions } = usePointsHistory(user?.id)
  const { dashboard } = usePointsDashboard(user?.id)
  const { packages } = usePointsPackages()
  const { purchases, createPurchase } = usePointsPurchases(user?.id)
  const { withdrawals, createWithdrawal } = usePointsWithdrawals(user?.id)
  const { transfers, createTransfer } = usePointsTransfers(user?.id)
  const { items, purchaseItem } = usePointsStore(user?.id)

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => {
      const index = prev.findIndex(t => t.name === name)
      const newTest = { name, status, message, details }
      if (index >= 0) {
        const newResults = [...prev]
        newResults[index] = newTest
        return newResults
      }
      return [...prev, newTest]
    })
  }

  // ============================================
  // TESTE 1: Verificar Saldo Inicial
  // ============================================
  const testCheckBalance = async () => {
    updateTest('1. Verificar Saldo', 'running', 'Consultando saldo...')
    try {
      const { data, error } = await supabase
        .rpc('get_user_points_balance', { p_user_id: user?.id })
        .single()
      
      if (error) throw error
      
      const balanceData = data as BalanceResult
      
      updateTest('1. Verificar Saldo', 'success', 
        `✅ Saldo: ${balanceData.balance} pontos`, 
        { balance: balanceData.balance, level: balanceData.level, total_earned: balanceData.total_earned }
      )
    } catch (error: any) {
      updateTest('1. Verificar Saldo', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 2: Adicionar Pontos (Referral)
  // ============================================
  const testAddPoints = async () => {
    updateTest('2. Adicionar Pontos', 'running', 'Adicionando pontos de referral...')
    try {
      await addPoints({
        action_type: 'referral_signup',
        description: 'Teste de referral'
      })
      
      updateTest('2. Adicionar Pontos', 'success', '✅ Pontos adicionados com sucesso')
    } catch (error: any) {
      updateTest('2. Adicionar Pontos', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 3: Verificar Limite Diário
  // ============================================
  const testDailyLimit = async () => {
    updateTest('3. Verificar Limite Diário', 'running', 'Verificando limites...')
    try {
      const limit = await checkDailyLimit('give_like')
      
      updateTest('3. Verificar Limite Diário', 'success', 
        `✅ Limite: ${limit.remaining}/${limit.dailyLimit}`,
        limit
      )
    } catch (error: any) {
      updateTest('3. Verificar Limite Diário', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 4: Adicionar Múltiplos Pontos
  // ============================================
  const testMultiplePoints = async () => {
    updateTest('4. Múltiplas Ações', 'running', 'Testando diferentes ações...')
    try {
      const actions: Array<{ action_type: PointSource; description: string }> = [
        { action_type: 'referral_profile_completed', description: 'Teste completar perfil' },
        { action_type: 'give_like', description: 'Teste curtida premium' }
      ]
      
      for (const action of actions) {
        await addPoints(action)
      }
      
      updateTest('4. Múltiplas Ações', 'success', '✅ Todas as ações executadas')
    } catch (error: any) {
      updateTest('4. Múltiplas Ações', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 5: Verificar Histórico
  // ============================================
  const testHistory = async () => {
    updateTest('5. Histórico', 'running', 'Verificando histórico...')
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      
      updateTest('5. Histórico', 'success', 
        `✅ ${data.length} transações encontradas`,
        data
      )
    } catch (error: any) {
      updateTest('5. Histórico', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 6: Comprar Pacote de Pontos
  // ============================================
  const testBuyPoints = async () => {
    updateTest('6. Comprar Pontos', 'running', 'Criando pedido de compra...')
    try {
      if (!packages || packages.length === 0) {
        throw new Error('Nenhum pacote disponível')
      }
      
      const smallestPackage = packages[0] // Pegar o menor pacote
      
      await createPurchase({
        package_id: smallestPackage.id,
        payment_method: 'pix'
      })
      
      updateTest('6. Comprar Pontos', 'success', 
        `✅ Pedido criado: ${smallestPackage.name}`,
        smallestPackage
      )
    } catch (error: any) {
      updateTest('6. Comprar Pontos', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 7: Transferir Pontos
  // ============================================
  const testTransferPoints = async () => {
    if (!selectedUser) {
      updateTest('7. Transferir Pontos', 'error', '❌ Selecione um usuário primeiro')
      return
    }
    
    updateTest('7. Transferir Pontos', 'running', 'Transferindo pontos...')
    try {
      await createTransfer({
        to_user_id: selectedUser,
        points_amount: 10,
        message: 'Teste de transferência'
      })
      
      updateTest('7. Transferir Pontos', 'success', '✅ Transferência realizada')
    } catch (error: any) {
      updateTest('7. Transferir Pontos', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 8: Solicitar Saque
  // ============================================
  const testWithdrawal = async () => {
    updateTest('8. Solicitar Saque', 'running', 'Criando solicitação de saque...')
    try {
      await createWithdrawal({
        points_amount: 1000,
        pix_key: 'teste@email.com',
        pix_key_type: 'email'
      })
      
      updateTest('8. Solicitar Saque', 'success', '✅ Solicitação criada')
    } catch (error: any) {
      updateTest('8. Solicitar Saque', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 9: Comprar Item da Loja
  // ============================================
  const testBuyStoreItem = async () => {
    updateTest('9. Comprar na Loja', 'running', 'Comprando item...')
    try {
      if (!items || items.length === 0) {
        throw new Error('Nenhum item disponível')
      }
      
      const cheapestItem = items.sort((a, b) => a.points_price - b.points_price)[0]
      
      await purchaseItem(cheapestItem.id)
      
      updateTest('9. Comprar na Loja', 'success', 
        `✅ Item comprado: ${cheapestItem.name}`,
        cheapestItem
      )
    } catch (error: any) {
      updateTest('9. Comprar na Loja', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 10: Verificar Dashboard
  // ============================================
  const testDashboard = async () => {
    updateTest('10. Dashboard', 'running', 'Verificando dashboard...')
    try {
      if (!dashboard) {
        throw new Error('Dashboard não disponível')
      }
      
      updateTest('10. Dashboard', 'success', 
        `✅ Dashboard carregado`,
        {
          balance: dashboard.balance?.balance,
          level: dashboard.balance?.level,
          recent_transactions: dashboard.recent_transactions.length,
          monthly_earned: dashboard.monthly_stats.earned
        }
      )
    } catch (error: any) {
      updateTest('10. Dashboard', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // TESTE 11: Verificar Anti-Fraude
  // ============================================
  const testAntiFraud = async () => {
    updateTest('11. Anti-Fraude', 'running', 'Verificando sistema anti-fraude...')
    try {
      const { data: verification, error: verifyError } = await supabase
        .from('user_verification')
        .select('*')
        .eq('user_id', user?.id)
        .single()
      
      if (verifyError && verifyError.code !== 'PGRST116') throw verifyError
      
      const { data: fraud, error: fraudError } = await supabase
        .from('fraud_detection')
        .select('*')
        .eq('user_id', user?.id)
        .single()
      
      if (fraudError && fraudError.code !== 'PGRST116') throw fraudError
      
      updateTest('11. Anti-Fraude', 'success', 
        `✅ Sistema ativo`,
        {
          verification_level: verification?.verification_level || 'email',
          fraud_score: fraud?.fraud_score || 0,
          current_balance: balance?.balance || 0
        }
      )
    } catch (error: any) {
      updateTest('11. Anti-Fraude', 'error', `❌ Erro: ${error.message}`)
    }
  }

  // ============================================
  // EXECUTAR TODOS OS TESTES
  // ============================================
  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      // Testes sequenciais (ordem importa)
      await testCheckBalance()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await testAddPoints()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await testDailyLimit()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await testMultiplePoints()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await testHistory()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await testDashboard()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await testAntiFraud()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Testes de economia (opcional, requer configuração)
      // await testBuyPoints()
      // await testWithdrawal()
      // await testBuyStoreItem()
      
    } catch (error) {
      console.error('Erro nos testes:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
      case 'running': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-500">Sucesso</Badge>
      case 'error': return <Badge variant="destructive">Erro</Badge>
      case 'running': return <Badge variant="secondary">Executando...</Badge>
      default: return <Badge variant="outline">Pendente</Badge>
    }
  }

  const successCount = testResults.filter(t => t.status === 'success').length
  const errorCount = testResults.filter(t => t.status === 'error').length
  const totalTests = testResults.length

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Teste Sistema ConfiPoints</CardTitle>
            <CardDescription>Você precisa estar logado para executar os testes</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Teste Completo do Sistema ConfiPoints
          </CardTitle>
          <CardDescription>
            Valida todas as funcionalidades: ganhar pontos, transferir, gastar, comprar, sacar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Saldo Atual */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Atual</p>
              <p className="text-2xl font-bold">{balance?.balance || 0} ConfiPoints</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nível</p>
              <p className="text-xl font-semibold capitalize">{balance?.level || 'Bronze'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Ganho</p>
              <p className="text-xl font-semibold">{balance?.total_earned || 0}</p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-3">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executando Testes...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Executar Todos os Testes
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => setTestResults([])} 
              variant="outline"
              disabled={isRunning}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>

          {/* Resumo */}
          {totalTests > 0 && (
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sucesso</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Erros</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-blue-600">{totalTests}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      <div className="space-y-3">
        {testResults.map((test, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getStatusIcon(test.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{test.name}</h3>
                    {getStatusBadge(test.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{test.message}</p>
                  {test.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                        Ver detalhes
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instruções */}
      {testResults.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Testes Incluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✅ 1. Verificar saldo inicial</li>
              <li>✅ 2. Adicionar pontos (daily login)</li>
              <li>✅ 3. Verificar limite diário</li>
              <li>✅ 4. Testar múltiplas ações</li>
              <li>✅ 5. Verificar histórico de transações</li>
              <li>✅ 6. Validar dashboard</li>
              <li>✅ 7. Verificar sistema anti-fraude</li>
              <li>⏸️ 8. Comprar pacote de pontos (opcional)</li>
              <li>⏸️ 9. Solicitar saque (opcional)</li>
              <li>⏸️ 10. Comprar na loja premium (opcional)</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

