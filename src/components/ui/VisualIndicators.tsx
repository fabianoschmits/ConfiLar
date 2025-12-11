"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NewBadgeProps {
  className?: string;
  variant?: "default" | "pulse";
}

export function NewBadge({ className, variant = "pulse" }: NewBadgeProps) {
  return (
    <Badge
      className={cn(
        "bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] px-1.5 py-0.5 font-semibold",
        variant === "pulse" && "animate-pulse",
        className,
      )}
    >
      Novo
    </Badge>
  );
}

interface NotificationDotProps {
  count?: number;
  className?: string;
  showCount?: boolean;
}

export function NotificationDot({
  count = 0,
  className,
  showCount = true,
}: NotificationDotProps) {
  if (count === 0) return null;

  return (
    <div className={cn("relative", className)}>
      {showCount && count > 0 ? (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
          {count > 9 ? "9+" : count}
        </span>
      ) : (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </div>
  );
}
