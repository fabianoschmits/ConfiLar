'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar, User, Mail, Phone, MapPin, CreditCard, CalendarDays } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'

// Schema de validação para cadastro básico
const basicRegistrationSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirm_password: z.string(),
  user_type: z.enum(['client', 'professional']),
  phone: z.string().refine((value) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.length >= 10 && numbers.length <= 11
  }, 'Telefone deve ter 10 ou 11 dígitos'),
  cpf_cnpj: z.string().refine((value) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.length === 11 || numbers.length === 14
  }, 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  location_state: z.string().min(1, 'Estado é obrigatório'),
  location_city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório')
}).refine((data) => data.password === data.confirm_password, {
  message: 'Senhas não coincidem',
  path: ['confirm_password']
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
  message: 'Usuário deve ter pelo menos 18 anos',
  path: ['birth_date']
})

type BasicRegistrationFormData = z.infer<typeof basicRegistrationSchema>

// Dados estáticos removidos - agora usando API do IBGE

interface BasicRegistrationFormProps {
  onComplete: (data: BasicRegistrationFormData) => void
}

export function BasicRegistrationForm({ onComplete }: BasicRegistrationFormProps) {
  const { signUp } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedState, setSelectedState] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<BasicRegistrationFormData>({
    resolver: zodResolver(basicRegistrationSchema),
    mode: 'onChange'
  })

  const watchedValues = watch()

  const handleNextStep = async () => {
    console.log('Tentando avançar para próxima etapa...')
    console.log('Etapa atual:', currentStep)
    console.log('Valores atuais:', watchedValues)
    
    let isStepValid = false
    
    // Validar apenas os campos da etapa atual
    if (currentStep === 1) {
      console.log('Validando etapa 1...')
      isStepValid = await trigger(['full_name', 'email', 'password', 'confirm_password', 'user_type'])
      console.log('Validação etapa 1:', isStepValid)
    } else if (currentStep === 2) {
      console.log('Validando etapa 2...')
      isStepValid = await trigger(['cpf_cnpj', 'phone', 'birth_date'])
      console.log('Validação etapa 2:', isStepValid)
    } else if (currentStep === 3) {
      console.log('Validando etapa 3...')
      isStepValid = await trigger(['location_state', 'location_city', 'neighborhood'])
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

  const onSubmit = async (data: BasicRegistrationFormData) => {
    setIsLoading(true)
    try {
      // Criar conta básica com dados adicionais
      const result = await signUp(
        data.email, 
        data.password, 
        {
          full_name: data.full_name,
          user_type: data.user_type,
          phone: data.phone,
          cpf_cnpj: data.cpf_cnpj,
          birth_date: data.birth_date,
          location_state: data.location_state,
          location_city: data.location_city,
          neighborhood: data.neighborhood
        }
      )
      
      if (!result.error) {
        // Chamar callback para continuar com cadastro completo
        onComplete(data)
      } else {
        alert('Erro ao criar conta: ' + result.error?.message)
      }
    } catch (error) {
      alert('Erro inesperado: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      // Formatação de CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numbers.length <= 14) {
      // Formatação de CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
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
    setValue('cpf_cnpj', formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue('phone', formatted)
  }

  const getStepProgress = () => {
    return (currentStep / 3) * 100
  }

  return (
    <div className="max-w-2xl mx-auto">
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
        {/* Etapa 1: Informações Básicas */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações Básicas</span>
              </CardTitle>
              <CardDescription>
                Comece criando sua conta com informações essenciais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome Completo */}
              <div>
                <Label htmlFor="full_name">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="Digite seu nome completo"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
                )}
              </div>

              {/* E-mail */}
              <div>
                <Label htmlFor="email">
                  E-mail <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <Label htmlFor="password">
                  Senha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Mínimo 6 caracteres"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <Label htmlFor="confirm_password">
                  Confirmar Senha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...register('confirm_password')}
                  placeholder="Confirme sua senha"
                  className={errors.confirm_password ? 'border-red-500' : ''}
                />
                {errors.confirm_password && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirm_password.message}</p>
                )}
              </div>

              {/* Tipo de Usuário */}
              <div>
                <Label>
                  Tipo de Usuário <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={watchedValues.user_type}
                  onValueChange={(value) => setValue('user_type', value as 'client' | 'professional')}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client">Cliente (Contratante)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="professional" />
                    <Label htmlFor="professional">Profissional</Label>
                  </div>
                </RadioGroup>
                {errors.user_type && (
                  <p className="text-sm text-red-500 mt-1">{errors.user_type.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Informações Pessoais */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Informações Pessoais</span>
              </CardTitle>
              <CardDescription>
                Dados para verificação de identidade e contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CPF/CNPJ */}
              <div>
                <Label htmlFor="cpf_cnpj">
                  {watchedValues.user_type === 'professional' ? 'CNPJ' : 'CPF'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cpf_cnpj"
                  {...register('cpf_cnpj')}
                  placeholder={watchedValues.user_type === 'professional' ? '00.000.000/0000-00' : '000.000.000-00'}
                  onChange={handleCPFChange}
                  className={errors.cpf_cnpj ? 'border-red-500' : ''}
                />
                {errors.cpf_cnpj && (
                  <p className="text-sm text-red-500 mt-1">{errors.cpf_cnpj.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {watchedValues.user_type === 'professional' 
                    ? 'Digite apenas os números do CNPJ' 
                    : 'Digite apenas os números do CPF'
                  }
                </p>
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
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

              {/* Data de Nascimento */}
              <div>
                <Label htmlFor="birth_date">
                  Data de Nascimento <span className="text-red-500">*</span>
                </Label>
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

        {/* Etapa 3: Localização */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Localização</span>
              </CardTitle>
              <CardDescription>
                Informações de localização para busca de profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estado */}
              <div>
                <Label htmlFor="location_state">
                  Estado <span className="text-red-500">*</span>
                </Label>
                <EstadoCombobox
                  value={selectedState}
                  onValueChange={(value) => {
                    setSelectedState(value)
                    setValue('location_state', value)
                    // Limpar cidade quando estado muda
                    setValue('location_city', '')
                    // Limpar bairro também para forçar nova seleção
                    setValue('neighborhood', '')
                  }}
                  placeholder="Selecione o estado"
                />
                {errors.location_state && (
                  <p className="text-sm text-red-500 mt-1">{errors.location_state.message}</p>
                )}
              </div>

              {/* Cidade */}
              <div>
                <Label htmlFor="location_city">
                  Cidade <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="neighborhood">
                  Bairro <span className="text-red-500">*</span>
                </Label>
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
              disabled={isLoading}
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
              {isLoading ? 'Criando Conta...' : 'Criar Conta'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
