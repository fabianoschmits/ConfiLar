'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

// Função para criar notificação
const createNotification = async (
  recipientId: string,
  title: string,
  message: string,
  conversationId: string,
  senderId: string
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        title,
        message,
        type: 'info',
        priority: 'normal',
        related_conversation_id: conversationId,
        sender_id: senderId
      })

    if (error) {
      console.error('❌ Erro ao criar notificação:', error)
      return false
    }

    console.log('✅ Notificação criada com sucesso para:', recipientId)
    return true
  } catch (error) {
    console.error('❌ Erro geral ao criar notificação:', error)
    return false
  }
}

export interface SupabaseMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface SupabaseConversation {
  id: string
  created_at: string
  updated_at: string
}

export interface ConversationWithParticipant extends SupabaseConversation {
  participant: {
    id: string
    full_name: string
    avatar_url: string | null
    user_type: 'client' | 'professional'
  }
  last_message?: SupabaseMessage
}

export function useSupabaseMessages() {
  const { profile } = useAuthContext()
  const [conversations, setConversations] = useState<ConversationWithParticipant[]>([])
  const [messages, setMessages] = useState<SupabaseMessage[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)

  // Buscar conversas do usuário
  const fetchConversations = async () => {
    if (!profile?.id) return

    setIsLoading(true)
    try {
      // Buscar conversas onde o usuário é participante
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', profile.id)

      if (participantError) {
        console.error('Erro ao buscar participantes:', participantError)
        throw participantError
      }

      if (!participantData || participantData.length === 0) {
        setConversations([])
        setTotalUnread(0)
        return
      }

      // Buscar informações das conversas e participantes
      const conversationsWithParticipants = await Promise.all(
        participantData.map(async (participant: { conversation_id: string }) => {
          const conversationId = participant.conversation_id

          // Buscar dados da conversa - usar select específico
          const { data: conversationData, error: convError } = await supabase
            .from('conversations')
            .select('id, created_at, updated_at')
            .eq('id', conversationId)
            .single()

          if (convError || !conversationData) {
            console.error('Erro ao buscar conversa:', convError)
            return null
          }

          // Buscar TODOS os participantes da conversa
          const { data: allParticipants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('profile_id')
            .eq('conversation_id', conversationId)

          if (participantsError || !allParticipants) {
            console.error('Erro ao buscar participantes:', participantsError)
            return null
          }

          // Encontrar o outro participante (não o usuário atual)
          const otherParticipant = allParticipants.find(p => p.profile_id !== profile.id)
          
          if (!otherParticipant) {
            console.error('Não foi possível encontrar o outro participante')
            return null
          }

          // Buscar perfil do outro participante - usar select específico
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, user_type')
            .eq('id', otherParticipant.profile_id)
            .single()

          if (profileError || !profileData) {
            console.error('Erro ao buscar perfil:', profileError)
            return null
          }

          // Buscar última mensagem - usar select específico
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('id, content, created_at, sender_id')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          const participantProfile = {
            id: profileData.id,
            full_name: profileData.full_name || 'Usuário',
            avatar_url: profileData.avatar_url,
            user_type: profileData.user_type as 'client' | 'professional'
          }

          return {
            ...conversationData,
            participant: participantProfile,
            last_message: lastMessageData || undefined
          }
        })
      )

      // Filtrar conversas válidas
      const validConversations = conversationsWithParticipants
        .filter(Boolean) as ConversationWithParticipant[]
      setConversations(validConversations)
      setTotalUnread(0) // Sem contagem de não lidas por enquanto
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
      toast.error('Erro ao carregar conversas')
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar mensagens de uma conversa
  const fetchMessages = async (conversationId: string) => {
    if (!conversationId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
      setSelectedConversation(conversationId)
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      toast.error('Erro ao carregar mensagens')
    }
  }

  // Enviar mensagem
  const sendMessage = async (conversationId: string, content: string) => {
    if (!profile?.id || !content.trim()) return

    try {
      // Enviar mensagem
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: content.trim()
        })
        .select('id, conversation_id, sender_id, content, created_at')
        .single()

      if (error) throw error

      // Adicionar mensagem à lista local
      setMessages(prev => [...prev, data])

      // Atualizar updated_at da conversa
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      // ENVIAR NOTIFICAÇÃO PARA O PROFISSIONAL
      try {
        console.log('🔍 Buscando participantes para notificação...')
        
        // Buscar TODOS os participantes da conversa
        const { data: allParticipants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('profile_id')
          .eq('conversation_id', conversationId)

        if (participantsError) {
          console.error('❌ Erro ao buscar participantes:', participantsError)
          return data
        }

        if (!allParticipants || allParticipants.length === 0) {
          console.log('⚠️ Nenhum participante encontrado na conversa')
          return data
        }

        console.log('👥 Participantes encontrados:', allParticipants)

        // Encontrar o outro participante (não o usuário atual)
        const otherParticipant = allParticipants.find(p => p.profile_id !== profile.id)
        
        if (!otherParticipant) {
          console.log('⚠️ Não foi possível encontrar o outro participante')
          return data
        }

        console.log('✅ Outro participante encontrado:', otherParticipant.profile_id)

        // Buscar informações do remetente
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name, user_type')
          .eq('id', profile.id)
          .single()

        // Buscar informações do destinatário
        const { data: recipientProfile } = await supabase
          .from('profiles')
          .select('full_name, user_type')
          .eq('id', otherParticipant.profile_id)
          .single()

        console.log('📋 Perfis encontrados:', {
          sender: senderProfile,
          recipient: recipientProfile
        })

        // Criar notificação real no banco
        const notificationTitle = `Nova mensagem de ${senderProfile?.full_name || 'Usuário'}`
        const notificationMessage = `Você recebeu uma nova mensagem na conversa sobre seus serviços.`
        
        console.log('🔔 Criando notificação:', {
          recipientId: otherParticipant.profile_id,
          title: notificationTitle,
          message: notificationMessage,
          conversationId,
          senderId: profile.id
        })

        const notificationCreated = await createNotification(
          otherParticipant.profile_id,
          notificationTitle,
          notificationMessage,
          conversationId,
          profile.id
        )

        if (notificationCreated) {
          console.log('✅ NOTIFICAÇÃO CRIADA COM SUCESSO:', {
            to: otherParticipant.profile_id,
            toName: recipientProfile?.full_name,
            from: profile.id,
            fromName: senderProfile?.full_name,
            message: notificationMessage,
            conversationId,
            timestamp: new Date().toISOString()
          })
        } else {
          console.log('⚠️ Falha ao criar notificação no banco')
        }
      } catch (notificationError) {
        console.error('⚠️ Erro ao enviar notificação:', notificationError)
        // Não falhar o envio da mensagem por causa da notificação
      }

      // Recarregar conversas para atualizar ordem
      await fetchConversations()

      return data
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
      return null
    }
  }

  // Criar nova conversa - VERSÃO CORRIGIDA E SIMPLIFICADA
  const createConversation = async (otherUserId: string) => {
    if (!profile?.id) {
      console.error('❌ Usuário não autenticado')
      return null
    }

    console.log('🔍 Criando conversa:', {
      profileId: profile.id,
      otherUserId
    })

    try {
      // PRIMEIRO: Verificar se o outro usuário existe na tabela profiles
      console.log('🔍 Verificando se o usuário existe...')
      
      // Usar select específico em vez de select(*)
      const { data: otherUserProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', otherUserId)
        .maybeSingle()

      if (profileCheckError) {
        console.error('❌ Erro ao verificar usuário:', profileCheckError)
        toast.error('Erro ao verificar usuário')
        return null
      }

      if (!otherUserProfile) {
        console.error('❌ Usuário não encontrado na tabela profiles:', otherUserId)
        toast.error('Usuário não encontrado na base de dados')
        return null
      }

      console.log('✅ Usuário encontrado:', {
        id: otherUserProfile.id,
        name: otherUserProfile.full_name,
        email: otherUserProfile.email
      })

      // SEGUNDO: Verificar se já existe conversa entre os usuários
      console.log('🔍 Verificando conversa existente...')
      const existingConversationId = await checkExistingConversation(otherUserId)
      
      if (existingConversationId) {
        console.log('✅ Conversa existente encontrada:', existingConversationId)
        await fetchConversations()
        return existingConversationId
      }

      // TERCEIRO: Criar nova conversa
      console.log('🆕 Criando nova conversa...')
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single()

      if (convError) {
        console.error('❌ Erro ao criar conversa:', convError)
        throw convError
      }

      console.log('✅ Conversa criada:', newConversation.id)

      // QUARTO: Adicionar participantes de forma mais simples
      console.log('👥 Adicionando participantes...')
      
      // Adicionar primeiro participante (usuário atual)
      const { error: participant1Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newConversation.id,
          profile_id: profile.id
        })

      if (participant1Error) {
        console.error('❌ Erro ao adicionar primeiro participante:', participant1Error)
        // Limpar conversa criada se falhar
        await supabase
          .from('conversations')
          .delete()
          .eq('id', newConversation.id)
        throw participant1Error
      }

      console.log('✅ Primeiro participante adicionado')

      // Adicionar segundo participante (outro usuário)
      const { error: participant2Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newConversation.id,
          profile_id: otherUserId
        })

      if (participant2Error) {
        console.error('❌ Erro ao adicionar segundo participante:', participant2Error)
        // Limpar conversa criada se falhar
        await supabase
          .from('conversations')
          .delete()
          .eq('id', newConversation.id)
        throw participant2Error
      }

      console.log('✅ Segundo participante adicionado')

      // QUINTO: Recarregar conversas
      console.log('🔄 Recarregando lista de conversas...')
      await fetchConversations()
      console.log('✅ Lista de conversas atualizada')

      return newConversation.id
    } catch (error) {
      console.error('❌ Erro geral ao criar conversa:', error)
      toast.error('Erro ao criar conversa')
      return null
    }
  }

  // Verificar se já existe conversa entre os usuários - VERSÃO CORRIGIDA
  const checkExistingConversation = async (otherUserId: string): Promise<string | null> => {
    if (!profile?.id) return null
    
    try {
      console.log('🔍 Verificando conversa existente entre usuários...')
      
      // Buscar conversas do usuário atual
      const { data: userConversations, error: userError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', profile.id)

      if (userError) {
        console.error('❌ Erro ao buscar conversas do usuário:', userError)
        return null
      }

      if (!userConversations || userConversations.length === 0) {
        console.log('📝 Usuário não tem conversas')
        return null
      }

      console.log('📝 Usuário tem', userConversations.length, 'conversas')

      // Verificar se o outro usuário está em alguma dessas conversas
      const conversationIds = userConversations.map(c => c.conversation_id)
      
      // Buscar conversas do outro usuário de forma mais simples
      const { data: otherUserConversations, error: otherError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', otherUserId)

      if (otherError) {
        console.error('❌ Erro ao buscar conversas do outro usuário:', otherError)
        return null
      }

      if (!otherUserConversations || otherUserConversations.length === 0) {
        console.log('📝 Outro usuário não tem conversas')
        return null
      }

      console.log('📝 Outro usuário tem', otherUserConversations.length, 'conversas')

      // Encontrar conversa em comum
      const commonConversation = otherUserConversations.find(c => 
        conversationIds.includes(c.conversation_id)
      )

      if (commonConversation) {
        console.log('✅ Conversa existente encontrada:', commonConversation.conversation_id)
        return commonConversation.conversation_id
      }

      console.log('📝 Nenhuma conversa existente entre os usuários')
      return null
    } catch (error) {
      console.error('❌ Erro ao verificar conversa existente:', error)
      return null
    }
  }

  // Sincronização em tempo real
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        () => {
          if (selectedConversation) {
            fetchMessages(selectedConversation)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, selectedConversation])

  // Carregar conversas iniciais
  useEffect(() => {
    if (profile?.id) {
      fetchConversations()
    }
  }, [profile?.id])

  return {
    conversations,
    messages,
    selectedConversation,
    isLoading,
    totalUnread,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    setSelectedConversation
  }
}
