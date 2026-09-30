"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Award, Star } from "lucide-react";
import { useReferralDashboard } from "@/hooks/useReferralStats";
import { ReferralTierProgress, ReferralBadge } from "./ReferralBadge";
import { cn } from "@/lib/utils";

interface ReferralDashboardProps {
  userId: string;
  className?: string;
}

export function ReferralDashboard({
  userId,
  className,
}: ReferralDashboardProps) {
  const { dashboard, loading, error } = useReferralDashboard(userId);

  if (loading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
          className,
        )}
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !dashboard?.stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <p>Erro ao carregar estatísticas</p>
        </CardContent>
      </Card>
    );
  }

  const { stats, totalPointsThisMonth, totalReferralsThisMonth } = dashboard;

  const statCards = [
    {
      title: "Total de Indicações",
      value: stats.totalReferrals,
      icon: Users,
      color: "text-[var(--cl-teal)] dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950/30",
      description: `${stats.activeReferrals} ativas`,
    },
    {
      title: "Pontos Totais",
      value: stats.totalPoints.toLocaleString(),
      icon: Star,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-950/30",
      description: `+${totalPointsThisMonth} este mês`,
    },
    {
      title: "Nível Atual",
      value: stats.tier === "none" ? "Iniciante" : getTierName(stats.tier),
      icon: Award,
      color: "text-[var(--cl-teal)] dark:text-[var(--cl-teal)]",
      bgColor: "bg-[var(--cl-mist)] dark:bg-purple-950/30",
      description: getTierDescription(stats.tier),
    },
    {
      title: "Este Mês",
      value: totalReferralsThisMonth,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-950/30",
      description: "novas indicações",
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Card Único com 4 Estatísticas em Linha - Compacto */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const isNivelAtual = stat.title === "Nível Atual";

              return (
                <div
                  key={stat.title || `stat-${index}`}
                  className="flex flex-col items-center text-center"
                >
                  {isNivelAtual ? (
                    // Badge do sistema de referral para Nível Atual
                    <div className="mb-1">
                      <ReferralBadge
                        tier={stats.tier as any}
                        totalReferrals={stats.totalReferrals}
                        size="lg"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "p-1.5 md:p-2 rounded-lg mb-1",
                        stat.bgColor,
                      )}
                    >
                      <Icon
                        className={cn("w-4 h-4 md:w-5 md:h-5", stat.color)}
                      />
                    </div>
                  )}
                  <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                    {stat.title}
                  </p>
                  <p className="text-base md:text-xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progresso para Próximo Nível */}
      {stats.tier !== "diamond" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Progresso para Próximo Nível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReferralTierProgress
              currentTier={stats.tier}
              totalReferrals={stats.totalReferrals}
            />
          </CardContent>
        </Card>
      )}

      {/* Ranking */}
      {stats.rank && (
        <Card className="bg-gradient-to-r from-[var(--cl-mist)] to-[var(--cl-mist)] dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  #{stats.rank}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sua Posição no Ranking
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Top {stats.rank} Indicadores
                  </p>
                </div>
              </div>
              <Award className="w-12 h-12 text-[var(--cl-teal)] dark:text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getTierName(tier: string): string {
  const names: Record<string, string> = {
    bronze: "Bronze",
    silver: "Prata",
    gold: "Ouro",
    platinum: "Platina",
    diamond: "Diamante",
  };
  return names[tier] || tier;
}

function getTierDescription(tier: string): string {
  const descriptions: Record<string, string> = {
    none: "Faça sua primeira indicação",
    bronze: "1-4 indicações",
    silver: "5-9 indicações",
    gold: "10-24 indicações",
    platinum: "25-49 indicações",
    diamond: "50+ indicações",
  };
  return descriptions[tier] || "";
}
