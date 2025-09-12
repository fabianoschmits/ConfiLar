'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Star, Award, Phone, Mail, User, Briefcase, MessageCircle, Copy, Clock, MapPinIcon, Building2, CheckCircle, ThumbsUp, MessageSquare, Eye, Image as ImageIcon, Calendar as CalendarIcon, DollarSign, Heart } from 'lucide-react'
import { RecommendationButton } from '@/components/ui/RecommendationButton'
import { RecommendationSection } from '@/components/ui/RecommendationSection'
import { MainLayout } from '@/components/layout/MainLayout'
import { usePortfolio } from '@/hooks/usePortfolio'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { useSupabaseReviews, ReviewWithProfiles, ReviewStats as ReviewStatsType } from '@/hooks/useSupabaseReviews'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewStats } from '@/components/reviews/ReviewStats'
import { ReviewForm } from '@/components/reviews/ReviewForm'

interface PublicProfile {
    id: string
    full_name: string
    user_type: 'client' | 'professional'
    avatar_url: string | null
    bio: string | null
    location_state: string | null
    location_city: string | null
    neighborhood: string | null
    professional_services: string[] | null
    professional_experience_years: number | null
    professional_certifications: string[] | null
    professional_portfolio_url: string | null
    badge: string
    rating: number
    total_recommendations: number
    is_verified: boolean
    is_available: boolean
    created_at: string
    phone?: string | null
    email?: string | null
}




