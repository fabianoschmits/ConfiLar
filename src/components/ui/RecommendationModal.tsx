"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, User, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/database";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useAutoNotifications } from "@/hooks/useAutoNotifications";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import Link from "next/link";

interface RecommendationModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface RecommendationWithProfile {
  id: string;
  recommender_id: string;
  recommended_id: string;
  recommendation_type: string;
  created_at: string;
  recommender: Profile;
}

export function RecommendationModal({
  userId,
  userName,
  isOpen,
  onClose,
}: RecommendationModalProps) {
  const { user, profile } = useAuthContext();
  const [recommendations, setRecommendations] = useState<
    RecommendationWithProfile[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [hasRecommended, setHasRecommended] = useState(false);
  const [userRecommendationId, setUserRecommendationId] = useState<
    string | null
  >(null);

  // Hook para notificações automáticas
  const { createRecommendationPost } = useAutoNotifications();

  useEffect(() => {
    if (isOpen && userId) {
      loadRecommendations();
    }
  }, [isOpen, userId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_recommendations")
        .select(
          `
          id,
          recommender_id,
          recommended_id,
          recommendation_type,
          created_at,
          recommender:profiles!user_recommendations_recommender_id_fkey (
            id,
            full_name,
            avatar_url,
            user_type,
            location_city,
            location_state,
            is_verified
          )
        `,
        )
        .eq("recommended_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transformar os dados para o formato correto
      const transformedData = data.map((item: Record<string, unknown>) => ({
        id: item.id,
        recommender_id: item.recommender_id,
        recommended_id: item.recommended_id,
        recommendation_type: item.recommendation_type,
        created_at: item.created_at,
        recommender: Array.isArray(item.recommender)
          ? item.recommender[0]
          : item.recommender,
      }));

      setRecommendations(transformedData as RecommendationWithProfile[]);

      // Check if current user has recommended
      if (user) {
        const userRec = transformedData.find(
          (rec: RecommendationWithProfile) => rec.recommender_id === user.id,
        ) as RecommendationWithProfile | undefined;
        setHasRecommended(!!userRec);
        setUserRecommendationId(userRec?.id || null);
      }
    } catch (error) {
      console.error("Erro ao carregar recomendações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendUser = async () => {
    if (!user) {
      toast.error("Faça login para recomendar usuários");
      return;
    }

    if (user.id === userId) {
      toast.error("Você não pode se recomendar");
      return;
    }

    try {
      setRecommending(true);

      // Verificar se já existe uma recomendação
      const { data: existingRecommendation } = await supabase
        .from("user_recommendations")
        .select("id")
        .eq("recommender_id", user.id)
        .eq("recommended_id", userId)
        .single();

      if (existingRecommendation) {
        toast.info("Você já recomendou este usuário!");
        return;
      }

      // Determinar o tipo de recomendação baseado no tipo do usuário atual
      const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .maybeSingle();

      const recommendationType =
        currentUserProfile?.user_type === "professional"
          ? "professional_to_client"
          : "client_to_professional";

      const { error } = await supabase.from("user_recommendations").insert({
        recommender_id: user.id,
        recommended_id: userId,
        recommendation_type: recommendationType,
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("Você já recomendou este usuário!");
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Você recomendou ${userName}!`);

      // Criar post automático no feed social
      try {
        if (profile?.full_name) {
          await createRecommendationPost(
            user.id,
            profile.full_name,
            userId,
            userName,
          );
        }
      } catch (postError) {
        console.error("Erro ao criar post de recomendação:", postError);
      }

      loadRecommendations();
    } catch (error) {
      console.error("Erro ao recomendar usuário:", error);
      toast.error("Erro ao recomendar usuário");
    } finally {
      setRecommending(false);
    }
  };

  const handleCancelRecommendation = async () => {
    if (!user || !userRecommendationId) {
      return;
    }

    try {
      setRecommending(true);

      const { error } = await supabase
        .from("user_recommendations")
        .delete()
        .eq("id", userRecommendationId);

      if (error) throw error;

      toast.success("Recomendação cancelada!");
      loadRecommendations();
    } catch (error) {
      console.error("Erro ao cancelar recomendação:", error);
      toast.error("Erro ao cancelar recomendação");
    } finally {
      setRecommending(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Recomendações"
      description={`Ver quem recomendou ${userName}`}
    >
      <div className="space-y-6">
        {/* Recommend Button Section */}
        <div className="space-y-3">
          <Button
            onClick={
              hasRecommended ? handleCancelRecommendation : handleRecommendUser
            }
            disabled={recommending || user?.id === userId}
            variant={hasRecommended ? "outline" : "default"}
            className={`w-full ${!hasRecommended && "bg-[#00b0b0] hover:bg-[#009999] text-white"}`}
          >
            {recommending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {hasRecommended ? "Cancelando..." : "Recomendando..."}
              </>
            ) : hasRecommended ? (
              <>
                <ThumbsUp className="h-4 w-4 mr-2 fill-[#00b0b0] text-[#00b0b0]" />
                Cancelar Recomendação
              </>
            ) : (
              <>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Recomendar {userName}
              </>
            )}
          </Button>
          {user?.id === userId && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Você não pode se recomendar
            </p>
          )}
        </div>

        {/* Recommendations List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Quem recomendou ({recommendations.length})
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <ThumbsUp className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nenhuma recomendação ainda
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <Link href={`/perfil/${rec.recommender.id}`}>
                    <Avatar className="h-8 w-8 md:h-12 md:w-12 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all">
                      <AvatarImage
                        src={rec.recommender.avatar_url || ""}
                        alt={rec.recommender.full_name || "Usuário"}
                      />
                      <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs md:text-base">
                        {rec.recommender.full_name?.charAt(0) || (
                          <User className="h-3 w-3 md:h-5 md:w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/perfil/${rec.recommender.id}`}
                      className="block hover:underline"
                    >
                      <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white truncate">
                        {rec.recommender.full_name || "Usuário"}
                      </p>
                    </Link>
                    {rec.recommender.location_city &&
                      rec.recommender.location_state && (
                        <div className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                          <span className="truncate">
                            {rec.recommender.location_city},{" "}
                            {rec.recommender.location_state}
                          </span>
                        </div>
                      )}
                  </div>

                  <Badge
                    variant="outline"
                    className="text-[10px] md:text-xs shrink-0 bg-gray-50 dark:bg-gray-800 px-1.5 md:px-2 py-0.5"
                  >
                    {rec.recommendation_type === "professional_to_client"
                      ? "Profissional"
                      : "Cliente"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
}
