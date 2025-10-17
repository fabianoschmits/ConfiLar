'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
// import { useReauthentication } from '@/hooks/useReauthentication'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Shield, 
  Mail, 
  Key, 
  CheckCircle, 
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react'
import { LightModeLayout } from '@/components/layout/LightModeLayout'
import { ClientOnly } from '@/components/ClientOnly'

export default function ReauthenticationPage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
  // const { 
  //   isLoading, 
  //   isReauthenticated, 
  //   error, 
  //   otpSent, 
  //   otpVerified,
  //   requestReauthentication, 
  //   verifyOTP, 
  //   resetReauthentication 
  // } = useReauthentication()
  
  const isLoading = false
  const isReauthenticated = false
  const error = null
  const otpSent = false
  const otpVerified = false
  const requestReauthentication = async () => ({ error: null })
  const verifyOTP = async (otp: string) => ({ error: null })
  const resetReauthentication = () => {}

  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [action, setAction] = useState<'password' | 'email' | 'general'>('general')

  // Obter ação que requer reautenticação
  useEffect(() => {
    const actionParam = searchParams.get('action') as 'password' | 'email' | 'general'
    if (actionParam) {
      setAction(actionParam)
    }
  }, [searchParams])

  const handleRequestOTP = async () => {
    const { error } = await requestReauthentication()
    if (error) {
      toast.error('Erro ao enviar código: ' + error.message)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error('Digite o código de verificação')
      return
    }

    const { error } = await verifyOTP(otp)
    if (error) {
      toast.error('Código inválido: ' + error.message)
    } else {
      // Salvar sessão de reautenticação
      sessionStorage.setItem('reauth_session', JSON.stringify({
        timestamp: new Date().toISOString(),
        action: action
      }))
      
      // Redirecionar baseado na ação
      setTimeout(() => {
        if (action === 'password') {
          router.push('/nova-senha')
        } else if (action === 'email') {
          router.push('/alterar-email')
        } else {
          router.push('/')
        }
      }, 2000)
    }
  }

  const handleBack = () => {
    resetReauthentication()
    router.back()
  }

  const getActionInfo = () => {
    switch (action) {
      case 'password':
        return {
          title: 'Alterar senha',
          description: 'Para alterar sua senha, precisamos confirmar sua identidade',
          icon: <Key className="h-8 w-8" />,
          color: 'text-red-600'
        }
      case 'email':
        return {
          title: 'Alterar email',
          description: 'Para alterar seu email, precisamos confirmar sua identidade',
          icon: <Mail className="h-8 w-8" />,
          color: 'text-blue-600'
        }
      default:
        return {
          title: 'Verificação de segurança',
          description: 'Confirme sua identidade para continuar',
          icon: <Shield className="h-8 w-8" />,
          color: 'text-purple-600'
        }
    }
  }

  const actionInfo = getActionInfo()

  // Sucesso - Identidade confirmada
  if (isReauthenticated && otpVerified) {
    return (
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-md border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Identidade confirmada!
            </h1>
            <p className="text-gray-600 mb-8">
              Sua identidade foi verificada com sucesso. Redirecionando...
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-700 font-medium text-sm">
                  Você será redirecionado em alguns segundos...
                </p>
              </div>
            </div>

            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
      </LightModeLayout>
    )
  }

  return (
    <ClientOnly>
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header moderno */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">ConfiLar</span>
          </div>
          
          <Button 
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 dark:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="max-w-md w-full bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg ${actionInfo.color}`}>
              {actionInfo.icon}
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
              {actionInfo.title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {actionInfo.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!otpSent ? (
              // Primeira etapa: Solicitar código
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Verificação de segurança
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Por segurança, enviaremos um código de verificação para seu email cadastrado.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      • Verifique sua caixa de entrada
                    </p>
                    <p className="text-sm text-gray-600">
                      • O código expira em 10 minutos
                    </p>
                    <p className="text-sm text-gray-600">
                      • Não compartilhe o código
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleRequestOTP}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  {isLoading ? 'Enviando...' : 'Enviar código de verificação'}
                </Button>
              </>
            ) : (
              // Segunda etapa: Verificar código
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Código enviado!
                  </h3>
                  <p className="text-sm text-green-700">
                    Enviamos um código de verificação para seu email. Digite-o abaixo para continuar.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Código de verificação
                  </Label>
                  <div className="relative">
                    <Input
                      id="otp"
                      type={showOtp ? 'text' : 'password'}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Digite o código de 6 dígitos"
                      className="pr-10 text-center tracking-widest"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowOtp(!showOtp)}
                    >
                      {showOtp ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || !otp.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  {isLoading ? 'Verificando...' : 'Verificar código'}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    resetReauthentication()
                    setOtp('')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium mx-auto block"
                >
                  Solicitar novo código
                </button>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  Erro: {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
        </div>
      </LightModeLayout>
    </ClientOnly>
  )
}
