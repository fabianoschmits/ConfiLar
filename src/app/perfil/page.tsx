'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Calendar, 
  Edit, 
  Save, 
  X, 
  Copy,
  Share2,
  Building2,
  Star,
  Award,
  Clock,
  BarChart3,
  Settings
} from 'lucide-react'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeIn } from '@/components/animations/FadeIn'
import { toast } from 'sonner'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'

export default function ProfilePage() {
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
    // REMOVIDO: emergency_service, insurance_coverage (não existem na tabela)
  })

  // Estados removidos - usando API do IBGE

  // Sincronizar dados quando o perfil mudar (apenas se não estiver editando)
  useEffect(() => {
    if (profile && !isEditing && !isEditingLocation) {
      console.log('🔄 Sincronizando formData com perfil atualizado:', profile)
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
        // REMOVIDO: emergency_service, insurance_coverage
      })
      
      setSelectedState(profile.location_state || '')
    }
  }, [profile, isEditing, isEditingLocation])

  // Função para carregar dados existentes no modo de edição
  const handleEditClick = () => {
    // Carregar dados existentes do perfil no formData
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
      // REMOVIDO: emergency_service, insurance_coverage
    })
    
    // Atualizar estados de localização
    setSelectedState(profile?.location_state || '')
    
    // Ativar modo de edição
    setIsEditing(true)
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" style={{ animationDuration: '0.6s' }}></div>
            <p className="mt-3 text-gray-600">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const handleSave = async () => {
    console.log('🔄 Iniciando salvamento do perfil...')
    console.log('📋 Dados do formData:', formData)
    console.log('👤 Profile atual:', profile)
    console.log('🔗 updateProfile function:', updateProfile)
    
    if (!updateProfile) {
      console.error('❌ Função updateProfile não está disponível!')
      toast.error('Erro: função de atualização não disponível')
      return
    }

    setIsSaving(true)

    try {
      console.log('📞 Chamando updateProfile...')
      const result = await updateProfile(formData)
      console.log('📤 Resultado do updateProfile:', result)
      
      if (result?.error) {
        console.error('❌ Erro ao atualizar perfil:', result.error)
        toast.error('Erro ao atualizar perfil: ' + result.error.message)
      } else {
        console.log('✅ Perfil atualizado com sucesso!')
        toast.success('Perfil atualizado com sucesso!')
        setIsEditing(false)
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar perfil:', error)
      toast.error('Erro inesperado ao atualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Restaurar dados originais do perfil
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
      // REMOVIDO: emergency_service, insurance_coverage
    })
    
    // Restaurar estados de localização
    setSelectedState(profile?.location_state || '')
    
    // Desativar modo de edição
    setIsEditing(false)
  }

  const handleEditLocationClick = () => {
    // Carregar dados existentes de localização no formData
    setFormData({
      ...formData,
      location_state: profile?.location_state || '',
      location_city: profile?.location_city || '',
      neighborhood: profile?.neighborhood || '',
      address: profile?.address || ''
    })
    
    // Atualizar estado de localização
    setSelectedState(profile?.location_state || '')
    
    // Ativar modo de edição de localização
    setIsEditingLocation(true)
  }

  const handleCancelLocation = () => {
    // Restaurar dados originais de localização
    setFormData({
      ...formData,
      location_state: profile?.location_state || '',
      location_city: profile?.location_city || '',
      neighborhood: profile?.neighborhood || '',
      address: profile?.address || ''
    })
    
    // Restaurar estado de localização
    setSelectedState(profile?.location_state || '')
    
    // Desativar modo de edição de localização
    setIsEditingLocation(false)
  }

  const handleSaveLocation = async () => {
    console.log('🔄 Iniciando salvamento da localização...')
    
    if (!updateProfile) {
      console.error('❌ Função updateProfile não está disponível!')
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

      console.log('📞 Chamando updateProfile para localização...')
      const result = await updateProfile(locationData)
      console.log('📤 Resultado do updateProfile:', result)
      
      if (result?.error) {
        console.error('❌ Erro ao atualizar localização:', result.error)
        toast.error('Erro ao atualizar localização: ' + result.error.message)
      } else {
        console.log('✅ Localização atualizada com sucesso!')
        toast.success('Localização atualizada com sucesso!')
        setIsEditingLocation(false)
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar localização:', error)
      toast.error('Erro inesperado ao atualizar localização')
    } finally {
      setIsSavingLocation(false)
    }
  }

  const handleEditProfessional = () => {
    setIsEditingProfessional(true)
  }

  const handleCancelProfessional = () => {
    // Restaurar dados profissionais originais
    setFormData({
      ...formData,
      professional_experience_years: profile?.professional_experience_years || 0,
      professional_services: profile?.professional_services || []
      // REMOVIDO: emergency_service, insurance_coverage
    })
    setIsEditingProfessional(false)
  }

  const handleSaveProfessional = async () => {
    console.log('🔄 Salvando dados profissionais...')
    
    try {
      const professionalData = {
        professional_experience_years: formData.professional_experience_years,
        professional_services: formData.professional_services
        // REMOVIDO: emergency_service, insurance_coverage
      }
      
      const result = await updateProfile(professionalData)
      
      if (result.error) {
        toast.error('Erro ao atualizar dados profissionais: ' + result.error.message)
      } else {
        // Verificar se o usuário se tornou profissional
        const wasClient = profile?.user_type === 'client'
        const hasServices = formData.professional_services && formData.professional_services.length > 0
        
        if (wasClient && hasServices) {
          toast.success('🎉 Parabéns! Você agora é um profissional!')
        } else if (wasClient && !hasServices) {
          toast.success('Dados profissionais atualizados com sucesso!')
        } else if (profile?.user_type === 'professional' && !hasServices) {
          toast.success('Dados atualizados. Você voltou a ser cliente.')
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

    // Funções removidas - usando API do IBGE

  // Handlers para upload de avatar
  const handleAvatarUpload = async (file: File) => {
    try {
      const result = await uploadAvatar(file)
      
      if (result.error) {
        toast.error(result.error.message)
        return result
      }
      
      if (result.data) {
        // Atualizar formData com a nova URL para mostrar na seção compartilhar perfil
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
    <MainLayout>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <FadeIn>
              <div className="text-center mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Meu Perfil</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Gerencie suas informações pessoais e profissionais
                </p>
              </div>

              {/* Card de Foto do Perfil - Sempre Visível */}
              <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-2 text-xl">
                    <User className="h-6 w-6" />
                    <span>Foto do Perfil</span>
                  </CardTitle>
                  <CardDescription>
                    Atualize sua foto de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-6">
                    {/* Avatar atual */}
                    <div className="flex-shrink-0">
                      <Avatar className="w-32 h-32 border-4 border-blue-100">
                        <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Avatar'} />
                        <AvatarFallback className="text-3xl bg-blue-100 text-blue-600">
                          {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Upload component */}
                    <div className="w-full max-w-md">
                      <AvatarUpload
                      currentAvatarUrl={formData.avatar_url || profile.avatar_url}
                      onUpload={handleAvatarUpload}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Clique para alterar sua foto. Formatos suportados: JPEG, PNG, WebP. Tamanho máximo: 5MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout em duas colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna Esquerda - Informações Principais */}
              <div className="lg:col-span-2 space-y-6">
                {/* Card de Informações Básicas */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Informações Básicas</span>
                      </CardTitle>
                      <CardDescription>
                        Dados pessoais e informações de contato
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              console.log('🔘 Botão Salvar clicado!')
                              handleSave()
                            }}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Salvar
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditClick}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Email - Somente Leitura */}
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <p className="text-gray-900 font-medium mt-1">
                        {profile.email || 'Não informado'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        O email não pode ser alterado por questões de segurança
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nome Completo */}
                      <div>
                        <Label htmlFor="full_name">Nome Completo</Label>
                        {isEditing ? (
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="mt-1"
                            placeholder="Digite seu nome completo"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">
                            {profile.full_name || 'Não informado'}
                          </p>
                        )}
                      </div>

                      {/* Telefone */}
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="mt-1"
                            placeholder="(11) 99999-9999"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">
                            {profile.phone || 'Não informado'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Biografia */}
                    <div>
                      <Label htmlFor="bio">Biografia</Label>
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
                        <p className="text-gray-900 font-medium mt-1">
                          {profile.bio || 'Não informado'}
                        </p>
                      )}
                    </div>


                  </CardContent>
                </Card>

                {/* Card de Localização */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Localização</span>
                      </CardTitle>
                      <CardDescription>
                        Informações de endereço e localização
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditingLocation ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelLocation}
                          >
                            <X className="h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveLocation}
                            disabled={isSavingLocation}
                          >
                            {isSavingLocation ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Salvar
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditLocationClick}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Estado */}
                      <div>
                        <Label htmlFor="location_state">Estado</Label>
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
                          <p className="text-gray-900 font-medium mt-1">
                            {profile.location_state || 'Não informado'}
                          </p>
                        )}
                      </div>

                      {/* Cidade */}
                      <div>
                        <Label htmlFor="location_city">Cidade</Label>
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
                          <p className="text-gray-900 font-medium mt-1">
                            {profile.location_city || 'Não informado'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bairro */}
                      <div>
                        <Label htmlFor="neighborhood">Bairro</Label>
                        {isEditingLocation ? (
                          <Input
                            id="neighborhood"
                            value={formData.neighborhood}
                            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                            className="mt-1"
                            placeholder="Digite seu bairro"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">
                            {profile.neighborhood || 'Não informado'}
                          </p>
                        )}
                      </div>

                      {/* Endereço */}
                      <div>
                        <Label htmlFor="address">Endereço</Label>
                        {isEditingLocation ? (
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="mt-1"
                            placeholder="Digite seu endereço completo"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">
                            {profile.address || 'Não informado'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Dados Profissionais - Sempre Visível */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5" />
                        <span>Dados Profissionais</span>
                      </CardTitle>
                      <CardDescription>
                        Informações sobre seus serviços e experiência
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditingProfessional ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelProfessional}
                          >
                            <X className="h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveProfessional}
                          >
                            <Save className="h-4 w-4" />
                            Salvar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditProfessional}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditingProfessional ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Anos de Experiência */}
                          <div>
                            <Label htmlFor="experience_years">Anos de Experiência</Label>
                            <Select
                              value={formData.professional_experience_years.toString()}
                              onValueChange={(value) => setFormData({ ...formData, professional_experience_years: parseInt(value, 10) })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0 anos</SelectItem>
                                <SelectItem value="1">1 ano</SelectItem>
                                <SelectItem value="2">2 anos</SelectItem>
                                <SelectItem value="3">3 anos</SelectItem>
                                <SelectItem value="4">4 anos</SelectItem>
                                <SelectItem value="5">5 anos</SelectItem>
                                <SelectItem value="6">6 anos</SelectItem>
                                <SelectItem value="7">7 anos</SelectItem>
                                <SelectItem value="8">8 anos</SelectItem>
                                <SelectItem value="9">9 anos</SelectItem>
                                <SelectItem value="10">10 anos</SelectItem>
                                <SelectItem value="11">11 anos</SelectItem>
                                <SelectItem value="12">12 anos</SelectItem>
                                <SelectItem value="13">13 anos</SelectItem>
                                <SelectItem value="14">14 anos</SelectItem>
                                <SelectItem value="15">15 anos</SelectItem>
                                <SelectItem value="16">16 anos</SelectItem>
                                <SelectItem value="17">17 anos</SelectItem>
                                <SelectItem value="18">18 anos</SelectItem>
                                <SelectItem value="19">19 anos</SelectItem>
                                <SelectItem value="20">20 anos</SelectItem>
                                <SelectItem value="21">21 anos</SelectItem>
                                <SelectItem value="22">22 anos</SelectItem>
                                <SelectItem value="23">23 anos</SelectItem>
                                <SelectItem value="24">24 anos</SelectItem>
                                <SelectItem value="25">25 anos</SelectItem>
                                <SelectItem value="26">26 anos</SelectItem>
                                <SelectItem value="27">27 anos</SelectItem>
                                <SelectItem value="28">28 anos</SelectItem>
                                <SelectItem value="29">29 anos</SelectItem>
                                <SelectItem value="30">30 anos</SelectItem>
                                <SelectItem value="31">31 anos</SelectItem>
                                <SelectItem value="32">32 anos</SelectItem>
                                <SelectItem value="33">33 anos</SelectItem>
                                <SelectItem value="34">34 anos</SelectItem>
                                <SelectItem value="35">35 anos</SelectItem>
                                <SelectItem value="36">36 anos</SelectItem>
                                <SelectItem value="37">37 anos</SelectItem>
                                <SelectItem value="38">38 anos</SelectItem>
                                <SelectItem value="39">39 anos</SelectItem>
                                <SelectItem value="40">40 anos</SelectItem>
                                <SelectItem value="41">41 anos</SelectItem>
                                <SelectItem value="42">42 anos</SelectItem>
                                <SelectItem value="43">43 anos</SelectItem>
                                <SelectItem value="44">44 anos</SelectItem>
                                <SelectItem value="45">45 anos</SelectItem>
                                <SelectItem value="46">46 anos</SelectItem>
                                <SelectItem value="47">47 anos</SelectItem>
                                <SelectItem value="48">48 anos</SelectItem>
                                <SelectItem value="49">49 anos</SelectItem>
                                <SelectItem value="50">50 anos</SelectItem>
                                <SelectItem value="51">51 anos</SelectItem>
                                <SelectItem value="52">52 anos</SelectItem>
                                <SelectItem value="53">53 anos</SelectItem>
                                <SelectItem value="54">54 anos</SelectItem>
                                <SelectItem value="55">55 anos</SelectItem>
                                <SelectItem value="56">56 anos</SelectItem>
                                <SelectItem value="57">57 anos</SelectItem>
                                <SelectItem value="58">58 anos</SelectItem>
                                <SelectItem value="59">59 anos</SelectItem>
                                <SelectItem value="60">60 anos</SelectItem>
                                <SelectItem value="61">61 anos</SelectItem>
                                <SelectItem value="62">62 anos</SelectItem>
                                <SelectItem value="63">63 anos</SelectItem>
                                <SelectItem value="64">64 anos</SelectItem>
                                <SelectItem value="65">65 anos</SelectItem>
                                <SelectItem value="66">66 anos</SelectItem>
                                <SelectItem value="67">67 anos</SelectItem>
                                <SelectItem value="68">68 anos</SelectItem>
                                <SelectItem value="69">69 anos</SelectItem>
                                <SelectItem value="70">70 anos</SelectItem>
                                <SelectItem value="71">71 anos</SelectItem>
                                <SelectItem value="72">72 anos</SelectItem>
                                <SelectItem value="73">73 anos</SelectItem>
                                <SelectItem value="74">74 anos</SelectItem>
                                <SelectItem value="75">75 anos</SelectItem>
                                <SelectItem value="76">76 anos</SelectItem>
                                <SelectItem value="77">77 anos</SelectItem>
                                <SelectItem value="78">78 anos</SelectItem>
                                <SelectItem value="79">79 anos</SelectItem>
                                <SelectItem value="80">80 anos</SelectItem>
                                <SelectItem value="81">81 anos</SelectItem>
                                <SelectItem value="82">82 anos</SelectItem>
                                <SelectItem value="83">83 anos</SelectItem>
                                <SelectItem value="84">84 anos</SelectItem>
                                <SelectItem value="85">85 anos</SelectItem>
                                <SelectItem value="86">86 anos</SelectItem>
                                <SelectItem value="87">87 anos</SelectItem>
                                <SelectItem value="88">88 anos</SelectItem>
                                <SelectItem value="89">89 anos</SelectItem>
                                <SelectItem value="90">90 anos</SelectItem>
                                <SelectItem value="91">91 anos</SelectItem>
                                <SelectItem value="92">92 anos</SelectItem>
                                <SelectItem value="93">93 anos</SelectItem>
                                <SelectItem value="94">94 anos</SelectItem>
                                <SelectItem value="95">95 anos</SelectItem>
                                <SelectItem value="96">96 anos</SelectItem>
                                <SelectItem value="97">97 anos</SelectItem>
                                <SelectItem value="98">98 anos</SelectItem>
                                <SelectItem value="99">99 anos</SelectItem>
                                <SelectItem value="100">100 anos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Serviços Oferecidos */}
                          <div>
                            <Label htmlFor="services">Serviços Oferecidos</Label>
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
                        </div>

                        {/* REMOVIDO: Checkboxes de emergency_service e insurance_coverage (campos não existem na tabela) */}


                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Experiência:</span>
                            <Badge variant="outline" className="ml-2">
                              {profile.professional_experience_years || 0} anos
                            </Badge>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Serviços:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {profile.professional_services && profile.professional_services.length > 0 ? (
                                profile.professional_services.map((service, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {service}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">Nenhum serviço cadastrado</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* REMOVIDO: Badges de emergency_service e insurance_coverage (campos não existem na tabela) */}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Card de Status Profissional */}
                {profile.user_type === 'client' ? (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-orange-800">
                        <Building2 className="h-5 w-5" />
                        <span>Quer se tornar um Profissional?</span>
                      </CardTitle>
                      <CardDescription className="text-orange-700">
                        Adicione serviços no card acima para se tornar um profissional
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <p className="text-orange-700 mb-4">
                          Para se tornar um profissional, edite os dados profissionais acima e adicione pelo menos um serviço
                        </p>
                        <Button 
                          variant="outline" 
                          className="border-orange-300 text-orange-700 hover:bg-orange-100"
                          onClick={handleEditProfessional}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Editar Dados Profissionais
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-green-800">
                        <Building2 className="h-5 w-5" />
                        <span>✅ Você é um Profissional!</span>
                      </CardTitle>
                      <CardDescription className="text-green-700">
                        Seus serviços estão visíveis para clientes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <p className="text-green-700 mb-4">
                          Parabéns! Você está ativo como profissional. Para voltar a ser cliente, remova todos os serviços.
                        </p>
                        <Button 
                          variant="outline" 
                          className="border-green-300 text-green-700 hover:bg-green-100"
                          onClick={handleEditProfessional}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Gerenciar Serviços
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}




              </div>

              {/* Coluna Direita - Informações Adicionais */}
              <div className="space-y-6">

                {/* Card de Perfil Público */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Share2 className="h-5 w-5" />
                      <span>Perfil Público</span>
                    </CardTitle>
                    <CardDescription>
                      Compartilhe seu perfil com outros usuários
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-semibold text-foreground mb-1">{profile.full_name}</h3>
                      <Badge variant="outline" className="mb-3">
                        {profile.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={copyProfileLink}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={shareProfile}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Estatísticas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Estatísticas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {profile.badge || 'bronze'}
                        </div>
                        <div className="text-sm text-muted-foreground">Badge</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {profile.profile_completion_score || 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Perfil Completo</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">Membro desde</div>
                      <div className="font-semibold text-foreground">{getMemberSince()}</div>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Última atualização:</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR') : 'Nunca'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>
        </div>
      </PageTransition>
      {/* FloatingProfile temporariamente removido para resolver erro */}
      {/* <FloatingProfileWrapper /> */}
    </MainLayout>
  )
}
