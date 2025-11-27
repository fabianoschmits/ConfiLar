'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { ProgressIndicator } from '@/components/ui/ProgressIndicator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  X, User, Phone, Save, Edit3, Mail, CheckCircle2, Calendar, FileText
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ChangeEmailForm } from '@/components/forms/ChangeEmailForm'

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11) return false;

  const invalidCPFs = [
    '00000000000', '11111111111', '22222222222', '33333333333', '44444444444',
    '55555555555', '66666666666', '77777777777', '88888888888', '99999999999',
    '12345678901', '12345678909'
  ];

  if (invalidCPFs.includes(cpf)) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  const primeiroDigito = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf.charAt(9)) !== primeiroDigito) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  const segundoDigito = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf.charAt(10)) !== segundoDigito) return false;

  return true;
}

const accountDataSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf_cnpj: z.string()
    .min(11, 'CPF/CNPJ deve ter pelo menos 11 dígitos')
    .refine((value) => {
      const cleanValue = value.replace(/\D/g, '')
      if (cleanValue.length === 11) {
        return validateCPF(value)
      }
      if (cleanValue.length === 14) {
        return true
      }
      return false
    }, 'CPF/CNPJ inválido ou bloqueado'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  bio: z.string().optional(),
  // Novos campos
  escolaridade: z.enum([
    'ensino_fundamental_incompleto',
    'ensino_fundamental_completo',
    'ensino_medio_incompleto',
    'ensino_medio_completo',
    'ensino_superior_incompleto',
    'ensino_superior_completo',
    'pos_graduacao',
    'mestrado',
    'doutorado'
  ]).optional(),
  filhos: z.number().min(0).max(20).default(0).optional(),
  estado_civil: z.enum([
    'solteiro',
    'casado',
    'divorciado',
    'viuvo',
    'uniao_estavel',
    'outro'
  ]).optional(),
})

type AccountDataFormData = z.infer<typeof accountDataSchema>

