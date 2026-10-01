"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "minimal" | "centered";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = "default",
}: EmptyStateProps) {
  const isCentered = variant === "centered";
  const isMinimal = variant === "minimal";

  return (
    <div
      className={cn(
        "app-empty-state flex flex-col items-center justify-center",
        isCentered && "min-h-[400px]",
        isMinimal ? "py-8" : "py-12 px-4",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div
          className={cn(
            "mb-4 flex items-center justify-center",
            isMinimal ? "w-16 h-16" : "w-24 h-24",
            "rounded-2xl bg-[var(--cl-mist)] text-[var(--cl-ink-muted)]",
          )}
        >
          {icon}
        </div>
      )}

      <h3
        className={cn(
          "font-semibold text-[var(--cl-ink)] mb-2 text-center",
          isMinimal ? "text-base" : "text-lg",
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          "text-[var(--cl-ink-secondary)] mb-6 text-center leading-relaxed",
          isMinimal ? "text-sm max-w-sm" : "text-base max-w-md",
        )}
      >
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex w-full max-w-sm flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button
              onClick={action.onClick}
              className="w-full sm:w-auto"
              aria-label={action.label}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="w-full sm:w-auto"
              aria-label={secondaryAction.label}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
