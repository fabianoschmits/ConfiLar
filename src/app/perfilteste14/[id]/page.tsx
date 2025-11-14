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
  Share2, ThumbsUp, Palette, Frame, Brush, Image
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

export default function PerfilTeste14Page() {
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
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Gallery Style Header */}
        <div className="relative bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100 dark:from-rose-950 dark:via-pink-950 dark:to-fuchsia-950">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="text-center mb-12">
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-8 bg-white dark:bg-neutral-900 rounded-full shadow-2xl transform rotate-6"></div>
                <UserAvatar
                  src={profile.avatar_url || profile.profile_photo_url}
                  alt={profile.full_name || 'Usuário'}
                  fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  size="xl"
                  userId={profile.id}
                  showReferralBadge={true}
                  className="relative ring-8 ring-white dark:ring-neutral-900 shadow-2xl"
                />
                {profile.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 ring-4 ring-white dark:ring-neutral-900 shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <h1 className="text-5xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
                {profile.full_name || 'Usuário'}
              </h1>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge variant={isProfessional ? 'default' : 'secondary'} className="text-sm px-4 py-1">
                  {isProfessional ? 'Profissional' : 'Cliente'}
                </Badge>
                {isProfessional && (
                  <Badge className={profile.is_available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                    {profile.is_available ? 'Disponível' : 'Ocupado'}
                  </Badge>
                )}
                {profile.rating > 0 && (
                  <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-neutral-900 rounded-full shadow-lg">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-neutral-900 dark:text-white">{profile.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {profile.bio && (
                <p className="text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                  {profile.bio}
                </p>
              )}
              {!isOwnProfile && (
                <Button onClick={handleContact} size="lg" className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-xl">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contatar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Info Panels - Gallery Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 hover:border-rose-400 dark:hover:border-rose-600 transition-colors">
              <CardContent className="p-6 text-center">
                <Palette className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">{profile.rating.toFixed(1)}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Avaliação</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 hover:border-pink-400 dark:hover:border-pink-600 transition-colors">
              <CardContent className="p-6 text-center">
                <Frame className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">{profile.total_reviews}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Avaliações</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 hover:border-fuchsia-400 dark:hover:border-fuchsia-600 transition-colors">
              <CardContent className="p-6 text-center">
                <Brush className="w-8 h-8 text-fuchsia-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1 capitalize">{profile.badge}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Badge</div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Info Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {profile.location_city && profile.location_state && (
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-4 text-center">
                  <MapPin className="w-5 h-5 text-rose-500 mx-auto mb-2" />
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Localização</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">{profile.location_city}, {profile.location_state}</div>
                </CardContent>
              </Card>
            )}
            {profile.idade && (
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-5 h-5 text-pink-500 mx-auto mb-2" />
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Idade</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">{profile.idade} anos</div>
                </CardContent>
              </Card>
            )}
            {profile.escolaridade && (
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-4 text-center">
                  <GraduationCap className="w-5 h-5 text-fuchsia-500 mx-auto mb-2" />
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Escolaridade</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">{formatEscolaridade(profile.escolaridade)}</div>
                </CardContent>
              </Card>
            )}
            {profile.estado_civil && (
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-4 text-center">
                  <Heart className="w-5 h-5 text-rose-500 mx-auto mb-2" />
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Estado Civil</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">{formatEstadoCivil(profile.estado_civil)}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Professional Gallery */}
          {isProfessional && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-rose-500" />
                Informações Profissionais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profile.professional_experience_years && (
                  <Card className="border-2 border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-6">
                      <Clock className="w-6 h-6 text-pink-500 mb-3" />
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Experiência</div>
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</div>
                    </CardContent>
                  </Card>
                )}
                {profile.turno_trabalho && (
                  <Card className="border-2 border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-6">
                      <Clock className="w-6 h-6 text-fuchsia-500 mb-3" />
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Turno</div>
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</div>
                    </CardContent>
                  </Card>
                )}
                {profile.referencia_profissional && (
                  <Card className="md:col-span-3 border-2 border-neutral-200 dark:border-neutral-800">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="w-5 h-5 text-rose-500" />
                        Referência Profissional
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-700 dark:text-neutral-300">{profile.referencia_profissional}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Tabs Section */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-2 border-neutral-200 dark:border-neutral-800 animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <Card className="border-2 border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-12">
                    <EmptyState icon={<ThumbsUp className="h-12 w-12 text-neutral-400" />} title="Nenhuma recomendação encontrada" description="Este usuário ainda não recebeu recomendações." />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec) => (
                    <Link key={rec.id} href={`/perfil/${rec.recommender.id}`} className="block">
                      <Card className="border-2 border-neutral-200 dark:border-neutral-800 hover:border-rose-400 dark:hover:border-rose-600 transition-colors cursor-pointer">
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
                                <h4 className="font-semibold text-neutral-900 dark:text-white truncate">
                                  {rec.recommender.full_name}
                                </h4>
                                {rec.recommender.is_verified && (
                                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                )}
                              </div>
                              {rec.recommender.location_city && rec.recommender.location_state && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mb-2">
                                  <MapPin className="w-3 h-3" />
                                  {rec.recommender.location_city}, {rec.recommender.location_state}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                {rec.recommender.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{rec.recommender.rating.toFixed(1)}</span>
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
                      <Card key={index} className="border-2 border-neutral-200 dark:border-neutral-800 border-l-4 border-l-pink-500">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-neutral-900 dark:text-white">{service}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-12">
                      <EmptyState icon={<Briefcase className="h-12 w-12 text-neutral-400" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="border-2 border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-12 text-center">
                    <User className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">Este usuário é um cliente e não oferece serviços.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-2 border-neutral-200 dark:border-neutral-800 animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
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
                <Card className="border-2 border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-12">
                    <EmptyState icon={<Star className="h-12 w-12 text-neutral-400" />} title="Nenhuma avaliação encontrada" description="Este usuário ainda não recebeu avaliações." />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="portfolio">
              {isProfessional ? (
                portfolioLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="border-2 border-neutral-200 dark:border-neutral-800 animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : portfolioProjects && portfolioProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioProjects.map((project) => (
                      <Card key={project.id} className="border-2 border-neutral-200 dark:border-neutral-800 hover:border-rose-400 dark:hover:border-rose-600 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-neutral-900 dark:text-white mb-2">{project.title}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span>{format(new Date(project.created_at), 'dd/MM/yyyy')}</span>
                            <span>{project.views_count} visualizações</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-12">
                      <EmptyState icon={<Building2 className="h-12 w-12 text-neutral-400" />} title="Nenhum projeto no portfólio" description="Este profissional ainda não adicionou projetos ao portfólio." />
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="border-2 border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-12 text-center">
                    <User className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">Este usuário é um cliente e não possui portfólio.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="about">
              <Card className="border-2 border-neutral-200 dark:border-neutral-800">
                <CardHeader>
                  <CardTitle>Informações Completas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Informações Pessoais</h3>
                      {profile.location_city && profile.location_state && (
                        <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Localização</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{profile.location_city}, {profile.location_state}</span>
                        </div>
                      )}
                      {profile.idade && (
                        <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Idade</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{profile.idade} anos</span>
                        </div>
                      )}
                      {profile.gender && (
                        <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Gênero</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{formatGender(profile.gender)}</span>
                        </div>
                      )}
                      {profile.escolaridade && (
                        <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Escolaridade</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{formatEscolaridade(profile.escolaridade)}</span>
                        </div>
                      )}
                      {profile.estado_civil && (
                        <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Estado Civil</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{formatEstadoCivil(profile.estado_civil)}</span>
                        </div>
                      )}
                      {profile.filhos !== null && profile.filhos !== undefined && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Filhos</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                        </div>
                      )}
                    </div>
                    {isProfessional && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Informações Profissionais</h3>
                        {profile.professional_experience_years && (
                          <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Experiência</span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                          </div>
                        )}
                        {profile.turno_trabalho && (
                          <div className="flex justify-between py-2">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Turno</span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
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

