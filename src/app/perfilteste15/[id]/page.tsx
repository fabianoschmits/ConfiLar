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
  Share2, ThumbsUp, Smartphone, Camera, Video, Music
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

export default function PerfilTeste15Page() {
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Mobile App Style Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-24">
          <div className="max-w-md mx-auto px-4 pt-8">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/20">
                <span className="text-2xl">←</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <UserAvatar
                src={profile.avatar_url || profile.profile_photo_url}
                alt={profile.full_name || 'Usuário'}
                fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                size="xl"
                userId={profile.id}
                showReferralBadge={true}
                className="mx-auto ring-4 ring-white shadow-2xl mb-4"
              />
              {profile.is_verified && (
                <div className="absolute top-32 right-1/2 transform translate-x-16 bg-blue-600 rounded-full p-1.5 ring-4 ring-white">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
              <h1 className="text-2xl font-bold text-white mb-2">
                {profile.full_name || 'Usuário'}
              </h1>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge variant={isProfessional ? 'default' : 'secondary'} className="bg-white/20 text-white border-white/30">
                  {isProfessional ? 'Profissional' : 'Cliente'}
                </Badge>
                {isProfessional && (
                  <Badge className={profile.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {profile.is_available ? 'Disponível' : 'Ocupado'}
                  </Badge>
                )}
              </div>
              {profile.rating > 0 && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-xl font-bold text-white">{profile.rating.toFixed(1)}</span>
                  <span className="text-sm text-white/80">({profile.total_reviews} avaliações)</span>
                </div>
              )}
              {profile.location_city && profile.location_state && (
                <div className="flex items-center justify-center gap-2 text-white/90 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.location_city}, {profile.location_state}</span>
                </div>
              )}
              {!isOwnProfile && (
                <Button onClick={handleContact} size="lg" className="w-full bg-white text-blue-600 hover:bg-white/90 shadow-xl">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contatar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="max-w-md mx-auto px-4 -mt-12 pb-8">
          {/* Bio Card */}
          {profile.bio && (
            <Card className="mb-4 shadow-lg border-0">
              <CardContent className="p-4">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Sobre</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards - Mobile Style */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <CardContent className="p-4 text-center text-white">
                <Star className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xl font-bold">{profile.rating.toFixed(1)}</div>
                <div className="text-xs opacity-90">Avaliação</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
              <CardContent className="p-4 text-center text-white">
                <Users className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xl font-bold">{profile.total_reviews}</div>
                <div className="text-xs opacity-90">Avaliações</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <CardContent className="p-4 text-center text-white">
                <Award className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xl font-bold capitalize text-xs">{profile.badge}</div>
                <div className="text-xs opacity-90">Badge</div>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards - Mobile Style */}
          <div className="space-y-3 mb-4">
            {profile.idade && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-3 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Idade</div>
                    <div className="font-medium text-gray-900 dark:text-white">{profile.idade} anos</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {profile.escolaridade && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-3 flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Escolaridade</div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{formatEscolaridade(profile.escolaridade)}</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {profile.estado_civil && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-3 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Estado Civil</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatEstadoCivil(profile.estado_civil)}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Professional Info - Mobile */}
          {isProfessional && (
            <div className="space-y-3 mb-4">
              {profile.professional_experience_years && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Experiência</div>
                      <div className="font-medium text-gray-900 dark:text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {profile.turno_trabalho && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Turno</div>
                      <div className="font-medium text-gray-900 dark:text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {profile.referencia_profissional && (
                <Card className="border-0 shadow-md">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      Referência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile.referencia_profissional}</p>
                  </CardContent>
                </Card>
              )}
              {profile.professional_services && profile.professional_services.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      Serviços
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {profile.professional_services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{service}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Tabs - Mobile Style */}
          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} mb-4 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl p-1`}>
              <TabsTrigger value="recommendations" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg">
                <ThumbsUp className="w-3 h-3 mr-1" />
                Recs
              </TabsTrigger>
              {isProfessional && <TabsTrigger value="services" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg">
                <Briefcase className="w-3 h-3 mr-1" />
                Serv.
              </TabsTrigger>}
              <TabsTrigger value="reviews" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg">
                <Star className="w-3 h-3 mr-1" />
                Aval.
              </TabsTrigger>
              {isProfessional && <TabsTrigger value="portfolio" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg">
                <Building2 className="w-3 h-3 mr-1" />
                Port.
              </TabsTrigger>}
              <TabsTrigger value="about" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg">
                <User className="w-3 h-3 mr-1" />
                Sobre
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-3">
              {recommendationsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-0 shadow-md animate-pulse">
                      <CardContent className="p-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8">
                    <EmptyState icon={<ThumbsUp className="h-10 w-10 text-gray-400" />} title="Nenhuma recomendação" description="Este usuário ainda não recebeu recomendações." />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <Link key={rec.id} href={`/perfil/${rec.recommender.id}`} className="block">
                      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={rec.recommender.avatar_url}
                              alt={rec.recommender.full_name}
                              fallback={rec.recommender.full_name?.charAt(0) || 'U'}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                  {rec.recommender.full_name}
                                </h4>
                                {rec.recommender.is_verified && (
                                  <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                )}
                              </div>
                              {rec.recommender.location_city && rec.recommender.location_state && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                  <MapPin className="w-2 h-2" />
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
                                <Badge variant={rec.recommender.user_type === 'professional' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0">
                                  {rec.recommender.user_type === 'professional' ? 'Prof' : 'Cliente'}
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
                  <div className="space-y-2">
                    {profile.professional_services.map((service, index) => (
                      <Card key={index} className="border-0 shadow-md border-l-4 border-l-blue-500">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-sm text-gray-900 dark:text-white">{service}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-8">
                      <EmptyState icon={<Briefcase className="h-10 w-10 text-gray-400" />} title="Nenhum serviço" description="Este profissional ainda não cadastrou serviços." />
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Este usuário é um cliente.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-3">
              {reviewsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-0 shadow-md animate-pulse">
                      <CardContent className="p-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} currentUserId={user?.id} profileOwnerId={userId} />
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8">
                    <EmptyState icon={<Star className="h-10 w-10 text-gray-400" />} title="Nenhuma avaliação" description="Este usuário ainda não recebeu avaliações." />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="portfolio">
              {isProfessional ? (
                portfolioLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="border-0 shadow-md animate-pulse">
                        <CardContent className="p-3">
                          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : portfolioProjects && portfolioProjects.length > 0 ? (
                  <div className="space-y-3">
                    {portfolioProjects.map((project) => (
                      <Card key={project.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">{project.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{format(new Date(project.created_at), 'dd/MM/yyyy')}</span>
                            <span>{project.views_count} visualizações</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-8">
                      <EmptyState icon={<Building2 className="h-10 w-10 text-gray-400" />} title="Nenhum projeto" description="Este profissional ainda não adicionou projetos." />
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Este usuário é um cliente.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="about">
              <Card className="border-0 shadow-md">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm">Informações Completas</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {profile.location_city && profile.location_state && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Localização</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{profile.location_city}, {profile.location_state}</span>
                    </div>
                  )}
                  {profile.idade && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Idade</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{profile.idade} anos</span>
                    </div>
                  )}
                  {profile.gender && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Gênero</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{formatGender(profile.gender)}</span>
                    </div>
                  )}
                  {profile.escolaridade && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Escolaridade</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{formatEscolaridade(profile.escolaridade)}</span>
                    </div>
                  )}
                  {profile.estado_civil && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Estado Civil</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{formatEstadoCivil(profile.estado_civil)}</span>
                    </div>
                  )}
                  {profile.filhos !== null && profile.filhos !== undefined && (
                    <div className="flex justify-between py-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Filhos</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                    </div>
                  )}
                  {isProfessional && profile.professional_experience_years && (
                    <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-800 mt-3 pt-3">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Experiência</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                    </div>
                  )}
                  {isProfessional && profile.turno_trabalho && (
                    <div className="flex justify-between py-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Turno</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                    </div>
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

