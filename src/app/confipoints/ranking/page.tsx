"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, Star, Users } from "lucide-react";
import { usePointsLeaderboard, usePoints } from "@/hooks/usePoints";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatPoints, USER_LEVELS, PointsLeaderboard } from "@/types/points";
import { cn } from "@/lib/utils";
import { RankingListSkeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function ConfiPointsRankingPage() {
  const t = useTranslations("confipoints");
  const tCommon = useTranslations("common");
  const { leaderboard, loading, error } = usePointsLeaderboard(50);
  const { user } = useAuthContext();
  const { balance } = usePoints();

  const userRank = React.useMemo(() => {
    if (!user || !leaderboard) return 0;
    return leaderboard.findIndex((u) => u.user_id === user.id) + 1;
  }, [user, leaderboard]);

  const userPoints = balance?.total_earned || 0;
  const totalUsers = leaderboard?.length || 0;

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <Star className="w-4 h-4 text-gray-400" />;
  };

  const getRankColor = (position: number) => {
    if (position === 1) return "border-yellow-100 dark:border-yellow-900/30";
    if (position === 2) return "border-gray-100 dark:border-gray-800/30";
    if (position === 3) return "border-amber-100 dark:border-amber-900/30";
    return "border-gray-50 dark:border-gray-900/50";
  };

  if (loading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-[var(--cl-paper)]">
          <div className="container py-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t("ranking")} {t("title")}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("topUsers")}
                    </p>
                  </div>
                </div>
              </div>

              <RankingListSkeleton count={10} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-[var(--cl-paper)] flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("errorLoadingRanking")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("errorLoadingRankingDescription")}
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-[var(--cl-paper)]">
        <div className="container py-4">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--cl-surface)] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-[var(--cl-teal)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Ranking ConfiPoints
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("topUsers")}
                  </p>
                </div>
              </div>
            </div>

            {/* Estatísticas do Ranking - Padronizadas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="border-gray-200 dark:border-gray-800 shadow-none bg-[var(--cl-surface)]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Users className="w-5 h-5 text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                        {t("usersInRanking")}
                      </p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {leaderboard.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800 shadow-none bg-[var(--cl-surface)]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Trophy className="w-5 h-5 text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                        {t("highestScore")}
                      </p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {leaderboard.length > 0
                          ? formatPoints(leaderboard[0].total_points_earned)
                          : "0"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800 shadow-none bg-[var(--cl-surface)]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Medal className="w-5 h-5 text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                        {t("yourRank")}
                      </p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        #{userRank > 0 ? userRank : "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800 shadow-none bg-[var(--cl-surface)]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Star className="w-5 h-5 text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                        {t("diamondUsers")}
                      </p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {
                          leaderboard.filter(
                            (u: PointsLeaderboard) =>
                              u.user_level === "diamond",
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista do Ranking */}
            {leaderboard.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t("noUsersInRanking")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("beFirstInRanking")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user: PointsLeaderboard, index: number) => (
                  <Card
                    key={user.user_id}
                    className={cn(
                      "transition-all duration-200 shadow-none border",
                      getRankColor(index + 1),
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Posição */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900">
                          {(() => {
                            if (index === 0)
                              return (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              );
                            if (index === 1)
                              return (
                                <Medal className="w-4 h-4 text-gray-300" />
                              );
                            if (index === 2)
                              return (
                                <Award className="w-4 h-4 text-amber-600" />
                              );
                            return (
                              <span className="text-xs font-bold text-gray-400">
                                #{index + 1}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Avatar */}
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                          <span className="text-sm font-medium text-gray-500">
                            {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>

                        {/* Informações */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.full_name || "Usuário"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-gray-500 uppercase">
                              {USER_LEVELS[user.user_level]?.name ||
                                user.user_level}
                            </span>
                          </div>
                        </div>

                        {/* Pontos */}
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatPoints(user.total_points_earned)}
                          </div>
                          <p className="text-[10px] text-gray-500">pontos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