export default function PublicProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthContext()
    const { openChat } = useFloatingChat()
    const userId = params.id as string
    const [profile, setProfile] = useState<PublicProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reviewStats, setReviewStats] = useState<ReviewStatsType | null>(null)
    const [calendarDate, setCalendarDate] = useState<Date>(new Date())
    const [showContactInfo, setShowContactInfo] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [canReview, setCanReview] = useState(false)

    // Hook do portfólio
    const { projects: portfolioProjects, loading: portfolioLoading, incrementViews } = usePortfolio(userId)
    
    // Hook das avaliações
    const { reviews: hookReviews, loading: reviewsLoading, fetchUserReviews, fetchUserReviewStats, canUserReview } = useSupabaseReviews()

    useEffect(() => {
        fetchProfile()
    }, [userId])

    // Função para atualizar estatísticas quando necessário
    const refreshStats = async () => {
        if (!userId) return
        
        try {
            // Buscar estatísticas das avaliações
            const statsData = await fetchUserReviewStats(userId)
            if (statsData) {
                setReviewStats(statsData)
            }

            // Buscar contagem de recomendações em tempo real
            const { data: recommendationsData, error: recommendationsError } = await supabase
                .from('user_recommendations')
                .select('id')
                .eq('recommended_id', userId)

            if (!recommendationsError && recommendationsData && profile) {
                // Atualizar o perfil com a contagem real de recomendações
                setProfile(prev => prev ? {
                    ...prev,
                    total_recommendations: recommendationsData.length
                } : null)
            }
        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error)
        }
    }

    const fetchProfile = async () => {
        try {
            setLoading(true)
            
            // Buscar perfil principal
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (profileError) throw profileError
            
            setProfile(profileData)

            // Buscar avaliações usando o novo sistema
            await fetchUserReviews(userId, 'received')

            // Buscar estatísticas das avaliações
            const statsData = await fetchUserReviewStats(userId)
            if (statsData) {
                setReviewStats(statsData)
            }

            // Buscar contagem de recomendações em tempo real
            const { data: recommendationsData, error: recommendationsError } = await supabase
                .from('user_recommendations')
                .select('id')
                .eq('recommended_id', userId)

            if (!recommendationsError && recommendationsData) {
                // Atualizar o perfil com a contagem real de recomendações
                setProfile(prev => prev ? {
                    ...prev,
                    total_recommendations: recommendationsData.length
                } : null)
            }

            // Verificar se o usuário atual pode avaliar este perfil
            if (user && user.id !== userId) {
                const canUserReviewThis = await canUserReview(user.id, userId)
                setCanReview(canUserReviewThis)
            }

            // Verificar se há acordos fechados entre o usuário atual e o perfil
            if (user) {
                const { data: agreementsData, error: agreementsError } = await supabase
                    .from('contact_agreements')
                    .select('*')
                    .or(`client_id.eq.${user.id},professional_id.eq.${user.id}`)
                    .or(`client_id.eq.${userId},professional_id.eq.${userId}`)
                    .in('status', ['accepted', 'completed'])

                if (!agreementsError && agreementsData && agreementsData.length > 0) {
                    setShowContactInfo(true)
                }
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erro ao carregar perfil')
        } finally {
            setLoading(false)
        }
    }

    const copyProfileLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            alert('Link do perfil copiado para a área de transferência!')
        } catch (err) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea')
            textArea.value = window.location.href
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            alert('Link do perfil copiado para a área de transferência!')
        }
    }

    const getBadgeColor = (badge: string) => {
        switch (badge) {
            case 'bronze': return 'bg-amber-50 text-amber-700 border-amber-200'
            case 'silver': return 'bg-gray-50 text-gray-700 border-gray-200'
            case 'gold': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'platinum': return 'bg-blue-50 text-blue-700 border-blue-200'
            default: return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const getBadgeName = (badge: string) => {
        switch (badge) {
            case 'bronze': return 'Bronze'
            case 'silver': return 'Prata'
            case 'gold': return 'Ouro'
            case 'platinum': return 'Platina'
            default: return 'Bronze'
        }
    }

    const handleChatRedirect = () => {
        if (!user) {
            router.push('/auth')
            return
        }
        
        // Abrir chat flutuante diretamente
        openChat(userId, profile?.full_name || 'Usuário')
    }

    const handleViewPortfolioProject = async (projectId: string) => {
        await incrementViews(projectId)
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ))
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Perfil não encontrado
                    </h1>
                    <p className="text-gray-600">
                        {error || 'O usuário solicitado não existe ou foi removido.'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-6 md:py-8">
                <div className="max-w-6xl mx-auto">
                {/* Header do Perfil */}
                <Card className="mb-6 md:mb-8 border-0 shadow-sm">
                    <CardHeader className="text-center pb-4 md:pb-6 px-4 md:px-6">
                        <div className="flex justify-center mb-4 md:mb-6">
                            <UserAvatar
                                src={profile.avatar_url}
                                alt={profile.full_name}
                                fallback={profile.full_name?.charAt(0) || 'U'}
                                size="lg"
                                className="w-24 h-24 md:w-32 md:h-32 border-4 border-gray-100"
                            />
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 mb-4">
                            <CardTitle className="text-2xl md:text-4xl font-bold text-gray-900 text-center">{profile.full_name}</CardTitle>
                            {profile.is_verified && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Verificado
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="capitalize font-medium">
                                    {profile.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                                </span>
                            </div>
                            
                            {profile.location_city && profile.location_state && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="font-medium">{profile.location_city}, {profile.location_state}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span className="font-medium">Membro desde {formatDate(profile.created_at)}</span>
                            </div>
                        </div>

                        {/* Estatísticas Principais */}
                        <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto mb-4 md:mb-6">
                            <div className="text-center">
                                <div className="text-xl md:text-2xl font-bold text-gray-900">
                                    {reviewStats?.averageRating ? (reviewStats.averageRating || 0).toFixed(1) : '0.0'}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600">Avaliação Média</div>
                                <div className="flex justify-center mt-1">
                                    {renderStars(reviewStats?.averageRating || 0)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl md:text-2xl font-bold text-gray-900">{reviewStats?.totalReviews || 0}</div>
                                <div className="text-xs md:text-sm text-gray-600">Avaliações</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl md:text-2xl font-bold text-gray-900">{profile?.total_recommendations || 0}</div>
                                <div className="text-xs md:text-sm text-gray-600">Recomendações</div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-lg mx-auto">
                            <Button
                                onClick={handleChatRedirect}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                            >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                <span className="text-xs">Conversar</span>
                            </Button>
                            
                            {/* Botão de Favorito */}
                            {user && user.id !== userId && (
                                <FavoriteButton
                                    userId={userId}
                                    userName={profile?.full_name || 'Usuário'}
                                    size="sm"
                                    variant="outline"
                                    showText={true}
                                    className="text-xs"
                                />
                            )}
                            
                            {/* Botão de Recomendação */}
                            {user && user.id !== userId && (
                                <RecommendationButton
                                    userId={userId}
                                    size="sm"
                                    variant="outline"
                                    showCount={true}
                                    className="text-xs"
                                />
                            )}
                            
                            <Button
                                variant="outline"
                                onClick={copyProfileLink}
                                size="sm"
                                className="text-xs"
                            >
                                <Copy className="w-3 h-3 mr-1" />
                                Copiar Link
                            </Button>
                        </div>

                    </CardHeader>
                </Card>

                {/* Sistema de Abas */}
                <Tabs defaultValue="informacoes" className="w-full">
                    <TabsList className={`grid w-full mb-6 ${profile.user_type === 'professional' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                        <TabsTrigger value="informacoes" className="flex items-center gap-2 text-sm md:text-base">
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Informações</span>
                            <span className="sm:hidden">Info</span>
                        </TabsTrigger>
                        {profile.user_type === 'professional' && (
                            <TabsTrigger value="portfolio" className="flex items-center gap-2 text-sm md:text-base">
                                <Briefcase className="w-4 h-4" />
                                <span className="hidden sm:inline">Portfólio</span>
                                <span className="sm:hidden">Projetos</span>
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="avaliacoes" className="flex items-center gap-2 text-sm md:text-base">
                            <Star className="w-4 h-4" />
                            <span className="hidden sm:inline">Avaliações</span>
                            <span className="sm:hidden">Aval.</span>
                        </TabsTrigger>
                        <TabsTrigger value="recomendacoes" className="flex items-center gap-2 text-sm md:text-base">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="hidden sm:inline">Recomendações</span>
                            <span className="sm:hidden">Rec.</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Aba de Informações */}
                    <TabsContent value="informacoes" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Coluna Esquerda - Informações Principais */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Informações do Profissional */}
                                {profile.user_type === 'professional' && (
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-xl">
                                                <Briefcase className="w-5 h-5" />
                                                Informações Profissionais
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Badge e Status */}
                                            <div className="flex items-center justify-between">
                                                <Badge className={`${getBadgeColor(profile.badge)} text-sm px-4 py-2`}>
                                                    <Award className="w-4 h-4 mr-2" />
                                                    {getBadgeName(profile.badge)}
                                                </Badge>
                                                
                                                <Badge 
                                                    variant={profile.is_available ? "default" : "secondary"}
                                                    className={profile.is_available ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
                                                >
                                                    {profile.is_available ? 'Disponível' : 'Indisponível'}
                                                </Badge>
                                            </div>

                                            {/* Experiência */}
                                            {profile.professional_experience_years && (
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-5 h-5 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium text-gray-900">Experiência:</span>
                                                        <span className="ml-2 text-gray-600">
                                                            {profile.professional_experience_years} ano(s)
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Serviços */}
                                            {profile.professional_services && profile.professional_services.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-3">Serviços Oferecidos</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.professional_services.map((service, index) => (
                                                            <Badge key={index} variant="outline" className="px-3 py-1">
                                                                {service}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Certificações */}
                                            {profile.professional_certifications && profile.professional_certifications.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-3">Certificações</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.professional_certifications.map((cert, index) => (
                                                            <Badge key={index} variant="secondary" className="px-3 py-1">
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                {cert}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Portfolio */}
                                            {profile.professional_portfolio_url && (
                                                <div className="flex items-center gap-3">
                                                    <Building2 className="w-5 h-5 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium text-gray-900">Portfolio:</span>
                                                        <a 
                                                            href={profile.professional_portfolio_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-blue-600 hover:underline"
                                                        >
                                                            Ver portfolio
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Bio */}
                                {profile.bio && (
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-xl">Sobre</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Localização */}
                                {(profile.location_state || profile.location_city || profile.neighborhood) && (
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-xl">
                                                <MapPinIcon className="w-5 h-5" />
                                                Localização
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {profile.location_state && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-900">Estado:</span>
                                                        <span className="text-gray-600">{profile.location_state}</span>
                                                    </div>
                                                )}
                                                {profile.location_city && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-900">Cidade:</span>
                                                        <span className="text-gray-600">{profile.location_city}</span>
                                                    </div>
                                                )}
                                                {profile.neighborhood && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-900">Bairro:</span>
                                                        <span className="text-gray-600">{profile.neighborhood}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Dados de Contato (Só aparece após acordo fechado) */}
                                {showContactInfo && (profile.phone || profile.email) && (
                                    <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-xl">
                                                <MessageCircle className="w-5 h-5 text-blue-500" />
                                                Dados de Contato
                                            </CardTitle>
                                            <CardDescription>
                                                Informações disponíveis após acordo fechado
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {profile.phone && (
                                                    <div className="flex items-center gap-3">
                                                        <Phone className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <span className="font-medium text-gray-900">Telefone:</span>
                                                            <span className="ml-2 text-gray-600">{profile.phone}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {profile.email && (
                                                    <div className="flex items-center gap-3">
                                                        <Mail className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <span className="font-medium text-gray-900">E-mail:</span>
                                                            <span className="ml-2 text-gray-600">{profile.email}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Coluna Direita - Calendário */}
                            <div className="space-y-6">
                                {/* Calendário de Disponibilidade */}
                                {profile.user_type === 'professional' && (
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-xl">
                                                <CalendarIcon className="w-5 h-5" />
                                                Disponibilidade
                                            </CardTitle>
                                            <CardDescription>
                                                Visualize os horários disponíveis
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !calendarDate && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {calendarDate ? format(calendarDate, "MMMM yyyy", { locale: ptBR }) : "Selecione uma data"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={calendarDate}
                                                            onSelect={setCalendarDate}
                                                            locale={ptBR}
                                                            className="rounded-md border"
                                                            required
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                
                                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600">
                                                        {profile.is_available ? 'Profissional disponível para novos trabalhos' : 'Profissional indisponível no momento'}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Aba de Portfólio */}
                    {profile.user_type === 'professional' && (
                        <TabsContent value="portfolio" className="space-y-6">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Briefcase className="w-5 h-5" />
                                        Portfólio de Trabalhos
                                    </CardTitle>
                                    <CardDescription>
                                        Projetos realizados pelo profissional
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {portfolioLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                            <p className="text-gray-600">Carregando portfólio...</p>
                                        </div>
                                    ) : portfolioProjects.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {portfolioProjects.map((project) => (
                                                <div 
                                                    key={project.id} 
                                                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => handleViewPortfolioProject(project.id)}
                                                >
                                                    {/* Imagem do Projeto */}
                                                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                                                        {project.images && project.images.length > 0 ? (
                                                            <img
                                                                src={project.images[0]}
                                                                alt={project.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="h-12 w-12 text-gray-400" />
                                                        )}
                                                    </div>
                                                    
                                                    {/* Conteúdo */}
                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <h4 className="font-semibold text-gray-900 text-base line-clamp-2">
                                                                {project.title}
                                                            </h4>
                                                            {project.is_featured && (
                                                                <Badge className="bg-yellow-500 text-white text-xs ml-2">
                                                                    Destaque
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        
                                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                                            {project.description || 'Sem descrição'}
                                                        </p>
                                                        
                                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                                            <div className="flex items-center gap-4">
                                                                {project.location && (
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="h-4 w-4" />
                                                                        <span className="truncate max-w-24">{project.location}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1">
                                                                    <CalendarIcon className="h-4 w-4" />
                                                                    <span>{new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-4 w-4" />
                                                                <span>{project.views_count}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {project.budget_range && (
                                                            <div className="flex items-center gap-1 text-sm text-green-600">
                                                                <DollarSign className="h-4 w-4" />
                                                                <span>{project.budget_range}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                            <p className="text-xl font-medium mb-2">Nenhum projeto ainda</p>
                                            <p className="text-sm">Este profissional ainda não adicionou projetos ao seu portfólio.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Aba de Avaliações */}
                    <TabsContent value="avaliacoes" className="space-y-6">
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="px-4 md:px-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                            <Star className="w-5 h-5" />
                                            Avaliações Recebidas
                                        </CardTitle>
                                        <CardDescription>
                                            {hookReviews.length > 0 
                                                ? `${hookReviews.length} avaliações de outros usuários`
                                                : 'Ainda não há avaliações'
                                            }
                                        </CardDescription>
                                    </div>
                                    {canReview && user && (
                                        <Button
                                            onClick={() => setShowReviewForm(true)}
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Star className="h-4 w-4 mr-2" />
                                            Avaliar
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 md:px-6">
                                {hookReviews.length > 0 ? (
                                    <>
                                        {/* Estatísticas das avaliações */}
                                        {reviewStats && (
                                            <div className="mb-6">
                                                <ReviewStats stats={reviewStats} />
                                            </div>
                                        )}
                                        
                                        {/* Lista de avaliações */}
                                        <div className="space-y-4">
                                            {hookReviews.map((review) => (
                                                <ReviewCard 
                                                    key={review.id} 
                                                    review={review} 
                                                    showActions={false}
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                                            Nenhuma avaliação ainda
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Este usuário ainda não recebeu avaliações.
                                        </p>
                                        {canReview && user && (
                                            <Button
                                                onClick={() => setShowReviewForm(true)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Star className="h-4 w-4 mr-2" />
                                                Seja o primeiro a avaliar
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Aba de Recomendações */}
                    <TabsContent value="recomendacoes" className="space-y-6">
                        <RecommendationSection 
                            userId={userId} 
                            className="border-0 shadow-sm"
                        />
                    </TabsContent>
                </Tabs>


                {/* Modal de Criação de Avaliação */}
                {showReviewForm && user && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <ReviewForm
                                reviewerId={user.id}
                                reviewedId={userId}
                                reviewedName={profile?.full_name || 'Usuário'}
                                reviewedAvatar={profile?.avatar_url}
                                onSuccess={() => {
                                    setShowReviewForm(false)
                                    fetchProfile() // Recarregar dados do perfil
                                }}
                                onCancel={() => setShowReviewForm(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </MainLayout>
  )
}
