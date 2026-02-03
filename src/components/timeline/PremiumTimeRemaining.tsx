"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface PremiumTimeRemainingProps {
  expiresAt: string | null | undefined;
  isOwner: boolean;
}

export function PremiumTimeRemaining({
  expiresAt,
  isOwner,
}: PremiumTimeRemainingProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt || !isOwner) {
      setTimeRemaining("");
      setIsExpired(false);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("");
        setIsExpired(true);
        return;
      }

      setIsExpired(false);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const parts: string[] = [];

      if (days > 0) {
        parts.push(`${days} ${days === 1 ? "dia" : "dias"}`);
      }
      if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? "hora" : "horas"}`);
      }
      if (minutes >= 0) {
        parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
      }

      setTimeRemaining(parts.join(", "));
    };

    // Calcular imediatamente
    calculateTimeRemaining();

    // Atualizar a cada minuto (para não sobrecarregar)
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [expiresAt, isOwner]);

  // Não mostrar se não há tempo restante ou se expirou
  if (!expiresAt || !isOwner || !timeRemaining || isExpired) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500 font-medium">
      <Clock className="h-3 w-3" />
      <span>Premium expira em {timeRemaining}</span>
    </span>
  );
}
