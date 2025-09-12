'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'

export default function EmailVerificationSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Erro ao verificar usuário:', error)
          setStatus('error')
          setMessage('Erro ao verificar sua conta. Tente novamente.')
          return
        }

        if (currentUser?.email_confirmed_at) {
          setStatus('success')
          setMessage('🎉 Sua conta foi verificada com sucesso!')
        } else {
          setStatus('expired')
          setMessage('Link de verificação expirado ou inválido.')
        }
      } catch (error) {
        console.error('Erro inesperado:', error)
        setStatus('error')
        setMessage('Ocorreu um erro inesperado. Tente novamente.')
      }
    }

    checkVerificationStatus()
  }, [])

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: searchParams.get('email') || ''
      })

      if (error) {
        console.error('Erro ao reenviar email:', error)
        setMessage('Erro ao reenviar email. Tente novamente.')
      } else {
        setMessage('✅ Email de verificação reenviado! Verifique sua caixa de entrada.')
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      setMessage('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setIsResending(false)
    }
  }

  const handleGoToLogin = () => {
    router.push('/auth')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            {status === 'loading' ? (
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Mail className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {status === 'loading' && 'Verificando...'}
            {status === 'success' && 'Conta Verificada!'}
            {status === 'error' && 'Erro na Verificação'}
            {status === 'expired' && 'Link Expirado'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {status === 'loading' && 'Aguarde enquanto verificamos sua conta...'}
            {status === 'success' && 'Sua conta foi verificada com sucesso!'}
            {status === 'error' && 'Não foi possível verificar sua conta.'}
            {status === 'expired' && 'O link de verificação expirou ou é inválido.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {message && (
            <Alert className={status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={status === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Agora você pode acessar todas as funcionalidades do ConfiLar!
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Ir para Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleGoToLogin}
                  className="w-full"
                >
                  Fazer Login
                </Button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  O link de verificação expirou. Clique no botão abaixo para receber um novo email.
                </p>
              </div>
              
              <Button 
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 w-4 h-4" />
                    Reenviar Email
                  </>
                )}
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Ocorreu um erro ao verificar sua conta. Tente novamente ou entre em contato conosco.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 w-4 h-4" />
                      Tentar Novamente
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleGoToLogin}
                  className="w-full"
                >
                  Voltar ao Login
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>Precisa de ajuda? Entre em contato conosco.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
