'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, 
  Coins, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  TrendingDown
} from 'lucide-react'
import { usePointsWithdrawals } from '@/hooks/useEconomy'
import { usePoints } from '@/hooks/usePoints'
import { useAuthContext } from '@/contexts/AuthContext'
import { formatBRL, validatePixKey, WITHDRAWAL_FEE_PERCENTAGE, MIN_WITHDRAWAL_POINTS } from '@/types/economy'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SaqueConfiPointsPage() {
  const { user } = useAuthContext()
  const { balance } = usePoints(user?.id)
  const { withdrawals, loading, createWithdrawal, isCreating } = usePointsWithdrawals(user?.id)
  
  const [pointsAmount, setPointsAmount] = useState<string>('')
  const [pixKey, setPixKey] = useState<string>('')
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>('cpf')

  const pointsValue = parseInt(pointsAmount) || 0
  const brlValue = pointsValue / 100 // 100 pontos = R$ 1,00
  const feeAmount = brlValue * (WITHDRAWAL_FEE_PERCENTAGE / 100)
  const netValue = brlValue - feeAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pointsAmount || pointsValue < MIN_WITHDRAWAL_POINTS) {
      toast.error(`Valor mínimo de saque: ${MIN_WITHDRAWAL_POINTS.toLocaleString()} pontos`)
      return
    }

    if (!balance || balance.balance < pointsValue) {
      toast.error('Saldo insuficiente')
      return
    }

    if (!pixKey) {
      toast.error('Chave PIX é obrigatória')
      return
    }

    if (!validatePixKey(pixKey, pixKeyType)) {
      toast.error('Chave PIX inválida')
      return
    }

    try {
      await createWithdrawal({
        points_amount: pointsValue,
        pix_key: pixKey,
        pix_key_type: pixKeyType
      })

      toast.success('Saque solicitado com sucesso! Aguarde a aprovação.')
      setPointsAmount('')
      setPixKey('')
    } catch (error: any) {
      console.error('Erro ao criar saque:', error)
      toast.error(error.message || 'Erro ao processar saque')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Clock className="w-3 h-3 mr-1" /> Pendente
        </Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" /> Aprovado
        </Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <Clock className="w-3 h-3 mr-1" /> Processando
        </Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" /> Concluído
        </Badge>
      case 'rejected':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" /> Rejeitado
        </Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Sacar ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Converta seus pontos em dinheiro
                  </p>
                </div>
              </div>
            </div>

            {/* Saldo Atual */}
            {balance && (
              <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Saldo disponível para saque
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {balance.balance.toLocaleString()} pontos
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ≈ {formatBRL(balance.balance / 100)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário de Saque */}
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Saque</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Valor em Pontos */}
                    <div className="space-y-2">
                      <Label htmlFor="points">Quantidade de Pontos</Label>
                      <Input
                        id="points"
                        type="number"
                        placeholder="Ex: 10000"
                        value={pointsAmount}
                        onChange={(e) => setPointsAmount(e.target.value)}
                        min={MIN_WITHDRAWAL_POINTS}
                        step={100}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Mínimo: {MIN_WITHDRAWAL_POINTS.toLocaleString()} pontos
                      </p>
                    </div>

                    {/* Tipo de Chave PIX */}
                    <div className="space-y-2">
                      <Label htmlFor="pixType">Tipo de Chave PIX</Label>
                      <select
                        id="pixType"
                        value={pixKeyType}
                        onChange={(e) => setPixKeyType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cpf">CPF</option>
                        <option value="email">E-mail</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Chave Aleatória</option>
                      </select>
                    </div>

                    {/* Chave PIX */}
                    <div className="space-y-2">
                      <Label htmlFor="pixKey">Chave PIX</Label>
                      <Input
                        id="pixKey"
                        type="text"
                        placeholder={
                          pixKeyType === 'cpf' ? '000.000.000-00' :
                          pixKeyType === 'email' ? 'seu@email.com' :
                          pixKeyType === 'phone' ? '(00) 00000-0000' :
                          'chave-aleatoria'
                        }
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Cálculo */}
                    {pointsValue > 0 && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Pontos:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {pointsValue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Valor bruto:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatBRL(brlValue)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Taxa ({WITHDRAWAL_FEE_PERCENTAGE}%):
                          </span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            - {formatBRL(feeAmount)}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Você receberá:
                            </span>
                            <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                              {formatBRL(netValue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isCreating || !balance || balance.balance < pointsValue}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Solicitar Saque
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Informações */}
              <div className="space-y-6">
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong className="block mb-2">Como funciona o saque:</strong>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Valor mínimo: {MIN_WITHDRAWAL_POINTS.toLocaleString()} pontos</li>
                      <li>Taxa de saque: {WITHDRAWAL_FEE_PERCENTAGE}%</li>
                      <li>Conversão: 100 pontos = R$ 1,00</li>
                      <li>Prazo: 1-3 dias úteis após aprovação</li>
                      <li>Pagamento via PIX</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Regras de Saque</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Saques são analisados manualmente para sua segurança
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600 dark:text-gray-400">
                        A chave PIX deve estar em seu nome
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Você pode solicitar apenas 1 saque por vez
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Pontos de bônus não podem ser sacados imediatamente
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Histórico de Saques */}
            {withdrawals && withdrawals.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    Histórico de Saques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal: any) => (
                      <div 
                        key={withdrawal.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {withdrawal.points_amount.toLocaleString()} pontos
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(withdrawal.created_at).toLocaleDateString('pt-BR')} às {new Date(withdrawal.created_at).toLocaleTimeString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PIX: {withdrawal.pix_key_type} • {withdrawal.pix_key}
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {formatBRL(withdrawal.amount_brl)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Taxa: {formatBRL(withdrawal.fee_brl)}
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                            Líquido: {formatBRL(withdrawal.net_amount_brl)}
                          </p>
                        </div>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
