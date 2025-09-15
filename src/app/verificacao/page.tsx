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
            <span className="text-xl font-black text-black uppercase tracking-wider animate-fade-in">CONFILAR</span>
          </div>
        </div>
      </header>

      {/* Main Content Brutalista */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-md w-full bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
              {status === 'loading' ? (
                <RefreshCw className="w-10 h-10 text-yellow-400 animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle className="w-10 h-10 text-yellow-400" />
              ) : (
                <Mail className="w-10 h-10 text-yellow-400" />
              )}
            </div>
            <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
              {status === 'loading' && 'VERIFICANDO...'}
              {status === 'success' && 'CONTA VERIFICADA!'}
              {status === 'error' && 'ERRO NA VERIFICAÇÃO'}
              {status === 'expired' && 'LINK EXPIRADO'}
            </h1>
            <p className="text-black font-bold animate-fade-in">
              {status === 'loading' && 'AGUARDE ENQUANTO VERIFICAMOS SUA CONTA...'}
              {status === 'success' && 'SUA CONTA FOI VERIFICADA COM SUCESSO!'}
              {status === 'error' && 'NÃO FOI POSSÍVEL VERIFICAR SUA CONTA.'}
              {status === 'expired' && 'O LINK DE VERIFICAÇÃO EXPIROU OU É INVÁLIDO.'}
            </p>
          </div>

          {message && (
            <div className={`border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 mb-6 ${
              status === 'success' ? 'bg-green-400' : 'bg-red-400'
            }`}>
              <p className={`text-black font-black text-sm ${
                status === 'success' ? 'text-black' : 'text-black'
              }`}>
                {message}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-black font-bold mb-4">
                  AGORA VOCÊ PODE ACESSAR TODAS AS FUNCIONALIDADES DO CONFILAR!
                </p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleGoToDashboard}
                  className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse hover:animate-none flex items-center justify-center space-x-2"
                >
                  <span>IR PARA DASHBOARD</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={handleGoToLogin}
                  className="w-full px-6 py-4 text-lg font-black text-black bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  FAZER LOGIN
                </button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-black font-bold mb-4">
                  O LINK DE VERIFICAÇÃO EXPIROU. CLIQUE NO BOTÃO ABAIXO PARA RECEBER UM NOVO EMAIL.
                </p>
              </div>
              
              <button 
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>REENVIANDO...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>REENVIAR EMAIL</span>
                  </>
                )}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-black font-bold mb-4">
                  OCORREU UM ERRO AO VERIFICAR SUA CONTA. TENTE NOVAMENTE OU ENTRE EM CONTATO CONOSCO.
                </p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>REENVIANDO...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>TENTAR NOVAMENTE</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleGoToLogin}
                  className="w-full px-6 py-4 text-lg font-black text-black bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  VOLTAR AO LOGIN
                </button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-black font-bold mt-6">
            <p>PRECISA DE AJUDA? ENTRE EM CONTATO CONOSCO.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
