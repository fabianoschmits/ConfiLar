'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { FormFieldFeedback } from '@/components/ui/FormFieldFeedback'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuthContext } from '@/contexts/AuthContext'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ReauthenticationGuard } from '@/components/auth/ReauthenticationGuard'
import { Check, X, ArrowLeft, Shield, Key } from 'lucide-react'
import { LightModeLayout } from '@/components/layout/LightModeLayout'

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
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { updatePassword, user } = useAuthContext()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
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
        if (error.message.includes('Reautenticação necessária') || error.message.includes('Sessão de reautenticação expirada')) {
          toast.info('Redirecionando para verificação de segurança...')
          // O redirecionamento já foi feito no hook
        } else {
          toast.error('Erro ao atualizar senha', {
            description: error.message || 'Não foi possível atualizar sua senha. Verifique os requisitos e tente novamente.'
          })
        }
        setIsLoading(false)
      } else {
        toast.success('Senha atualizada com sucesso!')
        setPasswordUpdated(true)
        setIsLoading(false)
        
        // Redirecionar para home após 3 segundos
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    } catch {
      toast.error('Erro inesperado ao atualizar senha', {
        description: 'Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.'
      })
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  // Loading quando verificando autenticação
  if (!isAuthenticated) {
    return (
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-md border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Verificando autenticação...
            </h1>
            <p className="text-gray-600">
              Aguarde enquanto verificamos sua conta.
            </p>
          </CardContent>
        </Card>
        </div>
      </LightModeLayout>
    )
  }

  // Sucesso - Senha atualizada
  if (passwordUpdated) {
    return (
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-md border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Senha atualizada!
            </h1>
            <p className="text-gray-600 mb-8">
              Sua senha foi alterada com sucesso.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-700 font-medium text-sm">
                  Você será redirecionado para a página inicial em alguns segundos...
                </p>
              </div>
            </div>

            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
            >
              Ir para página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
      </LightModeLayout>
    )
  }

  return (
    <ReauthenticationGuard requiredAction="password">
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header moderno */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-lg">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">ConfiLar</span>
            </div>
            
            <Button 
              onClick={handleBackToHome}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </Button>
          </div>
        </header>

        {/* Conteúdo principal */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <Card className="max-w-md w-full bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Key className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                Nova senha
              </CardTitle>
              <CardDescription className="text-gray-600">
                Defina uma nova senha segura para sua conta
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Aviso de segurança */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Critérios de segurança
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Mínimo de 8 caracteres</p>
                  <p>• Pelo menos uma letra maiúscula</p>
                  <p>• Pelo menos uma letra minúscula</p>
                  <p>• Pelo menos um número</p>
                  <p>• Pelo menos um caractere especial</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Nova senha
                  </Label>
                  <PasswordInput
                    id="password"
                    placeholder="Digite sua nova senha"
                    {...register('password')}
                    error={!!errors.password}
                  />
                  {errors.password && (
                    <FormFieldFeedback
                      state="error"
                      message={errors.password.message}
                    />
                  )}
                  
                  {/* Indicador de força da senha */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordStrength.strength === 'strong' ? 'bg-green-500' :
                              passwordStrength.strength === 'medium' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {passwordStrength.score}/5
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.length ? <Check size={12} /> : <X size={12} />}
                          <span>8+ caracteres</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.uppercase ? <Check size={12} /> : <X size={12} />}
                          <span>Maiúscula</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.lowercase ? <Check size={12} /> : <X size={12} />}
                          <span>Minúscula</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.number ? <Check size={12} /> : <X size={12} />}
                          <span>Número</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.special ? <Check size={12} /> : <X size={12} />}
                          <span>Especial</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar nova senha
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Digite novamente sua nova senha"
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && (
                    <FormFieldFeedback
                      state="error"
                      message={errors.confirmPassword.message}
                    />
                  )}
                </div>

                <LoadingButton
                  type="submit"
                  disabled={isLoading || passwordStrength.strength === 'weak'}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                  isLoading={isLoading}
                  loadingText="Atualizando..."
                >
                  Atualizar senha
                </LoadingButton>
              </form>
            </CardContent>
          </Card>
        </div>
        </div>
      </LightModeLayout>
    </ReauthenticationGuard>
  )
}
