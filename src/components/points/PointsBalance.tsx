"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins, TrendingUp, Award, Star } from "lucide-react";
import { usePoints } from "@/hooks/usePoints";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  formatPoints,
  getLevelProgress,
  getPointsToNextLevel,
  getNextLevel,
  USER_LEVELS,
} from "@/types/points";
import { cn } from "@/lib/utils";

interface PointsBalanceProps {
  className?: string;
  showDetails?: boolean;
}

export function PointsBalance({
  className,
  showDetails = true,
}: PointsBalanceProps) {
  const { user } = useAuthContext();
  const { balance, loading, error } = usePoints(user?.id);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-600" />
            Seus Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            {showDetails && (
              <>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded" />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !balance) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-600" />
            Seus Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Erro ao carregar pontos</p>
        </CardContent>
      </Card>
    );
  }

  const nextLevel = getNextLevel(balance.level);
  const pointsToNext = getPointsToNextLevel(
    balance.total_earned,
    balance.level,
  );
  const progressPercentage = getLevelProgress(
    balance.total_earned,
    balance.level,
  );
  const levelConfig = USER_LEVELS[balance.level];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-600" />
          Seus Pontos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saldo Principal */}
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatPoints(balance.balance)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            pontos disponíveis
          </p>
        </div>

        {/* Nível Atual */}
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-sm font-medium",
              balance.level === "bronze" && "border-amber-600 text-amber-600",
              balance.level === "silver" && "border-gray-400 text-gray-600",
              balance.level === "gold" && "border-yellow-500 text-yellow-600",
              balance.level === "platinum" && "border-gray-300 text-gray-500",
              balance.level === "diamond" && "border-cyan-400 text-cyan-600",
            )}
          >
            <Award className="w-4 h-4 mr-1" />
            {levelConfig.name}
          </Badge>
        </div>

        {showDetails && (
          <>
            {/* Progresso para Próximo Nível */}
            {nextLevel && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progresso para {USER_LEVELS[nextLevel].name}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatPoints(pointsToNext)} pontos restantes
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                  {progressPercentage.toFixed(1)}% completo
                </div>
              </div>
            )}

            {/* Estatísticas Detalhadas */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatPoints(0)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hoje</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatPoints(balance.total_earned)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total ganho
                </p>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Sistema de pontos ConfiLar
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
