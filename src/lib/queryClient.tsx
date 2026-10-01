"use client";

import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
  hydrate,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import {
  getStorageData,
  setStorageData,
  removeStorageData,
} from "@/lib/storage/indexedDB";

interface QueryProviderProps {
  children: ReactNode;
}

// Configuração otimizada do QueryClient com persistência
function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cache por 5 minutos por padrão
        staleTime: 5 * 60 * 1000,
        // Manter no cache por 10 minutos (aumentado para permitir persistência)
        gcTime: 24 * 60 * 60 * 1000, // 24 horas (mantém no IndexedDB)
        // Retry apenas 2 vezes
        retry: (failureCount, error) => {
          // Se estiver offline, não tentar novamente
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            return false;
          }

          logger.error("query-retry", error as Error, {
            failureCount,
            willRetry: failureCount < 2,
          });
          return failureCount < 2;
        },
        // Não refetch automaticamente no focus (evita requests desnecessários)
        refetchOnWindowFocus: false,
        // Refetch na reconexão apenas se estiver online
        refetchOnReconnect: true,
        // Usar cache quando offline
        networkMode: "offlineFirst", // Tentar cache primeiro quando offline
      },
      mutations: {
        // A lost response does not mean the write failed. Retrying an insert or
        // point purchase can duplicate it; retry only explicitly idempotent work.
        retry: false,
        onError: (error) => {
          logger.error("react-query", error as Error, {
            context: "mutation-error",
          });
        },
        onSuccess: () => {
          logger.info("react-query", "Mutation completed successfully");
        },
        // Modo de rede para mutations
        networkMode: "online", // Só executar quando online (ou usar queueOfflineAction)
      },
    },
  });

  return queryClient;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Criar QueryClient apenas uma vez
  const [queryClient] = useState(() => createQueryClient());
  const [isHydrated, setIsHydrated] = useState(false);

  // Restaurar cache do IndexedDB na inicialização
  useEffect(() => {
    let isMounted = true;

    const restoreCache = async () => {
      try {
        const PERSIST_KEY = "REACT_QUERY_OFFLINE_CACHE";
        const cached = await getStorageData<any>("cache", PERSIST_KEY);

        if (cached && cached.clientState) {
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
          const now = Date.now();

          // Verificar se cache não expirou
          if (cached.timestamp && now - cached.timestamp < maxAge) {
            // Filtrar apenas queries importantes antes de hidratar
            const persistableKeys = ["profiles", "classifieds", "stories"];

            // Filtrar queries para persistir apenas as importantes
            if (cached.clientState.queries) {
              cached.clientState.queries = cached.clientState.queries.filter(
                (q: any) => {
                  const queryKey = q.queryKey?.[0] as string;
                  return (
                    queryKey &&
                    persistableKeys.some((key) => queryKey.includes(key))
                  );
                },
              );
            }

            hydrate(queryClient, cached.clientState);
            console.log("✅ React Query cache restaurado do IndexedDB");
          } else {
            // Cache expirado, remover
            await removeStorageData("cache", PERSIST_KEY);
          }
        }
      } catch (error) {
        console.error("❌ Erro ao restaurar cache React Query:", error);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    restoreCache();
  }, [queryClient]);

  // Função para remover Promises e estruturas não serializáveis
  const removeNonSerializable = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Se for uma Promise, retornar null
    if (obj instanceof Promise) {
      return null;
    }

    // Se for uma função, retornar null
    if (typeof obj === "function") {
      return null;
    }

    // Se for um Date, converter para string ISO
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // Se for um array, processar cada item
    if (Array.isArray(obj)) {
      return obj.map((item) => removeNonSerializable(item));
    }

    // Se for um objeto, processar cada propriedade
    if (typeof obj === "object") {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          try {
            cleaned[key] = removeNonSerializable(obj[key]);
          } catch (e) {
            // Se não puder serializar, ignorar a propriedade
            continue;
          }
        }
      }
      return cleaned;
    }

    // Valores primitivos são seguros
    return obj;
  };

  // Salvar cache periodicamente
  useEffect(() => {
    if (!isHydrated) return;

    const saveCache = async () => {
      try {
        const PERSIST_KEY = "REACT_QUERY_OFFLINE_CACHE";
        const persistableKeys = ["profiles", "classifieds", "stories"];

        // Dehidratar apenas queries importantes
        const dehydratedState = dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => {
            const queryKey = query.queryKey[0] as string;
            return (
              queryKey && persistableKeys.some((key) => queryKey.includes(key))
            );
          },
        });

        // Remover Promises e estruturas não serializáveis antes de salvar
        const cleanedState = removeNonSerializable(dehydratedState);

        const cacheData = {
          timestamp: Date.now(),
          clientState: cleanedState,
        };

        await setStorageData(
          "cache",
          PERSIST_KEY,
          cacheData,
          7 * 24 * 60 * 60 * 1000,
        );
      } catch (error) {
        console.error("❌ Erro ao salvar cache React Query:", error);
      }
    };

    // Salvar imediatamente
    saveCache();

    // Salvar periodicamente a cada 30 segundos
    const saveInterval = setInterval(saveCache, 30000);

    // Salvar quando queries mudarem (usando MutationObserver seria ideal, mas vamos usar intervalo)

    return () => {
      clearInterval(saveInterval);
      // Salvar antes de desmontar
      saveCache();
    };
  }, [queryClient, isHydrated]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools apenas em desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

