'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { toast as sonnerToast } from 'sonner'
import { soundManager } from '@/lib/soundManager'

// Interceptar toast.error para tocar som
const originalError = sonnerToast.error

// Sobrescrever o método error para adicionar som
sonnerToast.error = (message, data?) => {
  // Tocar som de erro
  soundManager.play('/sounds/New/error.mp3', { volume: 0.5 })
  
  // Chamar o toast original
  return originalError(message, data)
}

interface ToasterWithSoundsProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  richColors?: boolean
  [key: string]: any
}

export function ToasterWithSounds({ position = 'top-right', richColors = true, ...props }: ToasterWithSoundsProps) {
  useEffect(() => {
    // Pré-carregar som de erro
    soundManager.preload('/sounds/New/error.mp3').catch(err => {
      console.warn('⚠️ Erro ao pré-carregar som de erro:', err)
    })
  }, [])

  return <Toaster position={position} richColors={richColors} {...props} />
}

