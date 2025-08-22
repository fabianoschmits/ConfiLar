'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Camera, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Star,
  Trophy,
  Target,
  Zap
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Profile } from '@/hooks/useAuth'
import { ImageUpload } from '@/components/ui/ImageUpload'

// Schema de validação para completar perfil
const profileCompletionSchema = z.object({
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  bio: z.string().min(20, 'Bio deve ter pelo menos 20 caracteres'),
  address: z.string().min(10, 'Endereço deve ter pelo menos 10 caracteres'),
  address_number: z.string().min(1, 'Número é obrigatório'),
  address_complement: z.string().optional(),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  // Campos opcionais mas recomendados
  profile_photo: z.instanceof(File).optional(),
  selfie_document: z.instanceof(File).optional(),
  residence_proof: z.instanceof(File).optional(),
  // Validação de idade
}).refine((data) => {
  const birthDate = new Date(data.birth_date)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age >= 18
}, {
  message: 'Usuário deve ter pelo menos 18 anos',
  path: ['birth_date']
})

type ProfileCompletionFormData = z.infer<typeof profileCompletionSchema>

import { serviceCategories } from '@/data/serviceCategories'

interface ProfileCompletionFormProps {
  onComplete: () => void
}

export function ProfileCompletionForm({ onComplete }: ProfileCompletionFormProps) {
  const { profile, updateProfile } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [selfieDocumentUrl, setSelfieDocumentUrl] = useState<string | null>(null)
  const [residenceProofUrl, setResidenceProofUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ProfileCompletionFormData>({
    resolver: zodResolver(profileCompletionSchema)
  })

  const watchedValues = watch()

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newServices = prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
      
      // Remover setValue para services_offered que não existe no schema
      return newServices
    })
  }

  const handleProfilePhotoUpload = (url: string) => {
    setProfilePhotoUrl(url)
  }

  const handleSelfieDocumentUpload = (url: string) => {
    setSelfieDocumentUrl(url)
  }

  const handleResidenceProofUpload = (url: string) => {
    setResidenceProofUrl(url)
  }

  const calculateCompletionScore = () => {
    let score = 50 // Score base dos dados básicos
    
          if (watchedValues.phone) score += 5
    if (watchedValues.bio) score += 10
    if (watchedValues.address) score += 5
    if (profilePhotoUrl) score += 10
    if (selfieDocumentUrl) score += 8
    if (residenceProofUrl) score += 7
    if (selectedServices.length > 0) score += Math.min(selectedServices.length * 3, 15)
    
    return Math.min(score, 100)
  }

  const getBadgeByScore = (score: number) => {
    if (score >= 90) return { type: 'gold', label: 'Ouro', icon: '🥇' }
    if (score >= 75) return { type: 'silver', label: 'Prata', icon: '🥈' }
    if (score >= 50) return { type: 'bronze', label: 'Bronze', icon: '🥉' }
    return { type: 'bronze', label: 'Iniciante', icon: '⭐' }
  }

  const completionScore = calculateCompletionScore()
  const badge = getBadgeByScore(completionScore)

  const onSubmit = async (data: ProfileCompletionFormData) => {
    setIsLoading(true)
    try {
      const updates: Partial<Profile> = {
        phone: data.phone,
        bio: data.bio,
        address: `${data.address}, ${data.address_number}${data.address_complement ? ` - ${data.address_complement}` : ''}`,
        profile_completion_score: completionScore
      }

      // Adicionar URLs dos arquivos se foram enviados
      if (profilePhotoUrl) updates.avatar_url = profilePhotoUrl
      // Remover propriedades que não existem no tipo Profile
      // if (selfieDocumentUrl) updates.selfie_document_url = selfieDocumentUrl
      // if (residenceProofUrl) updates.residence_proof_url = residenceProofUrl

      // Atualizar badge baseado no score
      if (completionScore >= 90) updates.badge = 'gold'
      else if (completionScore >= 75) updates.badge = 'silver'
      else if (completionScore >= 50) updates.badge = 'bronze'

      const result = await updateProfile(updates)

      if (!result.error) {
        console.log('✅ Perfil atualizado com sucesso!')
        onComplete()
      } else {
        console.error('❌ Erro ao atualizar perfil:', result.error)
        alert('Erro ao atualizar perfil: ' + result.error?.message)
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error)
      alert('Erro inesperado: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header com Score */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Complete seu Perfil
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Quanto mais informações você fornecer, melhor será sua classificação na plataforma
        </p>
        
        {/* Score de Completude */}
        <div className="bg-white rounded-lg p-6 shadow-lg border max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl mr-3">{badge.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{badge.label}</h3>
              <p className="text-sm text-gray-600">Score: {completionScore}/100</p>
            </div>
          </div>
          
          <Progress value={completionScore} className="w-full" />
          
          <div className="mt-4 text-sm text-gray-600">
            {completionScore < 50 && 'Continue preenchendo para melhorar sua classificação'}
            {completionScore >= 50 && completionScore < 75 && 'Bom trabalho! Continue para alcançar prata'}
            {completionScore >= 75 && completionScore < 90 && 'Excelente! Quase alcançando ouro'}
            {completionScore >= 90 && 'Perfeito! Você tem o perfil mais completo'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Informações de Contato</span>
            </CardTitle>
            <CardDescription>
              Dados para clientes entrarem em contato com você
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(00) 00000-0000"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                ⭐ +5 pontos para sua classificação
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Biografia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Biografia</span>
            </CardTitle>
            <CardDescription>
              Conte um pouco sobre você e suas experiências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="bio">Biografia *</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Conte sobre sua experiência, especialidades, formação..."
                rows={4}
                className={errors.bio ? 'border-red-500' : ''}
              />
              {errors.bio && (
                <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                ⭐ +10 pontos para sua classificação
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endereço Completo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Endereço Completo</span>
            </CardTitle>
            <CardDescription>
              Endereço detalhado para melhor localização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Rua, Avenida, etc."
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address_number">Número *</Label>
                <Input
                  id="address_number"
                  {...register('address_number')}
                  placeholder="123"
                  className={errors.address_number ? 'border-red-500' : ''}
                />
                {errors.address_number && (
                  <p className="text-sm text-red-500 mt-1">{errors.address_number.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="address_complement">Complemento</Label>
                <Input
                  id="address_complement"
                  {...register('address_complement')}
                  placeholder="Apto, Casa, etc."
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              ⭐ +5 pontos para sua classificação
            </p>
          </CardContent>
        </Card>

        {/* Serviços Profissionais */}
        {profile?.user_type === 'professional' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Serviços Oferecidos</span>
              </CardTitle>
              <CardDescription>
                Selecione os serviços que você oferece
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {serviceCategories.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <Label htmlFor={service.id} className="text-sm cursor-pointer">
                      <span className="mr-2">{service.icon}</span>
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedServices.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Serviços Selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((serviceId) => {
                      const service = serviceCategories.find(s => s.id === serviceId)
                      return service ? (
                        <Badge key={serviceId} variant="secondary">
                          {service.icon} {service.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-3">
                ⭐ +3 pontos por serviço selecionado (máximo 15 pontos)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Documentos e Fotos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Documentos e Fotos</span>
            </CardTitle>
            <CardDescription>
              Documentos opcionais que aumentam a confiança dos clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto de Perfil */}
            <div>
              <Label>Foto de Perfil</Label>
              <p className="text-sm text-gray-600 mb-2">
                Foto profissional para seu perfil
              </p>
              <ImageUpload
                onImageUploaded={handleProfilePhotoUpload}
                currentImageUrl={profilePhotoUrl}
                bucket="avatars"
                maxSize={5}
                title="Foto do Perfil"
                description="Selecione uma foto para seu perfil"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⭐ +10 pontos para sua classificação
              </p>
            </div>

            {/* Selfie com Documento */}
            <div>
              <Label>Selfie com Documento</Label>
              <p className="text-sm text-gray-600 mb-2">
                Sua foto segurando RG ou CPF
              </p>
              <ImageUpload
                onImageUploaded={handleSelfieDocumentUpload}
                currentImageUrl={selfieDocumentUrl}
                bucket="avatars"
                maxSize={5}
                title="Selfie com Documento"
                description="Tire uma selfie segurando seu documento"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⭐ +8 pontos para sua classificação
              </p>
            </div>

            {/* Comprovante de Residência */}
            <div>
              <Label>Comprovante de Residência</Label>
              <p className="text-sm text-gray-600 mb-2">
                Conta de luz, água, telefone, etc.
              </p>
              <ImageUpload
                onImageUploaded={handleResidenceProofUpload}
                currentImageUrl={residenceProofUrl}
                bucket="avatars"
                maxSize={5}
                title="Comprovante de Residência"
                description="Envie um comprovante de residência"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⭐ +7 pontos para sua classificação
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resumo e Botão */}
        <div className="text-center space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Meta de Classificação</span>
            </div>
            <p className="text-sm text-blue-800">
              {completionScore < 50 && 'Continue preenchendo para alcançar Bronze'}
              {completionScore >= 50 && completionScore < 75 && 'Continue para alcançar Prata'}
              {completionScore >= 75 && completionScore < 90 && 'Continue para alcançar Ouro'}
              {completionScore >= 90 && 'Parabéns! Você alcançou a classificação máxima'}
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="px-8 py-3"
          >
            {isLoading ? 'Salvando...' : 'Salvar e Completar Perfil'}
          </Button>
        </div>
      </form>
    </div>
  )
}

