'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useReauthentication } from '@/hooks/useReauthentication'

const changeEmailSchema = z.object({
  newEmail: z.string().email('Email inválido')
})

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>

interface ChangeEmailFormProps {
  currentEmail: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function ChangeEmailForm({ 
  currentEmail, 
  onSuccess, 
  onCancel,
  className 
}: ChangeEmailFormProps) {
  const [step, setStep] = useState<'form' | 'reauth' | 'verification' | 'success'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [newEmail, setNewEmail] = useState('')
  
  const {
    isLoading: isReauthLoading,
    isReauthenticated,
    error: reauthError,
    otpSent,
    requestReauthentication,
    verifyOTP,
    resetReauthentication,
    checkReauthenticationRequired
  } = useReauthentication()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema)
  })

  const onSubmit = async (data: ChangeEmailFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      setNewEmail(data.newEmail)

      // 1. Verificar se reautenticação é necessária
      const needsReauth = await checkReauthenticationRequired('email')
      
      if (needsReauth) {
        setStep('reauth')
        setIsLoading(false)
        return
      }

      // 2. Iniciar processo de troca de email
      await initiateEmailChange(data.newEmail)

    } catch (err: any) {
      console.error('Erro ao iniciar troca de email:', err)
      setError(err.message || 'Erro ao iniciar troca de email')
      toast.error('Erro ao trocar email', {
        description: err.message
      })
      setIsLoading(false)
    }
  }

  const initiateEmailChange = async (email: string) => {
    // Usar nossa API que garante envio de OTP em vez de magic link
    const response = await fetch('/api/auth/change-email-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newEmail: email })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao enviar código de verificação')
    }

    setStep('verification')
    toast.success('Código de verificação enviado!', {
      description: `Verifique sua caixa de entrada em ${email}`
    })
    setIsLoading(false)
  }

  const handleReauthentication = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await requestReauthentication()
      if (error) {
        throw new Error(error.message)
      }

    } catch (err: any) {
      console.error('Erro na reautenticação:', err)
      setError(err.message || 'Erro na reautenticação')
      toast.error('Erro na reautenticação', {
        description: err.message
      })
      setIsLoading(false)
    }
  }

  const handleReauthOTP = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await verifyOTP(verificationCode)
      if (error) {
        throw new Error(error.message)
      }

      // Após reautenticação bem-sucedida, iniciar troca de email
      await initiateEmailChange(newEmail)

    } catch (err: any) {
      console.error('Erro ao verificar código de reautenticação:', err)
      setError(err.message || 'Código inválido')
      toast.error('Código inválido', {
        description: err.message
      })
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: newEmail,
        token: verificationCode,
        type: 'email_change'
      })

      if (verifyError) {
        throw new Error('Código inválido ou expirado')
      }

      setStep('success')
      toast.success('Email alterado com sucesso!')
      
      if (onSuccess) {
        onSuccess()
      }

    } catch (err: any) {
      console.error('Erro ao verificar código:', err)
      setError(err.message || 'Erro ao verificar código')
      toast.error('Código inválido', {
        description: err.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Usar nossa API para reenviar o código OTP
      const response = await fetch('/api/auth/change-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newEmail: newEmail })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao reenviar código')
      }

      toast.success('Código reenviado!', {
        description: 'Verifique sua caixa de entrada'
      })

    } catch (err: any) {
      console.error('Erro ao reenviar código:', err)
      setError(err.message || 'Erro ao reenviar código')
      toast.error('Erro ao reenviar código')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep('form')
    setError(null)
    setVerificationCode('')
    setNewEmail('')
    resetReauthentication()
    reset()
  }

  if (step === 'success') {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Email Alterado com Sucesso!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Seu email foi alterado de <strong>{currentEmail}</strong> para <strong>{newEmail}</strong>
          </p>
          <Button onClick={resetForm} variant="outline">
            Alterar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === 'reauth') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Reautenticação Necessária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Para alterar seu email, precisamos confirmar sua identidade. 
              Enviaremos um código de verificação para <strong>{currentEmail}</strong>.
            </AlertDescription>
          </Alert>

          {(error || reauthError) && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error || reauthError}</AlertDescription>
            </Alert>
          )}

          {!otpSent ? (
            <Button
              onClick={handleReauthentication}
              disabled={isLoading || isReauthLoading}
              className="w-full"
            >
              {(isLoading || isReauthLoading) ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Código de Verificação'
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reauthCode">Código de Verificação</Label>
                <Input
                  id="reauthCode"
                  type="text"
                  placeholder="Digite o código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <Button
                onClick={handleReauthOTP}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Código'
                )}
              </Button>
            </div>
          )}

          <Button
            onClick={resetForm}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === 'verification') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Verificar Novo Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Enviamos um código de verificação para <strong>{newEmail}</strong>. 
              Digite o código abaixo para confirmar a alteração.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="verificationCode">Código de Verificação</Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="Digite o código de 6 dígitos"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={verifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Código'
              )}
            </Button>
            <Button
              onClick={resendCode}
              variant="outline"
              disabled={isLoading}
            >
              Reenviar
            </Button>
          </div>

          <Button
            onClick={resetForm}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Alterar Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Email atual: <strong>{currentEmail}</strong>
          </span>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">Novo Email</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="Digite seu novo email"
              {...register('newEmail')}
              className={cn(errors.newEmail && 'border-red-500')}
            />
            {errors.newEmail && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.newEmail.message}
              </p>
            )}
          </div>

          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              <strong>Segurança:</strong> Para alterar seu email, você precisará 
              confirmar sua identidade e depois verificar o novo email.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                'Alterar Email'
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
