'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { ProfilePageLayout, ProfileSection, ProfileInfo, ProfileStats } from '@/components/layout/ProfilePageLayout'
import { Profile } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { Upload, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Copy,
  Share2,
  Building2,
  Clock,
  BarChart3,
  CheckCircle,
  Calendar,
  Award,
  Check,
  ChevronDown
} from 'lucide-react'
import { useAutoReauthentication } from '@/components/auth/AutoReauthentication'
import { toast } from 'sonner'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'
import { services } from '@/data/services'

export default function EditarPerfilPage() {
  const [mounted, setMounted] = useState(false)
  const { profile, updateProfile, uploadAvatar } = useAuthContext()
  const { checkAndRedirect } = useAutoReauthentication()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [isEditingProfessional, setIsEditingProfessional] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [_selectedState, setSelectedState] = useState(profile?.location_state || '')
  const [servicesOpen, setServicesOpen] = useState(false)
  
  // Converter categorias para formato de string simples
  const serviceCategoryNames = services.map(cat => cat.name)
  
  // Funções para manipular serviços
  const handleServiceToggle = (service: string) => {
    const currentServices = formData.professional_services || []
    const newSelectedServices = currentServices.includes(service) 
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service]
    
    setFormData({
      ...formData,
      professional_services: newSelectedServices
    })
  }

  const removeService = (serviceToRemove: string) => {
    const currentServices = formData.professional_services || []
    const newSelectedServices = currentServices.filter(s => s !== serviceToRemove)
    setFormData({
      ...formData,
      professional_services: newSelectedServices
    })
  }
  
  // Estados para sistema de upload avançado
  const [selectedAvatar, setSelectedAvatar] = useState<{
    type: 'upload' | 'dicebear'
    value: string | File
    preview?: string
  } | null>(null)
  const [dicebearAvatar, setDicebearAvatar] = useState<string>('')
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)

  const [formData, setFormData] = useState({
    email: profile?.email || '',
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    location_state: profile?.location_state || '',
    location_city: profile?.location_city || '',
    neighborhood: profile?.neighborhood || '',
    address: profile?.address || '',
    avatar_url: profile?.avatar_url || '',
    professional_experience_years: profile?.professional_experience_years || 0,
    professional_services: profile?.professional_services || []
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sincronizar dados quando o perfil mudar
  useEffect(() => {
    if (profile && !isEditing && !isEditingLocation) {
      setFormData({
        email: profile.email || '',
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location_state: profile.location_state || '',
        location_city: profile.location_city || '',
        neighborhood: profile.neighborhood || '',
        address: profile.address || '',
        avatar_url: profile.avatar_url || '',
        professional_experience_years: profile.professional_experience_years || 0,
        professional_services: profile.professional_services || []
      })
      setSelectedState(profile.location_state || '')
    }
  }, [profile, isEditing, isEditingLocation])

  // Gerar avatar automaticamente quando o nome mudar
  useEffect(() => {
    if (profile?.full_name && profile.full_name.length >= 2) {
      generateDicebearAvatar(profile.full_name, 'male')
    }
  }, [profile?.full_name])

  // Selecionar avatar Dicebear automaticamente quando gerado
  useEffect(() => {
    if (dicebearAvatar && !selectedAvatar) {
      setSelectedAvatar({
        type: 'dicebear',
        value: dicebearAvatar,
        preview: dicebearAvatar
      })
    }
  }, [dicebearAvatar])

  // Gerar avatar em tempo real baseado no nome digitado (com debounce)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const handleNameChange = () => {
      if (formData.full_name && formData.full_name.length >= 2) {
        // Debounce de 500ms para evitar muitas chamadas
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          // Usar gênero padrão 'male' (não temos campo gender no Profile)
          const gender = 'male'
          generateDicebearAvatar(formData.full_name, gender)
        }, 500)
      }
    }
    
    handleNameChange()
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [formData.full_name])

  if (!mounted) {
    return null
  }

  const handleEditClick = () => {
    setFormData({
      email: profile?.email || '',
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      location_state: profile?.location_state || '',
      location_city: profile?.location_city || '',
      neighborhood: profile?.neighborhood || '',
      address: profile?.address || '',
      avatar_url: profile?.avatar_url || '',
      professional_experience_years: profile?.professional_experience_years || 0,
      professional_services: profile?.professional_services || []
    })
    setSelectedState(profile?.location_state || '')
    setIsEditing(true)
  }

  if (!profile) {
    return (
      <ProfilePageLayout title="Carregando..." showBackButton={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-3 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </ProfilePageLayout>
    )
  }

  const handleSave = async () => {
    if (!updateProfile) {
      toast.error('Erro: função de atualização não disponível')
      return
    }

    setIsSaving(true)
    try {
      // Preparar dados do avatar se selecionado
      let avatarData = null
      if (selectedAvatar) {
        if (selectedAvatar.type === 'upload') {
          // Upload de arquivo
          const result = await uploadAvatar(selectedAvatar.value as File)
          if (result.error) {
            toast.error(result.error.message)
            setIsSaving(false)
            return
          }
          avatarData = {
            type: 'upload',
            url: result.data,
            preview: selectedAvatar.preview
          }
        } else if (selectedAvatar.type === 'dicebear') {
          // Avatar Dicebear
          avatarData = {
            type: 'dicebear',
            url: selectedAvatar.value as string,
            preview: selectedAvatar.preview
          }
        }
      }

      // Incluir avatar nos dados do perfil
      const profileDataWithAvatar = {
        ...formData,
        avatar_data: avatarData
      }

      const result = await updateProfile(profileDataWithAvatar)
      if (result?.error) {
        toast.error('Erro ao atualizar perfil: ' + result.error.message)
      } else {
        toast.success('Perfil atualizado com sucesso!')
        setIsEditing(false)
      }
    } catch (_error) {
      toast.error('Erro inesperado ao atualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      email: profile?.email || '',
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      location_state: profile?.location_state || '',
      location_city: profile?.location_city || '',
      neighborhood: profile?.neighborhood || '',
      address: profile?.address || '',
      avatar_url: profile?.avatar_url || '',
      professional_experience_years: profile?.professional_experience_years || 0,
      professional_services: profile?.professional_services || []
    })
    setSelectedState(profile?.location_state || '')
    setIsEditing(false)
  }

  const handleEditLocationClick = () => {
    setFormData({
      ...formData,
      location_state: profile?.location_state || '',
      location_city: profile?.location_city || '',
      neighborhood: profile?.neighborhood || '',
      address: profile?.address || ''
    })
    setSelectedState(profile?.location_state || '')
    setIsEditingLocation(true)
  }

  const handleCancelLocation = () => {
    setFormData({
      ...formData,
      location_state: profile?.location_state || '',
      location_city: profile?.location_city || '',
      neighborhood: profile?.neighborhood || '',
      address: profile?.address || ''
    })
    setSelectedState(profile?.location_state || '')
    setIsEditingLocation(false)
  }

  const handleSaveLocation = async () => {
    if (!updateProfile) {
      toast.error('Erro: função de atualização não disponível')
      return
    }

    setIsSavingLocation(true)
    try {
      const locationData = {
        location_state: formData.location_state,
        location_city: formData.location_city,
        neighborhood: formData.neighborhood,
        address: formData.address
      }
      const result = await updateProfile(locationData)
      if (result?.error) {
        toast.error('Erro ao atualizar localização: ' + result.error.message)
      } else {
        toast.success('Localização atualizada com sucesso!')
        setIsEditingLocation(false)
      }
    } catch (_error) {
      toast.error('Erro inesperado ao atualizar localização')
    } finally {
      setIsSavingLocation(false)
    }
  }

  const handleEditProfessional = () => {
    setIsEditingProfessional(true)
  }

  const handleCancelProfessional = () => {
    setFormData({
      ...formData,
      professional_experience_years: profile?.professional_experience_years || 0,
      professional_services: profile?.professional_services || []
    })
    setIsEditingProfessional(false)
  }

  const handleSaveProfessional = async () => {
    try {
      const wasClient = profile?.user_type === 'client'
      const hasServices = formData.professional_services && formData.professional_services.length > 0
      
      // Validação: se está tentando se tornar profissional, deve ter pelo menos um serviço
      if (wasClient && hasServices && formData.professional_services.length === 0) {
        toast.error('Para se tornar um profissional, você deve selecionar pelo menos um serviço.')
        return
      }
      
      // Preparar dados profissionais
      const professionalData: Partial<Profile> = {
        professional_experience_years: formData.professional_experience_years,
        professional_services: formData.professional_services
      }
      
      // Se era cliente e agora tem serviços, mudar para profissional
      if (wasClient && hasServices) {
        professionalData.user_type = 'professional'
      }
      
      const result = await updateProfile(professionalData)
      if (result.error) {
        toast.error('Erro ao atualizar dados profissionais: ' + result.error.message)
      } else {
        if (wasClient && hasServices) {
          toast.success('🎉 Parabéns! Você agora é um profissional! Seu perfil foi atualizado automaticamente.')
          // Recarregar a página para atualizar o contexto e mostrar as mudanças
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else if (wasClient && !hasServices) {
          toast.success('Dados profissionais atualizados! Adicione serviços para se tornar um profissional.')
        } else {
          toast.success('Dados profissionais atualizados com sucesso!')
        }
        setIsEditingProfessional(false)
      }
    } catch (_error) {
      toast.error('Erro inesperado ao atualizar dados profissionais')
    }
  }

  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/perfil/${profile.id}`
    navigator.clipboard.writeText(profileUrl)
    toast.success('Link do perfil copiado para a área de transferência!')
  }

  const shareProfile = () => {
    const profileUrl = `${window.location.origin}/perfil/${profile.id}`
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${profile.full_name}`,
        text: `Confira o perfil de ${profile.full_name} no ConfiLar`,
        url: profileUrl
      })
    } else {
      copyProfileLink()
    }
  }

  const getMemberSince = () => {
    if (profile.created_at) {
      const date = new Date(profile.created_at)
      return date.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
    return '2024'
  }

  // Função para gerar avatar Dicebear
  const generateDicebearAvatar = async (name: string, gender: string = 'male') => {
    if (!name || name.length < 2) return
    
    setIsGeneratingAvatar(true)
    try {
      const encodedName = encodeURIComponent(name.trim())
      const facialHairProbability = gender === 'male' ? '30' : gender === 'female' ? '0' : '15'
      const hairColor = gender === 'male' ? 'brown,black,blonde' : 'brown,black,blonde,red'
      const skinColor = 'fdbcb4,edb98a,fd9841,f8d25c'
      
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodedName}&backgroundColor=transparent&size=100&facialHairProbability=${facialHairProbability}&hairColor=${hairColor}&skinColor=${skinColor}`
      
      console.log('🎨 Gerando avatar para:', name, 'Gênero:', gender)
      
      // Testar se a URL é válida
      const response = await fetch(avatarUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      setDicebearAvatar(avatarUrl)
    } catch (error) {
      console.error('❌ Erro ao gerar avatar Dicebear:', error)
      // Fallback: usar avatar padrão
      const fallbackUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=transparent&size=100`
      setDicebearAvatar(fallbackUrl)
    } finally {
      setIsGeneratingAvatar(false)
    }
  }

  // Função para upload de arquivo
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

  // Função para selecionar avatar Dicebear
  const handleDicebearSelect = () => {
    if (dicebearAvatar) {
      setSelectedAvatar({
        type: 'dicebear',
        value: dicebearAvatar,
        preview: dicebearAvatar
      })
    }
  }

  // Função para salvar avatar selecionado
  const handleAvatarSave = async () => {
    if (!selectedAvatar) {
      toast.error('NENHUM AVATAR Selecionado')
      return
    }

    try {
      if (selectedAvatar.type === 'upload') {
        // Upload de arquivo
        const result = await uploadAvatar(selectedAvatar.value as File)
        if (result.error) {
          toast.error(result.error.message)
          return
        }
        if (result.data) {
          setFormData(prevData => ({ ...prevData, avatar_url: result.data || '' }))
          toast.success('FOTO DO PERFIL ATUALIZADA COM SUCESSO!')
        }
      } else if (selectedAvatar.type === 'dicebear') {
        // Avatar Dicebear - atualizar diretamente no perfil
        const result = await updateProfile({ avatar_url: selectedAvatar.value as string })
        if (result?.error) {
          toast.error('ERRO AO ATUALIZAR AVATAR: ' + result.error.message)
          return
        }
        setFormData(prevData => ({ ...prevData, avatar_url: selectedAvatar.value as string }))
        toast.success('Avatar atualIZADO COM SUCESSO!')
      }
    } catch (error) {
      console.error('Erro ao salvar avatar:', error)
      toast.error('ERRO INESPERADO AO Salvar AVATAR')
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const result = await uploadAvatar(file)
      if (result.error) {
        toast.error(result.error.message)
        return result
      }
      if (result.data) {
        setFormData(prevData => ({ ...prevData, avatar_url: result.data || '' }))
        toast.success('Foto do perfil atualizada com sucesso!')
      }
      return result
    } catch (_error) {
      toast.error('Erro inesperado ao fazer upload da foto')
      return { data: null, error: { message: 'Erro inesperado' } }
    }
  }

  if (!mounted) {
    return (
      <ProfilePageLayout title="Carregando..." showBackButton={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Carregando...
            </h1>
          </div>
        </div>
      </ProfilePageLayout>
    )
  }

  return (
    <ProfilePageLayout
      title="Editar Perfil"
      description="Gerencie suas informações pessoais e profissionais"
      showSaveButton={isEditing || isEditingLocation || isEditingProfessional}
      onSave={isEditing ? handleSave : isEditingLocation ? handleSaveLocation : handleSaveProfessional}
      onCancel={isEditing ? handleCancel : isEditingLocation ? handleCancelLocation : handleCancelProfessional}
      isSaving={isSaving || isSavingLocation}
      isEditing={isEditing || isEditingLocation || isEditingProfessional}
    >
      {/* Avatar Section - Compacto e Moderno */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
              {/* Avatar Atual */}
            <div className="relative">
              <Avatar className="w-16 h-16">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Avatar'} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
              {selectedAvatar && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
              </div>

            {/* Informações e Ações */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Foto do Perfil</h3>
              <p className="text-sm text-gray-600 mb-2">
                {selectedAvatar ? 'Nova foto selecionada' : 'Atualize sua foto de perfil'}
              </p>
              
              {/* Botões de Ação */}
              <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                  </label>
                
                {profile?.full_name && profile.full_name.length >= 2 && (
                    <button
                      type="button"
                      onClick={handleDicebearSelect}
                      disabled={isGeneratingAvatar || !dicebearAvatar}
                      className={cn(
                      "inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      selectedAvatar?.type === 'dicebear' 
                        ? "text-green-600 bg-green-50 border border-green-200" 
                        : "text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100",
                        (isGeneratingAvatar || !dicebearAvatar) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                    <RefreshCw className={cn("w-3 h-3 mr-1", isGeneratingAvatar && "animate-spin")} />
                    {isGeneratingAvatar ? 'Gerando...' : 'Pixel Art'}
                    </button>
                  )}
                </div>
              </div>

            {/* Avatar será salvo automaticamente quando o usuário salvar o perfil */}
              </div>
        </CardContent>
      </Card>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coluna Esquerda */}
            <div className="space-y-4">
          {/* Informações Básicas - Compacto */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Informações Básicas</h3>
                </div>
                {!isEditing && (
                  <Button
                    onClick={handleEditClick}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {/* Email */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
              <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{profile.email || 'Não informado'}</p>
                    </div>
                  </div>
                  <Button
                      onClick={async () => {
                        const needsReauth = await checkAndRedirect('email')
                        if (!needsReauth) {
                          window.location.href = '/alterar-email'
                        }
                      }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Alterar
                  </Button>
              </div>

                {/* Nome */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
              <div>
                      <p className="text-sm font-medium text-gray-900">Nome</p>
                {isEditing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="mt-1 h-8 text-sm"
                          placeholder="Digite seu nome completo"
                  />
                ) : (
                        <p className="text-sm text-gray-600">{profile.full_name || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
              </div>

                {/* Telefone */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
              <div>
                      <p className="text-sm font-medium text-gray-900">Telefone</p>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1 h-8 text-sm"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                        <p className="text-sm text-gray-600">{profile.phone || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
              </div>

                {/* Biografia */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-900">Biografia</p>
                  </div>
                {isEditing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="text-sm"
                      placeholder="Conte um pouco sobre você..."
                      rows={2}
                  />
                ) : (
                    <p className="text-sm text-gray-600">{profile.bio || 'Não informado'}</p>
                  )}
                </div>
              </div>

              {/* Botões de ação */}
              {isEditing && (
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                  <Button
                    onClick={handleCancel}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localização - Compacto */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Localização</h3>
                </div>
                {!isEditingLocation && (
                  <Button
                    onClick={handleEditLocationClick}
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {/* Estado e Cidade */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">Estado</p>
                  {isEditingLocation ? (
                    <EstadoCombobox
                      value={formData.location_state}
                      onValueChange={(value) => {
                        setSelectedState(value)
                        setFormData({ ...formData, location_state: value, location_city: '' })
                      }}
                        placeholder="Selecione"
                        className="h-8 text-sm"
                    />
                  ) : (
                      <p className="text-sm text-gray-900">{profile.location_state || 'Não informado'}</p>
                  )}
                </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">Cidade</p>
                  {isEditingLocation ? (
                    <CidadeCombobox
                      value={formData.location_city}
                      onValueChange={(value) => {
                        setFormData({ ...formData, location_city: value })
                      }}
                      estadoSigla={formData.location_state}
                        placeholder="Selecione"
                      disabled={!formData.location_state}
                        className="h-8 text-sm"
                    />
                  ) : (
                      <p className="text-sm text-gray-900">{profile.location_city || 'Não informado'}</p>
                  )}
                </div>
              </div>

                {/* Bairro e Endereço */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">Bairro</p>
                  {isEditingLocation ? (
                    <Input
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="Digite o bairro"
                    />
                  ) : (
                      <p className="text-sm text-gray-900">{profile.neighborhood || 'Não informado'}</p>
                  )}
                </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">Endereço</p>
                  {isEditingLocation ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="Digite o endereço"
                    />
                  ) : (
                      <p className="text-sm text-gray-900">{profile.address || 'Não informado'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              {isEditingLocation && (
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                  <Button
                    onClick={handleCancelLocation}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveLocation}
                    disabled={isSavingLocation}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSavingLocation ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita */}
            <div className="space-y-4">
          {/* Dados Profissionais - Compacto */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Dados Profissionais</h3>
                </div>
                {!isEditingProfessional && (
                  <Button
                    onClick={handleEditProfessional}
                    size="sm"
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>

              {isEditingProfessional ? (
                <div className="space-y-3">
                  {/* Experiência */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-2">Anos de experiência</p>
                    <Select
                      value={formData.professional_experience_years.toString()}
                      onValueChange={(value) => setFormData({ ...formData, professional_experience_years: parseInt(value, 10) })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 51 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i} {i === 1 ? 'ano' : 'anos'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Serviços */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-2">Serviços oferecidos</p>
                    <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left hover:border-gray-400 transition-colors flex items-center justify-between"
                        >
                          <span className="text-gray-900">
                            {formData.professional_services?.length === 0
                              ? "Selecione os serviços..."
                              : `${formData.professional_services?.length || 0} serviço(s) selecionado(s)`}
                          </span>
                          <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <Command>
                          <CommandInput placeholder="Buscar serviços..." className="border-b border-gray-200" />
                          <CommandList>
                            <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                            <CommandGroup>
                              {serviceCategoryNames.map((service) => (
                                <CommandItem
                                  key={service}
                                  value={service}
                                  onSelect={() => {
                                    handleServiceToggle(service)
                                  }}
                                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                                >
                                  <Check
                                    size={16} className={cn(
                                      "mr-2",
                                      formData.professional_services?.includes(service) ? "opacity-100" : "opacity-0"
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
                    
                    {/* Serviços selecionados */}
                    {formData.professional_services && formData.professional_services.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-gray-700 font-medium">Serviços selecionados:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.professional_services.map((service) => (
                            <Badge
                              key={service}
                              variant="secondary"
                              className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1 text-xs"
                            >
                              <span className="text-xs">{service}</span>
                              <button
                                type="button"
                                onClick={() => removeService(service)}
                                className="text-blue-700 hover:text-red-600 ml-1"
                              >
                                <X size={10} />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Aviso sobre conversão para profissional */}
                  {profile?.user_type === 'client' && formData.professional_services && formData.professional_services.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-blue-800 font-medium">
                          🎉 Você se tornará um profissional ao salvar!
                        </p>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Ao salvar com serviços selecionados, seu perfil será automaticamente convertido para profissional.
                      </p>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      onClick={handleCancelProfessional}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveProfessional}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {profile?.user_type === 'client' && formData.professional_services && formData.professional_services.length > 0 
                        ? 'Tornar-se Profissional' 
                        : 'Salvar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Experiência */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                        <p className="text-sm font-medium text-gray-900">Experiência</p>
                        <p className="text-sm text-gray-600">{profile.professional_experience_years || 0} anos</p>
                      </div>
                    </div>
                  </div>

                  {/* Serviços */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-2">Serviços oferecidos</p>
                      {profile.professional_services && profile.professional_services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {profile.professional_services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                          </Badge>
                          ))}
                        </div>
                      ) : (
                      <p className="text-sm text-gray-500">Nenhum serviço cadastrado</p>
                      )}
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Perfil Público - Compacto */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-orange-600" />
            </div>
                <h3 className="font-semibold text-gray-900">Perfil Público</h3>
              </div>

              <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{profile?.full_name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                  </Badge>
                  </div>
                </div>

              <div className="flex gap-2">
                <Button
                  onClick={copyProfileLink}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar link
                </Button>
                <Button
                  onClick={shareProfile}
                  size="sm"
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas - Compacto */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
            </div>
                <h3 className="font-semibold text-gray-900">Estatísticas</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Award className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Badge</p>
                  <p className="text-sm font-semibold text-gray-900">{profile?.badge || 'Bronze'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Perfil</p>
                  <p className="text-sm font-semibold text-gray-900">{profile?.profile_completion_score || '25%'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Membro desde</p>
                  <p className="text-sm font-semibold text-gray-900">{getMemberSince().split(' ')[2]}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Atualizado</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'Nunca'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProfilePageLayout>
  )
}
