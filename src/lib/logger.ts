'use client'

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'metric'
  context: string
  message: string
  timestamp: string
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
  stack?: string
}

interface MetricEntry {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
}

class Logger {
  private static sessionId = Math.random().toString(36).substring(2, 15)
  private static isDevelopment = process.env.NODE_ENV === 'development'
  private static isProduction = process.env.NODE_ENV === 'production'

  private static getCurrentUserId(): string | undefined {
    try {
      // Tentar pegar do contexto de auth se disponível
      if (typeof window !== 'undefined' && window.localStorage) {
        const auth = window.localStorage.getItem('supabase.auth.token')
        if (auth) {
          const parsed = JSON.parse(auth)
          return parsed?.user?.id
        }
      }
    } catch {
      // Ignore errors
    }
    return undefined
  }

  private static createLogEntry(
    level: LogEntry['level'],
    context: string,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      context,
      message,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      metadata,
      stack: error?.stack
    }
  }

  private static log(entry: LogEntry) {
    // Console para desenvolvimento
    if (this.isDevelopment) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        metric: '📊'
      }[entry.level]

      const style = {
        debug: 'color: #888',
        info: 'color: #0066cc',
        warn: 'color: #ff9900',
        error: 'color: #cc0000',
        metric: 'color: #9900cc'
      }[entry.level]

      console.groupCollapsed(
        `${emoji} %c[${entry.context}] ${entry.message}`,
        style
      )
      console.log('📅 Timestamp:', entry.timestamp)
      if (entry.userId) console.log('👤 User ID:', entry.userId)
      console.log('🎯 Session ID:', entry.sessionId)
      if (entry.metadata) console.log('📋 Metadata:', entry.metadata)
      if (entry.stack) console.log('📚 Stack:', entry.stack)
      console.groupEnd()
    }

    // Enviar para serviço de logging em produção
    if (this.isProduction) {
      this.sendToLoggingService(entry)
    }
  }

  private static sendToLoggingService(entry: LogEntry) {
    // Em produção, você pode enviar para serviços como:
    // - Sentry, LogRocket, DataDog, etc.
    // Por enquanto, vamos apenas manter no localStorage para debug
    try {
      const logs = JSON.parse(localStorage.getItem('app-logs') || '[]')
      logs.push(entry)
      
      // Manter apenas os últimos 100 logs
      if (logs.length > 100) {
        logs.shift()
      }
      
      localStorage.setItem('app-logs', JSON.stringify(logs))
    } catch {
      // Ignore storage errors
    }
  }

  // Métodos públicos
  static debug(context: string, message: string, metadata?: Record<string, any>) {
    this.log(this.createLogEntry('debug', context, message, metadata))
  }

  static info(context: string, message: string, metadata?: Record<string, any>) {
    this.log(this.createLogEntry('info', context, message, metadata))
  }

  static warn(context: string, message: string, metadata?: Record<string, any>) {
    this.log(this.createLogEntry('warn', context, message, metadata))
  }

  static error(context: string, error: Error | string, metadata?: Record<string, any>) {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    this.log(this.createLogEntry('error', context, errorObj.message, metadata, errorObj))
  }

  static metric(name: string, data: MetricEntry) {
    this.log(this.createLogEntry('metric', 'performance', `${name}: ${data.value}${data.unit || ''}`, {
      metric: {
        name,
        value: data.value,
        unit: data.unit,
        tags: data.tags
      }
    }))
  }

  // Utilitários para contextos específicos
  static auth = {
    login: (email: string, success: boolean, metadata?: Record<string, any>) => {
      Logger.info('auth', `Login ${success ? 'successful' : 'failed'} for ${email}`, {
        action: 'login',
        email,
        success,
        ...metadata
      })
    },

    logout: (userId: string) => {
      Logger.info('auth', `User ${userId} logged out`, {
        action: 'logout',
        userId
      })
    },

    profileFetch: (userId: string, success: boolean, cached: boolean = false) => {
      Logger.debug('auth', `Profile fetch ${success ? 'successful' : 'failed'} for ${userId}`, {
        action: 'profile_fetch',
        userId,
        success,
        cached
      })
    },

    sessionTimeout: (userId: string, reason: string) => {
      Logger.warn('auth', `Session timeout for ${userId}: ${reason}`, {
        action: 'session_timeout',
        userId,
        reason
      })
    }
  }

  static api = {
    request: (endpoint: string, method: string, duration: number) => {
      Logger.debug('api', `${method} ${endpoint} completed in ${duration}ms`, {
        endpoint,
        method,
        duration
      })
    },

    error: (endpoint: string, method: string, error: Error, statusCode?: number) => {
      Logger.error('api', error, {
        endpoint,
        method,
        statusCode
      })
    },

    cacheHit: (key: string) => {
      Logger.debug('api', `Cache hit for ${key}`, {
        action: 'cache_hit',
        key
      })
    },

    cacheMiss: (key: string) => {
      Logger.debug('api', `Cache miss for ${key}`, {
        action: 'cache_miss',
        key
      })
    }
  }

  static ui = {
    pageView: (page: string, loadTime?: number) => {
      Logger.info('ui', `Page view: ${page}`, {
        action: 'page_view',
        page,
        loadTime
      })
    },

    userAction: (action: string, element: string, metadata?: Record<string, any>) => {
      Logger.debug('ui', `User action: ${action} on ${element}`, {
        action: 'user_action',
        element,
        actionType: action,
        ...metadata
      })
    },

    errorBoundary: (error: Error, componentStack: string) => {
      Logger.error('ui', error, {
        action: 'error_boundary',
        componentStack
      })
    }
  }

  static performance = {
    webVital: (name: string, value: number, rating: string) => {
      Logger.metric(name, {
        name,
        value,
        unit: 'ms',
        tags: { rating, type: 'web_vital' }
      })
    },

    renderTime: (component: string, duration: number) => {
      Logger.metric('component_render', {
        name: 'component_render',
        value: duration,
        unit: 'ms',
        tags: { component }
      })
    },

    bundleSize: (chunk: string, size: number) => {
      Logger.metric('bundle_size', {
        name: 'bundle_size',
        value: size,
        unit: 'bytes',
        tags: { chunk }
      })
    }
  }

  // Método para debug em desenvolvimento
  static getLogs(): LogEntry[] {
    if (!this.isDevelopment) return []
    
    try {
      return JSON.parse(localStorage.getItem('app-logs') || '[]')
    } catch {
      return []
    }
  }

  static clearLogs() {
    if (this.isDevelopment) {
      localStorage.removeItem('app-logs')
      console.clear()
    }
  }
}

// Hook para usar logging em componentes React
export function useLogger(context: string) {
  return {
    debug: (message: string, metadata?: Record<string, any>) => 
      Logger.debug(context, message, metadata),
    
    info: (message: string, metadata?: Record<string, any>) => 
      Logger.info(context, message, metadata),
    
    warn: (message: string, metadata?: Record<string, any>) => 
      Logger.warn(context, message, metadata),
    
    error: (error: Error | string, metadata?: Record<string, any>) => 
      Logger.error(context, error, metadata),
    
    metric: (name: string, data: MetricEntry) => 
      Logger.metric(name, data)
  }
}

export { Logger }
export type { LogEntry, MetricEntry }

