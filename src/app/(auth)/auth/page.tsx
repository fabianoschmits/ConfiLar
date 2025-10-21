'use client'

import { useState, Suspense, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/forms/LoginForm'
import { BasicSignupForm } from '@/components/forms/BasicSignupForm'
import { Check, ArrowLeft, Sparkles, X, Users } from 'lucide-react'
import { LightModeLayout } from '@/components/layout/LightModeLayout'
import { useRouter, useSearchParams } from 'next/navigation'
import { useReferralTracking } from '@/hooks/useReferralTracking'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('login')
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [redirectPath, setRedirectPath] = useState('/feed')
  const [referralInfo, setReferralInfo] = useState<{ code: string; userName?: string } | null>(null)

  // Hook de tracking de referral
  useReferralTracking()

  useEffect(() => {
    // Obter o parâmetro de redirecionamento da URL
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectPath(decodeURIComponent(redirect))
    }

    // Obter o parâmetro de aba da URL
    const tab = searchParams.get('tab')
    if (tab === 'register') {
      setActiveTab('register')
    }

    // Verificar se há mensagem de conta criada
    const message = searchParams.get('message')
    if (message === 'account_created') {
      setRegistrationComplete(true)
      setActiveTab('login')
    }

    // Verificar se há código de referral
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralInfo({ code: refCode })
      // Se há código de referral, mudar para aba de cadastro
      setActiveTab('register')
      // Validar código (opcional, para mostrar nome do indicador)
      validateReferralCode(refCode)
    }
  }, [searchParams])

  const validateReferralCode = async (code: string) => {
    try {
      const { data } = await fetch('/api/referrals/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      }).then(r => r.json())

      if (data?.userName) {
        setReferralInfo(prev => prev ? { ...prev, userName: data.userName } : null)
      }
    } catch (err) {
      console.error('Erro ao validar código de referral:', err)
    }
  }

  const handleRegistrationComplete = () => {
    setRegistrationComplete(true)
    setActiveTab('login')
  }

  const handleBackToHome = () => {
    router.push(redirectPath)
  }

  const handleLoginClick = () => {
    setRegistrationComplete(false)
  }

  return (
    <LightModeLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Moderno */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 flex items-center justify-center shadow-lg">
              <img 
                src="/imagens/logo/confilarlogo5.png" 
                alt="ConfiLar Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">ConfiLar</span>
          </div>
          
          <Button 
            onClick={handleBackToHome}
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Button>
        </div>
      </header>

      {/* Main Content Moderno */}
      <div className="container py-12 md:py-24">
        <div className="mx-auto max-w-md">
          {/* Banner de Indicação */}
          {referralInfo && (
            <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      🎉 Você foi indicado{referralInfo.userName && ` por ${referralInfo.userName}`}!
                    </p>
                    <p className="text-sm text-gray-600">
                      Cadastre-se e ganhe benefícios exclusivos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header Card Moderno */}
          <Card className="mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                Bem-vindo ao ConfiLar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Conecte-se com profissionais confiáveis ou encontre clientes para seus serviços
              </p>
            </CardContent>
          </Card>

          {/* Auth Forms Modernas */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <TabsTrigger 
                    value="login"
                    className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
                  >
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <Suspense fallback={
                    <div className="text-center py-8">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto animate-pulse"></div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium mt-2">Carregando...</p>
                    </div>
                  }>
                    <LoginForm />
                  </Suspense>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <Suspense fallback={
                    <div className="text-center py-8">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto animate-pulse"></div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium mt-2">Carregando...</p>
                    </div>
                  }>
                    <BasicSignupForm />
                  </Suspense>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <div className="h-px bg-gray-200 my-4"></div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Ao continuar, você concorda com nossos{' '}
                  <a href="/termos" className="text-blue-600 underline hover:text-blue-700 font-medium">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="/privacidade" className="text-blue-600 underline hover:text-blue-700 font-medium">
                    Política de Privacidade
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      </div>
    </LightModeLayout>
  )
}