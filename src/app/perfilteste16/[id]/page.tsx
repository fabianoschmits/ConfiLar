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
  MapPin, Star, User, Briefcase, MessageCircle, Calendar,
  CheckCircle, GraduationCap, Heart, Users, Clock, Award, Building2,
  Share2, ThumbsUp, ArrowRight, TrendingUp, Target, Zap
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

export default function PerfilTeste16Page() {
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
      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Hero Section - Landing Page Style */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMwIDBMMCAzME0zMCA2MEwwIDMwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-10"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
            <div className="text-center">
              <UserAvatar
                src={profile.avatar_url || profile.profile_photo_url}
                alt={profile.full_name || 'Usuário'}
                fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                size="xl"
                userId={profile.id}
                showReferralBadge={true}
                className="mx-auto mb-6 ring-4 ring-white/20 shadow-2xl"
              />
              {profile.is_verified && (
                <div className="absolute top-40 right-1/2 transform translate-x-32 bg-white rounded-full p-2 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
              )}
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                {profile.full_name || 'Usuário'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-2xl mx-auto">
                {profile.bio || (isProfessional ? 'Profissional dedicado e experiente' : 'Perfil do usuário')}
              </p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <Badge variant={isProfessional ? 'default' : 'secondary'} className="bg-white/20 text-white border-white/30 text-base px-4 py-2">
                  {isProfessional ? 'Profissional' : 'Cliente'}
                </Badge>
                {isProfessional && (
                  <Badge className={`${profile.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} text-base px-4 py-2`} variant="default">
                    {profile.is_available ? 'Disponível' : 'Ocupado'}
                  </Badge>
                )}
                {profile.rating > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    <span className="text-lg font-bold text-white">{profile.rating.toFixed(1)}</span>
                    <span className="text-sm text-white/80">({profile.total_reviews})</span>
                  </div>
                )}
              </div>
              {!isOwnProfile && (
                <Button onClick={handleContact} size="lg" className="bg-white text-emerald-600 hover:bg-white/90 shadow-xl text-lg px-8 py-6">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Entre em Contato
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{profile.rating.toFixed(1)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avaliação Média</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-teal-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{profile.total_reviews}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avaliações Recebidas</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 capitalize">{profile.badge}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Badge de Reputação</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Visualizações</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Location Card */}
              {profile.location_city && profile.location_state && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-6 h-6 text-emerald-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Localização</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{profile.location_city}, {profile.location_state}</p>
                  </CardContent>
                </Card>
              )}

              {/* Personal Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.idade && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Idade</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.idade} anos</span>
                    </div>
                  )}
                  {profile.gender && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Gênero</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatGender(profile.gender)}</span>
                    </div>
                  )}
                  {profile.escolaridade && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Escolaridade</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatEscolaridade(profile.escolaridade)}</span>
                    </div>
                  )}
                  {profile.estado_civil && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Estado Civil</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatEstadoCivil(profile.estado_civil)}</span>
                    </div>
                  )}
                  {profile.filhos !== null && profile.filhos !== undefined && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Filhos</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Info */}
              {isProfessional && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-cyan-600" />
                      Informações Profissionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.professional_experience_years && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Experiência</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                      </div>
                    )}
                    {profile.turno_trabalho && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Turno</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                      </div>
                    )}
                    {profile.referencia_profissional && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Referência Profissional</div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{profile.referencia_profissional}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="recommendations" className="w-full">
                <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} mb-6 bg-gray-100 dark:bg-gray-800`}>
                  <TabsTrigger value="recommendations">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Recomendações
                  </TabsTrigger>
                  {isProfessional && <TabsTrigger value="services">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Serviços
                  </TabsTrigger>}
                  <TabsTrigger value="reviews">
                    <Star className="w-4 h-4 mr-2" />
                    Avaliações
                  </TabsTrigger>
                  {isProfessional && <TabsTrigger value="portfolio">
                    <Building2 className="w-4 h-4 mr-2" />
                    Portfólio
                  </TabsTrigger>}
                  <TabsTrigger value="about">
                    <User className="w-4 h-4 mr-2" />
                    Sobre
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recommendations" className="space-y-4">
                  {recommendationsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border-0 shadow-md animate-pulse">
                          <CardContent className="p-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : recommendations.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-12">
                        <EmptyState icon={<ThumbsUp className="h-12 w-12 text-gray-400" />} title="Nenhuma recomendação encontrada" description="Este usuário ainda não recebeu recomendações." />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.map((rec) => (
                        <Link key={rec.id} href={`/perfil/${rec.recommender.id}`} className="block">
                          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-l-emerald-500">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  src={rec.recommender.avatar_url}
                                  alt={rec.recommender.full_name}
                                  fallback={rec.recommender.full_name?.charAt(0) || 'U'}
                                  size="md"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                      {rec.recommender.full_name}
                                    </h4>
                                    {rec.recommender.is_verified && (
                                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    )}
                                  </div>
                                  {rec.recommender.location_city && rec.recommender.location_state && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                                      <MapPin className="w-3 h-3" />
                                      {rec.recommender.location_city}, {rec.recommender.location_state}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    {rec.recommender.rating > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{rec.recommender.rating.toFixed(1)}</span>
                                      </div>
                                    )}
                                    <Badge variant={rec.recommender.user_type === 'professional' ? 'default' : 'secondary'} className="text-xs">
                                      {rec.recommender.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="services">
                  {isProfessional ? (
                    profile.professional_services && profile.professional_services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.professional_services.map((service, index) => (
                          <Card key={index} className="border-0 shadow-md border-l-4 border-l-emerald-500">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-gray-900 dark:text-white">{service}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-12">
                          <EmptyState icon={<Briefcase className="h-12 w-12 text-gray-400" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                        </CardContent>
                      </Card>
                    )
                  ) : (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-12 text-center">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não oferece serviços.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="border-0 shadow-md animate-pulse">
                          <CardContent className="p-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} currentUserId={user?.id} profileOwnerId={userId} />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-12">
                        <EmptyState icon={<Star className="h-12 w-12 text-gray-400" />} title="Nenhuma avaliação encontrada" description="Este usuário ainda não recebeu avaliações." />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="portfolio">
                  {isProfessional ? (
                    portfolioLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="border-0 shadow-md animate-pulse">
                            <CardContent className="p-4">
                              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : portfolioProjects && portfolioProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolioProjects.map((project) => (
                          <Card key={project.id} className="border-0 shadow-md hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{project.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{project.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{format(new Date(project.created_at), 'dd/MM/yyyy')}</span>
                                <span>{project.views_count} visualizações</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-12">
                          <EmptyState icon={<Building2 className="h-12 w-12 text-gray-400" />} title="Nenhum projeto no portfólio" description="Este profissional ainda não adicionou projetos ao portfólio." />
                        </CardContent>
                      </Card>
                    )
                  ) : (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-12 text-center">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não possui portfólio.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="about">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Informações Completas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Pessoais</h3>
                          {profile.location_city && profile.location_state && (
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Localização</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.location_city}, {profile.location_state}</span>
                            </div>
                          )}
                          {profile.idade && (
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Idade</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.idade} anos</span>
                            </div>
                          )}
                          {profile.gender && (
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Gênero</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatGender(profile.gender)}</span>
                            </div>
                          )}
                          {profile.escolaridade && (
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Escolaridade</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatEscolaridade(profile.escolaridade)}</span>
                            </div>
                          )}
                          {profile.estado_civil && (
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Estado Civil</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatEstadoCivil(profile.estado_civil)}</span>
                            </div>
                          )}
                          {profile.filhos !== null && profile.filhos !== undefined && (
                            <div className="flex justify-between py-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Filhos</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                            </div>
                          )}
                        </div>
                        {isProfessional && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Profissionais</h3>
                            {profile.professional_experience_years && (
                              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Experiência</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                              </div>
                            )}
                            {profile.turno_trabalho && (
                              <div className="flex justify-between py-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Turno</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

