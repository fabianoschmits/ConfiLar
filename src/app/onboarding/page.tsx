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
import { cn } from '@/lib/utils'
import { Check, ChevronDown, X, Upload, RefreshCw } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { estadosBrasil, getCidadesByEstado } from '@/data/brazilianLocations'
import { services } from '@/data/services'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Função para validar CPF com validação rigorosa
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
  insurance_coverage: z.boolean().optional(),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

type AvatarType = 'upload' | 'dicebear'
type AvatarSelection = {
  type: AvatarType
  value: string | File
  preview?: string
}

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [stateOpen, setStateOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarSelection | null>(null)
  const [dicebearAvatar, setDicebearAvatar] = useState<string>('')
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const { user, completeProfile } = useAuthContext()
  const router = useRouter()

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
      insurance_coverage: false,
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
    if (!name || name.length < 2) return
    
    setIsGeneratingAvatar(true)
    try {
      const encodedName = encodeURIComponent(name.trim())
      
      // URL com parâmetros básicos para pixel art
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodedName}&backgroundColor=transparent`
      
      console.log('🎨 Gerando avatar para:', name)
      console.log('🔗 URL do avatar:', avatarUrl)
      
      // Testar se a URL é válida
      const response = await fetch(avatarUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Verificar se o conteúdo é válido (SVG)
      const content = await response.text()
      if (!content || content.includes('error') || !content.includes('<svg')) {
        throw new Error('Conteúdo SVG inválido retornado')
      }
      
      setDicebearAvatar(avatarUrl)
      console.log('✅ Avatar gerado com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro ao gerar avatar Dicebear:', error)
      
      // Fallback: usar avatar básico
      try {
        const fallbackUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name.trim())}`
        console.log('🔄 Usando fallback:', fallbackUrl)
        
        const fallbackResponse = await fetch(fallbackUrl)
        if (fallbackResponse.ok) {
          const fallbackContent = await fallbackResponse.text()
          if (fallbackContent && fallbackContent.includes('<svg')) {
            setDicebearAvatar(fallbackUrl)
            console.log('✅ Fallback funcionou!')
          } else {
            throw new Error('Fallback também retornou conteúdo inválido')
          }
        } else {
          throw new Error('Fallback falhou')
        }
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError)
        // Se tudo falhar, não definir avatar
      }
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

  // Formatação automática para telefone
  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '')
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

  // Gerar avatar quando o nome estiver disponível (tempo real)
  useEffect(() => {
    if (fullName && fullName.length >= 2) {
      generateDicebearAvatar(fullName, 'male')
    }
  }, [fullName])

  // Gerar avatar em tempo real baseado no nome digitado (com debounce)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const subscription = watch((value, { name }) => {
      if (name === 'full_name' && value.full_name && value.full_name.length >= 2) {
        // Debounce de 500ms para evitar muitas chamadas
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

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true)
    try {
      // Preparar dados do avatar
      let avatarData = null
      if (selectedAvatar) {
        if (selectedAvatar.type === 'upload') {
          avatarData = {
            type: 'upload',
            file: selectedAvatar.value as File,
            preview: selectedAvatar.preview
          }
        } else if (selectedAvatar.type === 'dicebear') {
          avatarData = {
            type: 'dicebear',
            url: selectedAvatar.value as string,
            preview: selectedAvatar.preview
          }
        }
      }

      // Log dos dados que serão enviados
      const profileData = {
        full_name: data.full_name,
        phone: data.phone,
        cpf_cnpj: data.cpf_cnpj,
        birth_date: data.birth_date || '',
        location_state: data.location_state || '',
        location_city: data.location_city || '',
        neighborhood: data.neighborhood || '',
        address: data.address || '',
        bio: data.bio || '',
        services_offered: selectedServices || [],
        experience_years: data.experience_years || '',
        emergency_service: data.emergency_service || false,
        insurance_coverage: data.insurance_coverage || false,
        gender: data.gender || 'male',
        user_type: data.user_type,
        avatar_data: avatarData,
      }
      
      console.log('📝 Dados do perfil que serão enviados:', profileData)
      
      const { error } = await completeProfile(profileData)

      if (error) {
        console.error('❌ Erro detalhado:', error)
        toast.error(`Erro ao completar perfil: ${error.message}`)
        setIsLoading(false)
        return
      }

      toast.success('🎉 Perfil completado com sucesso!')
      router.push('/feed')
    } catch (error) {
      console.error('Erro no onboarding:', error)
      toast.error('Erro inesperado ao completar perfil')
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto animate-pulse"></div>
          <p className="text-gray-600 font-medium mt-2">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ConfiLar</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12 md:py-24">
        <div className="mx-auto max-w-2xl">
          {/* Header Card */}
          <Card className="mb-8 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Complete seu perfil
              </CardTitle>
              <p className="text-gray-600">
                Olá, {fullName}! Agora vamos completar seu perfil para você começar a usar o ConfiLar.
              </p>
            </CardHeader>
          </Card>

          {/* Onboarding Form */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Foto/Imagem */}
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
                              <div className="text-sm text-gray-700 font-medium">Gerando...</div>
                            )}
                          </button>
                        ) : (
                          <div className="w-full p-3 border border-gray-300 rounded-lg text-center bg-gray-50">
                            <div className="text-sm text-gray-500 font-medium">Gerando...</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dados Pessoais */}
                <div className="space-y-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Dados Pessoais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                        Nome completo *
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
                    </div>

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
                                      setValue('location_city', '')
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
                    </div>

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

                {/* Botão de finalizar */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    disabled={isLoading || !isValid}
                  >
                    {isLoading ? 'Finalizando...' : 'Finalizar cadastro'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
