'use client'

/**
 * Interceptor de Erros para ConfiLar
 * Trata erros comuns como runtime.lastError e problemas de conexão
 */

interface ErrorInfo {
  message: string
  source: string
  line?: number
  column?: number
  stack?: string
  timestamp: string
}

class ErrorInterceptor {
  private isInitialized = false
  private errorCount = 0
  private maxErrors = 10

  constructor() {
    this.init()
  }

  private init() {
    if (this.isInitialized) return
    
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') {
      console.log('🛡️ ErrorInterceptor: Executando no servidor, pulando inicialização')
      return
    }
    
    this.isInitialized = true

    // Interceptar runtime.lastError
    this.interceptRuntimeErrors()
    
    // Interceptar erros de conexão
    this.interceptConnectionErrors()
    
    // Interceptar erros de extensões
    this.interceptExtensionErrors()
    
    console.log('🛡️ ErrorInterceptor inicializado')
  }

  private interceptRuntimeErrors() {
    // Interceptar runtime.lastError (erro comum de extensões)
    const originalConsoleError = console.error
    
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      
      // Filtrar erros conhecidos e não críticos
      if (this.shouldIgnoreError(message)) {
        return
      }
      
      // Log do erro original
      originalConsoleError.apply(console, args)
      
      // Tratar runtime.lastError especificamente
      if (message.includes('runtime.lastError') || message.includes('Could not establish connection')) {
        this.handleRuntimeError(message)
      }
    }
  }

  private interceptConnectionErrors() {
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') return
    
    // Interceptar erros de fetch/XMLHttpRequest
    const originalFetch = window.fetch
    
    window.fetch = async (...args: any[]) => {
      try {
        return await originalFetch.apply(window, args)
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          this.handleConnectionError(error.message)
        }
        throw error
      }
    }
  }

  private interceptExtensionErrors() {
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') return
    
    // Interceptar erros de extensões do navegador
    window.addEventListener('error', (event) => {
      const message = event.message || event.error?.message || ''
      
      if (this.shouldIgnoreError(message)) {
        return
      }
      
      this.handleGenericError({
        message,
        source: event.filename || 'unknown',
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      })
    })

    // Interceptar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      const message = event.reason?.message || String(event.reason)
      
      if (this.shouldIgnoreError(message)) {
        return
      }
      
      this.handleGenericError({
        message: `Unhandled Promise Rejection: ${message}`,
        source: 'promise',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      })
    })
  }

  private shouldIgnoreError(message: string): boolean {
    const ignoredPatterns = [
      'runtime.lastError',
      'Could not establish connection',
      'Receiving end does not exist',
      'Extension context invalidated',
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Script error',
      'Network request failed',
      'Failed to fetch'
    ]

    return ignoredPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  private handleRuntimeError(message: string) {
    this.errorCount++
    
    if (this.errorCount > this.maxErrors) {
      console.warn('🚫 Muitos erros de runtime detectados, ignorando...')
      return
    }

    console.warn('⚠️ Erro de runtime interceptado:', message)
    console.info('💡 Dica: Este erro geralmente é causado por extensões do navegador')
    
    // Não fazer nada mais - apenas logar e continuar
  }

  private handleConnectionError(message: string) {
    console.warn('🌐 Erro de conexão interceptado:', message)
    console.info('💡 Verificando conectividade...')
    
    // Verificar se estamos no cliente e se está online
    if (typeof window !== 'undefined' && !navigator.onLine) {
      console.warn('📴 Aplicação está offline')
    }
  }

  private handleGenericError(errorInfo: ErrorInfo) {
    this.errorCount++
    
    if (this.errorCount > this.maxErrors) {
      return
    }

    console.warn('⚠️ Erro interceptado:', errorInfo.message)
    
    // Em desenvolvimento, mostrar mais detalhes
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Detalhes do Erro')
      console.log('Mensagem:', errorInfo.message)
      console.log('Fonte:', errorInfo.source)
      console.log('Linha:', errorInfo.line)
      console.log('Coluna:', errorInfo.column)
      console.log('Timestamp:', errorInfo.timestamp)
      if (errorInfo.stack) {
        console.log('Stack:', errorInfo.stack)
      }
      console.groupEnd()
    }
  }

  // Método público para resetar contador
  public resetErrorCount() {
    this.errorCount = 0
    console.log('🔄 Contador de erros resetado')
  }

  // Método público para verificar status
  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      errorCount: this.errorCount,
      maxErrors: this.maxErrors
    }
  }
}

// Instância global - só criar no cliente
let errorInterceptor: ErrorInterceptor | null = null

// Função para obter ou criar a instância
function getErrorInterceptor() {
  if (typeof window === 'undefined') {
    return null
  }
  
  if (!errorInterceptor) {
    errorInterceptor = new ErrorInterceptor()
  }
  
  return errorInterceptor
}

export default getErrorInterceptor

// Hook para usar em componentes React
export function useErrorInterceptor() {
  const interceptor = getErrorInterceptor()
  
  return {
    resetErrorCount: () => {
      if (interceptor) {
        interceptor.resetErrorCount()
      }
    },
    getStatus: () => {
      if (interceptor) {
        return interceptor.getStatus()
      }
      return { isInitialized: false, errorCount: 0, maxErrors: 10 }
    }
  }
}
