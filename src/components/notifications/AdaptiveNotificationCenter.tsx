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

  // Closing the menu is not evidence that a notification has been read.

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
    <div className="flex flex-col bg-[var(--cl-surface)] text-[var(--cl-ink)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--cl-border)] px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-base font-extrabold">Notificações</h3>
          <p className="text-xs text-[var(--cl-ink-muted)]">
            {unreadCount > 0
              ? `${unreadCount} não lida${unreadCount === 1 ? "" : "s"}`
              : "Você está em dia"}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              window.location.href = "/notificacoes";
            }}
            className="notification-toolbar-button"
            aria-label="Ver todas as notificações"
            title="Ver todas"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="notification-toolbar-button"
            aria-label="Configurações de notificações"
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="notification-toolbar-button"
            aria-label="Fechar notificações"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {notifications.length > 0 && (
        <div className="space-y-2 border-b border-[var(--cl-border)] px-4 py-3">
          <div className="flex gap-2">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`min-h-10 rounded-full px-4 text-sm font-semibold ${filter === value ? "bg-[var(--cl-cta)] text-[var(--cl-on-cta)]" : "bg-[var(--cl-mist)] text-[var(--cl-ink-secondary)]"}`}
              >
                {value === "all" ? "Todas" : "Não lidas"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="min-h-10 rounded-lg px-1 text-xs font-semibold text-[var(--cl-teal)]"
              >
                Marcar todas como lidas
              </button>
            )}
            <button
              type="button"
              onClick={handleDeleteAll}
              className="flex min-h-10 items-center gap-1.5 rounded-lg px-1 text-xs text-[var(--cl-ink-muted)] hover:text-red-700 dark:hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar todas
            </button>
          </div>
        </div>
      )}
      {!isSubscribed && (
        <div className="border-b border-[var(--cl-border)] p-3 empty:hidden">
          <PushNotificationManager />
        </div>
      )}
      <div className="max-h-[min(400px,50dvh)] space-y-2 overflow-y-auto overscroll-contain p-3 md:max-h-[500px]">
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
        {filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
            <Bell className="mb-3 h-8 w-8 text-[var(--cl-ink-muted)]" />
            <p className="text-sm font-extrabold">
              {filter === "unread"
                ? "Nenhuma notificação não lida"
                : "Nenhuma notificação por aqui"}
            </p>
            <p className="mt-1 text-xs text-[var(--cl-ink-muted)]">
              Suas novidades aparecerão aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
