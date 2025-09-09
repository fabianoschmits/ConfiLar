'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface HomeStats {
  professionalsCount: number
  reviewsCount: number
  citiesCount: number
  servicesCount: number
  loading: boolean
  error: string | null
}

export function useHomeStats(): HomeStats {
  const [stats, setStats] = useState<HomeStats>({
    professionalsCount: 0,
    reviewsCount: 0,
    citiesCount: 0,
    servicesCount: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar contagem de profissionais verificados
        const { count: professionalsCount, error: professionalsError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_type', 'professional')
          .eq('is_verified', true)

        if (professionalsError) throw professionalsError

        // Buscar contagem de avaliações
        const { count: reviewsCount, error: reviewsError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })

        if (reviewsError) throw reviewsError

        // Buscar contagem de cidades únicas
        const { data: citiesData, error: citiesError } = await supabase
          .from('profiles')
          .select('location_city')
          .not('location_city', 'is', null)

        if (citiesError) throw citiesError

        const uniqueCities = new Set(citiesData?.map(profile => profile.location_city) || [])
        const citiesCount = uniqueCities.size

        // Buscar contagem de serviços realizados (aproximação baseada em conversas com acordos aceitos)
        const { count: servicesCount, error: servicesError } = await supabase
          .from('contact_agreements')
          .select('*', { count: 'exact', head: true })
          .in('status', ['accepted', 'completed'])

        if (servicesError) throw servicesError

        setStats({
          professionalsCount: professionalsCount || 0,
          reviewsCount: reviewsCount || 0,
          citiesCount,
          servicesCount: servicesCount || 0,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar estatísticas'
        }))
      }
    }

    fetchStats()
  }, [])

  return stats
}

// Função auxiliar para formatar números
export function formatStatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k+`
  }
  return num.toString()
}
