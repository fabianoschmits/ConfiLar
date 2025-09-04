'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { ProfilePageLayout, ProfileSection, ProfileInfo, ProfileStats } from '@/components/layout/ProfilePageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
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
import { toast } from 'sonner'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'

export default function EditarPerfilPage() {
  const { profile, updateProfile, uploadAvatar } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [isEditingProfessional, setIsEditingProfessional] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [selectedState, setSelectedState] = useState(profile?.location_state || '')
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast.error('Erro inesperado ao fazer upload da foto')
      return { data: null, error: { message: 'Erro inesperado' } }
    }
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
      <ProfileSection
        title="Foto do Perfil"
        description="Atualize sua foto de perfil"
        icon={<User className="h-5 w-5 text-blue-600" />}
      >
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24 border-4 border-blue-100">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Avatar'} />
            <AvatarFallback className="text-xl bg-blue-100 text-blue-600">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="w-full max-w-xs">
            <AvatarUpload
              currentAvatarUrl={formData.avatar_url || profile.avatar_url}
              onUpload={handleAvatarUpload}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Formatos: JPEG, PNG, WebP. Máx: 5MB
            </p>
          </div>
        </div>
      </ProfileSection>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <ProfileSection
            title="Informações Básicas"
            description="Dados pessoais e informações de contato"
            icon={<User className="h-5 w-5 text-blue-600" />}
          >
            <div className="space-y-4">
              <ProfileInfo
                label="Email"
                value={profile.email || 'Não informado'}
                icon={<Mail className="h-4 w-4" />}
                editable={false}
              />

              <div>
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Nome Completo</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="mt-1"
                    placeholder="Digite seu nome completo"
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
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
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
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Biografia</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1"
                    placeholder="Conte um pouco sobre você..."
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
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </ProfileSection>

          {/* Localização */}
          <ProfileSection
            title="Localização"
            description="Informações de endereço e localização"
            icon={<MapPin className="h-5 w-5 text-blue-600" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location_state" className="text-sm font-medium text-gray-700">Estado</Label>
                  {isEditingLocation ? (
                    <EstadoCombobox
                      value={formData.location_state}
                      onValueChange={(value) => {
                        setSelectedState(value)
                        setFormData({ ...formData, location_state: value, location_city: '' })
                      }}
                      placeholder="Selecione o estado"
                      className="mt-1"
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
                  <Label htmlFor="location_city" className="text-sm font-medium text-gray-700">Cidade</Label>
                  {isEditingLocation ? (
                    <CidadeCombobox
                      value={formData.location_city}
                      onValueChange={(value) => {
                        setFormData({ ...formData, location_city: value })
                      }}
                      estadoSigla={formData.location_state}
                      placeholder="Selecione a cidade"
                      disabled={!formData.location_state}
                      className="mt-1"
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
                  <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">Bairro</Label>
                  {isEditingLocation ? (
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="mt-1"
                      placeholder="Digite seu bairro"
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
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Endereço</Label>
                  {isEditingLocation ? (
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1"
                      placeholder="Digite seu endereço completo"
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
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelLocation}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveLocation}
                    disabled={isSavingLocation}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSavingLocation ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
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
            icon={<Building2 className="h-5 w-5 text-blue-600" />}
          >
            <div className="space-y-4">
              {isEditingProfessional ? (
                <>
                  <div>
                    <Label htmlFor="experience_years" className="text-sm font-medium text-gray-700">Anos de Experiência</Label>
                    <Select
                      value={formData.professional_experience_years.toString()}
                      onValueChange={(value) => setFormData({ ...formData, professional_experience_years: parseInt(value, 10) })}
                    >
                      <SelectTrigger className="mt-1">
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

                  <div>
                    <Label htmlFor="services" className="text-sm font-medium text-gray-700">Serviços Oferecidos</Label>
                    <div className="mt-1 p-3 border rounded-md max-h-32 overflow-y-auto">
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
                              className="rounded"
                            />
                            <label htmlFor={service} className="text-sm">{service}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelProfessional}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveProfessional}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
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
                    <Label className="text-sm font-medium text-gray-700">Serviços Oferecidos</Label>
                    <div className="mt-2">
                      {profile.professional_services && profile.professional_services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {profile.professional_services.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Nenhum serviço cadastrado</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditProfessional}
                      className="mt-2"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Serviços
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
            icon={<Share2 className="h-5 w-5 text-blue-600" />}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="text-sm bg-blue-100 text-blue-600">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{profile?.full_name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={copyProfileLink}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button
                  variant="outline"
                  onClick={shareProfile}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </ProfileSection>

          {/* Estatísticas */}
          <ProfileSection
            title="Estatísticas"
            description="Informações sobre seu perfil"
            icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
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
