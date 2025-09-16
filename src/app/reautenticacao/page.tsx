'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useReauthentication } from '@/hooks/useReauthentication'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Shield, 
  Mail, 
  Key, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft,
  Info,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'

export default function ReauthenticationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    isLoading, 
    isReauthenticated, 
    error, 
    otpSent, 
    otpVerified,
    requestReauthentication, 
    verifyOTP, 
    resetReauthentication 
  } = useReauthentication()

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
          router.push('/home')
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
          title: 'ALTERAR SENHA',
          description: 'Para alterar sua senha, precisamos confirmar sua identidade',
          icon: <Key className="h-8 w-8" />,
          color: 'text-red-600'
        }
      case 'email':
        return {
          title: 'ALTERAR EMAIL',
          description: 'Para alterar seu email, precisamos confirmar sua identidade',
          icon: <Mail className="h-8 w-8" />,
          color: 'text-blue-600'
        }
      default:
        return {
          title: 'REAUTENTICAÇÃO',
          description: 'Confirme sua identidade para continuar',
          icon: <Shield className="h-8 w-8" />,
          color: 'text-yellow-600'
        }
    }
  }

  const actionInfo = getActionInfo()

  if (isReauthenticated && otpVerified) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="mx-auto w-20 h-20 bg-green-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
            REAUTENTICAÇÃO CONFIRMADA!
          </h1>
          <p className="text-black font-bold mb-8 animate-fade-in">
            SUA IDENTIDADE FOI VERIFICADA COM SUCESSO.
          </p>
          
          <div className="bg-green-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white mr-2" />
              <p className="text-white font-black text-sm">
                VOCÊ SERÁ REDIRECIONADO EM ALGUNS SEGUNDOS...
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (action === 'password') {
                router.push('/nova-senha')
              } else if (action === 'email') {
                router.push('/alterar-email')
              } else {
                router.push('/home')
              }
            }}
            className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse hover:animate-none"
          >
            CONTINUAR
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-400">
      {/* Header Brutalista */}
      <header className="bg-white border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)] sticky top-0 z-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 border border-black animate-ping"></div>
          <div className="absolute top-4 right-8 w-1 h-1 bg-black animate-pulse"></div>
          <div className="absolute bottom-2 left-12 w-1 h-1 bg-yellow-400 animate-bounce"></div>
        </div>
        
        <div className="container flex h-16 items-center justify-between px-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
              <span className="text-yellow-400 font-black text-lg">C</span>
            </div>
            <span className="text-xl font-poetsen-one text-black uppercase tracking-wider animate-fade-in" style={{textShadow: 'none'}}>CONFILAR</span>
          </div>
          
          <button 
            onClick={handleBack}
            className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all animate-fade-in flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLTAR</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-2xl w-full space-y-6">
          
          {/* Card Principal */}
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="text-center mb-8">
              <div className={`mx-auto w-16 h-16 bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse ${actionInfo.color}`}>
                {actionInfo.icon}
              </div>
              <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
                {actionInfo.title}
              </h1>
              <p className="text-black font-bold animate-fade-in">
                {actionInfo.description}
              </p>
            </div>

            {/* Explicação do Sistema */}
            <div className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
              <div className="flex items-start space-x-3">
                <Info className="h-6 w-6 text-black flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-black text-black uppercase mb-3">
                    O QUE É REAUTENTICAÇÃO?
                  </h3>
                  <div className="space-y-2 text-sm text-black font-bold">
                    <p>
                      <strong>REAUTENTICAÇÃO</strong> é um sistema de segurança que confirma sua identidade antes de ações sensíveis como:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Alterar senha</li>
                      <li>Modificar email</li>
                      <li>Acessar dados críticos</li>
                    </ul>
                    <p className="mt-3">
                      <strong>POR QUE PRECISAMOS DISSO?</strong><br/>
                      Para proteger sua conta contra acesso não autorizado, mesmo que alguém tenha acesso ao seu dispositivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Processo */}
            {!otpSent ? (
              <div className="space-y-6">
                <div className="bg-gray-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                  <h3 className="text-lg font-black text-black uppercase mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    COMO FUNCIONA?
                  </h3>
                  <div className="space-y-3 text-sm text-black font-bold">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-black text-white font-black text-xs flex items-center justify-center">1</div>
                      <span>Enviamos um código de 6 dígitos para seu email</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-black text-white font-black text-xs flex items-center justify-center">2</div>
                      <span>Você insere o código na tela</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-black text-white font-black text-xs flex items-center justify-center">3</div>
                      <span>Sua identidade é confirmada e você pode continuar</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRequestOTP}
                  disabled={isLoading}
                  className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO DE VERIFICAÇÃO'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-6 w-6 text-white" />
                    <div>
                      <h3 className="text-lg font-black text-white uppercase">
                        CÓDIGO ENVIADO!
                      </h3>
                      <p className="text-white font-bold text-sm">
                        Verifique seu email e insira o código de 6 dígitos abaixo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp" className="text-sm font-black text-black uppercase">
                      CÓDIGO DE VERIFICAÇÃO
                    </Label>
                    <div className="relative">
                      <Input
                        id="otp"
                        type={showOtp ? 'text' : 'password'}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="w-full px-4 py-3 text-lg font-bold bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all text-center tracking-widest"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtp(!showOtp)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600"
                      >
                        {showOtp ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-black font-bold mt-2">
                      Digite o código de 6 dígitos enviado para seu email
                    </p>
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full px-6 py-4 text-lg font-black text-white bg-green-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'VERIFICANDO...' : 'VERIFICAR CÓDIGO'}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={handleRequestOTP}
                      className="text-sm text-black hover:text-gray-600 hover:underline font-black uppercase"
                    >
                      REENVIAR CÓDIGO
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 mt-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-white" />
                  <p className="text-white font-black text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card de Segurança */}
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="text-lg font-black text-black uppercase mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              INFORMAÇÕES DE SEGURANÇA
            </h3>
            <div className="space-y-3 text-sm text-black font-bold">
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-black flex-shrink-0 mt-1" />
                <div>
                  <p><strong>TEMPO LIMITADO:</strong> O código expira em 10 minutos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Lock className="h-4 w-4 text-black flex-shrink-0 mt-1" />
                <div>
                  <p><strong>SEGURANÇA:</strong> Este processo protege sua conta contra acesso não autorizado</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-black flex-shrink-0 mt-1" />
                <div>
                  <p><strong>EMAIL:</strong> Verifique sua caixa de entrada e spam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
