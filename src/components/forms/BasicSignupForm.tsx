'use client'

import { useState, useEffect } from 'react'
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
import { checkEmailExists } from '@/lib/checkDuplicates'
import { RefreshCw } from 'lucide-react'
import { createReferral } from '@/hooks/useReferralTracking'
import { SimpleCaptcha, useCaptcha } from '@/components/auth/SimpleCaptcha'
import { checkCpfExists } from '@/lib/checkDuplicates'

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11) return false;

  const invalidCPFs = [
    '00000000000', '11111111111', '22222222222', '33333333333', '44444444444',
    '55555555555', '66666666666', '77777777777', '88888888888', '99999999999'
  ];

  if (invalidCPFs.includes(cpf)) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
};

// Schema para cadastro básico - email, CPF, senha e confirmação
const basicSignupSchema = z.object({
  email: z.string().email('Email inválido'),
  cpf_cnpj: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .refine((val) => {
      const cleaned = val.replace(/[^\d]+/g, '');
      return cleaned.length === 11 || cleaned.length === 14;
    }, 'CPF inválido')
    .refine((val) => validateCPF(val), 'CPF inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type BasicSignupFormData = z.infer<typeof basicSignupSchema>

export function BasicSignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [cpfExists, setCpfExists] = useState(false)
  const [isCheckingCpf, setIsCheckingCpf] = useState(false)
  const { signUpBasic } = useAuthContext()
  
  // CAPTCHA
  const { isCaptchaValid, isBlocked, handleCaptchaValidate } = useCaptcha()

  // Evitar problemas de hidratação
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<BasicSignupFormData>({
    resolver: zodResolver(basicSignupSchema),
  })

  const watchedValues = watch()

  // Função para verificar email em tempo real
  const checkEmailInRealTime = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailExists(false)
      return
    }

    setIsCheckingEmail(true)
    try {
      const exists = await checkEmailExists(email)
      setEmailExists(exists)
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      setEmailExists(false)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Função para verificar CPF em tempo real
  const checkCpfInRealTime = async (cpf: string) => {
    const cleaned = cpf.replace(/[^\d]+/g, '')
    if (!cleaned || cleaned.length !== 11) {
      setCpfExists(false)
      return
    }

    if (!validateCPF(cpf)) {
      setCpfExists(false)
      return
    }

    setIsCheckingCpf(true)
    try {
      const exists = await checkCpfExists(cpf)
      setCpfExists(exists)
    } catch (error) {
      console.error('Erro ao verificar CPF:', error)
      setCpfExists(false)
    } finally {
      setIsCheckingCpf(false)
    }
  }

  // Debounce para verificação de email
  useEffect(() => {
    const email = watchedValues.email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailExists(false)
      return
    }

    const timeoutId = setTimeout(() => {
      checkEmailInRealTime(email)
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
  }, [watchedValues.email])

  // Debounce para verificação de CPF
  useEffect(() => {
    const cpf = watchedValues.cpf_cnpj
    const cleaned = cpf?.replace(/[^\d]+/g, '')
    
    if (!cleaned || cleaned.length !== 11) {
      setCpfExists(false)
      return
    }

    const timeoutId = setTimeout(() => {
      checkCpfInRealTime(cpf)
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
  }, [watchedValues.cpf_cnpj])

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
      // ✅ VALIDAR CAPTCHA
      if (!isCaptchaValid) {
        toast.error('❌ Por favor, resolva a verificação de segurança corretamente.')
        setIsLoading(false)
        return
      }

      if (isBlocked) {
        toast.error('❌ Muitas tentativas incorretas. Aguarde 1 minuto.')
        setIsLoading(false)
        return
      }

      // ✅ VALIDAR DUPLICATAS ANTES DE CADASTRAR
      console.log('🔍 Verificando duplicatas...')
      
      // Verificar email
      if (emailExists) {
        toast.error('❌ Este email já está cadastrado. Use o link de recuperação de conta.')
        setIsLoading(false)
        return
      }
      
      const emailCheck = await checkEmailExists(data.email)
      if (emailCheck) {
        toast.error('❌ Este email já está cadastrado na plataforma')
        setIsLoading(false)
        return
      }
      
      console.log('✅ Email disponível')

      // Verificar CPF
      if (cpfExists) {
        toast.error('❌ Este CPF já está cadastrado. Use o link de recuperação de conta.')
        setIsLoading(false)
        return
      }
      
      const cpfCheck = await checkCpfExists(data.cpf_cnpj)
      if (cpfCheck) {
        toast.error('❌ Este CPF já está cadastrado na plataforma')
        setIsLoading(false)
        return
      }
      
      console.log('✅ CPF disponível')
      
      const { error } = await signUpBasic({
        email: data.email,
        password: data.password,
        cpf_cnpj: data.cpf_cnpj,
      })

      if (error) {
        console.error('❌ Erro detalhado:', error)
        toast.error(`Erro ao criar conta: ${error.message}`)
        setIsLoading(false)
        return
      }

      // Nota: O referral será criado automaticamente no onboarding quando o usuário completar o perfil
      // O código de referral já está salvo no localStorage e será usado lá

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
          Crie sua conta com email, CPF e senha. Após o primeiro login, você completará seu perfil com nome e outros dados.
        </p>
        
        <div className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={cn(
                  "transition-colors pr-10",
                  errors.email ? 'border-red-500 focus:border-red-500' : '',
                  emailExists ? 'border-orange-500 focus:border-orange-500' : ''
                )}
              />
              {isCheckingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>
            
            {/* Mensagens de validação */}
            {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
            
            {emailExists && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium mb-2">
                  ⚠️ Este email já está cadastrado na plataforma
                </p>
                <p className="text-xs text-orange-700 mb-3">
                  Você já possui uma conta com este email. Escolha uma das opções abaixo:
                </p>
                <div className="space-y-2">
                  <a 
                    href="/recuperar-senha" 
                    className="block text-sm text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    🔑 Recuperar senha
                  </a>
                  <a 
                    href="/auth" 
                    className="block text-sm text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    🔐 Fazer login
                  </a>
                </div>
              </div>
            )}
            
            {watchedValues.email && !errors.email && !emailExists && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedValues.email) && (
              <p className="text-sm text-green-600 font-medium">✓ Email disponível</p>
            )}
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj" className="text-sm font-medium text-gray-700">
              CPF *
            </Label>
            <div className="relative">
              <Input
                id="cpf_cnpj"
                type="text"
                placeholder="000.000.000-00"
                {...register('cpf_cnpj')}
                maxLength={14}
                onChange={(e) => {
                  // Formatar CPF enquanto digita
                  let value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, '$1.$2')
                    value = value.replace(/(\d{3})(\d)/, '$1.$2')
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                  }
                  e.target.value = value
                  register('cpf_cnpj').onChange(e)
                }}
                className={cn(
                  "transition-colors pr-10",
                  errors.cpf_cnpj ? 'border-red-500 focus:border-red-500' : '',
                  cpfExists ? 'border-orange-500 focus:border-orange-500' : ''
                )}
              />
              {isCheckingCpf && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>
            
            {errors.cpf_cnpj && <p className="text-sm text-red-500 font-medium">{errors.cpf_cnpj.message}</p>}
            
            {cpfExists && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium mb-2">
                  ⚠️ Este CPF já está cadastrado na plataforma
                </p>
                <p className="text-xs text-orange-700 mb-3">
                  Você já possui uma conta com este CPF. Escolha uma das opções abaixo:
                </p>
                <div className="space-y-2">
                  <a 
                    href="/recuperar-senha" 
                    className="block text-sm text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    🔑 Recuperar senha
                  </a>
                  <a 
                    href="/auth" 
                    className="block text-sm text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    🔐 Fazer login
                  </a>
                </div>
              </div>
            )}
            
            {watchedValues.cpf_cnpj && !errors.cpf_cnpj && !cpfExists && watchedValues.cpf_cnpj.replace(/\D/g, '').length === 11 && (
              <p className="text-sm text-green-600 font-medium">✓ CPF disponível</p>
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
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`${checkPasswordStrength(watchedValues.password).checks.length ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={`${checkPasswordStrength(watchedValues.password).checks.uppercase ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={`${checkPasswordStrength(watchedValues.password).checks.lowercase ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={`${checkPasswordStrength(watchedValues.password).checks.number ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={`${checkPasswordStrength(watchedValues.password).checks.special ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                  </div>
                  <span className={`font-medium ${
                    checkPasswordStrength(watchedValues.password).score === 5 ? 'text-green-600' :
                    checkPasswordStrength(watchedValues.password).score >= 3 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {checkPasswordStrength(watchedValues.password).score === 5 ? 'Senha forte' :
                     checkPasswordStrength(watchedValues.password).score >= 3 ? 'Senha média' :
                     'Senha fraca'}
                  </span>
                </div>
              </div>
            )}
            
            {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirmar Senha *
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Digite a senha novamente"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
            />
            
            {/* Indicador de confirmação */}
            {watchedValues.confirmPassword && (
              <div className="space-y-1">
                {watchedValues.password === watchedValues.confirmPassword ? (
                  <p className="text-sm text-green-600 font-medium">✓ Senhas coincidem</p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">✗ As senhas não coincidem</p>
                )}
              </div>
            )}
            
            {errors.confirmPassword && <p className="text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>}
          </div>
        </div>
      </div>

      {/* CAPTCHA de Segurança */}
      <SimpleCaptcha onValidate={handleCaptchaValidate} />

      {/* Botão de cadastro */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          disabled={!isMounted || isLoading || !isValid || !isCaptchaValid || isBlocked || watchedValues.password !== watchedValues.confirmPassword || emailExists || cpfExists}
        >
          {!isMounted ? 'Criar conta' : 
           isLoading ? 'Criando conta...' : 
           isBlocked ? 'Aguarde para tentar novamente' :
           !isCaptchaValid ? 'Complete a verificação de segurança' :
           emailExists || cpfExists ? 'Resolva o problema acima' :
           'Criar conta'}
        </Button>
        
        {/* Mensagem explicativa quando há duplicatas */}
        {emailExists && (
          <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-orange-800 font-medium mb-2">
                ⚠️ Não é possível criar a conta com este email
              </p>
              <p className="text-xs text-orange-700 mb-3">
                Você já possui uma conta na plataforma. Use as opções acima para:
              </p>
              <div className="flex justify-center gap-4 text-xs">
                <a 
                  href="/recuperar-senha" 
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                >
                  🔑 Recuperar senha
                </a>
                <a 
                  href="/auth" 
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                >
                  🔐 Fazer login
                </a>
              </div>
            </div>
          </div>
        )}
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
