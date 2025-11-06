'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { 
  Check, ChevronDown, X, RefreshCw, MapPin, Save, Edit3
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { estadosBrasil, getCidadesByEstado } from '@/data/brazilianLocations'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const addressSchema = z.object({
  location_state: z.string().min(1, 'Estado é obrigatório'),
  location_city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
})

type AddressFormData = z.infer<typeof addressSchema>

export default function EnderecoPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [stateOpen, setStateOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  })

  const watchedValues = watch()

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
          setValue('location_state', profile.location_state || '')
          setValue('location_city', profile.location_city || '')
          setValue('neighborhood', profile.neighborhood || '')
          setValue('address', profile.address || '')
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        toast.error('Erro ao carregar dados do perfil')
      }
    }

    loadProfileData()
  }, [user, router, setValue])

  const onSubmit = async (data: AddressFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsLoading(true)
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          location_state: data.location_state,
          location_city: data.location_city,
          neighborhood: data.neighborhood,
          address: data.address,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('❌ Erro ao salvar endereço:', profileError)
        toast.error('Erro ao salvar endereço: ' + profileError.message)
        return
      }

      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          location_state: data.location_state,
          location_city: data.location_city,
          neighborhood: data.neighborhood,
          address: data.address,
        }
      })

      if (userUpdateError) {
        console.warn('⚠️ Erro ao atualizar metadados do usuário:', userUpdateError)
      }

      console.log('✅ Endereço salvo com sucesso!')
      toast.success('🎉 Endereço atualizado com sucesso!')
      
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error)
      toast.error('Erro inesperado ao atualizar endereço')
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
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Endereço</h1>
                  <p className="text-gray-600">Atualize suas informações de localização</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location_state" className="text-sm font-medium text-gray-700">
                        Estado <span className="text-red-500">*</span>
                      </Label>
                      <Popover open={stateOpen} onOpenChange={setStateOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-left hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex items-center justify-between h-10",
                              errors.location_state ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                            )}
                          >
                            <span className="text-gray-900 dark:text-white">
                              {watchedValues.location_state
                                ? estadosBrasil.find((estado) => estado.sigla === watchedValues.location_state)?.nome
                                : "Selecione o estado"}
                            </span>
                            <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400 dark:text-gray-500" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="start">
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
                                      setValue('location_city', '')
                                      setStateOpen(false)
                                    }}
                                  >
                                    <Check
                                      size={16} className={cn(
                                        "mr-2",
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
                      {errors.location_state && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Obrigatório
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location_city" className="text-sm font-medium text-gray-700">
                        Cidade <span className="text-red-500">*</span>
                      </Label>
                      <Popover open={cityOpen} onOpenChange={setCityOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            disabled={!watchedValues.location_state}
                            className={cn(
                              "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-left hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex items-center justify-between h-10",
                              errors.location_city ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600',
                              !watchedValues.location_state ? 'opacity-50 cursor-not-allowed' : ''
                            )}
                          >
                            <span className="text-gray-900 dark:text-white">
                              {watchedValues.location_city
                                ? watchedValues.location_city
                                : watchedValues.location_state
                                ? "Selecione a cidade"
                                : "Selecione o estado primeiro"}
                            </span>
                            <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400 dark:text-gray-500" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="start">
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
                                      size={16} className={cn(
                                        "mr-2",
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
                      {errors.location_city && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Obrigatório
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">
                        Bairro <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="neighborhood"
                        placeholder="Digite o bairro"
                        {...register('neighborhood')}
                        className={cn(
                          "h-10",
                          errors.neighborhood ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                        )}
                      />
                      {errors.neighborhood && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <X className="w-3 h-3" />
                          {errors.neighborhood.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Endereço <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        placeholder="Ex: Rua das Flores, 123"
                        {...register('address')}
                        className={cn(
                          "h-10",
                          errors.address ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-500'
                        )}
                      />
                      {errors.address && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <X className="w-3 h-3" />
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botão de Salvar */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

