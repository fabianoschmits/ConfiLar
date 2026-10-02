/**
 * Provider para gerenciar funcionalidades offline
 * Inicializa IndexedDB, sincronização e cache
 */

"use client";

import { ConnectionStatus } from "./ConnectionStatus";
import { useEffect } from "react";
import type { initOfflineSync } from "@/lib/storage/offlineSync";
import {
  cleanupExpiredData,
  cleanupCompletedActions,
  getPendingOfflineActions,
} from "@/lib/storage/indexedDB";
interface OfflineProviderProps {
  children: React.ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  // Funcionalidade offline simplificada - removido useOfflineActions complexo

  useEffect(() => {
    let disposed = false;
    let legacySync: ReturnType<typeof initOfflineSync> | undefined;
    // No current screen queues writes offline. Drain existing legacy actions only
    // when present, without loading the writer or polling an empty queue globally.
    const resumePending = async () => {
      const actions = await getPendingOfflineActions();
      if (!disposed && actions.length) {
        const offlineModule = await import("@/lib/storage/offlineSync");
        if (!disposed) legacySync = offlineModule.initOfflineSync();
      }
    };
    void resumePending().catch(() => {});

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
        void resumePending().catch(() => {});
      }
    };

    // Adicionar event listener apenas se Service Worker estiver disponível
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleMessage);
    }

    return () => {
      disposed = true;
      legacySync?.stop();
      clearInterval(cleanupInterval);
      // Remover event listener apenas se Service Worker estiver disponível
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      }
    };
  }, []);

  // Funcionalidade offline simplificada - indicadores removidos com useOfflineActions

  return (
    <>
      <ConnectionStatus />
      {children}
    </>
  );
}
