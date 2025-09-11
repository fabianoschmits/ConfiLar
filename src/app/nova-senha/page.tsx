'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'

const newPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

type NewPasswordFormData = z.infer<typeof newPasswordSchema>

export default function NovaSenhaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { updatePassword, user } = useAuthContext()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  })

  const password = watch('password', '')

  // Verificar se o usuário está autenticado (veio do link do email)
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true)
    } else {
      // Se não está autenticado, redirecionar para login
      router.push('/auth')
    }
  }, [user, router])

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }
    
    const score = Object.values(checks).filter(Boolean).length
    return { checks, score, strength: score < 3 ? 'weak' : score < 4 ? 'medium' : 'strong' }
  }

  const passwordStrength = getPasswordStrength(password)

  const onSubmit = async (data: NewPasswordFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await updatePassword(data.password)
      
      if (error) {
        toast.error('Erro ao atualizar senha: ' + error.message)
        setIsLoading(false)
      } else {
        toast.success('Senha atualizada com sucesso!')
        setPasswordUpdated(true)
        setIsLoading(false)
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/auth')
        }, 3000)
      }
    } catch {
      toast.error('Erro inesperado ao atualizar senha')
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/auth')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 backdrop-blur-sm bg-white/80">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticação...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (passwordUpdated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 backdrop-blur-sm bg-white/80">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Senha Atualizada!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sua senha foi alterada com sucesso
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Você será redirecionado para o login em alguns segundos...
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleBackToLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 backdrop-blur-sm bg-white/80">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Nova Senha
          </CardTitle>
          <CardDescription className="text-gray-600">
            Defina uma nova senha segura para sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Nova Senha
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
              
              {/* Indicador de força da senha */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium text-gray-600">
                    Força da senha:
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          level <= passwordStrength.score
                            ? passwordStrength.strength === 'weak'
                              ? 'bg-red-400'
                              : passwordStrength.strength === 'medium'
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {passwordStrength.strength === 'weak' && 'Senha fraca'}
                    {passwordStrength.strength === 'medium' && 'Senha média'}
                    {passwordStrength.strength === 'strong' && 'Senha forte'}
                  </div>
                  
                  {/* Critérios de senha */}
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.length ? (
                        <Check className="w-3 h-3 text-green-500 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400 mr-2" />
                      )}
                      <span className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}>
                        Pelo menos 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.uppercase ? (
                        <Check className="w-3 h-3 text-green-500 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400 mr-2" />
                      )}
                      <span className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}>
                        Uma letra maiúscula
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.lowercase ? (
                        <Check className="w-3 h-3 text-green-500 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400 mr-2" />
                      )}
                      <span className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}>
                        Uma letra minúscula
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.number ? (
                        <Check className="w-3 h-3 text-green-500 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400 mr-2" />
                      )}
                      <span className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}>
                        Um número
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.special ? (
                        <Check className="w-3 h-3 text-green-500 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400 mr-2" />
                      )}
                      <span className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-500'}>
                        Um caractere especial
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar Senha
              </Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              disabled={isLoading || passwordStrength.score < 5}
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Voltar para o Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
