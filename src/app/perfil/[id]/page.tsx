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
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Star, Award, Phone, Mail, User, Briefcase, MessageCircle, Copy, Clock, MapPinIcon, Building2, CheckCircle, ThumbsUp, MessageSquare } from 'lucide-react'
import { RecommendationButton } from '@/components/ui/RecommendationButton'
import { MainLayout } from '@/components/layout/MainLayout'

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
    total_reviews: number
    total_recommendations: number
    is_verified: boolean
    is_available: boolean
    created_at: string
    phone?: string | null
    email?: string | null
}

interface UserReview {
    id: string
    rating: number
    comment: string
    created_at: string
    reviewer: {
        full_name: string
        avatar_url: string | null
        user_type: string
    }
}

interface UserRecommendation {
    id: string
    created_at: string
    recommender: {
        full_name: string
        avatar_url: string | null
        user_type: string
    }
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
    const [reviews, setReviews] = useState<UserReview[]>([])
    const [recommendations, setRecommendations] = useState<UserRecommendation[]>([])
    const [calendarDate, setCalendarDate] = useState<Date>(new Date())
    const [showContactInfo, setShowContactInfo] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [userId])

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

            // Buscar avaliações
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('user_reviews')
                .select(`
                    id, rating, comment, created_at,
                    reviewer:profiles!user_reviews_reviewer_id_fkey(
                        full_name, avatar_url, user_type
                    )
                `)
                .eq('reviewed_id', userId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (!reviewsError && reviewsData) {
                const formattedReviews = reviewsData.map((review: { id: string; rating: number; comment: string | null; created_at: string; reviewer: { full_name: string | null; avatar_url: string | null; user_type: string | null }[] }) => ({
                    id: review.id,
                    rating: review.rating,
                    comment: review.comment || '',
                    created_at: review.created_at,
                    reviewer: {
                        full_name: review.reviewer?.[0]?.full_name || '',
                        avatar_url: review.reviewer?.[0]?.avatar_url || null,
                        user_type: review.reviewer?.[0]?.user_type || ''
                    }
                }))
                setReviews(formattedReviews)
            }

            // Buscar recomendações
            const { data: recommendationsData, error: recommendationsError } = await supabase
                .from('user_recommendations')
                .select(`
                    id, created_at,
                    recommender:profiles!user_recommendations_recommender_id_fkey(
                        full_name, avatar_url, user_type
                    )
                `)
                .eq('recommended_id', userId)
                .order('created_at', { ascending: false })
                .limit(10)

            if (!recommendationsError && recommendationsData) {
                const formattedRecommendations = recommendationsData.map((rec: { id: string; created_at: string; recommender: { full_name: string | null; avatar_url: string | null; user_type: string | null }[] }) => ({
                    id: rec.id,
                    created_at: rec.created_at,
                    recommender: {
                        full_name: rec.recommender?.[0]?.full_name || '',
                        avatar_url: rec.recommender?.[0]?.avatar_url || null,
                        user_type: rec.recommender?.[0]?.user_type || ''
                    }
                }))
                setRecommendations(formattedRecommendations)
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
        
        // Abrir chat flutuante com o usuário
        openChat(userId, profile?.full_name || 'Usuário')
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
                                <div className="text-xl md:text-2xl font-bold text-gray-900">{profile.rating.toFixed(1)}</div>
                                <div className="text-xs md:text-sm text-gray-600">Avaliação Média</div>
                                <div className="flex justify-center mt-1">
                                    {renderStars(profile.rating)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl md:text-2xl font-bold text-gray-900">{profile.total_reviews}</div>
                                <div className="text-xs md:text-sm text-gray-600">Avaliações</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl md:text-2xl font-bold text-gray-900">{profile.total_recommendations || 0}</div>
                                <div className="text-xs md:text-sm text-gray-600">Recomendações</div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 w-full max-w-sm mx-auto">
                            <Button
                                onClick={handleChatRedirect}
                                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                size="lg"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {user ? 'Iniciar Conversa' : 'Fazer Login para Conversar'}
                            </Button>
                            
                            {/* Botão de Recomendação */}
                            {user && user.id !== userId && (
                                <RecommendationButton
                                    userId={userId}
                                    size="lg"
                                    variant="outline"
                                    showCount={true}
                                    className="w-full"
                                />
                            )}
                            
                            <Button
                                variant="outline"
                                onClick={copyProfileLink}
                                className="w-full"
                                size="lg"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Link
                            </Button>
                        </div>

                        {/* Botão para Copiar Link */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-4">Compartilhar perfil:</p>
                            <div className="flex items-center justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyProfileLink}
                                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copiar Link do Perfil
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Grid Principal de Informações */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Coluna Esquerda - Informações Profissionais */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
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

                    {/* Coluna Direita - Calendário e Recomendações */}
                    <div className="space-y-4 md:space-y-6">
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

                        {/* Recomendações em Destaque */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <ThumbsUp className="w-5 h-5" />
                                    Recomendações
                                </CardTitle>
                                <CardDescription>
                                    {recommendations.length} usuários recomendam este perfil
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recommendations.length > 0 ? (
                                        recommendations.slice(0, 5).map((rec) => (
                                            <div key={rec.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <UserAvatar
                                                    src={rec.recommender.avatar_url}
                                                    alt={rec.recommender.full_name}
                                                    fallback={rec.recommender.full_name?.charAt(0) || 'U'}
                                                    size="sm"
                                                    className="w-10 h-10"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {rec.recommender.full_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 capitalize">
                                                        {rec.recommender.user_type}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(rec.created_at)}
                                                    </p>
                                                </div>
                                                <ThumbsUp className="w-4 h-4 text-green-600" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <ThumbsUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            <p>Nenhuma recomendação ainda</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Avaliações */}
                {reviews.length > 0 && (
                    <Card className="border-0 shadow-sm mt-6 md:mt-8">
                        <CardHeader className="px-4 md:px-6">
                            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                <Star className="w-5 h-5" />
                                Avaliações Recebidas
                            </CardTitle>
                            <CardDescription>
                                {reviews.length} avaliações de outros usuários
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 md:px-6">
                            <div className="space-y-3 md:space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-3 md:p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <UserAvatar
                                                src={review.reviewer.avatar_url}
                                                alt={review.reviewer.full_name}
                                                fallback={review.reviewer.full_name?.charAt(0) || 'U'}
                                                size="sm"
                                                className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-2">
                                                    <p className="font-medium text-gray-900 text-sm md:text-base">
                                                        {review.reviewer.full_name}
                                                    </p>
                                                    <Badge variant="outline" className="text-xs capitalize w-fit">
                                                        {review.reviewer.user_type}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {renderStars(review.rating)}
                                                </div>
                                                {review.comment && (
                                                    <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
                                                        &ldquo;{review.comment}&rdquo;
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {formatDate(review.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    </MainLayout>
  )
}
