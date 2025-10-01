'use client'

import { useState, useEffect } from 'react'
import { ModernNotificationCenter } from './ModernNotificationCenter'
import { MobileNotificationCenter } from './MobileNotificationCenter'

interface AdaptiveNotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function AdaptiveNotificationCenter({ isOpen, onClose }: AdaptiveNotificationCenterProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  if (isMobile) {
    return <MobileNotificationCenter isOpen={isOpen} onClose={onClose} />
  }

  return <ModernNotificationCenter isOpen={isOpen} onClose={onClose} />
}
