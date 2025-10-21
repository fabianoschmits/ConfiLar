'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Logger } from '@/lib/logger'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 2

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Gerar ID único para o erro
    const errorId = Math.random().toString(36).substring(2, 15)
    
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Incrementar contador de retry
    this.retryCount++

    // Capturar contexto detalhado do erro
    const errorContext = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled
      },
      page: {
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        referrer: document.referrer
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      },
      performance: {
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null
      },
      timestamp: new Date().toISOString(),
      retryCount: this.retryCount,
      errorId: this.state.errorId
    }

    // Log estruturado do erro
    Logger.ui.errorBoundary(error, errorInfo.componentStack)

    // Salvar detalhes do erro no estado
    this.setState({ 
      errorInfo,
      error
    })

    // Callback personalizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Verificar se é um erro conhecido e ignorável
    if (this.isIgnorableError(error)) {
      Logger.debug('error-boundary', 'Ignorable error detected, auto-recovering', { 
        errorMessage: error.message 
      })
      
      // Auto-recovery para erros conhecidos
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
      }, 1000)
      return
    }

    // Reportar para serviços externos em produção
    if (process.env.NODE_ENV === 'production') {
      this.reportToExternalServices(errorContext)
    }
  }

  private isIgnorableError(error: Error): boolean {
    const ignorableErrors = [
      'RovingFocusGroupItem',
      'ChunkLoadError',
      'Loading chunk',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed'
    ]

    return ignorableErrors.some(pattern => 
      error.message.includes(pattern) || error.stack?.includes(pattern)
    )
  }

  private reportToExternalServices(errorContext: any) {
    // Aqui você pode integrar com serviços como:
    // - Sentry
    // - LogRocket
    // - Bugsnag
    // - Rollbar
    // - DataDog
    
    // Exemplo para Sentry:
    // Sentry.captureException(errorContext.error.message, {
    //   contexts: errorContext,
    //   tags: {
    //     errorBoundary: true,
    //     retryCount: errorContext.retryCount
    //   }
    // })

    // Por enquanto, salvar no localStorage para debug
    try {
      const savedErrors = JSON.parse(localStorage.getItem('error-reports') || '[]')
      savedErrors.push(errorContext)
      
      // Manter apenas os últimos 10 erros
      if (savedErrors.length > 10) {
        savedErrors.shift()
      }
      
      localStorage.setItem('error-reports', JSON.stringify(savedErrors))
    } catch {
      // Ignore storage errors
    }
  }

  private handleRetry = () => {
    Logger.info('error-boundary', 'User requested retry', { 
      retryCount: this.retryCount,
      errorId: this.state.errorId 
    })
    
    if (this.retryCount < this.maxRetries) {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    } else {
      // Forçar reload se exceder max retries
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    Logger.info('error-boundary', 'User navigating to home', { 
      errorId: this.state.errorId 
    })
    
    window.location.href = '/'
  }

  private handleReportBug = () => {
    Logger.info('error-boundary', 'User reporting bug', { 
      errorId: this.state.errorId 
    })

    // Criar link para reportar bug com informações preenchidas
    const errorDetails = {
      errorMessage: this.state.error?.message,
      errorStack: this.state.error?.stack?.substring(0, 500),
      componentStack: this.state.errorInfo?.componentStack?.substring(0, 500),
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId
    }

    const bugReportUrl = `mailto:suporte@appconfilar.com.br?subject=Bug Report - ${this.state.errorId}&body=${encodeURIComponent(JSON.stringify(errorDetails, null, 2))}`
    window.open(bugReportUrl)
  }

  render() {
    if (this.state.hasError) {
      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Renderizar UI de erro padrão
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-lg w-full text-center">
            
            {/* Ícone de erro */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Ops! Algo deu errado
              </h1>
              <p className="text-gray-600">
                Encontramos um erro inesperado. Nossa equipe foi notificada e estamos trabalhando para corrigi-lo.
              </p>
            </div>

            {/* ID do erro */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-500 mb-1">ID do Erro</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {this.state.errorId}
              </p>
            </div>

            {/* Ações */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                disabled={this.retryCount >= this.maxRetries}
              >
                <RefreshCw className="w-4 h-4" />
                {this.retryCount >= this.maxRetries ? 'Recarregar Página' : 'Tentar Novamente'}
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ir para Início
              </button>

              <button
                onClick={this.handleReportBug}
                className="w-full bg-gray-50 text-gray-600 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
              >
                <Bug className="w-4 h-4" />
                Reportar Problema
              </button>
            </div>

            {/* Detalhes técnicos (apenas em desenvolvimento) */}
            {this.props.showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
                  Detalhes Técnicos (Desenvolvimento)
                </summary>
                <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Erro:</h4>
                    <p className="text-xs text-red-700 font-mono break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                  
                  {this.state.error.stack && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Stack Trace:</h4>
                      <pre className="text-xs text-red-700 bg-red-100 p-2 rounded overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">Component Stack:</h4>
                      <pre className="text-xs text-red-700 bg-red-100 p-2 rounded overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Informações de contato */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Se o problema persistir, entre em contato conosco em{' '}
                <a 
                  href="mailto:suporte@appconfilar.com.br" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  suporte@appconfilar.com.br
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar error boundary programaticamente
export function useErrorHandler() {
  return {
    reportError: (error: Error, context?: string) => {
      Logger.error(context || 'manual-error', error)
      
      // Em produção, você pode forçar o error boundary
      if (process.env.NODE_ENV === 'production') {
        // Implementar lógica para reportar erro manualmente
        console.error('Manual error reported:', error)
      }
    },
    
    getErrorReports: () => {
      try {
        return JSON.parse(localStorage.getItem('error-reports') || '[]')
      } catch {
        return []
      }
    },
    
    clearErrorReports: () => {
      localStorage.removeItem('error-reports')
    }
  }
}

// HOC para envolver componentes com error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}