"use client";

import React, { useState, useEffect } from "react";
import { ReferralBadge } from "./ReferralBadge";
import { Trophy, Calendar, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TickerUser {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  tier: string;
  totalReferrals: number;
  period: "day" | "week" | "month";
}

interface ReferralTickerProps {
  className?: string;
}

export function ReferralTicker({ className }: ReferralTickerProps) {
  const [currentPeriod, setCurrentPeriod] = useState<"day" | "week" | "month">(
    "day",
  );
  const [tickerUsers, setTickerUsers] = useState<TickerUser[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  // Carregar estado de visibilidade do localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem("referral-ticker-hidden");
    if (savedVisibility === "true") {
      setIsHidden(true);
    }
  }, []);

  // Dados mockados para demonstração (substituir por dados reais)
  const mockData = {
    day: [
      {
        userId: "1",
        fullName: "Luis Henrique",
        avatarUrl: null,
        tier: "platinum",
        totalReferrals: 5,
        period: "day" as const,
      },
      {
        userId: "2",
        fullName: "Marcos Daniel",
        avatarUrl: null,
        tier: "gold",
        totalReferrals: 3,
        period: "day" as const,
      },
      {
        userId: "3",
        fullName: "Carlos Dinho",
        avatarUrl: null,
        tier: "silver",
        totalReferrals: 2,
        period: "day" as const,
      },
      {
        userId: "4",
        fullName: "Michele Campos",
        avatarUrl: null,
        tier: "bronze",
        totalReferrals: 1,
        period: "day" as const,
      },
    ],
    week: [
      {
        userId: "1",
        fullName: "Luis Henrique",
        avatarUrl: null,
        tier: "platinum",
        totalReferrals: 15,
        period: "week" as const,
      },
      {
        userId: "2",
        fullName: "Marcos Daniel",
        avatarUrl: null,
        tier: "platinum",
        totalReferrals: 12,
        period: "week" as const,
      },
      {
        userId: "3",
        fullName: "Carlos Dinho",
        avatarUrl: null,
        tier: "gold",
        totalReferrals: 8,
        period: "week" as const,
      },
      {
        userId: "4",
        fullName: "Michele Campos",
        avatarUrl: null,
        tier: "gold",
        totalReferrals: 6,
        period: "week" as const,
      },
      {
        userId: "5",
        fullName: "Dani Silva",
        avatarUrl: null,
        tier: "silver",
        totalReferrals: 4,
        period: "week" as const,
      },
    ],
    month: [
      {
        userId: "1",
        fullName: "Luis Henrique",
        avatarUrl: null,
        tier: "platinum",
        totalReferrals: 43,
        period: "month" as const,
      },
      {
        userId: "2",
        fullName: "Marcos Daniel",
        avatarUrl: null,
        tier: "platinum",
        totalReferrals: 35,
        period: "month" as const,
      },
      {
        userId: "3",
        fullName: "Carlos Dinho",
        avatarUrl: null,
        tier: "platinum",
        totalReferrals: 27,
        period: "month" as const,
      },
      {
        userId: "4",
        fullName: "Michele Campos",
        avatarUrl: null,
        tier: "gold",
        totalReferrals: 18,
        period: "month" as const,
      },
      {
        userId: "5",
        fullName: "Dani Silva",
        avatarUrl: null,
        tier: "gold",
        totalReferrals: 15,
        period: "month" as const,
      },
      {
        userId: "6",
        fullName: "Ana Costa",
        avatarUrl: null,
        tier: "silver",
        totalReferrals: 7,
        period: "month" as const,
      },
    ],
  };

  // Alternar entre períodos a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPeriod((prev) => {
        if (prev === "day") return "week";
        if (prev === "week") return "month";
        return "day";
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Atualizar dados quando o período muda
  useEffect(() => {
    setTickerUsers(mockData[currentPeriod]);
  }, [currentPeriod]);

  // Função para esconder/mostrar o ticker
  const toggleVisibility = () => {
    const newHiddenState = !isHidden;
    setIsHidden(newHiddenState);
    localStorage.setItem("referral-ticker-hidden", newHiddenState.toString());
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "day":
        return <Clock className="w-3 h-3" />;
      case "week":
        return <Calendar className="w-3 h-3" />;
      case "month":
        return <Star className="w-3 h-3" />;
      default:
        return <Trophy className="w-3 h-3" />;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "day":
        return "Hoje";
      case "week":
        return "Esta Semana";
      case "month":
        return "Este Mês";
      default:
        return "Ranking";
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case "day":
        return "text-blue-400";
      case "week":
        return "text-green-400";
      case "month":
        return "text-purple-400";
      default:
        return "text-yellow-400";
    }
  };

  if (!isVisible || tickerUsers.length === 0) {
    return null;
  }

  // Se estiver escondido, mostrar apenas o botão para expandir
  if (isHidden) {
    return (
      <div
        className={cn(
          "fixed left-0 right-0 z-[60] bg-black/5 dark:bg-white/5 backdrop-blur-[1px]",
          "bottom-0", // Sempre no rodapé da página (colado no fim)
          "h-5 sm:h-10 flex items-center justify-start", // h-5 no mobile, h-10 no desktop
          className,
        )}
      >
        <button
          onClick={toggleVisibility}
          className="px-2 sm:px-3 py-1 sm:py-2 text-gray-600/40 dark:text-white/40 hover:text-gray-600/60 dark:hover:text-white/60 transition-colors"
          title="Mostrar ticker"
        >
          <span className="text-xs">+</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-[60] bg-black/5 dark:bg-white/5 backdrop-blur-[1px]",
        "bottom-0 lg:bottom-0", // Sempre no rodapé da página (colado no fim)
        "h-5 sm:h-10 flex items-center overflow-hidden", // h-5 no mobile (ainda mais fino), h-10 no desktop
        className,
      )}
    >
      {/* Indicador do período atual - oculto no mobile */}
      <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black/10 dark:bg-white/10 rounded-r-lg">
        <div
          className={cn(
            "flex items-center gap-1",
            getPeriodColor(currentPeriod),
          )}
        >
          {getPeriodIcon(currentPeriod)}
          <span className="text-xs font-medium">
            {getPeriodLabel(currentPeriod)}
          </span>
        </div>
      </div>

      {/* Botão para minimizar - lado esquerdo */}
      <button
        onClick={toggleVisibility}
        className="px-2 sm:px-3 py-1 sm:py-2 text-gray-600/40 dark:text-white/40 hover:text-gray-600/60 dark:hover:text-white/60 transition-colors"
        title="Minimizar ticker"
      >
        <span className="text-xs">−</span>
      </button>

      {/* Barra de ticker */}
      <div className="flex-1 relative overflow-hidden">
        <div className="flex items-center gap-4 sm:gap-8 animate-ticker">
          {/* Triplicar a lista para loop infinito suave */}
          {[...tickerUsers, ...tickerUsers, ...tickerUsers].map(
            (user, index) => (
              <div
                key={`${user.userId}-${index}`}
                className="flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                {/* Mostrar categoria no início de cada ciclo no mobile */}
                {index % tickerUsers.length === 0 && (
                  <div className="sm:hidden flex items-center gap-1 px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded mr-2">
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        getPeriodColor(currentPeriod),
                      )}
                    >
                      {getPeriodIcon(currentPeriod)}
                      <span className="text-[9px] font-medium">
                        {getPeriodLabel(currentPeriod)}
                      </span>
                    </div>
                  </div>
                )}
                <span className="text-[9px] sm:text-sm font-medium text-gray-600/40 dark:text-white/40">
                  {user.fullName}
                </span>
                <div className="scale-[0.6] sm:scale-100">
                  <ReferralBadge
                    tier={user.tier as any}
                    totalReferrals={user.totalReferrals}
                    size="sm"
                    showCount={false}
                  />
                </div>
                <span className="text-[8px] sm:text-xs text-gray-600/30 dark:text-white/30">
                  {user.totalReferrals}
                </span>
                <span className="hidden sm:inline text-xs text-gray-600/30 dark:text-white/30">
                  indicações
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// CSS para animação (adicionar ao globals.css)
const tickerStyles = `
@keyframes ticker {
  0% {
    transform: translateX(100%);
  }
  88.89% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.animate-ticker {
  animation: ticker 45s linear infinite;
}

/* Animação mais rápida no mobile */
@media (max-width: 640px) {
  .animate-ticker {
    animation: ticker 35s linear infinite;
  }
}
`;

// Adicionar estilos ao documento
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = tickerStyles;
  document.head.appendChild(style);
}
