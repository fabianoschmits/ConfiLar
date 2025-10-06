'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDuplicateCheck, useEmailCheck, useCpfCheck } from '@/hooks/useDuplicateCheck'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

/**
 * Componente de demonstração do sistema de verificação de duplicatas
 * Pode ser usado para testar o sistema
 */
export function DuplicateCheckDemo() {
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [results, setResults] = useState<any>(null)

  const { checkDuplicates, isChecking, error } = useDuplicateCheck()
  const { checkEmail, isChecking: isCheckingEmail } = useEmailCheck()
  const { checkCpf, isChecking: isCheckingCpf } = useCpfCheck()

  const handleCheckEmail = async () => {
    if (!email) return
    const exists = await checkEmail(email)
    setResults({ email, emailExists: exists })
  }

  const handleCheckCpf = async () => {
    if (!cpf) return
    const exists = await checkCpf(cpf)
    setResults({ cpf, cpfExists: exists })
  }

  const handleCheckBoth = async () => {
    if (!email && !cpf) return
    const result = await checkDuplicates(email || undefined, cpf || undefined)
    setResults(result)
  }

  const getStatusIcon = (exists: boolean) => {
    if (exists) {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />
  }

  const getStatusText = (exists: boolean) => {
    if (exists) {
      return <span className="text-red-600 font-medium">Já cadastrado</span>
    }
    return <span className="text-green-600 font-medium">Disponível</span>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            Teste do Sistema de Verificação de Duplicatas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teste de Email */}
          <div className="space-y-3">
            <Label htmlFor="email-test">Email para verificar</Label>
            <div className="flex gap-2">
              <Input
                id="email-test"
                type="email"
                placeholder="teste@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCheckEmail}
                disabled={!email || isCheckingEmail}
                variant="outline"
                size="sm"
              >
                {isCheckingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Verificar Email'
                )}
              </Button>
            </div>
          </div>

          {/* Teste de CPF */}
          <div className="space-y-3">
            <Label htmlFor="cpf-test">CPF para verificar</Label>
            <div className="flex gap-2">
              <Input
                id="cpf-test"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCheckCpf}
                disabled={!cpf || isCheckingCpf}
                variant="outline"
                size="sm"
              >
                {isCheckingCpf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Verificar CPF'
                )}
              </Button>
            </div>
          </div>

          {/* Teste Combinado */}
          <div className="space-y-3">
            <Label>Verificação Combinada</Label>
            <Button
              onClick={handleCheckBoth}
              disabled={(!email && !cpf) || isChecking}
              className="w-full"
            >
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Verificar Email e CPF
            </Button>
          </div>

          {/* Resultados */}
          {results && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-900">Resultados:</h3>
              
              {results.email && (
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <p className="text-sm font-medium">Email: {results.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.emailExists)}
                    {getStatusText(results.emailExists)}
                  </div>
                </div>
              )}

              {results.cpf && (
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <p className="text-sm font-medium">CPF: {results.cpf}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.cpfExists)}
                    {getStatusText(results.cpfExists)}
                  </div>
                </div>
              )}

              {results.hasDuplicates && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ Encontradas duplicatas! Use os links de recuperação.
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800 font-medium">
                ❌ Erro: {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
