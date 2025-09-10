'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Carregando...', 
  className 
}: LoadingOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (isLoading) {
      // Pequeno delay para evitar flash se o loading for muito rápido
      const timer = setTimeout(() => {
        setShowOverlay(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setShowOverlay(false)
    }
  }, [isLoading])

  if (!showOverlay) return null

  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/20 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        className
      )}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center space-y-4 max-w-sm mx-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        
        <div className="text-center">
          <p className="text-gray-900 font-medium">{message}</p>
          <p className="text-sm text-gray-500 mt-1">
            Aguarde um momento...
          </p>
        </div>

        {/* Barra de progresso animada */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse" 
               style={{ 
                 animation: 'loading-bar 2s ease-in-out infinite',
                 width: '60%'
               }} 
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 60%; }
          100% { width: 100%; }
        }
      `}</style>
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
      className="bg-white/80"
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
      className="bg-blue-50/90"
    />
  )
}
