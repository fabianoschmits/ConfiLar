'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

interface LightModeLayoutProps {
  children: React.ReactNode
}

export function LightModeLayout({ children }: LightModeLayoutProps) {
  const { setTheme } = useTheme()

  useEffect(() => {
    // Forçar modo claro para estas páginas
    setTheme('light')
  }, [setTheme])

  return <>{children}</>
}
