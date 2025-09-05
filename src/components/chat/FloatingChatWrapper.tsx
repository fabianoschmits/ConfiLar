'use client'

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { FloatingChat } from '@/components/chat/FloatingChat'

export function FloatingChatWrapper() {
  const { user, profile } = useAuthContext()
  const { isOpen, selectedConversationId, targetUserId, targetUserName, closeChat, selectConversation } = useFloatingChat()
  const [isMinimized, setIsMinimized] = useState(false)

  // Não mostrar se não estiver logado
  if (!user || !profile) {
    return null
  }

  const handleToggle = () => {
    if (isOpen) {
      closeChat()
    } else {
      // Se há um targetUserId, abrir chat direto para essa conversa
      if (targetUserId) {
        // Aqui você pode implementar lógica para encontrar/criar conversa com targetUserId
        // Por enquanto, apenas abre o chat
      }
    }
    if (isMinimized) {
      setIsMinimized(false)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
  }

  const handleSelectConversation = (conversationId?: string) => {
    selectConversation(conversationId)
  }

  // Se estiver minimizado, mostrar apenas o botão
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleMaximize}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeChat}
        />
      )}
      
      <FloatingChat
        isOpen={isOpen}
        onToggle={handleToggle}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
      />
    </>
  )
}
