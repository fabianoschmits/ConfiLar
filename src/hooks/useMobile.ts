'use client'

import { useState, useEffect } from 'react'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Verificar se é mobile (menor que 768px)
      setIsMobile(width < 768)
      
      // Verificar se é tablet (entre 768px e 1024px)
      setIsTablet(width >= 768 && width < 1024)
      
      // Verificar orientação
      setOrientation(width > height ? 'landscape' : 'portrait')
    }

    // Verificar na inicialização
    checkDevice()

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkDevice)
    
    // Adicionar listener para mudanças de orientação
    window.addEventListener('orientationchange', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkDevice)
    }
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  }
}




