'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Star, 
  MessageCircle, 
  Shield, 
  Users,
  Heart,
  MoreHorizontal,
  Eye
} from 'lucide-react'
import { RecommendationButton } from '@/components/ui/RecommendationButton'
import { Profile } from '@/types/database'
import { SearchFilters } from './AdvancedSearchFilters'
import Link from 'next/link'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

interface SearchResultsProps {
  users: Profile[]
  filters: SearchFilters
  loading: boolean
  onContact: (user: Profile) => void
  onViewProfile: (userId: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  users,
  filters,
  loading,
  onContact,
  onViewProfile,
  viewMode,
  onViewModeChange
}) => {
  const [favoriteUsers, setFavoriteUsers] = useState<Set<string>>(new Set())

  const toggleFavorite = (userId: string) => {
    setFavoriteUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 text-yellow-500 fill-current opacity-50" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />)
    }

    return stars
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.category !== 'all') count++
    if (filters.state) count++
    if (filters.city) count++
    if (filters.userType !== 'all') count++
    if (filters.minRating > 0) count++
    if (filters.maxRating < 5) count++
    if (filters.verifiedOnly) count++
    if (filters.availableOnly) count++
    if (filters.experienceYears > 0) count++
    if (filters.hasPortfolio) count++
    if (filters.hasReviews) count++
    return count
  }

  const UserCard = ({ user }: { user: Profile }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 rounded-lg border border-border hover:border-primary/20 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={user.avatar_url || ''} alt={user.full_name || 'Usuário'} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {(user.full_name || 'N').charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            {/* Nome e Verificação */}
            <div className="flex items-center gap-2 mb-1">
              <Link 
                href={`/perfil/${user.id}`}
                className="font-medium text-foreground hover:text-primary transition-colors truncate"
              >
                {user.full_name || 'Nome não informado'}
              </Link>
              {user.is_verified && (
                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>

            {/* Tipo de Usuário */}
            <div className="mb-2">
              <Badge 
                variant={user.user_type === 'professional' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {user.user_type === 'professional' ? 'Profissional' : 'Cliente'}
              </Badge>
            </div>

            {/* Localização */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {user.location_city && user.location_state 
                  ? `${user.location_city}, ${user.location_state}`
                  : user.location_city || user.location_state || 'Localização não informada'
                }
              </span>
            </div>

            {/* Serviços (apenas para profissionais) */}
            {user.user_type === 'professional' && user.professional_services && user.professional_services.length > 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {user.professional_services.slice(0, 2).map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {user.professional_services.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.professional_services.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Avaliação */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {renderStars(user.rating || 0)}
              </div>
              <span className="text-sm font-medium">
                {user.rating ? user.rating.toFixed(1) : '0.0'}
              </span>
              <span className="text-sm text-muted-foreground">
                ({user.total_reviews || 0} avaliações)
              </span>
            </div>

            {/* Bio (apenas uma linha) */}
            {user.bio && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                {user.bio}
              </p>
            )}

            {/* Ações */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onContact(user)}
                size="sm"
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Conversar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(user.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleFavorite(user.id)}>
                    <Heart className="h-4 w-4 mr-2" />
                    {favoriteUsers.has(user.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewProfile(user.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Perfil Completo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const UserGridCard = ({ user }: { user: Profile }) => (
    <Card className="group hover:shadow-md transition-all duration-300 rounded-lg border border-border hover:border-primary/20 overflow-hidden">
      <CardContent className="p-3">
        <div className="text-center">
          {/* Avatar */}
          <Avatar className="w-16 h-16 mx-auto mb-3">
            <AvatarImage src={user.avatar_url || ''} alt={user.full_name || 'Usuário'} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {(user.full_name || 'N').charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Nome */}
          <Link 
            href={`/perfil/${user.id}`}
            className="font-medium text-foreground hover:text-primary transition-colors block mb-1 line-clamp-1"
          >
            {user.full_name || 'Nome não informado'}
          </Link>

          {/* Tipo de Usuário */}
          <div className="mb-2">
            <Badge 
              variant={user.user_type === 'professional' ? 'default' : 'secondary'} 
              className="text-xs"
            >
              {user.user_type === 'professional' ? 'Profissional' : 'Cliente'}
            </Badge>
          </div>

          {/* Localização */}
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">
              {user.location_city || 'Cidade'}
            </span>
          </div>

          {/* Verificação */}
          {user.is_verified && (
            <div className="flex items-center justify-center gap-1 text-xs text-primary mb-2">
              <Shield className="h-3 w-3" />
              <span>Verificado</span>
            </div>
          )}

          {/* Avaliação */}
          <div className="flex items-center justify-center gap-1 mb-3">
            <div className="flex items-center gap-1">
              {renderStars(user.rating || 0)}
            </div>
            <span className="text-xs font-medium">
              {user.rating ? user.rating.toFixed(1) : '0.0'}
            </span>
          </div>

          {/* Serviço Principal (apenas para profissionais) */}
          {user.user_type === 'professional' && user.professional_services && user.professional_services.length > 0 && (
            <div className="mb-3">
              <Badge variant="outline" className="text-xs">
                {user.professional_services[0]}
              </Badge>
            </div>
          )}

          {/* Ações */}
          <div className="space-y-2">
            <Button
              onClick={() => onContact(user)}
              size="sm"
              className="w-full"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Conversar
            </Button>
            
            <RecommendationButton
              userId={user.id}
              size="sm"
              variant="outline"
              showCount={true}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Carregando resultados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header dos Resultados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            <span className="font-semibold text-primary">{users.length}</span> usuário{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}
          </p>
          
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFiltersCount()} filtro{getActiveFiltersCount() !== 1 ? 's' : ''} ativo{getActiveFiltersCount() !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Controles de Visualização */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Lista de Usuários */}
      {users.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            : "space-y-4"
        }>
          {users.map((user) => (
            viewMode === 'grid' ? (
              <UserGridCard key={user.id} user={user} />
            ) : (
              <UserCard key={user.id} user={user} />
            )
          ))}
        </div>
      ) : (
        /* Estado Vazio */
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Tente ajustar os filtros ou usar termos de busca diferentes para encontrar mais resultados.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-gray-300 hover:bg-gray-50"
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}
