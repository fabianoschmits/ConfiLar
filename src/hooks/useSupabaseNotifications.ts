"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { toast } from "sonner";

export interface SupabaseNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url: string | null;
  priority: "low" | "normal" | "high" | "urgent";
}

export function useSupabaseNotifications() {
  const { profile } = useAuthContext();
  const { openChat } = useFloatingChat();
  const [notifications, setNotifications] = useState<SupabaseNotification[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Buscar notificações do usuário
  const fetchNotifications = async () => {
    if (!profile?.id) {
      console.log("🔔 useSupabaseNotifications: Profile não disponível:", {
        profile,
      });
      return;
    }

    console.log(
      "🔔 useSupabaseNotifications: Buscando notificações para profile:",
      profile.id,
    );
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      console.log(
        "🔔 useSupabaseNotifications: Notificações encontradas:",
        data?.length || 0,
      );
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      toast.error("Erro ao carregar notificações");
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      console.log("🔔 Marcando notificação como lida:", notificationId);

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("❌ Erro ao marcar notificação como lida:", error);
        throw error;
      }

      // Atualizar estado local imediatamente
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );

      // Decrementar contador apenas se a notificação não estava lida
      setUnreadCount((prev) => {
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.is_read) {
          return Math.max(0, prev - 1);
        }
        return prev;
      });

      console.log("✅ Notificação marcada como lida com sucesso");
    } catch (error) {
      console.error("❌ Erro ao marcar notificação como lida:", error);
      toast.error("Erro ao marcar notificação como lida");
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!profile?.id) return;

    try {
      console.log(
        "🔔 Marcando todas as notificações como lidas para profile:",
        profile.id,
      );

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", profile.id)
        .eq("is_read", false);

      if (error) {
        console.error(
          "❌ Erro ao marcar todas as notificações como lidas:",
          error,
        );
        throw error;
      }

      // Atualizar estado local imediatamente
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      console.log("✅ Todas as notificações marcadas como lidas");
    } catch (error) {
      console.error(
        "❌ Erro ao marcar todas as notificações como lidas:",
        error,
      );
      toast.error("Erro ao marcar notificações como lidas");
    }
  };

  // Marcar notificações de mensagens como lidas
  const markMessageNotificationsAsRead = async () => {
    if (!profile?.id) return;

    try {
      console.log("🔔 Marcando notificações de mensagens como lidas");

      // Buscar notificações não lidas relacionadas a mensagens
      const { data: messageNotifications, error: fetchError } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", profile.id)
        .eq("is_read", false)
        .or("title.ilike.%mensagem%,message.ilike.%mensagem%");

      if (fetchError) {
        console.error(
          "❌ Erro ao buscar notificações de mensagens:",
          fetchError,
        );
        return;
      }

      if (messageNotifications && messageNotifications.length > 0) {
        // Marcar notificações de mensagens como lidas
        const { error: updateError } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", profile.id)
          .eq("is_read", false)
          .in(
            "id",
            messageNotifications.map((n) => n.id),
          );

        if (updateError) {
          console.error(
            "❌ Erro ao marcar notificações de mensagens como lidas:",
            updateError,
          );
        } else {
          console.log(
            "✅ Notificações de mensagens marcadas como lidas:",
            messageNotifications.length,
          );

          // Atualizar estado local
          setNotifications((prev) =>
            prev.map((n) =>
              messageNotifications.some((mn) => mn.id === n.id)
                ? { ...n, is_read: true }
                : n,
            ),
          );

          // Atualizar contador
          setUnreadCount((prev) =>
            Math.max(0, prev - messageNotifications.length),
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Erro geral ao marcar notificações de mensagens:",
        error,
      );
    }
  };

  // Remover notificação
  const removeNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      // Atualizar contador de não lidas
      const removed = notifications.find((n) => n.id === notificationId);
      if (removed && !removed.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erro ao remover notificação:", error);
    }
  };

  // Limpar todas as notificações
  const clearAll = async () => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", profile.id);

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  };

  // Adicionar nova notificação (para testes)
  const addTestNotification = async (
    title: string,
    message: string,
    type: string = "info",
  ) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: profile.id,
        title,
        message,
        type,
        is_read: false,
        priority: "normal",
      });

      if (error) throw error;

      // Recarregar notificações
      await fetchNotifications();
    } catch (error) {
      console.error("Erro ao adicionar notificação:", error);
    }
  };

  // Sincronização em tempo real para receber notificações instantaneamente
  useEffect(() => {
    if (!profile?.id) {
      console.log(
        "🔔 useSupabaseNotifications: Profile não disponível para canal de tempo real",
      );
      return;
    }

    console.log(
      "🔔 Configurando realtime para notificações do usuário:",
      profile.id,
    );

    const channel = supabase
      .channel(`notifications-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          console.log(
            "🔔 Nova notificação recebida via realtime:",
            payload.new,
          );
          const newNotification = payload.new as SupabaseNotification;

          // Adicionar nova notificação ao estado (com prevenção de duplicação)
          setNotifications((prev) => {
            // Verificar se já existe
            const exists = prev.some((n) => n.id === newNotification.id);
            if (exists) {
              console.log(
                "⏭️ Notificação já existe no estado, ignorando:",
                newNotification.id,
              );
              return prev;
            }
            console.log(
              "✅ Adicionando nova notificação ao estado:",
              newNotification.id,
            );
            return [newNotification, ...prev];
          });

          // Incrementar contador de não lidas
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1);
          }

          // Mostrar toast para nova notificação
          toast(newNotification.title, {
            description: newNotification.message,
            action: newNotification.action_url
              ? {
                  label: "Ver",
                  onClick: () => {
                    if (newNotification.action_url?.startsWith("#")) {
                      window.location.hash = newNotification.action_url;
                    } else {
                      window.open(newNotification.action_url, "_blank");
                    }
                  },
                }
              : undefined,
          });

          // Se for notificação de mensagem, abrir chat flutuante automaticamente
          if (
            newNotification.type === "message" ||
            newNotification.title?.toLowerCase().includes("mensagem")
          ) {
            try {
              // Tentar extrair informações do metadata ou da mensagem
              const metadata = (newNotification as any).metadata || {};
              const senderId = metadata.sender_id;
              const senderName = metadata.sender_name;
              const conversationId = metadata.conversation_id;

              console.log(
                "💬 Notificação de mensagem recebida, abrindo chat:",
                { senderId, senderName, conversationId },
              );

              // Se tiver conversation_id, abrir com o ID da conversa
              if (conversationId) {
                openChat(conversationId);
              }
              // Se tiver sender_id, abrir chat com o usuário
              else if (senderId && senderName) {
                openChat(senderId, senderName);
              }
              // Caso contrário, apenas abrir a lista de conversas
              else {
                openChat();
              }
            } catch (error) {
              console.error("❌ Erro ao abrir chat flutuante:", error);
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          console.log("🔔 Notificação atualizada via realtime:", payload.new);
          const updatedNotification = payload.new as SupabaseNotification;

          // Atualizar notificação no estado
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === updatedNotification.id
                ? updatedNotification
                : notification,
            ),
          );

          // Atualizar contador se o status de leitura mudou
          const oldNotification = notifications.find(
            (n) => n.id === updatedNotification.id,
          );
          if (
            oldNotification &&
            oldNotification.is_read !== updatedNotification.is_read
          ) {
            if (updatedNotification.is_read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            } else {
              setUnreadCount((prev) => prev + 1);
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          console.log("🔔 Notificação deletada via realtime:", payload.old);
          const deletedNotification = payload.old as SupabaseNotification;

          // Remover notificação do estado
          setNotifications((prev) => {
            const removed = prev.find((n) => n.id === deletedNotification.id);
            if (removed && !removed.is_read) {
              setUnreadCount((count) => Math.max(0, count - 1));
            }
            return prev.filter(
              (notification) => notification.id !== deletedNotification.id,
            );
          });
        },
      )
      .subscribe((status) => {
        console.log("📡 Status da conexão realtime de notificações:", status);

        if (status === "SUBSCRIBED") {
          console.log("✅ Realtime de notificações CONECTADO com sucesso!");
          console.log(
            "⚡ Sistema pronto para receber notificações instantâneas",
          );
        } else if (status === "CLOSED") {
          console.log("🔴 Conexão realtime FECHADA");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Erro no canal realtime de notificações");
        }
      });

    // Cleanup ao desmontar
    return () => {
      console.log("🔔 Desconectando canal de notificações realtime");
      supabase.removeChannel(channel);
    };
  }, [profile?.id, openChat]);

  // Carregar notificações iniciais
  useEffect(() => {
    console.log(
      "🔔 useSupabaseNotifications: useEffect inicial - profile:",
      profile?.id,
    );
    if (profile?.id) {
      fetchNotifications();
    }
  }, [profile?.id]);

  return {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    markMessageNotificationsAsRead,
    removeNotification,
    clearAll,
    addTestNotification,
  };
}
