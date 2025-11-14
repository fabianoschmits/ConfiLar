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
  Globe, Share2, ThumbsUp, Mail as MailIcon, Phone as PhoneIcon
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

export default function PerfilTeste9Page() {
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
        {/* Header Empresarial Style */}
        <div className="bg-white dark:bg-gray-900 shadow-md border-b-4 border-gray-900 dark:border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Foto Grande à Esquerda */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gray-900 dark:bg-gray-100 rounded-full"></div>
                  <UserAvatar
                    src={profile.avatar_url || profile.profile_photo_url}
                    alt={profile.full_name || 'Usuário'}
                    fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                    size="xl"
                    userId={profile.id}
                    showReferralBadge={true}
                    className="relative ring-4 ring-gray-900 dark:ring-gray-100 shadow-xl"
                  />
                  {profile.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2 ring-4 ring-white dark:ring-gray-900">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Dados ao Lado */}
              <div className="flex-1 min-w-0">
                <div className="border-l-4 border-gray-900 dark:border-gray-100 pl-6">
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">
                    {profile.full_name || 'Usuário'}
                  </h1>
                  {profile.bio && (
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed font-medium">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {profile.is_verified && (
                      <Badge className="bg-green-600 text-white border-2 border-green-800 px-3 py-1.5">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                    <Badge className={`border-2 px-3 py-1.5 ${isProfessional ? 'bg-blue-600 text-white border-blue-800' : 'bg-gray-600 text-white border-gray-800'}`}>
                      {isProfessional ? 'Profissional' : 'Cliente'}
                    </Badge>
                    {isProfessional && (
                      <Badge className={`border-2 px-3 py-1.5 ${profile.is_available ? 'bg-green-600 text-white border-green-800' : 'bg-red-600 text-white border-red-800'}`}>
                        {profile.is_available ? 'Disponível' : 'Ocupado'}
                      </Badge>
                    )}
                  </div>

                  {/* Estatísticas Empresariais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 p-4 rounded-lg text-center border-2 border-gray-700 dark:border-gray-300">
                      <div className="text-3xl font-black mb-1">{profile.rating.toFixed(1)}</div>
                      <div className="text-xs uppercase tracking-wide">Avaliação</div>
                    </div>
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 p-4 rounded-lg text-center border-2 border-gray-700 dark:border-gray-300">
                      <div className="text-3xl font-black mb-1">{profile.total_reviews}</div>
                      <div className="text-xs uppercase tracking-wide">Avaliações</div>
                    </div>
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 p-4 rounded-lg text-center border-2 border-gray-700 dark:border-gray-300">
                      <div className="text-3xl font-black mb-1">0</div>
                      <div className="text-xs uppercase tracking-wide">Visualizações</div>
                    </div>
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 p-4 rounded-lg text-center border-2 border-gray-700 dark:border-gray-300">
                      <div className="text-3xl font-black mb-1 capitalize">{profile.badge}</div>
                      <div className="text-xs uppercase tracking-wide">Badge</div>
                    </div>
                  </div>

                  {/* Informações em Lista Vertical */}
                  <div className="space-y-3 mb-6">
                    {profile.location_city && profile.location_state && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">{profile.location_city}, {profile.location_state}</span>
                      </div>
                    )}
                    {profile.idade && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">{profile.idade} anos</span>
                      </div>
                    )}
                    {profile.escolaridade && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <GraduationCap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">{formatEscolaridade(profile.escolaridade)}</span>
                      </div>
                    )}
                    {profile.estado_civil && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">{formatEstadoCivil(profile.estado_civil)}</span>
                      </div>
                    )}
                    {profile.filhos !== null && profile.filhos !== undefined && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                      </div>
                    )}
                    {isProfessional && profile.professional_experience_years && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'} de experiência</span>
                      </div>
                    )}
                    {isProfessional && profile.turno_trabalho && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">Turno: {formatTurnoTrabalho(profile.turno_trabalho)}</span>
                      </div>
                    )}
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3">
                    {!isOwnProfile && (
                      <Button onClick={handleContact} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-gray-700 dark:border-gray-300 px-6 py-6 text-lg font-bold">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Contatar
                      </Button>
                    )}
                    <Button variant="outline" className="border-2 border-gray-900 dark:border-gray-100 px-6 py-6 text-lg font-bold">
                      <Share2 className="w-5 h-5 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-none p-0`}>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900 border-r-2 border-gray-900 dark:border-gray-100 rounded-none">Recomend.</TabsTrigger>
              {isProfessional && <TabsTrigger value="services" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900 border-r-2 border-gray-900 dark:border-gray-100 rounded-none">Serviços</TabsTrigger>}
              <TabsTrigger value="reviews" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900 border-r-2 border-gray-900 dark:border-gray-100 rounded-none">Avaliações</TabsTrigger>
              {isProfessional && <TabsTrigger value="portfolio" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900 border-r-2 border-gray-900 dark:border-gray-100 rounded-none">Portfólio</TabsTrigger>}
              <TabsTrigger value="about" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900 rounded-none">Sobre</TabsTrigger>
            </TabsList>

            {/* Aba de Recomendações */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className="border-2 border-gray-900 dark:border-gray-100 shadow-lg">
                <CardHeader className="bg-gray-900 dark:bg-gray-100 border-b-2 border-gray-900 dark:border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-white dark:text-gray-900">
                    <ThumbsUp className="w-5 h-5" />
                    Recomendações
                    {recommendations.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
                        {recommendations.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {recommendationsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 animate-pulse">
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
                          <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-100">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-gray-900 dark:border-gray-100 shadow-lg">
                  <CardHeader className="bg-gray-900 dark:bg-gray-100 border-b-2 border-gray-900 dark:border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-white dark:text-gray-900">
                      <User className="w-5 h-5" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {profile.gender && (
                      <div className="flex justify-between py-3 border-b-2 border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-bold">Gênero</span>
                        <span className="font-black">{formatGender(profile.gender)}</span>
                      </div>
                    )}
                    {profile.idade && (
                      <div className="flex justify-between py-3 border-b-2 border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-bold">Idade</span>
                        <span className="font-black">{profile.idade} anos</span>
                      </div>
                    )}
                    {profile.escolaridade && (
                      <div className="flex justify-between py-3 border-b-2 border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-bold">Escolaridade</span>
                        <span className="font-black text-right uppercase">{formatEscolaridade(profile.escolaridade)}</span>
                      </div>
                    )}
                    {profile.estado_civil && (
                      <div className="flex justify-between py-3 border-b-2 border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-bold">Estado Civil</span>
                        <span className="font-black">{formatEstadoCivil(profile.estado_civil)}</span>
                      </div>
                    )}
                    {profile.filhos !== null && profile.filhos !== undefined && (
                      <div className="flex justify-between py-3">
                        <span className="text-gray-600 dark:text-gray-400 font-bold">Filhos</span>
                        <span className="font-black">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isProfessional && (
                  <Card className="border-2 border-gray-900 dark:border-gray-100 shadow-lg">
                    <CardHeader className="bg-gray-900 dark:bg-gray-100 border-b-2 border-gray-900 dark:border-gray-100">
                      <CardTitle className="flex items-center gap-2 text-white dark:text-gray-900">
                        <Briefcase className="w-5 h-5" />
                        Informações Profissionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {profile.professional_experience_years && (
                        <div className="flex justify-between py-3 border-b-2 border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400 font-bold">Experiência</span>
                          <span className="font-black">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                        </div>
                      )}
                      {profile.turno_trabalho && (
                        <div className="flex justify-between py-3 border-b-2 border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400 font-bold">Turno</span>
                          <span className="font-black">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                        </div>
                      )}
                      {profile.referencia_profissional && (
                        <div className="py-3">
                          <span className="text-gray-600 dark:text-gray-400 font-bold block mb-2">Referência Profissional</span>
                          <p className="text-sm text-gray-900 dark:text-white leading-relaxed font-medium">{profile.referencia_profissional}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="services">
              {isProfessional ? (
                <Card className="border-2 border-gray-900 dark:border-gray-100 shadow-lg">
                  <CardHeader className="bg-gray-900 dark:bg-gray-100 border-b-2 border-gray-900 dark:border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-white dark:text-gray-900">
                      <Briefcase className="w-5 h-5" />
                      Serviços Oferecidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {profile.professional_services && profile.professional_services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.professional_services.map((service, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-gray-900 dark:bg-gray-100 rounded-lg border-2 border-gray-700 dark:border-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-white dark:text-gray-900 font-bold">{service}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={<Briefcase className="h-12 w-12 text-gray-400" />} title="Nenhum serviço informado" description="Este profissional ainda não cadastrou serviços." />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-gray-900 dark:border-gray-100 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cliente</h3>
                    <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não oferece serviços.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="border-2 border-gray-900 dark:border-gray-100 shadow-lg">
                <CardHeader className="bg-gray-900 dark:bg-gray-100 border-b-2 border-gray-900 dark:border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-white dark:text-gray-900">
                    <Star className="w-5 h-5" />
                    Avaliações
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
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
                <Card className="border-2 border-gray-900 dark:border-gray-100 shadow-lg">
                  <CardHeader className="bg-gray-900 dark:bg-gray-100 border-b-2 border-gray-900 dark:border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-white dark:text-gray-900">
                      <Building2 className="w-5 h-5" />
                      Portfólio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {portfolioLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : portfolioProjects && portfolioProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolioProjects.map((project) => (
                          <div key={project.id} className="bg-gray-900 dark:bg-gray-100 rounded-lg p-4 border-2 border-gray-700 dark:border-gray-300 hover:border-gray-900 dark:hover:border-gray-100 transition-colors">
                            <h4 className="font-bold text-white dark:text-gray-900 mb-2">{project.title}</h4>
                            <p className="text-sm text-gray-300 dark:text-gray-700 mb-3">{project.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
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
                <Card className="border-2 border-gray-900 dark:border-gray-100 shadow-lg">
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

