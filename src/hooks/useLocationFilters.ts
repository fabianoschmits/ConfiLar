import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'

export interface LocationFilter {
  type: 'local' | 'state' | 'country' | 'all' | 'custom'
  city?: string
  state?: string
  country?: string
}

export interface LocationFilterOptions {
  showLocal: boolean
  showState: boolean
  showCountry: boolean
  showAll: boolean
}

export function useLocationFilters() {
  const { profile } = useAuthContext()
  const [currentFilter, setCurrentFilter] = useState<LocationFilter>({
    type: 'local',
    city: profile?.location_city,
    state: profile?.location_state,
    country: 'Brasil'
  })
  
  const [filterOptions, setFilterOptions] = useState<LocationFilterOptions>({
    showLocal: true,
    showState: true,
    showCountry: true,
    showAll: true
  })

  // Atualizar filtro quando o perfil mudar
  useEffect(() => {
    if (profile?.location_city && profile?.location_state) {
      setCurrentFilter({
        type: 'local',
        city: profile.location_city,
        state: profile.location_state,
        country: 'Brasil'
      })
    }
  }, [profile?.location_city, profile?.location_state])

  const setFilter = (filter: LocationFilter) => {
    setCurrentFilter(filter)
  }

  const getFilterLabel = (filter: LocationFilter): string => {
    switch (filter.type) {
      case 'local':
        return `${filter.city}, ${filter.state}`
      case 'state':
        return filter.state || 'Estado'
      case 'country':
        return filter.country || 'País'
      case 'all':
        return 'Todos os locais'
      case 'custom':
        return filter.city && filter.state ? `${filter.city}, ${filter.state}` : 'Escolher localização'
      default:
        return 'Filtro de localização'
    }
  }

  const getFilterIcon = (filter: LocationFilter): string => {
    switch (filter.type) {
      case 'local':
        return '🏠'
      case 'state':
        return '🏙️'
      case 'country':
        return '🌎'
      case 'all':
        return '🌍'
      case 'custom':
        return '🎯'
      default:
        return '📍'
    }
  }

  const getFilterDescription = (filter: LocationFilter): string => {
    switch (filter.type) {
      case 'local':
        return `Posts e notificações de ${filter.city}, ${filter.state}`
      case 'state':
        return `Posts e notificações de ${filter.state}`
      case 'country':
        return `Posts e notificações do ${filter.country}`
      case 'all':
        return 'Posts e notificações de todas as localizações'
      case 'custom':
        return filter.city && filter.state ? `Posts e notificações de ${filter.city}, ${filter.state}` : 'Escolha um estado e cidade específicos'
      default:
        return 'Filtro de localização'
    }
  }

  const getAvailableFilters = (): LocationFilter[] => {
    const filters: LocationFilter[] = []
    
    if (profile?.location_city && profile?.location_state) {
      filters.push({
        type: 'local',
        city: profile.location_city,
        state: profile.location_state,
        country: 'Brasil'
      })
    }
    
    if (profile?.location_state) {
      filters.push({
        type: 'state',
        state: profile.location_state,
        country: 'Brasil'
      })
    }
    
    filters.push({
      type: 'country',
      country: 'Brasil'
    })
    
    filters.push({
      type: 'all'
    })
    
    filters.push({
      type: 'custom'
    })
    
    return filters
  }

  const getQueryConditions = (filter: LocationFilter) => {
    switch (filter.type) {
      case 'local':
        return {
          location_city: filter.city,
          location_state: filter.state
        }
      case 'state':
        return {
          location_state: filter.state
        }
      case 'country':
        return {
          location_state: filter.country
        }
      case 'custom':
        if (filter.city && filter.state) {
          return {
            location_city: filter.city,
            location_state: filter.state
          }
        }
        return {}
      case 'all':
        return {}
      default:
        return {}
    }
  }

  const getPriorityOrder = (filter: LocationFilter) => {
    switch (filter.type) {
      case 'local':
        return [
          { location_city: filter.city, location_state: filter.state },
          { location_state: filter.state },
          {}
        ]
      case 'state':
        return [
          { location_state: filter.state },
          {}
        ]
      case 'country':
        return [
          { location_state: filter.country },
          {}
        ]
      case 'custom':
        if (filter.city && filter.state) {
          return [
            { location_city: filter.city, location_state: filter.state },
            { location_state: filter.state },
            {}
          ]
        }
        return [{}]
      case 'all':
        return [{}]
      default:
        return [{}]
    }
  }

  return {
    currentFilter,
    filterOptions,
    setFilter,
    getFilterLabel,
    getFilterIcon,
    getFilterDescription,
    getAvailableFilters,
    getQueryConditions,
    getPriorityOrder,
    isLocalFilter: currentFilter.type === 'local',
    isStateFilter: currentFilter.type === 'state',
    isCountryFilter: currentFilter.type === 'country',
    isAllFilter: currentFilter.type === 'all',
    isCustomFilter: currentFilter.type === 'custom'
  }
}
