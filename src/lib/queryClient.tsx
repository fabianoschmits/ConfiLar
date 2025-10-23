'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useState } from 'react'
import { logger } from '@/lib/logger'

interface QueryProviderProps {
  children: ReactNode
}

// Configuração otimizada do QueryClient
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache por 5 minutos por padrão
        staleTime: 5 * 60 * 1000,
        // Manter no cache por 10 minutos
        gcTime: 10 * 60 * 1000,
        // Retry apenas 2 vezes
        retry: (failureCount, error) => {
          logger.error('query-retry', error as Error, { 
            failureCount,
            willRetry: failureCount < 2 
          })
          return failureCount < 2
        },
        // Não refetch automaticamente no focus (evita requests desnecessários)
        refetchOnWindowFocus: false,
        // Não refetch automaticamente na reconexão
        refetchOnReconnect: true
      },
      mutations: {
        // Retry mutations apenas 1 vez
        retry: 1,
        onError: (error) => {
          logger.error('react-query', error as Error, { 
            context: 'mutation-error' 
          })
        },
        onSuccess: () => {
          logger.info('react-query', 'Mutation completed successfully')
        }
      }
    }
  })
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Criar QueryClient apenas uma vez
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  )
}

// Hook para invalidar cache específico
export function useQueryInvalidation() {
  const queryClient = new QueryClient()
  
  return {
    // Invalidar perfis
    invalidateProfiles: () => {
      logger.info('Cache invalidated: profiles')
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
    
    // Invalidar mensagens
    invalidateMessages: () => {
      logger.info('Cache invalidated: messages')
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
    
    // Invalidar conversas
    invalidateConversations: () => {
      logger.info('Cache invalidated: conversations')
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    
    // Invalidar anúncios
    invalidateClassifieds: () => {
      logger.info('Cache invalidated: classifieds')
      queryClient.invalidateQueries({ queryKey: ['classifieds'] })
    },
    
    // Invalidar tudo
    invalidateAll: () => {
      logger.info('All cache invalidated')
      queryClient.invalidateQueries()
    }
  }
}

// Cache keys organizados
export const QueryKeys = {
  // Perfis
  profiles: ['profiles'] as const,
  profile: (id: string) => ['profiles', id] as const,
  profileSearch: (filters: Record<string, any>) => ['profiles', 'search', filters] as const,
  
  // Mensagens
  messages: ['messages'] as const,
  conversation: (id: string) => ['messages', 'conversation', id] as const,
  conversations: (userId: string) => ['messages', 'conversations', userId] as const,
  
  // Anúncios
  classifieds: ['classifieds'] as const,
  classifiedsByUser: (userId: string) => ['classifieds', 'user', userId] as const,
  classifiedsByCategory: (category: string) => ['classifieds', 'category', category] as const,
  
  // Avaliações
  reviews: ['reviews'] as const,
  reviewsByUser: (userId: string) => ['reviews', 'user', userId] as const,
  
  // Notificações
  notifications: (userId: string) => ['notifications', userId] as const,
  
  // Dashboard
  dashboardMetrics: (userId: string) => ['dashboard', 'metrics', userId] as const,
  
  // Localização
  estados: ['location', 'estados'] as const,
  cidades: (estado: string) => ['location', 'cidades', estado] as const,
  
  // Stats
  homeStats: ['stats', 'home'] as const,
  searchStats: (filters: Record<string, any>) => ['stats', 'search', filters] as const
} as const

// Utilitários de cache
export const CacheUtils = {
  // Tempo de cache por tipo de dados
  CACHE_TIMES: {
    STATIC: 24 * 60 * 60 * 1000, // 24 horas (estados, cidades)
    SEMI_STATIC: 10 * 60 * 1000, // 10 minutos (perfis, anúncios)
    DYNAMIC: 2 * 60 * 1000, // 2 minutos (mensagens, notificações)
    REALTIME: 30 * 1000 // 30 segundos (contadores, status)
  },
  
  // Configuração de retry por contexto
  RETRY_CONFIG: {
    CRITICAL: { retry: 3, retryDelay: 1000 }, // Auth, perfil
    IMPORTANT: { retry: 2, retryDelay: 500 }, // Mensagens, anúncios
    OPTIONAL: { retry: 1, retryDelay: 200 } // Stats, métricas
  }
}
