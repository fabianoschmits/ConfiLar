'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export interface AvailabilityState {
  isAvailable: boolean
  loading: boolean
  error: string | null
}

export const useAvailability = () => {
  const { user, profile } = useAuthContext()
  const [state, setState] = useState<AvailabilityState>({
    isAvailable: false,
    loading: true,
    error: null
  })

  // Carregar estado inicial da disponibilidade
  useEffect(() => {
    if (profile) {
      setState(prev => ({
        ...prev,
        isAvailable: profile.is_available || false,
        loading: false
      }))
    }
  }, [profile])

  // Função para alternar disponibilidade
  const toggleAvailability = useCallback(async () => {
    if (!user || !profile) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const newAvailability = !state.isAvailable

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_available: newAvailability,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        isAvailable: newAvailability,
        loading: false
      }))

      return newAvailability
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar disponibilidade'
      }))
      return null
    }
  }, [user, profile])

  // Função para definir disponibilidade específica
  const setAvailability = useCallback(async (available: boolean) => {
    if (!user || !profile) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_available: available,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        isAvailable: available,
        loading: false
      }))

      return available
    } catch (error) {
      console.error('Erro ao definir disponibilidade:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao definir disponibilidade'
      }))
      return null
    }
  }, [user, profile])

  return {
    ...state,
    toggleAvailability,
    setAvailability
  }
}

