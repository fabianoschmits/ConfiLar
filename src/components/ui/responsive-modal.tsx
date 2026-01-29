"use client";

import * as React from "react";
import { useMobile } from "@/hooks/useMobile";
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
}

export function ResponsiveModal({
  children,
  isOpen,
  onOpenChange,
  title,
  description,
  footer,
  className,
}: ResponsiveModalProps) {
  const { isMobile } = useMobile();

  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className={className}>
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
          {footer && (
            <div className="mt-4 flex justify-end gap-2">{footer}</div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className={className}>
        <DrawerHeader className="text-left">
          {title && <DrawerTitle>{title}</DrawerTitle>}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-4">{children}</div>
        <DrawerFooter className="pt-2">
          {footer}
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
