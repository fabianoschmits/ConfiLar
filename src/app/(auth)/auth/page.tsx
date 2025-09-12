'use client'

import { useState, Suspense, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/forms/LoginForm'
import { SimpleRegistrationForm } from '@/components/forms/SimpleRegistrationForm'
import { IconCheck, IconArrowLeft } from '@tabler/icons-react'
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
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="mx-auto w-20 h-20 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
            <IconCheck size={40} stroke={2} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
            CONTA CRIADA COM SUCESSO!
          </h1>
          <p className="text-black font-bold mb-8 animate-fade-in">
            AGORA VOCÊ PODE FAZER LOGIN E COMEÇAR A USAR A PLATAFORMA.
          </p>
          <button 
            onClick={handleLoginClick}
            className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse hover:animate-none"
          >
            FAZER LOGIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-400">
      {/* Header Brutalista */}
      <header className="bg-white border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)] sticky top-0 z-50 relative overflow-hidden">
        {/* Efeito de partículas brutais */}
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
          
          <button 
            onClick={handleBackToHome}
            className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all animate-fade-in flex items-center space-x-2"
          >
            <IconArrowLeft size={16} stroke={2} />
            <span>VOLTAR</span>
          </button>
        </div>
      </header>

      {/* Main Content Brutalista */}
      <div className="container py-12 md:py-24">
        <div className="mx-auto max-w-md">
          {/* Header Card Brutalista */}
          <div className="mb-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-slide-in-up">
            <div className="text-center pb-6">
              <h1 className="text-3xl font-black text-black uppercase mb-4 animate-fade-in">
                BEM-VINDO AO CONFILAR
              </h1>
              <p className="text-black font-bold text-lg animate-fade-in">
                CONECTE-SE COM PROFISSIONAIS CONFIÁVEIS OU ENCONTRE CLIENTES PARA SEUS SERVIÇOS
              </p>
            </div>
          </div>

          {/* Auth Forms Brutalista */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-slide-in-up">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="grid w-full grid-cols-2 mb-6 bg-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`px-4 py-3 text-sm font-black uppercase transition-all ${
                    activeTab === 'login'
                      ? 'bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-yellow-100'
                  }`}
                >
                  ENTRAR
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`px-4 py-3 text-sm font-black uppercase transition-all ${
                    activeTab === 'register'
                      ? 'bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-yellow-100'
                  }`}
                >
                  CRIAR CONTA
                </button>
              </div>

              <div className="space-y-4">
                {activeTab === 'login' && (
                  <Suspense fallback={
                    <div className="text-center py-8">
                      <div className="w-8 h-8 bg-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mx-auto animate-pulse"></div>
                      <p className="text-black font-bold mt-2 uppercase">CARREGANDO...</p>
                    </div>
                  }>
                    <LoginForm />
                  </Suspense>
                )}

                {activeTab === 'register' && (
                  <Suspense fallback={
                    <div className="text-center py-8">
                      <div className="w-8 h-8 bg-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mx-auto animate-pulse"></div>
                      <p className="text-black font-bold mt-2 uppercase">CARREGANDO...</p>
                    </div>
                  }>
                    <SimpleRegistrationForm />
                  </Suspense>
                )}
              </div>
            </Tabs>

            <div className="mt-6">
              <div className="h-1 bg-black border border-black my-4"></div>
              <div className="text-center text-sm text-black font-bold">
                AO CONTINUAR, VOCÊ CONCORDA COM NOSSOS{' '}
                <a href="/termos" className="text-black underline hover:text-yellow-600 font-black">
                  TERMOS DE USO
                </a>{' '}
                E{' '}
                <a href="/privacidade" className="text-black underline hover:text-yellow-600 font-black">
                  POLÍTICA DE PRIVACIDADE
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animações CSS Customizadas */}
      <style jsx>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes slide-in-up {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}