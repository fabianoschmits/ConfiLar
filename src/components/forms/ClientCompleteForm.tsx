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
  Shield,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FileImage,
  Smartphone,
  Home,
  Building
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'

// Schema de validação para cadastro completo de clientes
const clientCompleteSchema = z.object({
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
  message: 'Cliente deve ter pelo menos 18 anos',
  path: ['birth_date']
})

type ClientCompleteFormData = z.infer<typeof clientCompleteSchema>

// Dados estáticos removidos - agora usando API do IBGE

interface ClientCompleteFormProps {
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
  onComplete: (data: ClientCompleteFormData) => void
}

export function ClientCompleteForm({ basicData, onComplete }: ClientCompleteFormProps) {
  const { profile, updateProfile } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedState, setSelectedState] = useState('')
  const [cidadeInput, setCidadeInput] = useState('')

  // Refs para upload de arquivos
  const profilePhotoRef = useRef<HTMLInputElement>(null)
  const residenceProofRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<ClientCompleteFormData>({
    resolver: zodResolver(clientCompleteSchema),
    mode: 'onChange'
  })

  const watchedValues = watch()

  const handleNextStep = async () => {
    const isStepValid = await trigger()
    if (isStepValid) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleFileUpload = (field: keyof ClientCompleteFormData, file: File) => {
    setValue(field, file)
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

  const onSubmit = async (data: ClientCompleteFormData) => {
    setIsLoading(true)
    try {
      // Atualizar perfil com dados completos
      const updatedProfile = {
        ...profile,
        full_name: data.full_name,
        phone: data.phone,
        location_state: data.location_state,
        location_city: data.location_city,
        address: `${data.location_city}, ${data.location_state}`,
        cpf_cnpj: data.cpf,
        birth_date: data.birth_date,
        neighborhood: data.neighborhood,
        profile_completed: true,
        // Campos específicos para clientes
        client_verification_document: data.residence_proof ? 'uploaded' : null
      }

      const result = await updateProfile(updatedProfile)
      
      if (!result.error) {
        // Chamar callback para finalizar cadastro
        onComplete(data)
      } else {
        alert('Erro ao atualizar perfil: ' + result.error?.message)
      }
    } catch (error) {
      alert('Erro inesperado: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStepProgress = () => {
    return (currentStep / 3) * 100
  }

  // Função removida - usando API do IBGE

  return (
    <div className="max-w-3xl mx-auto">
      {/* Barra de Progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Etapa {currentStep} de 3
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
                Informações de localização para clientes encontrarem você
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
                    setValue('location_city', '')
                    setCidadeInput('')
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
                  value={cidadeInput}
                  onValueChange={(value) => {
                    setCidadeInput(value)
                    setValue('location_city', value)
                  }}
                  estadoSigla={selectedState}
                  placeholder="Selecione a cidade"
                  disabled={!selectedState}
                />
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
                  placeholder="Digite o bairro"
                  className={errors.neighborhood ? 'border-red-500' : ''}
                />
                {errors.neighborhood && (
                  <p className="text-sm text-red-500 mt-1">{errors.neighborhood.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Documentos e Finalização */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Documentos e Finalização</span>
              </CardTitle>
              <CardDescription>
                Upload de documentos opcionais para aumentar a confiança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto de Perfil (Opcional) */}
              <div>
                <Label htmlFor="profile_photo">Foto de Perfil</Label>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="text-blue-600 font-medium">Opcional:</span> Ajuda os profissionais a te reconhecerem
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
                      PNG, JPG até 5MB. Foto clara e atual.
                    </p>
                  </button>
                </div>
              </div>

              {/* Comprovante de Residência (Opcional mas recomendado) */}
              <div>
                <Label htmlFor="residence_proof">Comprovante de Residência</Label>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="text-orange-600 font-medium">Forte recomendação:</span> Aumenta a confiança dos profissionais
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
                  
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700">Endereço Completo</p>
                    <p className="text-sm text-gray-900">
                      {watchedValues.location_city}, {watchedValues.location_state}
                      <br />
                      {watchedValues.neighborhood}
                    </p>
                  </div>
                </div>

                {/* Documentos */}
                <div>
                  <p className="text-sm font-medium text-gray-700">Documentos</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {watchedValues.profile_photo ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">Foto de perfil</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {watchedValues.residence_proof ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">Comprovante de residência</span>
                  </div>
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
                      Seus dados serão tratados com segurança e confidencialidade.
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
          
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!isValid || isLoading}
              className="ml-auto"
            >
              Próxima Etapa
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!isValid || isLoading}
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
