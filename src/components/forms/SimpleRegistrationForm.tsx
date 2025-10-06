'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PasswordInput } from '@/components/ui/password-input'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, X, Upload, User, RefreshCw } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { estadosBrasil, getCidadesByEstado } from '@/data/brazilianLocations'
import { services } from '@/data/services'
import { toast } from 'sonner'
import { checkDuplicates } from '@/lib/checkDuplicates'

// Função para validar CPF com validação rigorosa
const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]+/g, '');

  // Verifica se tem exatamente 11 dígitos
  if (cpf.length !== 11) return false;

  // Lista de CPFs inválidos conhecidos
  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
    '12345678901',
    '12345678909'
  ];

  // Verifica se é um CPF inválido conhecido
  if (invalidCPFs.includes(cpf)) return false;

  // Rejeita sequências repetidas
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  const primeiroDigito = resto < 2 ? 0 : 11 - resto;
  
  if (primeiroDigito !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  const segundoDigito = resto < 2 ? 0 : 11 - resto;
  
  if (segundoDigito !== parseInt(cpf.charAt(10))) return false;

  return true;
}

const registrationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf_cnpj: z.string()
    .min(11, 'CPF/CNPJ deve ter pelo menos 11 dígitos')
    .refine((value) => {
      const cleanValue = value.replace(/\D/g, '')
      // Se tem 11 dígitos, valida como CPF
      if (cleanValue.length === 11) {
        return validateCPF(value)
      }
      // Se tem 14 dígitos, assume CNPJ (validação básica)
      if (cleanValue.length === 14) {
        return true // Validação básica para CNPJ
      }
      return false
    }, 'CPF/CNPJ inválido ou bloqueado'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['male', 'female']),
  user_type: z.enum(['client', 'professional']),
  location_state: z.string().min(1, 'Estado é obrigatório'),
  location_city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  // Campos opcionais para profissionais
  bio: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
  experience_years: z.string().optional(),
  emergency_service: z.boolean().optional(),
  insurance_coverage: z.boolean().optional(),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

type AvatarType = 'upload' | 'dicebear'
type AvatarSelection = {
  type: AvatarType
  value: string | File
  preview?: string
}

