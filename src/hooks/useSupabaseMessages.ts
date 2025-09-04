'use client'

import { useState, useEffect, useCallback } from 'react'
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
    // Inserir apenas os campos que existem na tabela
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        title,
        message,
        type: 'info',
        priority: 'normal'
        // Removendo campos que podem não existir:
        // related_conversation_id: conversationId,
        // sender_id: senderId,
        // created_at: new Date().toISOString(),
        // read_at: null
      })

    if (error) {
      console.error('❌ Erro ao criar notificação:', error)
      // Não vamos falhar o envio da mensagem por causa da notificação
      return false
    }

    console.log('✅ Notificação criada com sucesso para:', recipientId)
    return true
  } catch (error) {
    console.error('❌ Erro geral ao criar notificação:', error)
    // Não vamos falhar o envio da mensagem por causa da notificação
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
  unread_count?: number
}

export function useSupabaseMessages() {
  const { profile } = useAuthContext()
  const [conversations, setConversations] = useState<ConversationWithParticipant[]>([])
  const [messages, setMessages] = useState<SupabaseMessage[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)

  // Buscar conversas do usuário - VERSÃO CORRIGIDA
  const fetchConversations = useCallback(async () => {
    if (!profile?.id) return

    setIsLoading(true)
    try {
      console.log('🔍 Buscando conversas para usuário:', profile.id)

      // Buscar conversas onde o usuário é participante usando uma query mais eficiente
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(
            id,
            created_at,
            updated_at
          )
        `)
        .eq('profile_id', profile.id)

      if (conversationsError) {
        console.error('❌ Erro ao buscar conversas:', conversationsError)
        throw conversationsError
      }

      if (!conversationsData || conversationsData.length === 0) {
        console.log('📝 Nenhuma conversa encontrada')
        setConversations([])
        setTotalUnread(0)
        return
      }

      console.log('📝 Conversas encontradas:', conversationsData.length)

      // Buscar informações completas das conversas
      const conversationsWithParticipants = await Promise.all(
        conversationsData.map(async (item) => {
          const conversationId = item.conversation_id
          const conversation = item.conversations

          // Buscar o outro participante da conversa
          const { data: otherParticipant, error: participantError } = await supabase
            .from('conversation_participants')
            .select('profile_id')
            .eq('conversation_id', conversationId)
            .neq('profile_id', profile.id)
            .single()

          if (participantError || !otherParticipant) {
            console.error('❌ Erro ao buscar outro participante:', participantError)
            return null
          }

          // Buscar perfil do outro participante
          const { data: participantProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, user_type')
            .eq('id', otherParticipant.profile_id)
            .single()

          if (profileError || !participantProfile) {
            console.error('❌ Erro ao buscar perfil do participante:', profileError)
            return null
          }

          // Buscar última mensagem
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, created_at, sender_id')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Buscar contagem de mensagens não lidas
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', profile.id)
            .is('read_at', null)

          return {
            ...conversation,
            participant: {
              id: participantProfile.id,
              full_name: participantProfile.full_name || 'Usuário',
              avatar_url: participantProfile.avatar_url,
              user_type: participantProfile.user_type as 'client' | 'professional'
            },
            last_message: lastMessage || undefined,
            unread_count: unreadCount || 0
          }
        })
      )

      // Filtrar conversas válidas e remover duplicatas
      const validConversations = conversationsWithParticipants
        .filter(Boolean) as unknown as ConversationWithParticipant[]
      
      // Remover duplicatas baseado no ID da conversa
      const uniqueConversations = validConversations.filter((conversation, index, self) => 
        index === self.findIndex(c => c.id === conversation.id)
      )

      console.log('✅ Conversas carregadas:', uniqueConversations.length)
      setConversations(uniqueConversations)
      
      // Calcular total de não lidas
      const totalUnreadCount = uniqueConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
      setTotalUnread(totalUnreadCount)
    } catch (error) {
      console.error('❌ Erro ao buscar conversas:', error)
      toast.error('Erro ao carregar conversas')
    } finally {
      setIsLoading(false)
    }
  }, [profile?.id])

  // Buscar mensagens de uma conversa - VERSÃO CORRIGIDA
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return

    try {
      console.log('🔍 Buscando mensagens para conversa:', conversationId)

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error)
        throw error
      }

      console.log('✅ Mensagens carregadas:', data?.length || 0)
      setMessages(data || [])
      setSelectedConversation(conversationId)

      // Marcar mensagens como lidas
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', profile?.id)
        .is('read_at', null)

    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error)
      toast.error('Erro ao carregar mensagens')
    }
  }, [profile?.id])

  // Enviar mensagem - VERSÃO CORRIGIDA
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!profile?.id || !content.trim()) {
      console.error('❌ Dados inválidos para envio de mensagem')
      return null
    }

    try {
      console.log('📤 Enviando mensagem:', { conversationId, content: content.substring(0, 50) + '...' })

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

      if (error) {
        console.error('❌ Erro ao enviar mensagem:', error)
        throw error
      }

      console.log('✅ Mensagem enviada:', data.id)

      // Adicionar mensagem à lista local
      setMessages(prev => [...prev, data])

      // Atualizar updated_at da conversa
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

             // Buscar outros participantes para notificação
       const { data: participants } = await supabase
         .from('conversation_participants')
         .select('profile_id')
         .eq('conversation_id', conversationId)
         .neq('profile_id', profile.id)

       if (participants && participants.length > 0) {
         const otherParticipant = participants[0]
         
         // Buscar informações dos perfis
         const [senderProfile, recipientProfile] = await Promise.all([
           supabase
             .from('profiles')
             .select('full_name')
             .eq('id', profile.id)
             .single(),
           supabase
             .from('profiles')
             .select('full_name')
             .eq('id', otherParticipant.profile_id)
             .single()
         ])

         // Criar notificação (não vai falhar se der erro)
         const notificationTitle = `Nova mensagem de ${senderProfile.data?.full_name || 'Usuário'}`
         const notificationMessage = content.length > 50 ? `${content.substring(0, 50)}...` : content
         
         // Tentar criar notificação, mas não falhar se der erro
         try {
           await createNotification(
             otherParticipant.profile_id,
             notificationTitle,
             notificationMessage,
             conversationId,
             profile.id
           )
           
           // Mostrar toast para o remetente também
           toast.success('Mensagem enviada com sucesso!', {
             description: 'Sua mensagem foi enviada e notificada.',
             duration: 3000
           })
         } catch (notificationError) {
           console.warn('⚠️ Erro ao criar notificação (não crítico):', notificationError)
           // Não vamos falhar o envio da mensagem por causa da notificação
         }
       }

      // Recarregar conversas para atualizar ordem
      await fetchConversations()

      return data
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
      return null
    }
  }, [profile?.id, fetchConversations])

  // Criar nova conversa - VERSÃO SIMPLIFICADA
  const createConversation = useCallback(async (otherUserId: string) => {
    if (!profile?.id) {
      console.error('❌ Usuário não autenticado')
      return null
    }

    try {
      console.log('🆕 Criando conversa com usuário:', otherUserId)

      // Verificar se já existe conversa
      const existingConversationId = await checkExistingConversation(otherUserId)
      if (existingConversationId) {
        console.log('✅ Conversa existente encontrada:', existingConversationId)
        await fetchConversations()
        return existingConversationId
      }

      // Criar nova conversa
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single()

      if (convError) {
        console.error('❌ Erro ao criar conversa:', convError)
        throw convError
      }

      // Adicionar participantes
      const participantPromises = [
        supabase
          .from('conversation_participants')
          .insert({
            conversation_id: newConversation.id,
            profile_id: profile.id
          }),
        supabase
          .from('conversation_participants')
          .insert({
            conversation_id: newConversation.id,
            profile_id: otherUserId
          })
      ]

      await Promise.all(participantPromises)

      console.log('✅ Conversa criada:', newConversation.id)
      await fetchConversations()
      return newConversation.id
    } catch (error) {
      console.error('❌ Erro ao criar conversa:', error)
      toast.error('Erro ao criar conversa')
      return null
    }
  }, [profile?.id, fetchConversations])

  // Verificar conversa existente
  const checkExistingConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!profile?.id) return null
    
    try {
      // Buscar conversas em comum
      const { data: otherUserConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', otherUserId)

      if (!otherUserConversations?.length) return null

      const conversationIds = otherUserConversations.map(c => c.conversation_id)

      const { data: commonConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', profile.id)
        .in('conversation_id', conversationIds)

      return commonConversations?.[0]?.conversation_id || null
    } catch (error) {
      console.error('❌ Erro ao verificar conversa existente:', error)
      return null
    }
  }, [profile?.id])

  // Excluir conversa
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!profile?.id) {
      console.error('❌ Usuário não autenticado')
      return false
    }

    try {
      console.log('🗑️ Excluindo conversa:', conversationId)

      // Verificar se o usuário é participante da conversa
      const { data: participantCheck } = await supabase
        .from('conversation_participants')
        .select('profile_id')
        .eq('conversation_id', conversationId)
        .eq('profile_id', profile.id)
        .single()

      if (!participantCheck) {
        console.error('❌ Usuário não é participante desta conversa')
        toast.error('Você não tem permissão para excluir esta conversa')
        return false
      }

      // Excluir mensagens da conversa
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)

      if (messagesError) {
        console.error('❌ Erro ao excluir mensagens:', messagesError)
        throw messagesError
      }

      // Excluir participantes da conversa
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)

      if (participantsError) {
        console.error('❌ Erro ao excluir participantes:', participantsError)
        throw participantsError
      }

      // Excluir a conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (conversationError) {
        console.error('❌ Erro ao excluir conversa:', conversationError)
        throw conversationError
      }

      console.log('✅ Conversa excluída com sucesso')
      toast.success('Conversa excluída com sucesso')

      // Limpar conversa selecionada se for a mesma
      if (selectedConversation === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }

      // Recarregar lista de conversas
      await fetchConversations()

      return true
    } catch (error) {
      console.error('❌ Erro ao excluir conversa:', error)
      toast.error('Erro ao excluir conversa')
      return false
    }
  }, [profile?.id, selectedConversation, fetchConversations])

  // Sincronização em tempo real para todas as conversas
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel(`all-messages-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new
          
          // Verificar se a mensagem é para uma conversa do usuário atual
          if (newMessage.sender_id !== profile.id) {
            // Buscar informações da conversa para mostrar notificação
            const checkAndNotify = async () => {
              try {
                const { data: conversationData } = await supabase
                  .from('conversation_participants')
                  .select('conversation_id')
                  .eq('conversation_id', newMessage.conversation_id)
                  .eq('profile_id', profile.id)
                  .single()

                if (conversationData) {
                  // Buscar informações do remetente
                  const { data: senderProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', newMessage.sender_id)
                    .single()

                  // Mostrar notificação apenas se não estiver na conversa atual
                  if (selectedConversation !== newMessage.conversation_id) {
                    toast.info(`Nova mensagem de ${senderProfile?.full_name || 'Usuário'}`, {
                      description: newMessage.content.length > 50 ? `${newMessage.content.substring(0, 50)}...` : newMessage.content,
                      duration: 5000,
                      action: {
                        label: 'Ver',
                        onClick: () => {
                          if (typeof window !== 'undefined') {
                            window.location.href = '/mensagens'
                          }
                        }
                      }
                    })
                  }
                  
                  // Recarregar conversas para atualizar contadores
                  fetchConversations()
                }
              } catch (error) {
                console.error('Erro ao verificar conversa para notificação:', error)
              }
            }
            
            checkAndNotify()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, selectedConversation, fetchConversations])

  // Sincronização em tempo real para conversa selecionada
  useEffect(() => {
    if (!profile?.id || !selectedConversation) return

    const channel = supabase
      .channel(`selected-conversation-${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        () => {
          console.log('🔄 Nova mensagem na conversa selecionada, recarregando...')
          fetchMessages(selectedConversation)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, selectedConversation, fetchMessages])

  // Carregar conversas iniciais
  useEffect(() => {
    if (profile?.id) {
      fetchConversations()
    }
  }, [profile?.id, fetchConversations])

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
    deleteConversation,
    setSelectedConversation
  }
}
