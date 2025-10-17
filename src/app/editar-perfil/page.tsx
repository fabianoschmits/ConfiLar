'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Check, ChevronDown, X, Upload, RefreshCw, User, MapPin, Briefcase, 
  Camera, Save, Shield, Home, Edit3, Phone, Calendar, FileText
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { estadosBrasil, getCidadesByEstado } from '@/data/brazilianLocations'
import { services } from '@/data/services'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { getBioOrDefault } from '@/utils/autoBioGenerator'
import Image from 'next/image'

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

const profileSchema = z.object({
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
  user_type: z.enum(['client', 'professional']),
  location_state: z.string().min(1, 'Estado é obrigatório'),
  location_city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  bio: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
  experience_years: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

type AvatarType = 'upload' | 'dicebear'
type AvatarSelection = {
  type: AvatarType
  value: string | File
  preview?: string
}

export default function EditarPerfilPage() {
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      user_type: 'client' as const,
    },
  })

  const watchedValues = watch()
  const isProfessional = watchedValues.user_type === 'professional'
  const fullName = watchedValues.full_name || (user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name || 'Usuário'

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
          toast.error('Erro ao carregar dados do perfil')
          return
        }

        if (profile) {
          // Preencher formulário com dados existentes
          setValue('full_name', profile.full_name || '')
          setValue('phone', profile.phone || '')
          setValue('cpf_cnpj', profile.cpf_cnpj || '')
          setValue('birth_date', profile.birth_date || '')
          setValue('user_type', profile.user_type || 'client')
          setValue('location_state', profile.location_state || '')
          setValue('location_city', profile.location_city || '')
          setValue('neighborhood', profile.neighborhood || '')
          setValue('address', profile.address || '')
          setValue('bio', profile.bio || '')
          setValue('experience_years', profile.professional_experience_years ? `${profile.professional_experience_years}-${profile.professional_experience_years + 2}` : '')
          
          if (profile.professional_services) {
            setSelectedServices(profile.professional_services)
            setValue('services_offered', profile.professional_services)
          }

          if (profile.avatar_url) {
            setSelectedAvatar({
              type: 'dicebear',
              value: profile.avatar_url,
              preview: profile.avatar_url
            })
          }
        }
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

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsLoading(true)
    
    try {
      let avatarUrl = null

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

      const profileData = {
        id: user.id,
        email: user.email,
        full_name: data.full_name,
        phone: data.phone,
        cpf_cnpj: data.cpf_cnpj,
        birth_date: data.birth_date,
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

      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          // Dados básicos
          full_name: data.full_name,
          phone: data.phone,
          user_type: data.user_type,
          avatar_url: avatarUrl,
          profile_completed: true,
          
          // Dados pessoais completos
          bio: autoBio,
          cpf_cnpj: data.cpf_cnpj,
          birth_date: data.birth_date,
          
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
      }

      console.log('✅ Perfil salvo com sucesso!')
      toast.success('🎉 Perfil atualizado com sucesso!')
      
      router.push('/feed')
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro inesperado ao atualizar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white h-6 w-6" />
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

      {/* Main Content */}
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Perfil</h1>
                <p className="text-gray-600">Atualize suas informações pessoais</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Avatar/Foto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-600" />
                  Foto de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview do Avatar Selecionado */}
                {selectedAvatar && (
                  <div className="flex items-center justify-center">
                    <div className="w-20 h-20 border-4 border-blue-300 rounded-full overflow-hidden shadow-lg">
                      <Image
                        src={selectedAvatar.preview}
                        alt="Avatar selecionado"
                        width={80}
                        height={80}
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
                      Nascimento <span className="text-red-500">*</span>
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
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location_state" className="text-sm font-medium text-gray-700">
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
                    <Label htmlFor="location_city" className="text-sm font-medium text-gray-700">
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
                    <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">
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
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
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
              </CardContent>
            </Card>

            {/* Tipo de Usuário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Tipo de Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="user_type" className="text-sm font-medium text-gray-700">
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
              </CardContent>
            </Card>

            {/* Biografia - Disponível para todos */}
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

            {/* Dados Profissionais */}
            {isProfessional && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                    Dados Profissionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

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
                </CardContent>
              </Card>
            )}

            {/* Botão de Salvar */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
