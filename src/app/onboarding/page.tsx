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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  Check, ChevronDown, X, Upload, RefreshCw, User, MapPin, Briefcase, 
  Camera, ArrowRight, Shield, ArrowLeft, Sparkles, Eye, EyeOff
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { estadosBrasil, getCidadesByEstado } from '@/data/brazilianLocations'
import { services } from '@/data/services'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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
  
  if (primeiroDigito !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  const segundoDigito = resto < 2 ? 0 : 11 - resto;
  
  if (segundoDigito !== parseInt(cpf.charAt(10))) return false;

  return true;
}

const onboardingSchema = z.object({
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
  gender: z.enum(['male', 'female']),
  user_type: z.enum(['client', 'professional']),
  location_state: z.string().min(1, 'Estado é obrigatório'),
  location_city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  bio: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
  experience_years: z.string().optional(),
  emergency_service: z.boolean().optional(),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

type AvatarType = 'upload' | 'dicebear'
type AvatarSelection = {
  type: AvatarType
  value: string | File
  preview?: string
}

export default function OnboardingPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [stateOpen, setStateOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarSelection | null>(null)
  const [dicebearAvatar, setDicebearAvatar] = useState<string>('')
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [showDataSummary, setShowDataSummary] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      user_type: 'client' as const,
      gender: 'male' as const,
      emergency_service: false,
    },
  })

  const watchedValues = watch()
  const isProfessional = watchedValues.user_type === 'professional'
  const fullName = watchedValues.full_name || (user as any)?.user_metadata?.full_name || 'Usuário'

  // Verificar se usuário está logado
  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
  }, [user, router])

  // Steps para melhor organização
  const steps = [
    { 
      id: 1, 
      title: 'Boas-vindas', 
      shortTitle: 'Início',
      icon: Sparkles, 
      description: 'Vamos conhecer você!',
      fields: []
    },
    { 
      id: 2, 
      title: 'Seus Dados', 
      shortTitle: 'Dados',
      icon: User, 
      description: 'Informações pessoais básicas',
      fields: ['full_name', 'phone', 'cpf_cnpj', 'birth_date', 'gender']
    },
    { 
      id: 3, 
      title: 'Sua Foto', 
      shortTitle: 'Foto',
      icon: Camera, 
      description: 'Escolha sua foto de perfil',
      fields: []
    },
    { 
      id: 4, 
      title: 'Onde Você Mora', 
      shortTitle: 'Local',
      icon: MapPin, 
      description: 'Sua localização',
      fields: ['location_state', 'location_city', 'neighborhood', 'address']
    },
    { 
      id: 5, 
      title: 'Tipo de Usuário', 
      shortTitle: 'Tipo',
      icon: User, 
      description: 'Cliente ou Profissional?',
      fields: ['user_type']
    },
    { 
      id: 6, 
      title: 'Dados Profissionais', 
      shortTitle: 'Trabalho',
      icon: Briefcase, 
      description: 'Seus serviços e experiência',
      fields: ['bio', 'services_offered', 'experience_years', 'emergency_service']
    },
    { 
      id: 7, 
      title: 'Resumo Final', 
      shortTitle: 'Resumo',
      icon: Eye, 
      description: 'Confira seus dados',
      fields: []
    },
  ]

  const totalSteps = steps.length
  const progressPercentage = (currentStep / totalSteps) * 100

  const getCurrentStepData = () => {
    return steps.find(step => step.id === currentStep) || steps[0]
  }

  // Validação por etapa
  const validateCurrentStep = (): boolean => {
    const values = watchedValues

    switch (currentStep) {
      case 1: // Boas-vindas - sempre válido
        return true
      
      case 2: // Dados pessoais
        return !!(
          values.full_name && 
          values.full_name.length >= 2 &&
          values.phone && 
          values.phone.length >= 10 &&
          values.cpf_cnpj && 
          values.cpf_cnpj.length >= 11 &&
          values.birth_date &&
          values.gender
        )
      
      case 3: // Avatar - sempre válido (opcional)
        return true
      
      case 4: // Localização
        return !!(
          values.location_state &&
          values.location_city &&
          values.neighborhood &&
          values.address
        )
      
      case 5: // Tipo de usuário
        return !!values.user_type
      
      case 6: // Dados profissionais - só obrigatório se for profissional
        if (values.user_type !== 'professional') return true
        return true // Bio e outros campos são opcionais
      
      case 7: // Resumo - sempre válido
        return true
      
      default:
        return false
    }
  }

  const nextStep = async () => {
    if (currentStep >= totalSteps) return
    
    // Validar etapa atual antes de avançar
    if (!validateCurrentStep()) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }
    
    setIsTransitioning(true)
    setSlideDirection('right')
    
    // Pequeno delay para suavizar a transição
    setTimeout(() => {
      setCurrentStep(currentStep + 1)
      setIsTransitioning(false)
    }, 150)
  }

  const prevStep = () => {
    if (currentStep <= 1) return
    
    setIsTransitioning(true)
    setSlideDirection('left')
    
    setTimeout(() => {
      setCurrentStep(currentStep - 1)
      setIsTransitioning(false)
    }, 150)
  }

  const goToStep = (stepId: number) => {
    if (stepId === currentStep) return
    
    setIsTransitioning(true)
    setSlideDirection(stepId > currentStep ? 'right' : 'left')
    
    setTimeout(() => {
      setCurrentStep(stepId)
      setIsTransitioning(false)
    }, 150)
  }

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

  const generateDicebearAvatar = async (name: string, gender: string, forceRandom = false) => {
    if (!name || name.length < 2) return
    
    setIsGeneratingAvatar(true)
    try {
      let seed = name.trim()
      
      // Se for para gerar aleatório, adiciona timestamp para garantir unicidade
      if (forceRandom) {
        seed = `${name.trim()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      
      const encodedSeed = encodeURIComponent(seed)
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodedSeed}&backgroundColor=transparent`
      
      const response = await fetch(avatarUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const content = await response.text()
      if (!content || content.includes('error') || !content.includes('<svg')) {
        throw new Error('Conteúdo SVG inválido retornado')
      }
      
      setDicebearAvatar(avatarUrl)
      
      // Auto-selecionar o novo avatar gerado
      if (forceRandom) {
        setSelectedAvatar({
          type: 'dicebear',
          value: avatarUrl,
          preview: avatarUrl
        })
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar avatar Dicebear:', error)
      toast.error('Erro ao gerar avatar automático')
    } finally {
      setIsGeneratingAvatar(false)
    }
  }

  const generateRandomAvatar = () => {
    const name = watchedValues.full_name
    const gender = watchedValues.gender || 'male'
    if (name && name.length >= 2) {
      generateDicebearAvatar(name, gender, true)
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

  // Gerar avatar automaticamente quando o nome muda
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const subscription = watch((value, { name }) => {
      if (name === 'full_name' && value.full_name && value.full_name.length >= 2) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          const gender = value.gender || 'male'
          generateDicebearAvatar(value.full_name, gender)
        }, 500)
      }
    })
    
    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [watch])

  // Auto-selecionar avatar quando gerado
  useEffect(() => {
    if (dicebearAvatar && !selectedAvatar) {
      setSelectedAvatar({
        type: 'dicebear',
        value: dicebearAvatar,
        preview: dicebearAvatar
      })
    }
  }, [dicebearAvatar, selectedAvatar])

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsLoading(true)
    
    try {
      let avatarUrl = null

      // Upload da imagem se necessário
      if (selectedAvatar?.type === 'upload' && selectedAvatar.value instanceof File) {
        const file = selectedAvatar.value
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Erro no upload:', uploadError)
          toast.error('Erro ao fazer upload da imagem')
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
        
        avatarUrl = publicUrl
      } else if (selectedAvatar?.type === 'dicebear') {
        avatarUrl = selectedAvatar.value as string
      }

      // Preparar dados do perfil
      const profileData = {
        user_id: user.id,
        full_name: data.full_name,
        phone: data.phone,
        cpf_cnpj: data.cpf_cnpj,
        birth_date: data.birth_date,
        gender: data.gender,
        user_type: data.user_type,
        location_state: data.location_state,
        location_city: data.location_city,
        neighborhood: data.neighborhood,
        address: data.address,
        bio: data.bio || null,
        services_offered: selectedServices.length > 0 ? selectedServices : null,
        experience_years: data.experience_years || null,
        emergency_service: data.emergency_service || false,
        avatar_url: avatarUrl,
        onboarding_completed: true
      }

      console.log('📝 Dados do perfil que serão enviados:', profileData)

      // Usar upsert para inserir ou atualizar na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        })

      if (profileError) {
        console.error('❌ Erro ao salvar perfil:', profileError)
        toast.error('Erro ao salvar perfil: ' + profileError.message)
        return
      }

      // Atualizar metadados do usuário no auth.users para aparecer no dashboard do Supabase
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          phone: data.phone,
          user_type: data.user_type,
          avatar_url: avatarUrl,
          onboarding_completed: true
        }
      })

      if (userUpdateError) {
        console.warn('⚠️ Erro ao atualizar metadados do usuário:', userUpdateError)
        // Não falhar o processo, apenas avisar
      }

      console.log('✅ Perfil salvo com sucesso!')
      toast.success('🎉 Perfil completado com sucesso!')
      
      // Redirecionar para dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Erro no onboarding:', error)
      toast.error('Erro inesperado ao completar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const currentStepData = getCurrentStepData()
  const isStepValid = validateCurrentStep()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Modal/Janela Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header da Janela */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-white font-semibold">ConfiLar</span>
                <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 text-white rounded-full font-medium">
                  ONBOARDING
                </span>
              </div>
            </div>
          </div>
          
          {/* Barra de Progresso Pequena */}
          <div className="mt-3">
            <Progress 
              value={progressPercentage} 
              className="h-1 bg-white/20"
            />
          </div>
        </div>

        {/* Info da Etapa */}
        <div className="bg-gray-50/80 border-b border-gray-100 px-6 py-3">
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-900">
              {currentStepData.title}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {currentStepData.description}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                Etapa {currentStep} de {totalSteps}
              </span>
              {!isStepValid && currentStep > 1 && currentStep < totalSteps && (
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  Campos obrigatórios
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo da Janela */}
        <div className="relative overflow-hidden bg-white flex-1 min-h-0">
          {/* Container de Transição */}
          <div 
            className={cn(
              "transition-all duration-300 ease-in-out h-full",
              isTransitioning && slideDirection === 'right' && "transform translate-x-full opacity-0",
              isTransitioning && slideDirection === 'left' && "transform -translate-x-full opacity-0",
              !isTransitioning && "transform translate-x-0 opacity-100"
            )}
          >
            {/* Conteúdo da Etapa Atual */}
            <div className="p-5 h-full overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Etapa 1: Boas-vindas */}
                {currentStep === 1 && (
                  <div className="text-center space-y-3 py-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Bem-vindo ao ConfiLar!
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Seja bem-vindo! 🎉
                      </p>
                      <p className="text-gray-600 text-sm">
                        Vamos completar seu perfil em algumas etapas simples. 
                        Isso nos ajudará a conectar você com as pessoas certas!
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Shield className="w-4 h-4" />
                          <span className="font-semibold text-sm">Seus dados estão seguros</span>
                        </div>
                        <p className="text-blue-700 text-xs mt-1">
                          Todas as informações são protegidas e usadas apenas para melhorar sua experiência.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Etapa 2: Dados Pessoais */}
                {currentStep === 2 && (
                  <div className="space-y-3">
                    <div className="text-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-2">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Seus Dados Pessoais</h3>
                      <p className="text-gray-600 text-xs">Precisamos conhecer você melhor</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          Nome completo <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="full_name"
                          placeholder="Digite seu nome completo"
                          {...register('full_name')}
                          className={cn(
                            "transition-all duration-200 bg-white border rounded-lg h-9 text-sm",
                            errors.full_name ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-blue-500'
                          )}
                        />
                        {errors.full_name && (
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.full_name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          Telefone <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          placeholder="(11) 99999-9999"
                          {...register('phone')}
                          onChange={handlePhoneChange}
                          className={cn(
                            "transition-all duration-200 bg-white border rounded-lg h-9 text-sm",
                            errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-blue-500'
                          )}
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="cpf_cnpj" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          CPF <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cpf_cnpj"
                          placeholder="000.000.000-00"
                          {...register('cpf_cnpj')}
                          onChange={handleCPFChange}
                          className={cn(
                            "transition-all duration-200 bg-white border rounded-lg h-9 text-sm",
                            errors.cpf_cnpj ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-blue-500'
                          )}
                        />
                        {errors.cpf_cnpj && (
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.cpf_cnpj.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="birth_date" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                            Nascimento <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="birth_date"
                            type="date"
                            {...register('birth_date')}
                            className={cn(
                              "transition-all duration-200 bg-white border rounded-lg h-9 text-sm",
                              errors.birth_date ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-blue-500'
                            )}
                          />
                          {errors.birth_date && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Obrigatório
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                            Sexo <span className="text-red-500">*</span>
                          </Label>
                          <Select value={watchedValues.gender || ''} onValueChange={(value) => setValue('gender', value as 'male' | 'female')}>
                            <SelectTrigger className={cn(
                              "transition-all duration-200 bg-white border rounded-lg h-9 text-sm",
                              errors.gender ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-blue-500'
                            )}>
                              <SelectValue placeholder="Escolha" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">👨 Masculino</SelectItem>
                              <SelectItem value="female">👩 Feminino</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.gender && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Obrigatório
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Etapa 3: Avatar/Foto */}
                {currentStep === 3 && (
                  <div className="space-y-3">
                    <div className="text-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-2">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Sua Foto de Perfil</h3>
                      <p className="text-gray-600 text-xs">Escolha uma foto ou gere um avatar automático</p>
                    </div>

                    <div className="space-y-3">
                      {/* Preview do Avatar Selecionado */}
                      {selectedAvatar && (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                          <div className="w-12 h-12 border-2 border-blue-300 rounded-lg overflow-hidden shadow-md">
                            <img
                              src={selectedAvatar.preview}
                              alt="Avatar selecionado"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedAvatar.type === 'upload' ? '📸 Foto Personalizada' : '🎨 Avatar Gerado'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {selectedAvatar.type === 'upload' && (selectedAvatar.value as File).name}
                              {selectedAvatar.type === 'dicebear' && 'Criado automaticamente'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Opções de Avatar */}
                      <div className="grid grid-cols-1 gap-3">
                        {/* Upload de Foto */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Upload size={14} className="text-blue-600" />
                            <span className="text-sm font-semibold text-gray-700">Upload de Foto</span>
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
                              "block w-full p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center bg-white/50",
                              selectedAvatar?.type === 'upload' && "border-blue-500 bg-blue-50/50"
                            )}
                          >
                            <div className="text-sm text-gray-700 font-medium">
                              {selectedAvatar?.type === 'upload' ? '✅ Foto Selecionada' : '📁 Escolher Arquivo'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              JPG, PNG ou GIF
                            </div>
                          </label>
                        </div>

                        {/* Avatar Pixel-Art */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <RefreshCw size={14} className={cn("text-purple-600", isGeneratingAvatar && "animate-spin")} />
                            <span className="text-sm font-semibold text-gray-700">Avatar Automático</span>
                          </div>
                          {fullName && fullName.length >= 2 ? (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={handleDicebearSelect}
                                disabled={isGeneratingAvatar || !dicebearAvatar}
                                className={cn(
                                  "w-full p-3 border-2 border-dashed rounded-lg transition-all text-center bg-white/50 hover:border-purple-500 hover:bg-purple-50/50",
                                  selectedAvatar?.type === 'dicebear' && "border-purple-500 bg-purple-50/50",
                                  (isGeneratingAvatar || !dicebearAvatar) && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                {isGeneratingAvatar ? (
                                  <div className="text-sm text-gray-700 font-medium">🎨 Criando...</div>
                                ) : dicebearAvatar ? (
                                  <div className="text-sm text-gray-700 font-medium">✅ Avatar Criado</div>
                                ) : (
                                  <div className="text-sm text-gray-700 font-medium">🎨 Criando...</div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  Baseado no seu nome
                                </div>
                              </button>
                              
                              {/* Botão para gerar novo avatar aleatório */}
                              {dicebearAvatar && (
                                <button
                                  type="button"
                                  onClick={generateRandomAvatar}
                                  disabled={isGeneratingAvatar}
                                  className="w-full px-3 py-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                >
                                  <RefreshCw size={12} className={cn(isGeneratingAvatar && "animate-spin")} />
                                  {isGeneratingAvatar ? 'Gerando...' : 'Gerar Outro Avatar'}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50/50">
                              <div className="text-sm text-gray-500 font-medium">Digite seu nome primeiro</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Etapa 4: Localização */}
                {currentStep === 4 && (
                  <div className="space-y-3">
                    <div className="text-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-2">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Onde Você Mora</h3>
                      <p className="text-gray-600 text-xs">Para conectar você com pessoas próximas</p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="location_state" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                            Estado <span className="text-red-500">*</span>
                          </Label>
                          <Popover open={stateOpen} onOpenChange={setStateOpen}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  "w-full px-3 py-2 border rounded-lg bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between h-9 text-sm",
                                  errors.location_state ? 'border-red-400' : 'border-gray-300'
                                )}
                              >
                                <span className="text-gray-900">
                                  {watchedValues.location_state
                                    ? estadosBrasil.find((estado) => estado.sigla === watchedValues.location_state)?.nome
                                    : "Estado"}
                                </span>
                                <ChevronDown size={14} className="ml-2 shrink-0 text-gray-400" />
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
                                          setValue('location_city', '')
                                          setStateOpen(false)
                                        }}
                                        className="px-4 py-2 hover:bg-orange-50 cursor-pointer"
                                      >
                                        <Check
                                          size={14} className={cn(
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
                          {errors.location_state && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Obrigatório
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="location_city" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                            Cidade <span className="text-red-500">*</span>
                          </Label>
                          <Popover open={cityOpen} onOpenChange={setCityOpen}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                disabled={!watchedValues.location_state}
                                className={cn(
                                  "w-full px-3 py-2 border rounded-lg bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between h-9 text-sm",
                                  errors.location_city ? 'border-red-400' : 'border-gray-300',
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
                                <ChevronDown size={14} className="ml-2 shrink-0 text-gray-400" />
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
                                        className="px-4 py-2 hover:bg-orange-50 cursor-pointer"
                                      >
                                        <Check
                                          size={14} className={cn(
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
                          {errors.location_city && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Obrigatório
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="neighborhood" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          Bairro <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="neighborhood"
                          placeholder="Digite o bairro"
                          {...register('neighborhood')}
                          className={cn(
                            "transition-all duration-200 bg-white border rounded-lg h-9 text-sm",
                            errors.neighborhood ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-orange-500'
                          )}
                        />
                        {errors.neighborhood && (
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.neighborhood.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          Endereço <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="address"
                          placeholder="Ex: Rua das Flores, 123"
                          {...register('address')}
                          className={cn(
                            "transition-all duration-200 bg-white border rounded-lg h-9 text-sm",
                            errors.address ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-orange-500'
                          )}
                        />
                        {errors.address && (
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.address.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Etapa 5: Tipo de Usuário */}
                {currentStep === 5 && (
                  <div className="space-y-3">
                    <div className="text-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-2">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Tipo de Usuário</h3>
                      <p className="text-gray-600 text-xs">Como você pretende usar o ConfiLar?</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="user_type" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          Escolha uma opção <span className="text-red-500">*</span>
                        </Label>
                        <Select value={watchedValues.user_type} onValueChange={(value) => setValue('user_type', value as 'client' | 'professional')}>
                          <SelectTrigger className={cn(
                            "transition-all duration-200 bg-white border rounded-lg h-9 text-sm",
                            errors.user_type ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-indigo-500'
                          )}>
                            <SelectValue placeholder="Selecione seu tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">🙋‍♂️ Cliente - Procuro profissionais</SelectItem>
                            <SelectItem value="professional">👨‍💼 Profissional - Ofereço serviços</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.user_type && (
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.user_type.message}
                          </p>
                        )}
                      </div>

                      {/* Explicação dos tipos */}
                      <div className="grid grid-cols-1 gap-3 mt-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🙋‍♂️</span>
                            <span className="font-semibold text-blue-900 text-sm">Cliente</span>
                          </div>
                          <p className="text-xs text-blue-700">
                            Você busca profissionais para resolver suas necessidades.
                          </p>
                        </div>

                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">👨‍💼</span>
                            <span className="font-semibold text-green-900 text-sm">Profissional</span>
                          </div>
                          <p className="text-xs text-green-700">
                            Você oferece serviços e quer ser encontrado por clientes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Etapa 6: Dados Profissionais */}
                {currentStep === 6 && isProfessional && (
                  <div className="space-y-3">
                    <div className="text-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-2">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Dados Profissionais</h3>
                      <p className="text-gray-600 text-xs">Conte-nos sobre sua experiência</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                          Biografia (Opcional)
                        </Label>
                        <Textarea
                          {...register('bio')}
                          placeholder="Conte um pouco sobre você..."
                          rows={2}
                          className="resize-none bg-white border rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-sm font-semibold text-gray-700">
                          Anos de experiência
                        </Label>
                        <Select value={watchedValues.experience_years || ''} onValueChange={(value) => setValue('experience_years', value)}>
                          <SelectTrigger className="bg-white border rounded-lg h-9 text-sm">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">🌱 0-1 ano</SelectItem>
                            <SelectItem value="1-3">📈 1-3 anos</SelectItem>
                            <SelectItem value="3-5">🎯 3-5 anos</SelectItem>
                            <SelectItem value="5-10">🏆 5-10 anos</SelectItem>
                            <SelectItem value="10+">👑 Mais de 10 anos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-sm font-semibold text-gray-700">
                          Serviços oferecidos (Opcional)
                        </Label>
                        <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="w-full px-3 py-2 border rounded-lg bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between h-9 text-sm"
                            >
                              <span className="text-gray-900">
                                {selectedServices.length === 0
                                  ? "Selecione os serviços..."
                                  : `${selectedServices.length} serviço(s)`}
                              </span>
                              <ChevronDown size={14} className="ml-2 shrink-0 text-gray-400" />
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
                                      className="px-4 py-2 hover:bg-amber-50 cursor-pointer"
                                    >
                                      <Check
                                        size={14} className={cn(
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
                          <div className="mt-2">
                            <p className="text-xs text-gray-700 font-medium mb-1">Selecionados:</p>
                            <div className="text-xs text-gray-600 leading-tight">
                              {selectedServices.map((service, index) => (
                                <span key={service} className="inline">
                                  {service}
                                  <button
                                    type="button"
                                    onClick={() => removeService(service)}
                                    className="ml-1 text-red-500 hover:text-red-700 font-bold"
                                    title="Remover serviço"
                                  >
                                    ×
                                  </button>
                                  {index < selectedServices.length - 1 && <span className="text-gray-400 mx-1">•</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            {...register('emergency_service')}
                            id="emergency_service"
                          />
                          <Label htmlFor="emergency_service" className="text-xs text-gray-700 cursor-pointer">
                            🚨 Ofereço serviço de emergência 24h
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Etapa 6: Pular se for cliente */}
                {currentStep === 6 && !isProfessional && (
                  <div className="text-center space-y-3 py-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Quase lá!
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Como você é um Cliente, não precisamos de dados profissionais.
                      </p>
                    </div>
                  </div>
                )}

                {/* Etapa 7: Resumo Final */}
                {currentStep === 7 && (
                  <div className="space-y-3">
                    <div className="text-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-2">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Resumo dos Seus Dados</h3>
                      <p className="text-gray-600 text-xs">Confira as informações antes de finalizar</p>
                    </div>

                    <div className="space-y-3">
                      {/* Toggle para mostrar/ocultar dados sensíveis */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-600">Mostrar dados sensíveis</span>
                        <button
                          type="button"
                          onClick={() => setShowDataSummary(!showDataSummary)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          {showDataSummary ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {showDataSummary ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>

                      {/* Resumo dos dados */}
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">📋 Resumo do seu perfil:</h4>
                        <div className="space-y-2 text-xs text-gray-700">
                          <div className="grid grid-cols-2 gap-2">
                            <p><strong>Nome:</strong> {watchedValues.full_name || 'Não informado'}</p>
                            <p><strong>Telefone:</strong> {showDataSummary ? (watchedValues.phone || 'Não informado') : '***-****'}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <p><strong>CPF:</strong> {showDataSummary ? (watchedValues.cpf_cnpj || 'Não informado') : '***.***.***-**'}</p>
                            <p><strong>Sexo:</strong> {watchedValues.gender === 'male' ? 'Masculino' : watchedValues.gender === 'female' ? 'Feminino' : 'Não informado'}</p>
                          </div>
                          
                          <p><strong>Nascimento:</strong> {showDataSummary ? (watchedValues.birth_date || 'Não informado') : '**/**/****'}</p>
                          
                          <div className="border-t border-gray-300 pt-2 mt-2">
                            <p><strong>Estado:</strong> {watchedValues.location_state ? estadosBrasil.find(e => e.sigla === watchedValues.location_state)?.nome : 'Não informado'}</p>
                            <p><strong>Cidade:</strong> {watchedValues.location_city || 'Não informado'}</p>
                            <p><strong>Bairro:</strong> {watchedValues.neighborhood || 'Não informado'}</p>
                            <p><strong>Endereço:</strong> {showDataSummary ? (watchedValues.address || 'Não informado') : 'Oculto'}</p>
                          </div>
                          
                          <div className="border-t border-gray-300 pt-2 mt-2">
                            <p><strong>Tipo:</strong> {watchedValues.user_type === 'professional' ? '👨‍💼 Profissional' : watchedValues.user_type === 'client' ? '🙋‍♂️ Cliente' : 'Não informado'}</p>
                            
                            {selectedAvatar && (
                              <p><strong>Avatar:</strong> {selectedAvatar.type === 'upload' ? '📸 Foto personalizada' : '🎨 Avatar gerado'}</p>
                            )}
                            
                            {isProfessional && (
                              <>
                                {watchedValues.experience_years && (
                                  <p><strong>Experiência:</strong> {watchedValues.experience_years}</p>
                                )}
                                {selectedServices.length > 0 && (
                                  <p><strong>Serviços:</strong> {selectedServices.length} selecionado(s)</p>
                                )}
                                {watchedValues.emergency_service && (
                                  <p><strong>Emergência:</strong> ✅ Serviço 24h</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Aviso final */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-800 mb-1">
                          <Shield className="w-4 h-4" />
                          <span className="font-semibold text-sm">Tudo pronto!</span>
                        </div>
                        <p className="text-green-700 text-xs">
                          Seus dados estão corretos? Clique em "Finalizar" para completar seu cadastro.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className={cn(
                  "flex pt-3 border-t border-gray-100",
                  currentStep === 1 ? "justify-end" : "justify-between items-center"
                )}>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={isTransitioning}
                      className="flex items-center gap-2 rounded-lg h-8 px-3 text-sm"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Anterior
                    </Button>
                  )}

                  <div className="flex items-center gap-2">
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={isTransitioning}
                        className={cn(
                          "flex items-center gap-2 rounded-lg text-white h-8 px-4 text-sm",
                          !isStepValid && currentStep > 1 && currentStep < totalSteps 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-blue-600 hover:bg-blue-700"
                        )}
                      >
                        Próximo
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white h-8 px-4 flex items-center gap-2 rounded-lg text-sm"
                        disabled={isLoading || !isValid}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Finalizando...
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" />
                            Finalizar Cadastro
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}