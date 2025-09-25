'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface FloatingChatContextType {
  isOpen: boolean
  selectedConversationId?: string
  targetUserId?: string
  targetUserName?: string
  openChat: (userIdOrConversationId?: string, userName?: string) => void
  closeChat: () => void
  selectConversation: (conversationId?: string) => void
}

const FloatingChatContext = createContext<FloatingChatContextType | undefined>(undefined)

export function FloatingChatProviderSimple({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>()
  const [targetUserId, setTargetUserId] = useState<string | undefined>()
  const [targetUserName, setTargetUserName] = useState<string | undefined>()

  // Função para criar ou encontrar conversa
  const createOrFindConversation = useCallback(async (clientId: string, professionalId: string) => {
    if (!user?.id) {
      console.error('❌ Usuário não autenticado')
      return null
    }

    try {
      console.log('🔍 Verificando se já existe conversa entre:', clientId, 'e', professionalId)
      console.log('🔍 Usuário atual:', user.id)
      
      // Verificar se já existe conversa
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(client_id.eq.${clientId},professional_id.eq.${professionalId}),and(client_id.eq.${professionalId},professional_id.eq.${clientId})`)
        .maybeSingle()

      if (checkError) {
        console.error('❌ Erro ao verificar conversa existente:', checkError)
        console.error('❌ Detalhes do erro:', {
          message: checkError.message,
          details: checkError.details,
          hint: checkError.hint,
          code: checkError.code
        })
        throw checkError
      }

      if (existingConversation) {
        console.log('✅ Conversa existente encontrada:', existingConversation.id)
        return existingConversation.id
      }

      console.log('🆕 Criando nova conversa entre:', clientId, 'e', professionalId)
      console.log('🆕 Dados da inserção:', {
        client_id: clientId,
        professional_id: professionalId
      })
      
      // Criar nova conversa
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId,
          professional_id: professionalId
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar conversa:', error)
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('✅ Nova conversa criada:', data.id)
      return data.id
    } catch (err) {
      console.error('❌ Erro ao criar/encontrar conversa:', err)
      console.error('❌ Stack trace:', err instanceof Error ? err.stack : 'No stack trace')
      return null
    }
  }, [user?.id])

  const openChat = useCallback(async (userIdOrConversationId?: string, userName?: string) => {
    console.log('💬 Abrindo chat:', { userIdOrConversationId, userName })
    
    if (!userIdOrConversationId) {
      // Abrir lista de conversas
      setIsOpen(true)
      setSelectedConversationId(undefined)
      setTargetUserId(undefined)
      setTargetUserName(undefined)
      return
    }

    // Verificar se é um ID de conversa (UUID) ou ID de usuário
    // Para distinguir, vamos assumir que se não há userName, é um conversationId
    // Se há userName, é um userId que precisa criar conversa
    const isConversationId = !userName && userIdOrConversationId.includes('-') && userIdOrConversationId.length === 36
    
    if (isConversationId) {
      // Abrir conversa existente
      console.log('💬 Abrindo conversa existente:', userIdOrConversationId)
      setSelectedConversationId(userIdOrConversationId)
      setTargetUserId(undefined)
      setTargetUserName(undefined)
      setIsOpen(true)
    } else {
      // Criar nova conversa
      console.log('🆕 Criando nova conversa com userId:', userIdOrConversationId, 'userName:', userName)
      setTargetUserId(userIdOrConversationId)
      setTargetUserName(userName)
      setIsOpen(true)
      
      try {
        if (!user?.id) {
          console.error('❌ Usuário não autenticado')
          return
        }
        
        console.log('🔐 Criando conversa entre:', user.id, 'e', userIdOrConversationId)
        const newConversationId = await createOrFindConversation(user.id, userIdOrConversationId)
        
        if (newConversationId) {
          console.log('✅ Conversa criada/encontrada:', newConversationId)
          setSelectedConversationId(newConversationId)
          setTargetUserId(undefined)
          setTargetUserName(undefined)
        } else {
          console.error('❌ Falha ao criar/encontrar conversa')
        }
      } catch (error) {
        console.error('❌ Erro ao criar conversa:', error)
      }
    }
  }, [user?.id, createOrFindConversation])

  const closeChat = useCallback(() => {
    console.log('💬 Fechando chat')
    setIsOpen(false)
    setSelectedConversationId(undefined)
    setTargetUserId(undefined)
    setTargetUserName(undefined)
  }, [])

  const selectConversation = useCallback((conversationId?: string) => {
    console.log('💬 Selecionando conversa:', conversationId)
    setSelectedConversationId(conversationId)
    setTargetUserId(undefined)
    setTargetUserName(undefined)
  }, [])

  const value: FloatingChatContextType = {
    isOpen,
    selectedConversationId,
    targetUserId,
    targetUserName,
    openChat,
    closeChat,
    selectConversation,
  }

  return (
    <FloatingChatContext.Provider value={value}>
      {children}
    </FloatingChatContext.Provider>
  )
}

export function useFloatingChat() {
  const context = useContext(FloatingChatContext)
  if (context === undefined) {
    throw new Error('useFloatingChat deve ser usado dentro de um FloatingChatProvider')
  }
  return context
}

