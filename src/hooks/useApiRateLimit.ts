import { useCallback } from 'react'
import { useRateLimit, RateLimitConfigs } from '@/hooks/useRateLimit'
import { useAuthContext } from '@/contexts/AuthContext'
import { Logger } from '@/lib/logger'

interface ApiRateLimitOptions {
  endpoint: string
  method: string
  customConfig?: {
    maxAttempts: number
    windowMs: number
    blockDurationMs?: number
  }
}

export function useApiRateLimit() {
  const { checkRateLimit, recordAttempt } = useRateLimit()
  const { user } = useAuthContext()

  const checkApiRateLimit = useCallback(async (options: ApiRateLimitOptions): Promise<{
    allowed: boolean
    retryAfter?: number
    remainingAttempts: number
  }> => {
    const identifier = user?.id || 'anonymous'
    const config = options.customConfig || RateLimitConfigs.API_REQUESTS
    
    const result = checkRateLimit(identifier, {
      ...config,
      identifier: `api_${options.endpoint}_${options.method}`
    })

    if (!result.allowed) {
      Logger.warn('api-rate-limit', `Rate limit exceeded for ${options.endpoint}`, {
        endpoint: options.endpoint,
        method: options.method,
        identifier,
        remainingAttempts: result.remainingAttempts,
        isBlocked: result.isBlocked,
        retryAfter: result.retryAfter
      })
    }

    return {
      allowed: result.allowed,
      retryAfter: result.retryAfter,
      remainingAttempts: result.remainingAttempts
    }
  }, [checkRateLimit, user?.id])

  const recordApiAttempt = useCallback((options: ApiRateLimitOptions) => {
    const identifier = user?.id || 'anonymous'
    const config = options.customConfig || RateLimitConfigs.API_REQUESTS
    
    recordAttempt(identifier, {
      ...config,
      identifier: `api_${options.endpoint}_${options.method}`
    })

    Logger.debug('api-rate-limit', `API attempt recorded for ${options.endpoint}`, {
      endpoint: options.endpoint,
      method: options.method,
      identifier
    })
  }, [recordAttempt, user?.id])

  const withRateLimit = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: ApiRateLimitOptions
  ): Promise<T> => {
    // Verificar rate limit antes da chamada
    const rateLimitResult = await checkApiRateLimit(options)
    
    if (!rateLimitResult.allowed) {
      throw new Error(
        rateLimitResult.retryAfter 
          ? `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`
          : 'Rate limit exceeded. Please try again later.'
      )
    }

    try {
      // Fazer a chamada da API
      const result = await apiCall()
      return result
    } catch (error) {
      // Registrar tentativa falhada
      recordApiAttempt(options)
      throw error
    }
  }, [checkApiRateLimit, recordApiAttempt])

  return {
    checkApiRateLimit,
    recordApiAttempt,
    withRateLimit
  }
}

// Hook específico para operações de mensagens
export function useMessageRateLimit() {
  const { checkRateLimit, recordAttempt } = useRateLimit()
  const { user } = useAuthContext()

  const checkMessageRateLimit = useCallback(async (): Promise<{
    allowed: boolean
    retryAfter?: number
    remainingAttempts: number
  }> => {
    const identifier = user?.id || 'anonymous'
    const result = checkRateLimit(identifier, RateLimitConfigs.MESSAGE_SENDING)

    if (!result.allowed) {
      Logger.warn('message-rate-limit', `Message rate limit exceeded for ${identifier}`, {
        identifier,
        remainingAttempts: result.remainingAttempts,
        isBlocked: result.isBlocked,
        retryAfter: result.retryAfter
      })
    }

    return {
      allowed: result.allowed,
      retryAfter: result.retryAfter,
      remainingAttempts: result.remainingAttempts
    }
  }, [checkRateLimit, user?.id])

  const recordMessageAttempt = useCallback(() => {
    const identifier = user?.id || 'anonymous'
    recordAttempt(identifier, RateLimitConfigs.MESSAGE_SENDING)

    Logger.debug('message-rate-limit', `Message attempt recorded for ${identifier}`, {
      identifier
    })
  }, [recordAttempt, user?.id])

  return {
    checkMessageRateLimit,
    recordMessageAttempt
  }
}

// Hook específico para criação de posts
export function usePostRateLimit() {
  const { checkRateLimit, recordAttempt } = useRateLimit()
  const { user } = useAuthContext()

  const checkPostRateLimit = useCallback(async (): Promise<{
    allowed: boolean
    retryAfter?: number
    remainingAttempts: number
  }> => {
    const identifier = user?.id || 'anonymous'
    const result = checkRateLimit(identifier, RateLimitConfigs.POST_CREATION)

    if (!result.allowed) {
      Logger.warn('post-rate-limit', `Post rate limit exceeded for ${identifier}`, {
        identifier,
        remainingAttempts: result.remainingAttempts,
        isBlocked: result.isBlocked,
        retryAfter: result.retryAfter
      })
    }

    return {
      allowed: result.allowed,
      retryAfter: result.retryAfter,
      remainingAttempts: result.remainingAttempts
    }
  }, [checkRateLimit, user?.id])

  const recordPostAttempt = useCallback(() => {
    const identifier = user?.id || 'anonymous'
    recordAttempt(identifier, RateLimitConfigs.POST_CREATION)

    Logger.debug('post-rate-limit', `Post attempt recorded for ${identifier}`, {
      identifier
    })
  }, [recordAttempt, user?.id])

  return {
    checkPostRateLimit,
    recordPostAttempt
  }
}
