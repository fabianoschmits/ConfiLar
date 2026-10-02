"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNotifications } from "./NotificationProviderSimple";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AdaptiveNotificationCenter } from "./AdaptiveNotificationCenter";

export function SimpleHeaderBell({ className = "" }: { className?: string }) {
  const { user } = useAuthContext();
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  if (!user) return null;
  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-[var(--cl-mist)]"
            aria-label={
              unreadCount > 0
                ? `Notificações: ${unreadCount} não lidas`
                : "Notificações"
            }
          >
            <Bell className="h-5 w-5 text-[var(--cl-ink-secondary)]" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center border-0 bg-[var(--cl-cta)] px-1 text-[10px] text-[var(--cl-on-cta)]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Central de notificações"
          className="w-[380px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-0 shadow-[var(--cl-shadow)]"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          side="bottom"
        >
          <AdaptiveNotificationCenter
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
