"use client";

import React, { useState } from "react";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import {
  Bell,
  Check,
  Trash2,
  Filter,
  RefreshCw,
  MessageSquare,
  Star,
  Calendar,
  Shield,
  Trophy,
  Settings,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { useNotifications } from "./NotificationProviderSimple";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    case "review":
      return <Star className="h-4 w-4" />;
    case "booking":
      return <Calendar className="h-4 w-4" />;
    case "verification":
      return <Shield className="h-4 w-4" />;
    case "achievement":
      return <Trophy className="h-4 w-4" />;
    case "success":
      return <Check className="h-4 w-4" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4" />;
    case "error":
      return <X className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "message":
      return "bg-blue-100 text-blue-800";
    case "review":
      return "bg-yellow-100 text-yellow-800";
    case "booking":
      return "bg-green-100 text-green-800";
    case "verification":
      return "bg-purple-100 text-purple-800";
    case "achievement":
      return "bg-orange-100 text-orange-800";
    case "success":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Agora mesmo";
  if (minutes < 60) return `${minutes} min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;

  return timestamp.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const NotificationList: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    refreshNotifications,
  } = useNotifications();

  const { openChat: openFloatingChat } = useFloatingChat();

  const handleNotificationAction = (
    notification: (typeof notifications)[0],
  ) => {
    const isSupport =
      notification.type === "support" ||
      notification.action_url?.includes("/ajuda") ||
      notification.action_url?.includes("/help") ||
      notification.action_url?.includes("open=help");

    if (isSupport) {
      if (notification.action_url) {
        try {
          const url = new URL(notification.action_url, window.location.origin);
          const convId = url.searchParams.get("conversation_id");
          window.location.href = convId
            ? `/ajuda?ticket_id=${convId}`
            : "/ajuda";
        } catch {
          window.location.href = "/ajuda";
        }
      } else {
        window.location.href = "/ajuda";
      }
    } else if (notification.action_url) {
      if (notification.action_url.startsWith("/")) {
        window.location.href = notification.action_url;
      } else {
        window.open(notification.action_url, "_blank");
      }
    }
  };

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [category, setCategory] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
      toast.success("Notificações atualizadas!");
    } catch (error) {
      toast.error("Erro ao atualizar notificações");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast.success("Notificação marcada como lida");
    } catch (error) {
      toast.error("Erro ao marcar notificação como lida");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("Todas as notificações marcadas como lidas");
    } catch (error) {
      toast.error("Erro ao marcar notificações como lidas");
    }
  };

  const handleRemoveNotification = async (id: string) => {
    try {
      await removeNotification(id);
      toast.success("Notificação removida");
    } catch (error) {
      toast.error("Erro ao remover notificação");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      toast.success("Todas as notificações foram removidas");
    } catch (error) {
      toast.error("Erro ao limpar notificações");
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread" && notification.is_read) return false;
    if (filter === "read" && !notification.is_read) return false;
    if (category !== "all" && (notification as any).category !== category)
      return false;
    return true;
  });

  const categories = [
    { value: "all", label: "Todas", count: notifications.length },
    {
      value: "messages",
      label: "Mensagens",
      count: notifications.filter((n) => (n as any).category === "messages")
        .length,
    },
    {
      value: "reviews",
      label: "Avaliações",
      count: notifications.filter((n) => (n as any).category === "reviews")
        .length,
    },
    {
      value: "bookings",
      label: "Agendamentos",
      count: notifications.filter((n) => (n as any).category === "bookings")
        .length,
    },
    {
      value: "verifications",
      label: "Verificações",
      count: notifications.filter(
        (n) => (n as any).category === "verifications",
      ).length,
    },
    {
      value: "achievements",
      label: "Conquistas",
      count: notifications.filter((n) => (n as any).category === "achievements")
        .length,
    },
    {
      value: "system",
      label: "Sistema",
      count: notifications.filter((n) => (n as any).category === "system")
        .length,
    },
  ];

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma notificação
          </h3>
          <p className="text-gray-500 text-center">
            Você está em dia! Quando houver novas notificações, elas aparecerão
            aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Notificações</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} não lidas
              </Badge>
            )}
          </div>
          {/* Status de tempo real removido temporariamente */}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
            />
            Atualizar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                <Check
                  className={cn(
                    "h-4 w-4 mr-2",
                    filter === "all" && "text-green-600",
                  )}
                />
                Todas as notificações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("unread")}>
                <Check
                  className={cn(
                    "h-4 w-4 mr-2",
                    filter === "unread" && "text-green-600",
                  )}
                />
                Apenas não lidas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("read")}>
                <Check
                  className={cn(
                    "h-4 w-4 mr-2",
                    filter === "read" && "text-green-600",
                  )}
                />
                Apenas lidas
              </DropdownMenuItem>
              <Separator />
              {categories.map((cat) => (
                <DropdownMenuItem
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 mr-2",
                      category === cat.value && "text-green-600",
                    )}
                  />
                  {cat.label} ({cat.count})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleClearAll}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar todas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              !notification.is_read &&
                "border-l-4 border-l-blue-500 bg-blue-50/50",
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Ícone */}
                <div
                  className={cn(
                    "p-2 rounded-full",
                    getNotificationColor(notification.type),
                  )}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4
                        className={cn(
                          "font-medium text-sm",
                          !notification.is_read && "font-semibold",
                        )}
                      >
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>

                      {/* Metadados */}
                      {(notification as any).metadata &&
                        Object.keys((notification as any).metadata).length >
                          0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries((notification as any).metadata).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {key}: {String(value)}
                                </Badge>
                              ),
                            )}
                          </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 mt-3">
                    {!notification.is_read && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-7 px-3 text-xs bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Marcar como lida
                      </Button>
                    )}

                    {notification.action_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotificationAction(notification)}
                        className="h-7 px-3 text-xs border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {(notification as any).action_label || "Ver detalhes"}
                      </Button>
                    )}

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRemoveNotification(notification.id)}
                      className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status da Conexão */}
      {/* Status de conexão removido temporariamente */}
    </div>
  );
};
