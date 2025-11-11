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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { 
  Check, ChevronDown, X, RefreshCw, Briefcase, Save, Edit3
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { services } from '@/data/services'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const professionalDataSchema = z.object({
  experience_years: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
})

type ProfessionalDataFormData = z.infer<typeof professionalDataSchema>

export default function DadosProfissionaisPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [servicesOpen, setServicesOpen] = useState(false)

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfessionalDataFormData>({
    resolver: zodResolver(professionalDataSchema),
  })

  const watchedValues = watch()
  const serviceCategoryNames = services.map(cat => cat.name)

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
          toast.error('Erro ao carregar dados do perfil', {
            description: 'Não foi possível carregar suas informações profissionais. Tente recarregar a página.'
          })
          return
        }

        if (profile) {
          setValue('experience_years', profile.professional_experience_years ? `${profile.professional_experience_years}-${profile.professional_experience_years + 2}` : '')
          
          if (profile.professional_services) {
            setSelectedServices(profile.professional_services)
            setValue('services_offered', profile.professional_services)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        toast.error('Erro ao carregar dados do perfil')
      }
    }

    loadProfileData()
  }, [user, router, setValue])

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

  const onSubmit = async (data: ProfessionalDataFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado', {
        description: 'Você precisa estar logado para atualizar seus dados profissionais. Faça login e tente novamente.'
      })
      return
    }

    setIsLoading(true)
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          professional_experience_years: data.experience_years ? parseInt(data.experience_years.split('-')[0]) || 0 : 0,
          professional_services: selectedServices.length > 0 ? selectedServices : [],
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('❌ Erro ao salvar dados profissionais:', profileError)
        toast.error('Erro ao salvar dados profissionais', {
          description: profileError.message || 'Não foi possível salvar suas informações profissionais. Verifique os dados e tente novamente.'
        })
        return
      }

      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          services_offered: selectedServices,
          experience_years: data.experience_years,
          professional_experience_years: data.experience_years ? parseInt(data.experience_years.split('-')[0]) || 0 : 0,
        }
      })

      if (userUpdateError) {
        console.warn('⚠️ Erro ao atualizar metadados do usuário:', userUpdateError)
      }

      console.log('✅ Dados profissionais salvos com sucesso!')
      toast.success('🎉 Dados profissionais atualizados com sucesso!')
      
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
      console.error('Erro ao atualizar dados profissionais:', error)
      toast.error('Erro inesperado ao atualizar dados profissionais', {
        description: 'Ocorreu um erro inesperado. Tente novamente em alguns instantes ou recarregue a página.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dados Profissionais</h1>
                  <p className="text-gray-600">Configure suas informações profissionais</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                    Informações Profissionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Anos de experiência
                      </Label>
                      <Select value={watchedValues.experience_years || ''} onValueChange={(value) => setValue('experience_years', value)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">🌱 0-1 ano</SelectItem>
                          <SelectItem value="1-3">📈 1-3 anos</SelectItem>
                          <SelectItem value="3-5">🎯 3-5 anos</SelectItem>
                          <SelectItem value="5-10">🏆 5-10 anos</SelectItem>
                          <SelectItem value="10+">👑 Mais de 10 anos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Serviços oferecidos (Opcional)
                      </Label>
                      <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-left hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex items-center justify-between h-10"
                          >
                            <span className="text-gray-900 dark:text-white">
                              {selectedServices.length === 0
                                ? "Selecione os serviços..."
                                : `${selectedServices.length} serviço(s)`}
                            </span>
                            <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400 dark:text-gray-500" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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
                                      size={16} className={cn(
                                        "mr-2",
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
                    </div>
                  </div>
                  
                  {/* Serviços selecionados */}
                  {selectedServices.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Serviços selecionados:</p>
                      <div className="text-sm text-gray-600 leading-tight">
                        {selectedServices.map((service, index) => (
                          <span key={service} className="inline">
                            {service}
                            <button
                              type="button"
                              onClick={() => removeService(service)}
                              className="ml-1 text-red-500 hover:text-red-700 font-bold"
                              title="Remover serviço"
                            >
                              ×
                            </button>
                            {index < selectedServices.length - 1 && <span className="text-gray-400 mx-1">•</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botão de Salvar */}
              <div className="flex justify-center pt-6">
                <LoadingButton
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 text-base font-medium"
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

