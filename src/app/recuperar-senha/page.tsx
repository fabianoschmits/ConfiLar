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
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="mx-auto w-20 h-20 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
            <Mail className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
            EMAIL ENVIADO!
          </h1>
          <p className="text-black font-bold mb-8 animate-fade-in">
            ENVIAMOS UM LINK DE RECUPERAÇÃO PARA <strong>{getValues('email')}</strong>
          </p>
          
          <div className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
            <div className="text-left">
              <h3 className="text-sm font-black text-black uppercase mb-2">
                PRÓXIMOS PASSOS:
              </h3>
              <div className="text-sm text-black font-bold space-y-1">
                <p>• VERIFIQUE SUA CAIXA DE ENTRADA</p>
                <p>• CLIQUE NO LINK DO EMAIL</p>
                <p>• DEFINA UMA NOVA SENHA</p>
                <p>• FAÇA LOGIN COM SUA NOVA SENHA</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-black font-bold mb-6">
            NÃO RECEBEU O EMAIL? VERIFIQUE SUA PASTA DE SPAM OU{' '}
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="text-black hover:text-gray-600 hover:underline font-black uppercase"
            >
              TENTE NOVAMENTE
            </button>
          </div>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full px-6 py-4 text-lg font-black text-black bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse hover:animate-none flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>VOLTAR PARA O LOGIN</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-400">
      {/* Header Brutalista */}
      <header className="bg-white border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)] sticky top-0 z-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 border border-black animate-ping"></div>
          <div className="absolute top-4 right-8 w-1 h-1 bg-black animate-pulse"></div>
          <div className="absolute bottom-2 left-12 w-1 h-1 bg-yellow-400 animate-bounce"></div>
        </div>
        
        <div className="container flex h-16 items-center justify-between px-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
              <span className="text-yellow-400 font-black text-lg">C</span>
            </div>
            <span className="text-xl font-black text-black uppercase tracking-wider animate-fade-in">CONFILAR</span>
          </div>
          
          <button 
            onClick={handleBackToLogin}
            className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all animate-fade-in flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLTAR</span>
          </button>
        </div>
      </header>

      {/* Main Content Brutalista */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-md w-full bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
              <Mail className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
              RECUPERAR SENHA
            </h1>
            <p className="text-black font-bold animate-fade-in">
              DIGITE SEU EMAIL PARA RECEBER UM LINK DE RECUPERAÇÃO
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-black text-black uppercase">
                EMAIL
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={`w-full px-4 py-3 text-lg font-bold bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 font-bold">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'ENVIANDO...' : 'ENVIAR EMAIL DE RECUPERAÇÃO'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-black hover:text-gray-600 hover:underline font-black uppercase flex items-center justify-center space-x-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>VOLTAR PARA O LOGIN</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
