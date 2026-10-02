"use client";
import { Trash2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NotificationIcon } from "./NotificationIcon";

export interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    action_url?: string;
    metadata?: { type?: string; post_title?: string; [key: string]: unknown };
  };
  onDelete: (id: string, title: string) => void;
  onMarkAsRead: (id: string) => void;
  onClick: (notification: NotificationItemProps["notification"]) => void;
  expanded?: boolean;
}
export function DesktopNotificationItem({
  notification,
  onDelete,
  onMarkAsRead,
  onClick,
  expanded = false,
}: NotificationItemProps) {
  const date = new Date(notification.created_at);
  const sharedTitle =
    notification.metadata?.type === "shared_post" &&
    typeof notification.metadata.post_title === "string"
      ? notification.metadata.post_title
      : null;
  return (
    <article
      id={`notification-${notification.id}`}
      data-read={notification.is_read}
      className={`notification-item flex items-start gap-1 rounded-2xl border border-[var(--cl-border)] p-3 text-[var(--cl-ink)] ${notification.is_read ? "bg-[var(--cl-surface)]" : "bg-[var(--cl-mist)]"}`}
    >
      <button
        type="button"
        onClick={() => onClick(notification)}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-teal)]"
        aria-label={`Abrir notificação: ${notification.title}`}
      >
        <NotificationIcon type={notification.type} />
        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <span className="min-w-0 break-words text-sm font-extrabold leading-5">
              {notification.title}
            </span>
            {!notification.is_read && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--cl-teal)]">
                <span className="sr-only">Não lida</span>
              </span>
            )}
          </span>
          <span
            className={`mt-1 block break-words text-sm leading-5 text-[var(--cl-ink-secondary)] ${expanded ? "" : "line-clamp-2"}`}
          >
            {notification.message}
          </span>
          {sharedTitle && (
            <span className="mt-2 block rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-2.5">
              <span className="block text-xs text-[var(--cl-ink-muted)]">
                Publicação compartilhada
              </span>
              <span className="mt-1 block line-clamp-2 text-sm font-medium">
                {sharedTitle}
              </span>
              <span className="mt-1 flex items-center gap-1 text-xs text-[var(--cl-teal)]">
                <ExternalLink className="h-3 w-3" />
                Ver publicação
              </span>
            </span>
          )}
          <span className="mt-2 block text-xs text-[var(--cl-ink-muted)]">
            {Number.isNaN(date.getTime())
              ? "Agora"
              : formatDistanceToNow(date, { addSuffix: true, locale: ptBR })}
          </span>
        </span>
      </button>
      <div className="flex shrink-0 flex-col gap-1">
        {!notification.is_read && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Marcar como lida"
            title="Marcar como lida"
            onClick={() => onMarkAsRead(notification.id)}
            className="h-10 w-10 text-[var(--cl-teal)]"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Excluir notificação"
          title="Excluir notificação"
          onClick={() => onDelete(notification.id, notification.title)}
          className="h-10 w-10 text-[var(--cl-ink-muted)] hover:text-red-700 dark:hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
