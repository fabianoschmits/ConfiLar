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
  Share2, ThumbsUp, BarChart3, PieChart, LineChart, TrendingUp, Eye
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

export default function PerfilTeste11Page() {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Dashboard Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={profile.avatar_url || profile.profile_photo_url}
                  alt={profile.full_name || 'Usuário'}
                  fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  size="lg"
                  userId={profile.id}
                  showReferralBadge={true}
                  className="ring-2 ring-slate-600"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white">
                      {profile.full_name || 'Usuário'}
                    </h1>
                    {profile.is_verified && (
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isProfessional ? 'default' : 'secondary'} className="text-xs">
                      {isProfessional ? 'Profissional' : 'Cliente'}
                    </Badge>
                    {isProfessional && (
                      <Badge className={`text-xs ${profile.is_available ? 'bg-green-600' : 'bg-red-600'}`}>
                        {profile.is_available ? 'Disponível' : 'Ocupado'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {!isOwnProfile && (
                  <Button onClick={handleContact} className="bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contatar
                  </Button>
                )}
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Dados Pessoais */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.bio && (
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                  <div className="space-y-3 pt-4 border-t border-slate-700">
                    {profile.location_city && profile.location_state && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{profile.location_city}, {profile.location_state}</span>
                      </div>
                    )}
                    {profile.idade && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{profile.idade} anos</span>
                      </div>
                    )}
                    {profile.gender && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{formatGender(profile.gender)}</span>
                      </div>
                    )}
                    {profile.escolaridade && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{formatEscolaridade(profile.escolaridade)}</span>
                      </div>
                    )}
                    {profile.estado_civil && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{formatEstadoCivil(profile.estado_civil)}</span>
                      </div>
                    )}
                    {profile.filhos !== null && profile.filhos !== undefined && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {isProfessional && (
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                      Profissional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.professional_experience_years && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-sm text-slate-400">Experiência</span>
                        <span className="text-sm font-medium text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                      </div>
                    )}
                    {profile.turno_trabalho && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-sm text-slate-400">Turno</span>
                        <span className="text-sm font-medium text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                      </div>
                    )}
                    {profile.referencia_profissional && (
                      <div className="pt-2">
                        <div className="text-xs text-slate-400 mb-2">Referência</div>
                        <p className="text-sm text-slate-300">{profile.referencia_profissional}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-5 h-5 text-white/80" />
                      <BarChart3 className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{profile.rating.toFixed(1)}</div>
                    <div className="text-xs text-white/80">Avaliação</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-white/80" />
                      <PieChart className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{profile.total_reviews}</div>
                    <div className="text-xs text-white/80">Avaliações</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-600 to-pink-700 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-5 h-5 text-white/80" />
                      <TrendingUp className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 capitalize">{profile.badge}</div>
                    <div className="text-xs text-white/80">Badge</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-5 h-5 text-white/80" />
                      <LineChart className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">0</div>
                    <div className="text-xs text-white/80">Visualizações</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="recommendations" className="w-full">
                <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} bg-slate-800/50 border border-slate-700`}>
                  <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Recomendações
                  </TabsTrigger>
                  {isProfessional && <TabsTrigger value="services" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Serviços
                  </TabsTrigger>}
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
                    <Star className="w-4 h-4 mr-2" />
                    Avaliações
                  </TabsTrigger>
                  {isProfessional && <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
                    <Building2 className="w-4 h-4 mr-2" />
                    Portfólio
                  </TabsTrigger>}
                  <TabsTrigger value="about" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
                    <User className="w-4 h-4 mr-2" />
                    Sobre
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recommendations" className="space-y-4 mt-6">
                  {recommendationsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                          <CardContent className="p-4">
                            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : recommendations.length === 0 ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-12">
                        <EmptyState icon={<ThumbsUp className="h-12 w-12 text-slate-500" />} title="Nenhuma recomendação encontrada" description="Este usuário ainda não recebeu recomendações." />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.map((rec) => (
                        <Link key={rec.id} href={`/perfil/${rec.recommender.id}`} className="block">
                          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer">
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
                                    <h4 className="font-semibold text-white truncate">
                                      {rec.recommender.full_name}
                                    </h4>
                                    {rec.recommender.is_verified && (
                                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    )}
                                  </div>
                                  {rec.recommender.location_city && rec.recommender.location_state && (
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                                      <MapPin className="w-3 h-3" />
                                      {rec.recommender.location_city}, {rec.recommender.location_state}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    {rec.recommender.rating > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-medium text-slate-300">{rec.recommender.rating.toFixed(1)}</span>
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

                <TabsContent value="services" className="mt-6">
                  {isProfessional ? (
                    profile.professional_services && profile.professional_services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.professional_services.map((service, index) => (
                          <Card key={index} className="bg-slate-800/50 border-slate-700 border-l-4 border-l-purple-500">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="font-medium text-white">{service}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-12">
                          <EmptyState icon={<Briefcase className="h-12 w-12 text-slate-500" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                        </CardContent>
                      </Card>
                    )
                  ) : (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-12 text-center">
                        <User className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Este usuário é um cliente e não oferece serviços.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-6 space-y-4">
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                          <CardContent className="p-4">
                            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
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
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-12">
                        <EmptyState icon={<Star className="h-12 w-12 text-slate-500" />} title="Nenhuma avaliação encontrada" description="Este usuário ainda não recebeu avaliações." />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="portfolio" className="mt-6">
                  {isProfessional ? (
                    portfolioLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                            <CardContent className="p-4">
                              <div className="h-32 bg-slate-700 rounded mb-2"></div>
                              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : portfolioProjects && portfolioProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolioProjects.map((project) => (
                          <Card key={project.id} className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-white mb-2">{project.title}</h4>
                              <p className="text-sm text-slate-300 mb-3 line-clamp-2">{project.description}</p>
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>{format(new Date(project.created_at), 'dd/MM/yyyy')}</span>
                                <span>{project.views_count} visualizações</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-12">
                          <EmptyState icon={<Building2 className="h-12 w-12 text-slate-500" />} title="Nenhum projeto no portfólio" description="Este profissional ainda não adicionou projetos ao portfólio." />
                        </CardContent>
                      </Card>
                    )
                  ) : (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-12 text-center">
                        <User className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Este usuário é um cliente e não possui portfólio.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="about" className="mt-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Informações Detalhadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Pessoais</h3>
                          {profile.location_city && profile.location_state && (
                            <div className="flex justify-between py-2 border-b border-slate-700">
                              <span className="text-sm text-slate-400">Localização</span>
                              <span className="text-sm font-medium text-white">{profile.location_city}, {profile.location_state}</span>
                            </div>
                          )}
                          {profile.idade && (
                            <div className="flex justify-between py-2 border-b border-slate-700">
                              <span className="text-sm text-slate-400">Idade</span>
                              <span className="text-sm font-medium text-white">{profile.idade} anos</span>
                            </div>
                          )}
                          {profile.gender && (
                            <div className="flex justify-between py-2 border-b border-slate-700">
                              <span className="text-sm text-slate-400">Gênero</span>
                              <span className="text-sm font-medium text-white">{formatGender(profile.gender)}</span>
                            </div>
                          )}
                          {profile.escolaridade && (
                            <div className="flex justify-between py-2 border-b border-slate-700">
                              <span className="text-sm text-slate-400">Escolaridade</span>
                              <span className="text-sm font-medium text-white">{formatEscolaridade(profile.escolaridade)}</span>
                            </div>
                          )}
                          {profile.estado_civil && (
                            <div className="flex justify-between py-2 border-b border-slate-700">
                              <span className="text-sm text-slate-400">Estado Civil</span>
                              <span className="text-sm font-medium text-white">{formatEstadoCivil(profile.estado_civil)}</span>
                            </div>
                          )}
                          {profile.filhos !== null && profile.filhos !== undefined && (
                            <div className="flex justify-between py-2">
                              <span className="text-sm text-slate-400">Filhos</span>
                              <span className="text-sm font-medium text-white">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                            </div>
                          )}
                        </div>
                        {isProfessional && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Profissionais</h3>
                            {profile.professional_experience_years && (
                              <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-sm text-slate-400">Experiência</span>
                                <span className="text-sm font-medium text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                              </div>
                            )}
                            {profile.turno_trabalho && (
                              <div className="flex justify-between py-2">
                                <span className="text-sm text-slate-400">Turno</span>
                                <span className="text-sm font-medium text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
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