// Hook para invalidar cache específico
export function useQueryInvalidation() {
  const queryClient = new QueryClient();

  return {
    // Invalidar perfis
    invalidateProfiles: () => {
      logger.info("Cache invalidated: profiles");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },

    // Invalidar mensagens
    invalidateMessages: () => {
      logger.info("Cache invalidated: messages");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },

    // Invalidar conversas
    invalidateConversations: () => {
      logger.info("Cache invalidated: conversations");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },

    // Invalidar anúncios
    invalidateClassifieds: () => {
      logger.info("Cache invalidated: classifieds");
      queryClient.invalidateQueries({ queryKey: ["classifieds"] });
    },

    // Invalidar tudo
    invalidateAll: () => {
      logger.info("All cache invalidated");
      queryClient.invalidateQueries();
    },
  };
}

// Cache keys organizados
export const QueryKeys = {
  // Perfis
  profiles: ["profiles"] as const,
  profile: (id: string) => ["profiles", id] as const,
  profileSearch: (filters: Record<string, any>) =>
    ["profiles", "search", filters] as const,

  // Mensagens
  messages: ["messages"] as const,
  conversation: (id: string) => ["messages", "conversation", id] as const,
  conversations: (userId: string) =>
    ["messages", "conversations", userId] as const,

  // Anúncios
  classifieds: ["classifieds"] as const,
  classifiedsByUser: (userId: string) =>
    ["classifieds", "user", userId] as const,
  classifiedsByCategory: (category: string) =>
    ["classifieds", "category", category] as const,

  // Avaliações
  reviews: ["reviews"] as const,
  reviewsByUser: (userId: string) => ["reviews", "user", userId] as const,

  // Notificações
  notifications: (userId: string) => ["notifications", userId] as const,

  // Dashboard
  dashboardMetrics: (userId: string) =>
    ["dashboard", "metrics", userId] as const,

  // Localização
  estados: ["location", "estados"] as const,
  cidades: (estado: string) => ["location", "cidades", estado] as const,

  // Stats
  homeStats: ["stats", "home"] as const,
  searchStats: (filters: Record<string, any>) =>
    ["stats", "search", filters] as const,
} as const;

// Utilitários de cache
export const CacheUtils = {
  // Tempo de cache por tipo de dados
  CACHE_TIMES: {
    STATIC: 24 * 60 * 60 * 1000, // 24 horas (estados, cidades)
    SEMI_STATIC: 10 * 60 * 1000, // 10 minutos (perfis, anúncios)
    DYNAMIC: 2 * 60 * 1000, // 2 minutos (mensagens, notificações)
    REALTIME: 30 * 1000, // 30 segundos (contadores, status)
  },

  // Configuração de retry por contexto
  RETRY_CONFIG: {
    CRITICAL: { retry: 3, retryDelay: 1000 }, // Auth, perfil
    IMPORTANT: { retry: 2, retryDelay: 500 }, // Mensagens, anúncios
    OPTIONAL: { retry: 1, retryDelay: 200 }, // Stats, métricas
  },
};
