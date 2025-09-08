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
  const { signIn } = useAuthContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Verificar se a conta foi criada
  const accountCreated = searchParams.get('message') === 'account_created'
  
  // Obter o parâmetro de redirecionamento
  const redirectPath = searchParams.get('redirect') || '/home'

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
      } else {
        toast.success('Login realizado com sucesso!')
        
        // Aguardar um momento para garantir que o contexto seja atualizado
        setTimeout(() => {
          // Redirecionar para a página original ou home
          router.push(decodeURIComponent(redirectPath))
        }, 1000)
      }
    } catch (error) {
      toast.error('Erro inesperado ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Entrar na sua conta
        </CardTitle>
        <CardDescription className="text-gray-600">
          Digite suas credenciais para acessar a plataforma
        </CardDescription>
        
        {/* Indicador de conectividade */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-xs text-gray-500">
            {connectionStatus === 'connected' ? 'Conectado' : 
             connectionStatus === 'error' ? 'Problema de conexão' : 'Verificando...'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Mensagem de sucesso quando a conta for criada */}
          {accountCreated && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Conta criada com sucesso! Faça login para continuar.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              {...register('password')}
              error={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/recuperar-senha')}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Esqueci minha senha
            </button>
          </div>

          <div className="text-center text-sm text-gray-600 pt-2">
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth?tab=register')}
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Cadastre-se
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
