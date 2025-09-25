'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

// Schema simplificado para cadastro básico
const basicSignupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
})

type BasicSignupFormData = z.infer<typeof basicSignupSchema>

export function BasicSignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signUpBasic } = useAuthContext()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<BasicSignupFormData>({
    resolver: zodResolver(basicSignupSchema),
    defaultValues: {
      full_name: '',
    },
  })

  const watchedValues = watch()

  // Função para verificar a força da senha
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }
    
    const score = Object.values(checks).filter(Boolean).length
    return { checks, score, isStrong: score === 5 }
  }

  const onSubmit = async (data: BasicSignupFormData) => {
    setIsLoading(true)
    try {
      const { error } = await signUpBasic({
        email: data.email,
        password: data.password,
        full_name: data.full_name || '',
      })

      if (error) {
        console.error('❌ Erro detalhado:', error)
        toast.error(`Erro ao criar conta: ${error.message}`)
        setIsLoading(false)
        return
      }

      // Mostrar notificação de sucesso
      toast.success('🎉 Conta criada com sucesso! Um email de confirmação foi enviado para você. Verifique sua caixa de entrada e clique no link para ativar sua conta.')
      
      // Aguardar 3 segundos para o usuário ler a mensagem antes de redirecionar
      setTimeout(() => {
        setIsLoading(false)
        window.location.href = '/auth?message=account_created'
      }, 3000)
    } catch (error) {
      console.error('Erro no cadastro:', error)
      toast.error('Erro inesperado ao criar conta')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados Básicos */}
      <div className="space-y-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Criar Conta
        </h3>
        <p className="text-sm text-gray-600">
          Comece criando sua conta com os dados básicos. Você poderá completar seu perfil após o primeiro login.
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              Nome completo (opcional)
            </Label>
            <Input
              id="full_name"
              placeholder="Digite seu nome completo"
              {...register('full_name')}
              className={cn(
                "transition-colors",
                errors.full_name ? 'border-red-500 focus:border-red-500' : ''
              )}
            />
            {errors.full_name && <p className="text-sm text-red-500 font-medium">{errors.full_name.message}</p>}
            {watchedValues.full_name && watchedValues.full_name.length >= 2 && !errors.full_name && (
              <p className="text-sm text-green-600 font-medium">✓ Nome válido</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className={cn(
                "transition-colors",
                errors.email ? 'border-red-500 focus:border-red-500' : ''
              )}
            />
            {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
            {watchedValues.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedValues.email) && (
              <p className="text-sm text-green-600 font-medium">✓ Email válido</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha *
            </Label>
            <PasswordInput
              id="password"
              placeholder="Digite sua senha"
              {...register('password')}
              error={!!errors.password}
            />
            
            {/* Indicador de força da senha */}
            {watchedValues.password && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        checkPasswordStrength(watchedValues.password).score === 5 ? 'bg-green-500' :
                        checkPasswordStrength(watchedValues.password).score >= 3 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(checkPasswordStrength(watchedValues.password).score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {checkPasswordStrength(watchedValues.password).score}/5
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center space-x-1 ${checkPasswordStrength(watchedValues.password).checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={checkPasswordStrength(watchedValues.password).checks.length ? 'text-green-500' : 'text-gray-400'}>✓</span>
                    <span>8+ caracteres</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${checkPasswordStrength(watchedValues.password).checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={checkPasswordStrength(watchedValues.password).checks.uppercase ? 'text-green-500' : 'text-gray-400'}>✓</span>
                    <span>Maiúscula</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${checkPasswordStrength(watchedValues.password).checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={checkPasswordStrength(watchedValues.password).checks.lowercase ? 'text-green-500' : 'text-gray-400'}>✓</span>
                    <span>Minúscula</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${checkPasswordStrength(watchedValues.password).checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={checkPasswordStrength(watchedValues.password).checks.number ? 'text-green-500' : 'text-gray-400'}>✓</span>
                    <span>Número</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${checkPasswordStrength(watchedValues.password).checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={checkPasswordStrength(watchedValues.password).checks.special ? 'text-green-500' : 'text-gray-400'}>✓</span>
                    <span>Especial</span>
                  </div>
                </div>
              </div>
            )}
            
            {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
            {watchedValues.password && !errors.password && checkPasswordStrength(watchedValues.password).isStrong && (
              <p className="text-sm text-green-600 font-medium">✓ Senha forte</p>
            )}
          </div>
        </div>
      </div>

      {/* Botão de cadastro */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          disabled={isLoading || !isValid}
        >
          {isLoading ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600 pt-2">
        <p>
          Já tem uma conta?{' '}
          <a href="/auth" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
            Faça login
          </a>
        </p>
      </div>
    </form>
  )
}
