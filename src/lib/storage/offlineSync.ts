/**
 * Sistema de sincronização offline/online
 * Gerencia ações feitas offline e sincroniza quando volta online
 */

import { supabase } from "@/lib/supabase";
import {
  saveOfflineAction,
  getPendingOfflineActions,
  markActionAsCompleted,
  incrementActionRetries,
} from "./indexedDB";

interface OfflineAction {
  id: number;
  type:
    | "create_post"
    | "like"
    | "comment"
    | "transfer_points"
    | "update_profile";
  payload: any;
  timestamp: number;
  retries: number;
  status: "pending" | "syncing" | "completed" | "failed";
}

/**
 * Classe para gerenciar sincronização offline
 */
class OfflineSyncManager {
  private isOnline = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private setupEventListeners() {
    window.addEventListener("online", () => {
      console.log("🌐 Conexão restaurada, iniciando sincronização...");
      this.isOnline = true;
      this.syncPendingActions();
    });

    window.addEventListener("offline", () => {
      console.log("📴 Conexão perdida, modo offline ativado");
      this.isOnline = false;
    });
  }

  private startPeriodicSync() {
    // Sincronizar a cada 30 segundos quando online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncPendingActions();
      }
    }, 30000); // 30 segundos
  }

  /**
   * Sincroniza ações pendentes
   */
  async syncPendingActions(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    try {
      const pendingActions = await getPendingOfflineActions();

      if (pendingActions.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(
        `🔄 Sincronizando ${pendingActions.length} ações pendentes...`,
      );

      for (const action of pendingActions) {
        try {
          await this.executeAction(action);
          await markActionAsCompleted(action.id!);
          console.log(`✅ Ação ${action.id} sincronizada com sucesso`);
        } catch (error) {
          console.error(`❌ Erro ao sincronizar ação ${action.id}:`, error);
          await incrementActionRetries(action.id!);

          // Se exceder 5 tentativas, marcar como falha
          if (action.retries >= 5) {
            console.error(`⚠️ Ação ${action.id} falhou após 5 tentativas`);
          }
        }
      }

      console.log("✅ Sincronização concluída");
    } catch (error) {
      console.error("❌ Erro na sincronização:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Executa uma ação offline
   */
  private async executeAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case "create_post":
        await this.syncCreatePost(action.payload);
        break;
      case "like":
        await this.syncLike(action.payload);
        break;
      case "comment":
        await this.syncComment(action.payload);
        break;
      case "transfer_points":
        await this.syncTransferPoints(action.payload);
        break;
      case "update_profile":
        await this.syncUpdateProfile(action.payload);
        break;
      default:
        throw new Error(`Tipo de ação desconhecido: ${action.type}`);
    }
  }

  private async syncCreatePost(payload: any): Promise<void> {
    const { data, error } = await supabase
      .from("feed_posts")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async syncLike(payload: any): Promise<void> {
    const { postId, userId, userName, reactionType } = payload;

    // Implementar lógica de like baseado na estrutura do seu sistema
    const { error } = await supabase.from("post_reactions").upsert({
      post_id: postId,
      user_id: userId,
      reaction_type: reactionType || "like",
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  private async syncComment(payload: any): Promise<void> {
    const { error } = await supabase
      .from("post_comments")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
  }

  private async syncTransferPoints(payload: any): Promise<void> {
    const { error } = await supabase.rpc("transfer_points", payload);
    if (error) throw error;
  }

  private async syncUpdateProfile(payload: any): Promise<void> {
    const { userId, updates } = payload;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) throw error;
  }

  /**
   * Para o sincronizador
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Instância singleton
let syncManager: OfflineSyncManager | null = null;

/**
 * Inicializa o gerenciador de sincronização
 */
export function initOfflineSync(): OfflineSyncManager {
  if (!syncManager) {
    syncManager = new OfflineSyncManager();
  }
  return syncManager;
}

/**
 * Obtém o gerenciador de sincronização
 */
export function getOfflineSync(): OfflineSyncManager | null {
  return syncManager;
}

/**
 * Adiciona uma ação para sincronização offline
 */
export async function queueOfflineAction(
  type:
    | "create_post"
    | "like"
    | "comment"
    | "transfer_points"
    | "update_profile",
  payload: any,
): Promise<number> {
  if (navigator.onLine) {
    // Se estiver online, tentar executar imediatamente
    try {
      const sync = getOfflineSync();
      if (sync) {
        // Executar ação imediatamente se online
        return await saveOfflineAction(type, payload);
      }
    } catch (error) {
      console.warn(
        "⚠️ Erro ao executar ação online, salvando para sincronização:",
        error,
      );
    }
  }

  // Salvar para sincronização posterior
  return await saveOfflineAction(type, payload);
}
