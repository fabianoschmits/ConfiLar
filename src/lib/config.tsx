'use client'

import { createContext, useContext, ReactNode } from 'react'

// ===================================
// TIPOS DE CONFIGURAÇÃO
// ===================================

interface AppConfig {
  // App básico
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  apiUrl: string
  
  // Supabase
  supabase: {
    url: string
    anonKey: string
  }
  
  // Feature flags
  features: {
    debugMode: boolean
    reactQueryDevtools: boolean
    detailedLogging: boolean
    performanceMonitoring: boolean
    automaticBackup: boolean
  }
  
  // Analytics
  analytics: {
    googleAnalytics?: string
    posthog?: string
    sentry?: string
  }
  
  // Uploads
  uploads: {
    maxFileSize: number
    allowedFileTypes: string[]
  }
  
  // Cache
  cache: {
    staticTtl: number
    dynamicTtl: number
  }
  
  // Rate limiting
  rateLimit: {
    requestsPerMinute: number
    sensitiveRequestsPerMinute: number
  }
}

// ===================================
// CONFIGURAÇÃO PADRÃO
// ===================================

const DEFAULT_CONFIG: AppConfig = {
  name: 'ConfiLar',
  version: '5.0.0',
  environment: 'development',
  apiUrl: 'http://localhost:3000/api',
  
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  },
  
  features: {
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    reactQueryDevtools: process.env.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS === 'true',
    detailedLogging: process.env.NEXT_PUBLIC_ENABLE_DETAILED_LOGGING === 'true',
    performanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
    automaticBackup: process.env.ENABLE_AUTOMATIC_BACKUP === 'true'
  },
  
  analytics: {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    posthog: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    sentry: process.env.NEXT_PUBLIC_SENTRY_DSN
  },
  
  uploads: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'), // 5MB
    allowedFileTypes: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',')
  },
  
  cache: {
    staticTtl: parseInt(process.env.CACHE_TTL_STATIC || '86400'), // 24h
    dynamicTtl: parseInt(process.env.CACHE_TTL_DYNAMIC || '300') // 5min
  },
  
  rateLimit: {
    requestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '100'),
    sensitiveRequestsPerMinute: parseInt(process.env.RATE_LIMIT_SENSITIVE_REQUESTS_PER_MINUTE || '10')
  }
}

// ===================================
// CONTEXTO
// ===================================

const ConfigContext = createContext<AppConfig>(DEFAULT_CONFIG)

export function useConfig(): AppConfig {
  return useContext(ConfigContext)
}

// ===================================
// PROVIDER
// ===================================

interface ConfigProviderProps {
  children: ReactNode
  config?: Partial<AppConfig>
}

export function ConfigProvider({ children, config }: ConfigProviderProps) {
  const mergedConfig: AppConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    features: {
      ...DEFAULT_CONFIG.features,
      ...config?.features
    },
    analytics: {
      ...DEFAULT_CONFIG.analytics,
      ...config?.analytics
    },
    uploads: {
      ...DEFAULT_CONFIG.uploads,
      ...config?.uploads
    },
    cache: {
      ...DEFAULT_CONFIG.cache,
      ...config?.cache
    },
    rateLimit: {
      ...DEFAULT_CONFIG.rateLimit,
      ...config?.rateLimit
    }
  }

  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  )
}

// ===================================
// UTILITÁRIOS
// ===================================

export const ConfigUtils = {
  // Verificar se está em produção
  isProduction: () => DEFAULT_CONFIG.environment === 'production',
  
  // Verificar se está em desenvolvimento
  isDevelopment: () => DEFAULT_CONFIG.environment === 'development',
  
  // Verificar se está em staging
  isStaging: () => DEFAULT_CONFIG.environment === 'staging',
  
  // Verificar se feature está habilitada
  isFeatureEnabled: (feature: keyof AppConfig['features']) => 
    DEFAULT_CONFIG.features[feature],
  
  // Obter URL da API com path
  getApiUrl: (path: string = '') => 
    `${DEFAULT_CONFIG.apiUrl}${path.startsWith('/') ? path : '/' + path}`,
  
  // Verificar se arquivo é permitido
  isFileTypeAllowed: (fileType: string) => 
    DEFAULT_CONFIG.uploads.allowedFileTypes.includes(fileType),
  
  // Verificar se arquivo está dentro do limite de tamanho
  isFileSizeValid: (fileSize: number) => 
    fileSize <= DEFAULT_CONFIG.uploads.maxFileSize,
  
  // Formatar tamanho de arquivo
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },
  
  // Obter configuração de cache baseada no tipo
  getCacheTtl: (type: 'static' | 'dynamic') => 
    type === 'static' ? DEFAULT_CONFIG.cache.staticTtl : DEFAULT_CONFIG.cache.dynamicTtl,
  
  // Validar configuração obrigatória
  validateRequiredConfig: (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!DEFAULT_CONFIG.supabase.url) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
    }
    
    if (!DEFAULT_CONFIG.supabase.anonKey) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// ===================================
// HOOK PARA FEATURE FLAGS
// ===================================

export function useFeatureFlag(feature: keyof AppConfig['features']): boolean {
  const config = useConfig()
  return config.features[feature]
}

// ===================================
// HOOK PARA ANALYTICS
// ===================================

export function useAnalytics() {
  const config = useConfig()
  
  return {
    googleAnalytics: config.analytics.googleAnalytics,
    posthog: config.analytics.posthog,
    sentry: config.analytics.sentry,
    isEnabled: (service: keyof AppConfig['analytics']) => !!config.analytics[service]
  }
}

// ===================================
// CONFIGURAÇÃO POR AMBIENTE
// ===================================

export const EnvironmentConfig = {
  development: {
    features: {
      debugMode: true,
      reactQueryDevtools: true,
      detailedLogging: true,
      performanceMonitoring: true,
      automaticBackup: false
    }
  },
  
  staging: {
    features: {
      debugMode: false,
      reactQueryDevtools: true,
      detailedLogging: true,
      performanceMonitoring: true,
      automaticBackup: true
    }
  },
  
  production: {
    features: {
      debugMode: false,
      reactQueryDevtools: false,
      detailedLogging: false,
      performanceMonitoring: true,
      automaticBackup: true
    }
  }
}
