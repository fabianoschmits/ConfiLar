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
  Share2, ThumbsUp, ChevronRight, Activity, TrendingUp, Target
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

export default function PerfilTeste10Page() {
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Timeline Vertical Layout */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Centralizado */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-20"></div>
              <UserAvatar
                src={profile.avatar_url || profile.profile_photo_url}
                alt={profile.full_name || 'Usuário'}
                fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                size="xl"
                userId={profile.id}
                showReferralBadge={true}
                className="relative ring-4 ring-white dark:ring-slate-900 shadow-xl"
              />
              {profile.is_verified && (
                <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 ring-4 ring-white dark:ring-slate-900">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {profile.full_name || 'Usuário'}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {profile.is_verified && (
                <Badge className="bg-blue-600 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
              <Badge variant={isProfessional ? 'default' : 'secondary'}>
                {isProfessional ? 'Profissional' : 'Cliente'}
              </Badge>
              {isProfessional && (
                <Badge className={profile.is_available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                  {profile.is_available ? 'Disponível' : 'Ocupado'}
                </Badge>
              )}
            </div>

            {profile.bio && (
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center justify-center gap-4">
              {!isOwnProfile && (
                <Button onClick={handleContact} className="bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contatar
                </Button>
              )}
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>

          {/* Timeline Vertical */}
          <div className="space-y-8">
            {/* Linha do Tempo - Métricas */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
              
              <div className="relative pl-20 pb-8">
                <div className="absolute left-6 top-2 w-4 h-4 bg-blue-600 rounded-full ring-4 ring-white dark:ring-slate-950"></div>
                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Métricas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.rating.toFixed(1)}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Avaliação</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.total_reviews}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Avaliações</div>
                      </div>
                      <div className="text-center p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                        <Award className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{profile.badge}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Badge</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Visualizações</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Linha do Tempo - Informações Pessoais */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
              
              <div className="relative pl-20 pb-8">
                <div className="absolute left-6 top-2 w-4 h-4 bg-purple-600 rounded-full ring-4 ring-white dark:ring-slate-950"></div>
                <Card className="border-l-4 border-l-purple-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.location_city && profile.location_state && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Localização</div>
                            <div className="font-medium text-gray-900 dark:text-white">{profile.location_city}, {profile.location_state}</div>
                          </div>
                        </div>
                      )}
                      {profile.idade && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Idade</div>
                            <div className="font-medium text-gray-900 dark:text-white">{profile.idade} anos</div>
                          </div>
                        </div>
                      )}
                      {profile.gender && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Gênero</div>
                            <div className="font-medium text-gray-900 dark:text-white">{formatGender(profile.gender)}</div>
                          </div>
                        </div>
                      )}
                      {profile.escolaridade && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <GraduationCap className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Escolaridade</div>
                            <div className="font-medium text-gray-900 dark:text-white">{formatEscolaridade(profile.escolaridade)}</div>
                          </div>
                        </div>
                      )}
                      {profile.estado_civil && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <Heart className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Estado Civil</div>
                            <div className="font-medium text-gray-900 dark:text-white">{formatEstadoCivil(profile.estado_civil)}</div>
                          </div>
                        </div>
                      )}
                      {profile.filhos !== null && profile.filhos !== undefined && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <Users className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Filhos</div>
                            <div className="font-medium text-gray-900 dark:text-white">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Linha do Tempo - Informações Profissionais (se profissional) */}
            {isProfessional && (
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
                
                <div className="relative pl-20 pb-8">
                  <div className="absolute left-6 top-2 w-4 h-4 bg-pink-600 rounded-full ring-4 ring-white dark:ring-slate-950"></div>
                  <Card className="border-l-4 border-l-pink-600">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-pink-600" />
                        Informações Profissionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile.professional_experience_years && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Experiência</div>
                              <div className="font-medium text-gray-900 dark:text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</div>
                            </div>
                          </div>
                        )}
                        {profile.turno_trabalho && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Turno</div>
                              <div className="font-medium text-gray-900 dark:text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</div>
                            </div>
                          </div>
                        )}
                        {profile.referencia_profissional && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Referência Profissional</div>
                            <p className="text-sm text-gray-900 dark:text-white">{profile.referencia_profissional}</p>
                          </div>
                        )}
                        {profile.professional_services && profile.professional_services.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Serviços Oferecidos</div>
                            <div className="flex flex-wrap gap-2">
                              {profile.professional_services.map((service, index) => (
                                <Badge key={index} variant="secondary">{service}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tabs Section */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
              
              <div className="relative pl-20">
                <div className="absolute left-6 top-2 w-4 h-4 bg-green-600 rounded-full ring-4 ring-white dark:ring-slate-950"></div>
                <Tabs defaultValue="recommendations" className="w-full">
                  <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} mb-6`}>
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
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : recommendations.length === 0 ? (
                      <EmptyState icon={<ThumbsUp className="h-12 w-12 text-gray-400" />} title="Nenhuma recomendação encontrada" description="Este usuário ainda não recebeu recomendações." />
                    ) : (
                      <div className="space-y-4">
                        {recommendations.map((rec) => (
                          <Link key={rec.id} href={`/perfil/${rec.recommender.id}`} className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                        <MapPin className="w-3 h-3" />
                                        {rec.recommender.location_city}, {rec.recommender.location_state}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                      {rec.recommender.rating > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                          <span className="text-xs font-medium">{rec.recommender.rating.toFixed(1)}</span>
                                        </div>
                                      )}
                                      <Badge variant={rec.recommender.user_type === 'professional' ? 'default' : 'secondary'} className="text-xs">
                                        {rec.recommender.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {profile.professional_services.map((service, index) => (
                            <Card key={index} className="border-l-4 border-l-blue-600">
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
                        <EmptyState icon={<Briefcase className="h-12 w-12 text-gray-400" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                      )
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
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
                          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
                  </TabsContent>

                  <TabsContent value="portfolio">
                    {isProfessional ? (
                      portfolioLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                          ))}
                        </div>
                      ) : portfolioProjects && portfolioProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {portfolioProjects.map((project) => (
                            <Card key={project.id} className="hover:shadow-lg transition-shadow">
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
                        <EmptyState icon={<Building2 className="h-12 w-12 text-gray-400" />} title="Nenhum projeto no portfólio" description="Este profissional ainda não adicionou projetos ao portfólio." />
                      )
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não possui portfólio.</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="about">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informações Completas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profile.location_city && profile.location_state && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Localização</div>
                              <div className="font-medium">{profile.location_city}, {profile.location_state}</div>
                            </div>
                          )}
                          {profile.idade && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Idade</div>
                              <div className="font-medium">{profile.idade} anos</div>
                            </div>
                          )}
                          {profile.gender && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gênero</div>
                              <div className="font-medium">{formatGender(profile.gender)}</div>
                            </div>
                          )}
                          {profile.escolaridade && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Escolaridade</div>
                              <div className="font-medium">{formatEscolaridade(profile.escolaridade)}</div>
                            </div>
                          )}
                          {profile.estado_civil && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado Civil</div>
                              <div className="font-medium">{formatEstadoCivil(profile.estado_civil)}</div>
                            </div>
                          )}
                          {profile.filhos !== null && profile.filhos !== undefined && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Filhos</div>
                              <div className="font-medium">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Fim da Timeline */}
            <div className="relative">
              <div className="absolute left-8 top-0 w-0.5 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
              <div className="absolute left-6 top-4 w-4 h-4 bg-blue-600 rounded-full ring-4 ring-white dark:ring-slate-950"></div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
