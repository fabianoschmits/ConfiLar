'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Upload, User, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export default function TesteAvatarPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarSelection | null>(null)
  const [dicebearAvatars, setDicebearAvatars] = useState<string[]>([])
  const [isGeneratingAvatars, setIsGeneratingAvatars] = useState(false)

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

  const fullName = watch('fullName')
  const selectedUserType = watch('userType')
  const selectedGender = watch('gender')

  // Gerar avatares Dicebear quando o nome ou sexo mudar
  useEffect(() => {
    if (fullName && fullName.length >= 2 && selectedGender) {
      generateDicebearAvatars(fullName, selectedGender)
    }
  }, [fullName, selectedGender])

  const generateDicebearAvatars = async (name: string, gender: string) => {
    setIsGeneratingAvatars(true)
    try {
      const encodedName = encodeURIComponent(name)
      
      // URL simplificada do Dicebear pixel-art
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodedName}&backgroundColor=transparent&size=100&facialHairProbability=${gender === 'male' ? '30' : '0'}`
      
      // Teste com URL mais simples primeiro
      const testUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodedName}`
      
      console.log('Gerando avatar para:', name, 'Sexo:', gender)
      console.log('URL completa:', avatarUrl)
      console.log('URL teste:', testUrl)
      
      setDicebearAvatars([testUrl])
      console.log('Array dicebearAvatars atualizado:', [testUrl])
    } catch (error) {
      console.error('Erro ao gerar avatares Dicebear:', error)
    } finally {
      setIsGeneratingAvatars(false)
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

  const handleDicebearSelect = (avatarUrl: string) => {
    setSelectedAvatar({
      type: 'dicebear',
      value: avatarUrl,
      preview: avatarUrl
    })
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Log dos dados no console
      console.log('=== DADOS DO FORMULÁRIO ===')
      console.log('Nome:', data.fullName)
      console.log('Email:', data.email)
      console.log('Tipo de usuário:', data.userType)
      console.log('Sexo:', data.gender)
      console.log('Senha:', data.password)
      
      console.log('=== AVATAR SELECIONADO ===')
      if (selectedAvatar) {
        console.log('Tipo:', selectedAvatar.type)
        console.log('Valor:', selectedAvatar.value)
        console.log('Preview:', selectedAvatar.preview)
        
        if (selectedAvatar.type === 'upload') {
          console.log('Arquivo:', selectedAvatar.value)
          console.log('Nome do arquivo:', (selectedAvatar.value as File).name)
          console.log('Tamanho:', (selectedAvatar.value as File).size, 'bytes')
        } else if (selectedAvatar.type === 'dicebear') {
          console.log('URL Dicebear:', selectedAvatar.value)
        }
      } else {
        console.log('Nenhum avatar selecionado')
      }
      
      console.log('=== FIM DOS DADOS ===')
      
      alert('Dados enviados! Verifique o console para ver os detalhes.')
      
    } catch (error) {
      console.error('Erro no teste:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Teste de Sistema de Avatar
          </CardTitle>
          <CardDescription>
            Página de teste para implementação do sistema de seleção de avatar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Formulário Principal */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="Digite seu nome completo"
                    className={cn(errors.fullName && 'border-red-500')}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="seu@email.com"
                    className={cn(errors.email && 'border-red-500')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Mínimo 6 caracteres"
                    className={cn(errors.password && 'border-red-500')}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="Digite a senha novamente"
                    className={cn(errors.confirmPassword && 'border-red-500')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Usuário</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="client"
                      {...register('userType')}
                      className="text-blue-600"
                    />
                    <span>Cliente</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="professional"
                      {...register('userType')}
                      className="text-blue-600"
                    />
                    <span>Profissional</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sexo</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="male"
                      {...register('gender')}
                      className="text-blue-600"
                    />
                    <span>Masculino</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="female"
                      {...register('gender')}
                      className="text-blue-600"
                    />
                    <span>Feminino</span>
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção de Avatar */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Escolha seu Avatar</h3>
                {selectedAvatar && (
                  <Badge variant="secondary" className="ml-auto">
                    Avatar selecionado
                  </Badge>
                )}
              </div>

              {/* Preview do Avatar Selecionado */}
              {selectedAvatar && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500">
                    <img
                      src={selectedAvatar.preview}
                      alt="Avatar selecionado"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">
                      Avatar {selectedAvatar.type === 'upload' ? 'Enviado' : 'Gerado'}
                    </p>
                    <p className="text-sm text-blue-700">
                      {selectedAvatar.type === 'upload' && (selectedAvatar.value as File).name}
                      {selectedAvatar.type === 'dicebear' && 'Gerado automaticamente'}
                    </p>
                  </div>
                </div>
              )}

              {/* Opção 1: Upload de Foto */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium">Upload de Foto</h4>
                </div>
                <div className="flex items-center gap-4">
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
                      "px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors",
                      selectedAvatar?.type === 'upload' && "border-blue-500 bg-blue-50"
                    )}
                  >
                    Escolher Arquivo
                  </label>
                  {selectedAvatar?.type === 'upload' && (
                    <span className="text-sm text-green-600">✓ Selecionado</span>
                  )}
                </div>
              </div>

              {/* Opção 2: Avatar Dicebear Pixel-Art */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className={cn("h-4 w-4 text-gray-600", isGeneratingAvatars && "animate-spin")} />
                  <h4 className="font-medium">Avatar Pixel-Art</h4>
                  {(!fullName || !selectedGender) && (
                    <span className="text-sm text-gray-500">(Digite nome e selecione sexo)</span>
                  )}
                </div>
                
                {fullName && fullName.length >= 2 && selectedGender && (
                  <div className="flex justify-center">
                    {isGeneratingAvatars ? (
                      <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
                    ) : dicebearAvatars.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleDicebearSelect(dicebearAvatars[0])}
                        className={cn(
                          "w-20 h-20 rounded-full overflow-hidden border-2 transition-all hover:scale-105",
                          selectedAvatar?.type === 'dicebear' && selectedAvatar.value === dicebearAvatars[0]
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-300 hover:border-blue-400"
                        )}
                      >
                        <img
                          src={dicebearAvatars[0]}
                          alt="Avatar Pixel-Art"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Erro ao carregar imagem:', dicebearAvatars[0])
                            console.error('Evento de erro:', e)
                          }}
                          onLoad={() => {
                            console.log('Avatar carregado com sucesso:', dicebearAvatars[0])
                          }}
                        />
                      </button>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs">
                        Sem avatar
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            <Separator />

            {/* Botão de Envio */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Testar Cadastro'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
