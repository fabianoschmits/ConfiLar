'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { ProfilePageLayout, ProfileSection, ProfileInfo, ProfileStats } from '@/components/layout/ProfilePageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { IconUpload, IconRefresh } from '@tabler/icons-react'
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
  Award
} from 'lucide-react'
import { useAutoReauthentication } from '@/components/auth/AutoReauthentication'
import { toast } from 'sonner'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'

export default function EditarPerfilPage() {
  const { profile, updateProfile, uploadAvatar } = useAuthContext()
  const { checkAndRedirect } = useAutoReauthentication()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [isEditingProfessional, setIsEditingProfessional] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [_selectedState, setSelectedState] = useState(profile?.location_state || '')
  const [mounted, setMounted] = useState(false)
  
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
      const result = await updateProfile(formData)
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
      const professionalData = {
        professional_experience_years: formData.professional_experience_years,
        professional_services: formData.professional_services
      }
      const result = await updateProfile(professionalData)
      if (result.error) {
        toast.error('Erro ao atualizar dados profissionais: ' + result.error.message)
      } else {
        const wasClient = profile?.user_type === 'client'
        const hasServices = formData.professional_services && formData.professional_services.length > 0
        
        if (wasClient && hasServices) {
          toast.success('🎉 Parabéns! Você agora é um profissional!')
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
    setIsGeneratingAvatar(true)
    try {
      const encodedName = encodeURIComponent(name)
      const facialHairProbability = gender === 'male' ? '30' : gender === 'female' ? '0' : '15'
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodedName}&backgroundColor=transparent&size=100&facialHairProbability=${facialHairProbability}`
      setDicebearAvatar(avatarUrl)
      console.log('🎨 Avatar atualizado:', avatarUrl)
    } catch (error) {
      console.error('Erro ao gerar avatar Dicebear:', error)
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
      toast.error('NENHUM AVATAR SELECIONADO')
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
        toast.success('AVATAR ATUALIZADO COM SUCESSO!')
      }
    } catch (error) {
      console.error('Erro ao salvar avatar:', error)
      toast.error('ERRO INESPERADO AO SALVAR AVATAR')
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
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
      {/* Card de Foto do Perfil */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <ProfileSection
            title="Foto do Perfil"
            description="Atualize sua foto de perfil"
            icon={<User className="h-5 w-5 text-yellow-400" />}
          >
            <div className="space-y-4">
              {/* Preview do Avatar Selecionado */}
              {selectedAvatar && (
                <div className="flex items-center gap-3 p-3 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="w-12 h-12 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <img
                      src={selectedAvatar.preview}
                      alt="Avatar selecionado"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black text-black uppercase">
                      {selectedAvatar.type === 'upload' ? 'FOTO ENVIADA' : 'AVATAR GERADO'}
                    </p>
                    <p className="text-xs text-black font-bold">
                      {selectedAvatar.type === 'upload' && (selectedAvatar.value as File).name}
                      {selectedAvatar.type === 'dicebear' && 'GERADO AUTOMATICAMENTE'}
                    </p>
                  </div>
                </div>
              )}

              {/* Avatar Atual */}
              <div className="flex items-center gap-3 p-3 bg-gray-100 border-2 border-black">
                <div className="w-12 h-12 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Avatar'} />
                    <AvatarFallback className="text-sm bg-yellow-400 text-black font-black">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-black text-black uppercase">AVATAR ATUAL</p>
                  <p className="text-xs text-black font-bold">
                    {profile?.avatar_url ? 'FOTO PERSONALIZADA' : 'AVATAR PADRÃO'}
                  </p>
                </div>
              </div>

              {/* Opções de Avatar */}
              <div className="grid grid-cols-2 gap-3">
                {/* Upload de Foto */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <IconUpload size={12} stroke={2} className="text-black" />
                    <span className="text-xs font-black text-black uppercase">UPLOAD</span>
                  </div>
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
                      "block w-full p-2 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-center bg-white",
                      selectedAvatar?.type === 'upload' && "bg-yellow-400"
                    )}
                  >
                    <div className="text-xs text-black font-black uppercase">
                      {selectedAvatar?.type === 'upload' ? '✓ SELECIONADO' : 'ESCOLHER ARQUIVO'}
                    </div>
                  </label>
                </div>

                {/* Avatar Pixel-Art */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <IconRefresh size={12} stroke={2} className={cn("text-black", isGeneratingAvatar && "animate-spin")} />
                    <span className="text-xs font-black text-black uppercase">PIXEL-ART</span>
                  </div>
                  {profile?.full_name && profile.full_name.length >= 2 ? (
                    <button
                      type="button"
                      onClick={handleDicebearSelect}
                      disabled={isGeneratingAvatar || !dicebearAvatar}
                      className={cn(
                        "w-full p-2 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-center bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                        selectedAvatar?.type === 'dicebear' && "bg-yellow-400",
                        (isGeneratingAvatar || !dicebearAvatar) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isGeneratingAvatar ? (
                        <div className="text-xs text-black font-black uppercase">GERANDO...</div>
                      ) : dicebearAvatar ? (
                        <div className="text-xs text-black font-black uppercase">✓ SELECIONADO AUTOMATICAMENTE</div>
                      ) : (
                        <div className="text-xs text-black font-black uppercase">DIGITE NOME</div>
                      )}
                    </button>
                  ) : (
                    <div className="w-full p-2 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center bg-white">
                      <div className="text-xs text-black font-black uppercase">DIGITE NOME</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de Salvar */}
              {selectedAvatar && (
                <Button
                  onClick={handleAvatarSave}
                  className="w-full bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                >
                  <Save className="h-4 w-4 mr-2" />
                  SALVAR AVATAR
                </Button>
              )}

              {/* Informações */}
              <div className="text-xs text-black font-bold text-center">
                <p>FORMATOS SUPORTADOS: JPEG, PNG, WEBP</p>
                <p>TAMANHO MÁXIMO: 5MB</p>
              </div>
            </div>
          </ProfileSection>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <ProfileSection
            title="Informações Básicas"
            description="Dados pessoais e informações de contato"
            icon={<User className="h-5 w-5 text-yellow-400" />}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-black text-black">EMAIL</Label>
                <div className="mt-1 p-3 bg-gray-100 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-black" />
                      <span className="text-sm font-bold text-black">{profile.email || 'Não informado'}</span>
                    </div>
                    <button
                      onClick={async () => {
                        const needsReauth = await checkAndRedirect('email')
                        if (!needsReauth) {
                          // Se não precisa de reautenticação, redirecionar para página de alterar email
                          window.location.href = '/alterar-email'
                        }
                      }}
                      className="px-3 py-1 text-xs font-black text-white bg-blue-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      ALTERAR
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-black font-bold">
                    ⚠️ Para alterar o email, será necessário confirmar sua identidade
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="full_name" className="text-sm font-black text-black">NOME COMPLETO</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="mt-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-black"
                    placeholder="DIGITE SEU NOME COMPLETO"
                  />
                ) : (
                  <ProfileInfo
                    label="Nome Completo"
                    value={profile.full_name || 'Não informado'}
                    icon={<User className="h-4 w-4" />}
                    editable={true}
                    onEdit={handleEditClick}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-black text-black">TELEFONE</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-black"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <ProfileInfo
                    label="Telefone"
                    value={profile.phone || 'Não informado'}
                    icon={<Phone className="h-4 w-4" />}
                    editable={true}
                    onEdit={handleEditClick}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-black text-black">BIOGRAFIA</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-black"
                    placeholder="CONTE UM POUCO SOBRE VOCÊ..."
                    rows={3}
                  />
                ) : (
                  <ProfileInfo
                    label="Biografia"
                    value={profile.bio || 'Não informado'}
                    icon={<User className="h-4 w-4" />}
                    editable={true}
                    onEdit={handleEditClick}
                  />
                )}
              </div>

              {/* Botões de ação */}
              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4 border-t-4 border-black">
                  <Button
                    onClick={handleCancel}
                    className="bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    <X className="h-4 w-4 mr-2" />
                    CANCELAR
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    SALVAR
                  </Button>
                </div>
              )}
            </div>
          </ProfileSection>

          {/* Localização */}
          <ProfileSection
            title="Localização"
            description="Informações de endereço e localização"
            icon={<MapPin className="h-5 w-5 text-yellow-400" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location_state" className="text-sm font-black text-black">ESTADO</Label>
                  {isEditingLocation ? (
                    <EstadoCombobox
                      value={formData.location_state}
                      onValueChange={(value) => {
                        setSelectedState(value)
                        setFormData({ ...formData, location_state: value, location_city: '' })
                      }}
                      placeholder="SELECIONE O ESTADO"
                      className="mt-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black"
                    />
                  ) : (
                    <ProfileInfo
                      label="Estado"
                      value={profile.location_state || 'Não informado'}
                      icon={<MapPin className="h-4 w-4" />}
                      editable={true}
                      onEdit={handleEditLocationClick}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="location_city" className="text-sm font-black text-black">CIDADE</Label>
                  {isEditingLocation ? (
                    <CidadeCombobox
                      value={formData.location_city}
                      onValueChange={(value) => {
                        setFormData({ ...formData, location_city: value })
                      }}
                      estadoSigla={formData.location_state}
                      placeholder="SELECIONE A CIDADE"
                      disabled={!formData.location_state}
                      className="mt-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black"
                    />
                  ) : (
                    <ProfileInfo
                      label="Cidade"
                      value={profile.location_city || 'Não informado'}
                      icon={<MapPin className="h-4 w-4" />}
                      editable={true}
                      onEdit={handleEditLocationClick}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neighborhood" className="text-sm font-black text-black">BAIRRO</Label>
                  {isEditingLocation ? (
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="mt-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-black"
                      placeholder="DIGITE SEU BAIRRO"
                    />
                  ) : (
                    <ProfileInfo
                      label="Bairro"
                      value={profile.neighborhood || 'Não informado'}
                      icon={<MapPin className="h-4 w-4" />}
                      editable={true}
                      onEdit={handleEditLocationClick}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-black text-black">ENDEREÇO</Label>
                  {isEditingLocation ? (
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-black"
                      placeholder="DIGITE SEU ENDEREÇO COMPLETO"
                    />
                  ) : (
                    <ProfileInfo
                      label="Endereço"
                      value={profile.address || 'Não informado'}
                      icon={<MapPin className="h-4 w-4" />}
                      editable={true}
                      onEdit={handleEditLocationClick}
                    />
                  )}
                </div>
              </div>

              {/* Botões de ação */}
              {isEditingLocation && (
                <div className="flex justify-end space-x-2 pt-4 border-t-4 border-black">
                  <Button
                    onClick={handleCancelLocation}
                    className="bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    <X className="h-4 w-4 mr-2" />
                    CANCELAR
                  </Button>
                  <Button
                    onClick={handleSaveLocation}
                    disabled={isSavingLocation}
                    className="bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    {isSavingLocation ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    SALVAR
                  </Button>
                </div>
              )}
            </div>
          </ProfileSection>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Dados Profissionais */}
          <ProfileSection
            title="Dados Profissionais"
            description="Informações sobre seus serviços e experiência"
            icon={<Building2 className="h-5 w-5 text-yellow-400" />}
          >
            <div className="space-y-4">
              {isEditingProfessional ? (
                <>
                  <div>
                    <Label htmlFor="experience_years" className="text-sm font-black text-black">ANOS DE EXPERIÊNCIA</Label>
                    <Select
                      value={formData.professional_experience_years.toString()}
                      onValueChange={(value) => setFormData({ ...formData, professional_experience_years: parseInt(value, 10) })}
                    >
                      <SelectTrigger className="mt-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black">
                        <SelectValue placeholder="SELECIONE" />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-black">
                        {Array.from({ length: 51 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()} className="font-black">
                            {i} {i === 1 ? 'ANO' : 'ANOS'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="services" className="text-sm font-black text-black">SERVIÇOS OFERECIDOS</Label>
                    <div className="mt-1 p-3 border-4 border-black bg-gray-100 max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {['Diarista', 'Faxineira', 'Pedreiro', 'Pintor', 'Eletricista', 'Encanador', 'Jardineiro', 'Cabeleireiro'].map((service) => (
                          <div key={service} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={service}
                              checked={formData.professional_services?.includes(service) || false}
                              onChange={(e) => {
                                const currentServices = formData.professional_services || []
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    professional_services: [...currentServices, service]
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    professional_services: currentServices.filter(s => s !== service)
                                  })
                                }
                              }}
                              className="rounded border-2 border-black"
                            />
                            <label htmlFor={service} className="text-sm font-bold text-black">{service}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex justify-end space-x-2 pt-4 border-t-4 border-black">
                    <Button
                      onClick={handleCancelProfessional}
                      className="bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                    >
                      <X className="h-4 w-4 mr-2" />
                      CANCELAR
                    </Button>
                    <Button
                      onClick={handleSaveProfessional}
                      className="bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      SALVAR
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <ProfileInfo
                    label="Experiência"
                    value={`${profile.professional_experience_years || 0} anos`}
                    icon={<Clock className="h-4 w-4" />}
                    editable={true}
                    onEdit={handleEditProfessional}
                  />

                  <div>
                    <Label className="text-sm font-black text-black">SERVIÇOS OFERECIDOS</Label>
                    <div className="mt-2">
                      {profile.professional_services && profile.professional_services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {profile.professional_services.map((service, index) => (
                            <div key={index} className="px-2 py-1 bg-yellow-400 text-black border-2 border-black font-black text-xs">
                              {service}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-black font-bold text-sm">NENHUM SERVIÇO CADASTRADO</p>
                      )}
                    </div>
                    <Button
                      onClick={handleEditProfessional}
                      className="mt-2 bg-blue-500 text-white border-2 border-black hover:bg-blue-600 font-black"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      EDITAR SERVIÇOS
                    </Button>
                  </div>
                </>
              )}
            </div>
          </ProfileSection>

          {/* Perfil Público */}
          <ProfileSection
            title="Perfil Público"
            description="Compartilhe seu perfil com outros usuários"
            icon={<Share2 className="h-5 w-5 text-yellow-400" />}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-black border-2 border-black">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="text-sm bg-yellow-400 text-black font-black">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="font-black text-black">{profile?.full_name}</p>
                  <div className="px-2 py-1 bg-yellow-400 text-black border-2 border-black font-black text-xs">
                    {profile?.user_type === 'professional' ? 'PROFISSIONAL' : 'CLIENTE'}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={copyProfileLink}
                  className="flex-1 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  COPIAR LINK
                </Button>
                <Button
                  onClick={shareProfile}
                  className="flex-1 bg-blue-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  COMPARTILHAR
                </Button>
              </div>
            </div>
          </ProfileSection>

          {/* Estatísticas */}
          <ProfileSection
            title="Estatísticas"
            description="Informações sobre seu perfil"
            icon={<BarChart3 className="h-5 w-5 text-yellow-400" />}
          >
            <ProfileStats
              stats={[
                {
                  label: 'Badge',
                  value: profile?.badge || 'Bronze',
                  icon: <Award className="h-5 w-5" />,
                  color: 'text-yellow-600'
                },
                {
                  label: 'Perfil Completo',
                  value: profile?.profile_completion_score || '25%',
                  icon: <CheckCircle className="h-5 w-5" />,
                  color: 'text-green-600'
                },
                {
                  label: 'Membro desde',
                  value: getMemberSince(),
                  icon: <Calendar className="h-5 w-5" />,
                  color: 'text-blue-600'
                },
                {
                  label: 'Última atualização',
                  value: profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR') : 'Nunca',
                  icon: <Clock className="h-5 w-5" />,
                  color: 'text-gray-600'
                }
              ]}
            />
          </ProfileSection>
        </div>
      </div>
    </ProfilePageLayout>
  )
}
