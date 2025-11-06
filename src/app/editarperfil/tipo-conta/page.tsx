'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  X, RefreshCw, User, Save, Edit3
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const accountTypeSchema = z.object({
  user_type: z.enum(['client', 'professional']),
})

type AccountTypeFormData = z.infer<typeof accountTypeSchema>

export default function TipoContaPage() {
  const { user, updateProfile } = useAuthContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountTypeFormData>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: {
      user_type: 'client' as const,
    },
  })

  const watchedValues = watch()

  // Salvar página anterior ao montar o componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer || window.location.href
      // Salvar apenas se não for uma página de editar perfil
      if (!referrer.includes('/editarperfil/')) {
        sessionStorage.setItem('previousPage', referrer)
      }
    }
  }, [])

  // Carregar dados do perfil existente
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        router.push('/auth')
        return
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Erro ao carregar perfil:', error)
          toast.error('Erro ao carregar dados do perfil')
          return
        }

        if (profile) {
          setValue('user_type', profile.user_type || 'client')
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        toast.error('Erro ao carregar dados do perfil')
      }
    }

    loadProfileData()
  }, [user, router, setValue])

  const onSubmit = async (data: AccountTypeFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsLoading(true)
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          user_type: data.user_type,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('❌ Erro ao salvar tipo de conta:', profileError)
        toast.error('Erro ao salvar tipo de conta: ' + profileError.message)
        return
      }

      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          user_type: data.user_type,
        }
      })

      if (userUpdateError) {
        console.warn('⚠️ Erro ao atualizar metadados do usuário:', userUpdateError)
      }

      // Atualizar perfil no contexto para refletir mudanças imediatamente
      // Isso garante que o menu dropdown seja atualizado sem precisar recarregar a página
      const { error: updateError } = await updateProfile({
        user_type: data.user_type
      })

      if (updateError) {
        console.warn('⚠️ Erro ao atualizar perfil no contexto:', updateError)
        // Mesmo com erro, continuar pois o update no banco já foi feito
      } else {
        console.log('✅ Perfil atualizado no contexto com sucesso!')
      }

      console.log('✅ Tipo de conta salvo com sucesso!')
      toast.success('🎉 Tipo de conta atualizado com sucesso!')
      
      // Redirecionar para página anterior após salvar
      setTimeout(() => {
        const previousPage = sessionStorage.getItem('previousPage')
        if (previousPage && previousPage !== window.location.href) {
          router.push(previousPage)
        } else {
          router.back()
        }
      }, 1000)
      
    } catch (error) {
      console.error('Erro ao atualizar tipo de conta:', error)
      toast.error('Erro inesperado ao atualizar tipo de conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tipo de Conta</h1>
                  <p className="text-gray-600">Defina como você pretende usar o ConfiLar</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-600" />
                    Tipo de Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="user_type" className="text-sm font-medium text-gray-700">
                      Como você pretende usar o ConfiLar? <span className="text-red-500">*</span>
                    </Label>
                    <Select value={watchedValues.user_type} onValueChange={(value) => setValue('user_type', value as 'client' | 'professional')}>
                      <SelectTrigger className={cn(
                        "h-12",
                        errors.user_type ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                      )}>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">🙋‍♂️ Cliente - Procuro profissionais</SelectItem>
                        <SelectItem value="professional">👨‍💼 Profissional - Ofereço serviços</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.user_type && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.user_type.message}
                      </p>
                    )}

                    {/* Explicação dos tipos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">🙋‍♂️</span>
                          <span className="font-semibold text-blue-900">Cliente</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Você busca profissionais para resolver suas necessidades.
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">👨‍💼</span>
                          <span className="font-semibold text-green-900">Profissional</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Você oferece serviços e quer ser encontrado por clientes.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botão de Salvar */}
              <div className="flex justify-center pt-6">
                <LoadingButton
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 text-base font-medium"
                  disabled={isLoading}
                  isLoading={isLoading}
                  loadingText="Salvando..."
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

