'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useProfileData, formatEscolaridade, formatEstadoCivil, formatTurnoTrabalho, formatGender } from '@/hooks/useProfileData'
import { useRecommendations } from '@/hooks/useRecommendations'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/MainLayout'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { 
  MapPin, Star, Phone, Mail, User, Briefcase, MessageCircle, Calendar,
  CheckCircle, Eye, GraduationCap, Heart, Users, Clock, Award, Building2,
  Globe, Share2, ThumbsUp, TrendingUp, BarChart3, Activity
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews'
import { usePortfolio } from '@/hooks/usePortfolio'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProfilePageSkeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function PerfilTeste6Page() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  const userId = params.id as string
  const [mounted, setMounted] = useState(false)
  
  const { profile, loading, error } = useProfileData(userId)
  const { reviews, loading: reviewsLoading, fetchUserReviews } = useSupabaseReviews()
  const { projects: portfolioProjects, loading: portfolioLoading } = usePortfolio(userId || '')
  const { recommendations, loading: recommendationsLoading } = useRecommendations(userId)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (userId) {
      fetchUserReviews(userId)
    }
  }, [userId, fetchUserReviews])

  const handleContact = () => {
    if (!user) {
      toast.error('Login necessário')
      return
    }
    if (userId === user.id) {
      toast.error('Ação inválida')
      return
    }
    openChat(userId, profile?.full_name || 'Usuário')
    toast.success('Iniciando conversa...')
  }

  if (!mounted || loading) {
    return <MainLayout requireAuth={false}><ProfilePageSkeleton /></MainLayout>
  }

  if (error || !profile) {
    return (
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{error || 'Perfil não encontrado'}</h2>
              <Button onClick={() => router.push('/buscar')}>Buscar Profissionais</Button>
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-950 dark:to-black">
        {/* Header Dashboard Style */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
              {/* Foto Grande com Borda Glow */}
              <div className="flex-shrink-0 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <UserAvatar
                  src={profile.avatar_url || profile.profile_photo_url}
                  alt={profile.full_name || 'Usuário'}
                  fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  size="xl"
                  userId={profile.id}
                  showReferralBadge={true}
                  className="relative ring-4 ring-white dark:ring-gray-800 shadow-2xl"
                />
                {profile.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Dados ao Lado */}
              <div className="flex-1 min-w-0 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
                  {profile.full_name || 'Usuário'}
                </h1>
                {profile.bio && (
                  <p className="text-xl text-gray-200 mb-6 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  {profile.is_verified && (
                    <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  <Badge className={`px-4 py-2 text-sm ${isProfessional ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {isProfessional ? 'Profissional' : 'Cliente'}
                  </Badge>
                  {isProfessional && (
                    <Badge className={`px-4 py-2 text-sm ${profile.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {profile.is_available ? 'Disponível' : 'Ocupado'}
                    </Badge>
                  )}
                </div>

                {/* Métricas Dashboard Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-white text-sm font-medium">Avaliação</span>
                    </div>
                    <div className="text-3xl font-black text-white">{profile.rating.toFixed(1)}</div>
                  </div>
                  <div className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className="text-white text-sm font-medium">Avaliações</span>
                    </div>
                    <div className="text-3xl font-black text-white">{profile.total_reviews}</div>
                  </div>
                  <div className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      <span className="text-white text-sm font-medium">Visualizações</span>
                    </div>
                    <div className="text-3xl font-black text-white">0</div>
                  </div>
                  <div className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <Award className="w-5 h-5 text-orange-400" />
                      <span className="text-white text-sm font-medium">Badge</span>
                    </div>
                    <div className="text-3xl font-black text-white capitalize">{profile.badge}</div>
                  </div>
                </div>

                {/* Informações Rápidas */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-gray-200">
                  {profile.location_city && profile.location_state && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{profile.location_city}, {profile.location_state}</span>
                    </div>
                  )}
                  {profile.idade && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{profile.idade} anos</span>
                    </div>
                  )}
                  {profile.escolaridade && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm truncate">{formatEscolaridade(profile.escolaridade)}</span>
                    </div>
                  )}
                  {isProfessional && profile.professional_experience_years && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-6">
                  {!isOwnProfile && (
                    <Button onClick={handleContact} className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-6 text-lg font-bold">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contatar
                    </Button>
                  )}
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-6 text-lg font-bold">
                    <Share2 className="w-5 h-5 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} bg-gray-800 dark:bg-gray-900 border border-gray-700 rounded-lg p-1`}>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Recomend.</TabsTrigger>
              {isProfessional && <TabsTrigger value="services" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Serviços</TabsTrigger>}
              <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Avaliações</TabsTrigger>
              {isProfessional && <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Portfólio</TabsTrigger>}
              <TabsTrigger value="about" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Sobre</TabsTrigger>
            </TabsList>

            {/* Aba de Recomendações */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className="bg-gray-800 dark:bg-gray-900 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ThumbsUp className="w-5 h-5" />
                    Recomendações
                    {recommendations.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                        {recommendations.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {recommendationsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border border-gray-700 rounded-lg p-4 space-y-3 animate-pulse">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recommendations.length === 0 ? (
                    <EmptyState icon={<ThumbsUp className="h-12 w-12 text-gray-400" />} title="Nenhuma recomendação encontrada" description="Este usuário ainda não recebeu recomendações." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendations.map((rec) => (
                        <Link key={rec.id} href={`/perfil/${rec.recommender.id}`} className="block">
                          <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full bg-gray-700 dark:bg-gray-800 border-gray-600 hover:border-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <UserAvatar
                                  src={rec.recommender.avatar_url}
                                  alt={rec.recommender.full_name}
                                  fallback={rec.recommender.full_name?.charAt(0) || 'U'}
                                  size="md"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-white truncate">
                                      {rec.recommender.full_name}
                                    </h4>
                                    {rec.recommender.is_verified && (
                                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    )}
                                  </div>
                                  {rec.recommender.location_city && rec.recommender.location_state && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                                      <MapPin className="w-3 h-3" />
                                      {rec.recommender.location_city}, {rec.recommender.location_state}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mb-2">
                                    {rec.recommender.rating > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-medium text-gray-300">
                                          {rec.recommender.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                    <Badge variant={rec.recommender.user_type === 'professional' ? 'default' : 'secondary'} className="text-xs">
                                      {rec.recommender.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(rec.created_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 dark:bg-gray-900 border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <User className="w-5 h-5" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {profile.gender && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Gênero</span>
                        <span className="font-semibold text-white">{formatGender(profile.gender)}</span>
                      </div>
                    )}
                    {profile.idade && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Idade</span>
                        <span className="font-semibold text-white">{profile.idade} anos</span>
                      </div>
                    )}
                    {profile.escolaridade && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Escolaridade</span>
                        <span className="font-semibold text-white text-right">{formatEscolaridade(profile.escolaridade)}</span>
                      </div>
                    )}
                    {profile.estado_civil && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Estado Civil</span>
                        <span className="font-semibold text-white">{formatEstadoCivil(profile.estado_civil)}</span>
                      </div>
                    )}
                    {profile.filhos !== null && profile.filhos !== undefined && (
                      <div className="flex justify-between py-3">
                        <span className="text-gray-400">Filhos</span>
                        <span className="font-semibold text-white">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isProfessional && (
                  <Card className="bg-gray-800 dark:bg-gray-900 border-gray-700">
                    <CardHeader className="border-b border-gray-700">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Briefcase className="w-5 h-5" />
                        Informações Profissionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {profile.professional_experience_years && (
                        <div className="flex justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Experiência</span>
                          <span className="font-semibold text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                        </div>
                      )}
                      {profile.turno_trabalho && (
                        <div className="flex justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Turno</span>
                          <span className="font-semibold text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                        </div>
                      )}
                      {profile.referencia_profissional && (
                        <div className="py-3">
                          <span className="text-gray-400 block mb-2">Referência Profissional</span>
                          <p className="text-sm text-white leading-relaxed">{profile.referencia_profissional}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="services">
              {isProfessional ? (
                <Card className="bg-gray-800 dark:bg-gray-900 border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Briefcase className="w-5 h-5" />
                      Serviços Oferecidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {profile.professional_services && profile.professional_services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.professional_services.map((service, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-gray-700 dark:bg-gray-800 rounded-lg border border-gray-600">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span className="text-white font-medium">{service}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={<Briefcase className="h-12 w-12 text-gray-400" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800 dark:bg-gray-900 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Cliente</h3>
                    <p className="text-gray-400">Este usuário é um cliente e não oferece serviços.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="bg-gray-800 dark:bg-gray-900 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5" />
                    Avaliações
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border border-gray-700 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} currentUserId={user?.id} profileOwnerId={userId} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={<Star className="h-12 w-12 text-gray-400" />} title="Nenhuma avaliação encontrada" description="Este usuário ainda não recebeu avaliações." />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio">
              {isProfessional ? (
                <Card className="bg-gray-800 dark:bg-gray-900 border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Building2 className="w-5 h-5" />
                      Portfólio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {portfolioLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="border border-gray-700 rounded-lg p-4 animate-pulse">
                            <div className="h-32 bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : portfolioProjects && portfolioProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolioProjects.map((project) => (
                          <div key={project.id} className="bg-gray-700 dark:bg-gray-800 rounded-lg p-4 border border-gray-600">
                            <h4 className="font-medium text-white mb-2">{project.title}</h4>
                            <p className="text-sm text-gray-300 mb-3">{project.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>{format(new Date(project.created_at), 'dd/MM/yyyy')}</span>
                              <span>{project.views_count} visualizações</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={<Building2 className="h-12 w-12 text-gray-400" />} title="Nenhum projeto no portfólio" description="Este profissional ainda não adicionou projetos ao portfólio." />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800 dark:bg-gray-900 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Cliente</h3>
                    <p className="text-gray-400">Este usuário é um cliente e não possui portfólio.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}


