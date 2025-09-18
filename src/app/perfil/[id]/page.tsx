'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  MapPin, 
  Star, 
  Award, 
  Phone, 
  Mail, 
  User, 
  Briefcase, 
  MessageCircle, 
  Clock, 
  Building2, 
  CheckCircle, 
  ThumbsUp, 
  Eye, 
  Heart, 
  Calendar,
  Shield,
  Globe,
  Share2,
  MoreVertical,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Users,
  Target
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useOpenMessages } from '@/hooks/useOpenMessages'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews'
import { useProfileViews } from '@/hooks/useProfileViews'
import { ReviewCard } from '@/components/reviews/ReviewCard'

interface PublicProfile {
    id: string
    full_name: string
    user_type: 'client' | 'professional'
    avatar_url: string | null
    bio: string | null
    location_state: string | null
    location_city: string | null
    neighborhood: string | null
    professional_services: string[] | null
    professional_experience_years: number | null
    professional_certifications: string[] | null
    badge: string
    rating: number
    total_reviews: number
    is_verified: boolean
    is_available: boolean
    created_at: string
    phone?: string | null
    email?: string | null
}

export default function PublicProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthContext()
    const { openMessages } = useOpenMessages()
    const userId = params.id as string
    const [profile, setProfile] = useState<PublicProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showContactInfo, setShowContactInfo] = useState(false)

  // Hooks
  const { projects: portfolioProjects, loading: portfolioLoading } = usePortfolio(userId)
  const { reviews, loading: reviewsLoading, fetchUserReviews, fetchUserReviewStats } = useSupabaseReviews()
  const { getViewStats, useAutoRecordView } = useProfileViews()
    const [viewStats, setViewStats] = useState<{ total_views: number; views_today: number } | null>(null)

    useEffect(() => {
        fetchProfile()
    }, [userId])

    // Registrar visualização automaticamente
  useEffect(() => {
    if (userId) {
      const cleanup = useAutoRecordView(userId)
      return cleanup
    }
  }, [userId, useAutoRecordView])

    // Buscar estatísticas de visualizações
    useEffect(() => {
        if (userId) {
            getViewStats(userId).then(stats => {
                if (stats) {
                    setViewStats({
                        total_views: stats.total_views,
                        views_today: stats.views_today
                    })
                }
            })
        }
    }, [userId, getViewStats])

  // Buscar avaliações e recalcular estatísticas
  useEffect(() => {
    if (userId) {
      fetchUserReviews(userId)
      fetchUserReviewStats(userId)
      updateProfileStats(userId)
    }
  }, [userId])

  // Recalcular estatísticas do perfil baseadas nas avaliações
  const updateProfileStats = async (profileId: string) => {
    try {
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('rating_person')
        .eq('reviewed_id', profileId)

      if (error) throw error

      if (reviewsData && reviewsData.length > 0) {
        const totalReviews = reviewsData.length
        const averageRating = reviewsData.reduce((sum, review) => sum + review.rating_person, 0) / totalReviews

        // Atualizar o perfil com as novas estatísticas
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            rating: Math.round(averageRating * 10) / 10, // Arredondar para 1 casa decimal
            total_reviews: totalReviews
          })
          .eq('id', profileId)

        if (updateError) throw updateError

        // Atualizar o estado local
        setProfile(prev => prev ? {
          ...prev,
          rating: Math.round(averageRating * 10) / 10,
          total_reviews: totalReviews
        } : null)
      }
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do perfil:', error)
    }
  }

    const fetchProfile = async () => {
        try {
            setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          user_type,
          avatar_url,
          bio,
          location_state,
          location_city,
          neighborhood,
          professional_services,
          professional_experience_years,
          professional_certifications,
          badge,
          rating,
          total_reviews,
          is_verified,
          is_available,
          created_at,
          phone,
          email
        `)
                .eq('id', userId)
                .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Perfil não encontrado')
        } else {
          throw error
        }
        return
      }

      setProfile(data)
        } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      setError('Erro ao carregar perfil')
        } finally {
            setLoading(false)
        }
    }

  const handleContact = () => {
        if (!user) {
            router.push('/auth')
            return
        }
    openMessages(userId)
    }

    if (loading) {
        return (
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </MainLayout>
        )
    }

    if (error || !profile) {
        return (
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Perfil não encontrado'}
              </h2>
              <p className="text-gray-600 mb-6">
                O perfil que você está procurando não existe ou não está disponível.
              </p>
              <Button onClick={() => router.push('/buscar')}>
                Buscar Profissionais
              </Button>
            </CardContent>
          </Card>
                </div>
      </MainLayout>
        )
    }

  const isOwnProfile = user?.id === profile.id
  const isProfessional = profile.user_type === 'professional'

    return (
    <MainLayout requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header do Perfil */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                                    <UserAvatar
                                        src={profile.avatar_url}
                                        alt={profile.full_name}
                    fallback={profile.full_name.charAt(0)}
                                        size="lg"
                    className="w-24 h-24"
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {profile.full_name}
                                </h1>
                                {profile.is_verified && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                                )}
                            </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={isProfessional ? 'default' : 'secondary'}>
                        {isProfessional ? 'Profissional' : 'Cliente'}
                      </Badge>
                      <Badge variant={profile.is_available ? 'default' : 'secondary'}>
                        {profile.is_available ? 'Disponível' : 'Ocupado'}
                      </Badge>
                      {isProfessional && profile.professional_experience_years && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Award className="h-3 w-3 mr-1" />
                          {profile.professional_experience_years} anos
                        </Badge>
                      )}
                      {profile.badge && (
                        <Badge variant="outline">{profile.badge}</Badge>
                      )}
                                </div>
                                
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                {profile.location_city && profile.location_state && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {profile.location_city}, {profile.location_state}
                                    </div>
                                )}
                      {isProfessional && profile.rating > 0 && (
                        <StarRating 
                          rating={profile.rating} 
                          size="sm" 
                          variant="compact"
                          showValue={true}
                          showCount={true}
                          count={profile.total_reviews}
                        />
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Membro desde {format(new Date(profile.created_at), 'MMM yyyy', { locale: ptBR })}
                      </div>
                                </div>
                                </div>
                            </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!isOwnProfile && (
                    <>
                      <Button onClick={handleContact} className="bg-blue-600 hover:bg-blue-700">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                      <Button variant="outline">
                        <Heart className="h-4 w-4 mr-2" />
                        Adicionar aos Favoritos
                                </Button>
                    </>
                  )}
                  
                  {isOwnProfile && (
                    <Button onClick={() => router.push('/editarperfil')} variant="outline">
                      Editar Perfil
                    </Button>
                  )}
                  
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                                </Button>
                                                    </div>
                                                </div>
                                                
              {/* Bio */}
              {profile.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                                                </div>
                                            )}
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="p-2 text-center">
                <Eye className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{viewStats?.total_views || 0}</p>
                <p className="text-xs text-gray-600">Visualizações</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-2 text-center">
                <ThumbsUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {reviews ? reviews.filter(r => r.is_recommended === true).length : 0}
                </p>
                <p className="text-xs text-gray-600">Recomendações</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-2 text-center">
                <Star className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{profile.total_reviews}</p>
                <p className="text-xs text-gray-600">Avaliações</p>
              </CardContent>
            </Card>

            {isProfessional && (
              <Card>
                <CardContent className="p-2 text-center">
                  <div className="flex justify-center mb-1">
                    <StarRating 
                      rating={profile.rating} 
                      size="sm" 
                      variant="compact"
                      showValue={false}
                    />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{profile.rating.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">Nota Média</p>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Tabs de Conteúdo */}
          <Tabs defaultValue="sobre" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sobre">Sobre</TabsTrigger>
              {isProfessional && <TabsTrigger value="servicos">Serviços</TabsTrigger>}
              {isProfessional && <TabsTrigger value="portfolio">Portfólio</TabsTrigger>}
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="sobre" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tipo de usuário:</span>
                      <Badge variant={isProfessional ? 'default' : 'secondary'}>
                        {isProfessional ? 'Profissional' : 'Cliente'}
                      </Badge>
                                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={profile.is_available ? 'default' : 'secondary'}>
                        {profile.is_available ? 'Disponível' : 'Ocupado'}
                      </Badge>
                                    </div>
                    
                                                {profile.neighborhood && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Bairro:</span>
                        <span className="font-medium">{profile.neighborhood}</span>
                                                    </div>
                                                )}
                  </CardContent>
                </Card>

                {/* Contato */}
                {(showContactInfo || isOwnProfile) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Phone className="h-5 w-5 mr-2" />
                        Contato
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                                                {profile.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Telefone:</span>
                          <span className="font-medium">{profile.phone}</span>
                                                    </div>
                                                )}
                                                {profile.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">E-mail:</span>
                          <span className="font-medium">{profile.email}</span>
                                                    </div>
                                                )}
                    </CardContent>
                  </Card>
                )}
                        </div>
                    </TabsContent>

            {isProfessional && (
              <TabsContent value="servicos" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Serviços Oferecidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.professional_services && profile.professional_services.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {profile.professional_services.map((service, index) => (
                          <Badge key={index} variant="outline" className="justify-center py-2">
                            {service}
                          </Badge>
                        ))}
                                        </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">
                        Nenhum serviço cadastrado ainda.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Certificações */}
                {profile.professional_certifications && profile.professional_certifications.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        Certificações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {profile.professional_certifications.map((cert, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Shield className="h-5 w-5 text-green-600 mr-3" />
                            <span className="font-medium">{cert}</span>
                                                    </div>
                        ))}
                                                                </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {isProfessional && (
              <TabsContent value="portfolio" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Portfólio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {portfolioLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                                                            </div>
                    ) : portfolioProjects && portfolioProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolioProjects.map((project) => (
                          <div key={project.id} className="bg-gray-100 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Eye className="h-3 w-3 mr-1" />
                              {project.views_count || 0} visualizações
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                      <p className="text-gray-600 text-center py-8">
                        Nenhum projeto no portfólio ainda.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="avaliacoes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Avaliações ({reviews ? reviews.length : 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Resumo das Avaliações */}
                  {reviews && reviews.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{profile.rating.toFixed(1)}</p>
                          <p className="text-sm text-gray-600">Nota Média</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {reviews.filter(r => r.is_recommended === true).length}
                          </p>
                          <p className="text-sm text-gray-600">Recomendações</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                                </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          currentUserId={user?.id}
                          showActions={false} // Não mostrar ações na página de perfil
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      Nenhuma avaliação ainda.
                    </p>
                )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}