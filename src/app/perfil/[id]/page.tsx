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
  Globe, Share2, Palette, Layers, Sparkles, ThumbsUp
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useProfileViews } from '@/hooks/useProfileViews'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProfilePageSkeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function ProfilePage() {
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
  const { recordView, getViewStats } = useProfileViews()
  const [viewStats, setViewStats] = useState<{ total_views: number } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (userId) {
      fetchUserReviews(userId)
    }
  }, [userId, fetchUserReviews])

  // Registrar visualização automaticamente quando o perfil é visualizado
  useEffect(() => {
    if (!userId || !mounted) return
    
    // Não registrar visualização do próprio perfil
    if (user?.id === userId) return
    
    // Registrar visualização mesmo se o usuário não estiver autenticado
    const timer = setTimeout(async () => {
      try {
        await recordView(userId)
      } catch (error) {
        console.error('Erro ao registrar visualização:', error)
      }
    }, 2000) // 2 segundos de delay

    return () => {
      clearTimeout(timer)
    }
  }, [userId, mounted, user?.id, recordView])

  // Buscar estatísticas de visualizações
  useEffect(() => {
    if (!userId || !mounted) return

    const fetchViewStats = async () => {
      try {
        const stats = await getViewStats(userId)
        if (stats) {
          setViewStats(stats)
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas de visualizações:', error)
      }
    }

    fetchViewStats()
  }, [userId, mounted, getViewStats])

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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-950 dark:via-teal-950 dark:to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Criativo Portfolio Style */}
          <div className="mb-12">
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
              <CardContent className="p-12">
                <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                  {/* Foto Grande com Efeito Artístico */}
                  <div className="flex-shrink-0 relative">
                    <div className="absolute -inset-6 bg-gradient-to-r from-[#00b0b0] via-cyan-400 to-blue-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative">
                      <UserAvatar
                        src={profile.avatar_url || profile.profile_photo_url}
                        alt={profile.full_name || 'Usuário'}
                        fallback={profile.full_name?.charAt(0).toUpperCase() || 'U'}
                        size="xl"
                        userId={profile.id}
                        showReferralBadge={true}
                        className="ring-4 ring-teal-200 dark:ring-teal-800 shadow-2xl transform hover:scale-105 transition-transform"
                      />
                      {profile.is_verified && (
                        <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full p-2 shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações Criativas */}
                  <div className="flex-1 min-w-0 text-center lg:text-left">
                    <div className="mb-6">
                      <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00b0b0] via-cyan-600 to-blue-600 mb-4">
                        {profile.full_name || 'Usuário'}
                      </h1>
                      {profile.bio && (
                        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                          {profile.bio}
                        </p>
                      )}
                      <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                        {profile.is_verified && (
                          <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-1.5 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verificado
                          </Badge>
                        )}
                        <Badge className={`px-4 py-1.5 text-sm ${isProfessional ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'}`}>
                          {isProfessional ? 'Profissional' : 'Cliente'}
                        </Badge>
                        {isProfessional && (
                          <Badge className={`px-4 py-1.5 text-sm ${profile.is_available ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-red-400 to-red-600 text-white'}`}>
                            {profile.is_available ? 'Disponível' : 'Ocupado'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Grid de Métricas Criativo */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl p-4 text-center transform hover:scale-105 transition-transform">
                        <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <div className="text-3xl font-black text-gray-900 dark:text-white">{profile.rating.toFixed(1)}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Avaliação</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-4 text-center transform hover:scale-105 transition-transform">
                        <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-3xl font-black text-gray-900 dark:text-white">{profile.total_reviews}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Avaliações</div>
                      </div>
                      <div className="bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-2xl p-4 text-center transform hover:scale-105 transition-transform">
                        <Eye className="w-8 h-8 text-[#00b0b0] mx-auto mb-2" />
                        <div className="text-3xl font-black text-gray-900 dark:text-white">
                          {viewStats?.total_views?.toLocaleString('pt-BR') || '0'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Visualizações</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl p-4 text-center transform hover:scale-105 transition-transform">
                        <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-3xl font-black text-gray-900 dark:text-white capitalize">{profile.badge}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Badge</div>
                      </div>
                    </div>

                    {/* Informações Rápidas em Grid Criativo */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                      {profile.location_city && profile.location_state && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                          <MapPin className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium">{profile.location_city}, {profile.location_state}</span>
                        </div>
                      )}
                      {profile.idade && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-medium">{profile.idade} anos</span>
                        </div>
                      )}
                      {profile.escolaridade && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                          <GraduationCap className="w-5 h-5 text-[#00b0b0]" />
                          <span className="text-sm font-medium truncate">{formatEscolaridade(profile.escolaridade)}</span>
                        </div>
                      )}
                      {profile.estado_civil && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                          <Heart className="w-5 h-5 text-cyan-500" />
                          <span className="text-sm font-medium">{formatEstadoCivil(profile.estado_civil)}</span>
                        </div>
                      )}
                      {profile.filhos !== null && profile.filhos !== undefined && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                          <Users className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                        </div>
                      )}
                      {isProfessional && profile.professional_experience_years && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                          <Briefcase className="w-5 h-5 text-indigo-500" />
                          <span className="text-sm font-medium">{profile.professional_experience_years} {profile.professional_experience_years === 1 ? 'ano' : 'anos'}</span>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      {!isOwnProfile && (
                        <Button onClick={handleContact} className="bg-gradient-to-r from-[#00b0b0] to-cyan-600 hover:from-[#00a0a0] hover:to-cyan-700 text-white px-8 py-6 text-lg font-bold shadow-lg transform hover:scale-105 transition-transform">
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Contatar
                        </Button>
                      )}
                      <Button variant="outline" className="px-8 py-6 text-lg font-bold border-2">
                        <Share2 className="w-5 h-5 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Portfolio Style */}
          <Tabs defaultValue="recommendations" className="space-y-8">
            <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-5' : 'grid-cols-4'} bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-2 border-gray-200 dark:border-gray-800 rounded-xl p-2`}>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b0b0] data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg">Recomend.</TabsTrigger>
              {isProfessional && <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b0b0] data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg">Serviços</TabsTrigger>}
              <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b0b0] data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg">Avaliações</TabsTrigger>
              {isProfessional && <TabsTrigger value="portfolio" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b0b0] data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg">Portfólio</TabsTrigger>}
              <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b0b0] data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg">Sobre</TabsTrigger>
            </TabsList>

            {/* Aba de Recomendações */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-[#00b0b0] text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5" />
                    Recomendações
                    {recommendations.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
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
                          <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 transform hover:scale-105">
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
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-[#00b0b0] text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
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
                        <span className="font-semibold text-right">{formatEscolaridade(profile.escolaridade)}</span>
                      </div>
                    )}
                    {profile.estado_civil && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Estado Civil</span>
                        <span className="font-semibold">{formatEstadoCivil(profile.estado_civil)}</span>
                      </div>
                    )}
                    {profile.filhos !== null && profile.filhos !== undefined && (
                      <div className="flex justify-between py-3">
                        <span className="text-gray-600 dark:text-gray-400">Filhos</span>
                        <span className="font-semibold">{profile.filhos} {profile.filhos === 1 ? 'filho' : 'filhos'}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isProfessional && (
                  <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
                    <CardHeader className="bg-gradient-to-r from-[#00b0b0] to-cyan-500 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
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
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Serviços Oferecidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {profile.professional_services && profile.professional_services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.professional_services.map((service, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
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
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cliente</h3>
                    <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não oferece serviços.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
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
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-[#00b0b0] text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
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
                          <div key={project.id} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform">
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
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
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
