"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "./visually-hidden";

interface ResponsiveModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
  fullContent?: boolean;
  showFooterBorder?: boolean;
  showHeaderBorder?: boolean;
  /** When true, shows the modal centered on ALL screen sizes (not as bottom-sheet on mobile) */
  centered?: boolean;
}

export function ResponsiveModal({
  children,
  isOpen,
  onOpenChange,
  title,
  description,
  footer,
  className,
  overlayClassName,
  showCloseButton = true,
  fullContent = false,
  showFooterBorder = true,
  showHeaderBorder = true,
  centered = false,
}: ResponsiveModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            overlayClassName,
          )}
        />

        <DialogPrimitive.Content
          data-slot="responsive-modal"
          className={cn(
            "app-modal fixed z-[201] flex flex-col text-[var(--cl-ink)] shadow-2xl",
            centered
              ? [
                  // Centered on ALL screen sizes
                  "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl w-[calc(100vw-2rem)] max-w-2xl max-h-[85dvh]",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out",
                  "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
                  "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
                  "duration-300 ease-in-out",
                ]
              : [
                  // Mobile (Bottom Sheet)
                  "bottom-0 left-0 right-0 rounded-t-3xl w-full",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out",
                  "data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full",
                  "duration-200 ease-out",
                  // Desktop (Centered)
                  "md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:max-w-2xl md:max-h-[85vh]",
                  "md:data-[state=open]:zoom-in-95 md:data-[state=closed]:zoom-out-95 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:slide-out-to-bottom-0",
                ],
            // Background & Effects — surface sólido (padrão ConfiLar)
            "bg-[var(--cl-surface)] border border-[var(--cl-border)] overflow-hidden",
            // Height logic
            fullContent
              ? centered
                ? "max-h-[85dvh]"
                : "h-[92dvh] md:max-h-[95vh]"
              : centered
                ? "max-h-[85dvh]"
                : "max-h-[92dvh]",
            className,
          )}
        >
          {/* Acessibilidade: Sempre ter um título */}
          {!title && (
            <VisuallyHidden>
              <DialogPrimitive.Title>Detalhes</DialogPrimitive.Title>
            </VisuallyHidden>
          )}

          {(title || description) && (
            <div
              className={cn(
                "app-modal-header p-4 pr-16 sm:p-6 sm:pr-16 flex-shrink-0",
                showHeaderBorder && "border-b border-[var(--cl-border)]",
              )}
            >
              {title && (
                <DialogPrimitive.Title asChild>
                  <div className="text-lg font-bold leading-snug">{title}</div>
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description asChild>
                  <div className="text-sm text-[var(--cl-ink-secondary)] mt-2">
                    {description}
                  </div>
                </DialogPrimitive.Description>
              )}
            </div>
          )}

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6",
              (title || description) && "pt-4",
              fullContent && "p-0",
            )}
          >
            {children}
          </div>

          {(footer || (showCloseButton && !fullContent)) && (
            <div
              className={cn(
                "app-modal-footer p-4 sm:p-6 flex-shrink-0 flex flex-wrap items-center justify-end gap-2",
                showFooterBorder && "border-t border-[var(--cl-border)]",
              )}
            >
              {footer}
              {showCloseButton && !footer && (
                <DialogPrimitive.Close asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    Fechar
                  </Button>
                </DialogPrimitive.Close>
              )}
            </div>
          )}

          {showCloseButton && (
            <DialogPrimitive.Close className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full ring-offset-background transition-colors hover:bg-[var(--cl-mist)] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-[var(--cl-mist)] text-[var(--cl-ink-secondary)]">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
