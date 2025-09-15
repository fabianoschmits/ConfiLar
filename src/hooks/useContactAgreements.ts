'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { useMessages } from './useMessages'

export interface ContactAgreement {
  id: string
  client_id: string
  professional_id: string
  conversation_id: string
  service_description: string
  agreed_price?: number
  currency: string
  proposed_date?: string
  proposed_time?: string
  estimated_duration?: number
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  proposed_by: string
  contacts_revealed_at?: string
  notes?: string
  created_at: string
  updated_at: string
  
  // Dados dos participantes (join)
  client_name?: string
  professional_name?: string
}

export interface ContactAgreementCreate {
  client_id: string
  professional_id: string
  conversation_id: string
  service_description: string
  agreed_price?: number
  proposed_date?: string
  proposed_time?: string
  estimated_duration?: number
  notes?: string
}

export function useContactAgreements() {
  const { profile } = useAuthContext()
  const { createAgreementNotification } = useMessages()
  const [agreements, setAgreements] = useState<ContactAgreement[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Verificar se existe acordo aceito entre dois usuários (para avaliações)
  const hasAcceptedAgreement = useCallback(async (otherUserId: string): Promise<boolean> => {
    if (!profile?.id) return false

    try {
      const { data, error } = await supabase
        .from('contact_agreements')
        .select('id')
        .or(`client_id.eq.${profile.id},professional_id.eq.${profile.id}`)
        .or(`client_id.eq.${otherUserId},professional_id.eq.${otherUserId}`)
        .eq('status', 'accepted')
        .limit(1)

      if (error) {
        console.error('Erro ao verificar acordo aceito:', error)
        return false
      }

      return (data && data.length > 0) || false
    } catch (error) {
      console.error('Erro ao verificar acordo aceito:', error)
      return false
    }
  }, [profile?.id])

  // Buscar acordos do usuário
  const fetchAgreements = useCallback(async () => {
    if (!profile?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_agreements')
        .select(`
          *,
          client:client_id(full_name),
          professional:professional_id(full_name)
        `)
        .or(`client_id.eq.${profile.id},professional_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar acordos:', error)
        return
      }

      const agreementsWithNames = (data || []).map(agreement => ({
        ...agreement,
        client_name: agreement.client?.full_name || 'Cliente',
        professional_name: agreement.professional?.full_name || 'Profissional'
      }))

      setAgreements(agreementsWithNames)
    } catch (error) {
      console.error('Erro ao buscar acordos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [profile?.id])

  // Criar nova proposta de acordo
  const createAgreement = useCallback(async (agreementData: ContactAgreementCreate): Promise<string | null> => {
    if (!profile?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { data, error } = await supabase.rpc('create_contact_agreement', {
        p_client_id: agreementData.client_id,
        p_professional_id: agreementData.professional_id,
        p_conversation_id: agreementData.conversation_id,
        p_service_description: agreementData.service_description,
        p_agreed_price: agreementData.agreed_price || null,
        p_proposed_date: agreementData.proposed_date || null,
        p_proposed_time: agreementData.proposed_time || null,
        p_estimated_duration: agreementData.estimated_duration || null,
        p_proposed_by: profile.id,
        p_notes: agreementData.notes || null
      })

      if (error) {
        console.error('Erro ao criar acordo:', error)
        throw new Error('Erro ao criar proposta de acordo')
      }

      // Recarregar acordos
      await fetchAgreements()

      // Criar notificação
      if (data) {
        const agreement = agreements.find(a => a.id === data) || {
          id: data,
          client_id: agreementData.client_id,
          professional_id: agreementData.professional_id,
          conversation_id: agreementData.conversation_id,
          service_description: agreementData.service_description,
          status: 'pending' as const,
          proposed_by: profile.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          currency: 'BRL'
        }
        await createAgreementNotification(agreement, 'proposal')
      }

      return data
    } catch (error) {
      console.error('Erro ao criar acordo:', error)
      throw error
    }
  }, [profile?.id, fetchAgreements, agreements, createAgreementNotification])

  // Aceitar acordo
  const acceptAgreement = useCallback(async (agreementId: string): Promise<void> => {
    if (!profile?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Atualizar status do acordo
      const { error: updateError } = await supabase
        .from('contact_agreements')
        .update({ 
          status: 'accepted',
          contacts_revealed_at: new Date().toISOString()
        })
        .eq('id', agreementId)

      if (updateError) {
        console.error('Erro ao aceitar acordo:', updateError)
        throw new Error('Erro ao aceitar acordo')
      }

      // Recarregar acordos
      await fetchAgreements()

      // Criar notificação
      const agreement = agreements.find(a => a.id === agreementId)
      if (agreement) {
        await createAgreementNotification(agreement, 'accepted')
      }

    } catch (error) {
      console.error('Erro ao aceitar acordo:', error)
      throw error
    }
  }, [profile?.id, fetchAgreements, agreements, createAgreementNotification])

  // Rejeitar acordo
  const rejectAgreement = useCallback(async (agreementId: string): Promise<void> => {
    if (!profile?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { error } = await supabase
        .from('contact_agreements')
        .update({ status: 'rejected' })
        .eq('id', agreementId)

      if (error) {
        console.error('Erro ao rejeitar acordo:', error)
        throw new Error('Erro ao rejeitar acordo')
      }

      // Recarregar acordos
      await fetchAgreements()

      // Criar notificação
      const agreement = agreements.find(a => a.id === agreementId)
      if (agreement) {
        await createAgreementNotification(agreement, 'rejected')
      }

    } catch (error) {
      console.error('Erro ao rejeitar acordo:', error)
      throw error
    }
  }, [profile?.id, fetchAgreements, agreements, createAgreementNotification])

  // Cancelar acordo
  const cancelAgreement = useCallback(async (agreementId: string): Promise<void> => {
    if (!profile?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { error } = await supabase
        .from('contact_agreements')
        .update({ status: 'cancelled' })
        .eq('id', agreementId)

      if (error) {
        console.error('Erro ao cancelar acordo:', error)
        throw new Error('Erro ao cancelar acordo')
      }

      // Recarregar acordos
      await fetchAgreements()

    } catch (error) {
      console.error('Erro ao cancelar acordo:', error)
      throw error
    }
  }, [profile?.id, fetchAgreements, agreements, createAgreementNotification])

  // Marcar acordo como concluído
  const completeAgreement = useCallback(async (agreementId: string): Promise<void> => {
    if (!profile?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { error } = await supabase
        .from('contact_agreements')
        .update({ status: 'completed' })
        .eq('id', agreementId)

      if (error) {
        console.error('Erro ao concluir acordo:', error)
        throw new Error('Erro ao concluir acordo')
      }

      // Recarregar acordos
      await fetchAgreements()

    } catch (error) {
      console.error('Erro ao concluir acordo:', error)
      throw error
    }
  }, [profile?.id, fetchAgreements, agreements, createAgreementNotification])

  // Buscar acordos na inicialização
  useEffect(() => {
    if (profile?.id) {
      fetchAgreements()
    }
  }, [profile?.id, fetchAgreements, agreements, createAgreementNotification])

  // Subscription para atualizações em tempo real
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel('contact_agreements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_agreements',
          filter: `or(client_id.eq.${profile.id},professional_id.eq.${profile.id})`
        },
        () => {
          fetchAgreements()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, fetchAgreements, agreements, createAgreementNotification])

  return {
    agreements,
    isLoading,
    hasAcceptedAgreement,
    fetchAgreements,
    createAgreement,
    acceptAgreement,
    rejectAgreement,
    cancelAgreement,
    completeAgreement
  }
}






