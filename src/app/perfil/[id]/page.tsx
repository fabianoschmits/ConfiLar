'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  MapPin, 
  Star, 
  Award, 
  Phone, 
  Mail, 
  User, 
  Briefcase, 
  MessageCircle, 
  Clock, 
  Building2, 
  CheckCircle, 
  ThumbsUp, 
  Eye, 
  Heart, 
  Calendar,
  Shield,
  Globe,
  Share2,
  MoreVertical,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Users,
  Target
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { toast } from 'sonner'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews'
import { useProfileViews } from '@/hooks/useProfileViews'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReportButton } from '@/components/ReportButton'

interface PublicProfile {
    id: string
    full_name: string
    user_type: 'client' | 'professional'
    avatar_url: string | null
    bio: string | null
    location_state: string | null
    location_city: string | null
    neighborhood: string | null
    address: string | null
    professional_services: string[] | null
    professional_experience_years: number | null
    professional_certifications: string[] | null
    badge: string
    rating: number
    total_reviews: number
    is_verified: boolean
    is_available: boolean
    created_at: string
    phone?: string | null
    email?: string | null
}

export default function PublicProfilePage() {
    // Todos os hooks no topo, sempre chamados na mesma ordem
    const [mounted, setMounted] = useState(false)
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthContext()
    const { openChat } = useFloatingChat()
    const userId = params.id as string
    const [profile, setProfile] = useState<PublicProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showContactInfo, setShowContactInfo] = useState(false)
    const [viewStats, setViewStats] = useState<{ total_views: number; views_today: number } | null>(null)
    const [mutualEvaluation, setMutualEvaluation] = useState(false)

    // Hooks customizados - sempre chamados com valores consistentes
    const { projects: portfolioProjects, loading: portfolioLoading } = usePortfolio(userId || '')
    const { reviews, loading: reviewsLoading, fetchUserReviews, fetchUserReviewStats, respondToReview } = useSupabaseReviews()
    const { getViewStats, useAutoRecordView } = useProfileViews()

    // Função para deletar avaliação
    const handleDeleteReview = async (reviewId: string) => {
        try {
            // Primeiro, obter informações da avaliação para resetar a solicitação
            const { data: reviewData, error: reviewError } = await supabase
                .from('reviews')
                .select('reviewer_id, reviewed_id')
                .eq('id', reviewId)
                .single()

            if (reviewError) {
                console.error('Erro ao obter dados da avaliação:', reviewError)
                toast.error('Erro ao obter dados da avaliação')
                return
            }

            // Deletar a avaliação
            const { error: deleteError } = await supabase
                .from('reviews')
                .delete()
                .eq('id', reviewId)

            if (deleteError) {
                console.error('Erro ao deletar avaliação:', deleteError)
                toast.error('Erro ao deletar avaliação')
                return
            }

            // Resetar status da solicitação de avaliação para 'accepted' 
            // para permitir nova avaliação
            const { error: requestError } = await supabase
                .from('evaluation_requests')
                .update({ 
                    status: 'accepted',
                    updated_at: new Date().toISOString()
                })
                .or(`and(requester_id.eq.${reviewData.reviewer_id},target_id.eq.${reviewData.reviewed_id}),and(requester_id.eq.${reviewData.reviewed_id},target_id.eq.${reviewData.reviewer_id})`)

            if (requestError) {
                console.error('Erro ao resetar solicitação:', requestError)
                // Não falhar se apenas a atualização do status falhar
            }

            toast.success('Avaliação removida com sucesso! Agora vocês podem se avaliar novamente.')
            
            // Recarregar avaliações
            if (userId) {
                await fetchUserReviews(userId)
            }
        } catch (error) {
            console.error('Erro ao deletar avaliação:', error)
            toast.error('Erro ao deletar avaliação')
        }
    }

    // Todos os useEffect no topo, antes de qualquer retorno condicional
    useEffect(() => {
      setMounted(true)
    }, [])

    useEffect(() => {
        if (userId) {
            fetchProfile()
        }
    }, [userId])

    useEffect(() => {
        if (userId && user?.id && userId !== user.id) {
            console.log('🔍 Registrando visualização do perfil:', userId)
            const cleanup = useAutoRecordView(userId)
            return cleanup
        }
    }, [userId, user?.id, useAutoRecordView])

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

    useEffect(() => {
        if (userId) {
            console.log('📊 Perfil Público - Carregando avaliações para usuário:', userId)
            fetchUserReviews(userId)
            fetchUserReviewStats(userId)
            updateProfileStats(userId)
            checkMutualEvaluation()
        }
    }, [userId, fetchUserReviews, fetchUserReviewStats])

    // Funções definidas após todos os hooks
    const fetchProfile = async () => {
        try {
            setLoading(true)
            setError(null)

            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id,
                    full_name,
                    user_type,
                    avatar_url,
                    bio,
                    location_state,
                    location_city,
                    neighborhood,
                    address,
                    professional_services,
                    professional_experience_years,
                    professional_certifications,
                    badge,
                    rating,
                    total_reviews,
                    is_verified,
                    is_available,
                    created_at,
                    phone,
                    email
                `)
                .eq('id', userId)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    setError('Perfil não encontrado')
                } else {
                    throw error
                }
                return
            }

            setProfile(data)
        } catch (error) {
            console.error('Erro ao buscar perfil:', error)
            setError('Erro ao carregar perfil')
        } finally {
            setLoading(false)
        }
    }

    const updateProfileStats = async (profileId: string) => {
        try {
            const { data: reviewsData, error } = await supabase
                .from('reviews')
                .select('rating_person')
                .eq('reviewed_id', profileId)

            if (error) throw error

            if (reviewsData && reviewsData.length > 0) {
                const totalReviews = reviewsData.length
                const averageRating = reviewsData.reduce((sum, review) => sum + review.rating_person, 0) / totalReviews

                // Atualizar o perfil com as novas estatísticas
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        rating: Math.round(averageRating * 10) / 10,
                        total_reviews: totalReviews
                    })
                    .eq('id', profileId)

                if (updateError) throw updateError

                // Atualizar o estado local
                setProfile(prev => prev ? {
                    ...prev,
                    rating: Math.round(averageRating * 10) / 10,
                    total_reviews: totalReviews
                } : null)
            }
        } catch (error) {
            console.error('Erro ao atualizar estatísticas do perfil:', error)
        }
    }

    // Verificar se há avaliação mútua entre os usuários
    const checkMutualEvaluation = async () => {
        if (!user || !userId) return

        try {
            // Verificar se o usuário atual avaliou o perfil visitado
            const { data: userToProfile, error: error1 } = await supabase
                .from('reviews')
                .select('id')
                .eq('reviewer_id', user.id)
                .eq('reviewed_id', userId)
                .single()

            // Verificar se o perfil visitado avaliou o usuário atual
            const { data: profileToUser, error: error2 } = await supabase
                .from('reviews')
                .select('id')
                .eq('reviewer_id', userId)
                .eq('reviewed_id', user.id)
                .single()

            // Se ambos se avaliaram, liberar informações de contato
            const hasMutualEvaluation = !error1 && !error2 && !!userToProfile && !!profileToUser
            setMutualEvaluation(hasMutualEvaluation)
        } catch (error) {
            console.error('Erro ao verificar avaliação mútua:', error)
            setMutualEvaluation(false)
        }
    }

    const handleContact = () => {
        if (!user) {
            toast.error('Você precisa estar logado para entrar em contato')
            return
        }
        
        if (userId === user.id) {
            toast.error('Você não pode entrar em contato consigo mesmo')
            return
        }
        
        // Abrir chat flutuante
        openChat(userId, profile?.full_name || 'Usuário')
        toast.success('Iniciando conversa...')
    }

    // Retornos condicionais após todos os hooks
    if (!mounted) {
        return null
    }

    if (loading) {
        return (
            <MainLayout requireAuth={false}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="animate-pulse">
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <div className="flex items-center space-x-6">
                                    <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }

    if (error || !profile) {
        return (
            <MainLayout requireAuth={false}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                    <Card className="max-w-md mx-auto">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <User className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                                {error || 'Perfil não encontrado'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                O perfil que você está procurando não existe ou não está disponível.
                            </p>
                            <Button onClick={() => router.push('/buscar')}>
                                Buscar Profissionais
                            </Button>
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header do Perfil */}
                    <Card className="mb-8">
                        <CardContent className="p-4 sm:p-6 lg:p-8">
                            {/* Header com 3 pontinhos */}
                            <div className="flex justify-end mb-4">
                                {!isOwnProfile && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <ReportButton 
                                                    type="user" 
                                                    targetId={profile.id}
                                                    targetName={profile.full_name}
                                                    asDropdownItem={true}
                                                    className="w-full justify-start p-0 h-auto font-normal"
                                                />
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            
                            <div className="flex flex-col items-center text-center space-y-6">
                                {/* Avatar Centralizado */}
                                <div className="relative">
                                    <UserAvatar
                                        src={profile.avatar_url}
                                        alt={profile.full_name}
                                        fallback={profile.full_name.charAt(0)}
                                        size="lg"
                                        className="w-32 h-32"
                                    />
                                </div>
                                
                                {/* Nome e Badges Centralizados */}
                                <div className="space-y-3">
                                    <div className="flex flex-col items-center space-y-2">
                                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white dark:text-white">
                                            {profile.full_name}
                                        </h1>
                                        <div className="flex flex-wrap justify-center items-center gap-2">
                                            {profile.is_verified && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Verificado
                                                </Badge>
                                            )}
                                            {isProfessional && (
                                                <Badge 
                                                    className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                                                        profile.is_available 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        profile.is_available ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></div>
                                                    {profile.is_available ? 'Disponível' : 'Ocupado'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Informações de Rating e Tipo Centralizadas */}
                                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="font-medium">{profile.rating.toFixed(1)}</span>
                                            <span>({profile.total_reviews} avaliações)</span>
                                        </div>
                                        {isProfessional && (
                                            <div className="flex items-center space-x-1">
                                                <Briefcase className="w-4 h-4" />
                                                <span>Profissional</span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-1">
                                            <Eye className="w-4 h-4" />
                                            <span>{viewStats?.total_views || 0} visualizações</span>
                                        </div>
                                    </div>
                                    
                                    {/* Bio Centralizada */}
                                    {profile.bio && (
                                        <p className="text-gray-700 max-w-2xl mx-auto">
                                            {profile.bio}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Botões de Ação Centralizados */}
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                    {!isOwnProfile && (
                                        <Button
                                            onClick={handleContact}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Entrar em Contato
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Compartilhar
                                    </Button>
                                </div>

                                {/* Estatísticas */}
                                <div className="w-full max-w-2xl mx-auto mt-6 pt-6 border-t border-gray-200">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{profile.rating.toFixed(1)}</div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avaliação</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl sm:text-2xl font-bold text-green-600">{profile.total_reviews}</div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avaliações</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl sm:text-2xl font-bold text-purple-600">{viewStats?.total_views || 0}</div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Visualizações</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl sm:text-2xl font-bold text-orange-600">{viewStats?.views_today || 0}</div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hoje</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conteúdo Principal */}
                    <Tabs defaultValue={isProfessional ? "services" : "about"} className="space-y-6">
                        <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-4' : 'grid-cols-3'}`}>
                            {isProfessional && <TabsTrigger value="services">Serviços</TabsTrigger>}
                            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                            {isProfessional && <TabsTrigger value="portfolio">Portfólio</TabsTrigger>}
                            <TabsTrigger value="about">Sobre</TabsTrigger>
                        </TabsList>

                        <TabsContent value="about" className="space-y-6">
                            {/* Informações do Usuário - Sistema de Privacidade */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <User className="w-5 h-5" />
                                        <span>Informações do Usuário</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {user?.id === userId ? (
                                        // Próprio usuário - todos os dados visíveis
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-800">
                                                        Seu perfil - todas as informações visíveis
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Localização */}
                                                <div className="flex items-center space-x-3">
                                                    <MapPin className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Localização</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {profile.location_city && profile.location_state
                                                                ? `${profile.location_city}, ${profile.location_state}`
                                                                : 'Não informado'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Bairro */}
                                                {profile.neighborhood && (
                                                    <div className="flex items-center space-x-3">
                                                        <Building2 className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Bairro</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.neighborhood}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Endereço */}
                                                {profile.address && (
                                                    <div className="flex items-center space-x-3 sm:col-span-2">
                                                        <Globe className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Endereço</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.address}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Telefone */}
                                                {profile.phone && (
                                                    <div className="flex items-center space-x-3">
                                                        <Phone className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Telefone</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Email */}
                                                {profile.email && (
                                                    <div className="flex items-center space-x-3">
                                                        <Mail className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Membro desde */}
                                                <div className="flex items-center space-x-3">
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Membro desde</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {format(new Date(profile.created_at), 'MMMM yyyy', { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : !mutualEvaluation ? (
                                        // Dados borrados quando não há avaliação mútua
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                <div className="flex items-start space-x-3">
                                                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                                                            Informações Protegidas
                                                        </h4>
                                                        <p className="text-sm text-blue-700 mb-2">
                                                            Para proteger a privacidade dos usuários, as informações pessoais 
                                                            só são liberadas após uma avaliação mútua entre os usuários.
                                                        </p>
                                                        <p className="text-xs text-blue-600">
                                                            💡 <strong>Dica:</strong> Avalie este usuário e peça para que ele também te avalie. 
                                                            Após a avaliação mútua, as informações serão liberadas automaticamente.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Dados sempre visíveis */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                {/* Localização sempre visível */}
                                                <div className="flex items-center space-x-3">
                                                    <MapPin className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Localização</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {profile.location_city && profile.location_state
                                                                ? `${profile.location_city}, ${profile.location_state}`
                                                                : 'Não informado'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Bairro sempre visível */}
                                                {profile.neighborhood && (
                                                    <div className="flex items-center space-x-3">
                                                        <Building2 className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Bairro</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.neighborhood}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Endereço sempre visível */}
                                                {profile.address && (
                                                    <div className="flex items-center space-x-3 sm:col-span-2">
                                                        <Globe className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Endereço</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.address}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Membro desde sempre visível */}
                                                <div className="flex items-center space-x-3">
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Membro desde</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {format(new Date(profile.created_at), 'MMMM yyyy', { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Dados borrados (telefone e email) */}
                                            <div className="border-t border-gray-200 pt-4">
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Informações de Contato (Protegidas)</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Telefone borrado */}
                                                    <div className="flex items-center space-x-3">
                                                        <Phone className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Telefone</p>
                                                            <p className="text-sm text-gray-400 dark:text-gray-500 select-none">•••••••••••</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Email borrado */}
                                                    <div className="flex items-center space-x-3">
                                                        <Mail className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                                                            <p className="text-sm text-gray-400 dark:text-gray-500 select-none">••••••••••••••••</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Dados liberados após avaliação mútua
                                        <div className="space-y-4">
                                            {/* Dados sempre visíveis */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                {/* Localização sempre visível */}
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Localização</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {profile.location_city && profile.location_state
                                                        ? `${profile.location_city}, ${profile.location_state}`
                                                        : 'Não informado'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                                
                                                {/* Bairro sempre visível */}
                                                {profile.neighborhood && (
                                                    <div className="flex items-center space-x-3">
                                                        <Building2 className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Bairro</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.neighborhood}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Endereço sempre visível */}
                                                {profile.address && (
                                                    <div className="flex items-center space-x-3 sm:col-span-2">
                                                        <Globe className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Endereço</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.address}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Membro desde sempre visível */}
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Membro desde</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {format(new Date(profile.created_at), 'MMMM yyyy', { locale: ptBR })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                            
                                            {/* Informações de contato liberadas */}
                                            <div className="border-t border-gray-200 pt-4">
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm font-medium text-green-800">
                                                            Informações de contato liberadas após avaliação mútua
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Telefone liberado */}
                                                    {profile.phone && (
                                                        <div className="flex items-center space-x-3">
                                                            <Phone className="w-5 h-5 text-gray-400" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Telefone</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{profile.phone}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Email liberado */}
                                                    {profile.email && (
                                                        <div className="flex items-center space-x-3">
                                                            <Mail className="w-5 h-5 text-gray-400" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {(!profile.phone && !profile.email) && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                                        Este usuário não disponibilizou informações de contato.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="services" className="space-y-6">
                            {isProfessional ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Briefcase className="w-5 h-5" />
                                            <span>Serviços Oferecidos</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {profile.professional_services && profile.professional_services.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {profile.professional_services.map((service, index) => (
                                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <span className="text-gray-900 dark:text-white">{service}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 dark:text-gray-400">Nenhum serviço informado.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <User className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cliente</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não oferece serviços.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="portfolio" className="space-y-6">
                            {isProfessional ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <ImageIcon className="w-5 h-5" />
                                            <span>Portfólio</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {portfolioLoading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando portfólio...</p>
                                            </div>
                                        ) : portfolioProjects && portfolioProjects.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {portfolioProjects.map((project) => (
                                                    <div key={project.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
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
                                            <p className="text-gray-600 dark:text-gray-400">Nenhum projeto no portfólio.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <User className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cliente</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Este usuário é um cliente e não possui portfólio.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="reviews" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Star className="w-5 h-5" />
                                        <span>Avaliações</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reviewsLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando avaliações...</p>
                                        </div>
                                    ) : reviews && reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map((review) => (
                                                <ReviewCard 
                                                    key={review.id} 
                                                    review={review} 
                                                    currentUserId={user?.id}
                                                    profileOwnerId={userId}
                                                    onDelete={handleDeleteReview}
                                                    onRespond={respondToReview}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400">Nenhuma avaliação encontrada.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    )
}