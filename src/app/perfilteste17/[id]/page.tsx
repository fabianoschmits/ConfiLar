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
  Share2, ThumbsUp, Code, Rocket, Shield, Zap
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

export default function PerfilTeste17Page() {
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
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900">
        {/* Tech Style Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDBoMjB2MjBIMHptNDAgMHYyMGgxMHoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="text-center mb-12">
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-6 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full blur-2xl opacity-50"></div>
                <UserAvatar
                  src={profile.avatar_url || profile.profile_photo_url}
                  alt={profile.full_name || 'Usuário'}
                  fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  size="xl"
                  userId={profile.id}
                  showReferralBadge={true}
                  className="relative ring-4 ring-violet-500/50 shadow-2xl"
                />
                {profile.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-violet-600 rounded-full p-2 ring-4 ring-violet-900 shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                {profile.full_name || 'Usuário'}
              </h1>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge variant={isProfessional ? 'default' : 'secondary'} className="bg-violet-600 text-white border-violet-400">
                  {isProfessional ? 'Profissional' : 'Cliente'}
                </Badge>
                {isProfessional && (
                  <Badge className={profile.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {profile.is_available ? 'Online' : 'Offline'}
                  </Badge>
                )}
                {profile.rating > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-white">{profile.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {profile.bio && (
                <p className="text-lg text-violet-100 max-w-2xl mx-auto mb-6 leading-relaxed">
                  {profile.bio}
                </p>
              )}
              {!isOwnProfile && (
                <Button onClick={handleContact} size="lg" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-2xl">
                  <Rocket className="w-5 h-5 mr-2" />
                  Iniciar Conversa
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tech Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-12 relative z-10">
          {/* Stats Grid - Tech Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-gradient-to-br from-violet-800/80 to-violet-900/80 backdrop-blur-sm border-violet-700/50">
              <CardContent className="p-6 text-center text-white">
                <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <div className="text-3xl font-black mb-1">{profile.rating.toFixed(1)}</div>
                <div className="text-xs text-violet-200">Avaliação</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-800/80 to-purple-900/80 backdrop-blur-sm border-purple-700/50">
              <CardContent className="p-6 text-center text-white">
                <Users className="w-6 h-6 mx-auto mb-2 text-purple-300" />
                <div className="text-3xl font-black mb-1">{profile.total_reviews}</div>
                <div className="text-xs text-purple-200">Avaliações</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-fuchsia-800/80 to-fuchsia-900/80 backdrop-blur-sm border-fuchsia-700/50">
              <CardContent className="p-6 text-center text-white">
                <Award className="w-6 h-6 mx-auto mb-2 text-fuchsia-300" />
                <div className="text-3xl font-black mb-1 capitalize text-sm">{profile.badge}</div>
                <div className="text-xs text-fuchsia-200">Badge</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-800/80 to-pink-900/80 backdrop-blur-sm border-pink-700/50">
              <CardContent className="p-6 text-center text-white">
                <Zap className="w-6 h-6 mx-auto mb-2 text-pink-300" />
                <div className="text-3xl font-black mb-1">0</div>
                <div className="text-xs text-pink-200">Visualizações</div>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {profile.location_city && profile.location_state && (
              <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-violet-400" />
                  <div>
                    <div className="text-xs text-violet-300 mb-1">Localização</div>
                    <div className="font-medium text-white">{profile.location_city}, {profile.location_state}</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {profile.idade && (
              <Card className="bg-white/5 backdrop-blur-sm border-purple-700/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-xs text-purple-300 mb-1">Idade</div>
                    <div className="font-medium text-white">{profile.idade} anos</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {profile.escolaridade && (
              <Card className="bg-white/5 backdrop-blur-sm border-fuchsia-700/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-fuchsia-400" />
                  <div>
                    <div className="text-xs text-fuchsia-300 mb-1">Escolaridade</div>
                    <div className="font-medium text-white text-sm">{formatEscolaridade(profile.escolaridade)}</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {profile.estado_civil && (
              <Card className="bg-white/5 backdrop-blur-sm border-pink-700/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <div>
                    <div className="text-xs text-pink-300 mb-1">Estado Civil</div>
                    <div className="font-medium text-white">{formatEstadoCivil(profile.estado_civil)}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Professional Section */}
          {isProfessional && (
            <div className="mb-12">
              <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-violet-400" />
                    Informações Profissionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.professional_experience_years && (
                    <div className="flex justify-between items-center py-2 border-b border-violet-700/30">
                      <span className="text-sm text-violet-300">Experiência</span>
                      <span className="font-medium text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                    </div>
                  )}
                  {profile.turno_trabalho && (
                    <div className="flex justify-between items-center py-2 border-b border-violet-700/30">
                      <span className="text-sm text-violet-300">Turno</span>
                      <span className="font-medium text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                    </div>
                  )}
                  {profile.referencia_profissional && (
                    <div className="pt-2">
                      <div className="text-xs text-violet-300 mb-2">Referência</div>
                      <p className="text-sm text-violet-100">{profile.referencia_profissional}</p>
                    </div>
                  )}
                  {profile.professional_services && profile.professional_services.length > 0 && (
                    <div className="pt-2 border-t border-violet-700/30">
                      <div className="text-xs text-violet-300 mb-2">Serviços</div>
                      <div className="flex flex-wrap gap-2">
                        {profile.professional_services.map((service, index) => (
                          <Badge key={index} className="bg-violet-600 text-white">{service}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs Section */}
          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} mb-6 bg-white/5 backdrop-blur-sm border-violet-700/30`}>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-violet-200">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Recomendações
              </TabsTrigger>
              {isProfessional && <TabsTrigger value="services" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-violet-200">
                <Briefcase className="w-4 h-4 mr-2" />
                Serviços
              </TabsTrigger>}
              <TabsTrigger value="reviews" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-violet-200">
                <Star className="w-4 h-4 mr-2" />
                Avaliações
              </TabsTrigger>
              {isProfessional && <TabsTrigger value="portfolio" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-violet-200">
                <Building2 className="w-4 h-4 mr-2" />
                Portfólio
              </TabsTrigger>}
              <TabsTrigger value="about" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-violet-200">
                <User className="w-4 h-4 mr-2" />
                Sobre
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-4">
              {recommendationsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="bg-white/5 backdrop-blur-sm border-violet-700/30 animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-violet-700/30 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-violet-700/30 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30">
                  <CardContent className="p-12">
                    <EmptyState icon={<ThumbsUp className="h-12 w-12 text-violet-400" />} title="Nenhuma recomendação encontrada" description="Este usuário ainda não recebeu recomendações." />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec) => (
                    <Link key={rec.id} href={`/perfil/${rec.recommender.id}`} className="block">
                      <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30 hover:border-violet-500 transition-colors cursor-pointer">
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
                                  <Shield className="w-4 h-4 text-violet-400 flex-shrink-0" />
                                )}
                              </div>
                              {rec.recommender.location_city && rec.recommender.location_state && (
                                <p className="text-xs text-violet-300 flex items-center gap-1 mb-2">
                                  <MapPin className="w-3 h-3" />
                                  {rec.recommender.location_city}, {rec.recommender.location_state}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                {rec.recommender.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs font-medium text-violet-200">{rec.recommender.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                <Badge variant={rec.recommender.user_type === 'professional' ? 'default' : 'secondary'} className="text-xs bg-violet-600 text-white">
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
                      <Card key={index} className="bg-white/5 backdrop-blur-sm border-violet-700/30 border-l-4 border-l-violet-500">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Code className="w-5 h-5 text-green-400" />
                            <span className="font-medium text-white">{service}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30">
                    <CardContent className="p-12">
                      <EmptyState icon={<Briefcase className="h-12 w-12 text-violet-400" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30">
                  <CardContent className="p-12 text-center">
                    <User className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                    <p className="text-violet-200">Este usuário é um cliente e não oferece serviços.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-white/5 backdrop-blur-sm border-violet-700/30 animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-violet-700/30 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-violet-700/30 rounded w-1/2"></div>
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
                <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30">
                  <CardContent className="p-12">
                    <EmptyState icon={<Star className="h-12 w-12 text-violet-400" />} title="Nenhuma avaliação encontrada" description="Este usuário ainda não recebeu avaliações." />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="portfolio">
              {isProfessional ? (
                portfolioLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="bg-white/5 backdrop-blur-sm border-violet-700/30 animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-32 bg-violet-700/30 rounded mb-2"></div>
                          <div className="h-4 bg-violet-700/30 rounded w-3/4"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : portfolioProjects && portfolioProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioProjects.map((project) => (
                      <Card key={project.id} className="bg-white/5 backdrop-blur-sm border-violet-700/30 hover:border-violet-500 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">{project.title}</h4>
                          <p className="text-sm text-violet-200 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between text-xs text-violet-300">
                            <span>{format(new Date(project.created_at), 'dd/MM/yyyy')}</span>
                            <span>{project.views_count} visualizações</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30">
                    <CardContent className="p-12">
                      <EmptyState icon={<Building2 className="h-12 w-12 text-violet-400" />} title="Nenhum projeto no portfólio" description="Este profissional ainda não adicionou projetos ao portfólio." />
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30">
                  <CardContent className="p-12 text-center">
                    <User className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                    <p className="text-violet-200">Este usuário é um cliente e não possui portfólio.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="about">
              <Card className="bg-white/5 backdrop-blur-sm border-violet-700/30">
                <CardHeader>
                  <CardTitle className="text-white">Informações Completas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Informações Pessoais</h3>
                      {profile.location_city && profile.location_state && (
                        <div className="flex justify-between py-2 border-b border-violet-700/30">
                          <span className="text-sm text-violet-300">Localização</span>
                          <span className="text-sm font-medium text-white">{profile.location_city}, {profile.location_state}</span>
                        </div>
                      )}
                      {profile.idade && (
                        <div className="flex justify-between py-2 border-b border-violet-700/30">
                          <span className="text-sm text-violet-300">Idade</span>
                          <span className="text-sm font-medium text-white">{profile.idade} anos</span>
                        </div>
                      )}
                      {profile.gender && (
                        <div className="flex justify-between py-2 border-b border-violet-700/30">
                          <span className="text-sm text-violet-300">Gênero</span>
                          <span className="text-sm font-medium text-white">{formatGender(profile.gender)}</span>
                        </div>
                      )}
                      {profile.escolaridade && (
                        <div className="flex justify-between py-2 border-b border-violet-700/30">
                          <span className="text-sm text-violet-300">Escolaridade</span>
                          <span className="text-sm font-medium text-white">{formatEscolaridade(profile.escolaridade)}</span>
                        </div>
                      )}
                      {profile.estado_civil && (
                        <div className="flex justify-between py-2 border-b border-violet-700/30">
                          <span className="text-sm text-violet-300">Estado Civil</span>
                          <span className="text-sm font-medium text-white">{formatEstadoCivil(profile.estado_civil)}</span>
                        </div>
                      )}
                      {profile.filhos !== null && profile.filhos !== undefined && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-violet-300">Filhos</span>
                          <span className="text-sm font-medium text-white">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                        </div>
                      )}
                    </div>
                    {isProfessional && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Informações Profissionais</h3>
                        {profile.professional_experience_years && (
                          <div className="flex justify-between py-2 border-b border-violet-700/30">
                            <span className="text-sm text-violet-300">Experiência</span>
                            <span className="text-sm font-medium text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                          </div>
                        )}
                        {profile.turno_trabalho && (
                          <div className="flex justify-between py-2">
                            <span className="text-sm text-violet-300">Turno</span>
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
    </MainLayout>
  )
}

