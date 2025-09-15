'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { ReauthenticationGuard } from '@/components/auth/ReauthenticationGuard'
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Info
} from 'lucide-react'

const emailChangeSchema = z.object({
  newEmail: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  confirmEmail: z.string()
    .min(1, 'Confirmação de email é obrigatória')
}).refine((data) => data.newEmail === data.confirmEmail, {
  message: "Emails não coincidem",
  path: ["confirmEmail"],
})

type EmailChangeFormData = z.infer<typeof emailChangeSchema>

export default function AlterarEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailUpdated, setEmailUpdated] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { user, updateEmail } = useAuthContext()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EmailChangeFormData>({
    resolver: zodResolver(emailChangeSchema),
  })

  const newEmail = watch('newEmail', '')
  const confirmEmail = watch('confirmEmail', '')

  // Verificar se o usuário está autenticado e tem sessão de reautenticação
  useEffect(() => {
    const reauthSession = sessionStorage.getItem('reauth_session')
    
    if (!user) {
      router.push('/auth')
      return
    }

    if (!reauthSession) {
      toast.error('Reautenticação necessária')
      router.push('/reautenticacao?action=email')
      return
    }

    // Verificar se a sessão de reautenticação ainda é válida
    const reauthData = JSON.parse(reauthSession)
    const reauthTime = new Date(reauthData.timestamp)
    const now = new Date()
    const hoursSinceReauth = (now.getTime() - reauthTime.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceReauth > 1) {
      toast.error('Sessão de reautenticação expirada')
      sessionStorage.removeItem('reauth_session')
      router.push('/reautenticacao?action=email')
      return
    }

    setIsAuthenticated(true)
  }, [user, router])

  const onSubmit = async (data: EmailChangeFormData) => {
    setIsLoading(true)
    
    try {
      // Aqui você implementaria a lógica de alteração de email
      // Por enquanto, vamos simular o processo
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Atualizar email usando a função específica
      const result = await updateEmail(data.newEmail)
      
      if (result?.error) {
        toast.error('Erro ao atualizar email: ' + result.error.message)
        setIsLoading(false)
      } else {
        toast.success('Email atualizado com sucesso!')
        setEmailUpdated(true)
        setIsLoading(false)
        
        // Limpar sessão de reautenticação
        sessionStorage.removeItem('reauth_session')
        
        // Redirecionar para perfil após 3 segundos
        setTimeout(() => {
          router.push('/editarperfil')
        }, 3000)
      }
    } catch {
      toast.error('Erro inesperado ao atualizar email')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/editarperfil')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-yellow-400 mx-auto mb-6"></div>
          <h1 className="text-xl font-black text-black uppercase mb-4">
            VERIFICANDO AUTENTICAÇÃO...
          </h1>
          <p className="text-black font-bold">
            AGUARDE ENQUANTO VERIFICAMOS SUA CONTA.
          </p>
        </div>
      </div>
    )
  }

  if (emailUpdated) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="mx-auto w-20 h-20 bg-green-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
            EMAIL ATUALIZADO!
          </h1>
          <p className="text-black font-bold mb-8 animate-fade-in">
            SEU EMAIL FOI ALTERADO COM SUCESSO.
          </p>
          
          <div className="bg-green-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white mr-2" />
              <p className="text-white font-black text-sm">
                VOCÊ SERÁ REDIRECIONADO PARA SEU PERFIL EM ALGUNS SEGUNDOS...
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/editarperfil')}
            className="w-full px-6 py-4 text-lg font-black text-white bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse hover:animate-none"
          >
            IR PARA PERFIL
          </button>
        </div>
      </div>
    )
  }

  return (
    <ReauthenticationGuard requiredAction="email">
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
            onClick={handleBack}
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
            <div className="mx-auto w-16 h-16 bg-blue-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-pulse">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-black uppercase mb-4 animate-fade-in">
              ALTERAR EMAIL
            </h1>
            <p className="text-black font-bold animate-fade-in">
              DEFINA UM NOVO EMAIL PARA SUA CONTA
            </p>
          </div>

          {/* Informação sobre Reautenticação */}
          <div className="bg-green-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-black text-white uppercase mb-2">
                  IDENTIDADE CONFIRMADA
                </h3>
                <p className="text-xs text-white font-bold">
                  Sua identidade foi verificada com sucesso. Agora você pode alterar seu email com segurança.
                </p>
              </div>
            </div>
          </div>

          {/* Email Atual */}
          <div className="bg-gray-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
            <h3 className="text-sm font-black text-black uppercase mb-2">EMAIL ATUAL</h3>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-black" />
              <span className="text-sm font-bold text-black">{user?.email}</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="newEmail" className="text-sm font-black text-black uppercase">
                NOVO EMAIL
              </label>
              <Input
                id="newEmail"
                type="email"
                placeholder="novo@email.com"
                {...register('newEmail')}
                className="w-full px-4 py-3 text-lg font-bold bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
              {errors.newEmail && (
                <p className="text-sm text-red-600 font-bold">{errors.newEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmEmail" className="text-sm font-black text-black uppercase">
                CONFIRMAR NOVO EMAIL
              </label>
              <Input
                id="confirmEmail"
                type="email"
                placeholder="novo@email.com"
                {...register('confirmEmail')}
                className="w-full px-4 py-3 text-lg font-bold bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
              {errors.confirmEmail && (
                <p className="text-sm text-red-600 font-bold">{errors.confirmEmail.message}</p>
              )}
            </div>

            {/* Aviso Importante */}
            <div className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-black flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-black text-black uppercase mb-2">
                    AVISO IMPORTANTE
                  </h3>
                  <div className="text-xs text-black font-bold space-y-1">
                    <p>• Você precisará verificar o novo email</p>
                    <p>• Suas credenciais de login serão atualizadas</p>
                    <p>• Notificações serão enviadas para o novo email</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 text-lg font-black text-white bg-blue-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !newEmail || !confirmEmail || newEmail !== confirmEmail}
            >
              {isLoading ? 'ATUALIZANDO...' : 'ATUALIZAR EMAIL'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-black hover:text-gray-600 hover:underline font-black uppercase"
              >
                VOLTAR PARA O PERFIL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </ReauthenticationGuard>
  )
}
