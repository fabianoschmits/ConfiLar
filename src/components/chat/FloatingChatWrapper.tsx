'use client'

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { FloatingChat } from '@/components/chat/FloatingChat'
import { Envelope } from '@phosphor-icons/react'

export default function FloatingChatWrapper() {
  const { user, profile } = useAuthContext()
  const { isOpen, selectedConversationId, targetUserId, targetUserName, closeChat, selectConversation, openChat } = useFloatingChat()
  const [isMinimized, setIsMinimized] = useState(false)

  // Não mostrar se não estiver logado
  if (!user || !profile) {
    return null
  }

  const handleToggle = () => {
    if (isOpen) {
      closeChat()
    } else {
      // Abrir chat normalmente
      openChat()
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
          <Envelope size={24} weight="light" />
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
