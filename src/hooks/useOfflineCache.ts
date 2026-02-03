"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface OfflineAction {
  id: string;
  type: "CREATE_POST" | "UPDATE_PROFILE" | "CREATE_SERVICE" | "SEND_MESSAGE";
  data: any;
  timestamp: number;
  retries: number;
}

interface UseOfflineCacheOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export function useOfflineCache(options: UseOfflineCacheOptions = {}) {
  const { maxRetries = 3, retryDelay = 5000 } = options;
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);

  // Detectar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("🌐 Conexão restaurada - processando queue offline");
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("📱 Modo offline ativado");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificar status inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Carregar queue do localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem("confilar-offline-queue");
    if (savedQueue) {
      try {
        const queue = JSON.parse(savedQueue);
        setOfflineQueue(queue);
        console.log(`📦 Queue offline carregada: ${queue.length} ações`);
      } catch (error) {
        console.error("❌ Erro ao carregar queue offline:", error);
      }
    }
  }, []);

  // Salvar queue no localStorage
  useEffect(() => {
    if (offlineQueue.length > 0) {
      localStorage.setItem(
        "confilar-offline-queue",
        JSON.stringify(offlineQueue),
      );
    } else {
      localStorage.removeItem("confilar-offline-queue");
    }
  }, [offlineQueue]);

  // Adicionar ação à queue offline
  const addToOfflineQueue = useCallback(
    (action: Omit<OfflineAction, "id" | "timestamp" | "retries">) => {
      const offlineAction: OfflineAction = {
        ...action,
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retries: 0,
      };

      setOfflineQueue((prev) => [...prev, offlineAction]);
      console.log("📝 Ação adicionada à queue offline:", action.type);

      return offlineAction.id;
    },
    [],
  );

  // Processar queue offline
  const processOfflineQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return;

    console.log(`🔄 Processando ${offlineQueue.length} ações offline...`);

    for (const action of [...offlineQueue]) {
      try {
        await processOfflineAction(action);
        removeFromOfflineQueue(action.id);
        console.log("✅ Ação offline processada:", action.type);
      } catch (error) {
        console.error("❌ Erro ao processar ação offline:", error);

        // Incrementar tentativas
        const updatedAction = { ...action, retries: action.retries + 1 };

        if (updatedAction.retries >= maxRetries) {
          console.log(
            "❌ Máximo de tentativas atingido, removendo ação:",
            action.type,
          );
          removeFromOfflineQueue(action.id);
        } else {
          // Reagendar para mais tarde
          setTimeout(() => {
            setOfflineQueue((prev) =>
              prev.map((a) => (a.id === action.id ? updatedAction : a)),
            );
          }, retryDelay * updatedAction.retries);
        }
      }
    }
  }, [isOnline, offlineQueue, maxRetries, retryDelay]);

  // Processar ação offline específica
  const processOfflineAction = async (action: OfflineAction) => {
    const { supabase } = await import("@/lib/supabase");

    switch (action.type) {
      case "CREATE_POST":
        const { data: post, error: postError } = await supabase
          .from("posts")
          .insert(action.data)
          .select()
          .single();

        if (postError) throw postError;

        // Invalidar cache de posts
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        break;

      case "UPDATE_PROFILE":
        const { error: profileError } = await supabase
          .from("profiles")
          .update(action.data)
          .eq("id", action.data.id);

        if (profileError) throw profileError;

        // Invalidar cache de perfil
        queryClient.invalidateQueries({
          queryKey: ["profile", action.data.id],
        });
        break;

      case "CREATE_SERVICE":
        const { data: service, error: serviceError } = await supabase
          .from("services")
          .insert(action.data)
          .select()
          .single();

        if (serviceError) throw serviceError;

        // Invalidar cache de serviços
        queryClient.invalidateQueries({ queryKey: ["services"] });
        break;

      case "SEND_MESSAGE":
        const { error: messageError } = await supabase
          .from("messages")
          .insert(action.data);

        if (messageError) throw messageError;

        // Invalidar cache de conversas
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        break;

      default:
        throw new Error(`Tipo de ação não suportado: ${action.type}`);
    }
  };

  // Remover ação da queue
  const removeFromOfflineQueue = useCallback((actionId: string) => {
    setOfflineQueue((prev) => prev.filter((action) => action.id !== actionId));
  }, []);

  // Limpar queue offline
  const clearOfflineQueue = useCallback(() => {
    setOfflineQueue([]);
    localStorage.removeItem("confilar-offline-queue");
    console.log("🗑️ Queue offline limpa");
  }, []);

  // Executar ação (online ou offline)
  const executeAction = useCallback(
    async (
      type: OfflineAction["type"],
      data: any,
      onlineAction: () => Promise<any>,
    ) => {
      if (isOnline) {
        try {
          const result = await onlineAction();
          console.log("✅ Ação executada online:", type);
          return result;
        } catch (error) {
          console.error("❌ Erro ao executar ação online:", error);
          throw error;
        }
      } else {
        const actionId = addToOfflineQueue({ type, data });
        console.log("📝 Ação adicionada à queue offline:", type);
        return { offline: true, actionId };
      }
    },
    [isOnline, addToOfflineQueue],
  );

  return {
    isOnline,
    offlineQueue,
    addToOfflineQueue,
    removeFromOfflineQueue,
    clearOfflineQueue,
    executeAction,
    processOfflineQueue,
  };
}

// Hook para ações offline específicas
export function useOfflineActions() {
  const { executeAction } = useOfflineCache();

  const createPostOffline = useCallback(
    async (postData: any) => {
      return executeAction("CREATE_POST", postData, async () => {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("posts")
          .insert(postData)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },
    [executeAction],
  );

  const updateProfileOffline = useCallback(
    async (profileData: any) => {
      return executeAction("UPDATE_PROFILE", profileData, async () => {
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", profileData.id);

        if (error) throw error;
        return { success: true };
      });
    },
    [executeAction],
  );

  const createServiceOffline = useCallback(
    async (serviceData: any) => {
      return executeAction("CREATE_SERVICE", serviceData, async () => {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("services")
          .insert(serviceData)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },
    [executeAction],
  );

  const sendMessageOffline = useCallback(
    async (messageData: any) => {
      return executeAction("SEND_MESSAGE", messageData, async () => {
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase.from("messages").insert(messageData);

        if (error) throw error;
        return { success: true };
      });
    },
    [executeAction],
  );

  return {
    createPostOffline,
    updateProfileOffline,
    createServiceOffline,
    sendMessageOffline,
  };
}
