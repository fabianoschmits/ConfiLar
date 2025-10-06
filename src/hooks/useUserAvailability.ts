'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UserAvailabilityState {
  isAvailable: boolean | null
  loading: boolean
  error: string | null
}

export function useUserAvailability(userId: string): UserAvailabilityState {
  const [state, setState] = useState<UserAvailabilityState>({
    isAvailable: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!userId) {
      setState({
        isAvailable: null,
        loading: false,
        error: null
      })
      return
    }

    const fetchUserAvailability = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        const { data, error } = await supabase
          .from('profiles')
          .select('is_available')
          .eq('id', userId)
          .single()

        if (error) {
          throw error
        }

        setState({
          isAvailable: data?.is_available || false,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Erro ao buscar disponibilidade do usuário:', error)
        setState({
          isAvailable: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    fetchUserAvailability()
  }, [userId])

  return state
}
