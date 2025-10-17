'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
  variant?: 'default' | 'minimal' | 'navigation' | 'auth' | 'data'
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Carregando...', 
  className,
  variant = 'default'
}: LoadingOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isLoading) {
      // Delay mínimo para evitar flash em loadings muito rápidos
      const timer = setTimeout(() => {
        setShowOverlay(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      // Delay para suavizar a saída
      const timer = setTimeout(() => {
        setShowOverlay(false)
        setProgress(0)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Simulação de progresso para dar sensação de velocidade
  useEffect(() => {
    if (showOverlay) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 100)
      
      return () => clearInterval(interval)
    }
  }, [showOverlay])

  if (!showOverlay) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-white/40 backdrop-blur-md'
      case 'navigation':
        return 'bg-blue-500/20 backdrop-blur-lg'
      case 'auth':
        return 'bg-purple-500/20 backdrop-blur-lg'
      case 'data':
        return 'bg-green-500/20 backdrop-blur-lg'
      default:
        return 'bg-gray-900/20 backdrop-blur-lg'
    }
  }

  const getSpinnerColor = () => {
    switch (variant) {
      case 'navigation':
        return 'text-blue-600'
      case 'auth':
        return 'text-purple-600'
      case 'data':
        return 'text-green-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div 
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center',
        'transition-all duration-200 ease-out',
        getVariantStyles(),
        className
      )}
    >
      {/* Container Principal Moderno */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-8 flex flex-col items-center space-y-6 max-w-sm mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        
        {/* Logo/Spinner Moderno */}
        <div className="relative">
          {/* Logo ConfiLar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
        <Image
          src="/imagens/logo/confilarlogo5.png"
          alt="ConfiLar Logo"
          width={48}
          height={48}
          priority
          className="w-12 h-12 object-contain"
        />
          </div>
          
          {/* Spinner Moderno */}
          <div className="absolute inset-0">
            <Loader2 className={cn("w-16 h-16 animate-spin", getSpinnerColor())} strokeWidth={1.5} />
          </div>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 w-16 h-16 bg-blue-500/20 rounded-xl animate-pulse"></div>
        </div>
        
        {/* Texto Principal */}
        <div className="text-center space-y-2">
          <p className="text-gray-900 font-semibold text-lg">{message}</p>
          <p className="text-sm text-gray-600">
            Isso será rápido...
          </p>
        </div>

        {/* Barra de Progresso Moderna */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Indicador de Status */}
        <div className="flex items-center space-x-2 text-xs font-medium text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Sistema ativo</span>
        </div>
      </div>
    </div>
  )
}

// Componente para loading de navegação específico
export function NavigationLoadingOverlay({ 
  isLoading, 
  destination 
}: { 
  isLoading: boolean
  destination?: string 
}) {
  return (
    <LoadingOverlay 
      isLoading={isLoading}
      message={destination ? `Navegando para ${destination}...` : 'Navegando...'}
      variant="navigation"
    />
  )
}

// Componente para loading de autenticação
export function AuthLoadingOverlay({ 
  isLoading, 
  action = 'Autenticando...' 
}: { 
  isLoading: boolean
  action?: string 
}) {
  return (
    <LoadingOverlay 
      isLoading={isLoading}
      message={action}
      variant="auth"
    />
  )
}

// Componente para loading de dados
export function DataLoadingOverlay({ 
  isLoading, 
  message = 'Carregando dados...' 
}: { 
  isLoading: boolean
  message?: string 
}) {
  return (
    <LoadingOverlay 
      isLoading={isLoading}
      message={message}
      variant="data"
    />
  )
}

// Componente minimalista para loading rápido
export function MinimalLoadingOverlay({ 
  isLoading 
}: { 
  isLoading: boolean 
}) {
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowOverlay(true), 50)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => setShowOverlay(false), 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!showOverlay) return null

  return (
    <div className="fixed inset-0 z-[100] bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm flex items-center justify-center transition-all duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" strokeWidth={2} />
      </div>
    </div>
  )
}

// Componente para loading de página inteira
export function PageLoadingOverlay({ 
  isLoading,
  message = 'Carregando página...'
}: { 
  isLoading: boolean
  message?: string 
}) {
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setShowOverlay(true)
    } else {
      // Pequeno delay para transição suave
      const timer = setTimeout(() => setShowOverlay(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!showOverlay) return null

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-md flex items-center justify-center transition-all duration-300">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-2xl p-6 flex flex-col items-center space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
        
        {/* Spinner com logo */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <img 
              src="/imagens/logo/confilarlogo5.png" 
              alt="ConfiLar Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <Loader2 className="absolute inset-0 w-12 h-12 text-blue-600/30 animate-spin" strokeWidth={1} />
        </div>
        
        {/* Texto */}
        <div className="text-center">
          <p className="text-gray-900 dark:text-white font-medium">{message}</p>
        </div>
        
        {/* Indicador de progresso */}
        <div className="flex space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente para loading inline
export function InlineLoading({ 
  message = 'Carregando...',
  size = 'default'
}: { 
  message?: string
  size?: 'sm' | 'default' | 'lg'
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-6 py-4 text-lg'
      default:
        return 'px-4 py-3'
    }
  }

  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-6 h-6'
      default:
        return 'w-5 h-5'
    }
  }

  return (
    <div className={cn(
      "bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center space-x-3",
      getSizeClasses()
    )}>
      <Loader2 className={cn("text-blue-600 animate-spin", getSpinnerSize())} />
      <span className="text-gray-700 font-medium">{message}</span>
    </div>
  )
}