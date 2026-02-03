/**
 * Persistência React Query com IndexedDB
 * Permite que queries sejam salvas e restauradas automaticamente
 */

import {
  PersistedClient,
  Persister,
} from "@tanstack/query-persist-client-core";
import {
  getDB,
  setStorageData,
  getStorageData,
  removeStorageData,
} from "./indexedDB";

const PERSIST_KEY = "REACT_QUERY_OFFLINE_CACHE";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias

/**
 * Cria persister para React Query usando IndexedDB
 */
export function createIDBPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await setStorageData("cache", PERSIST_KEY, client, CACHE_TTL);
        console.log("💾 React Query cache persistido no IndexedDB");
      } catch (error) {
        console.error("❌ Erro ao persistir React Query cache:", error);
      }
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        const client = await getStorageData<PersistedClient>(
          "cache",
          PERSIST_KEY,
        );
        if (client) {
          console.log("📂 React Query cache restaurado do IndexedDB");
          return client;
        }
        return undefined;
      } catch (error) {
        console.error("❌ Erro ao restaurar React Query cache:", error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await removeStorageData("cache", PERSIST_KEY);
        console.log("🗑️ React Query cache removido do IndexedDB");
      } catch (error) {
        console.error("❌ Erro ao remover React Query cache:", error);
      }
    },
  };
}
