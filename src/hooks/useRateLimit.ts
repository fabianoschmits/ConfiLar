import { useState, useCallback, useRef, useEffect } from 'react'
import { logger } from '@/lib/logger'

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs?: number
  identifier?: string
}

interface RateLimitState {
  attempts: number
  remainingAttempts: number
  resetTime: number
  isBlocked: boolean
  blockExpiry?: number
}

interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  resetTime: number
  isBlocked: boolean
  retryAfter?: number
}

class RateLimitManager {
  private static instance: RateLimitManager
  private storage: Map<string, RateLimitState> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  private constructor() {
    // Limpar dados expirados a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries()
    }, 5 * 60 * 1000)
  }

  static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager()
    }
    return RateLimitManager.instance
  }

  private getStorageKey(identifier: string, type: string): string {
    return `rate_limit_${type}_${identifier}`
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.storage.forEach((state, key) => {
      if (state.resetTime < now && (!state.blockExpiry || state.blockExpiry < now)) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.storage.delete(key))
  }

  private getStoredState(identifier: string, type: string): RateLimitState | null {
    const key = this.getStorageKey(identifier, type)
    const stored = this.storage.get(key)
    
    if (!stored) return null

    const now = Date.now()
    
    // Se o window expirou, resetar
    if (stored.resetTime < now) {
      this.storage.delete(key)
      return null
    }

    // Se o bloqueio expirou, remover bloqueio
    if (stored.isBlocked && stored.blockExpiry && stored.blockExpiry < now) {
      stored.isBlocked = false
      stored.blockExpiry = undefined
    }

    return stored
  }

  private setStoredState(identifier: string, type: string, state: RateLimitState): void {
    const key = this.getStorageKey(identifier, type)
    this.storage.set(key, state)
  }

  checkLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const type = config.identifier || 'default'
    
    let state = this.getStoredState(identifier, type)
    
    if (!state) {
      // Primeira tentativa
      state = {
        attempts: 0,
        remainingAttempts: config.maxAttempts,
        resetTime: now + config.windowMs,
        isBlocked: false
      }
    }

    // Se está bloqueado, verificar se o bloqueio expirou
    if (state.isBlocked && state.blockExpiry && state.blockExpiry > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: state.resetTime,
        isBlocked: true,
        retryAfter: Math.ceil((state.blockExpiry - now) / 1000)
      }
    }

    // Se está bloqueado mas o bloqueio expirou, resetar
    if (state.isBlocked && state.blockExpiry && state.blockExpiry <= now) {
      state.isBlocked = false
      state.blockExpiry = undefined
    }

    // Verificar se ainda tem tentativas
    if (state.attempts >= config.maxAttempts) {
      // Aplicar bloqueio se configurado
      if (config.blockDurationMs) {
        state.isBlocked = true
        state.blockExpiry = now + config.blockDurationMs
      }
      
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: state.resetTime,
        isBlocked: state.isBlocked,
        retryAfter: state.isBlocked ? Math.ceil((state.blockExpiry! - now) / 1000) : Math.ceil((state.resetTime - now) / 1000)
      }
    }

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - state.attempts - 1,
      resetTime: state.resetTime,
      isBlocked: false
    }
  }

  recordAttempt(identifier: string, config: RateLimitConfig): void {
    const now = Date.now()
    const type = config.identifier || 'default'
    
    let state = this.getStoredState(identifier, type)
    
    if (!state) {
      state = {
        attempts: 0,
        remainingAttempts: config.maxAttempts,
        resetTime: now + config.windowMs,
        isBlocked: false
      }
    }

    state.attempts++
    state.remainingAttempts = Math.max(0, config.maxAttempts - state.attempts)

    // Se atingiu o limite, aplicar bloqueio se configurado
    if (state.attempts >= config.maxAttempts && config.blockDurationMs) {
      state.isBlocked = true
      state.blockExpiry = now + config.blockDurationMs
    }

    this.setStoredState(identifier, type, state)

    // Log da tentativa
    logger.warn('rate-limit', `Rate limit attempt recorded for ${identifier}`, {
      type,
      attempts: state.attempts,
      maxAttempts: config.maxAttempts,
      isBlocked: state.isBlocked,
      remainingAttempts: state.remainingAttempts
    })
  }

  resetLimit(identifier: string, type: string = 'default'): void {
    const key = this.getStorageKey(identifier, type)
    this.storage.delete(key)
    
    logger.info('Rate limit reset', 'rate-limit', { identifier, type })
  }

  getState(identifier: string, type: string = 'default'): RateLimitState | null {
    return this.getStoredState(identifier, type)
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.storage.clear()
  }
}

// Hook para usar rate limiting
export function useRateLimit() {
  const manager = useRef(RateLimitManager.getInstance())
  const [states, setStates] = useState<Map<string, RateLimitState>>(new Map())

  const checkRateLimit = useCallback((identifier: string, config: RateLimitConfig): RateLimitResult => {
    return manager.current.checkLimit(identifier, config)
  }, [])

  const recordAttempt = useCallback((identifier: string, config: RateLimitConfig): void => {
    manager.current.recordAttempt(identifier, config)
    
    // Atualizar estado local
    const state = manager.current.getState(identifier, config.identifier || 'default')
    if (state) {
      setStates(prev => new Map(prev.set(`${identifier}_${config.identifier || 'default'}`, state)))
    }
  }, [])

  const resetRateLimit = useCallback((identifier: string, type: string = 'default'): void => {
    manager.current.resetLimit(identifier, type)
    setStates(prev => {
      const newStates = new Map(prev)
      newStates.delete(`${identifier}_${type}`)
      return newStates
    })
  }, [])

  const getRateLimitState = useCallback((identifier: string, type: string = 'default'): RateLimitState | null => {
    return manager.current.getState(identifier, type)
  }, [])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      // Não destruir o manager global, apenas limpar referências locais
    }
  }, [])

  return {
    checkRateLimit,
    recordAttempt,
    resetRateLimit,
    getRateLimitState,
    states: Array.from(states.values())
  }
}

// Configurações predefinidas
export const RateLimitConfigs = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 30 * 60 * 1000, // 30 minutos de bloqueio
    identifier: 'login'
  },
  
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas de bloqueio
    identifier: 'password_reset'
  },
  
  EMAIL_VERIFICATION: {
    maxAttempts: 3,
    windowMs: 30 * 60 * 1000, // 30 minutos
    blockDurationMs: 60 * 60 * 1000, // 1 hora de bloqueio
    identifier: 'email_verification'
  },
  
  API_REQUESTS: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minuto
    identifier: 'api_requests'
  },
  
  MESSAGE_SENDING: {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minuto
    identifier: 'message_sending'
  },
  
  POST_CREATION: {
    maxAttempts: 5,
    windowMs: 60 * 1000, // 1 minuto
    identifier: 'post_creation'
  }
}

export type { RateLimitConfig, RateLimitResult, RateLimitState }
