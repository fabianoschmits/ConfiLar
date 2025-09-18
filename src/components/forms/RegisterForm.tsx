'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, User, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { UserType } from '@/types/database'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  userType: z.enum(['client', 'professional']),
  gender: z.enum(['male', 'female'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

type AvatarType = 'upload' | 'dicebear'
type AvatarSelection = {
  type: AvatarType
  value: string | File
  preview?: string
}

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarSelection | null>(null)
  const [dicebearAvatar, setDicebearAvatar] = useState<string>('')
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const { signUp } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 'client',
      gender: 'male'
    }
  })

  const selectedUserType = watch('userType')
  const fullName = watch('fullName')
  const selectedGender = watch('gender')

  // Gerar avatar Dicebear quando o nome ou sexo mudar
  useEffect(() => {
    if (fullName && fullName.length >= 2 && selectedGender) {
      generateDicebearAvatar(fullName, selectedGender)
    }
  }, [fullName, selectedGender])

  const generateDicebearAvatar = async (name: string, gender: string) => {
    setIsGeneratingAvatar(true)
    try {
      const encodedName = encodeURIComponent(name)
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodedName}&backgroundColor=transparent&size=100&facialHairProbability=${gender === 'male' ? '30' : '0'}`
      setDicebearAvatar(avatarUrl)
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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    
    try {
              const result = await signUp({
                email: data.email,
                password: data.password,
                full_name: data.fullName,
                user_type: data.userType
              })
      
      if (result.error) {
        toast.error('Erro ao criar conta: ' + result.error.message)
      } else {
        toast.success('Conta criada com sucesso! Verifique seu email para confirmar.')
        // Redirecionar para a página inicial após registro bem-sucedido
                    window.location.href = '/home'
      }
    } catch (error) {
      toast.error('Erro inesperado ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>
          {selectedUserType === 'client' 
            ? 'Crie sua conta para encontrar os melhores profissionais'
            : 'Crie sua conta para oferecer seus serviços'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Seleção de Tipo de Usuário */}
          <div className="space-y-2">
            <Label htmlFor="userType">Tipo de Usuário</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="client"
                  {...register('userType')}
                  className="sr-only"
                />
                <div className={`w-full p-3 border-2 rounded-lg text-center transition-all ${
                  selectedUserType === 'client'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-lg mb-1">👤</div>
                  <div className="font-medium">Cliente</div>
                  <div className="text-sm text-gray-600">Contratar serviços</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="professional"
                  {...register('userType')}
                  className="sr-only"
                />
                <div className={`w-full p-3 border-2 rounded-lg text-center transition-all ${
                  selectedUserType === 'professional'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-lg mb-1">🔧</div>
                  <div className="font-medium">Profissional</div>
                  <div className="text-sm text-gray-600">Oferecer serviços</div>
                </div>
              </label>
            </div>
            {errors.userType && (
              <p className="text-sm text-red-600">{errors.userType.message}</p>
            )}
          </div>

          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Digite seu nome completo"
              {...register('fullName')}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <Label>Sexo</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="male"
                  {...register('gender')}
                  className="sr-only"
                />
                <div className={`w-full p-2 border-2 rounded-lg text-center transition-all ${
                  selectedGender === 'male'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-sm font-medium">Masculino</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="female"
                  {...register('gender')}
                  className="sr-only"
                />
                <div className={`w-full p-2 border-2 rounded-lg text-center transition-all ${
                  selectedGender === 'female'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-sm font-medium">Feminino</div>
                </div>
              </label>
            </div>
            {errors.gender && (
              <p className="text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          {/* Avatar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-medium">Avatar</Label>
            </div>
            
            {/* Preview do Avatar Selecionado */}
            {selectedAvatar && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                  <img
                    src={selectedAvatar.preview}
                    alt="Avatar selecionado"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {selectedAvatar.type === 'upload' ? 'Foto enviada' : 'Avatar gerado'}
                  </p>
                  <p className="text-xs text-blue-700">
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
                  <Upload className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium">Upload</span>
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
                    "block w-full p-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors text-center",
                    selectedAvatar?.type === 'upload' && "border-blue-500 bg-blue-50"
                  )}
                >
                  <div className="text-xs text-gray-600">
                    {selectedAvatar?.type === 'upload' ? '✓ Selecionado' : 'Escolher arquivo'}
                  </div>
                </label>
              </div>

              {/* Avatar Pixel-Art */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <RefreshCw className={cn("h-3 w-3 text-gray-500", isGeneratingAvatar && "animate-spin")} />
                  <span className="text-xs font-medium">Pixel-Art</span>
                </div>
                {fullName && fullName.length >= 2 && selectedGender ? (
                  <button
                    type="button"
                    onClick={handleDicebearSelect}
                    disabled={isGeneratingAvatar || !dicebearAvatar}
                    className={cn(
                      "w-full p-2 border rounded-lg transition-all text-center",
                      selectedAvatar?.type === 'dicebear'
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-blue-400 text-gray-600",
                      (isGeneratingAvatar || !dicebearAvatar) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isGeneratingAvatar ? (
                      <div className="text-xs">Gerando...</div>
                    ) : dicebearAvatar ? (
                      <div className="text-xs">
                        {selectedAvatar?.type === 'dicebear' ? '✓ Selecionado' : 'Usar avatar'}
                      </div>
                    ) : (
                      <div className="text-xs">Digite nome</div>
                    )}
                  </button>
                ) : (
                  <div className="w-full p-2 border border-gray-200 rounded-lg text-center">
                    <div className="text-xs text-gray-400">Digite nome + sexo</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Informações Adicionais */}
          {selectedUserType === 'professional' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🎯 Perfil Profissional</h4>
              <p className="text-sm text-blue-700">
                Como profissional, você poderá:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Criar seu perfil com portfólio</li>
                <li>• Postar trabalhos realizados</li>
                <li>• Receber avaliações de clientes</li>
                <li>• Expandir seu negócio</li>
              </ul>
            </div>
          )}

          {selectedUserType === 'client' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">🔍 Perfil Cliente</h4>
              <p className="text-sm text-green-700">
                Como cliente, você poderá:
              </p>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• Buscar profissionais qualificados</li>
                <li>• Ver portfólios e avaliações</li>
                <li>• Negociar diretamente via chat</li>
                <li>• Avaliar serviços recebidos</li>
              </ul>
            </div>
          )}

          {/* Botão de Envio */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>

          {/* Termos e Condições */}
          <p className="text-xs text-gray-500 text-center">
            Ao criar uma conta, você concorda com nossos{' '}
            <a href="/ajuda" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/ajuda" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
