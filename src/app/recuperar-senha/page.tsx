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
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Mail } from 'lucide-react'

const recoverySchema = z.object({
  email: z.string().email('Email inválido'),
})

type RecoveryFormData = z.infer<typeof recoverySchema>

export default function RecuperarSenhaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuthContext()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema),
  })

  const onSubmit = async (data: RecoveryFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await resetPassword(data.email)
      
      if (error) {
        toast.error('Erro ao enviar email de recuperação: ' + error.message)
        setIsLoading(false)
      } else {
        toast.success('Email de recuperação enviado com sucesso!')
        setEmailSent(true)
        setIsLoading(false)
      }
    } catch {
      toast.error('Erro inesperado ao enviar email de recuperação')
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/auth')
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 backdrop-blur-sm bg-white/80">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Email Enviado!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enviamos um link de recuperação para <strong>{getValues('email')}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Próximos passos:
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Verifique sua caixa de entrada</li>
                      <li>Clique no link do email</li>
                      <li>Defina uma nova senha</li>
                      <li>Faça login com sua nova senha</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              Não recebeu o email? Verifique sua pasta de spam ou{' '}
              <button
                type="button"
                onClick={() => setEmailSent(false)}
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                tente novamente
              </button>
            </div>

            <Button
              type="button"
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 backdrop-blur-sm bg-white/80">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite seu email para receber um link de recuperação
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Email de Recuperação'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Voltar para o Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
