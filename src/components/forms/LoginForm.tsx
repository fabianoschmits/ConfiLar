'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const { signIn, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Verificar se a conta foi criada
  const accountCreated = searchParams.get('message') === 'account_created'
  
  // Obter o parâmetro de redirecionamento
  const redirectPath = searchParams.get('redirect') || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Verificar conectividade ao carregar o componente
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking')
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        })
        setConnectionStatus(response.ok ? 'connected' : 'error')
      } catch {
        setConnectionStatus('error')
      }
    }

    checkConnection()
  }, [])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await signIn(data.email, data.password)
      
      if (error) {
        toast.error('Erro ao fazer login: ' + error.message)
        setIsLoading(false)
      } else {
        toast.success('Login realizado com sucesso!')
        
        // Aguardar o loading do useRobustAuth terminar
        setTimeout(() => {
          router.push(decodeURIComponent(redirectPath))
          setIsLoading(false)
        }, 2000) // Aguardar 2 segundos para garantir que o auth termine
      }
    } catch {
      toast.error('Erro inesperado ao fazer login')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
      <div className="text-center pb-6">
        <h2 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
          ENTRAR NA SUA CONTA
        </h2>
        <p className="text-black font-bold animate-fade-in">
          DIGITE SUAS CREDENCIAIS PARA ACESSAR A PLATAFORMA
        </p>
        
        {/* Indicador de conectividade brutalista */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`w-3 h-3 border-2 border-black ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-xs text-black font-black uppercase">
            {connectionStatus === 'connected' ? 'CONECTADO' : 
             connectionStatus === 'error' ? 'PROBLEMA DE CONEXÃO' : 'VERIFICANDO...'}
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Mensagem de sucesso quando a conta for criada */}
          {accountCreated && (
            <div className="bg-green-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-black border-2 border-black flex items-center justify-center">
                    <svg className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-black text-black uppercase">
                    CONTA CRIADA COM SUCESSO! FAÇA LOGIN PARA CONTINUAR.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-black text-black uppercase">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              placeholder="SEU@EMAIL.COM"
              {...register('email')}
              className={`w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                errors.email ? 'border-red-500 bg-red-100' : 'bg-white'
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 font-bold uppercase">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-black text-black uppercase">
              SENHA
            </label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              {...register('password')}
              error={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-500 font-bold uppercase">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/recuperar-senha')}
              className="text-sm text-black hover:text-yellow-600 hover:underline font-black uppercase"
            >
              ESQUECI MINHA SENHA
            </button>
          </div>

          <div className="text-center text-sm text-black font-bold pt-2">
            NÃO TEM UMA CONTA?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth?tab=register')}
              className="text-black hover:text-yellow-600 hover:underline font-black uppercase"
            >
              CADASTRE-SE
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
