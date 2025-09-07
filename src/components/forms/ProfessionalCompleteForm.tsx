'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Camera, 
  Upload, 
  X, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard,
  Calendar,
  Briefcase,
  Shield,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FileImage,
  Smartphone
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'

// Schema de validação para cadastro completo de profissionais
const professionalCompleteSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  location_state: z.string().min(1, 'Estado é obrigatório'),
  location_city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  bio: z.string().min(20, 'Bio deve ter pelo menos 20 caracteres'),
  // Campos obrigatórios
  profile_photo: z.instanceof(File, { message: 'Foto de perfil é obrigatória' }),
  // Campos opcionais para melhor classificação
  selfie_document: z.instanceof(File).optional(),
  residence_proof: z.instanceof(File).optional(),
  // Serviços oferecidos
  services_offered: z.array(z.string()).min(1, 'Selecione pelo menos um serviço'),
  // Validação de idade
}).refine((data) => {
  const birthDate = new Date(data.birth_date)
  const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age >= 18
}, {
  message: 'Profissional deve ter pelo menos 18 anos',
  path: ['birth_date']
})

type ProfessionalCompleteFormData = z.infer<typeof professionalCompleteSchema>

// Dados estáticos removidos - agora usando API do IBGE

import { services } from '@/data/services'

interface ProfessionalCompleteFormProps {
  basicData: {
    full_name: string
    email: string
    phone: string
    cpf_cnpj: string
    birth_date: string
    location_state: string
    location_city: string
    neighborhood: string
  } | null
  onComplete: (data: ProfessionalCompleteFormData) => void
}

