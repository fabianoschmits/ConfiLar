'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useSupabaseMessages } from '@/hooks/useSupabaseMessages'

interface FloatingChatContextType {
  isOpen: boolean
  selectedConversationId?: string
  targetUserId?: string
  targetUserName?: string
  openChat: (userId?: string, userName?: string) => void
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
  
  // Usar o hook de mensagens para verificar conversas existentes
  const { checkExistingConversation, setSelectedConversation: setSupabaseConversation, fetchMessages, createConversation } = useSupabaseMessages()

  const openChat = useCallback(async (userId?: string, userName?: string) => {
    setTargetUserId(userId)
    setTargetUserName(userName)
    setIsOpen(true)
    
    // Se há userId, verificar se já existe conversa
    if (userId) {
      try {
        console.log('🔍 Verificando conversa existente com:', userId)
        const existingConversationId = await checkExistingConversation(userId)
        
        if (existingConversationId) {
          console.log('✅ Conversa existente encontrada:', existingConversationId)
          // Abrir conversa existente
          setSelectedConversationId(existingConversationId)
          setSupabaseConversation(existingConversationId)
          await fetchMessages(existingConversationId)
        } else {
          console.log('🆕 Nenhuma conversa existente, criando nova conversa automaticamente')
          // Criar nova conversa automaticamente
          const newConversationId = await createConversation(userId)
          if (newConversationId) {
            setSelectedConversationId(newConversationId)
            setSupabaseConversation(newConversationId)
            await fetchMessages(newConversationId)
            // Limpar targetUserId após criar a conversa
            setTargetUserId(undefined)
            setTargetUserName(undefined)
          } else {
            console.error('❌ Erro ao criar conversa automaticamente')
            // Em caso de erro, preparar para nova conversa manual
            setSelectedConversationId(undefined)
            setSupabaseConversation(null)
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar/criar conversa:', error)
        // Em caso de erro, preparar para nova conversa manual
        setSelectedConversationId(undefined)
        setSupabaseConversation(null)
      }
    } else {
      // Se não há userId, apenas abre o chat sem conversa específica
      setSelectedConversationId(undefined)
      setSupabaseConversation(null)
    }
  }, [checkExistingConversation, setSupabaseConversation, fetchMessages, createConversation])

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
