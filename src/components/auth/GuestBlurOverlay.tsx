"use client";

import React from "react";
import Link from "next/link";
import { LogIn, UserPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuestBlurOverlayProps {
  children: React.ReactNode;
  isGuest: boolean;
  className?: string;
  overlayClassName?: string;
}

export function GuestBlurOverlay({
  children,
  isGuest,
  className,
  overlayClassName,
}: GuestBlurOverlayProps) {
  if (!isGuest) return <>{children}</>;

  return (
    <div className={cn("relative group/blur overflow-hidden", className)}>
      {/* Conteúdo Desfocado - Blur menos agressivo */}
      <div className="blur-[4px] pointer-events-none select-none filter">
        {children}
      </div>

      {/* Overlay com Mensagem Minimalista */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/5 dark:bg-black/20 backdrop-blur-[1px] transition-all duration-300",
          overlayClassName,
        )}
      >
        <div className="animate-in fade-in zoom-in-95 duration-1000">
          <h3 className="text-lg font-black text-white tracking-[0.2em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] uppercase italic">
            Cadastre-se para ver mais
          </h3>
          <div className="w-16 h-[2px] bg-white/40 mx-auto mt-2 rounded-full shadow-lg" />
        </div>
      </div>
    </div>
  );
}
