"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge"; // Added import
import { ThumbsUp, CheckCircle, MapPin, Star, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Recommendation } from "@/hooks/useRecommendations";

interface RecommendationsTabProps {
  recommendations: Recommendation[];
  loading: boolean;
  variant?: "default" | "minimal" | "card" | "list";
}

export function RecommendationsTab({
  recommendations,
  loading,
  variant = "default",
}: RecommendationsTabProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 animate-pulse"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={<ThumbsUp className="h-12 w-12 text-gray-400" />}
        title="Nenhuma recomendação encontrada"
        description="Este usuário ainda não recebeu recomendações."
      />
    );
  }

  if (variant === "minimal") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            href={`/ perfil / ${rec.recommender.id} `}
            className="block"
          >
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <UserAvatar
                  src={rec.recommender.avatar_url}
                  alt={rec.recommender.full_name}
                  fallback={rec.recommender.full_name?.charAt(0) || "U"}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {rec.recommender.full_name}
                    </h4>
                    {/* Replaced CheckCircle with ProVerifiedBadge */}
                    <ProVerifiedBadge
                      isVerified={rec.recommender.is_verified}
                      isPro={(rec.recommender as any).is_pro}
                      proExpiresAt={(rec.recommender as any).pro_expires_at}
                      iconSize={3}
                    />
                  </div>
                  {rec.recommender.location_city &&
                    rec.recommender.location_state && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        {rec.recommender.location_city},{" "}
                        {rec.recommender.location_state}
                      </p>
                    )}
                  <div className="flex items-center gap-2 mb-2">
                    {rec.recommender.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {rec.recommender.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <Badge
                      variant={
                        rec.recommender.user_type === "professional"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {rec.recommender.user_type === "professional"
                        ? "Profissional"
                        : "Cliente"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(rec.created_at), "dd 'de' MMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThumbsUp className="w-5 h-5" />
          Recomendações
          {recommendations.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {recommendations.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <Link
              key={rec.id}
              href={`/ perfil / ${rec.recommender.id} `}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      src={rec.recommender.avatar_url}
                      alt={rec.recommender.full_name}
                      fallback={rec.recommender.full_name?.charAt(0) || "U"}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {rec.recommender.full_name}
                        </h4>
                        {/* Replaced CheckCircle with ProVerifiedBadge */}
                        <ProVerifiedBadge
                          isVerified={rec.recommender.is_verified}
                          isPro={(rec.recommender as any).is_pro}
                          proExpiresAt={(rec.recommender as any).pro_expires_at}
                          iconSize={2.5}
                        />
                      </div>
                      {rec.recommender.location_city &&
                        rec.recommender.location_state && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            {rec.recommender.location_city},{" "}
                            {rec.recommender.location_state}
                          </p>
                        )}
                      <div className="flex items-center gap-2 mb-2">
                        {rec.recommender.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {rec.recommender.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <Badge
                          variant={
                            rec.recommender.user_type === "professional"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {rec.recommender.user_type === "professional"
                            ? "Profissional"
                            : "Cliente"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(
                          new Date(rec.created_at),
                          "dd 'de' MMM 'de' yyyy",
                          { locale: ptBR },
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
