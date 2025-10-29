'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Send, 
  Coins, 
  ArrowRight, 
  AlertCircle,
  Search,
  User,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react'
import { usePointsTransfers } from '@/hooks/useEconomy'
import { usePoints } from '@/hooks/usePoints'
import { useAuthContext } from '@/contexts/AuthContext'
import { MIN_TRANSFER_POINTS } from '@/types/economy'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function TransferirConfiPointsPage() {
  const { user } = useAuthContext()
  const { balance } = usePoints(user?.id)
  const { transfers, loading, createTransfer, isCreating } = usePointsTransfers(user?.id)
  
  const [pointsAmount, setPointsAmount] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [searchEmail, setSearchEmail] = useState<string>('')
  const [searchedUser, setSearchedUser] = useState<any>(null)
  const [searching, setSearching] = useState(false)

  const pointsValue = parseInt(pointsAmount) || 0

  const handleSearchUser = async () => {
    if (!searchEmail) {
      toast.error('Digite um e-mail para buscar')
      return
    }

    setSearching(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .eq('email', searchEmail)
        .single()

      if (error || !data) {
        toast.error('Usuário não encontrado')
        setSearchedUser(null)
        return
      }

      if (data.id === user?.id) {
        toast.error('Você não pode transferir para si mesmo')
        setSearchedUser(null)
        return
      }

      setSearchedUser(data)
      toast.success('Usuário encontrado!')
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      toast.error('Erro ao buscar usuário')
      setSearchedUser(null)
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pointsAmount || pointsValue < MIN_TRANSFER_POINTS) {
      toast.error(`Valor mínimo de transferência: ${MIN_TRANSFER_POINTS.toLocaleString()} pontos`)
      return
    }

    if (!balance || balance.balance < pointsValue) {
      toast.error('Saldo insuficiente')
      return
    }

    if (!searchedUser) {
      toast.error('Selecione um destinatário')
      return
    }

    try {
      await createTransfer({
        to_user_id: searchedUser.id,
        points_amount: pointsValue,
        message: message || undefined
      })

      toast.success('Transferência realizada com sucesso!')
      setPointsAmount('')
      setMessage('')
      setSearchEmail('')
      setSearchedUser(null)
    } catch (error: any) {
      console.error('Erro ao criar transferência:', error)
      toast.error(error.message || 'Erro ao processar transferência')
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
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Send className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Transferir ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Envie pontos para outros usuários
                  </p>
                </div>
              </div>
            </div>

            {/* Saldo Atual */}
            {balance && (
              <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Saldo disponível
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {balance.balance.toLocaleString()} pontos
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário de Transferência */}
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Pontos</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Buscar Usuário */}
                    <div className="space-y-2">
                      <Label htmlFor="searchEmail">Buscar Destinatário</Label>
                      <div className="flex gap-2">
                        <Input
                          id="searchEmail"
                          type="email"
                          placeholder="email@exemplo.com"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        <Button
                          type="button"
                          onClick={handleSearchUser}
                          disabled={searching}
                          variant="outline"
                        >
                          {searching ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Usuário Encontrado */}
                    {searchedUser && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={searchedUser.avatar_url} />
                            <AvatarFallback>
                              {searchedUser.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {searchedUser.full_name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {searchedUser.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quantidade de Pontos */}
                    <div className="space-y-2">
                      <Label htmlFor="points">Quantidade de Pontos</Label>
                      <Input
                        id="points"
                        type="number"
                        placeholder="Ex: 1000"
                        value={pointsAmount}
                        onChange={(e) => setPointsAmount(e.target.value)}
                        min={MIN_TRANSFER_POINTS}
                        step={10}
                        disabled={!searchedUser}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Mínimo: {MIN_TRANSFER_POINTS.toLocaleString()} pontos
                      </p>
                    </div>

                    {/* Mensagem */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem (Opcional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Deixe uma mensagem para o destinatário..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        disabled={!searchedUser}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Resumo */}
                    {pointsValue > 0 && searchedUser && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Você enviará:
                          </span>
                          <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                            {pointsValue.toLocaleString()} pontos
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Para:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {searchedUser.full_name}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isCreating || !searchedUser || !balance || balance.balance < pointsValue}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Pontos
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
                    <strong className="block mb-2">Como funciona:</strong>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Transferências são instantâneas</li>
                      <li>Mínimo: {MIN_TRANSFER_POINTS.toLocaleString()} pontos</li>
                      <li>Sem taxas para transferências</li>
                      <li>Não é possível cancelar após enviar</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      ✨ Você pode enviar pontos para agradecer, presentear ou ajudar outros usuários!
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      🔒 Transferências são registradas e não podem ser revertidas. Certifique-se de que está enviando para a pessoa correta!
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      💬 Deixe uma mensagem para tornar o gesto mais especial!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Histórico de Transferências */}
            {transfers && transfers.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-purple-600" />
                    Histórico de Transferências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transfers.map((transfer: any) => {
                      const isSent = transfer.from_user_id === user?.id
                      const otherUser = isSent ? transfer.to_user : transfer.from_user
                      
                      return (
                        <div 
                          key={transfer.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {isSent ? (
                              <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={otherUser?.avatar_url} />
                              <AvatarFallback>
                                {otherUser?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {isSent ? 'Enviado para' : 'Recebido de'} {otherUser?.full_name || 'Usuário'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(transfer.created_at).toLocaleDateString('pt-BR')} às {new Date(transfer.created_at).toLocaleTimeString('pt-BR')}
                              </p>
                              {transfer.message && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                                  "{transfer.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold text-lg ${isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                              {isSent ? '-' : '+'}{transfer.points_amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              pontos
                            </p>
                          </div>
                        </div>
                      )
                    })}
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
