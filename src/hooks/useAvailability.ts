'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Função helper para usar o contexto de disponibilidade de forma opcional
const useAvailabilityContextOptional = () => {
  try {
    const { useAvailabilityContext } = require('@/contexts/AvailabilityContext')
    return useAvailabilityContext()
  } catch {
    return null
  }
}

export interface AvailabilityState {
  isAvailable: boolean
  loading: boolean
  error: string | null
}

export const useAvailability = () => {
  const { user, profile } = useAuthContext()
  const availabilityContext = useAvailabilityContextOptional()
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

      // Atualizar contexto global se disponível
      if (availabilityContext && user) {
        availabilityContext.updateUserAvailability(user.id, newAvailability)
      }

      // Mostrar mensagem de feedback com tema moderno
      if (newAvailability) {
        toast.success('✅ Disponível para orçamentos!', {
          description: 'Agora você está disponível para receber orçamentos e ofertas de clientes',
          style: {
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            border: '1px solid #10B981',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
            fontWeight: '500',
            fontSize: '14px',
            padding: '16px 20px'
          }
        })
      } else {
        toast.info('⏸️ Indisponível', {
          description: 'Você não está mais disponível para receber orçamentos e ofertas',
          style: {
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#FFFFFF',
            border: '1px solid #EF4444',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
            fontWeight: '500',
            fontSize: '14px',
            padding: '16px 20px'
          }
        })
      }

      return newAvailability
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar disponibilidade'
      }))
      
      // Mostrar erro com tema moderno
      toast.error('❌ Erro ao alterar disponibilidade', {
        description: 'Tente novamente em alguns instantes',
        style: {
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          color: '#FFFFFF',
          border: '1px solid #DC2626',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px 20px'
        }
      })
      
      return null
    }
  }, [user, profile, state.isAvailable])

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

      // Atualizar contexto global se disponível
      if (availabilityContext && user) {
        availabilityContext.updateUserAvailability(user.id, available)
      }

      // Mostrar mensagem de feedback com tema moderno
      if (available) {
        toast.success('✅ Disponível para orçamentos!', {
          description: 'Agora você está disponível para receber orçamentos e ofertas de clientes',
          style: {
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            border: '1px solid #10B981',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
            fontWeight: '500',
            fontSize: '14px',
            padding: '16px 20px'
          }
        })
      } else {
        toast.info('⏸️ Indisponível', {
          description: 'Você não está mais disponível para receber orçamentos e ofertas',
          style: {
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#FFFFFF',
            border: '1px solid #EF4444',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
            fontWeight: '500',
            fontSize: '14px',
            padding: '16px 20px'
          }
        })
      }

      return available
    } catch (error) {
      console.error('Erro ao definir disponibilidade:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao definir disponibilidade'
      }))
      
      // Mostrar erro com tema moderno
      toast.error('❌ Erro ao alterar disponibilidade', {
        description: 'Tente novamente em alguns instantes',
        style: {
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          color: '#FFFFFF',
          border: '1px solid #DC2626',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px 20px'
        }
      })
      
      return null
    }
  }, [user, profile])

  return {
    ...state,
    toggleAvailability,
    setAvailability
  }
}

