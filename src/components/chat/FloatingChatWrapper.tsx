'use client'

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { FloatingChat } from '@/components/chat/FloatingChat'

export function FloatingChatWrapper() {
  const { user, profile } = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string>()

  // Não mostrar se não estiver logado
  if (!user || !profile) {
    return null
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (isMinimized) {
      setIsMinimized(false)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(true)
    setIsOpen(false)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
    setIsOpen(true)
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
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
    <FloatingChat
      isOpen={isOpen}
      onToggle={handleToggle}
      onMinimize={handleMinimize}
      onMaximize={handleMaximize}
      selectedConversationId={selectedConversationId}
      onSelectConversation={handleSelectConversation}
    />
  )
}
