'use client'

import React from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { FloatingChat } from '@/components/chat'

export default function FloatingChatWrapper() {
  const { user, profile } = useAuthContext()
  const pathname = usePathname()

  // Não mostrar se não estiver logado
  if (!user || !profile) {
    return null
  }

  // Não mostrar durante o onboarding
  if (pathname === '/onboarding') {
    return null
  }

  return (
    <>
      <FloatingChat />
    </>
  )
}
