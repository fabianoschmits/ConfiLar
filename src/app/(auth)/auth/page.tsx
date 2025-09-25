'use client'

import { useState, Suspense, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/forms/LoginForm'
import { BasicSignupForm } from '@/components/forms/BasicSignupForm'
import { Check, ArrowLeft, Sparkles, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('login')
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [redirectPath, setRedirectPath] = useState('/dashboard')

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
  }, [searchParams])

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Moderno */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ConfiLar</span>
          </div>
          
          <Button 
            onClick={handleBackToHome}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Button>
        </div>
      </header>

      {/* Main Content Moderno */}
      <div className="container py-12 md:py-24">
        <div className="mx-auto max-w-md">
          {/* Header Card Moderno */}
          <Card className="mb-8 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-4">
                Bem-vindo ao ConfiLar
              </h1>
              <p className="text-gray-600 text-lg">
                Conecte-se com profissionais confiáveis ou encontre clientes para seus serviços
              </p>
            </CardContent>
          </Card>

          {/* Auth Forms Modernas */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 rounded-lg">
                  <TabsTrigger 
                    value="login"
                    className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <Suspense fallback={
                    <div className="text-center py-8">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto animate-pulse"></div>
                      <p className="text-gray-600 font-medium mt-2">Carregando...</p>
                    </div>
                  }>
                    <LoginForm />
                  </Suspense>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <Suspense fallback={
                    <div className="text-center py-8">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto animate-pulse"></div>
                      <p className="text-gray-600 font-medium mt-2">Carregando...</p>
                    </div>
                  }>
                    <BasicSignupForm />
                  </Suspense>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <div className="h-px bg-gray-200 my-4"></div>
                <div className="text-center text-sm text-gray-600">
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
  )
}