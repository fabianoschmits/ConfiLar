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
  Globe, Share2, ThumbsUp, Minus
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
      <div className="min-h-screen bg-white dark:bg-black">
        {/* Header Minimalista Limpo */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
              {/* Foto Grande Centralizada */}
              <div className="flex-shrink-0">
                <UserAvatar
                  src={profile.avatar_url || profile.profile_photo_url}
                  alt={profile.full_name || 'Usuário'}
                  fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  size="xl"
                  userId={profile.id}
                  showReferralBadge={true}
                  className="ring-2 ring-gray-300 dark:ring-gray-700"
                />
                {profile.is_verified && (
                  <div className="mt-4 flex justify-center">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  </div>
                )}
              </div>

              {/* Dados ao Lado */}
              <div className="flex-1 min-w-0 text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-4">
                  {profile.full_name || 'Usuário'}
                </h1>
                {profile.bio && (
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    {profile.bio}
                  </p>
                )}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                  <Badge variant={isProfessional ? 'default' : 'secondary'} className="font-normal">
                    {isProfessional ? 'Profissional' : 'Cliente'}
                  </Badge>
                  {isProfessional && (
                    <Badge className={profile.is_available ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-normal' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-normal'}>
                      {profile.is_available ? 'Disponível' : 'Ocupado'}
                    </Badge>
                  )}
                </div>

                {/* Estatísticas Minimalistas */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8 text-gray-600 dark:text-gray-400">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-light text-gray-900 dark:text-white">{profile.rating.toFixed(1)}</div>
                    <div className="text-sm">Avaliação</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-light text-gray-900 dark:text-white">{profile.total_reviews}</div>
                    <div className="text-sm">Avaliações</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-light text-gray-900 dark:text-white">0</div>
                    <div className="text-sm">Visualizações</div>
                  </div>
                </div>

                {/* Informações Rápidas em Lista Simples */}
                <div className="space-y-2 mb-8">
                  {profile.location_city && profile.location_state && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{profile.location_city}, {profile.location_state}</span>
                    </div>
                  )}
                  {profile.idade && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{profile.idade} anos</span>
                    </div>
                  )}
                  {profile.escolaridade && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 dark:text-gray-400">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm">{formatEscolaridade(profile.escolaridade)}</span>
                    </div>
                  )}
                </div>

                {/* Botões Minimalistas */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  {!isOwnProfile && (
                    <Button onClick={handleContact} variant="outline" className="border-gray-300 dark:border-gray-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contatar
                    </Button>
                  )}
                  <Button variant="outline" className="border-gray-300 dark:border-gray-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="recommendations" className="space-y-8">
            <div className="border-b border-gray-200 dark:border-gray-800">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger value="recommendations" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 dark:data-[state=active]:border-white rounded-none px-6 py-3">Recomend.</TabsTrigger>
                {isProfessional && <TabsTrigger value="services" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 dark:data-[state=active]:border-white rounded-none px-6 py-3">Serviços</TabsTrigger>}
                <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 dark:data-[state=active]:border-white rounded-none px-6 py-3">Avaliações</TabsTrigger>
                {isProfessional && <TabsTrigger value="portfolio" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 dark:data-[state=active]:border-white rounded-none px-6 py-3">Portfólio</TabsTrigger>}
                <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 dark:data-[state=active]:border-white rounded-none px-6 py-3">Sobre</TabsTrigger>
              </TabsList>
            </div>

            {/* Aba de Recomendações */}
            <TabsContent value="recommendations" className="space-y-6">
              <div>
                <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Recomendações</h2>
                {recommendationsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((rec) => (
                      <Link key={rec.id} href={`/perfil/${rec.recommender.id}`} className="block">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border border-gray-200 dark:border-gray-800">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <UserAvatar
                                src={rec.recommender.avatar_url}
                                alt={rec.recommender.full_name}
                                fallback={rec.recommender.full_name?.charAt(0) || 'U'}
                                size="lg"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-normal text-lg text-gray-900 dark:text-white truncate">
                                    {rec.recommender.full_name}
                                  </h4>
                                  {rec.recommender.is_verified && (
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  )}
                                </div>
                                {rec.recommender.location_city && rec.recommender.location_state && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
                                    <MapPin className="w-3 h-3" />
                                    {rec.recommender.location_city}, {rec.recommender.location_state}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                  {rec.recommender.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                      <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {rec.recommender.rating.toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                  <Badge variant={rec.recommender.user_type === 'professional' ? 'default' : 'secondary'} className="text-xs font-normal">
                                    {rec.recommender.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
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
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <div>
                <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Sobre</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Informações Pessoais</h3>
                      <div className="space-y-4">
                        {profile.gender && (
                          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-gray-600 dark:text-gray-400">Gênero</span>
                            <span className="text-gray-900 dark:text-white">{formatGender(profile.gender)}</span>
                          </div>
                        )}
                        {profile.idade && (
                          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-gray-600 dark:text-gray-400">Idade</span>
                            <span className="text-gray-900 dark:text-white">{profile.idade} anos</span>
                          </div>
                        )}
                        {profile.escolaridade && (
                          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-gray-600 dark:text-gray-400">Escolaridade</span>
                            <span className="text-gray-900 dark:text-white text-right">{formatEscolaridade(profile.escolaridade)}</span>
                          </div>
                        )}
                        {profile.estado_civil && (
                          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-gray-600 dark:text-gray-400">Estado Civil</span>
                            <span className="text-gray-900 dark:text-white">{formatEstadoCivil(profile.estado_civil)}</span>
                          </div>
                        )}
                        {profile.filhos !== null && profile.filhos !== undefined && (
                          <div className="flex justify-between py-3">
                            <span className="text-gray-600 dark:text-gray-400">Filhos</span>
                            <span className="text-gray-900 dark:text-white">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isProfessional && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Informações Profissionais</h3>
                        <div className="space-y-4">
                          {profile.professional_experience_years && (
                            <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                              <span className="text-gray-600 dark:text-gray-400">Experiência</span>
                              <span className="text-gray-900 dark:text-white">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                            </div>
                          )}
                          {profile.turno_trabalho && (
                            <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                              <span className="text-gray-600 dark:text-gray-400">Turno</span>
                              <span className="text-gray-900 dark:text-white">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                            </div>
                          )}
                          {profile.referencia_profissional && (
                            <div className="py-3">
                              <span className="text-gray-600 dark:text-gray-400 block mb-2">Referência Profissional</span>
                              <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{profile.referencia_profissional}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services">
              {isProfessional ? (
                <div>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Serviços Oferecidos</h2>
                  {profile.professional_services && profile.professional_services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.professional_services.map((service, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-900 dark:text-white">{service}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={<Briefcase className="h-12 w-12 text-gray-400" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-light text-gray-900 dark:text-white mb-2">Cliente</h3>
                  <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não oferece serviços.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <div>
                <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Avaliações</h2>
                {reviewsLoading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} currentUserId={user?.id} profileOwnerId={userId} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Star className="h-12 w-12 text-gray-400" />} title="Nenhuma avaliação encontrada" description="Este usuário ainda não recebeu avaliações." />
                )}
              </div>
            </TabsContent>

            <TabsContent value="portfolio">
              {isProfessional ? (
                <div>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Portfólio</h2>
                  {portfolioLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 animate-pulse">
                          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : portfolioProjects && portfolioProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {portfolioProjects.map((project) => (
                        <div key={project.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
                          <h4 className="font-normal text-gray-900 dark:text-white mb-2">{project.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                            <span>{format(new Date(project.created_at), 'dd/MM/yyyy')}</span>
                            <span>{project.views_count} visualizações</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={<Building2 className="h-12 w-12 text-gray-400" />} title="Nenhum projeto no portfólio" description="Este profissional ainda não adicionou projetos ao portfólio." />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-light text-gray-900 dark:text-white mb-2">Cliente</h3>
                  <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não possui portfólio.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}

