"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  Settings,
  X,
  ArrowLeft,
  MessageCircle,
  Star,
  Calendar,
  Shield,
  Trophy,
  Info,
  AlertTriangle,
  Loader2,
  MoreHorizontal,
  Eye,
  EyeOff,
  CheckCheck,
} from "lucide-react";
import { useSupabaseNotifications } from "@/hooks/useSupabaseNotifications";
import { useMessages } from "@/hooks/useMessages";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { useRealtimeConnection } from "@/hooks/useRealtimeConnection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { NotificationPreferencesFallback } from "./NotificationPreferencesFallback";

interface NotificationPreferences {
  push_enabled: boolean;
  message_notifications: boolean;
  review_notifications: boolean;
  system_notifications: boolean;
  info_notifications: boolean;
}

const getNotificationIcon = (type: string) => {
  const iconClass = "h-5 w-5 flex-shrink-0";
  switch (type) {
    case "message":
      return (
        <MessageCircle
          className={cn(iconClass, "text-blue-500 dark:text-blue-400")}
        />
      );
    case "review":
      return (
        <Star
          className={cn(iconClass, "text-yellow-500 dark:text-yellow-400")}
        />
      );
    case "booking":
      return (
        <Calendar
          className={cn(iconClass, "text-green-500 dark:text-green-400")}
        />
      );
    case "verification":
      return (
        <Shield
          className={cn(iconClass, "text-purple-500 dark:text-[var(--cl-teal)]")}
        />
      );
    case "support":
      return (
        <Shield
          className={cn(iconClass, "text-indigo-500 dark:text-indigo-400")}
        />
      );
    case "achievement":
      return (
        <Trophy
          className={cn(iconClass, "text-orange-500 dark:text-orange-400")}
        />
      );
    case "info":
      return (
        <Info className={cn(iconClass, "text-gray-500 dark:text-gray-400")} />
      );
    case "warning":
      return (
        <AlertTriangle
          className={cn(iconClass, "text-red-500 dark:text-red-400")}
        />
      );
    default:
      return (
        <Bell className={cn(iconClass, "text-gray-500 dark:text-gray-400")} />
      );
  }
};

const formatTimestamp = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Agora";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

