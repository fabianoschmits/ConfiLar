'use client'

import { useEffect } from 'react'

interface HomePageLayoutProps {
  children: React.ReactNode
}

export function HomePageLayout({ children }: HomePageLayoutProps) {
  useEffect(() => {
    // Força o tema claro na página inicial
    const html = document.documentElement
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
    
    // Remove o dark mode do localStorage temporariamente
    const originalTheme = localStorage.getItem('theme')
    localStorage.setItem('theme', 'light')
    
    return () => {
      // Restaura o tema original quando sair da página
      if (originalTheme) {
        localStorage.setItem('theme', originalTheme)
        if (originalTheme === 'dark') {
          html.classList.add('dark')
        }
      } else {
        localStorage.removeItem('theme')
      }
    }
  }, [])

  return <>{children}</>
}
