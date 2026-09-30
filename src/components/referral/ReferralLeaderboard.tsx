"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Award, Medal } from "lucide-react";
import { useTopReferrers } from "@/hooks/useReferralStats";
import { ReferralBadge } from "./ReferralBadge";
import { cn } from "@/lib/utils";

interface ReferralLeaderboardProps {
  limit?: number;
  className?: string;
}

export function ReferralLeaderboard({
  limit = 10,
  className,
}: ReferralLeaderboardProps) {
  const { topReferrers, loading } = useTopReferrers(limit);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Top Indicadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topReferrers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Top Indicadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Nenhum indicador ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
          Top Indicadores
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {topReferrers.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Nenhum indicador encontrado
            </div>
          ) : (
            topReferrers.map((referrer, index) => {
              const isTop3 = index < 3;
              const positionIcon = getPositionIcon(index + 1);

              return (
                <div
                  key={referrer.userId || `referrer-${index}`}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    isTop3 &&
                      "bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/10 dark:to-amber-950/10",
                  )}
                >
                  {/* Posição */}
                  <div className="flex items-center justify-center w-8 h-8">
                    {positionIcon ? (
                      positionIcon
                    ) : (
                      <span className="font-bold text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar e Nome - Link para perfil */}
                  <Link
                    href={`/perfil/${referrer.userId}`}
                    className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-10 h-10 ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-700">
                      <AvatarImage src={referrer.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {referrer.fullName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white truncate hover:underline">
                          {referrer.fullName}
                        </p>
                        <ReferralBadge
                          tier={referrer.tier as any}
                          totalReferrals={referrer.totalReferrals}
                          size="sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Código: {referrer.referralCode}
                      </p>
                    </div>
                  </Link>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-[var(--cl-teal)] dark:text-blue-400">
                      {referrer.totalReferrals}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {referrer.totalReferrals === 1
                        ? "indicação"
                        : "indicações"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {(referrer.totalPoints || 0).toLocaleString()} pts
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getPositionIcon(position: number): React.ReactNode | null {
  switch (position) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Award className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-700" />;
    default:
      return null;
  }
}