export default function DadosDaContaPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountDataFormData>({
    resolver: zodResolver(accountDataSchema),
    defaultValues: {
      filhos: 0,
    },
  })

  const watchedValues = watch()
  const fullName = watchedValues.full_name || (user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name || 'Usuário'

  // Salvar página anterior ao montar o componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer || window.location.href
      // Salvar apenas se não for uma página de editar perfil
      if (!referrer.includes('/editarperfil/')) {
        sessionStorage.setItem('previousPage', referrer)
      }
    }
  }, [])

  // Carregar dados do perfil existente
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        router.push('/auth')
        return
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Erro ao carregar perfil:', error)
          toast.error('Erro ao carregar dados do perfil', {
            description: 'Não foi possível carregar suas informações. Tente recarregar a página.'
          })
          return
        }

        if (profile) {
          setValue('full_name', profile.full_name || '')
          setValue('phone', profile.phone || '')
          setValue('cpf_cnpj', profile.cpf_cnpj || '')
          setValue('birth_date', profile.birth_date || '')
          setValue('bio', profile.bio || '')
          // Novos campos
          setValue('escolaridade', profile.escolaridade || undefined)
          setValue('filhos', profile.filhos || 0)
          setValue('estado_civil', profile.estado_civil || undefined)
        }

        // Verificar se email está verificado
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setEmailVerified(authUser?.email_confirmed_at !== null)
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        toast.error('Erro ao carregar dados do perfil')
      }
    }

    loadProfileData()
  }, [user, router, setValue])

  // Formatação automática para telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  // Formatação automática para CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue('phone', formatted)
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setValue('cpf_cnpj', formatted)
    
    const cleanValue = formatted.replace(/\D/g, '')
    if (cleanValue.length === 11) {
      const isValid = validateCPF(formatted)
      setValue('cpf_cnpj', formatted, { shouldValidate: true, shouldDirty: true })
    }
  }


  const onSubmit = async (data: AccountDataFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado', {
        description: 'Você precisa estar logado para atualizar seus dados. Faça login e tente novamente.'
      })
      return
    }

    setIsLoading(true)
    
    try {

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          cpf_cnpj: data.cpf_cnpj,
          birth_date: data.birth_date,
          bio: data.bio || null,
          // Novos campos
          escolaridade: data.escolaridade || null,
          filhos: data.filhos || 0,
          estado_civil: data.estado_civil || null,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('❌ Erro ao salvar perfil:', profileError)
        toast.error('Erro ao salvar dados', {
          description: profileError.message || 'Não foi possível salvar suas informações. Verifique os dados e tente novamente.'
        })
        return
      }

      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          phone: data.phone,
          birth_date: data.birth_date,
          bio: data.bio,
        }
      })

      if (userUpdateError) {
        console.warn('⚠️ Erro ao atualizar metadados do usuário:', userUpdateError)
      }

      console.log('✅ Dados da conta salvos com sucesso!')
      toast.success('🎉 Dados atualizados com sucesso!')
      
      // Redirecionar para página anterior após salvar
      setTimeout(() => {
        const previousPage = sessionStorage.getItem('previousPage')
        if (previousPage && previousPage !== window.location.href) {
          router.push(previousPage)
        } else {
          router.back()
        }
      }, 1000)
      
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
      toast.error('Erro inesperado ao atualizar dados', {
        description: 'Ocorreu um erro inesperado. Tente novamente em alguns instantes ou recarregue a página.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dados da Conta</h1>
                  <p className="text-gray-600">Gerencie suas informações pessoais</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user?.email}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Email atual da conta
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {emailVerified && (
                          <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verificado
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEmailForm(!showEmailForm)}
                        >
                          {showEmailForm ? 'Cancelar' : 'Alterar'}
                        </Button>
                      </div>
                    </div>

                    {showEmailForm && (
                      <div className="mt-4">
                        <ChangeEmailForm
                          currentEmail={user?.email || ''}
                          onSuccess={() => {
                            setShowEmailForm(false)
                            setEmailVerified(true)
                            toast.success('Email alterado com sucesso!')
                          }}
                          onCancel={() => setShowEmailForm(false)}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                        Nome completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="full_name"
                        placeholder="Digite seu nome completo"
                        {...register('full_name')}
                        className={cn(
                          "h-10",
                          errors.full_name ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                        )}
                      />
                      {errors.full_name && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <X className="w-3 h-3" />
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Telefone <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone"
                          placeholder="(11) 99999-9999"
                          {...register('phone')}
                          onChange={handlePhoneChange}
                          className={cn(
                            "h-10 pl-10",
                            errors.phone ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                          )}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <X className="w-3 h-3" />
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf_cnpj" className="text-sm font-medium text-gray-700">
                        CPF <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cpf_cnpj"
                        placeholder="000.000.000-00"
                        {...register('cpf_cnpj')}
                        onChange={handleCPFChange}
                        className={cn(
                          "h-10",
                          errors.cpf_cnpj ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                        )}
                      />
                      {errors.cpf_cnpj && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <X className="w-3 h-3" />
                          {errors.cpf_cnpj.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birth_date" className="text-sm font-medium text-gray-700">
                        Data de Nascimento <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="birth_date"
                          type="date"
                          {...register('birth_date')}
                          className={cn(
                            "h-10 pl-10",
                            errors.birth_date ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                          )}
                        />
                      </div>
                      {errors.birth_date && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Obrigatório
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="escolaridade" className="text-sm font-medium text-gray-700">
                        Escolaridade
                      </Label>
                      <Select 
                        value={watchedValues.escolaridade || ''} 
                        onValueChange={(value) => setValue('escolaridade', value as any)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione sua escolaridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ensino_fundamental_incompleto">Ensino Fundamental Incompleto</SelectItem>
                          <SelectItem value="ensino_fundamental_completo">Ensino Fundamental Completo</SelectItem>
                          <SelectItem value="ensino_medio_incompleto">Ensino Médio Incompleto</SelectItem>
                          <SelectItem value="ensino_medio_completo">Ensino Médio Completo</SelectItem>
                          <SelectItem value="ensino_superior_incompleto">Ensino Superior Incompleto</SelectItem>
                          <SelectItem value="ensino_superior_completo">Ensino Superior Completo</SelectItem>
                          <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                          <SelectItem value="mestrado">Mestrado</SelectItem>
                          <SelectItem value="doutorado">Doutorado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado_civil" className="text-sm font-medium text-gray-700">
                        Estado Civil
                      </Label>
                      <Select 
                        value={watchedValues.estado_civil || ''} 
                        onValueChange={(value) => setValue('estado_civil', value as any)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione seu estado civil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                          <SelectItem value="uniao_estavel">União Estável</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filhos" className="text-sm font-medium text-gray-700">
                        Número de Filhos
                      </Label>
                      <Input
                        id="filhos"
                        type="number"
                        min="0"
                        max="20"
                        placeholder="0"
                        value={watchedValues.filhos || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0
                          setValue('filhos', Math.max(0, Math.min(20, value)))
                        }}
                        className="h-10"
                      />
                      <p className="text-xs text-gray-500">
                        Informe quantos filhos você tem (0 se não tiver)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Biografia */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Biografia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                      Conte um pouco sobre você (Opcional)
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                      <Textarea
                        id="bio"
                        {...register('bio')}
                        placeholder="Conte um pouco sobre você, seus interesses, experiência ou o que você busca na plataforma..."
                        rows={4}
                        className="resize-none pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Esta biografia aparecerá no seu perfil e ajudará outros usuários a conhecer você melhor.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Botão de Salvar */}
              <div className="flex justify-center pt-6">
                <LoadingButton
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 text-base font-medium"
                  disabled={isLoading}
                  isLoading={isLoading}
                  loadingText="Salvando..."
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

