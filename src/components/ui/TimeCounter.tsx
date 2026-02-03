"use client";

import React from "react";
import { Clock, CheckCircle, Star } from "lucide-react";
import { useTimeCounter } from "@/hooks/useTimeCounter";
import { Button } from "@/components/ui/button";

interface TimeCounterProps {
  targetDate: string | Date | null;
  onExpired?: () => void;
  onReviewClick?: () => void;
  className?: string;
}

export function TimeCounter({
  targetDate,
  onExpired,
  onReviewClick,
  className = "",
}: TimeCounterProps) {
  const { hours, minutes, seconds, isExpired, formattedTime } =
    useTimeCounter(targetDate);

  React.useEffect(() => {
    if (isExpired && onExpired) {
      onExpired();
    }
  }, [isExpired, onExpired]);

  // Mostrar toast quando tempo expirar
  React.useEffect(() => {
    if (isExpired) {
      // Importar toast dinamicamente para evitar problemas de SSR
      import("sonner").then(({ toast }) => {
        toast.success(
          "🎉 Tempo de espera acabou! Você já pode avaliar este usuário.",
          {
            duration: 5000,
            position: "top-right",
          },
        );
      });
    }
  }, [isExpired]);

  if (isExpired) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="bg-green-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-white" />
            <span className="font-black text-white text-sm">DISPONÍVEL</span>
          </div>
          <p className="text-white font-bold text-lg">Pode avaliar agora!</p>
        </div>
        {onReviewClick && (
          <Button
            onClick={onReviewClick}
            className="bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black w-full"
          >
            <Star className="h-4 w-4 mr-2" />
            AVALIAR AGORA
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-black" />
        <span className="font-black text-black text-sm">AGUARDE</span>
      </div>
      <p className="text-black font-bold text-lg">{formattedTime}</p>
      <p className="text-black font-bold text-xs">para poder avaliar</p>
    </div>
  );
}