export function SimpleRegistrationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [stateOpen, setStateOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarSelection | null>(null)
  const [dicebearAvatar, setDicebearAvatar] = useState<string>('')
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const { signUp } = useAuthContext()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      user_type: 'client' as const,
      gender: 'male' as const,
      emergency_service: false,
      insurance_coverage: false,
    },
  })

  const watchedValues = watch()
  const isProfessional = watchedValues.user_type === 'professional'
  const fullName = watchedValues.name

  // Converter categorias para formato de string simples
  const serviceCategoryNames = services.map(cat => cat.name)

  const handleServiceToggle = (service: string) => {
    const newSelectedServices = selectedServices.includes(service) 
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service]
    
    setSelectedServices(newSelectedServices)
    setValue('services_offered', newSelectedServices)
  }

  const removeService = (serviceToRemove: string) => {
    const newSelectedServices = selectedServices.filter(s => s !== serviceToRemove)
    setSelectedServices(newSelectedServices)
    setValue('services_offered', newSelectedServices)
  }

  // Selecionar avatar pixel art automaticamente quando gerado
  useEffect(() => {
    if (dicebearAvatar) {
      setSelectedAvatar({
        type: 'dicebear',
        value: dicebearAvatar,
        preview: dicebearAvatar
      })
    }
  }, [dicebearAvatar])

  const generateDicebearAvatar = async (name: string, gender: string) => {
    setIsGeneratingAvatar(true)
    try {
      const encodedName = encodeURIComponent(name)
      const facialHairProbability = gender === 'male' ? '30' : gender === 'female' ? '0' : '15'
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodedName}&backgroundColor=transparent&size=100&facialHairProbability=${facialHairProbability}`
      setDicebearAvatar(avatarUrl)
      console.log('🎨 Avatar atualizado:', avatarUrl)
    } catch (error) {
      console.error('Erro ao gerar avatar Dicebear:', error)
    } finally {
      setIsGeneratingAvatar(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedAvatar({
          type: 'upload',
          value: file,
          preview: e.target?.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDicebearSelect = () => {
    if (dicebearAvatar) {
      setSelectedAvatar({
        type: 'dicebear',
        value: dicebearAvatar,
        preview: dicebearAvatar
      })
    }
  }

  // Formatação automática para telefone (apenas números)
  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '')
  }

  // Formatação automática para nome (iniciais maiúsculas)
  const formatName = (value: string) => {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim()
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
    
    // Validação em tempo real mais rigorosa
    const cleanValue = formatted.replace(/\D/g, '')
    if (cleanValue.length === 11) {
      const isValid = validateCPF(formatted)
      if (!isValid) {
        // Força validação imediata para mostrar erro
        setValue('cpf_cnpj', formatted, { shouldValidate: true, shouldDirty: true })
      } else {
        // Limpa erros se CPF for válido
        setValue('cpf_cnpj', formatted, { shouldValidate: true, shouldDirty: true })
      }
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir digitação normal, só formatar quando sair do campo
    setValue('name', e.target.value)
    
    // Gerar avatar a cada letra digitada (se nome tiver 2+ caracteres)
    const name = e.target.value
    if (name && name.length >= 2) {
      generateDicebearAvatar(name, 'male')
    }
  }

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Aplicar formatação apenas quando sair do campo
    const formatted = formatName(e.target.value)
    setValue('name', formatted)
  }

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

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true)
    try {
      // ✅ VALIDAR DUPLICATAS ANTES DE CADASTRAR
      console.log('🔍 Verificando duplicatas...')
      const { emailExists, cpfExists } = await checkDuplicates(
        data.email,
        data.cpf_cnpj
      )
      
      if (emailExists) {
        toast.error('❌ Este email já está cadastrado na plataforma')
        setIsLoading(false)
        return
      }
      
      if (cpfExists) {
        toast.error('❌ Este CPF/CNPJ já está cadastrado na plataforma')
        setIsLoading(false)
        return
      }
      
      console.log('✅ Email e CPF disponíveis')
      
      // Preparar dados do avatar
      let avatarData = null
      if (selectedAvatar) {
        if (selectedAvatar.type === 'upload') {
          // Para upload de arquivo, vamos usar a URL do Dicebear como fallback
          avatarData = {
            type: 'upload',
            file: selectedAvatar.value as File,
            preview: selectedAvatar.preview
          }
        } else if (selectedAvatar.type === 'dicebear') {
          // Para avatar Dicebear, usar a URL diretamente
          avatarData = {
            type: 'dicebear',
            url: selectedAvatar.value as string,
            preview: selectedAvatar.preview
          }
        }
      }

      console.log('🎨 Avatar selecionado:', avatarData)

      const { error } = await signUp({
        email: data.email,
        password: data.password,
        full_name: data.name,
        user_type: data.user_type,
        phone: data.phone,
        cpf_cnpj: data.cpf_cnpj,
        birth_date: data.birth_date || '',
        location_state: data.location_state || '',
        location_city: data.location_city || '',
        neighborhood: data.neighborhood || '',
        bio: data.bio || '',
        services_offered: selectedServices || [],
        experience_years: data.experience_years || '',
        emergency_service: data.emergency_service || false,
        insurance_coverage: data.insurance_coverage || false,
        gender: data.gender || 'male', // Garantir que seja male ou female
        avatar_data: avatarData, // Incluir dados do avatar
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
      {/* Foto/Imagem Moderna */}
      <div className="space-y-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Foto/Imagem</h3>
        
        <div className="space-y-3">
          {/* Preview do Avatar Selecionado */}
          {selectedAvatar && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-12 h-12 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <img
                  src={selectedAvatar.preview}
                  alt="Avatar selecionado"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedAvatar.type === 'upload' ? 'Foto enviada' : 'Avatar gerado'}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedAvatar.type === 'upload' && (selectedAvatar.value as File).name}
                  {selectedAvatar.type === 'dicebear' && 'Gerado automaticamente'}
                </p>
              </div>
            </div>
          )}

          {/* Opções de Avatar */}
          <div className="grid grid-cols-2 gap-3">
            {/* Upload de Foto */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Upload size={14} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Upload</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className={cn(
                  "block w-full p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all text-center bg-white",
                  selectedAvatar?.type === 'upload' && "border-blue-500 bg-blue-50"
                )}
              >
                <div className="text-sm text-gray-700 font-medium">
                  {selectedAvatar?.type === 'upload' ? '✓ Selecionado' : 'Escolher arquivo'}
                </div>
              </label>
            </div>

            {/* Avatar Pixel-Art */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <RefreshCw size={14} className={cn("text-gray-600", isGeneratingAvatar && "animate-spin")} />
                <span className="text-sm font-medium text-gray-700">Pixel-Art</span>
              </div>
              {fullName && fullName.length >= 2 ? (
                <button
                  type="button"
                  onClick={handleDicebearSelect}
                  disabled={isGeneratingAvatar || !dicebearAvatar}
                  className={cn(
                    "w-full p-3 border border-gray-300 rounded-lg transition-all text-center bg-white hover:border-blue-500 hover:bg-blue-50",
                    selectedAvatar?.type === 'dicebear' && "border-blue-500 bg-blue-50",
                    (isGeneratingAvatar || !dicebearAvatar) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isGeneratingAvatar ? (
                    <div className="text-sm text-gray-700 font-medium">Gerando...</div>
                  ) : dicebearAvatar ? (
                    <div className="text-sm text-gray-700 font-medium">✓ Selecionado automaticamente</div>
                  ) : (
                    <div className="text-sm text-gray-700 font-medium">Digite nome</div>
                  )}
                </button>
              ) : (
                <div className="w-full p-3 border border-gray-300 rounded-lg text-center bg-gray-50">
                  <div className="text-sm text-gray-500 font-medium">Digite nome</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dados Básicos */}
      <div className="space-y-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Dados Básicos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome completo *
            </Label>
            <Input
              id="name"
              placeholder="Digite seu nome completo"
              {...register('name')}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              className={cn(
                "transition-colors",
                errors.name ? 'border-red-500 focus:border-red-500' : ''
              )}
            />
            {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>}
            {watchedValues.name && watchedValues.name.length >= 2 && !errors.name && (
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

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Telefone *
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register('phone')}
              onChange={handlePhoneChange}
              className={cn(
                "transition-colors",
                errors.phone ? 'border-red-500 focus:border-red-500' : ''
              )}
            />
            {errors.phone && <p className="text-sm text-red-500 font-medium">{errors.phone.message}</p>}
            {watchedValues.phone && watchedValues.phone.length >= 10 && !errors.phone && (
              <p className="text-sm text-green-600 font-medium">✓ Telefone válido</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj" className="text-sm font-medium text-gray-700">
              CPF/CNPJ *
            </Label>
            <Input
              id="cpf_cnpj"
              placeholder="000.000.000-00"
              {...register('cpf_cnpj')}
              onChange={handleCPFChange}
              className={cn(
                "transition-colors",
                errors.cpf_cnpj ? 'border-red-500 focus:border-red-500' : ''
              )}
            />
            {errors.cpf_cnpj && <p className="text-sm text-red-500 font-medium">{errors.cpf_cnpj.message}</p>}
            {watchedValues.cpf_cnpj && watchedValues.cpf_cnpj.replace(/\D/g, '').length === 11 && !validateCPF(watchedValues.cpf_cnpj) && !errors.cpf_cnpj && (
              <p className="text-sm text-red-500 font-medium">❌ CPF inválido. Este CPF não é válido ou está na lista de CPFs bloqueados.</p>
            )}
            {watchedValues.cpf_cnpj && watchedValues.cpf_cnpj.replace(/\D/g, '').length === 11 && validateCPF(watchedValues.cpf_cnpj) && !errors.cpf_cnpj && (
              <p className="text-sm text-green-600 font-medium">✅ CPF válido</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date" className="text-sm font-medium text-gray-700">
              Data de nascimento *
            </Label>
            <Input
              id="birth_date"
              type="date"
              {...register('birth_date')}
              className={cn(
                "transition-colors",
                errors.birth_date ? 'border-red-500 focus:border-red-500' : ''
              )}
            />
            {errors.birth_date && <p className="text-sm text-red-500 font-medium">{errors.birth_date.message}</p>}
            {watchedValues.birth_date && !errors.birth_date && (
              <p className="text-sm text-green-600 font-medium">✓ Data válida</p>
            )}
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Sexo *
            </Label>
            <Select value={watchedValues.gender || ''} onValueChange={(value) => setValue('gender', value as 'male' | 'female')}>
              <SelectTrigger className={cn(
                "transition-colors",
                errors.gender ? 'border-red-500 focus:border-red-500' : ''
              )}>
                <SelectValue placeholder="Escolha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500 font-medium">{errors.gender.message}</p>
            )}
            {watchedValues.gender && !errors.gender && (
              <p className="text-sm text-green-600 font-medium">✓ Sexo selecionado</p>
            )}
          </div>

        </div>
      </div>

      {/* Localização */}
      <div className="space-y-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Localização</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location_state" className="text-sm font-medium text-gray-700">
              Estado *
            </Label>
            <Popover open={stateOpen} onOpenChange={setStateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between",
                    errors.location_state ? 'border-red-500' : ''
                  )}
                >
                  <span className="text-gray-900">
                    {watchedValues.location_state
                      ? estadosBrasil.find((estado) => estado.sigla === watchedValues.location_state)?.nome
                      : "Estado"}
                  </span>
                  <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-white border border-gray-200 rounded-lg shadow-lg" align="start">
                <Command>
                  <CommandInput placeholder="Buscar estado..." className="border-b border-gray-200" />
                  <CommandList>
                    <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
                    <CommandGroup>
                      {estadosBrasil.map((estado) => (
                        <CommandItem
                          key={estado.sigla}
                          value={estado.nome}
                          onSelect={() => {
                            setValue('location_state', estado.sigla)
                            setValue('location_city', '') // Limpar cidade quando mudar estado
                            setStateOpen(false)
                          }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                        >
                          <Check
                            size={16} className={cn(
                              "mr-2",
                              watchedValues.location_state === estado.sigla ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {estado.nome} ({estado.sigla})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.location_state && <p className="text-sm text-red-500 font-medium">{errors.location_state.message}</p>}
            {watchedValues.location_state && !errors.location_state && (
              <p className="text-sm text-green-600 font-medium">✓ Estado selecionado</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_city" className="text-sm font-medium text-gray-700">
              Cidade *
            </Label>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={!watchedValues.location_state}
                  className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between",
                    errors.location_city ? 'border-red-500' : '',
                    !watchedValues.location_state ? 'opacity-50 cursor-not-allowed' : ''
                  )}
                >
                  <span className="text-gray-900">
                    {watchedValues.location_city
                      ? watchedValues.location_city
                      : watchedValues.location_state
                      ? "Cidade"
                      : "Estado primeiro"}
                  </span>
                  <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-white border border-gray-200 rounded-lg shadow-lg" align="start">
                <Command>
                  <CommandInput placeholder="Buscar cidade..." className="border-b border-gray-200" />
                  <CommandList>
                    <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                    <CommandGroup>
                      {watchedValues.location_state && getCidadesByEstado(watchedValues.location_state).map((cidade) => (
                        <CommandItem
                          key={cidade}
                          value={cidade}
                          onSelect={() => {
                            setValue('location_city', cidade)
                            setCityOpen(false)
                          }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                        >
                          <Check
                            size={16} className={cn(
                              "mr-2",
                              watchedValues.location_city === cidade ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {cidade}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.location_city && <p className="text-sm text-red-500 font-medium">{errors.location_city.message}</p>}
            {watchedValues.location_city && !errors.location_city && (
              <p className="text-sm text-green-600 font-medium">✓ Cidade selecionada</p>
            )}
          </div>
        </div>

        {/* Campos de Bairro e Endereço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">
              Bairro *
            </Label>
            <Input
              id="neighborhood"
              placeholder="Digite o bairro"
              {...register('neighborhood')}
              className={cn(
                "transition-colors",
                errors.neighborhood ? 'border-red-500 focus:border-red-500' : ''
              )}
            />
            {errors.neighborhood && <p className="text-sm text-red-500 font-medium">{errors.neighborhood.message}</p>}
            {watchedValues.neighborhood && watchedValues.neighborhood.length >= 1 && !errors.neighborhood && (
              <p className="text-sm text-green-600 font-medium">✓ Bairro válido</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Endereço (Rua/Avenida) *
            </Label>
            <Input
              id="address"
              placeholder="Ex: Rua das Flores, 123"
              {...register('address')}
              className={cn(
                "transition-colors",
                errors.address ? 'border-red-500 focus:border-red-500' : ''
              )}
            />
            {errors.address && <p className="text-sm text-red-500 font-medium">{errors.address.message}</p>}
            {watchedValues.address && watchedValues.address.length >= 1 && !errors.address && (
              <p className="text-sm text-green-600 font-medium">✓ Endereço válido</p>
            )}
          </div>
        </div>

        {/* Campo Tipo de Usuário */}
        <div className="space-y-2">
          <Label htmlFor="user_type" className="text-sm font-medium text-gray-700">
            Tipo de usuário *
          </Label>
          <Select value={watchedValues.user_type} onValueChange={(value) => setValue('user_type', value as 'client' | 'professional')}>
            <SelectTrigger className={cn(
              "transition-colors",
              errors.user_type ? 'border-red-500 focus:border-red-500' : ''
            )}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Cliente</SelectItem>
              <SelectItem value="professional">Profissional</SelectItem>
            </SelectContent>
          </Select>
          {errors.user_type && <p className="text-sm text-red-500 font-medium">{errors.user_type.message}</p>}
          {watchedValues.user_type && !errors.user_type && (
            <p className="text-sm text-green-600 font-medium">✓ Tipo selecionado</p>
          )}
        </div>
      </div>

      {/* Campos específicos para profissionais */}
      {isProfessional && (
        <div className="space-y-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Dados Profissionais</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                Biografia
              </Label>
              <Textarea
                {...register('bio')}
                placeholder="Conte um pouco sobre você e sua experiência..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_years" className="text-sm font-medium text-gray-700">
                Anos de experiência
              </Label>
              <Select value={watchedValues.experience_years || ''} onValueChange={(value) => setValue('experience_years', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 ano</SelectItem>
                  <SelectItem value="1-3">1-3 anos</SelectItem>
                  <SelectItem value="3-5">3-5 anos</SelectItem>
                  <SelectItem value="5-10">5-10 anos</SelectItem>
                  <SelectItem value="10+">Mais de 10 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Serviços oferecidos
              </Label>
              <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between"
                  >
                    <span className="text-gray-900">
                      {selectedServices.length === 0
                        ? "Selecione os serviços..."
                        : `${selectedServices.length} serviço(s) selecionado(s)`}
                    </span>
                    <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <Command>
                    <CommandInput placeholder="Buscar serviços..." className="border-b border-gray-200" />
                    <CommandList>
                      <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                      <CommandGroup>
                        {serviceCategoryNames.map((service) => (
                          <CommandItem
                            key={service}
                            value={service}
                            onSelect={() => handleServiceToggle(service)}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Check
                              size={16} className={cn(
                                "mr-2",
                                selectedServices.includes(service) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {service}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Serviços selecionados */}
              {selectedServices.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-700 font-medium">Serviços selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <Badge
                        key={service}
                        variant="secondary"
                        className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1"
                      >
                        <span className="text-sm">{service}</span>
                        <button
                          type="button"
                          onClick={() => removeService(service)}
                          className="text-blue-700 hover:text-red-600 ml-1"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  {...register('emergency_service')}
                  id="emergency_service"
                />
                <Label htmlFor="emergency_service" className="text-sm text-gray-700 cursor-pointer">
                  Ofereço serviço de emergência 24h
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  {...register('insurance_coverage')}
                  id="insurance_coverage"
                />
                <Label htmlFor="insurance_coverage" className="text-sm text-gray-700 cursor-pointer">
                  Possuo seguro de responsabilidade civil
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}

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
