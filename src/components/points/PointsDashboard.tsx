"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  TrendingUp,
  Award,
  Star,
  History,
  Trophy,
  Target,
  Calendar,
  Users,
} from "lucide-react";
import { usePointsDashboard, usePointsLeaderboard } from "@/hooks/usePoints";
import { useAuthContext } from "@/contexts/AuthContext";
import { PointsBalance } from "./PointsBalance";
import { PointsHistory } from "./PointsHistory";
import {
  formatPoints,
  getNextLevel,
  getPointsToNextLevel,
  getLevelProgress,
  USER_LEVELS,
  UserLevel,
} from "@/types/points";
import { cn } from "@/lib/utils";

interface PointsDashboardProps {
  className?: string;
}

export function PointsDashboard({ className }: PointsDashboardProps) {
  const { user } = useAuthContext();
  const { dashboard, loading, error } = usePointsDashboard(user?.id);
  const { leaderboard, loading: leaderboardLoading } = usePointsLeaderboard(10);

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Saldo */}
          <div className="lg:col-span-1">
            <Card>
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
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo */}
          <div className="lg:col-span-2">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8 text-center">
            <Coins className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Erro ao carregar dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Não foi possível carregar suas informações de pontos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mapear nível numérico para string (compatibilidade com banco)
  const levelMap: Record<number, UserLevel> = {
    1: "bronze",
    2: "silver",
    3: "gold",
    4: "platinum",
    5: "diamond",
  };

  const userLevel = levelMap[Number(dashboard.balance.level)] || "bronze";
  const nextLevel = getNextLevel(userLevel);
  const pointsToNext = getPointsToNextLevel(
    dashboard.balance.total_earned,
    userLevel,
  );
  const progressPercentage = getLevelProgress(
    dashboard.balance.total_earned,
    userLevel,
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saldo e Nível */}
        <div className="lg:col-span-1 space-y-6">
          <PointsBalance showDetails={true} />

          {/* Estatísticas do Mês */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Este Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    +{formatPoints(dashboard.monthly_stats.earned)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ganhos
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    -{formatPoints(dashboard.monthly_stats.spent)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Gastos
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatPoints(dashboard.monthly_stats.net)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Saldo líquido
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progresso do Nível */}
          {nextLevel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Próximo Nível
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant="outline" className="text-sm font-medium mb-2">
                    <Award className="w-4 h-4 mr-1" />
                    {USER_LEVELS[nextLevel].name}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPoints(pointsToNext)} pontos restantes
                  </p>
                </div>

                <Progress value={progressPercentage} className="h-3" />

                <div className="text-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {progressPercentage.toFixed(1)}%
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    completo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Ranking
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Estatísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <PointsHistory limit={20} />
            </TabsContent>

            <TabsContent value="leaderboard">
              <LeaderboardTab
                leaderboard={leaderboard}
                loading={leaderboardLoading}
              />
            </TabsContent>

            <TabsContent value="stats">
              <StatsTab dashboard={dashboard} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

interface LeaderboardTabProps {
  leaderboard: any[];
  loading: boolean;
}

function LeaderboardTab({ leaderboard, loading }: LeaderboardTabProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Ranking Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Ranking Global
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum usuário no ranking ainda
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <div
                key={user.user_id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  index < 3
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                )}
              >
                {/* Posição */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    index === 0 && "bg-yellow-500 text-white",
                    index === 1 && "bg-gray-400 text-white",
                    index === 2 && "bg-amber-600 text-white",
                    index > 2 &&
                      "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
                  )}
                >
                  {index + 1}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>

                {/* Nome e Nível */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {user.full_name || "Usuário"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {USER_LEVELS[user.user_level]?.name || user.user_level}
                    </Badge>
                  </div>
                </div>

                {/* Pontos */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPoints(user.total_points_earned)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    pontos
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsTabProps {
  dashboard: any;
}

function StatsTab({ dashboard }: StatsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Estatísticas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Estatísticas Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatPoints(dashboard.balance.total_earned)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total ganho
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatPoints(dashboard.balance.total_spent)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total gasto
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatPoints(dashboard.balance.balance)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Saldo atual
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Posição no Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Posição no Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            #{dashboard.leaderboard_position}
          </div>
          <p className="text-gray-600 dark:text-gray-400">Posição global</p>
        </CardContent>
      </Card>
    </div>
  );
}
