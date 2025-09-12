'use client'

import { useEffect, useState } from 'react'
import { IconLoader2, IconBolt, IconRefresh } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'CARREGANDO...', 
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
        'bg-yellow-400/90 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        className
      )}
    >
      {/* Container Principal Brutalista */}
      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center space-y-6 max-w-sm mx-4">
        {/* Logo/Ícone Brutalista */}
        <div className="relative">
          <div className="w-16 h-16 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <span className="text-yellow-400 font-black text-2xl">C</span>
          </div>
          
          {/* Spinner Brutalista */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Texto Principal */}
        <div className="text-center space-y-2">
          <p className="text-black font-black text-lg uppercase tracking-wider">{message}</p>
          <p className="text-sm text-gray-700 font-bold uppercase">
            AGUARDE UM MOMENTO...
          </p>
        </div>

        {/* Barra de Progresso Brutalista */}
        <div className="w-full bg-gray-200 border-2 border-black rounded-none h-3 overflow-hidden">
          <div className="h-full bg-black border-2 border-black animate-pulse" 
               style={{ 
                 animation: 'brutalist-loading-bar 2s ease-in-out infinite',
                 width: '70%'
               }} 
          />
        </div>

        {/* Indicador de Status */}
        <div className="flex items-center space-x-2 text-xs font-black text-gray-700">
          <div className="w-2 h-2 bg-green-500 border border-black"></div>
          <span>SISTEMA ATIVO</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes brutalist-loading-bar {
          0% { width: 0%; }
          30% { width: 40%; }
          70% { width: 80%; }
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
      message={destination ? `NAVEGANDO PARA ${destination.toUpperCase()}...` : 'NAVEGANDO...'}
      className="bg-yellow-400/80"
    />
  )
}

// Componente para loading de autenticação
export function AuthLoadingOverlay({ 
  isLoading, 
  action = 'AUTENTICANDO...' 
}: { 
  isLoading: boolean
  action?: string 
}) {
  return (
    <LoadingOverlay 
      isLoading={isLoading}
      message={action}
      className="bg-yellow-400/90"
    />
  )
}

// Componente para loading de dados
export function DataLoadingOverlay({ 
  isLoading, 
  message = 'CARREGANDO DADOS...' 
}: { 
  isLoading: boolean
  message?: string 
}) {
  return (
    <LoadingOverlay 
      isLoading={isLoading}
      message={message}
      className="bg-yellow-400/85"
    />
  )
}

// Componente para loading de upload
export function UploadLoadingOverlay({ 
  isLoading, 
  message = 'ENVIANDO ARQUIVO...' 
}: { 
  isLoading: boolean
  message?: string 
}) {
  return (
    <LoadingOverlay 
      isLoading={isLoading}
      message={message}
      className="bg-yellow-400/90"
    />
  )
}
