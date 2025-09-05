'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface FloatingChatContextType {
  isOpen: boolean
  selectedConversationId?: string
  targetUserId?: string
  targetUserName?: string
  openChat: (userId?: string, userName?: string) => void
  closeChat: () => void
  selectConversation: (conversationId?: string) => void
}

const FloatingChatContext = createContext<FloatingChatContextType | undefined>(undefined)

export function FloatingChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>()
  const [targetUserId, setTargetUserId] = useState<string | undefined>()
  const [targetUserName, setTargetUserName] = useState<string | undefined>()

  const openChat = useCallback((userId?: string, userName?: string) => {
    setTargetUserId(userId)
    setTargetUserName(userName)
    setIsOpen(true)
    
    // Se não há userId, apenas abre o chat sem conversa específica
    if (!userId) {
      setSelectedConversationId(undefined)
    }
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
    setSelectedConversationId(undefined)
    setTargetUserId(undefined)
    setTargetUserName(undefined)
  }, [])

  const selectConversation = useCallback((conversationId?: string) => {
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
        selectConversation
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
