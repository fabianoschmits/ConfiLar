'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Eye
} from 'lucide-react'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeIn } from '@/components/animations/FadeIn'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/hooks/useAuth'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { useRouter } from 'next/navigation'
import { useFloatingChat } from '@/contexts/FloatingChatContext'

export default function FavoritesPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { openChat } = useFloatingChat()
  const { 
    favorites, 
    loading, 
    error, 
    getFavoritesByType, 
    getFavoritesStats 
  } = useFavorites()

  const stats = getFavoritesStats()
  const professionalFavorites = getFavoritesByType('professional')
  const clientFavorites = getFavoritesByType('client')

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
        <PageTransition>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <FadeIn>
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
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
            </FadeIn>
          </div>
        </PageTransition>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <FadeIn>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
                  <p className="text-gray-600">
                    Pessoas que você adicionou aos seus favoritos
                  </p>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.totalFavorites}</div>
                    <div className="text-sm text-gray-600">Total de Favoritos</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.professionalFavorites}</div>
                    <div className="text-sm text-gray-600">Profissionais</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.clientFavorites}</div>
                    <div className="text-sm text-gray-600">Clientes</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>

          {/* Estados de Loading e Erro */}
          {loading && (
            <FadeIn>
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-red-600 mb-4" />
                  <p className="text-gray-600">Carregando seus favoritos...</p>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {error && (
            <FadeIn>
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Tentar Novamente
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Lista de Favoritos */}
          {!loading && !error && (
            <>
              {favorites.length === 0 ? (
                <FadeIn>
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Nenhum favorito ainda
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Comece adicionando pessoas aos seus favoritos para encontrá-las facilmente depois.
                      </p>
                      <Button asChild>
                        <a href="/buscar">Buscar Profissionais</a>
                      </Button>
                    </CardContent>
                  </Card>
                </FadeIn>
              ) : (
                <Tabs defaultValue="all" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Todos ({stats.totalFavorites})
                    </TabsTrigger>
                    <TabsTrigger value="professionals" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Profissionais ({stats.professionalFavorites})
                    </TabsTrigger>
                    <TabsTrigger value="clients" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Clientes ({stats.clientFavorites})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favorites.map((favorite, index) => (
                        <FadeIn key={favorite.id} delay={index * 0.1}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4 mb-4">
                                <UserAvatar
                                  src={favorite.professional?.avatar_url}
                                  alt={favorite.professional?.full_name}
                                  fallback={favorite.professional?.full_name?.charAt(0) || 'U'}
                                  size="md"
                                  className="w-12 h-12"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {favorite.professional?.full_name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs capitalize"
                                    >
                                      {favorite.professional?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                                    </Badge>
                                    {favorite.professional?.is_verified && (
                                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
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

                              {favorite.professional?.bio && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {favorite.professional.bio}
                                </p>
                              )}

                              <div className="space-y-2 mb-4">
                                {(favorite.professional?.location_city || favorite.professional?.location_state) && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {favorite.professional?.location_city}
                                      {favorite.professional?.location_city && favorite.professional?.location_state && ', '}
                                      {favorite.professional?.location_state}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  <span>Favoritado em {formatDate(favorite.created_at)}</span>
                                </div>

                                {favorite.professional?.user_type === 'professional' && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Star className="h-4 w-4" />
                                    <div className="flex items-center gap-1">
                                      <span>{(favorite.professional?.rating || 0).toFixed(1)}</span>
                                      <div className="flex">{renderStars(favorite.professional?.rating || 0)}</div>
                                      <span>({favorite.professional?.total_reviews})</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleViewProfile(favorite.professional?.id || '')}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Perfil
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStartChat(favorite.professional?.id || '', favorite.professional?.full_name || '')}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </FadeIn>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="professionals" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {professionalFavorites.map((favorite, index) => (
                        <FadeIn key={favorite.id} delay={index * 0.1}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4 mb-4">
                                <UserAvatar
                                  src={favorite.professional?.avatar_url}
                                  alt={favorite.professional?.full_name}
                                  fallback={favorite.professional?.full_name?.charAt(0) || 'U'}
                                  size="md"
                                  className="w-12 h-12"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {favorite.professional?.full_name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={`${getBadgeColor(favorite.professional?.badge || 'bronze')} text-xs`}>
                                      {getBadgeName(favorite.professional?.badge || 'bronze')}
                                    </Badge>
                                    {favorite.professional?.is_verified && (
                                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
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

                              {favorite.professional?.bio && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {favorite.professional.bio}
                                </p>
                              )}

                              {favorite.professional?.professional_services && favorite.professional.professional_services.length > 0 && (
                                <div className="mb-3">
                                  <div className="flex flex-wrap gap-1">
                                    {favorite.professional.professional_services.slice(0, 3).map((service, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {service}
                                      </Badge>
                                    ))}
                                    {favorite.professional.professional_services.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{favorite.professional.professional_services.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2 mb-4">
                                {(favorite.professional?.location_city || favorite.professional?.location_state) && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {favorite.professional?.location_city}
                                      {favorite.professional?.location_city && favorite.professional?.location_state && ', '}
                                      {favorite.professional?.location_state}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Star className="h-4 w-4" />
                                  <div className="flex items-center gap-1">
                                    <span>{(favorite.professional?.rating || 0).toFixed(1)}</span>
                                    <div className="flex">{renderStars(favorite.professional?.rating || 0)}</div>
                                    <span>({favorite.professional?.total_reviews})</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleViewProfile(favorite.professional?.id || '')}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Perfil
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStartChat(favorite.professional?.id || '', favorite.professional?.full_name || '')}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </FadeIn>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="clients" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {clientFavorites.map((favorite, index) => (
                        <FadeIn key={favorite.id} delay={index * 0.1}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4 mb-4">
                                <UserAvatar
                                  src={favorite.professional?.avatar_url}
                                  alt={favorite.professional?.full_name}
                                  fallback={favorite.professional?.full_name?.charAt(0) || 'U'}
                                  size="md"
                                  className="w-12 h-12"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {favorite.professional?.full_name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      Cliente
                                    </Badge>
                                    {favorite.professional?.is_verified && (
                                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
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

                              {favorite.professional?.bio && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {favorite.professional.bio}
                                </p>
                              )}

                              <div className="space-y-2 mb-4">
                                {(favorite.professional?.location_city || favorite.professional?.location_state) && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {favorite.professional?.location_city}
                                      {favorite.professional?.location_city && favorite.professional?.location_state && ', '}
                                      {favorite.professional?.location_state}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  <span>Favoritado em {formatDate(favorite.created_at)}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleViewProfile(favorite.professional?.id || '')}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Perfil
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStartChat(favorite.professional?.id || '', favorite.professional?.full_name || '')}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </FadeIn>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </div>
      </PageTransition>
    </MainLayout>
  )
}
