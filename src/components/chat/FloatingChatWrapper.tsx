'use client'

import React from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { FloatingChat } from '@/components/chat'

export default function FloatingChatWrapper() {
  const { user, profile } = useAuthContext()

  // Não mostrar se não estiver logado
  if (!user || !profile) {
    return null
  }

  return (
    <>
      <FloatingChat />
    </>
  )
}
