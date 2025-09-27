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
  const { signIn, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  console.log('LoginForm renderizado, signIn:', typeof signIn, 'authLoading:', authLoading)
  
  // Verificar se a conta foi criada
  const accountCreated = searchParams.get('message') === 'account_created'
  
  // Obter o parâmetro de redirecionamento - redireciona para feed por padrão
  const redirectPath = searchParams.get('redirect') || '/feed'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })


  const onSubmit = async (data: LoginFormData) => {
    console.log('Formulário submetido com dados:', data)
    console.log('signIn function:', typeof signIn)
    
    // Validar dados antes de enviar
    if (!data.email || !data.password) {
      toast.error('Email e senha são obrigatórios')
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await signIn(data.email, data.password)
      console.log('Resultado do signIn:', result)
      
      if (result.error) {
        toast.error('Erro ao fazer login: ' + result.error.message)
        setIsLoading(false)
      } else {
        toast.success('Login realizado com sucesso!')
        
        // Redirecionar imediatamente após login bem-sucedido
        router.push(redirectPath)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro inesperado ao fazer login')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center pb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Entrar na sua conta
        </h2>
        <p className="text-gray-600">
          Digite suas credenciais para acessar a plataforma
        </p>
      </div>
      
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Mensagem de sucesso quando a conta for criada */}
          {accountCreated && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-700">
                    Conta criada com sucesso! Confirme seu email e faça login para continuar.
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
              className={`transition-colors ${
                errors.email ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
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
              <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={isLoading || authLoading}
          >
            {isLoading || authLoading ? 'Entrando...' : 'Entrar'}
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
      </div>
    </div>
  )
}
