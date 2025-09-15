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
import { useFavorites } from '@/hooks/useFavorites'
import { useOpenMessages } from '@/hooks/useOpenMessages'
import { useProfileViews } from '@/hooks/useProfileViews'
import { AvailabilityIndicator } from '@/components/ui/AvailabilityIndicator'

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
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites()
  const { openMessages } = useOpenMessages()
  const { recordView } = useProfileViews()

  const handleToggleFavorite = async (userId: string) => {
    await toggleFavorite(userId)
  }

  const handleViewProfile = async (userId: string) => {
    // Registrar visualização antes de navegar
    await recordView(userId)
    onViewProfile(userId)
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
    <div className="group bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Avatar Brutalista */}
          <div className="p-2 sm:p-3 bg-black border-2 border-black mx-auto sm:mx-0">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarImage src={user.avatar_url || ''} alt={user.full_name || 'Usuário'} />
              <AvatarFallback className="bg-yellow-400 text-black font-black text-lg sm:text-xl">
                {(user.full_name || 'N').charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            {/* Nome e Verificação */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <Link 
                href={`/perfil/${user.id}`}
                className="font-black text-black hover:text-red-500 transition-colors text-base sm:text-lg text-center sm:text-left"
              >
                {(user.full_name || 'NOME NÃO INFORMADO').toUpperCase()}
              </Link>
              {user.is_verified && (
                <div className="p-1 bg-green-500 text-white border border-black mx-auto sm:mx-0 w-fit">
                  <Shield className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Tipo de Usuário e Disponibilidade */}
            <div className="mb-3 text-center sm:text-left flex flex-col sm:flex-row items-center gap-2">
              <span className={`px-3 py-1 text-xs font-black border-2 border-black ${
                user.user_type === 'professional' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {user.user_type === 'professional' ? 'PROFISSIONAL' : 'CLIENTE'}
              </span>
              <AvailabilityIndicator 
                isAvailable={user.is_available} 
                size="sm" 
                showText={true}
              />
            </div>

            {/* Localização */}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-gray-700 mb-3">
              <MapPin className="h-4 w-4" />
              <span className="text-center sm:text-left">
                {user.location_city && user.location_state 
                  ? `${user.location_city.toUpperCase()}, ${user.location_state}`
                  : 'LOCALIZAÇÃO NÃO INFORMADA'
                }
              </span>
            </div>

            {/* Serviços (apenas para profissionais) */}
            {user.user_type === 'professional' && user.professional_services && user.professional_services.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-black text-black mb-2 text-center sm:text-left">SERVIÇOS OFERECIDOS:</div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {user.professional_services.slice(0, 3).map((service, index) => (
                    <span key={index} className="px-2 py-1 text-xs font-black bg-yellow-400 text-black border border-black">
                      {service.toUpperCase()}
                    </span>
                  ))}
                  {user.professional_services.length > 3 && (
                    <span className="px-2 py-1 text-xs font-black bg-red-500 text-white border border-black">
                      +{user.professional_services.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Avaliação */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
              <div className="flex items-center gap-1">
                {renderStars(user.rating || 0)}
              </div>
              <span className="text-sm font-black text-black">
                {user.rating ? user.rating.toFixed(1) : '0.0'}
              </span>
              <span className="text-sm font-bold text-gray-700">
                ({user.total_reviews || 0} AVALIAÇÕES)
              </span>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm font-medium text-black mb-4 line-clamp-2 text-center sm:text-left">
                {user.bio}
              </p>
            )}

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs font-bold">
              {user.professional_experience_years && (
                <div className="bg-gray-100 p-2 border border-black">
                  <div className="text-gray-700">EXPERIÊNCIA:</div>
                  <div className="text-black">{user.professional_experience_years} ANOS</div>
                </div>
              )}
              {user.professional_certifications && user.professional_certifications.length > 0 && (
                <div className="bg-green-100 p-2 border border-black">
                  <div className="text-gray-700">CERTIFICAÇÕES:</div>
                  <div className="text-black">{user.professional_certifications.length}</div>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => openMessages(user.id, user.full_name || 'Usuário')}
                className="w-full sm:flex-1 py-3 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm"
              >
                <MessageCircle className="h-4 w-4 mr-2 inline" />
                CONVERSAR
              </button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleViewProfile(user.id)}
                  className="flex-1 sm:flex-none py-3 px-4 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm"
                >
                  <Eye className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleToggleFavorite(user.id)}
                  className="flex-1 sm:flex-none py-3 px-4 bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm"
                >
                  <Heart className={`h-4 w-4 ${isFavorite(user.id) ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const UserGridCard = ({ user }: { user: Profile }) => (
    <div className="group bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 overflow-hidden h-full">
      <div className="p-4 h-full flex flex-col">
        <div className="text-center flex-1">
          {/* Avatar Brutalista */}
          <div className="p-2 bg-black border-2 border-black mx-auto mb-3 w-fit">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarImage src={user.avatar_url || ''} alt={user.full_name || 'Usuário'} />
              <AvatarFallback className="bg-yellow-400 text-black font-black text-lg sm:text-xl">
                {(user.full_name || 'N').charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Nome */}
          <Link 
            href={`/perfil/${user.id}`}
            className="font-black text-black hover:text-red-500 transition-colors block mb-2 text-sm sm:text-base leading-tight"
          >
            {(user.full_name || 'NOME NÃO INFORMADO').toUpperCase()}
          </Link>

          {/* Tipo de Usuário e Disponibilidade */}
          <div className="mb-2 flex flex-col items-center gap-1">
            <span className={`px-2 py-1 text-xs font-black border-2 border-black ${
              user.user_type === 'professional' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-500 text-white'
            }`}>
              {user.user_type === 'professional' ? 'PROFISSIONAL' : 'CLIENTE'}
            </span>
            <AvailabilityIndicator 
              isAvailable={user.is_available} 
              size="sm" 
              showText={true}
            />
          </div>

          {/* Verificação */}
          {user.is_verified && (
            <div className="flex items-center justify-center gap-1 text-xs font-black text-green-600 mb-2">
              <Shield className="h-3 w-3" />
              <span>VERIFICADO</span>
            </div>
          )}

          {/* Localização */}
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-gray-700 mb-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {user.location_city ? user.location_city.toUpperCase() : 'CIDADE'}
            </span>
          </div>

          {/* Avaliação */}
          <div className="flex items-center justify-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {renderStars(user.rating || 0)}
            </div>
            <span className="text-xs font-black text-black">
              {user.rating ? user.rating.toFixed(1) : '0.0'}
            </span>
          </div>

          {/* Serviço Principal (apenas para profissionais) */}
          {user.user_type === 'professional' && user.professional_services && user.professional_services.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-black text-black mb-1">SERVIÇO:</div>
              <span className="px-2 py-1 text-xs font-black bg-yellow-400 text-black border border-black block truncate">
                {user.professional_services[0].toUpperCase()}
              </span>
            </div>
          )}

          {/* Informações Adicionais Compactas */}
          <div className="grid grid-cols-1 gap-1 mb-3 text-xs font-bold">
            {user.professional_experience_years && (
              <div className="bg-gray-100 p-1 border border-black">
                <div className="text-gray-700 text-xs">EXP:</div>
                <div className="text-black text-xs">{user.professional_experience_years}A</div>
              </div>
            )}
            {user.professional_certifications && user.professional_certifications.length > 0 && (
              <div className="bg-green-100 p-1 border border-black">
                <div className="text-gray-700 text-xs">CERT:</div>
                <div className="text-black text-xs">{user.professional_certifications.length}</div>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-2 mt-auto">
          <button
            onClick={() => openMessages(user.id, user.full_name || 'Usuário')}
            className="w-full py-2 bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1 inline" />
            CONVERSAR
          </button>
          
          <div className="flex gap-1">
            <button
              onClick={() => handleViewProfile(user.id)}
              className="flex-1 py-1.5 bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xs"
            >
              <Eye className="h-3 w-3 mr-1 inline" />
              VER
            </button>
            
            <button
              onClick={() => handleToggleFavorite(user.id)}
              className="flex-1 py-1.5 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xs"
            >
              <Heart className={`h-3 w-3 mr-1 inline ${isFavorite(user.id) ? 'fill-white' : ''}`} />
              FAV
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-3" />
          <p className="text-black font-black">CARREGANDO RESULTADOS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header dos Resultados Brutalista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-black font-black">
            <span className="text-red-500">{users.length}</span> USUÁRIO{users.length !== 1 ? 'S' : ''} ENCONTRADO{users.length !== 1 ? 'S' : ''}
          </p>
          
          {getActiveFiltersCount() > 0 && (
            <span className="px-3 py-1 text-xs font-black bg-yellow-400 text-black border-2 border-black">
              {getActiveFiltersCount()} FILTRO{getActiveFiltersCount() !== 1 ? 'S' : ''} ATIVO{getActiveFiltersCount() !== 1 ? 'S' : ''}
            </span>
          )}
        </div>

        {/* Controles de Visualização Brutalistas */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-4 py-2 font-black text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
              viewMode === 'grid' 
                ? 'bg-black text-yellow-400' 
                : 'bg-white text-black hover:bg-yellow-400'
            }`}
          >
            GRID
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-4 py-2 font-black text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
              viewMode === 'list' 
                ? 'bg-black text-yellow-400' 
                : 'bg-white text-black hover:bg-yellow-400'
            }`}
          >
            LISTA
          </button>
        </div>
      </div>

      {/* Lista de Usuários */}
      {users.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4"
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
        /* Estado Vazio Brutalista */
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-black border-8 border-black flex items-center justify-center mx-auto mb-6">
            <Users className="h-16 w-16 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-black text-black mb-4">
            NENHUM USUÁRIO ENCONTRADO
          </h3>
          <p className="text-black font-bold mb-8 max-w-md mx-auto">
            TENTE AJUSTAR OS FILTROS OU USAR TERMOS DE BUSCA DIFERENTES PARA ENCONTRAR MAIS RESULTADOS.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-red-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-lg"
          >
            LIMPAR FILTROS
          </button>
        </div>
      )}
    </div>
  )
}
