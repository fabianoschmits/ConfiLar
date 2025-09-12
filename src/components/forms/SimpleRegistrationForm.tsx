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
import { IconCheck, IconChevronsDown, IconX, IconUpload, IconUser, IconRefresh } from '@tabler/icons-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { estadosBrasil, getCidadesByEstado } from '@/data/brazilianLocations'
import { services } from '@/data/services'
import { toast } from 'sonner'

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

      const { error } = await signUp(data.email, data.password, {
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
        toast.error(`ERRO AO CRIAR CONTA: ${error.message}`)
        setIsLoading(false)
        return
      }

      // Mostrar notificação de sucesso
      toast.success('🎉 CONTA CRIADA COM SUCESSO! UM EMAIL DE CONFIRMAÇÃO FOI ENVIADO PARA VOCÊ. VERIFIQUE SUA CAIXA DE ENTRADA E CLIQUE NO LINK PARA ATIVAR SUA CONTA.')
      
      // Aguardar 3 segundos para o usuário ler a mensagem antes de redirecionar
      setTimeout(() => {
        setIsLoading(false)
        window.location.href = '/auth?message=account_created'
      }, 3000)
    } catch (error) {
      console.error('Erro no cadastro:', error)
      toast.error('ERRO INESPERADO AO CRIAR CONTA')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Foto/Imagem Brutalista */}
      <div className="space-y-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
        <h3 className="text-lg font-black text-black uppercase border-b-4 border-black pb-2">FOTO/IMAGEM</h3>
        
        <div className="space-y-3">
          {/* Preview do Avatar Selecionado */}
          {selectedAvatar && (
            <div className="flex items-center gap-3 p-3 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <img
                  src={selectedAvatar.preview}
                  alt="Avatar selecionado"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-black text-black uppercase">
                  {selectedAvatar.type === 'upload' ? 'FOTO ENVIADA' : 'AVATAR GERADO'}
                </p>
                <p className="text-xs text-black font-bold">
                  {selectedAvatar.type === 'upload' && (selectedAvatar.value as File).name}
                  {selectedAvatar.type === 'dicebear' && 'GERADO AUTOMATICAMENTE'}
                </p>
              </div>
            </div>
          )}

          {/* Opções de Avatar */}
          <div className="grid grid-cols-2 gap-3">
            {/* Upload de Foto */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <IconUpload size={12} stroke={2} className="text-black" />
                <span className="text-xs font-black text-black uppercase">UPLOAD</span>
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
                  "block w-full p-2 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-center bg-white",
                  selectedAvatar?.type === 'upload' && "bg-yellow-400"
                )}
              >
                <div className="text-xs text-black font-black uppercase">
                  {selectedAvatar?.type === 'upload' ? '✓ SELECIONADO' : 'ESCOLHER ARQUIVO'}
                </div>
              </label>
            </div>

            {/* Avatar Pixel-Art */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <IconRefresh size={12} stroke={2} className={cn("text-black", isGeneratingAvatar && "animate-spin")} />
                <span className="text-xs font-black text-black uppercase">PIXEL-ART</span>
              </div>
              {fullName && fullName.length >= 2 ? (
                <button
                  type="button"
                  onClick={handleDicebearSelect}
                  disabled={isGeneratingAvatar || !dicebearAvatar}
                  className={cn(
                    "w-full p-2 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-center bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    selectedAvatar?.type === 'dicebear' && "bg-yellow-400",
                    (isGeneratingAvatar || !dicebearAvatar) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isGeneratingAvatar ? (
                    <div className="text-xs text-black font-black uppercase">GERANDO...</div>
                  ) : dicebearAvatar ? (
                    <div className="text-xs text-black font-black uppercase">✓ SELECIONADO AUTOMATICAMENTE</div>
                  ) : (
                    <div className="text-xs text-black font-black uppercase">DIGITE NOME</div>
                  )}
                </button>
              ) : (
                <div className="w-full p-2 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center bg-white">
                  <div className="text-xs text-black font-black uppercase">DIGITE NOME</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dados Básicos */}
      <div className="space-y-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
        <h3 className="text-lg font-black text-black uppercase border-b-4 border-black pb-2">DADOS BÁSICOS</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-black text-black uppercase">
              NOME COMPLETO *
            </label>
            <input
              id="name"
              placeholder=""
              {...register('name')}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              className={cn(
                "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white",
                errors.name ? 'border-red-500 bg-red-100' : ''
              )}
            />
            {errors.name && <p className="text-sm text-red-500 font-bold">{errors.name.message}</p>}
            {watchedValues.name && watchedValues.name.length >= 2 && !errors.name && (
              <p className="text-sm text-black font-bold">✓ NOME VÁLIDO</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-black text-black uppercase">
              EMAIL *
            </label>
            <input
              id="email"
              type="email"
              placeholder=""
              {...register('email')}
              className={cn(
                "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white",
                errors.email ? 'border-red-500 bg-red-100' : ''
              )}
            />
            {errors.email && <p className="text-sm text-red-500 font-bold">{errors.email.message}</p>}
            {watchedValues.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedValues.email) && (
              <p className="text-sm text-black font-bold">✓ EMAIL VÁLIDO</p>
            )}
          </div>

                     <div className="space-y-2">
             <label htmlFor="password" className="text-sm font-black text-black uppercase">
               SENHA *
             </label>
             <PasswordInput
               id="password"
               placeholder=""
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
            
                         {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
             {watchedValues.password && !errors.password && checkPasswordStrength(watchedValues.password).isStrong && (
               <p className="text-sm text-green-600">✓ Senha forte</p>
             )}
           </div>

                     <div className="space-y-2">
             <label htmlFor="phone" className="text-sm font-black text-black uppercase">
               TELEFONE *
             </label>
             <input
               id="phone"
               placeholder=""
               {...register('phone')}
               onChange={handlePhoneChange}
               className={cn(
                 "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white",
                 errors.phone ? 'border-red-500 bg-red-100' : ''
               )}
             />
             {errors.phone && <p className="text-sm text-red-500 font-bold">{errors.phone.message}</p>}
             {watchedValues.phone && watchedValues.phone.length >= 10 && !errors.phone && (
               <p className="text-sm text-black font-bold">✓ TELEFONE VÁLIDO</p>
             )}
           </div>

                     <div className="space-y-2">
             <label htmlFor="cpf_cnpj" className="text-sm font-black text-black uppercase">
               CPF/CNPJ *
             </label>
             <input
               id="cpf_cnpj"
               placeholder=""
               {...register('cpf_cnpj')}
               onChange={handleCPFChange}
               className={cn(
                 "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white",
                 errors.cpf_cnpj ? 'border-red-500 bg-red-100' : ''
               )}
             />
             {errors.cpf_cnpj && <p className="text-sm text-red-500 font-bold">{errors.cpf_cnpj.message}</p>}
             {watchedValues.cpf_cnpj && watchedValues.cpf_cnpj.replace(/\D/g, '').length === 11 && !validateCPF(watchedValues.cpf_cnpj) && !errors.cpf_cnpj && (
               <p className="text-sm text-red-500 font-bold">❌ CPF INVÁLIDO. ESTE CPF NÃO É VÁLIDO OU ESTÁ NA LISTA DE CPFS BLOQUEADOS.</p>
             )}
             {watchedValues.cpf_cnpj && watchedValues.cpf_cnpj.replace(/\D/g, '').length === 11 && validateCPF(watchedValues.cpf_cnpj) && !errors.cpf_cnpj && (
               <p className="text-sm text-black font-bold">✅ CPF VÁLIDO</p>
             )}
           </div>

                     <div className="space-y-2">
             <label htmlFor="birth_date" className="text-sm font-black text-black uppercase">
               DATA DE NASCIMENTO *
             </label>
             <input
               id="birth_date"
               type="date"
               {...register('birth_date')}
               className={cn(
                 "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white",
                 errors.birth_date ? 'border-red-500 bg-red-100' : ''
               )}
             />
             {errors.birth_date && <p className="text-sm text-red-500 font-bold">{errors.birth_date.message}</p>}
             {watchedValues.birth_date && !errors.birth_date && (
               <p className="text-sm text-black font-bold">✓ DATA VÁLIDA</p>
             )}
           </div>

           {/* Sexo */}
           <div className="space-y-2">
             <label htmlFor="gender" className="text-sm font-black text-black uppercase">
               SEXO *
             </label>
             <select
               id="gender"
               value={watchedValues.gender || ''}
               onChange={(e) => setValue('gender', e.target.value as 'male' | 'female')}
               className={cn(
                 "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white",
                 errors.gender ? 'border-red-500 bg-red-100' : ''
               )}
             >
               <option value="">ESCOLHA</option>
               <option value="male">MASCULINO</option>
               <option value="female">FEMININO</option>
             </select>
             {errors.gender && (
               <p className="text-sm text-red-500 font-bold">{errors.gender.message}</p>
             )}
             {watchedValues.gender && !errors.gender && (
               <p className="text-sm text-black font-bold">✓ SEXO SELECIONADO</p>
             )}
           </div>

        </div>
      </div>

      {/* Localização */}
      <div className="space-y-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
        <h3 className="text-lg font-black text-black uppercase border-b-4 border-black pb-2">LOCALIZAÇÃO</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="location_state" className="text-sm font-black text-black uppercase">
              ESTADO *
            </label>
            <Popover open={stateOpen} onOpenChange={setStateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white flex items-center justify-between",
                    errors.location_state ? 'border-red-500 bg-red-100' : ''
                  )}
                >
                  {watchedValues.location_state
                    ? estadosBrasil.find((estado) => estado.sigla === watchedValues.location_state)?.nome
                    : "ESTADO"}
                  <IconChevronsDown size={16} stroke={2} className="ml-2 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" align="start">
                <Command>
                  <CommandInput placeholder="BUSCAR ESTADO..." className="border-b-2 border-black" />
                  <CommandList>
                    <CommandEmpty>NENHUM ESTADO ENCONTRADO.</CommandEmpty>
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
                          className="px-4 py-2 hover:bg-yellow-400 cursor-pointer"
                        >
                          <IconCheck
                            size={16} stroke={2} className={cn(
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
            {errors.location_state && <p className="text-sm text-red-500 font-bold">{errors.location_state.message}</p>}
            {watchedValues.location_state && !errors.location_state && (
              <p className="text-sm text-black font-bold">✓ ESTADO SELECIONADO</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="location_city" className="text-sm font-black text-black uppercase">
              CIDADE *
            </label>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={!watchedValues.location_state}
                  className={cn(
                    "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white flex items-center justify-between",
                    errors.location_city ? 'border-red-500 bg-red-100' : '',
                    !watchedValues.location_state ? 'opacity-50 cursor-not-allowed' : ''
                  )}
                >
                  {watchedValues.location_city
                    ? watchedValues.location_city
                    : watchedValues.location_state
                    ? "CIDADE"
                    : "ESTADO PRIMEIRO"}
                  <IconChevronsDown size={16} stroke={2} className="ml-2 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" align="start">
                <Command>
                  <CommandInput placeholder="BUSCAR CIDADE..." className="border-b-2 border-black" />
                  <CommandList>
                    <CommandEmpty>NENHUMA CIDADE ENCONTRADA.</CommandEmpty>
                    <CommandGroup>
                      {watchedValues.location_state && getCidadesByEstado(watchedValues.location_state).map((cidade) => (
                        <CommandItem
                          key={cidade}
                          value={cidade}
                          onSelect={() => {
                            setValue('location_city', cidade)
                            setCityOpen(false)
                          }}
                          className="px-4 py-2 hover:bg-yellow-400 cursor-pointer"
                        >
                          <IconCheck
                            size={16} stroke={2} className={cn(
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
            {errors.location_city && <p className="text-sm text-red-500 font-bold">{errors.location_city.message}</p>}
            {watchedValues.location_city && !errors.location_city && (
              <p className="text-sm text-black font-bold">✓ CIDADE SELECIONADA</p>
            )}
          </div>
        </div>

        {/* Campos de Bairro e Endereço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="neighborhood" className="text-sm font-black text-black uppercase">
              BAIRRO *
            </label>
            <input
              id="neighborhood"
              placeholder=""
              {...register('neighborhood')}
              className={cn(
                "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white",
                errors.neighborhood ? 'border-red-500 bg-red-100' : ''
              )}
            />
            {errors.neighborhood && <p className="text-sm text-red-500 font-bold">{errors.neighborhood.message}</p>}
            {watchedValues.neighborhood && watchedValues.neighborhood.length >= 1 && !errors.neighborhood && (
              <p className="text-sm text-black font-bold">✓ BAIRRO VÁLIDO</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-black text-black uppercase">
              ENDEREÇO (RUA/AVENIDA) *
            </label>
            <input
              id="address"
              placeholder="EX: RUA DAS FLORES, 123"
              {...register('address')}
              className={cn(
                "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white",
                errors.address ? 'border-red-500 bg-red-100' : ''
              )}
            />
            {errors.address && <p className="text-sm text-red-500 font-bold">{errors.address.message}</p>}
            {watchedValues.address && watchedValues.address.length >= 1 && !errors.address && (
              <p className="text-sm text-black font-bold">✓ ENDEREÇO VÁLIDO</p>
            )}
          </div>
        </div>

        {/* Campo Tipo de Usuário */}
        <div className="space-y-2">
          <label htmlFor="user_type" className="text-sm font-black text-black uppercase">
            TIPO DE USUÁRIO *
          </label>
          <select
            id="user_type"
            value={watchedValues.user_type}
            onChange={(e) => setValue('user_type', e.target.value as 'client' | 'professional')}
            className={cn(
              "w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white",
              errors.user_type ? 'border-red-500 bg-red-100' : ''
            )}
          >
            <option value="client">CLIENTE</option>
            <option value="professional">PROFISSIONAL</option>
          </select>
          {errors.user_type && <p className="text-sm text-red-500 font-bold">{errors.user_type.message}</p>}
          {watchedValues.user_type && !errors.user_type && (
            <p className="text-sm text-black font-bold">✓ TIPO SELECIONADO</p>
          )}
        </div>
      </div>

      {/* Campos específicos para profissionais */}
      {isProfessional && (
        <div className="space-y-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
          <h3 className="text-lg font-black text-black uppercase border-b-4 border-black pb-2">DADOS PROFISSIONAIS</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-black text-black uppercase">
                BIOGRAFIA
              </label>
              <textarea
                {...register('bio')}
                placeholder="CONTE UM POUCO SOBRE VOCÊ E SUA EXPERIÊNCIA..."
                rows={3}
                className="w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="experience_years" className="text-sm font-black text-black uppercase">
                ANOS DE EXPERIÊNCIA
              </label>
              <select
                value={watchedValues.experience_years || ''}
                onChange={(e) => setValue('experience_years', e.target.value)}
                className="w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
              >
                <option value="">SELECIONE</option>
                <option value="0-1">0-1 ANO</option>
                <option value="1-3">1-3 ANOS</option>
                <option value="3-5">3-5 ANOS</option>
                <option value="5-10">5-10 ANOS</option>
                <option value="10+">MAIS DE 10 ANOS</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-black uppercase">
                SERVIÇOS OFERECIDOS
              </label>
              <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white flex items-center justify-between"
                  >
                    {selectedServices.length === 0
                      ? "SELECIONE OS SERVIÇOS..."
                      : `${selectedServices.length} SERVIÇO(S) SELECIONADO(S)`}
                    <IconChevronsDown size={16} stroke={2} className="ml-2 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Command>
                    <CommandInput placeholder="BUSCAR SERVIÇOS..." className="border-b-2 border-black" />
                    <CommandList>
                      <CommandEmpty>NENHUM SERVIÇO ENCONTRADO.</CommandEmpty>
                      <CommandGroup>
                        {serviceCategoryNames.map((service) => (
                          <CommandItem
                            key={service}
                            value={service}
                            onSelect={() => handleServiceToggle(service)}
                            className="px-4 py-2 hover:bg-yellow-400 cursor-pointer"
                          >
                            <IconCheck
                              size={16} stroke={2} className={cn(
                                "mr-2",
                                selectedServices.includes(service) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {service.toUpperCase()}
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
                  <p className="text-sm text-black font-bold uppercase">SERVIÇOS SELECIONADOS:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <div 
                        key={service} 
                        className="px-3 py-1 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                      >
                        <span className="text-black font-bold text-sm uppercase">{service}</span>
                        <button
                          type="button"
                          onClick={() => removeService(service)}
                          className="text-black hover:text-red-600 font-bold"
                        >
                          <IconX size={12} stroke={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  {...register('emergency_service')}
                  id="emergency_service"
                  type="checkbox"
                  className="w-5 h-5 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] accent-yellow-400"
                />
                <label htmlFor="emergency_service" className="text-sm text-black font-bold uppercase cursor-pointer">
                  OFEREÇO SERVIÇO DE EMERGÊNCIA 24H
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  {...register('insurance_coverage')}
                  id="insurance_coverage"
                  type="checkbox"
                  className="w-5 h-5 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] accent-yellow-400"
                />
                <label htmlFor="insurance_coverage" className="text-sm text-black font-bold uppercase cursor-pointer">
                  POSSUO SEGURO DE RESPONSABILIDADE CIVIL
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão de cadastro */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !isValid}
        >
          {isLoading ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
        </button>
      </div>

      <div className="text-center text-sm text-black font-bold pt-2">
        <p>
          JÁ TEM UMA CONTA?{' '}
          <a href="/auth" className="text-black hover:text-yellow-600 hover:underline font-black uppercase">
            FAÇA LOGIN
          </a>
        </p>
      </div>
    </form>
  )
}
