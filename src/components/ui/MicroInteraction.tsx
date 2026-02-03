"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface MicroInteractionProps {
  children: ReactNode;
  type?: "bounce" | "scale" | "glow" | "shimmer" | "pulse";
  intensity?: "light" | "medium" | "strong";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Componente para micro-interações sutis
 * Adiciona animações suaves em hover e click
 */
export function MicroInteraction({
  children,
  type = "scale",
  intensity = "medium",
  className,
  disabled = false,
  onClick,
}: MicroInteractionProps) {
  const [isPressed, setIsPressed] = useState(false);

  const intensityClasses = {
    light: "hover:scale-[1.02] active:scale-[0.98]",
    medium: "hover:scale-[1.05] active:scale-[0.95]",
    strong: "hover:scale-[1.08] active:scale-[0.92]",
  };

  const typeClasses = {
    bounce: "hover:animate-bounce",
    scale: intensityClasses[intensity],
    glow: "hover:shadow-lg hover:shadow-blue-500/50 transition-shadow",
    shimmer:
      "hover:bg-gradient-to-r hover:from-transparent hover:via-white/10 hover:to-transparent hover:bg-[length:200%_100%] hover:animate-[shimmer_1s_ease-in-out_infinite]",
    pulse: "hover:animate-pulse",
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "transition-smooth cursor-pointer",
        !disabled && typeClasses[type],
        isPressed && "scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={handleClick}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {children}
    </div>
  );
}