export function ProfessionalCompleteForm({ basicData, onComplete }: ProfessionalCompleteFormProps) {
  const { profile, updateProfile } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedState, setSelectedState] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  
  // Refs para upload de arquivos
  const profilePhotoRef = useRef<HTMLInputElement>(null)
  const selfieDocumentRef = useRef<HTMLInputElement>(null)
  const residenceProofRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<ProfessionalCompleteFormData>({
    resolver: zodResolver(professionalCompleteSchema),
    mode: 'onChange'
  })

  const watchedValues = watch()

  const handleNextStep = async () => {
    console.log('Tentando avançar para próxima etapa...')
    console.log('Etapa atual:', currentStep)
    console.log('Valores atuais:', watchedValues)
    console.log('Serviços selecionados:', selectedServices)
    
    let isStepValid = false
    
    // Validar apenas os campos da etapa atual
    if (currentStep === 1) {
      console.log('Validando etapa 1...')
      isStepValid = await trigger(['full_name', 'cpf', 'phone', 'email', 'birth_date'])
      console.log('Validação etapa 1:', isStepValid)
    } else if (currentStep === 2) {
      console.log('Validando etapa 2...')
      isStepValid = await trigger(['location_state', 'location_city', 'neighborhood', 'bio'])
      console.log('Validação etapa 2:', isStepValid)
    } else if (currentStep === 3) {
      console.log('Validando etapa 3...')
      
      // Verificar se os arquivos obrigatórios foram enviados
      const hasProfilePhoto = watchedValues.profile_photo instanceof File
      
      if (!hasProfilePhoto) {
        console.log('Foto de perfil não enviada')
        alert('É obrigatório enviar a foto de perfil para continuar')
        return
      }
      
      // Verificar se pelo menos um serviço foi selecionado (obrigatório)
      if (selectedServices.length === 0) {
        console.log('Nenhum serviço selecionado - obrigatório')
        alert('É obrigatório selecionar pelo menos um serviço para continuar')
        return
      }
      
      // Verificar se os serviços estão no formData
      if (!selectedServices || selectedServices.length === 0) {
        console.log('Serviços não estão no formData - sincronizando')
        setValue('services_offered', selectedServices)
      }
      
      isStepValid = true
      console.log('Validação etapa 3:', isStepValid)
    }
    
    // Se a validação passou, avançar para próxima etapa
    if (isStepValid) {
      console.log('Validação passou, avançando para etapa', currentStep + 1)
      setCurrentStep(prev => prev + 1)
    } else {
      // Mostrar mensagem de erro se a validação falhou
      console.log('Erros de validação:', errors)
      console.log('Formulário válido:', isValid)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleFileUpload = (field: keyof ProfessionalCompleteFormData, file: File) => {
    setValue(field, file)
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      const newServices = prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
      
      // Atualizar o valor do formulário com os novos serviços
      setValue('services_offered', newServices)
      return newServices
    })
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setValue('cpf', formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue('phone', formatted)
  }

  const onSubmit = async (data: ProfessionalCompleteFormData) => {
    console.log('🚀 Iniciando envio do formulário...')
    console.log('📋 Dados recebidos:', data)
    console.log('🔍 Erros de validação:', errors)
    console.log('✅ Formulário válido:', isValid)
    
    setIsLoading(true)
    try {
      // Atualizar perfil com dados completos
      const updatedProfile = {
        ...profile,
        full_name: data.full_name,
        phone: data.phone,
        bio: data.bio,
        location_state: data.location_state,
        location_city: data.location_city,
        address: data.neighborhood,
        cpf_cnpj: data.cpf,
        birth_date: data.birth_date,
        neighborhood: data.neighborhood,
        profile_completed: true,
        // Campos específicos para profissionais
        professional_services: selectedServices, // Usar selectedServices diretamente
        professional_experience_years: 0, // Será preenchido posteriormente
        professional_certifications: [],
        professional_portfolio_url: null
      }

      console.log('📝 Perfil atualizado:', updatedProfile)
      const result = await updateProfile(updatedProfile)

      if (!result.error) {
        console.log('✅ Perfil atualizado com sucesso!')
        // Chamar callback para finalizar cadastro
        onComplete(data)
      } else {
        console.error('❌ Erro ao atualizar perfil:', result.error)
        alert('Erro ao atualizar perfil: ' + result.error?.message)
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error)
      alert('Erro inesperado: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStepProgress = () => {
    return (currentStep / 4) * 100
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Barra de Progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Etapa {currentStep} de 4
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(getStepProgress())}% completo
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Etapa 1: Informações Pessoais */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações Pessoais</span>
              </CardTitle>
              <CardDescription>
                Dados pessoais para identificação e contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome Completo */}
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="Digite seu nome completo"
                  defaultValue={basicData?.full_name || ''}
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
                )}
              </div>

              {/* CPF */}
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  onChange={handleCPFChange}
                  className={errors.cpf ? 'border-red-500' : ''}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500 mt-1">{errors.cpf.message}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(00) 00000-0000"
                  onChange={handlePhoneChange}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* E-mail */}
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  defaultValue={basicData?.email || ''}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Data de Nascimento */}
              <div>
                <Label htmlFor="birth_date">Data de Nascimento *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  {...register('birth_date')}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.birth_date ? 'border-red-500' : ''}
                />
                {errors.birth_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.birth_date.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Deve ter pelo menos 18 anos
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Localização */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Localização</span>
              </CardTitle>
              <CardDescription>
                Informações de localização para busca de clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estado */}
              <div>
                <Label htmlFor="location_state">Estado *</Label>
                <EstadoCombobox
                  value={selectedState}
                  onValueChange={(value) => {
                    setSelectedState(value)
                    setValue('location_state', value)
                    // Limpar cidade quando estado muda
                    setValue('location_city', '')
                  }}
                  placeholder="Selecione o estado"
                />
                {errors.location_state && (
                  <p className="text-sm text-red-500 mt-1">{errors.location_state.message}</p>
                )}
              </div>

              {/* Cidade */}
              <div>
                <Label htmlFor="location_city">Cidade *</Label>
                <CidadeCombobox
                  value={watchedValues.location_city || ''}
                  onValueChange={(value) => setValue('location_city', value)}
                  estadoSigla={selectedState}
                  placeholder="Selecione a cidade"
                  disabled={!selectedState}
                />
                {!selectedState && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selecione um estado primeiro para ver as cidades disponíveis
                  </p>
                )}
                {errors.location_city && (
                  <p className="text-sm text-red-500 mt-1">{errors.location_city.message}</p>
                )}
              </div>

              {/* Bairro */}
              <div>
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  {...register('neighborhood')}
                  placeholder="Digite seu bairro"
                  className={errors.neighborhood ? 'border-red-500' : ''}
                />
                {errors.neighborhood && (
                  <p className="text-sm text-red-500 mt-1">{errors.neighborhood.message}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Biografia *</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Conte um pouco sobre você, sua experiência e especialidades..."
                  rows={4}
                  className={errors.bio ? 'border-red-500' : ''}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 20 caracteres. Seja específico sobre suas habilidades.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Serviços e Documentos */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Serviços e Documentos</span>
              </CardTitle>
              <CardDescription>
                Selecione os serviços que você oferece e faça upload dos documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Serviços Oferecidos */}
              <div>
                <Label>Serviços Oferecidos *</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Selecione todos os serviços que você oferece:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <Label htmlFor={service.id} className="text-sm cursor-pointer">
                        <span className="mr-2">{service.icon}</span>
                        {service.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.services_offered && (
                  <p className="text-sm text-red-500 mt-1">{errors.services_offered.message}</p>
                )}
                {selectedServices.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    ❌ É obrigatório selecionar pelo menos um serviço para continuar
                  </p>
                )}
                {selectedServices.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ {selectedServices.length} serviço(s) selecionado(s)
                  </p>
                )}
              </div>

              {/* Foto de Perfil */}
              <div>
                <Label htmlFor="profile_photo">Foto de Perfil *</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Foto clara e profissional para seu perfil
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={profilePhotoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('profile_photo', file)
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => profilePhotoRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Clique para fazer upload da foto de perfil
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG até 5MB. Foto clara e profissional.
                    </p>
                  </button>
                </div>
                {errors.profile_photo && (
                  <p className="text-sm text-red-500 mt-1">{errors.profile_photo.message}</p>
                )}
                {!watchedValues.profile_photo && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Foto de perfil é obrigatória para continuar
                  </p>
                )}
                {watchedValues.profile_photo && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Foto de perfil enviada: {watchedValues.profile_photo.name}
                  </p>
                )}
              </div>

              {/* Selfie com Documento */}
              <div>
                <Label htmlFor="selfie_document">Selfie com Documento</Label>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="text-orange-600 font-medium">Forte recomendação:</span> Aumenta a confiança dos clientes
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={selfieDocumentRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('selfie_document', file)
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => selfieDocumentRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Clique para fazer upload da selfie com documento
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG até 5MB. Sua foto segurando RG ou CPF.
                    </p>
                  </button>
                </div>
                {errors.selfie_document && (
                  <p className="text-sm text-red-500 mt-1">{errors.selfie_document.message}</p>
                )}
                {!watchedValues.selfie_document && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Selfie com documento é opcional, mas aumenta a confiança dos clientes
                  </p>
                )}
                {watchedValues.selfie_document && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Selfie com documento enviada: {watchedValues.selfie_document.name}
                  </p>
                )}
              </div>

              {/* Comprovante de Residência (Opcional) */}
              <div>
                <Label htmlFor="residence_proof">Comprovante de Residência</Label>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="text-orange-600 font-medium">Forte recomendação:</span> Aumenta a confiança dos clientes
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={residenceProofRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('residence_proof', file)
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => residenceProofRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Clique para fazer upload do comprovante
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF ou imagem. Conta de luz, água, telefone, etc.
                    </p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 4: Revisão e Confirmação */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Revisão e Confirmação</span>
              </CardTitle>
              <CardDescription>
                Revise todas as informações antes de finalizar o cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumo das Informações */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Resumo do Cadastro</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nome Completo</p>
                    <p className="text-sm text-gray-900">{watchedValues.full_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">CPF</p>
                    <p className="text-sm text-gray-900">{watchedValues.cpf}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Telefone</p>
                    <p className="text-sm text-gray-900">{watchedValues.phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">E-mail</p>
                    <p className="text-sm text-gray-900">{watchedValues.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Data de Nascimento</p>
                    <p className="text-sm text-gray-900">{watchedValues.birth_date}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Localização</p>
                    <p className="text-sm text-gray-900">
                      {watchedValues.neighborhood}, {watchedValues.location_city} - {watchedValues.location_state}
                    </p>
                  </div>
                </div>

                {/* Serviços Selecionados */}
                <div>
                  <p className="text-sm font-medium text-gray-700">Serviços Oferecidos</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedServices.map((serviceId) => {
                      const service = services.find(s => s.id === serviceId)
                      return service ? (
                        <Badge key={serviceId} variant="secondary">
                          {service.icon} {service.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Documentos */}
                <div>
                  <p className="text-sm font-medium text-gray-700">Documentos</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Foto de perfil (obrigatório)</span>
                  </div>
                  {watchedValues.selfie_document ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Selfie com documento (opcional)</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 mt-1">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Selfie com documento (opcional - não enviado)</span>
                    </div>
                  )}
                  {watchedValues.residence_proof ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Comprovante de residência (opcional)</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 mt-1">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Comprovante de residência (opcional - não enviado)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Termos e Condições */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Termos e Condições
                    </p>
                    <p className="text-xs text-blue-800 mt-1">
                      Ao finalizar o cadastro, você concorda com nossos termos de uso e política de privacidade. 
                      Seus dados serão verificados para garantir a segurança da plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navegação entre etapas */}
        <div className="flex justify-between">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={isLoading}
            >
              Voltar
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isLoading}
              className="ml-auto"
            >
              Próxima Etapa
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="ml-auto"
            >
              {isLoading ? 'Finalizando Cadastro...' : 'Finalizar Cadastro'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
