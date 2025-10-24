'use client'

import { useState } from 'react'
import { ChangeEmailForm } from '@/components/forms/ChangeEmailForm'
import { useAuthContext } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, TestTube } from 'lucide-react'

export default function TesteEmailPage() {
  const { user } = useAuthContext()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-blue-600" />
              Teste do Sistema de Troca de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Status do Sistema
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Usuário logado:</strong> {user?.email || 'Não logado'}</p>
                <p><strong>ID do usuário:</strong> {user?.id || 'N/A'}</p>
                <p><strong>Status:</strong> {user ? '✅ Autenticado' : '❌ Não autenticado'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {showForm ? 'Ocultar Formulário' : 'Testar Troca de Email'}
              </Button>
            </div>

            {showForm && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Formulário de Troca de Email</h4>
                <ChangeEmailForm
                  currentEmail={user?.email || 'teste@exemplo.com'}
                  onSuccess={() => {
                    console.log('✅ Email alterado com sucesso!')
                    setShowForm(false)
                  }}
                  onCancel={() => {
                    console.log('❌ Troca de email cancelada')
                    setShowForm(false)
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como Funciona o Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100">1. Verificação de Reautenticação</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  O sistema verifica se o usuário precisa reautenticar baseado no tempo de sessão (últimas 24h).
                </p>
              </div>

              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">2. Reautenticação (se necessária)</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Se necessário, envia código OTP para o email atual para confirmar identidade.
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">3. Troca de Email</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Após reautenticação, inicia processo de troca enviando código para o novo email.
                </p>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">4. Verificação Final</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Usuário confirma o novo email com código recebido, finalizando a alteração.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
