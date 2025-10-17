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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Check, ChevronDown, X, Upload, RefreshCw, User, MapPin, Briefcase, 
  Camera, ArrowRight, Shield, ArrowLeft, Sparkles, Eye, EyeOff, Home, Save
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { estadosBrasil, getCidadesByEstado } from '@/data/brazilianLocations'
import { services } from '@/data/services'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { getBioOrDefault } from '@/utils/autoBioGenerator'
import { checkCpfExists } from '@/lib/checkDuplicates'
import { useAutoNotifications } from '@/hooks/useAutoNotifications'
import { LightModeLayout } from '@/components/layout/LightModeLayout'

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
  gender: z.enum(['male', 'female', 'other']),
  user_type: z.enum(['client', 'professional']),
  location_state: z.string().min(1, 'Estado é obrigatório'),
  location_city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  bio: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
  experience_years: z.string().optional(),
  accept_terms: z.boolean().refine((value) => value === true, {
    message: 'Você deve aceitar os Termos de Uso para continuar'
  }),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

type AvatarType = 'upload' | 'dicebear'
type AvatarSelection = {
  type: AvatarType
  value: string | File
  preview?: string
}

export default function OnboardingPage() {
  const { user, refreshAuth } = useAuthContext()
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
  const [cpfExists, setCpfExists] = useState(false)
  const [isCheckingCpf, setIsCheckingCpf] = useState(false)
  const { createWelcomePost } = useAutoNotifications()

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
      fields: ['bio', 'services_offered', 'experience_years']
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
          values.gender &&
          values.accept_terms && // Aceite dos termos obrigatório
          !cpfExists // Não permitir avançar se CPF já existe
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

  // Função para verificar CPF em tempo real
  const checkCpfInRealTime = async (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11 || !validateCPF(cpf)) {
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

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setValue('cpf_cnpj', formatted)
    
    const cleanValue = formatted.replace(/\D/g, '')
    if (cleanValue.length === 11) {
      const isValid = validateCPF(formatted)
      setValue('cpf_cnpj', formatted, { shouldValidate: true, shouldDirty: true })
      
      if (isValid) {
        // Verificar se CPF já existe
        checkCpfInRealTime(formatted)
      } else {
        setCpfExists(false)
      }
    } else {
      setCpfExists(false)
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

  const generateDicebearAvatar = async (name: string, forceRandom = false) => {
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
    if (name && name.length >= 2) {
      generateDicebearAvatar(name, true)
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
        generateDicebearAvatar(value.full_name)
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
      // ✅ VALIDAR DUPLICATAS ANTES DE SALVAR
      console.log('🔍 Verificando duplicatas...')
      
      // Verificar se já temos as informações de duplicatas em tempo real
      if (cpfExists) {
        toast.error('❌ Este CPF/CNPJ já está cadastrado. Use o link de recuperação de conta.')
        setIsLoading(false)
        return
      }
      
      // Verificação adicional para garantir
      const cpfCheck = await checkCpfExists(data.cpf_cnpj)
      if (cpfCheck) {
        toast.error('❌ Este CPF/CNPJ já está cadastrado na plataforma')
        setIsLoading(false)
        return
      }
      
      console.log('✅ CPF disponível')
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

      // Gerar biografia automática se não fornecida
      const autoBio = getBioOrDefault(
        data.bio,
        data.user_type,
        {
          location_state: data.location_state,
          professional_services: selectedServices,
          full_name: data.full_name
        }
      )

      // Preparar dados do perfil (apenas campos que existem na tabela)
      const profileData = {
        id: user.id, // A tabela profiles usa 'id' como chave primária
        email: user.email, // Campo obrigatório na tabela
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
        bio: autoBio,
        professional_services: selectedServices.length > 0 ? selectedServices : [],
        professional_experience_years: data.experience_years ? parseInt(data.experience_years.split('-')[0]) || 0 : 0,
        avatar_url: avatarUrl,
        profile_completed: true
      }

      console.log('📝 Dados do perfil que serão enviados:', profileData)

      // Usar upsert para inserir ou atualizar na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('❌ Erro ao salvar perfil:', profileError)
        toast.error('Erro ao salvar perfil: ' + profileError.message)
        return
      }

      // Atualizar metadados do usuário no auth.users para aparecer no dashboard do Supabase
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          // Dados básicos
          full_name: data.full_name,
          phone: data.phone,
          user_type: data.user_type,
          avatar_url: avatarUrl,
          onboarding_completed: true,
          
          // Dados pessoais completos
          bio: autoBio,
          cpf_cnpj: data.cpf_cnpj,
          birth_date: data.birth_date,
          gender: data.gender,
          
          // Dados de localização
          location_state: data.location_state,
          location_city: data.location_city,
          neighborhood: data.neighborhood,
          address: data.address,
          
          // Dados profissionais
          services_offered: selectedServices,
          experience_years: data.experience_years,
          professional_experience_years: data.experience_years ? parseInt(data.experience_years.split('-')[0]) || 0 : 0,
          
          // Dados de verificação
          email_verified: true,
          phone_verified: false
        }
      })

      if (userUpdateError) {
        console.warn('⚠️ Erro ao atualizar metadados do usuário:', userUpdateError)
        // Não falhar o processo, apenas avisar
      }

      console.log('✅ Perfil salvo com sucesso!')
      
      // Criar post de boas-vindas
      try {
        console.log('🎉 Criando post de boas-vindas...')
        const welcomeResult = await createWelcomePost(
          user.id,
          data.full_name,
          data.user_type
        )
        
        if (welcomeResult.success) {
          console.log('✅ Post de boas-vindas criado com sucesso!')
        } else {
          console.warn('⚠️ Erro ao criar post de boas-vindas:', welcomeResult.error)
        }
      } catch (welcomeError) {
        console.warn('⚠️ Erro ao criar post de boas-vindas:', welcomeError)
        // Não falhar o processo se o post de boas-vindas falhar
      }
      
      toast.success('🎉 Perfil completado com sucesso!')
      
      console.log('✅ Perfil salvo com sucesso!')
      
      // Recarregar o contexto de autenticação (agora também busca o perfil atualizado do banco)
      console.log('🔄 Atualizando contexto de autenticação...')
      await refreshAuth()
      
      console.log('✅ Contexto atualizado, redirecionando para feed...')
      
      // Aguardar um pouco para garantir que o contexto foi atualizado
      setTimeout(() => {
        router.push('/feed')
      }, 300)
      
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
    <LightModeLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Glassmorphism */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 flex items-center justify-center shadow-lg">
              <img 
                src="/imagens/logo/Confilarsemfundo.png" 
                alt="ConfiLar Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">ConfiLar</span>
          </div>
          
          <Button 
            onClick={() => router.push('/feed')}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 dark:text-white transition-colors flex items-center gap-2"
          >
            <Home size={16} />
            <span>Dashboard</span>
          </Button>
        </div>
      </header>

      {/* Main Content Glassmorphism */}
      <div className="container py-12 md:py-24">
        <div className="mx-auto max-w-md">
          {/* Header Card Glassmorphism */}
          <Card className="mb-8 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <currentStepData.icon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentStepData.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {currentStepData.description}
              </p>
            </CardContent>
          </Card>

          {/* Form Card Glassmorphism */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Container de Transição */}
                <div 
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    isTransitioning && slideDirection === 'right' && "transform translate-x-full opacity-0",
                    isTransitioning && slideDirection === 'left' && "transform -translate-x-full opacity-0",
                    !isTransitioning && "transform translate-x-0 opacity-100"
                  )}
                >
                  
                  {/* Etapa 1: Boas-vindas */}
                  {currentStep === 1 && (
                    <div className="text-center space-y-4 py-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Bem-vindo ao ConfiLar!
                        </h3>
                        <p className="text-gray-600 text-lg">
                          Seja bem-vindo! 🎉
                        </p>
                        <p className="text-gray-600">
                          Vamos completar seu perfil em algumas etapas simples. 
                          Isso nos ajudará a conectar você com as pessoas certas!
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                          <div className="flex items-center gap-3 text-blue-800">
                            <Shield className="w-5 h-5" />
                            <span className="font-semibold">Seus dados estão seguros</span>
                          </div>
                          <p className="text-blue-700 text-sm mt-2">
                            Todas as informações são protegidas e usadas apenas para melhorar sua experiência.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 2: Dados Pessoais */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
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
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Telefone <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phone"
                            placeholder="(11) 99999-9999"
                            {...register('phone')}
                            onChange={handlePhoneChange}
                            className={cn(
                              "h-10",
                              errors.phone ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                            )}
                          />
                          {errors.phone && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cpf_cnpj" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            CPF <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="cpf_cnpj"
                              placeholder="000.000.000-00"
                              {...register('cpf_cnpj')}
                              onChange={handleCPFChange}
                              className={cn(
                                "h-10 pr-10",
                                errors.cpf_cnpj ? 'border-red-400 focus:border-red-500' : 
                                cpfExists ? 'border-orange-500 focus:border-orange-500' :
                                'focus:border-blue-500'
                              )}
                            />
                            {isCheckingCpf && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <RefreshCw size={16} className="animate-spin text-blue-500" />
                              </div>
                            )}
                          </div>
                          
                          {/* Mensagens de validação */}
                          {errors.cpf_cnpj && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {errors.cpf_cnpj.message}
                            </p>
                          )}
                          
                          {cpfExists && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-sm text-orange-800 font-medium mb-2">
                                ⚠️ Este CPF/CNPJ já está cadastrado na plataforma
                              </p>
                              <p className="text-xs text-orange-700 mb-3">
                                Você já possui uma conta com este CPF/CNPJ. Escolha uma das opções abaixo:
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
                          
                          {watchedValues.cpf_cnpj && watchedValues.cpf_cnpj.replace(/\D/g, '').length === 11 && validateCPF(watchedValues.cpf_cnpj) && !errors.cpf_cnpj && !cpfExists && (
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              CPF válido e disponível
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birth_date" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Nascimento <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="birth_date"
                            type="date"
                            {...register('birth_date')}
                            className={cn(
                              "h-10",
                              errors.birth_date ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                            )}
                          />
                          {errors.birth_date && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Obrigatório
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Sexo <span className="text-red-500">*</span>
                          </Label>
                          <Select value={watchedValues.gender || ''} onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}>
                            <SelectTrigger className={cn(
                              "h-10",
                              errors.gender ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                            )}>
                              <SelectValue placeholder="Selecione seu sexo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Masculino</SelectItem>
                              <SelectItem value="female">Feminino</SelectItem>
                              <SelectItem value="other">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.gender && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {errors.gender.message}
                            </p>
                          )}
                          {watchedValues.gender && !errors.gender && (
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Sexo selecionado
                            </p>
                          )}
                        </div>

                      </div>

                      {/* Aceite dos Termos de Uso */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="accept_terms"
                            checked={watchedValues.accept_terms || false}
                            onCheckedChange={(checked) => setValue('accept_terms', !!checked)}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <Label 
                              htmlFor="accept_terms" 
                              className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1"
                            >
                              Aceito os <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-xs text-gray-600">
                              Ao marcar esta opção, você concorda com nossos{' '}
                              <a 
                                href="/termos" 
                                target="_blank"
                                className="text-blue-600 underline hover:text-blue-700 font-medium"
                              >
                                Termos de Uso
                              </a>{' '}
                              e{' '}
                              <a 
                                href="/privacidade" 
                                target="_blank"
                                className="text-blue-600 underline hover:text-blue-700 font-medium"
                              >
                                Política de Privacidade
                              </a>
                            </p>
                            {errors.accept_terms && (
                              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {errors.accept_terms.message}
                              </p>
                            )}
                            {watchedValues.accept_terms && !errors.accept_terms && (
                              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Termos aceitos
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 3: Avatar/Foto */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      {/* Preview do Avatar Selecionado */}
                      {selectedAvatar && (
                        <div className="flex items-center justify-center">
                          <div className="w-24 h-24 border-4 border-blue-300 rounded-full overflow-hidden shadow-lg">
                            <img
                              src={selectedAvatar.preview}
                              alt="Avatar selecionado"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Opções de Avatar */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload de Foto */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Upload size={16} className="text-blue-600" />
                            <span className="font-medium text-gray-700">Upload de Foto</span>
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
                              "block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center",
                              selectedAvatar?.type === 'upload' && "border-blue-500 bg-blue-50/50"
                            )}
                          >
                            <div className="font-medium text-gray-700">
                              {selectedAvatar?.type === 'upload' ? '✅ Foto Selecionada' : '📁 Escolher Arquivo'}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              JPG, PNG ou GIF
                            </div>
                          </label>
                        </div>

                        {/* Avatar Pixel-Art */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <RefreshCw size={16} className={cn("text-purple-600", isGeneratingAvatar && "animate-spin")} />
                            <span className="font-medium text-gray-700">Avatar Automático</span>
                          </div>
                          {fullName && fullName.length >= 2 ? (
                            <div className="space-y-3">
                              <button
                                type="button"
                                onClick={handleDicebearSelect}
                                disabled={isGeneratingAvatar || !dicebearAvatar}
                                className={cn(
                                  "w-full p-4 border-2 border-dashed rounded-lg transition-all text-center hover:border-purple-500 hover:bg-purple-50/50",
                                  selectedAvatar?.type === 'dicebear' && "border-purple-500 bg-purple-50/50",
                                  (isGeneratingAvatar || !dicebearAvatar) && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                {isGeneratingAvatar ? (
                                  <div className="font-medium text-gray-700">🎨 Criando...</div>
                                ) : dicebearAvatar ? (
                                  <div className="font-medium text-gray-700">✅ Avatar Criado</div>
                                ) : (
                                  <div className="font-medium text-gray-700">🎨 Criando...</div>
                                )}
                                <div className="text-sm text-gray-500 mt-1">
                                  Baseado no seu nome
                                </div>
                              </button>
                              
                              {/* Botão para gerar novo avatar aleatório */}
                              {dicebearAvatar && (
                                <button
                                  type="button"
                                  onClick={generateRandomAvatar}
                                  disabled={isGeneratingAvatar}
                                  className="w-full px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  <RefreshCw size={14} className={cn(isGeneratingAvatar && "animate-spin")} />
                                  {isGeneratingAvatar ? 'Gerando...' : 'Gerar Outro Avatar'}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
                              <div className="font-medium text-gray-500">Digite seu nome primeiro</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 4: Localização */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location_state" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Estado <span className="text-red-500">*</span>
                          </Label>
                          <Popover open={stateOpen} onOpenChange={setStateOpen}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  "w-full px-3 py-2 border rounded-lg bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between h-10",
                                  errors.location_state ? 'border-red-400' : 'border-gray-300'
                                )}
                              >
                                <span className="text-gray-900 dark:text-white">
                                  {watchedValues.location_state
                                    ? estadosBrasil.find((estado) => estado.sigla === watchedValues.location_state)?.nome
                                    : "Selecione o estado"}
                                </span>
                                <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Buscar estado..." />
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
                          {errors.location_state && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Obrigatório
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location_city" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Cidade <span className="text-red-500">*</span>
                          </Label>
                          <Popover open={cityOpen} onOpenChange={setCityOpen}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                disabled={!watchedValues.location_state}
                                className={cn(
                                  "w-full px-3 py-2 border rounded-lg bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between h-10",
                                  errors.location_city ? 'border-red-400' : 'border-gray-300',
                                  !watchedValues.location_state ? 'opacity-50 cursor-not-allowed' : ''
                                )}
                              >
                                <span className="text-gray-900 dark:text-white">
                                  {watchedValues.location_city
                                    ? watchedValues.location_city
                                    : watchedValues.location_state
                                    ? "Selecione a cidade"
                                    : "Selecione o estado primeiro"}
                                </span>
                                <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Buscar cidade..." />
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
                          {errors.location_city && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Obrigatório
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Bairro <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="neighborhood"
                            placeholder="Digite o bairro"
                            {...register('neighborhood')}
                            className={cn(
                              "h-10",
                              errors.neighborhood ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                            )}
                          />
                          {errors.neighborhood && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {errors.neighborhood.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Endereço <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="address"
                            placeholder="Ex: Rua das Flores, 123"
                            {...register('address')}
                            className={cn(
                              "h-10",
                              errors.address ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
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
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label htmlFor="user_type" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Como você pretende usar o ConfiLar? <span className="text-red-500">*</span>
                        </Label>
                        <Select value={watchedValues.user_type} onValueChange={(value) => setValue('user_type', value as 'client' | 'professional')}>
                          <SelectTrigger className={cn(
                            "h-12",
                            errors.user_type ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                          )}>
                            <SelectValue placeholder="Selecione uma opção" />
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🙋‍♂️</span>
                            <span className="font-semibold text-blue-900">Cliente</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            Você busca profissionais para resolver suas necessidades.
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">👨‍💼</span>
                            <span className="font-semibold text-green-900">Profissional</span>
                          </div>
                          <p className="text-sm text-green-700">
                            Você oferece serviços e quer ser encontrado por clientes.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 6: Dados Profissionais */}
                  {currentStep === 6 && isProfessional && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                            Biografia (Opcional)
                          </Label>
                          <Textarea
                            {...register('bio')}
                            placeholder="Conte um pouco sobre você..."
                            rows={3}
                            className="resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Anos de experiência
                            </Label>
                            <Select value={watchedValues.experience_years || ''} onValueChange={(value) => setValue('experience_years', value)}>
                              <SelectTrigger className="h-10">
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

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Serviços oferecidos (Opcional)
                            </Label>
                            <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 border rounded-lg bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between h-10"
                                >
                                  <span className="text-gray-900 dark:text-white">
                                    {selectedServices.length === 0
                                      ? "Selecione os serviços..."
                                      : `${selectedServices.length} serviço(s)`}
                                  </span>
                                  <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Buscar serviços..." />
                                  <CommandList>
                                    <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                                    <CommandGroup>
                                      {serviceCategoryNames.map((service) => (
                                        <CommandItem
                                          key={service}
                                          value={service}
                                          onSelect={() => handleServiceToggle(service)}
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
                          </div>
                        </div>
                        
                        {/* Serviços selecionados */}
                        {selectedServices.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Serviços selecionados:</p>
                            <div className="text-sm text-gray-600 leading-tight">
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
                    </div>
                  )}

                  {/* Etapa 6: Pular se for cliente */}
                  {currentStep === 6 && !isProfessional && (
                    <div className="text-center space-y-4 py-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                        <Check className="w-10 h-10 text-white" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Quase lá!
                        </h3>
                        <p className="text-gray-600 text-lg">
                          Como você é um Cliente, não precisamos de dados profissionais.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Etapa 7: Resumo Final */}
                  {currentStep === 7 && (
                    <div className="space-y-6">
                      {/* Toggle para mostrar/ocultar dados sensíveis */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Mostrar dados sensíveis</span>
                        <button
                          type="button"
                          onClick={() => setShowDataSummary(!showDataSummary)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          {showDataSummary ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showDataSummary ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>

                      {/* Resumo dos dados */}
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">📋 Resumo do seu perfil:</h4>
                        <div className="space-y-3 text-sm text-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p><strong>Nome:</strong> {watchedValues.full_name || 'Não informado'}</p>
                              <p><strong>Telefone:</strong> {showDataSummary ? (watchedValues.phone || 'Não informado') : '***-****'}</p>
                              <p><strong>CPF:</strong> {showDataSummary ? (watchedValues.cpf_cnpj || 'Não informado') : '***.***.***-**'}</p>
                            </div>
                            <div>
                              <p><strong>Nascimento:</strong> {showDataSummary ? (watchedValues.birth_date || 'Não informado') : '**/**/****'}</p>
                              <p><strong>Sexo:</strong> {watchedValues.gender === 'male' ? '👨 Masculino' : watchedValues.gender === 'female' ? '👩 Feminino' : watchedValues.gender === 'other' ? '🏳️‍⚧️ Outros' : 'Não informado'}</p>
                              <p><strong>Tipo:</strong> {watchedValues.user_type === 'professional' ? '👨‍💼 Profissional' : watchedValues.user_type === 'client' ? '🙋‍♂️ Cliente' : 'Não informado'}</p>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-300 pt-3 mt-3">
                            <p><strong>Estado:</strong> {watchedValues.location_state ? estadosBrasil.find(e => e.sigla === watchedValues.location_state)?.nome : 'Não informado'}</p>
                            <p><strong>Cidade:</strong> {watchedValues.location_city || 'Não informado'}</p>
                            <p><strong>Bairro:</strong> {watchedValues.neighborhood || 'Não informado'}</p>
                            <p><strong>Endereço:</strong> {showDataSummary ? (watchedValues.address || 'Não informado') : 'Oculto'}</p>
                          </div>
                          
                          {selectedAvatar && (
                            <div className="border-t border-gray-300 pt-3 mt-3">
                              <p><strong>Avatar:</strong> {selectedAvatar.type === 'upload' ? '📸 Foto personalizada' : '🎨 Avatar gerado'}</p>
                            </div>
                          )}
                          
                          {isProfessional && (
                            <div className="border-t border-gray-300 pt-3 mt-3">
                              {watchedValues.experience_years && (
                                <p><strong>Experiência:</strong> {watchedValues.experience_years}</p>
                              )}
                               {selectedServices.length > 0 && (
                                 <p><strong>Serviços:</strong> {selectedServices.length} selecionado(s)</p>
                               )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Aviso final */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 text-green-800 mb-2">
                          <Shield className="w-5 h-5" />
                          <span className="font-semibold">Tudo pronto!</span>
                        </div>
                        <p className="text-green-700 text-sm">
                          Seus dados estão corretos? Clique em "Finalizar" para completar seu cadastro.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className={cn(
                  "flex pt-6 border-t border-gray-200",
                  currentStep === 1 ? "justify-end" : "justify-between items-center"
                )}>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={isTransitioning}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                  )}

                  <div className="flex items-center gap-3">
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={isTransitioning}
                        className={cn(
                          "flex items-center gap-2",
                          !isStepValid && currentStep > 1 && currentStep < totalSteps 
                            ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" 
                            : "bg-blue-600 hover:bg-blue-700"
                        )}
                      >
                        {currentStep === 2 && (cpfExists || !watchedValues.accept_terms) ? 'Resolva os problemas acima' : 'Próximo'}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        disabled={isLoading || !isValid}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Finalizando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Finalizar Cadastro
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </form>

            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </LightModeLayout>
  )
}