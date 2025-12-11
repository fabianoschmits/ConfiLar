"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { useDraggable } from "@/hooks/useDraggable";
import { useSwipeGesture, useHapticFeedback } from "@/hooks/useSwipeGesture";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  draggable?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  draggable = true,
}: ModalProps) {
  const { position, elementRef, dragHandleProps } = useDraggable({
    enabled: draggable,
  });

  const { lightTap } = useHapticFeedback();

  const swipeHandlers = useSwipeGesture(
    {
      onSwipeDown: () => {
        lightTap();
        onClose();
      },
    },
    {
      minSwipeDistance: 100,
      maxSwipeTime: 500,
    },
  );

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        ref={elementRef}
        {...swipeHandlers}
        className={cn(
          "relative w-full",
          sizeClasses[size],
          "bg-white dark:bg-black rounded-xl shadow-xl border border-gray-200 dark:border-gray-800",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "max-h-[90vh] overflow-hidden",
        )}
        style={{
          transform:
            position.x !== 0 || position.y !== 0
              ? `translate(${position.x}px, ${position.y}px)`
              : undefined,
        }}
      >
        {/* Header - Drag Handle */}
        <div
          {...dragHandleProps}
          className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
