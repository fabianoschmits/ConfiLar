'use client'

import { ReactNode } from 'react'
import { PWAStatus } from '@/components/pwa/PWAStatus'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      {children}
      <PWAStatus />
    </>
  )
}
