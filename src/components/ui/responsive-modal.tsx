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
          className={cn(
            "fixed z-[201] flex flex-col bg-background shadow-2xl",
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
                  "duration-500 ease-in-out",
                  // Desktop (Centered)
                  "md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:max-w-2xl md:max-h-[85vh]",
                  "md:data-[state=open]:zoom-in-95 md:data-[state=closed]:zoom-out-95 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:slide-out-to-bottom-0",
                ],
            // Background & Effects
            "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 overflow-hidden",
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
          <VisuallyHidden>
            <DialogPrimitive.Title>
              {typeof title === "string" ? title : "Modal"}
            </DialogPrimitive.Title>
          </VisuallyHidden>

          {description && (
            <VisuallyHidden>
              <DialogPrimitive.Description>
                {typeof description === "string"
                  ? description
                  : "Descrição do modal"}
              </DialogPrimitive.Description>
            </VisuallyHidden>
          )}

          {(title || description) && (
            <div
              className={cn(
                "p-6 pb-2 flex-shrink-0",
                showHeaderBorder && "border-b md:border-none",
              )}
            >
              {title && (
                <div className="text-lg font-bold leading-none tracking-tight">
                  {title}
                </div>
              )}
              {description && (
                <div className="text-sm text-muted-foreground mt-2">
                  {description}
                </div>
              )}
            </div>
          )}

          <div
            className={cn(
              "flex-1 overflow-y-auto p-6 scroll-smooth",
              (title || description) && "pt-4",
              fullContent && "p-0",
            )}
          >
            {children}
          </div>

          {(footer || (showCloseButton && !fullContent)) && (
            <div
              className={cn(
                "p-6 pt-2 flex-shrink-0 flex items-center justify-end gap-2",
                showFooterBorder && "border-t md:border-none",
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
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-accent text-accent-foreground md:bg-transparent">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
