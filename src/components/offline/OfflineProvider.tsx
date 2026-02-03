/**
 * Provider para gerenciar funcionalidades offline
 * Inicializa IndexedDB, sincronização e cache
 */

"use client";

import { useEffect } from "react";
import { initOfflineSync } from "@/lib/storage/offlineSync";
import {
  cleanupExpiredData,
  cleanupCompletedActions,
} from "@/lib/storage/indexedDB";
interface OfflineProviderProps {
  children: React.ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  // Funcionalidade offline simplificada - removido useOfflineActions complexo

  useEffect(() => {
    // Inicializar sincronizador offline
    initOfflineSync();

    // Limpar dados expirados na inicialização
    cleanupExpiredData();
    cleanupCompletedActions();

    // Limpar dados expirados periodicamente (a cada 6 horas)
    const cleanupInterval = setInterval(
      () => {
        cleanupExpiredData();
        cleanupCompletedActions();
      },
      6 * 60 * 60 * 1000,
    );

    // Registrar background sync no Service Worker
    const registerBackgroundSync = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if ("sync" in registration) {
            await (registration as any).sync.register("confilar-offline-sync");
            console.log("✅ Background Sync registrado");
          } else {
            console.warn(
              "⚠️ Background Sync API não disponível neste navegador",
            );
          }
        } catch (error) {
          console.warn("⚠️ Erro ao registrar Background Sync:", error);
        }
      }
    };

    registerBackgroundSync();

    // Listener para mensagens do Service Worker
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "SYNC_PENDING_ACTIONS") {
        console.log("🔄 Service Worker solicitou sincronização de ações");
        // A sincronização será feita automaticamente pelo sistema offline
      }
    };

    // Adicionar event listener apenas se Service Worker estiver disponível
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleMessage);
    }

    return () => {
      clearInterval(cleanupInterval);
      // Remover event listener apenas se Service Worker estiver disponível
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      }
    };
  }, []);

  // Funcionalidade offline simplificada - indicadores removidos com useOfflineActions

  return <>{children}</>;
}
