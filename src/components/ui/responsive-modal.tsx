"use client";

import * as React from "react";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface ResponsiveModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  fullContent?: boolean;
}

export function ResponsiveModal({
  children,
  isOpen,
  onOpenChange,
  title,
  description,
  footer,
  className,
  showCloseButton = true,
  fullContent = false,
}: ResponsiveModalProps) {
  const { isMobile } = useMobile();

  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn("max-h-[85vh] flex flex-col p-0", className)}
        >
          {(title || description) && (
            <DialogHeader className="p-6 pb-2">
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          <div className="flex-1 overflow-y-auto p-6 pt-0 scroll-smooth">
            {children}
          </div>
          {footer && (
            <div className="p-6 pt-2 border-t flex justify-end gap-2">
              {footer}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "max-h-[96vh] flex flex-col",
          fullContent && "h-[100dvh] max-h-screen",
          className,
        )}
      >
        {fullContent ? (
          <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
        ) : (
          <>
            {(title || description) && (
              <DrawerHeader className="text-left border-b pb-4 flex-shrink-0">
                {title && <DrawerTitle>{title}</DrawerTitle>}
                {description && (
                  <DrawerDescription>{description}</DrawerDescription>
                )}
              </DrawerHeader>
            )}
            <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth overscroll-contain">
              {children}
            </div>
            {(footer || showCloseButton) && (
              <DrawerFooter className="pt-2 border-t flex-shrink-0">
                {footer}
                {showCloseButton && (
                  <DrawerClose asChild>
                    <Button variant="outline">Fechar</Button>
                  </DrawerClose>
                )}
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
