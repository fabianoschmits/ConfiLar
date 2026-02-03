"use client";

import { useState, useEffect, useCallback } from "react";

interface CacheStats {
  totalSize: number;
  totalEntries: number;
  cacheNames: string[];
  lastUpdated: string;
}

interface UseStaticCacheOptions {
  autoPrecache?: boolean;
  precacheUrls?: string[];
  maxCacheSize?: number; // em bytes
}

export function useStaticCache(options: UseStaticCacheOptions = {}) {
  const {
    autoPrecache = false,
    precacheUrls: defaultPrecacheUrls = [],
    maxCacheSize = 50 * 1024 * 1024, // 50MB
  } = options;

  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalSize: 0,
    totalEntries: 0,
    cacheNames: [],
    lastUpdated: new Date().toISOString(),
  });
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar suporte ao Cache API
  useEffect(() => {
    setIsSupported("caches" in window);
  }, []);

  // Obter estatísticas do cache
  const getCacheStats = useCallback(async () => {
    if (!isSupported) return;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let totalEntries = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalEntries += keys.length;

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      setCacheStats({
        totalSize,
        totalEntries,
        cacheNames,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas do cache:", error);
    }
  }, [isSupported]);

  // Pré-cachear URLs específicas
  const precacheUrls = useCallback(
    async (urls: string[], cacheName = "confilar-static-v1.2.0") => {
      if (!isSupported) return false;

      setIsLoading(true);
      try {
        const cache = await caches.open(cacheName);
        await cache.addAll(urls);
        await getCacheStats();
        console.log(`✅ ${urls.length} URLs pré-cacheadas com sucesso`);
        return true;
      } catch (error) {
        console.error("Erro ao pré-cachear URLs:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported, getCacheStats],
  );

  // Cachear uma URL específica
  const cacheUrl = useCallback(
    async (url: string, cacheName = "confilar-static-v1.2.0") => {
      if (!isSupported) return false;

      try {
        const cache = await caches.open(cacheName);
        await cache.add(url);
        await getCacheStats();
        console.log(`✅ URL cacheada: ${url}`);
        return true;
      } catch (error) {
        console.error("Erro ao cachear URL:", error);
        return false;
      }
    },
    [isSupported, getCacheStats],
  );

  // Verificar se URL está em cache
  const isUrlCached = useCallback(
    async (url: string, cacheName?: string) => {
      if (!isSupported) return false;

      try {
        if (cacheName) {
          const cache = await caches.open(cacheName);
          const response = await cache.match(url);
          return !!response;
        } else {
          // Verificar em todos os caches
          const cacheNames = await caches.keys();
          for (const name of cacheNames) {
            const cache = await caches.open(name);
            const response = await cache.match(url);
            if (response) return true;
          }
          return false;
        }
      } catch (error) {
        console.error("Erro ao verificar cache:", error);
        return false;
      }
    },
    [isSupported],
  );

  // Limpar cache específico
  const clearCache = useCallback(
    async (cacheName: string) => {
      if (!isSupported) return false;

      try {
        await caches.delete(cacheName);
        await getCacheStats();
        console.log(`✅ Cache ${cacheName} limpo com sucesso`);
        return true;
      } catch (error) {
        console.error("Erro ao limpar cache:", error);
        return false;
      }
    },
    [isSupported, getCacheStats],
  );

  // Limpar todos os caches
  const clearAllCaches = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      await getCacheStats();
      console.log("✅ Todos os caches foram limpos");
      return true;
    } catch (error) {
      console.error("Erro ao limpar todos os caches:", error);
      return false;
    }
  }, [isSupported, getCacheStats]);

  // Limpar caches antigos (baseado no tamanho)
  const cleanOldCaches = useCallback(async () => {
    if (!isSupported || cacheStats.totalSize <= maxCacheSize) return false;

    try {
      const cacheNames = await caches.keys();
      const currentCaches = [
        "confilar-pwa-v1.2.0",
        "confilar-static-v1.2.0",
        "confilar-dynamic-v1.2.0",
        "confilar-api-v1.2.0",
        "confilar-images-v1.2.0",
        "confilar-data-v1.2.0",
      ];

      for (const cacheName of cacheNames) {
        if (!currentCaches.includes(cacheName)) {
          await caches.delete(cacheName);
          console.log(`🗑️ Cache antigo removido: ${cacheName}`);
        }
      }

      await getCacheStats();
      return true;
    } catch (error) {
      console.error("Erro ao limpar caches antigos:", error);
      return false;
    }
  }, [isSupported, cacheStats.totalSize, maxCacheSize, getCacheStats]);

  // Obter informações detalhadas de um cache
  const getCacheDetails = useCallback(
    async (cacheName: string) => {
      if (!isSupported) return null;

      try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        const details = [];

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            details.push({
              url: request.url,
              size: blob.size,
              type: response.headers.get("content-type") || "unknown",
              lastModified: response.headers.get("last-modified") || "unknown",
            });
          }
        }

        return {
          name: cacheName,
          entries: keys.length,
          details,
          totalSize: details.reduce((sum, item) => sum + item.size, 0),
        };
      } catch (error) {
        console.error("Erro ao obter detalhes do cache:", error);
        return null;
      }
    },
    [isSupported],
  );

  // Auto pré-cachear se habilitado
  useEffect(() => {
    if (autoPrecache && defaultPrecacheUrls.length > 0 && isSupported) {
      precacheUrls(defaultPrecacheUrls);
    }
  }, [autoPrecache, defaultPrecacheUrls, isSupported, precacheUrls]);

  // Atualizar estatísticas na montagem
  useEffect(() => {
    if (isSupported) {
      getCacheStats();
    }
  }, [isSupported, getCacheStats]);

  // Formatar tamanho em bytes
  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  return {
    // Estado
    cacheStats,
    isSupported,
    isLoading,

    // Ações
    getCacheStats,
    precacheUrls,
    cacheUrl,
    isUrlCached,
    clearCache,
    clearAllCaches,
    cleanOldCaches,
    getCacheDetails,

    // Utilitários
    formatBytes,

    // Informações computadas
    isOverLimit: cacheStats.totalSize > maxCacheSize,
    usagePercentage: (cacheStats.totalSize / maxCacheSize) * 100,
  };
}

// Hook para cache de assets específicos do ConfiLar
export function useConfiLarCache() {
  const defaultUrls = [
    "/",
    "/manifest.json",
    "/favicon.ico",
    "/favicon.svg",
    "/icon-192x192.png",
    "/icon-512x512.png",
    "/icon-192x192-maskable.png",
    "/icon-512x512-maskable.png",
    "/imagens/logo/Logo azul - sem fundo - horizontal.png",
    "/imagens/logo/Logo branco - sem fundo - horizontal.png",
  ];

  return useStaticCache({
    autoPrecache: true,
    precacheUrls: defaultUrls,
    maxCacheSize: 30 * 1024 * 1024, // 30MB para o ConfiLar
  });
}
