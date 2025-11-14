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
  Share2, ThumbsUp, Sun, Moon, Sparkles, Target
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

export default function PerfilTeste19Page() {
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950">
        {/* Creative Style Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg4=')] opacity-20"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-6 bg-white rounded-full blur-2xl opacity-30"></div>
                <UserAvatar
                  src={profile.avatar_url || profile.profile_photo_url}
                  alt={profile.full_name || 'Usuário'}
                  fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  size="xl"
                  userId={profile.id}
                  showReferralBadge={true}
                  className="relative ring-4 ring-white/50 shadow-2xl"
                />
                {profile.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-orange-600 rounded-full p-2 ring-4 ring-white shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                {profile.full_name || 'Usuário'}
              </h1>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge variant={isProfessional ? 'default' : 'secondary'} className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {isProfessional ? 'Profissional' : 'Cliente'}
                </Badge>
                {isProfessional && (
                  <Badge className={profile.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {profile.is_available ? 'Disponível' : 'Ocupado'}
                  </Badge>
                )}
                {profile.rating > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
                    <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    <span className="font-bold text-white">{profile.rating.toFixed(1)}</span>
                    <span className="text-sm text-white/80">({profile.total_reviews})</span>
                  </div>
                )}
              </div>
              {profile.bio && (
                <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
                  {profile.bio}
                </p>
              )}
              {profile.location_city && profile.location_state && (
                <div className="flex items-center justify-center gap-2 text-white/90 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location_city}, {profile.location_state}</span>
                </div>
              )}
              {!isOwnProfile && (
                <Button onClick={handleContact} size="lg" className="bg-white text-orange-600 hover:bg-white/90 shadow-xl">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contatar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-12 relative z-10">
          {/* Stats - Creative Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600">
              <CardContent className="p-6 text-center text-white">
                <Star className="w-6 h-6 mx-auto mb-2" />
                <div className="text-3xl font-black mb-1">{profile.rating.toFixed(1)}</div>
                <div className="text-xs text-orange-100">Avaliação</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-red-600">
              <CardContent className="p-6 text-center text-white">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="text-3xl font-black mb-1">{profile.total_reviews}</div>
                <div className="text-xs text-red-100">Avaliações</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-500 to-pink-600">
              <CardContent className="p-6 text-center text-white">
                <Award className="w-6 h-6 mx-auto mb-2" />
                <div className="text-3xl font-black mb-1 capitalize text-xs">{profile.badge}</div>
                <div className="text-xs text-pink-100">Badge</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-500 to-rose-600">
              <CardContent className="p-6 text-center text-white">
                <Target className="w-6 h-6 mx-auto mb-2" />
                <div className="text-3xl font-black mb-1">0</div>
                <div className="text-xs text-rose-100">Views</div>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {profile.idade && (
              <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20 shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Idade</div>
                    <div className="font-bold text-gray-900 dark:text-white text-lg">{profile.idade} anos</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {profile.escolaridade && (
              <Card className="border-2 border-red-200 dark:border-red-800 bg-white dark:bg-red-950/20 shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Escolaridade</div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">{formatEscolaridade(profile.escolaridade)}</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {profile.estado_civil && (
              <Card className="border-2 border-pink-200 dark:border-pink-800 bg-white dark:bg-pink-950/20 shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-pink-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado Civil</div>
                    <div className="font-bold text-gray-900 dark:text-white">{formatEstadoCivil(profile.estado_civil)}</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {profile.gender && (
              <Card className="border-2 border-rose-200 dark:border-rose-800 bg-white dark:bg-rose-950/20 shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <User className="w-6 h-6 text-rose-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gênero</div>
                    <div className="font-bold text-gray-900 dark:text-white">{formatGender(profile.gender)}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Professional Section */}
          {isProfessional && (
            <Card className="border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 shadow-xl mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-200">
                  <Briefcase className="w-6 h-6 text-orange-600" />
                  Informações Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.professional_experience_years && (
                  <div className="flex justify-between items-center py-2 border-b border-orange-200 dark:border-orange-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Experiência</span>
                    <span className="font-bold text-gray-900 dark:text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                  </div>
                )}
                {profile.turno_trabalho && (
                  <div className="flex justify-between items-center py-2 border-b border-orange-200 dark:border-orange-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Turno</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                  </div>
                )}
                {profile.referencia_profissional && (
                  <div className="pt-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Referência Profissional</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{profile.referencia_profissional}</p>
                  </div>
                )}
                {profile.professional_services && profile.professional_services.length > 0 && (
                  <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Serviços</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.professional_services.map((service, index) => (
                        <Badge key={index} className="bg-orange-600 text-white">{service}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} mb-6 bg-orange-100 dark:bg-orange-900/30`}>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Recomendações
              </TabsTrigger>
              {isProfessional && <TabsTrigger value="services" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <Briefcase className="w-4 h-4 mr-2" />
                Serviços
              </TabsTrigger>}
              <TabsTrigger value="reviews" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <Star className="w-4 h-4 mr-2" />
                Avaliações
              </TabsTrigger>
              {isProfessional && <TabsTrigger value="portfolio" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <Building2 className="w-4 h-4 mr-2" />
                Portfólio
              </TabsTrigger>}
              <TabsTrigger value="about" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Sobre
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-4">
              {recommendationsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-2 border-orange-200 dark:border-orange-800 animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-orange-200 dark:bg-orange-800 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-orange-200 dark:bg-orange-800 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20">
                  <CardContent className="p-12">
                    <EmptyState icon={<ThumbsUp className="h-12 w-12 text-orange-400" />} title="Nenhuma recomendação encontrada" description="Este usuário ainda não recebeu recomendações." />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec) => (
                    <Link key={rec.id} href={`/perfil/${rec.recommender.id}`} className="block">
                      <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20 hover:border-orange-400 dark:hover:border-orange-600 transition-colors cursor-pointer">
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
                                  <Sparkles className="w-4 h-4 text-orange-600 flex-shrink-0" />
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
                                <Badge variant={rec.recommender.user_type === 'professional' ? 'default' : 'secondary'} className="text-xs bg-orange-600 text-white">
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
                      <Card key={index} className="border-2 border-orange-200 dark:border-orange-800 border-l-4 border-l-orange-500 bg-white dark:bg-orange-950/20">
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
                  <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20">
                    <CardContent className="p-12">
                      <EmptyState icon={<Briefcase className="h-12 w-12 text-orange-400" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20">
                  <CardContent className="p-12 text-center">
                    <User className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não oferece serviços.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-2 border-orange-200 dark:border-orange-800 animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-orange-200 dark:bg-orange-800 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-orange-200 dark:bg-orange-800 rounded w-1/2"></div>
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
                <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20">
                  <CardContent className="p-12">
                    <EmptyState icon={<Star className="h-12 w-12 text-orange-400" />} title="Nenhuma avaliação encontrada" description="Este usuário ainda não recebeu avaliações." />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="portfolio">
              {isProfessional ? (
                portfolioLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="border-2 border-orange-200 dark:border-orange-800 animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-32 bg-orange-200 dark:bg-orange-800 rounded mb-2"></div>
                          <div className="h-4 bg-orange-200 dark:bg-orange-800 rounded w-3/4"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : portfolioProjects && portfolioProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioProjects.map((project) => (
                      <Card key={project.id} className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20 hover:border-orange-400 dark:hover:border-orange-600 transition-colors">
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
                  <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20">
                    <CardContent className="p-12">
                      <EmptyState icon={<Building2 className="h-12 w-12 text-orange-400" />} title="Nenhum projeto no portfólio" description="Este profissional ainda não adicionou projetos ao portfólio." />
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20">
                  <CardContent className="p-12 text-center">
                    <User className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não possui portfólio.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="about">
              <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/20">
                <CardHeader>
                  <CardTitle>Informações Completas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Pessoais</h3>
                      {profile.location_city && profile.location_state && (
                        <div className="flex justify-between py-2 border-b border-orange-200 dark:border-orange-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Localização</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.location_city}, {profile.location_state}</span>
                        </div>
                      )}
                      {profile.idade && (
                        <div className="flex justify-between py-2 border-b border-orange-200 dark:border-orange-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Idade</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.idade} anos</span>
                        </div>
                      )}
                      {profile.gender && (
                        <div className="flex justify-between py-2 border-b border-orange-200 dark:border-orange-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Gênero</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatGender(profile.gender)}</span>
                        </div>
                      )}
                      {profile.escolaridade && (
                        <div className="flex justify-between py-2 border-b border-orange-200 dark:border-orange-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Escolaridade</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatEscolaridade(profile.escolaridade)}</span>
                        </div>
                      )}
                      {profile.estado_civil && (
                        <div className="flex justify-between py-2 border-b border-orange-200 dark:border-orange-800">
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
                          <div className="flex justify-between py-2 border-b border-orange-200 dark:border-orange-800">
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
    </MainLayout>
  )
}

