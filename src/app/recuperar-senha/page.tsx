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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-md border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Email enviado!
            </h1>
            <p className="text-gray-600 mb-8">
              Enviamos um link de recuperação para <strong>{getValues('email')}</strong>
            </p>
          
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Próximos passos:
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Verifique sua caixa de entrada</p>
                  <p>• Clique no link do email</p>
                  <p>• Defina uma nova senha</p>
                  <p>• Faça login com sua nova senha</p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 mb-6">
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
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para o login</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Moderno */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ConfiLar</span>
          </div>
          
          <Button
            onClick={handleBackToLogin}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
        </div>
      </header>

      {/* Main Content Moderno */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="max-w-md w-full bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                Recuperar senha
              </h1>
              <p className="text-gray-600">
                Digite seu email para receber um link de recuperação
              </p>
            </div>
          
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
                  className={`transition-colors ${
                    errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar email de recuperação'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar para o login</span>
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
