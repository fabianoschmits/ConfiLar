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
  Globe, Share2, TrendingUp, Zap, Target, Sparkles, ThumbsUp
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews'
import { usePortfolio } from '@/hooks/usePortfolio'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProfilePageSkeleton } from '@/components/ui/skeleton'

export default function PerfilTeste2Page() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  const userId = params.id as string
  const [mounted, setMounted] = useState(false)
  
  const { profile, loading, error } = useProfileData(userId)
  const { reviews, loading: reviewsLoading, fetchUserReviews } = useSupabaseReviews()
  const { projects: portfolioProjects, loading: portfolioLoading } = usePortfolio(userId || '')
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (userId) {
      fetchUserReviews(userId)
      loadRecommendations()
    }
  }, [userId, fetchUserReviews])

  const loadRecommendations = async () => {
    if (!userId) return
    try {
      setRecommendationsLoading(true)
      const { data, error } = await supabase
        .from('user_recommendations')
        .select(`
          id,
          recommender_id,
          recommended_id,
          recommendation_type,
          created_at,
          recommender:profiles!user_recommendations_recommender_id_fkey (
            id,
            full_name,
            avatar_url,
            user_type,
            location_city,
            location_state,
            rating,
            is_verified
          )
        `)
        .eq('recommended_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedData = data.map((item: any) => ({
        id: item.id,
        recommender_id: item.recommender_id,
        recommended_id: item.recommended_id,
        recommendation_type: item.recommendation_type,
        created_at: item.created_at,
        recommender: Array.isArray(item.recommender) ? item.recommender[0] : item.recommender
      }))

      setRecommendations(transformedData)
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error)
    } finally {
      setRecommendationsLoading(false)
    }
  }

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header com Foto Grande e Cards Coloridos */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-40"></div>
              <div className="p-8 -mt-20">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Foto Grande */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50"></div>
                      <UserAvatar
                        src={profile.avatar_url || profile.profile_photo_url}
                        alt={profile.full_name || 'Usuário'}
                        fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                        size="xl"
                        userId={profile.id}
                        showReferralBadge={true}
                        className="relative ring-4 ring-white dark:ring-gray-800 shadow-2xl"
                      />
                      {profile.is_verified && (
                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 ring-4 ring-white dark:ring-gray-800">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dados ao Lado */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
                          {profile.full_name || 'Usuário'}
                        </h1>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {profile.is_verified && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          <Badge className={isProfessional ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}>
                            {isProfessional ? 'Profissional' : 'Cliente'}
                          </Badge>
                          {isProfessional && (
                            <Badge className={profile.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                              {profile.is_available ? 'Disponível' : 'Ocupado'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isOwnProfile && (
                          <Button onClick={handleContact} className="bg-blue-600 hover:bg-blue-700">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contatar
                          </Button>
                        )}
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                        {profile.bio}
                      </p>
                    )}

                    {/* Cards de Estatísticas Coloridos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                        <CardContent className="p-4">
                          <Star className="w-6 h-6 text-yellow-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.rating.toFixed(1)}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Avaliação</div>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
                        <CardContent className="p-4">
                          <Users className="w-6 h-6 text-green-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.total_reviews}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Avaliações</div>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-900/20">
                        <CardContent className="p-4">
                          <Eye className="w-6 h-6 text-purple-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Visualizações</div>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/20">
                        <CardContent className="p-4">
                          <Award className="w-6 h-6 text-orange-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{profile.badge}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Badge</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Informações em Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profile.location_city && profile.location_state && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <MapPin className="w-5 h-5 text-blue-500" />
                          <span className="text-sm">{profile.location_city}, {profile.location_state}</span>
                        </div>
                      )}
                      {profile.idade && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Calendar className="w-5 h-5 text-red-500" />
                          <span className="text-sm">{profile.idade} anos</span>
                        </div>
                      )}
                      {profile.escolaridade && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <GraduationCap className="w-5 h-5 text-purple-500" />
                          <span className="text-sm">{formatEscolaridade(profile.escolaridade)}</span>
                        </div>
                      )}
                      {profile.estado_civil && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Heart className="w-5 h-5 text-pink-500" />
                          <span className="text-sm">{formatEstadoCivil(profile.estado_civil)}</span>
                        </div>
                      )}
                      {profile.filhos !== null && profile.filhos !== undefined && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Users className="w-5 h-5 text-green-500" />
                          <span className="text-sm">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                        </div>
                      )}
                      {isProfessional && profile.professional_experience_years && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Briefcase className="w-5 h-5 text-blue-500" />
                          <span className="text-sm">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                        </div>
                      )}
                      {isProfessional && profile.turno_trabalho && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Clock className="w-5 h-5 text-orange-500" />
                          <span className="text-sm">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800`}>
              <TabsTrigger value="recommendations">Recomend.</TabsTrigger>
              {isProfessional && <TabsTrigger value="services">Serviços</TabsTrigger>}
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              {isProfessional && <TabsTrigger value="portfolio">Portfólio</TabsTrigger>}
              <TabsTrigger value="about">Sobre</TabsTrigger>
            </TabsList>

            {/* Aba de Recomendações */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                  <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                    <ThumbsUp className="w-5 h-5" />
                    Recomendações
                    {recommendations.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {recommendations.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
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
                          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-2 border-purple-100 dark:border-purple-900">
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

            <TabsContent value="about">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-blue-200 dark:border-blue-800">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                      <User className="w-5 h-5" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {profile.gender && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Gênero</span>
                        <span className="font-semibold">{formatGender(profile.gender)}</span>
                      </div>
                    )}
                    {profile.idade && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Idade</span>
                        <span className="font-semibold">{profile.idade} anos</span>
                      </div>
                    )}
                    {profile.escolaridade && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Escolaridade</span>
                        <span className="font-semibold text-right max-w-[60%]">{formatEscolaridade(profile.escolaridade)}</span>
                      </div>
                    )}
                    {profile.estado_civil && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Estado Civil</span>
                        <span className="font-semibold">{formatEstadoCivil(profile.estado_civil)}</span>
                      </div>
                    )}
                    {profile.filhos !== null && profile.filhos !== undefined && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Filhos</span>
                        <span className="font-semibold">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                      </div>
                    )}
                    {profile.location_city && profile.location_state && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Localização</span>
                        <span className="font-semibold">{profile.location_city}, {profile.location_state}</span>
                      </div>
                    )}
                    {profile.neighborhood && (
                      <div className="flex justify-between py-3">
                        <span className="text-gray-600 dark:text-gray-400">Bairro</span>
                        <span className="font-semibold">{profile.neighborhood}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isProfessional && (
                  <Card className="border-2 border-purple-200 dark:border-purple-800">
                    <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                      <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                        <Briefcase className="w-5 h-5" />
                        Informações Profissionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {profile.professional_experience_years && (
                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Experiência</span>
                          <span className="font-semibold">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                        </div>
                      )}
                      {profile.turno_trabalho && (
                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Turno</span>
                          <span className="font-semibold">{formatTurnoTrabalho(profile.turno_trabalho)}</span>
                        </div>
                      )}
                      {profile.referencia_profissional && (
                        <div className="py-3">
                          <span className="text-gray-600 dark:text-gray-400 block mb-2">Referência Profissional</span>
                          <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{profile.referencia_profissional}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="services">
              {isProfessional ? (
                <Card className="border-2 border-green-200 dark:border-green-800">
                  <CardHeader className="bg-green-50 dark:bg-green-900/20">
                    <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                      <Briefcase className="w-5 h-5" />
                      Serviços Oferecidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {profile.professional_services && profile.professional_services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.professional_services.map((service, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-900 dark:text-white font-medium">{service}</span>
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
              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
                  <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                    <Star className="w-5 h-5" />
                    Avaliações
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
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
                <Card className="border-2 border-indigo-200 dark:border-indigo-800">
                  <CardHeader className="bg-indigo-50 dark:bg-indigo-900/20">
                    <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                      <Building2 className="w-5 h-5" />
                      Portfólio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
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

