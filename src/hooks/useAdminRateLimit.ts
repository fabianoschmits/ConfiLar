/**
 * Hook para rate limiting básico em operações admin
 * Previne abuso de requisições
 */

import { useState, useRef, useCallback } from 'react'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 30, // 30 requisições
  windowMs: 60 * 1000 // por minuto
}

export function useAdminRateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const requestTimestamps = useRef<number[]>([])
  const [isLimited, setIsLimited] = useState(false)

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now()
    const windowStart = now - finalConfig.windowMs

    // Remover timestamps fora da janela
    requestTimestamps.current = requestTimestamps.current.filter(
      timestamp => timestamp > windowStart
    )

    // Verificar se excedeu o limite
    if (requestTimestamps.current.length >= finalConfig.maxRequests) {
      setIsLimited(true)
      return false
    }

    // Adicionar timestamp atual
    requestTimestamps.current.push(now)
    setIsLimited(false)
    return true
  }, [finalConfig])

  const reset = useCallback(() => {
    requestTimestamps.current = []
    setIsLimited(false)
  }, [])

  return {
    checkRateLimit,
    isLimited,
    reset,
    remainingRequests: Math.max(0, finalConfig.maxRequests - requestTimestamps.current.length)
  }
}

