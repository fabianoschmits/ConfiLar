"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Settings,
  Trash2,
  X,
  ArrowLeft,
  Smartphone,
  Maximize2,
} from "lucide-react";
import { useNotifications } from "./NotificationProviderSimple";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { PushNotificationManager } from "../pwa/PushNotificationManager";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { DesktopNotificationItem } from "./DesktopNotificationItem";
import { toast } from "sonner";
import { NotificationSettingsView } from "./NotificationSettingsView";

interface AdaptiveNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdaptiveNotificationCenter({
  isOpen,
  onClose,
}: AdaptiveNotificationCenterProps) {
  return <FloatingNotificationContent isOpen={isOpen} onClose={onClose} />;
}

// Componente simplificado para o popover flutuante
function FloatingNotificationContent({
  isOpen,
  onClose,
}: AdaptiveNotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();
  const {
    isSupported,
    isGranted,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    isLoading,
    error,
  } = usePushNotifications();
  const { updatePreferences: updateSoundPreferences, isEnabled: soundEnabled } =
    useNotificationSound();
  const { openChat } = useFloatingChat();
  const { profile } = useAuthContext();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    sound: false,
    vibration: true,
    messages: true,
    reviews: true,
    favorites: true,
    recommendations: true,
    system: true,
  });

  // Carregar configurações salvas ao montar o componente
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotificationSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }
  }, []);

  // Marcar todas como lidas ao fechar o menu
  useEffect(() => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  // Função para deletar notificação individual
  const handleDeleteNotification = async (
    notificationId: string,
    notificationTitle: string,
  ) => {
    try {
      await removeNotification(notificationId);
      toast.success("Notificação removida", {
        description: `"${notificationTitle}" foi removida`,
      });
    } catch (error) {
      console.error("Erro ao remover notificação:", error);
      toast.error("Erro ao remover notificação");
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar todas as ${notifications.length} notificações? Esta ação não pode ser desfeita.`,
    );

    if (confirmed) {
      await clearAll();
      toast.success("Todas as notificações foram deletadas");
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    const updatedSettings = { ...notificationSettings, [key]: value };

    // Atualizar estado
    setNotificationSettings(updatedSettings);

    // Salvar automaticamente no localStorage
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(updatedSettings),
    );

    console.log(`🔔 Configuração salva automaticamente: ${key} = ${value}`);

    // CONECTAR AOS SISTEMAS REAIS

    // 1. Som - Conectar ao useNotificationSound
    if (key === "sound") {
      try {
        await updateSoundPreferences({ enabled: value });
        console.log(
          `🔊 Som ${value ? "ativado" : "desativado"} no sistema real`,
        );
        toast.success(`Som ${value ? "ativado" : "desativado"}`);
      } catch (error) {
        console.error("❌ Erro ao atualizar som:", error);
      }
    }

    // 2. Vibração - Implementar Web Vibration API
    if (key === "vibration" && value) {
      if ("vibrate" in navigator) {
        navigator.vibrate(200); // Testar vibração
        console.log("📳 Vibração testada");
        toast.success("Vibração ativada");
      } else {
        console.log("⚠️ Vibração não suportada neste dispositivo");
        toast.warning("Vibração não suportada neste dispositivo");
      }
    }

    // 3. Push - Conectar ao usePushNotifications
    if (key === "pushEnabled") {
      try {
        if (value) {
          if (!isGranted) {
            const granted = await requestPermission();
            if (!granted) {
              console.log("❌ Permissão negada");
              // Reverter configuração
              setNotificationSettings((prev) => ({
                ...prev,
                pushEnabled: false,
              }));
              localStorage.setItem(
                "notificationSettings",
                JSON.stringify({ ...updatedSettings, pushEnabled: false }),
              );
              return;
            }
          }
          if (!isSubscribed) {
            await subscribe();
            console.log("🔔 Inscrito em notificações push");
            toast.success("Notificações push ativadas");
          }
        } else {
          if (isSubscribed) {
            await unsubscribe();
            console.log("🔕 Desinscrito de notificações push");
            toast.success("Notificações push desativadas");
          }
        }
      } catch (error) {
        console.error("❌ Erro ao atualizar push:", error);
      }
    }

    // 4. Tipos de notificação - Mostrar feedback
    if (
      [
        "messages",
        "reviews",
        "favorites",
        "recommendations",
        "system",
      ].includes(key)
    ) {
      const typeNames: Record<string, string> = {
        messages: "Mensagens",
        reviews: "Avaliações",
        favorites: "Favoritos",
        recommendations: "Recomendações",
        system: "Sistema",
      };
      toast.success(`${typeNames[key]} ${value ? "ativadas" : "desativadas"}`);
      console.log(
        `📋 Filtro de ${typeNames[key]}: ${value ? "ATIVADO" : "DESATIVADO"}`,
      );
    }
  };

  const handlePushNotificationToggle = async () => {
    try {
      if (!isGranted) {
        // Solicitar permissão primeiro
        const granted = await requestPermission();
        if (!granted) {
          console.log("❌ Permissão negada para notificações");
          return;
        }
      }

      if (isSubscribed) {
        // Desinscrever
        await unsubscribe();
        console.log("🔕 Desinscrito de notificações push");
      } else {
        // Inscrever
        await subscribe();
        console.log("🔔 Inscrito em notificações push");
      }
    } catch (error) {
      console.error("❌ Erro ao alternar notificações push:", error);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    return filter === "all" || (filter === "unread" && !notification.is_read);
  });

  // Função para lidar com clique em notificação
  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida
    await markAsRead(notification.id);

    // Fechar o popover
    onClose();

    const metadata = notification.metadata || {};
    const titleLower = (notification.title || "").toLowerCase();

    const isSupport =
      notification.type === "support" ||
      metadata.is_support === true ||
      notification.action_url?.includes("/ajuda") ||
      notification.action_url?.includes("/help") ||
      notification.action_url?.includes("open=help") ||
      titleLower.includes("suporte") ||
      titleLower.includes("chamado");

    if (isSupport) {
      if (notification.action_url) {
        try {
          const url = new URL(notification.action_url, window.location.origin);
          const convId = url.searchParams.get("conversation_id");
          window.location.href = convId
            ? `/ajuda?ticket_id=${convId}`
            : "/ajuda?show=support";
        } catch {
          window.location.href = "/ajuda?show=support";
        }
      } else {
        window.location.href = "/ajuda?show=support";
      }
      return;
    }

    // Redirecionar para a página de notificações com destaque
    window.location.href = `/notificacoes?highlight=${notification.id}`;
  };

  // Se está mostrando configurações, renderizar painel de configurações
  if (showSettings) {
    return <NotificationSettingsView onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => {
                onClose();
                window.location.href = "/notificacoes";
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Ver todas (Expandir)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Configurações"
            >
              <Settings className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros e Limpar todas - mesma linha */}
      {notifications.length > 0 && (
        <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`px-2 py-0.5 text-[10px] transition-colors ${
                  filter === "all"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-2 py-0.5 text-[10px] transition-colors ${
                  filter === "unread"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Não lidas
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-medium px-2 py-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar todas
              </button>
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {filteredNotifications.length} notificação
              {filteredNotifications.length !== 1 ? "ões" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Notificações Push - Sugestão Proativa dentro do menu */}
      {!isSubscribed && (
        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
          <PushNotificationManager />
        </div>
      )}

      {/* Lista de Notificações */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto max-h-[400px] md:max-h-[500px] bg-white dark:bg-gray-900">
        {filteredNotifications.map((notification) => (
          <DesktopNotificationItem
            key={notification.id}
            notification={{
              ...notification,
              created_at:
                notification.created_at instanceof Date
                  ? notification.created_at.toISOString()
                  : notification.created_at,
            }}
            onDelete={handleDeleteNotification}
            onMarkAsRead={markAsRead}
            onClick={handleNotificationClick}
          />
        ))}
      </div>

      {/* Estado vazio */}
      {filteredNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-white dark:bg-gray-900">
          <Bell className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma notificação
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Você receberá notificações aqui
          </p>
        </div>
      )}
    </div>
  );
}
