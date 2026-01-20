"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useNotifications } from "./NotificationProviderSimple";
import { DesktopNotificationItem } from "./DesktopNotificationItem";
import {
  NotificationCategoryFilter,
  NotificationCategory,
} from "./NotificationCategoryFilter";
import { NotificationSearch } from "./NotificationSearch";
import { Bell, Loader2, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { Separator } from "@/components/ui/separator";

export function FullNotificationList() {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications() as any; // Using any to bypass type issues if provider interface differs slightly

  const searchParams = useSearchParams();
  const router = useRouter();
  const { openChat } = useFloatingChat();
  const { profile } = useAuthContext();

  const [filter, setFilter] = useState<NotificationCategory>("all");
  const [search, setSearch] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Handle highlighting from URL
  useEffect(() => {
    const id = searchParams.get("highlight");
    if (id) {
      setHighlightId(id);
      // Wait a bit for render
      setTimeout(() => {
        const element = document.getElementById(`notification-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams, notifications]);

  // Filter logic
  const filteredNotifications = notifications.filter((n: any) => {
    // Search filter
    const matchesSearch =
      search === "" ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // Category filter
    if (filter === "all") return true;

    // Map internal types to our categories
    const type = n.type || "system";

    if (
      filter === "message" &&
      (type === "message" || n.title.toLowerCase().includes("mensagem"))
    )
      return true;
    if (
      filter === "review" &&
      (type === "review" || n.title.toLowerCase().includes("avaliação"))
    )
      return true;
    if (
      filter === "booking" &&
      (type === "booking" || n.title.toLowerCase().includes("agendamento"))
    )
      return true;
    if (filter === "verification" && type === "verification") return true;
    if (filter === "achievement" && type === "achievement") return true;
    if (filter === "system" && type === "system") return true;
    if (filter === "warning" && (type === "warning" || type === "error"))
      return true;

    return false;
  });

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

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    const metadata = notification.metadata || {};
    const notificationType = notification.type || "";
    const titleLower = (notification.title || "").toLowerCase();

    // Logic copied from AdaptiveNotificationCenter but simpler redirects where possible

    // 1. MENSAGEM - Abrir chat flutuante
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

    // 2. Posts (Like, Comment, Reply, Mention, Share)
    if (
      notificationType === "like" ||
      notificationType === "comment" ||
      notificationType === "reply" ||
      notificationType === "mention" ||
      notificationType === "share" ||
      metadata.post_id
    ) {
      if (metadata.post_id) {
        router.push(`/feed?post=${metadata.post_id}`);
        return;
      }
    }

    // 3. Avaliação
    if (notificationType === "review" || titleLower.includes("avaliação")) {
      router.push("/avaliacoes");
      return;
    }

    // 4. Perfil / Favorito / Recomendação
    if (
      notificationType === "follow" ||
      titleLower.includes("favorito") ||
      titleLower.includes("recomendação") ||
      titleLower.includes("visualizou")
    ) {
      const targetId = metadata.follower_id || metadata.user_id;
      if (targetId) {
        router.push(`/perfil/${targetId}`);
        return;
      }
      router.push("/perfil"); // Fallback
      return;
    }

    // 5. Fallback URL
    if (notification.action_url) {
      if (notification.action_url.startsWith("/")) {
        router.push(notification.action_url);
      } else {
        window.open(notification.action_url, "_blank");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Carregando notificações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <NotificationCategoryFilter
          currentCategory={filter}
          onSelectCategory={setFilter}
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <NotificationSearch value={search} onChange={setSearch} />

          <div className="flex items-center gap-1 border-l pl-2 ml-2">
            <Button
              variant="ghost"
              size="icon"
              title="Marcar todas como lidas"
              onClick={() => markAllAsRead()}
              disabled={
                notifications.filter((n: any) => !n.is_read).length === 0
              }
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Limpar todas"
              onClick={handleDeleteAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification: any) => (
            <DesktopNotificationItem
              key={notification.id}
              notification={{
                ...notification,
                created_at:
                  notification.created_at instanceof Date
                    ? notification.created_at.toISOString()
                    : notification.created_at,
              }}
              onDelete={(id, title) => {
                removeNotification(id);
                toast.success("Notificação removida");
              }}
              onMarkAsRead={markAsRead}
              onClick={handleNotificationClick}
              expanded={true} // Always expanded in this full view
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-dashed">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Nenhuma notificação encontrada
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              {search || filter !== "all"
                ? "Tente ajustar seus filtros de busca ou categoria."
                : "Você não tem nenhuma notificação no momento. Fique tranquilo, avisaremos quando algo acontecer!"}
            </p>
            {(search || filter !== "all") && (
              <Button
                variant="link"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-4"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
