'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  User, 
  Briefcase, 
  MapPin, 
  Star, 
  MessageCircle, 
  Calendar,
  Users,
  Loader2,
  AlertCircle,
  Eye,
  TrendingUp,
  CheckCircle
} from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuthContext } from '@/contexts/AuthContext'
import { FavoriteListSkeleton } from '@/components/ui/skeleton'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { useRouter } from 'next/navigation'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'professionals' | 'clients'>('all')
  const { user, profile } = useAuthContext()
  const router = useRouter()
  const { openChat } = useFloatingChat()
  const { 
    favorites, 
    loading, 
    error, 
    getFavoritesByType, 
    getFavoritesStats 
  } = useFavorites()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const stats = getFavoritesStats()
  const professionalFavorites = getFavoritesByType('professional')
  const clientFavorites = getFavoritesByType('client')

  // Filtrar favoritos baseado na aba ativa
  const getFilteredFavorites = () => {
    switch (activeTab) {
      case 'professionals':
        return professionalFavorites
      case 'clients':
        return clientFavorites
      default:
        return favorites
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
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

  const handleViewProfile = (userId: string) => {
    router.push(`/perfil/${userId}`)
  }

  const handleStartChat = async (userId: string, userName: string) => {
    if (!user) {
      router.push('/auth')
      return
    }
    
    console.log('💬 Iniciando chat com favorito:', { userId, userName })
    
    try {
      // Usar chat flutuante para iniciar conversa diretamente
      await openChat(userId, userName)
      console.log('✅ Chat iniciado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao iniciar chat:', error)
    }
  }

  if (!user) {
    return (
      <MainLayout requireAuth={false}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Faça Login para Ver Seus Favoritos
              </h2>
              <p className="text-gray-600 mb-6">
                Você precisa estar logado para acessar sua lista de favoritos.
              </p>
              <Button asChild>
                <a href="/auth">Fazer Login</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header da Página */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="h-8 w-8 text-red-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meus Favoritos</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Pessoas que você adicionou aos seus favoritos
              </p>
            </div>

            {/* Estatísticas Compactas */}
            <Card className="mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
              <CardContent className="py-2 px-3 sm:py-3 sm:px-4">
                <div className="flex flex-row items-center justify-around gap-1 sm:gap-2">
                  {/* Total de Favoritos */}
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Total</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.totalFavorites}</p>
                  </div>
                  
                  {/* Profissionais */}
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Profissionais</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.professionalFavorites}</p>
                  </div>
                  
                  {/* Clientes */}
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Clientes</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.clientFavorites}</p>
                  </div>
                  
                  {/* Ativos */}
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 mb-0.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Ativos</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.totalFavorites}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estados de Loading e Erro */}
          {loading && (
            <FavoriteListSkeleton count={6} />
          )}

          {error && (
            <ErrorState
              title="Erro ao carregar favoritos"
              message={error}
              onRetry={() => window.location.reload()}
              showHomeButton={false}
              variant="default"
            />
          )}

          {/* Abas de Filtro */}
          {!loading && !error && favorites.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Todos</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {stats.totalFavorites}
                  </Badge>
                </button>
                
                <button
                  onClick={() => setActiveTab('professionals')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'professionals'
                      ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Profissionais</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {stats.professionalFavorites}
                  </Badge>
                </button>
                
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'clients'
                      ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Clientes</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {stats.clientFavorites}
                  </Badge>
                </button>
              </div>
            </div>
          )}

          {/* Lista de Favoritos */}
          {!loading && !error && (
            <>
              {favorites.length === 0 ? (
                <EmptyState
                  icon={<Heart className="h-16 w-16 text-gray-400" />}
                  title="Nenhum favorito ainda"
                  description="Comece adicionando pessoas aos seus favoritos para encontrá-las facilmente depois."
                  action={{
                    label: 'Buscar Profissionais',
                    onClick: () => router.push('/buscar')
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {getFilteredFavorites().map((favorite) => (
                    <Card 
                      key={favorite.id} 
                      className={`hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 ${
                        favorite.professional?.user_type === 'professional' 
                          ? 'hover:shadow-blue-100 dark:hover:shadow-blue-900/20' 
                          : 'hover:shadow-gray-100 dark:hover:shadow-gray-900/20'
                      }`}
                    >
                      <CardContent className="p-3 sm:p-4">
                        {/* Header do Card com Avatar e Info do Usuário */}
                        <div className="flex items-start space-x-3 mb-3">
                          <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-gray-700 shadow-md">
                            <AvatarImage src={favorite.professional?.avatar_url} alt={`Avatar de ${favorite.professional?.full_name}`} />
                            <AvatarFallback className={`font-medium ${
                              favorite.professional?.user_type === 'professional' 
                                ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}>
                              {favorite.professional?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {favorite.professional?.full_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline"
                                className={`text-xs ${
                                  favorite.professional?.user_type === 'professional' 
                                    ? 'border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700' 
                                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
                                }`}
                              >
                                {favorite.professional?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                              </Badge>
                              {favorite.professional?.is_verified && (
                                <Badge className="bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                                  Verificado
                                </Badge>
                              )}
                            </div>
                          </div>
                          <FavoriteButton 
                            userId={favorite.professional?.id || ''}
                            userName={favorite.professional?.full_name || ''}
                            size="sm"
                            variant="ghost"
                          />
                        </div>

                        {/* Conteúdo do Card */}
                        <div className="mb-3">
                          {favorite.professional?.bio && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                              {favorite.professional.bio}
                            </p>
                          )}
                          
                          <div className="space-y-1">
                            {(favorite.professional?.location_city || favorite.professional?.location_state) && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <MapPin className="h-3 w-3 mr-1" />
                                {favorite.professional?.location_city}
                                {favorite.professional?.location_city && favorite.professional?.location_state && ', '}
                                {favorite.professional?.location_state}
                              </div>
                            )}

                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Favoritado em {formatDate(favorite.created_at)}
                            </div>

                            {favorite.professional?.user_type === 'professional' && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Star className="h-3 w-3 mr-1" />
                                <div className="flex items-center gap-1">
                                  <span>{(favorite.professional?.rating || 0).toFixed(1)}</span>
                                  <div className="flex">{renderStars(favorite.professional?.rating || 0)}</div>
                                  <span>({favorite.professional?.total_reviews})</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer do Card */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewProfile(favorite.professional?.id || '')}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Perfil
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStartChat(favorite.professional?.id || '', favorite.professional?.full_name || '')}
                            className={`${
                              favorite.professional?.user_type === 'professional' 
                                ? 'bg-gray-700 hover:bg-gray-800' 
                                : 'bg-gray-500 hover:bg-gray-600'
                            } text-white`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
