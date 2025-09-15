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
import { ReauthenticationGuard } from '@/components/auth/ReauthenticationGuard'
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
        if (error.message.includes('Reautenticação necessária') || error.message.includes('Sessão de reautenticação expirada')) {
          toast.info('Redirecionando para verificação de segurança...')
          // O redirecionamento já foi feito no hook
        } else {
          toast.error('Erro ao atualizar senha: ' + error.message)
        }
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
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-yellow-400 mx-auto mb-6"></div>
          <h1 className="text-xl font-black text-black uppercase mb-4">
            VERIFICANDO AUTENTICAÇÃO...
          </h1>
          <p className="text-black font-bold">
            AGUARDE ENQUANTO VERIFICAMOS SUA CONTA.
          </p>
        </div>
      </div>
    )
  }

  if (passwordUpdated) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="mx-auto w-20 h-20 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
            <Check className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
            SENHA ATUALIZADA!
          </h1>
          <p className="text-black font-bold mb-8 animate-fade-in">
            SUA SENHA FOI ALTERADA COM SUCESSO.
          </p>
          
          <div className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
            <div className="flex items-center justify-center">
              <Check className="h-6 w-6 text-black mr-2" />
              <p className="text-black font-black text-sm">
                VOCÊ SERÁ REDIRECIONADO PARA O LOGIN EM ALGUNS SEGUNDOS...
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse hover:animate-none"
          >
            IR PARA LOGIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <ReauthenticationGuard requiredAction="password">
      <div className="min-h-screen bg-yellow-400">
      {/* Header Brutalista */}
      <header className="bg-white border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)] sticky top-0 z-50 relative overflow-hidden">
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
            onClick={handleBackToLogin}
            className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all animate-fade-in flex items-center space-x-2"
          >
            <span>VOLTAR</span>
          </button>
        </div>
      </header>

      {/* Main Content Brutalista */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-md w-full bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
              <span className="text-yellow-400 font-black text-2xl">🔒</span>
            </div>
            <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
              NOVA SENHA
            </h1>
            <p className="text-black font-bold animate-fade-in">
              DEFINA UMA NOVA SENHA SEGURA PARA SUA CONTA
            </p>
          </div>

          {/* Informação sobre Reautenticação */}
          <div className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-black text-yellow-400 font-black text-xs flex items-center justify-center flex-shrink-0 mt-1">
                !
              </div>
              <div>
                <h3 className="text-sm font-black text-black uppercase mb-2">
                  SEGURANÇA APRIMORADA
                </h3>
                <p className="text-xs text-black font-bold">
                  Para alterar sua senha, você pode ser solicitado a confirmar sua identidade 
                  através de um código enviado por email. Isso protege sua conta contra acesso não autorizado.
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-black text-black uppercase">
                NOVA SENHA
              </label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...register('password')}
                error={!!errors.password}
                className="w-full px-4 py-3 text-lg font-bold bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
              {errors.password && (
                <p className="text-sm text-red-600 font-bold">{errors.password.message}</p>
              )}
              
              {/* Indicador de força da senha */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-black text-black uppercase">
                    FORÇA DA SENHA:
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-3 flex-1 border-2 border-black ${
                          level <= passwordStrength.score
                            ? passwordStrength.strength === 'weak'
                              ? 'bg-red-500'
                              : passwordStrength.strength === 'medium'
                              ? 'bg-yellow-400'
                              : 'bg-green-500'
                            : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-black font-bold">
                    {passwordStrength.strength === 'weak' && 'SENHA FRACA'}
                    {passwordStrength.strength === 'medium' && 'SENHA MÉDIA'}
                    {passwordStrength.strength === 'strong' && 'SENHA FORTE'}
                  </div>
                  
                  {/* Critérios de senha */}
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.length ? (
                        <Check className="w-3 h-3 text-green-600 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-red-600 mr-2" />
                      )}
                      <span className={passwordStrength.checks.length ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        PELO MENOS 8 CARACTERES
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.uppercase ? (
                        <Check className="w-3 h-3 text-green-600 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-red-600 mr-2" />
                      )}
                      <span className={passwordStrength.checks.uppercase ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        UMA LETRA MAIÚSCULA
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.lowercase ? (
                        <Check className="w-3 h-3 text-green-600 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-red-600 mr-2" />
                      )}
                      <span className={passwordStrength.checks.lowercase ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        UMA LETRA MINÚSCULA
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.number ? (
                        <Check className="w-3 h-3 text-green-600 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-red-600 mr-2" />
                      )}
                      <span className={passwordStrength.checks.number ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        UM NÚMERO
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.special ? (
                        <Check className="w-3 h-3 text-green-600 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-red-600 mr-2" />
                      )}
                      <span className={passwordStrength.checks.special ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        UM CARACTERE ESPECIAL
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-black text-black uppercase">
                CONFIRMAR SENHA
              </label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                className="w-full px-4 py-3 text-lg font-bold bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 font-bold">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || passwordStrength.score < 5}
            >
              {isLoading ? 'ATUALIZANDO...' : 'ATUALIZAR SENHA'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-black hover:text-gray-600 hover:underline font-black uppercase"
              >
                VOLTAR PARA O LOGIN
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </ReauthenticationGuard>
  )
}
