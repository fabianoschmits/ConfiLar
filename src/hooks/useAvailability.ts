'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

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

      // Mostrar mensagem de feedback com tema brutalista
      if (newAvailability) {
        toast.success('🎯 DISPONÍVEL PARA ORÇAMENTOS!', {
          description: 'AGORA VOCÊ ESTÁ DISPONÍVEL PARA RECEBER ORÇAMENTOS E OFERTAS DE CLIENTES',
          style: {
            background: '#10B981',
            color: '#FFFFFF',
            border: '4px solid #000000',
            borderRadius: '0px',
            boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
            fontWeight: '900',
            textTransform: 'uppercase',
            fontSize: '16px'
          }
        })
      } else {
        toast.info('🚫 INDISPONÍVEL', {
          description: 'VOCÊ NÃO ESTÁ MAIS DISPONÍVEL PARA RECEBER ORÇAMENTOS E OFERTAS',
          style: {
            background: '#EF4444',
            color: '#FFFFFF',
            border: '4px solid #000000',
            borderRadius: '0px',
            boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
            fontWeight: '900',
            textTransform: 'uppercase',
            fontSize: '16px'
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
      
      // Mostrar erro com tema brutalista
      toast.error('❌ ERRO AO ALTERAR DISPONIBILIDADE', {
        description: 'TENTE NOVAMENTE EM ALGUNS INSTANTES',
        style: {
          background: '#DC2626',
          color: '#FFFFFF',
          border: '4px solid #000000',
          borderRadius: '0px',
          boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
          fontWeight: '900',
          textTransform: 'uppercase',
          fontSize: '16px'
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

      // Mostrar mensagem de feedback com tema brutalista
      if (available) {
        toast.success('🎯 DISPONÍVEL PARA ORÇAMENTOS!', {
          description: 'AGORA VOCÊ ESTÁ DISPONÍVEL PARA RECEBER ORÇAMENTOS E OFERTAS DE CLIENTES',
          style: {
            background: '#10B981',
            color: '#FFFFFF',
            border: '4px solid #000000',
            borderRadius: '0px',
            boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
            fontWeight: '900',
            textTransform: 'uppercase',
            fontSize: '16px'
          }
        })
      } else {
        toast.info('🚫 INDISPONÍVEL', {
          description: 'VOCÊ NÃO ESTÁ MAIS DISPONÍVEL PARA RECEBER ORÇAMENTOS E OFERTAS',
          style: {
            background: '#EF4444',
            color: '#FFFFFF',
            border: '4px solid #000000',
            borderRadius: '0px',
            boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
            fontWeight: '900',
            textTransform: 'uppercase',
            fontSize: '16px'
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
      
      // Mostrar erro com tema brutalista
      toast.error('❌ ERRO AO ALTERAR DISPONIBILIDADE', {
        description: 'TENTE NOVAMENTE EM ALGUNS INSTANTES',
        style: {
          background: '#DC2626',
          color: '#FFFFFF',
          border: '4px solid #000000',
          borderRadius: '0px',
          boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
          fontWeight: '900',
          textTransform: 'uppercase',
          fontSize: '16px'
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

