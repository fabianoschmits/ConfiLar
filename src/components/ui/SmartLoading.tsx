'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface SmartLoadingProps {
  loading: boolean
  error?: string | null
  message?: string
  timeout?: number
  onTimeout?: () => void
}

export function SmartLoading({ 
  loading, 
  error, 
  message = 'Carregando...', 
  timeout = 8000,
  onTimeout 
}: SmartLoadingProps) {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!loading) return

    // Mostrar aviso após 5 segundos
    const warningTimeout = setTimeout(() => {
      setShowTimeoutWarning(true)
    }, 5000)

    // Timeout final após 8 segundos
    const finalTimeout = setTimeout(() => {
      if (onTimeout) {
        onTimeout()
      }
    }, timeout)

    // Animação de pontos
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => {
      clearTimeout(warningTimeout)
      clearTimeout(finalTimeout)
      clearInterval(dotsInterval)
    }
  }, [loading, timeout, onTimeout])

  useEffect(() => {
    if (!loading) {
      setShowTimeoutWarning(false)
      setDots('')
    }
  }, [loading])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Erro de Conexão</h3>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        {/* Spinner */}
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>

        {/* Mensagem principal */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
          <p className="text-sm text-gray-600 mt-2">
            Aguarde enquanto processamos{dots}
          </p>
        </div>

        {/* Aviso de timeout */}
        {showTimeoutWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Demora na conexão</p>
                <p>Isso pode indicar problemas de rede. Aguarde mais alguns segundos...</p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>

        {/* Dicas */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Verificando credenciais</p>
          <p>• Carregando perfil do usuário</p>
          <p>• Preparando interface</p>
        </div>
      </div>
    </div>
  )
}

interface AuthLoadingProps {
  loading: boolean
  error?: string | null
  isReady: boolean
  onRetry?: () => void
}

export function AuthLoading({ loading, error, isReady, onRetry }: AuthLoadingProps) {
  const [step, setStep] = useState(0)
  const steps = [
    'Verificando autenticação',
    'Carregando perfil',
    'Preparando interface'
  ]

  useEffect(() => {
    if (!loading) return

    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [loading, steps.length])

  useEffect(() => {
    if (isReady) {
      setStep(steps.length - 1)
    }
  }, [isReady, steps.length])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Erro de Autenticação</h3>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        {/* Spinner */}
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>

        {/* Passo atual */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{steps[step]}</h3>
          <p className="text-sm text-gray-600 mt-2">
            {step === 0 && 'Verificando se você está logado...'}
            {step === 1 && 'Carregando informações do seu perfil...'}
            {step === 2 && 'Preparando a interface para você...'}
          </p>
        </div>

        {/* Indicador de progresso */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= step ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }} 
          />
        </div>
      </div>
    </div>
  )
}

