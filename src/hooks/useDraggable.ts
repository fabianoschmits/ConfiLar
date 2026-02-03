import { useState, useRef, useCallback, useEffect } from "react";

interface UseDraggableOptions {
  enabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  bounds?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

interface Position {
  x: number;
  y: number;
}

export function useDraggable(options: UseDraggableOptions = {}) {
  const { enabled = true, onDragStart, onDragEnd, bounds } = options;

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled) return;

      // Só iniciar drag se clicar no header ou em área específica
      const target = e.target as HTMLElement;
      const isHeader =
        target.closest("[data-drag-handle]") || target.closest("header");

      if (!isHeader && !target.hasAttribute("data-drag-handle")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };

      onDragStart?.();
    },
    [enabled, position, onDragStart],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled) return;

      const target = e.target as HTMLElement;
      const isHeader =
        target.closest("[data-drag-handle]") || target.closest("header");

      if (!isHeader && !target.hasAttribute("data-drag-handle")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      setIsDragging(true);
      dragStartPos.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      };

      onDragStart?.();
    },
    [enabled, position, onDragStart],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !enabled) return;

      let newX = e.clientX - dragStartPos.current.x;
      let newY = e.clientY - dragStartPos.current.y;

      // Aplicar bounds se definidos
      if (bounds) {
        if (bounds.left !== undefined) newX = Math.max(newX, bounds.left);
        if (bounds.right !== undefined) newX = Math.min(newX, bounds.right);
        if (bounds.top !== undefined) newY = Math.max(newY, bounds.top);
        if (bounds.bottom !== undefined) newY = Math.min(newY, bounds.bottom);
      } else {
        // Bounds padrão: manter modal visível na tela
        const element = elementRef.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          const maxX = window.innerWidth - rect.width;
          const maxY = window.innerHeight - rect.height;

          newX = Math.max(0, Math.min(newX, maxX));
          newY = Math.max(0, Math.min(newY, maxY));
        }
      }

      setPosition({ x: newX, y: newY });
    },
    [isDragging, enabled, bounds],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !enabled) return;

      const touch = e.touches[0];
      let newX = touch.clientX - dragStartPos.current.x;
      let newY = touch.clientY - dragStartPos.current.y;

      // Aplicar bounds se definidos
      if (bounds) {
        if (bounds.left !== undefined) newX = Math.max(newX, bounds.left);
        if (bounds.right !== undefined) newX = Math.min(newX, bounds.right);
        if (bounds.top !== undefined) newY = Math.max(newY, bounds.top);
        if (bounds.bottom !== undefined) newY = Math.min(newY, bounds.bottom);
      } else {
        // Bounds padrão: manter modal visível na tela
        const element = elementRef.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          const maxX = window.innerWidth - rect.width;
          const maxY = window.innerHeight - rect.height;

          newX = Math.max(0, Math.min(newX, maxX));
          newY = Math.max(0, Math.min(newY, maxY));
        }
      }

      setPosition({ x: newX, y: newY });
    },
    [isDragging, enabled, bounds],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
  }, [isDragging, onDragEnd]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
  }, [isDragging, onDragEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return {
    position,
    isDragging,
    elementRef,
    handleMouseDown,
    handleTouchStart,
    resetPosition,
    dragHandleProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      "data-drag-handle": true,
      style: {
        cursor: enabled ? (isDragging ? "grabbing" : "grab") : "default",
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
      },
    },
  };
}
