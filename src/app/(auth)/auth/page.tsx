'use client'

import { useState, Suspense, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/forms/LoginForm'
import { SimpleRegistrationForm } from '@/components/forms/SimpleRegistrationForm'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('login')
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [redirectPath, setRedirectPath] = useState('/home')

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

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-lg border-0">
          <CardHeader className="pb-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Conta criada com sucesso!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Agora você pode fazer login e começar a usar a plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLoginClick}
              className="w-full"
              size="lg"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold">ConfiLar</span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-24">
        <div className="mx-auto max-w-md">
          {/* Header Card */}
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-foreground">
                Bem-vindo ao ConfiLar
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Conecte-se com profissionais confiáveis ou encontre clientes para seus serviços
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Auth Forms */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Criar Conta</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <Suspense fallback={<div>Carregando...</div>}>
                    <LoginForm />
                  </Suspense>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <Suspense fallback={<div>Carregando...</div>}>
                    <SimpleRegistrationForm />
                  </Suspense>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-center text-sm text-muted-foreground">
                  Ao continuar, você concorda com nossos{' '}
                  <a href="/termos" className="text-primary hover:underline">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="/privacidade" className="text-primary hover:underline">
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