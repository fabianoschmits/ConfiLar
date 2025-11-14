'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useProfileData, formatEscolaridade, formatEstadoCivil, formatTurnoTrabalho, formatGender } from '@/hooks/useProfileData'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/MainLayout'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { 
  MapPin, Star, Phone, Mail, User, Briefcase, MessageCircle, Calendar,
  CheckCircle, Eye, GraduationCap, Heart, Users, Clock, Award, Building2,
  Globe, Share2, Linkedin, Mail as MailIcon, Phone as PhoneIcon, ThumbsUp
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useRecommendations } from '@/hooks/useRecommendations'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProfilePageSkeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function PerfilTeste4Page() {
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Banner LinkedIn Style */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-48 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
          {/* Profile Card LinkedIn Style */}
          <Card className="mb-8 shadow-xl border-0">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Foto Grande à Esquerda */}
                <div className="flex-shrink-0 -mt-32 lg:-mt-40">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-white dark:bg-gray-900 rounded-full"></div>
                    <UserAvatar
                      src={profile.avatar_url || profile.profile_photo_url}
                      alt={profile.full_name || 'Usuário'}
                      fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                      size="xl"
                      userId={profile.id}
                      showReferralBadge={true}
                      className="relative ring-4 ring-white dark:ring-gray-900 shadow-2xl"
                    />
                    {profile.is_verified && (
                      <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 ring-4 ring-white dark:ring-gray-900">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dados à Direita */}
                <div className="flex-1 min-w-0 pt-4 lg:pt-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {profile.full_name || 'Usuário'}
                      </h1>
                      {profile.bio && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                          {profile.bio}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {profile.location_city && profile.location_state && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{profile.location_city}, {profile.location_state}</span>
                          </div>
                        )}
                        {profile.phone && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <PhoneIcon className="w-4 h-4" />
                            <span className="text-sm">{profile.phone}</span>
                          </div>
                        )}
                        {profile.email && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <MailIcon className="w-4 h-4" />
                            <span className="text-sm">{profile.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!isOwnProfile && (
                        <Button onClick={handleContact} className="bg-blue-600 hover:bg-blue-700">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Conectar
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>

                  {/* Estatísticas LinkedIn Style */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.rating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avaliação</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.total_reviews}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avaliações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Visualizações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{profile.badge}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Badge</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs LinkedIn Style */}
          <Tabs defaultValue="recommendations" className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger value="recommendations" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">Recomend.</TabsTrigger>
                {isProfessional && <TabsTrigger value="services" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">Serviços</TabsTrigger>}
                <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">Avaliações</TabsTrigger>
                {isProfessional && <TabsTrigger value="portfolio" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">Portfólio</TabsTrigger>}
                <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">Sobre</TabsTrigger>
              </TabsList>
            </div>

            {/* Aba de Recomendações */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5" />
                    Recomendações
                    {recommendations.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {recommendations.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recommendationsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 animate-pulse">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
                          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
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
                                  <div className="flex items-center gap-2 mb-2">
                                    {rec.recommender.rating > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                          {rec.recommender.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                    <Badge variant={rec.recommender.user_type === 'professional' ? 'default' : 'secondary'} className="text-xs">
                                      {rec.recommender.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.bio ? (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Nenhum resumo disponível.</p>
                      )}
                    </CardContent>
                  </Card>

                  {isProfessional && profile.referencia_profissional && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Experiência Profissional</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.referencia_profissional}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile.idade && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-gray-600 dark:text-gray-400">Idade</span>
                          <span className="font-medium">{profile.idade} anos</span>
                        </div>
                      )}
                      {profile.escolaridade && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-gray-600 dark:text-gray-400">Escolaridade</span>
                          <span className="font-medium text-right">{formatEscolaridade(profile.escolaridade)}</span>
                        </div>
                      )}
                      {profile.estado_civil && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-gray-600 dark:text-gray-400">Estado Civil</span>
                          <span className="font-medium">{formatEstadoCivil(profile.estado_civil)}</span>
                        </div>
                      )}
                      {profile.filhos !== null && profile.filhos !== undefined && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-gray-600 dark:text-gray-400">Filhos</span>
                          <span className="font-medium">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                        </div>
                      )}
                      {isProfessional && profile.professional_experience_years && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-gray-600 dark:text-gray-400">Experiência</span>
                          <span className="font-medium">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                        </div>
                      )}
                      {isProfessional && profile.turno_trabalho && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-600 dark:text-gray-400">Turno</span>
                          <span className="font-medium">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services">
              {isProfessional ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Serviços Oferecidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.professional_services && profile.professional_services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.professional_services.map((service, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-900 dark:text-white">{service}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={<Briefcase className="h-12 w-12 text-gray-400" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cliente</h3>
                    <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não oferece serviços.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Avaliações</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio">
              {isProfessional ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Portfólio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {portfolioLoading ? (
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
                          <div key={project.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{project.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{project.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
                <Card>
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cliente</h3>
                    <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não possui portfólio.</p>
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

