"use client";

import React, { useState, useEffect } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { isProUser } from "@/utils/profileUtils";

interface ProVerifiedBadgeProps {
  isVerified: boolean;
  isPro?: boolean;
  proExpiresAt?: string | null;
  className?: string; // Classe para o container
  iconSize?: number; // Tamanho do ícone (default: 2.5 = 10px ou w-2.5 h-2.5)
}

export function ProVerifiedBadge({
  isVerified,
  isPro = false,
  proExpiresAt,
  className,
  iconSize = 2.5,
}: ProVerifiedBadgeProps) {
  // Estado para controlar a animação (flip)
  const [showSecondState, setShowSecondState] = useState(false);

  useEffect(() => {
    // Anima a cada 5 segundos para todos os verificados
    const interval = setInterval(() => {
      setShowSecondState((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const isProActive = isProUser({
    is_pro: isPro,
    pro_expires_at: proExpiresAt,
  } as any);

  // Se não for verificado, não mostra nada
  if (!isVerified) return null;

  // Renderizador da Badge Azul
  const renderBlueBadge = () => (
    <div className="relative group/verified w-full h-full">
      <div className="absolute inset-0 bg-blue-500 blur-[4px] opacity-30 rounded-full animate-pulse"></div>
      <div className="relative w-full h-full bg-gradient-to-tr from-blue-500 to-blue-600 text-white rounded-full p-[2px] shadow-sm flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[60%] h-[60%]"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  );

  // Renderizador da Badge Dourada (Pro)
  const renderGoldBadge = () => (
    <div className="relative group/pro w-full h-full">
      <div className="absolute inset-0 bg-amber-400 blur-[4px] opacity-40 rounded-full animate-pulse"></div>
      <div className="relative w-full h-full bg-gradient-to-tr from-amber-300 via-amber-500 to-amber-600 text-white rounded-full p-[2px] shadow-sm flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[60%] h-[60%]"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative w-4 h-4 flex items-center justify-center",
        className,
      )}
    >
      {/* Estado 1: Sempre Azul (Verificado) */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500 transform",
          showSecondState
            ? "opacity-0 scale-50 rotate-180"
            : "opacity-100 scale-100 rotate-0",
        )}
      >
        {renderBlueBadge()}
      </div>

      {/* Estado 2: Dourado (se Pro) ou Azul (se apenas Verificado) */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500 transform",
          showSecondState
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 rotate-180",
        )}
      >
        {isProActive ? renderGoldBadge() : renderBlueBadge()}
      </div>
    </div>
  );
}