export const NotificationDropdown: React.FC = () => {
  const { user, profile } = useAuthContext();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    isLoading,
  } = useSupabaseNotifications();

  const { isConnected: isRealtimeConnected, isConnecting } =
    useRealtimeConnection();
  const { conversations, getTotalUnreadCount } = useMessages();
  const { openChat } = useFloatingChat();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [visualUnreadCount, setVisualUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    message_notifications: true,
    review_notifications: true,
    system_notifications: true,
    info_notifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [tableExists, setTableExists] = useState(true);

  const displayUnreadCount = unreadCount;
  const recentNotifications = notifications
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 10);

  // Carregar preferências
  const loadPreferences = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          setTableExists(false);
          return;
        }
        return;
      }

      if (data) {
        setPreferences({
          push_enabled: data.push_enabled ?? true,
          message_notifications: data.message_notifications ?? true,
          review_notifications: data.review_notifications ?? true,
          system_notifications: data.system_notifications ?? true,
          info_notifications: data.info_notifications ?? true,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        if (error.code === "42P01") {
          setTableExists(false);
          toast.error("Tabela de preferências não encontrada.");
          return;
        }
        toast.error("Erro ao salvar configurações");
        return;
      }

      toast.success("Configurações salvas!");
      setShowSettings(false);
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      setVisualUnreadCount(displayUnreadCount);
    }
  }, [displayUnreadCount, isOpen]);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setVisualUnreadCount(0);
    } else {
      setVisualUnreadCount(displayUnreadCount);
      setShowSettings(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);

    const metadata = notification.metadata || {};
    const notificationType = notification.type || "";
    const titleLower = (notification.title || "").toLowerCase();

    // Suporte - Redirecionar para ajuda
    const isSupport =
      metadata.is_support === true ||
      notificationType === "support" ||
      notification.action_url?.includes("/ajuda") ||
      notification.action_url?.includes("/help") ||
      notification.action_url?.includes("open=help") ||
      titleLower.includes("suporte") ||
      titleLower.includes("chamado");

    if (isSupport) {
      console.log("🔔 [NotificationDropdown] Notificação de suporte detectada");
      if (notification.action_url) {
        try {
          // Extrair conversation_id se houver
          const url = new URL(notification.action_url, window.location.origin);
          const convId =
            url.searchParams.get("conversation_id") ||
            url.searchParams.get("id");
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

    // Mensagem - Abrir chat
    if (notificationType === "message" || titleLower.includes("mensagem")) {
      const senderId = metadata.sender_id;
      const senderName = metadata.sender_name;
      const conversationId = metadata.conversation_id || metadata.chat_id;

      if (conversationId) {
        openChat(conversationId);
      } else if (senderId && senderName) {
        openChat(senderId, senderName);
      } else {
        openChat();
      }
      return;
    }

    // Post relacionado
    if (metadata.post_id) {
      window.location.href = `/feed?post=${metadata.post_id}`;
      return;
    }

    // Avaliação
    if (notificationType === "review" || titleLower.includes("avaliação")) {
      window.location.href = "/avaliacoes";
      return;
    }

    // Recomendação
    if (
      titleLower.includes("recomendação") ||
      metadata.type === "recommendation"
    ) {
      window.location.href = "/reputacao";
      return;
    }

    // Action URL
    if (notification.action_url) {
      // Verificar se é redirecionamento para onboarding e se o usuário já completou
      if (
        notification.action_url === "/feed" ||
        notification.action_url.startsWith("/feed")
      ) {
        // Verificar se o usuário já completou o onboarding (usar localStorage ou verificar no profile como any)
        const hasCompletedOnboarding =
          (typeof window !== "undefined" &&
            localStorage.getItem("onboarding_completed") === "true") ||
          (profile && (profile as any)?.onboarding_completed === true);

        if (hasCompletedOnboarding) {
          console.log(
            "✅ Usuário já completou onboarding, redirecionando para feed ao invés de onboarding",
          );
          // Redirecionar para feed ao invés de onboarding
          window.location.href = "/feed";
          return;
        }
      }

      if (notification.action_url.startsWith("/")) {
        window.location.href = notification.action_url;
      } else {
        window.open(notification.action_url, "_blank");
      }
      return;
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: newValue }));

    if (user && tableExists) {
      try {
        await supabase.from("notification_preferences").upsert({
          user_id: user.id,
          [key]: newValue,
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Erro ao salvar preferência:", error);
        setPreferences((prev) => ({ ...prev, [key]: !newValue }));
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 h-9 w-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />

          {/* Indicador de conexão */}
          {isConnecting && (
            <div className="absolute bottom-0 right-0 h-2 w-2 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
          )}
          {isRealtimeConnected && !isConnecting && (
            <div className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}

          {/* Contador de não lidas */}
          {displayUnreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
              {displayUnreadCount > 99 ? "99+" : displayUnreadCount}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        className={cn(
          "w-[calc(100vw-2rem)] sm:w-96 p-0",
          "bg-[var(--cl-surface)]",
          "border border-gray-200 dark:border-gray-700",
          "shadow-2xl rounded-xl",
          "max-h-[85vh] flex flex-col",
          "overflow-hidden",
        )}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {showSettings ? (
          tableExists ? (
            <div className="flex flex-col h-full">
              {/* Header Configurações */}
              <div
                className={cn(
                  "flex items-center justify-between p-4",
                  "border-b border-gray-200 dark:border-gray-700",
                  "bg-gray-50 dark:bg-gray-800",
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Configurações
                  </h3>
                </div>
                <Button
                  onClick={savePreferences}
                  disabled={saving}
                  size="sm"
                  className="bg-[var(--cl-ink)] hover:brightness-110 text-white"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>

              {/* Conteúdo Configurações */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Canais de Notificação
                  </Label>
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        "bg-gray-50 dark:bg-gray-800",
                        "border border-gray-200 dark:border-gray-700",
                      )}
                    >
                      <Label
                        htmlFor="push_enabled"
                        className="text-sm text-gray-900 dark:text-white"
                      >
                        Notificações Push
                      </Label>
                      <Switch
                        id="push_enabled"
                        checked={preferences.push_enabled}
                        onCheckedChange={() => handleToggle("push_enabled")}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tipos de Notificação
                  </Label>
                  <div className="space-y-2">
                    {[
                      {
                        key: "message_notifications" as const,
                        label: "Mensagens",
                      },
                      {
                        key: "review_notifications" as const,
                        label: "Avaliações",
                      },
                      {
                        key: "system_notifications" as const,
                        label: "Sistema",
                      },
                      {
                        key: "info_notifications" as const,
                        label: "Informações",
                      },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg",
                          "bg-gray-50 dark:bg-gray-800",
                          "border border-gray-200 dark:border-gray-700",
                        )}
                      >
                        <Label
                          htmlFor={key}
                          className="text-sm text-gray-900 dark:text-white"
                        >
                          {label}
                        </Label>
                        <Switch
                          id={key}
                          checked={preferences[key]}
                          onCheckedChange={() => handleToggle(key)}
                          disabled={saving}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <NotificationPreferencesFallback
              onBack={() => setShowSettings(false)}
            />
          )
        ) : (
          <div className="flex flex-col h-full">
            {/* Header Notificações */}
            <div
              className={cn(
                "flex items-center justify-between p-4",
                "border-b border-gray-200 dark:border-gray-700",
                "bg-gray-50 dark:bg-gray-800",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  {isConnecting && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                  )}
                  {isRealtimeConnected && !isConnecting && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Notificações
                  </h3>
                  {displayUnreadCount > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {displayUnreadCount} não{" "}
                      {displayUnreadCount === 1 ? "lida" : "lidas"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {displayUnreadCount > 0 && (
                  <Button
                    onClick={handleMarkAllAsRead}
                    size="sm"
                    variant="ghost"
                    className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={() => setShowSettings(true)}
                  size="sm"
                  variant="ghost"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  title="Configurações"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-gray-400 dark:text-gray-500 animate-spin mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Carregando notificações...
                  </p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                    Nenhuma notificação
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                    Você está em dia!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "relative p-4 cursor-pointer transition-colors",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        !notification.is_read &&
                          "bg-[var(--cl-mist)]/50 dark:bg-blue-900/10",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícone */}
                        <div
                          className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            !notification.is_read
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-gray-800",
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4
                              className={cn(
                                "text-sm font-semibold line-clamp-2",
                                !notification.is_read
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300",
                              )}
                            >
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                              {formatTimestamp(notification.created_at)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className={cn(
                                "p-1.5 rounded-md transition-colors",
                                "bg-green-100 dark:bg-green-900/30",
                                "hover:bg-green-200 dark:hover:bg-green-900/50",
                                "text-green-700 dark:text-green-400",
                              )}
                              title="Marcar como lida"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className={cn(
                              "p-1.5 rounded-md transition-colors",
                              "bg-red-100 dark:bg-red-900/30",
                              "hover:bg-red-200 dark:hover:bg-red-900/50",
                              "text-red-700 dark:text-red-400",
                            )}
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Indicador de não lida */}
                      {!notification.is_read && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div
                className={cn(
                  "p-3 border-t border-gray-200 dark:border-gray-700",
                  "bg-gray-50 dark:bg-gray-800",
                )}
              >
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar todas as notificações
                </Button>
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
