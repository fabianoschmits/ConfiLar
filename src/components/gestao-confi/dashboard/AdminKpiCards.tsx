"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Activity,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIData {
  label: string;
  value: number;
  icon: LucideIcon;
  description: string;
  trend?: "up" | "down" | "neutral";
  color: string;
  href?: string;
}

function AnimatedValue({
  value,
  format = (v: number) => v.toLocaleString("pt-BR"),
}: {
  value: number;
  format?: (v: number) => string;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out quartic
      setDisplayed(Math.round(value * eased));

      if (current >= steps) {
        setDisplayed(value);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{format(displayed)}</>;
}

export function AdminKpiCards({
  stats,
  loading,
}: {
  stats: {
    totalUsers: number;
    newUsersToday: number;
    activeReports: number;
    openTickets: number;
    revenueToday: number;
  };
  loading: boolean;
}) {
  const cards: KPIData[] = [
    {
      label: "Total de Usuários",
      value: stats.totalUsers,
      icon: Users,
      description: `+${stats.newUsersToday} hoje`,
      trend: "up",
      color: "blue",
      href: "/gestao-confi/dashboard/users",
    },
    {
      label: "Tickets Abertos",
      value: stats.openTickets,
      icon: MessageSquare,
      description: "Suporte pendente",
      color: "amber",
      href: "/gestao-confi/dashboard/atendimento?tab=tickets",
    },
    {
      label: "Denúncias Ativas",
      value: stats.activeReports,
      icon: AlertTriangle,
      description: "Requer moderação",
      trend: stats.activeReports > 0 ? "down" : "neutral",
      color: "red",
      href: "/gestao-confi/dashboard/atendimento?tab=reports",
    },
    {
      label: "Receita (Hoje)",
      value: stats.revenueToday,
      icon: TrendingUp,
      description: "Venda de créditos",
      color: "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;

        // Dynamic colors based on card.color
        const colorClasses: Record<string, string> = {
          blue: "border-blue-100 bg-[var(--cl-mist)]/30 text-[var(--cl-teal)]",
          amber: "border-amber-100 bg-amber-50/30 text-amber-600",
          red: "border-red-100 bg-red-50/30 text-red-600",
          emerald: "border-emerald-100 bg-emerald-50/30 text-emerald-600",
        };

        const iconBgClasses: Record<string, string> = {
          blue: "bg-[var(--cl-ink)]/10",
          amber: "bg-amber-600/10",
          red: "bg-red-600/10",
          emerald: "bg-emerald-600/10",
        };

        if (loading) {
          return (
            <div
              key={i}
              className="h-24 sm:h-32 rounded-2xl sm:rounded-3xl border bg-white animate-pulse"
            />
          );
        }

        return (
          <div
            key={i}
            className={cn(
              "p-3 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all hover:shadow-lg hover:-translate-y-1 group bg-[var(--cl-surface)]",
              colorClasses[card.color] || "border-gray-100",
            )}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div
                className={cn(
                  "p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl",
                  iconBgClasses[card.color],
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 h-5" />
              </div>
              {card.trend === "up" && (
                <div className="flex items-center text-[8px] sm:text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                  <Activity className="w-2 h-2 sm:w-3 h-3 mr-1" />
                  LIVE
                </div>
              )}
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <h4 className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider opacity-60">
                {card.label}
              </h4>
              <div className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {card.color === "emerald" ? "R$ " : ""}
                <AnimatedValue
                  value={card.value}
                  format={
                    card.color === "emerald"
                      ? (v) => v.toFixed(2).replace(".", ",")
                      : undefined
                  }
                />
              </div>
              <p className="text-[8px] sm:text-xs font-medium opacity-50 truncate">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
