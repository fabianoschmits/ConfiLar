'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { useAuthContext } from '@/contexts/AuthContext'

interface FloatingChatContextType {
  isOpen: boolean
  selectedConversationId?: string
  targetUserId?: string
  targetUserName?: string
  openChat: (userIdOrConversationId?: string, userName?: string) => void
  closeChat: () => void
  selectConversation: (conversationId?: string) => void
  setSelectedConversation: (conversationId?: string) => void
}

const FloatingChatContext = createContext<FloatingChatContextType | undefined>(undefined)

export function FloatingChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>()
  const [targetUserId, setTargetUserId] = useState<string | undefined>()
  const [targetUserName, setTargetUserName] = useState<string | undefined>()
  
  // Obter usuário atual
  const { user } = useAuthContext()
  
  // Usar o hook de mensagens para verificar conversas existentes
  const { createOrFindConversation } = useMessages()

  const openChat = useCallback(async (userIdOrConversationId?: string, userName?: string) => {
    console.log('🔐 Abrindo chat...', { userIdOrConversationId, userName })
    
    // Se não há parâmetro, apenas abrir o chat (lista de conversas)
    if (!userIdOrConversationId) {
      console.log('📋 Abrindo lista de conversas')
      setSelectedConversationId(undefined)
      setTargetUserId(undefined)
      setTargetUserName(undefined)
      setIsOpen(true)
      return
    }
    
    // Verificar se é um conversationId (UUID) ou userId
    const isConversationId = userIdOrConversationId.includes('-') && userIdOrConversationId.length === 36
    
    if (isConversationId) {
      // É um conversationId - abrir conversa diretamente
      console.log('💬 Abrindo conversa existente:', userIdOrConversationId)
      setSelectedConversationId(userIdOrConversationId)
      setTargetUserId(undefined)
      setTargetUserName(undefined)
      setIsOpen(true)
      return
    }
    
    // É um userId - criar nova conversa
    console.log('🆕 Criando nova conversa com userId:', userIdOrConversationId, 'userName:', userName)
    setTargetUserId(userIdOrConversationId)
    setTargetUserName(userName)
    setIsOpen(true)
    
    try {
      console.log('🆕 Criando nova conversa com:', userIdOrConversationId)
      if (!user?.id) {
        console.error('❌ Usuário não autenticado')
        return
      }
      
      console.log('🔐 Chamando createOrFindConversation com:', user.id, userIdOrConversationId)
      const newConversationId = await createOrFindConversation(user.id, userIdOrConversationId)
      console.log('🔐 Resultado createOrFindConversation:', newConversationId)
      
      if (newConversationId) {
        console.log('✅ Conversa criada/encontrada:', newConversationId)
        console.log('🔐 Definindo selectedConversationId:', newConversationId)
        setSelectedConversationId(newConversationId)
        // Limpar targetUserId após criar a conversa
        setTargetUserId(undefined)
        setTargetUserName(undefined)
        // Garantir que o chat esteja aberto e expandido
        console.log('🔐 Garantindo que chat esteja aberto')
        setIsOpen(true)
      } else {
        console.error('❌ Falha ao criar/encontrar conversa')
      }
    } catch (error) {
      console.error('❌ Erro ao criar conversa:', error)
    }
  }, [createOrFindConversation, user?.id])

  const closeChat = useCallback(() => {
    setIsOpen(false)
    setSelectedConversationId(undefined)
    setTargetUserId(undefined)
    setTargetUserName(undefined)
  }, [])

  const selectConversation = useCallback((conversationId?: string) => {
    setSelectedConversationId(conversationId)
    
    // Se conversationId é undefined, limpar targetUserId para voltar à lista de conversas
    if (conversationId === undefined) {
      setTargetUserId(undefined)
      setTargetUserName(undefined)
    }
  }, [])

  const setSelectedConversation = useCallback((conversationId?: string) => {
    setSelectedConversationId(conversationId)
  }, [])

  return (
    <FloatingChatContext.Provider
      value={{
        isOpen,
        selectedConversationId,
        targetUserId,
        targetUserName,
        openChat,
        closeChat,
        selectConversation,
        setSelectedConversation
      }}
    >
      {children}
    </FloatingChatContext.Provider>
  )
}

export function useFloatingChat() {
  const context = useContext(FloatingChatContext)
  if (context === undefined) {
    throw new Error('useFloatingChat must be used within a FloatingChatProvider')
  }
  return context
}
