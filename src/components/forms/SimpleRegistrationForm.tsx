'use client'

import { useState } from 'react'
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
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { estadosBrasil, getCidadesByEstado } from '@/data/brazilianLocations'
import { serviceCategories } from '@/data/serviceCategories'
import { toast } from 'sonner'

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
  cpf_cnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  user_type: z.enum(['client', 'professional']),
  location_state: z.string().min(1, 'Estado é obrigatório'),
  location_city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  // Campos opcionais para profissionais
  bio: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
  experience_years: z.string().optional(),
  emergency_service: z.boolean().optional(),
  insurance_coverage: z.boolean().optional(),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

export function SimpleRegistrationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [stateOpen, setStateOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
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
      emergency_service: false,
      insurance_coverage: false,
    },
  })

  const watchedValues = watch()
  const isProfessional = watchedValues.user_type === 'professional'

  // Converter categorias para formato de string simples
  const serviceCategoryNames = serviceCategories.map(cat => cat.name)

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

  // Formatação automática para telefone (padrão brasileiro)
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 9) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}-${numbers.slice(3, 6)}`
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 9)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
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
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir digitação normal, só formatar quando sair do campo
    setValue('name', e.target.value)
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
      // Adicionar serviços selecionados aos dados
      const formData = {
        ...data,
        services_offered: selectedServices,
      }

      const { error } = await signUp(data.email, data.password, {
        full_name: data.name,
        user_type: data.user_type,
        phone: data.phone,
        cpf_cnpj: data.cpf_cnpj,
        birth_date: data.birth_date,
        location_state: data.location_state,
        location_city: data.location_city,
        neighborhood: data.neighborhood,
        bio: data.bio || '',
        services_offered: selectedServices,
        experience_years: data.experience_years || '',
        emergency_service: data.emergency_service || false,
        insurance_coverage: data.insurance_coverage || false,
      })

      if (error) {
        console.error('❌ Erro detalhado:', error)
        toast.error(`Erro ao criar conta: ${error.message}`)
        return
      }

      toast.success('🎉 Conta criada com sucesso! Um email de confirmação foi enviado para você. Verifique sua caixa de entrada e clique no link para ativar sua conta.')
      
      // Aguardar 3 segundos para o usuário ler a mensagem antes de redirecionar
      setTimeout(() => {
        window.location.href = '/auth?message=account_created'
      }, 3000)
    } catch (error) {
      console.error('Erro no cadastro:', error)
      toast.error('Erro inesperado ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 text-gray-900">Dados Básicos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome Completo *
            </Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              {...register('name')}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              className={errors.name ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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
              className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres com maiúscula, minúscula, número e caractere especial"
              {...register('password')}
              className={errors.password ? 'border-red-500 focus:ring-red-500' : ''}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Telefone *
            </Label>
            <Input
              id="phone"
              placeholder="11999999999"
              {...register('phone')}
              onChange={handlePhoneChange}
              className={errors.phone ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj" className="text-sm font-medium text-gray-700">
              CPF/CNPJ *
            </Label>
            <Input
              id="cpf_cnpj"
              placeholder="123.456.789-00"
              {...register('cpf_cnpj')}
              onChange={handleCPFChange}
              className={errors.cpf_cnpj ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.cpf_cnpj && <p className="text-sm text-red-500">{errors.cpf_cnpj.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date" className="text-sm font-medium text-gray-700">
              Data de Nascimento *
            </Label>
            <Input
              id="birth_date"
              type="date"
              {...register('birth_date')}
              className={errors.birth_date ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.birth_date && <p className="text-sm text-red-500">{errors.birth_date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_type" className="text-sm font-medium text-gray-700">
              Tipo de Usuário *
            </Label>
            <Select
              value={watchedValues.user_type}
              onValueChange={(value) => setValue('user_type', value as 'client' | 'professional')}
            >
              <SelectTrigger className={errors.user_type ? 'border-red-500 focus:ring-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
              </SelectContent>
            </Select>
            {errors.user_type && <p className="text-sm text-red-500">{errors.user_type.message}</p>}
          </div>
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 text-gray-900">Localização</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location_state" className="text-sm font-medium text-gray-700">
              Estado *
            </Label>
            <Popover open={stateOpen} onOpenChange={setStateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={stateOpen}
                  className={cn(
                    "w-full justify-between h-10",
                    errors.location_state && "border-red-500 focus:ring-red-500"
                  )}
                >
                  {watchedValues.location_state
                    ? estadosBrasil.find((estado) => estado.sigla === watchedValues.location_state)?.nome
                    : "Selecione o estado..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
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
                            setValue('location_city', '') // Limpar cidade quando mudar estado
                            setStateOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
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
            {errors.location_state && <p className="text-sm text-red-500">{errors.location_state.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_city" className="text-sm font-medium text-gray-700">
              Cidade *
            </Label>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={cityOpen}
                  disabled={!watchedValues.location_state}
                  className={cn(
                    "w-full justify-between h-10",
                    errors.location_city && "border-red-500 focus:ring-red-500"
                  )}
                >
                  {watchedValues.location_city
                    ? watchedValues.location_city
                    : watchedValues.location_state
                    ? "Selecione a cidade..."
                    : "Selecione o estado primeiro"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
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
                            className={cn(
                              "mr-2 h-4 w-4",
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
            {errors.location_city && <p className="text-sm text-red-500">{errors.location_city.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">
              Bairro *
            </Label>
            <Input
              id="neighborhood"
              placeholder="Seu bairro"
              {...register('neighborhood')}
              className={cn(
                "h-10",
                errors.neighborhood ? 'border-red-500 focus:ring-red-500' : ''
              )}
            />
            {errors.neighborhood && <p className="text-sm text-red-500">{errors.neighborhood.message}</p>}
          </div>
        </div>
      </div>

      {/* Campos específicos para profissionais */}
      {isProfessional && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 text-gray-900">Dados Profissionais</h3>
          
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
                Anos de Experiência
              </Label>
              <Select
                value={watchedValues.experience_years || undefined}
                onValueChange={(value) => setValue('experience_years', value)}
              >
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
                Serviços Oferecidos
              </Label>
              <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={servicesOpen}
                    className="w-full justify-between"
                  >
                    {selectedServices.length === 0
                      ? "Selecione os serviços..."
                      : `${selectedServices.length} serviço(s) selecionado(s)`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
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
                              className={cn(
                                "mr-2 h-4 w-4",
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
                  <p className="text-sm text-gray-600">Serviços selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <Badge 
                        key={service} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => removeService(service)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  {...register('emergency_service')}
                  id="emergency_service"
                />
                <Label htmlFor="emergency_service" className="text-sm cursor-pointer">
                  Ofereço serviço de emergência 24h
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  {...register('insurance_coverage')}
                  id="insurance_coverage"
                />
                <Label htmlFor="insurance_coverage" className="text-sm cursor-pointer">
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
          {isLoading ? 'Criando conta...' : 'Criar Conta'}
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
