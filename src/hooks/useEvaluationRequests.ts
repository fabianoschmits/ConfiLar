'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

export interface EvaluationRequest {
  id: string
  requester_id: string
  target_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  created_at: string
  updated_at: string
  
  // Dados dos participantes (join)
  requester_name?: string
  requester_avatar?: string
  target_name?: string
  target_avatar?: string
}

export interface EvaluationRequestCreate {
  requester_id: string
  target_id: string
}

export function useEvaluationRequests() {
  const { user, profile } = useAuthContext()
  const [requests, setRequests] = useState<EvaluationRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar solicitações de avaliação
  const loadRequests = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('evaluation_requests')
        .select(`
          *,
          requester:profiles!evaluation_requests_requester_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          target:profiles!evaluation_requests_target_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar solicitações:', error)
        // Retornar array vazio em caso de erro
        setRequests([])
        return
      }

      // Mapear dados para o formato esperado
      const mappedRequests = data?.map(request => ({
        id: request.id,
        requester_id: request.requester_id,
        target_id: request.target_id,
        status: request.status,
        created_at: request.created_at,
        updated_at: request.updated_at,
        requester_name: request.requester?.full_name,
        requester_avatar: request.requester?.avatar_url,
        target_name: request.target?.full_name,
        target_avatar: request.target?.avatar_url
      })) || []

      setRequests(mappedRequests)
    } catch (err) {
      console.error('❌ Erro ao carregar solicitações de avaliação:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Criar solicitação de avaliação
  const createRequest = useCallback(async (targetId: string) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Verificar se já existe uma solicitação pendente ou aceita
      const { data: existingRequests, error: checkError } = await supabase
        .from('evaluation_requests')
        .select('id, status')
        .eq('requester_id', user.id)
        .eq('target_id', targetId)
        .in('status', ['pending', 'accepted'])

      if (checkError) {
        console.error('Erro ao verificar solicitações existentes:', checkError)
        // Continuar mesmo com erro na verificação
      }

      if (existingRequests && existingRequests.length > 0) {
        throw new Error('Já existe uma solicitação de avaliação pendente ou aceita para este usuário')
      }

      const { data, error } = await supabase
        .from('evaluation_requests')
        .insert({
          requester_id: user.id,
          target_id: targetId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Recarregar solicitações
      await loadRequests()

      return { success: true, data }
    } catch (err) {
      console.error('❌ Erro ao criar solicitação de avaliação:', err)
      throw err
    }
  }, [user?.id, loadRequests])

  // Aceitar solicitação de avaliação
  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('evaluation_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

      if (error) throw error

      // Recarregar solicitações
      await loadRequests()

      return { success: true, data }
    } catch (err) {
      console.error('❌ Erro ao aceitar solicitação de avaliação:', err)
      throw err
    }
  }, [loadRequests])

  // Rejeitar solicitação de avaliação
  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('evaluation_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

      if (error) throw error

      // Recarregar solicitações
      await loadRequests()

      return { success: true, data }
    } catch (err) {
      console.error('❌ Erro ao rejeitar solicitação de avaliação:', err)
      throw err
    }
  }, [loadRequests])

  // Marcar como concluída
  const completeRequest = useCallback(async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('evaluation_requests')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

      if (error) throw error

      // Recarregar solicitações
      await loadRequests()

      return { success: true, data }
    } catch (err) {
      console.error('❌ Erro ao marcar solicitação como concluída:', err)
      throw err
    }
  }, [loadRequests])

  // Resetar solicitação para permitir nova avaliação
  const resetRequest = useCallback(async (requesterId: string, targetId: string) => {
    try {
      const { data, error } = await supabase
        .from('evaluation_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .or(`and(requester_id.eq.${requesterId},target_id.eq.${targetId}),and(requester_id.eq.${targetId},target_id.eq.${requesterId})`)
        .select()

      if (error) {
        console.error('❌ Erro ao resetar solicitação:', error)
        throw error
      }

      // Recarregar solicitações
      await loadRequests()

      return { success: true, data }
    } catch (err) {
      console.error('❌ Erro ao resetar solicitação:', err)
      throw err
    }
  }, [loadRequests])

  // Carregar solicitações quando o componente monta
  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  return {
    requests,
    isLoading,
    error,
    createRequest,
    acceptRequest,
    rejectRequest,
    completeRequest,
    resetRequest,
    loadRequests
  }
}
