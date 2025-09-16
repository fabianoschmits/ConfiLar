'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useOpenMessages } from '@/hooks/useOpenMessages'
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
import { useProfileViews } from '@/hooks/useProfileViews'

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
    const { openMessages } = useOpenMessages()
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
    
    // Hook das visualizações
    const { getViewStats, useAutoRecordView, loading: viewsLoading } = useProfileViews()
    const [viewStats, setViewStats] = useState<{ total_views: number; views_today: number } | null>(null)

    useEffect(() => {
        fetchProfile()
    }, [userId])

    // Registrar visualização automaticamente
    useAutoRecordView(userId)

    // Buscar estatísticas de visualizações
    useEffect(() => {
        if (userId) {
            getViewStats(userId).then(stats => {
                if (stats) {
                    setViewStats({
                        total_views: stats.total_views,
                        views_today: stats.views_today
                    })
                }
            })
        }
    }, [userId, getViewStats])

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
            // Nota: Sistema de recomendações temporariamente desabilitado
            // const { data: recommendationsData, error: recommendationsError } = await supabase
            //     .from('user_recommendations')
            //     .select('id')
            //     .eq('recommended_id', userId)

            // if (!recommendationsError && recommendationsData && profile) {
            //     // Atualizar o perfil com a contagem real de recomendações
            //     setProfile(prev => prev ? {
            //         ...prev,
            //         total_recommendations: recommendationsData.length
            //     } : null)
            // }
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
            // Nota: Sistema de recomendações temporariamente desabilitado
            // const { data: recommendationsData, error: recommendationsError } = await supabase
            //     .from('user_recommendations')
            //     .select('id')
            //     .eq('recommended_id', userId)

            // if (!recommendationsError && recommendationsData) {
            //     // Atualizar o perfil com a contagem real de recomendações
            //     setProfile(prev => prev ? {
            //         ...prev,
            //         total_recommendations: recommendationsData.length
            //     } : null)
            // }

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
        openMessages(userId, profile?.full_name || 'Usuário')
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
            <div className="min-h-screen bg-yellow-400">
                <div className="container mx-auto px-4 py-6 md:py-8">
                    <div className="max-w-6xl mx-auto">
                    {/* Header do Perfil Brutalista */}
                    <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-6 md:mb-8">
                        <div className="text-center p-6 md:p-8">
                            <div className="flex justify-center mb-6 md:mb-8">
                                <div className="p-4 bg-black border-4 border-black">
                                    <UserAvatar
                                        src={profile.avatar_url}
                                        alt={profile.full_name}
                                        fallback={profile.full_name?.charAt(0) || 'U'}
                                        size="lg"
                                        className="w-24 h-24 md:w-32 md:h-32"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-6">
                                <h1 className="text-3xl md:text-5xl font-black text-black text-center tracking-wider">
                                    {profile.full_name?.toUpperCase()}
                                </h1>
                                {profile.is_verified && (
                                    <div className="px-4 py-2 bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-black text-sm">VERIFICADO</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-black mb-6 md:mb-8 text-sm md:text-base">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    <span className="font-black uppercase">
                                        {profile.user_type === 'professional' ? 'PROFISSIONAL' : 'CLIENTE'}
                                    </span>
                                </div>
                                
                                {profile.location_city && profile.location_state && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        <span className="font-black uppercase">{profile.location_city}, {profile.location_state}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5" />
                                    <span className="font-black">MEMBRO DESDE {formatDate(profile.created_at)}</span>
                                </div>
                            </div>

                            {/* Estatísticas Principais Brutalistas */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-6 md:mb-8">
                                <div className="p-4 bg-yellow-400 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                                    <div className="text-2xl md:text-3xl font-black">
                                        {reviewStats?.averageRating ? (reviewStats.averageRating || 0).toFixed(1) : '0.0'}
                                    </div>
                                    <div className="text-xs md:text-sm font-black">AVALIAÇÃO MÉDIA</div>
                                    <div className="flex justify-center mt-2">
                                        {renderStars(reviewStats?.averageRating || 0)}
                                    </div>
                                </div>
                                <div className="p-4 bg-red-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                                    <div className="text-2xl md:text-3xl font-black">{reviewStats?.totalReviews || 0}</div>
                                    <div className="text-xs md:text-sm font-black">AVALIAÇÕES</div>
                                </div>
                                <div className="p-4 bg-green-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                                    <div className="text-2xl md:text-3xl font-black">{viewStats?.total_views || 0}</div>
                                    <div className="text-xs md:text-sm font-black">VISUALIZAÇÕES</div>
                                    {viewStats?.views_today && viewStats.views_today > 0 && (
                                        <div className="text-xs text-yellow-300 font-bold mt-1">
                                            +{viewStats.views_today} hoje
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-blue-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                                    <div className="text-2xl md:text-3xl font-black">{profile?.total_recommendations || 0}</div>
                                    <div className="text-xs md:text-sm font-black">RECOMENDAÇÕES</div>
                                </div>
                            </div>

                            {/* Botões de Ação Brutalistas */}
                            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-lg mx-auto">
                                <Button
                                    onClick={handleChatRedirect}
                                    className="bg-black text-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-6 py-3"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    <span className="text-sm">CONVERSAR</span>
                                </Button>
                                
                                {/* Botão de Favorito */}
                                {user && user.id !== userId && (
                                    <FavoriteButton
                                        userId={userId}
                                        userName={profile?.full_name || 'Usuário'}
                                        size="sm"
                                        variant="outline"
                                        showText={true}
                                        className="text-xs bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-4 py-2"
                                    />
                                )}
                                
                                {/* Botão de Recomendação */}
                                {user && user.id !== userId && (
                                    <RecommendationButton
                                        userId={userId}
                                        userName={profile?.full_name || 'Usuário'}
                                        size="sm"
                                        variant="outline"
                                        showCount={true}
                                        className="text-xs bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-4 py-2"
                                    />
                                )}
                                
                                <Button
                                    onClick={copyProfileLink}
                                    className="bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-4 py-2"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    <span className="text-sm">COPIAR LINK</span>
                                </Button>
                            </div>

                        </div>
                    </div>

                {/* Sistema de Abas Brutalista */}
                <Tabs defaultValue="informacoes" className="w-full">
                    <TabsList className="bg-black p-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 flex w-full gap-2 h-auto">
                            <TabsTrigger 
                                value="informacoes" 
                                className="flex items-center justify-center gap-2 text-sm md:text-base font-black bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all data-[state=active]:bg-yellow-400 data-[state=active]:text-black py-3 flex-1"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">INFORMAÇÕES</span>
                                <span className="sm:hidden">INFO</span>
                            </TabsTrigger>
                            {profile.user_type === 'professional' && (
                                <TabsTrigger 
                                    value="portfolio" 
                                    className="flex items-center justify-center gap-2 text-sm md:text-base font-black bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all data-[state=active]:bg-yellow-400 data-[state=active]:text-black py-3 flex-1"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    <span className="hidden sm:inline">PORTFÓLIO</span>
                                    <span className="sm:hidden">PROJETOS</span>
                                </TabsTrigger>
                            )}
                            <TabsTrigger 
                                value="avaliacoes" 
                                className="flex items-center justify-center gap-2 text-sm md:text-base font-black bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all data-[state=active]:bg-yellow-400 data-[state=active]:text-black py-3 flex-1"
                            >
                                <Star className="w-4 h-4" />
                                <span className="hidden sm:inline">AVALIAÇÕES</span>
                                <span className="sm:hidden">AVAL.</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="recomendacoes" 
                                className="flex items-center justify-center gap-2 text-sm md:text-base font-black bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all data-[state=active]:bg-yellow-400 data-[state=active]:text-black py-3 flex-1"
                            >
                                <ThumbsUp className="w-4 h-4" />
                                <span className="hidden sm:inline">RECOMENDAÇÕES</span>
                                <span className="sm:hidden">REC.</span>
                            </TabsTrigger>
                    </TabsList>

                    {/* Aba de Informações Brutalista */}
                    <TabsContent value="informacoes" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Coluna Esquerda - Informações Principais */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Informações do Profissional */}
                                {profile.user_type === 'professional' && (
                                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="p-6 border-b-4 border-black bg-black text-yellow-400">
                                            <h3 className="flex items-center gap-2 text-xl font-black">
                                                <Briefcase className="w-5 h-5" />
                                                INFORMAÇÕES PROFISSIONAIS
                                            </h3>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {/* Badge e Status */}
                                            <div className="flex items-center justify-between">
                                                <div className={`px-4 py-2 text-sm font-black border-2 border-black ${
                                                    profile.badge === 'gold' ? 'bg-yellow-400 text-black' :
                                                    profile.badge === 'silver' ? 'bg-gray-400 text-white' :
                                                    profile.badge === 'bronze' ? 'bg-amber-600 text-white' :
                                                    'bg-gray-500 text-white'
                                                }`}>
                                                    <div className="flex items-center gap-2">
                                                        <Award className="w-4 h-4" />
                                                        {getBadgeName(profile.badge).toUpperCase()}
                                                    </div>
                                                </div>
                                                
                                                <div className={`px-4 py-2 text-sm font-black border-2 border-black ${
                                                    profile.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                                }`}>
                                                    {profile.is_available ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
                                                </div>
                                            </div>

                                            {/* Experiência */}
                                            {profile.professional_experience_years && (
                                                <div className="flex items-center gap-3 p-4 bg-gray-100 border-2 border-black">
                                                    <Clock className="w-5 h-5 text-black" />
                                                    <div>
                                                        <span className="font-black text-black">EXPERIÊNCIA:</span>
                                                        <span className="ml-2 font-black text-black">
                                                            {profile.professional_experience_years} ANO(S)
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Serviços */}
                                            {profile.professional_services && profile.professional_services.length > 0 && (
                                                <div>
                                                    <h4 className="font-black text-black mb-3 text-lg">SERVIÇOS OFERECIDOS</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.professional_services.map((service, index) => (
                                                            <div key={index} className="px-3 py-1 bg-yellow-400 text-black border-2 border-black font-black text-sm">
                                                                {service.toUpperCase()}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Certificações */}
                                            {profile.professional_certifications && profile.professional_certifications.length > 0 && (
                                                <div>
                                                    <h4 className="font-black text-black mb-3 text-lg">CERTIFICAÇÕES</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.professional_certifications.map((cert, index) => (
                                                            <div key={index} className="px-3 py-1 bg-green-500 text-white border-2 border-black font-black text-sm">
                                                                <div className="flex items-center gap-1">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    {cert.toUpperCase()}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Portfolio */}
                                            {profile.professional_portfolio_url && (
                                                <div className="flex items-center gap-3 p-4 bg-blue-100 border-2 border-black">
                                                    <Building2 className="w-5 h-5 text-black" />
                                                    <div>
                                                        <span className="font-black text-black">PORTFOLIO:</span>
                                                        <a 
                                                            href={profile.professional_portfolio_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-blue-600 hover:underline font-black"
                                                        >
                                                            VER PORTFOLIO
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Bio Brutalista */}
                                {profile.bio && (
                                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="p-6 border-b-4 border-black bg-black text-yellow-400">
                                            <h3 className="text-xl font-black">SOBRE</h3>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-black leading-relaxed text-lg font-medium">{profile.bio}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Localização Brutalista */}
                                {(profile.location_state || profile.location_city || profile.neighborhood) && (
                                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="p-6 border-b-4 border-black bg-black text-yellow-400">
                                            <h3 className="flex items-center gap-2 text-xl font-black">
                                                <MapPinIcon className="w-5 h-5" />
                                                LOCALIZAÇÃO
                                            </h3>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {profile.location_state && (
                                                    <div className="flex items-center gap-3 p-3 bg-gray-100 border-2 border-black">
                                                        <span className="font-black text-black">ESTADO:</span>
                                                        <span className="font-black text-black">{profile.location_state.toUpperCase()}</span>
                                                    </div>
                                                )}
                                                {profile.location_city && (
                                                    <div className="flex items-center gap-3 p-3 bg-gray-100 border-2 border-black">
                                                        <span className="font-black text-black">CIDADE:</span>
                                                        <span className="font-black text-black">{profile.location_city.toUpperCase()}</span>
                                                    </div>
                                                )}
                                                {profile.neighborhood && (
                                                    <div className="flex items-center gap-3 p-3 bg-gray-100 border-2 border-black">
                                                        <span className="font-black text-black">BAIRRO:</span>
                                                        <span className="font-black text-black">{profile.neighborhood.toUpperCase()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dados de Contato Brutalista (Só aparece após acordo fechado) */}
                                {showContactInfo && (profile.phone || profile.email) && (
                                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-l-8 border-l-blue-500">
                                        <div className="p-6 border-b-4 border-black bg-blue-500 text-white">
                                            <h3 className="flex items-center gap-2 text-xl font-black">
                                                <MessageCircle className="w-5 h-5" />
                                                DADOS DE CONTATO
                                            </h3>
                                            <p className="text-sm font-black mt-2">
                                                INFORMAÇÕES DISPONÍVEIS APÓS ACORDO FECHADO
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {profile.phone && (
                                                    <div className="flex items-center gap-3 p-3 bg-green-100 border-2 border-black">
                                                        <Phone className="w-5 h-5 text-black" />
                                                        <div>
                                                            <span className="font-black text-black">TELEFONE:</span>
                                                            <span className="ml-2 font-black text-black">{profile.phone}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {profile.email && (
                                                    <div className="flex items-center gap-3 p-3 bg-green-100 border-2 border-black">
                                                        <Mail className="w-5 h-5 text-black" />
                                                        <div>
                                                            <span className="font-black text-black">E-MAIL:</span>
                                                            <span className="ml-2 font-black text-black">{profile.email}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Coluna Direita - Calendário Brutalista */}
                            <div className="space-y-6">
                                {/* Calendário de Disponibilidade Brutalista */}
                                {profile.user_type === 'professional' && (
                                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="p-6 border-b-4 border-black bg-black text-yellow-400">
                                            <h3 className="flex items-center gap-2 text-xl font-black">
                                                <CalendarIcon className="w-5 h-5" />
                                                DISPONIBILIDADE
                                            </h3>
                                            <p className="text-sm font-black mt-2">
                                                VISUALIZE OS HORÁRIOS DISPONÍVEIS
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            className="w-full justify-start text-left font-black bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {calendarDate ? format(calendarDate, "MMMM yyyy", { locale: ptBR }).toUpperCase() : "SELECIONE UMA DATA"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 border-4 border-black" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={calendarDate}
                                                            onSelect={setCalendarDate}
                                                            locale={ptBR}
                                                            className="rounded-md border-4 border-black"
                                                            required
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                
                                                <div className="text-center p-4 bg-gray-100 border-2 border-black">
                                                    <p className="text-sm font-black text-black">
                                                        {profile.is_available ? 'PROFISSIONAL DISPONÍVEL PARA NOVOS TRABALHOS' : 'PROFISSIONAL INDISPONÍVEL NO MOMENTO'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Aba de Portfólio Brutalista */}
                    {profile.user_type === 'professional' && (
                        <TabsContent value="portfolio" className="space-y-6">
                            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <div className="p-6 border-b-4 border-black bg-black text-yellow-400">
                                    <h3 className="flex items-center gap-2 text-xl font-black">
                                        <Briefcase className="w-5 h-5" />
                                        PORTFÓLIO DE TRABALHOS
                                    </h3>
                                    <p className="text-sm font-black mt-2">
                                        PROJETOS REALIZADOS PELO PROFISSIONAL
                                    </p>
                                </div>
                                <div className="p-6">
                                    {portfolioLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-black mx-auto mb-4"></div>
                                            <p className="text-black font-black">CARREGANDO PORTFÓLIO...</p>
                                        </div>
                                    ) : portfolioProjects.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {portfolioProjects.map((project) => (
                                                <div 
                                                    key={project.id} 
                                                    className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                                                    onClick={() => handleViewPortfolioProject(project.id)}
                                                >
                                                    {/* Imagem do Projeto */}
                                                    <div className="h-48 bg-gray-200 border-b-4 border-black flex items-center justify-center">
                                                        {project.images && project.images.length > 0 ? (
                                                            <img
                                                                src={project.images[0]}
                                                                alt={project.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="h-12 w-12 text-black" />
                                                        )}
                                                    </div>
                                                    
                                                    {/* Conteúdo */}
                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <h4 className="font-black text-black text-base line-clamp-2">
                                                                {project.title.toUpperCase()}
                                                            </h4>
                                                            {project.is_featured && (
                                                                <div className="px-2 py-1 bg-yellow-400 text-black border-2 border-black font-black text-xs ml-2">
                                                                    DESTAQUE
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <p className="text-black text-sm line-clamp-3 mb-4 font-medium">
                                                            {project.description || 'SEM DESCRIÇÃO'}
                                                        </p>
                                                        
                                                        <div className="flex items-center justify-between text-sm text-black mb-3 font-bold">
                                                            <div className="flex items-center gap-4">
                                                                {project.location && (
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="h-4 w-4" />
                                                                        <span className="truncate max-w-24">{project.location.toUpperCase()}</span>
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
                                                            <div className="flex items-center gap-1 text-sm text-green-600 font-black">
                                                                <DollarSign className="h-4 w-4" />
                                                                <span>{project.budget_range}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-black">
                                            <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center mx-auto mb-4">
                                                <Briefcase className="h-8 w-8 text-yellow-400" />
                                            </div>
                                            <h3 className="text-xl font-black mb-2">NENHUM PROJETO AINDA</h3>
                                            <p className="text-sm font-bold">ESTE PROFISSIONAL AINDA NÃO ADICIONOU PROJETOS AO SEU PORTFÓLIO.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    )}

                    {/* Aba de Avaliações */}
                    <TabsContent value="avaliacoes" className="space-y-6">
                        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <div className="p-4 md:p-6 border-b-4 border-black bg-black text-yellow-400">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-black flex items-center gap-2">
                                            <Star className="w-5 h-5 text-green-500" />
                                            AVALIAÇÕES RECEBIDAS
                                        </h3>
                                        <p className="text-sm font-bold mt-1">
                                            {hookReviews.length > 0 
                                                ? `${hookReviews.length} AVALIAÇÕES DE OUTROS USUÁRIOS`
                                                : 'AINDA NÃO HÁ AVALIAÇÕES'
                                            }
                                        </p>
                                    </div>
                                    {canReview && user && (
                                        <Button
                                            onClick={() => setShowReviewForm(true)}
                                            className="bg-blue-500 text-white border-2 border-black hover:bg-blue-600 font-black"
                                        >
                                            <Star className="h-4 w-4 mr-2" />
                                            AVALIAR
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 md:p-6">
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
                                    <div className="text-center py-12 text-black">
                                        <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center mx-auto mb-4">
                                            <Star className="h-8 w-8 text-yellow-400" />
                                        </div>
                                        <h3 className="text-xl font-black mb-2">NENHUMA AVALIAÇÃO AINDA</h3>
                                        <p className="text-sm font-bold mb-6">
                                            ESTE USUÁRIO AINDA NÃO RECEBEU AVALIAÇÕES.
                                        </p>
                                        {canReview && user && (
                                            <Button
                                                onClick={() => setShowReviewForm(true)}
                                                className="bg-blue-500 text-white border-2 border-black hover:bg-blue-600 font-black"
                                            >
                                                <Star className="h-4 w-4 mr-2" />
                                                SEJA O PRIMEIRO A AVALIAR
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
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
      </div>
    </MainLayout>
  )
}
