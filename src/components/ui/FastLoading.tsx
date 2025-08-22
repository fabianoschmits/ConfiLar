'use client'

import { Loader2 } from 'lucide-react'

interface FastLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  showText?: boolean
}

export function FastLoading({ 
  size = 'md', 
  text = 'Carregando...', 
  className = '',
  showText = true 
}: FastLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div 
          className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizeClasses[size]} ${showText ? 'mb-2' : ''}`}
          style={{ animationDuration: '0.6s' }}
        />
        {showText && (
          <p className={`text-gray-600 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

// Componente de loading para páginas inteiras
export function FastPageLoading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <FastLoading size="lg" text={text} />
    </div>
  )
}

// Componente de loading inline
export function FastInlineLoading({ text }: { text?: string }) {
  return (
    <FastLoading size="sm" text={text} showText={!!text} className="p-4" />
  )
}

// Componente de loading para botões
export function FastButtonLoading() {
  return (
    <Loader2 className="h-4 w-4 animate-spin mr-2" style={{ animationDuration: '0.6s' }} />
  )
}






