import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getEstadoBySigla } from '@/lib/ibge'

// Função para mapear código de país para nome
function getCountryName(countryCode: string | null | undefined): string {
  if (!countryCode) return 'Brasil' // Default
  const countryMap: Record<string, string> = {
    'BR': 'Brasil',
    'US': 'United States',
    'CA': 'Canada',
    'MX': 'Mexico',
    'GB': 'United Kingdom',
    'AU': 'Australia'
  }
  return countryMap[countryCode] || 'Brasil'
}

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
  const { profile, user } = useAuthContext()
  const [currentFilter, setCurrentFilter] = useState<LocationFilter>({
    type: 'local',
    city: profile?.location_city,
    state: profile?.location_state,
    country: getCountryName(profile?.country)
  })
  
  const [filterOptions, setFilterOptions] = useState<LocationFilterOptions>({
    showLocal: true,
    showState: true,
    showCountry: true,
    showAll: true
  })

  // Carregar preferências salvas do perfil
  useEffect(() => {
    const loadSavedPreferences = async () => {
      if (!user?.id || !profile) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('feed_location_filter_type, feed_location_filter_city, feed_location_filter_state, feed_location_filter_country')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar preferências:', error)
          return
        }

        if (data?.feed_location_filter_type) {
          const filterType = data.feed_location_filter_type as LocationFilter['type']
          
          // IMPORTANTE: Se o tipo for 'all', não carregar nenhum valor de localização
          if (filterType === 'all') {
            console.log('📋 [useLocationFilters] Carregando filtro "all" - sem valores de localização')
            setCurrentFilter({
              type: 'all',
              city: undefined,
              state: undefined,
              country: undefined
            })
            return // Sair cedo para não processar valores de localização
          }
          
          // IMPORTANTE: Usar o país salvo no filtro, não o país do perfil
          // Isso garante que quando o usuário muda o país no filtro, ele seja mantido após recarregar
          const savedCountry = data.feed_location_filter_country || (profile as any)?.country
          const countryName = getCountryName(savedCountry)
          
          // Normalizar estado: converter sigla para nome completo se necessário
          // IMPORTANTE: Para países que não são Brasil (ex: US), o estado pode estar salvo como código
          // Nesse caso, não tentar converter usando IBGE
          let normalizedState = data.feed_location_filter_state || profile.location_state
          if (normalizedState && savedCountry === 'BR' && normalizedState.length === 2) {
            // É uma sigla do Brasil, converter para nome completo
            try {
              const estado = await getEstadoBySigla(normalizedState)
              if (estado) {
                normalizedState = estado.nome
              }
            } catch (error) {
              console.error('Erro ao normalizar estado ao carregar:', error)
            }
          }
          // Para outros países (ex: US), manter o estado como está (pode ser código ou nome)
          
          console.log('📋 [useLocationFilters] Carregando filtro salvo:', {
            type: filterType,
            city: data.feed_location_filter_city,
            state: normalizedState,
            savedCountry,
            countryName
          })
          
          setCurrentFilter({
            type: filterType,
            city: data.feed_location_filter_city || profile.location_city,
            state: normalizedState,
            country: countryName
          })
        } else if (profile?.location_city && profile?.location_state) {
          // Normalizar estado do perfil: converter sigla para nome completo se necessário
          let normalizedState = profile.location_state
          if (normalizedState && normalizedState.length === 2) {
            // É uma sigla, converter para nome completo
            try {
              const estado = await getEstadoBySigla(normalizedState)
              if (estado) {
                normalizedState = estado.nome
              }
            } catch (error) {
              console.error('Erro ao normalizar estado do perfil:', error)
            }
          }
          
          // Se não houver preferência salva, usar cidade do perfil como padrão
          setCurrentFilter({
            type: 'local',
            city: profile.location_city,
            state: normalizedState,
            country: getCountryName((profile as any)?.country)
          })
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
        // Fallback para cidade do perfil
        if (profile?.location_city && profile?.location_state) {
          // Normalizar estado: converter sigla para nome completo se necessário
          // IMPORTANTE: Apenas para Brasil
          const profileCountry = (profile as any)?.country || 'BR'
          let normalizedState = profile.location_state
          if (normalizedState && profileCountry === 'BR' && normalizedState.length === 2) {
            try {
              const estado = await getEstadoBySigla(normalizedState)
              if (estado) {
                normalizedState = estado.nome
              }
            } catch (error) {
              console.error('Erro ao normalizar estado no fallback:', error)
            }
          }
          
          setCurrentFilter({
            type: 'local',
            city: profile.location_city,
            state: normalizedState,
            country: getCountryName(profileCountry)
          })
        }
      }
    }

    if (user?.id && profile) {
      loadSavedPreferences()
    }
  }, [user?.id, profile])

  // Atualizar filtro quando o perfil mudar (apenas se não houver preferência salva)
  useEffect(() => {
    if (profile?.location_city && profile?.location_state && currentFilter.type === 'local' && !currentFilter.city) {
      // Normalizar estado: converter sigla para nome completo se necessário
      const normalizeState = async () => {
        let normalizedState = profile.location_state
        if (normalizedState && normalizedState.length === 2) {
          try {
            const estado = await getEstadoBySigla(normalizedState)
            if (estado) {
              normalizedState = estado.nome
            }
          } catch (error) {
            console.error('Erro ao normalizar estado:', error)
          }
        }
        
        setCurrentFilter({
          type: 'local',
          city: profile.location_city,
          state: normalizedState,
          country: getCountryName(profile.country)
        })
      }
      
      normalizeState()
    }
  }, [profile?.location_city, profile?.location_state, currentFilter.type, currentFilter.city])

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
        country: getCountryName(profile.country)
      })
    }
    
    if (profile?.location_state) {
      filters.push({
        type: 'state',
        state: profile.location_state,
        country: getCountryName(profile.country)
      })
    }
    
    filters.push({
      type: 'country',
      country: getCountryName((profile as any)?.country)
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
