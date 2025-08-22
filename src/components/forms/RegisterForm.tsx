'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { UserType } from '@/types/database'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  userType: z.enum(['client', 'professional'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 'client'
    }
  })

  const selectedUserType = watch('userType')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    
    try {
              const result = await signUp(data.email, data.password, {
                full_name: data.fullName,
                user_type: data.userType
              })
      
      if (result.error) {
        toast.error('Erro ao criar conta: ' + result.error.message)
      } else {
        toast.success('Conta criada com sucesso! Verifique seu email para confirmar.')
        // Redirecionar para a página inicial após registro bem-sucedido
        window.location.href = '/inicio'
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
            <a href="/termos" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/privacidade" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
