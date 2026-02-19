import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import { updateReferralMilestone } from "@/hooks/useReferralTracking";

export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
export type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];

export interface ReviewWithProfiles extends Review {
  reviewer: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: "client" | "professional";
  };
  reviewed: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: "client" | "professional";
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: ReviewWithProfiles[];
}

export function useSupabaseReviews() {
  const [reviews, setReviews] = useState<ReviewWithProfiles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar avaliações de um usuário específico
  const fetchUserReviews = useCallback(
    async (userId: string, type: "received" | "given" = "received") => {
      setLoading(true);
      setError(null);

      try {
        const column = type === "received" ? "reviewed_id" : "reviewer_id";

        const { data, error } = await supabase
          .from("reviews")
          .select(
            `
          id,
          reviewer_id,
          reviewed_id,
          rating_person,
          comment,
          response_text,
          response_date,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          reviewed:profiles!reviews_reviewed_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          )
        `,
          )
          .eq(column, userId)
          .order("created_at", { ascending: false })
          .limit(20); // Limitar a 20 avaliações por vez

        if (error) throw error;
        setReviews((data as any) || []);
      } catch (err) {
        console.error("Erro ao buscar avaliações:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Buscar estatísticas de avaliações de um usuário
  const fetchUserReviewStats = useCallback(
    async (userId: string): Promise<ReviewStats | null> => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("rating_person, created_at")
          .eq("reviewed_id", userId);

        if (error) throw error;

        if (!data || data.length === 0) {
          return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            recentReviews: [],
          };
        }

        // Calcular estatísticas
        const totalReviews = data.length;
        const averageRating =
          data.reduce((sum, review) => sum + review.rating_person, 0) /
          totalReviews;

        const ratingDistribution = data.reduce(
          (acc, review) => {
            acc[review.rating_person as keyof typeof acc]++;
            return acc;
          },
          { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        );

        // Buscar avaliações recentes
        const recentReviewsData = await supabase
          .from("reviews")
          .select(
            `
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          reviewed:profiles!reviews_reviewed_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          ad:classified_ads(
            id,
            title,
            category
          )
        `,
          )
          .eq("reviewed_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentReviewsData.error) throw recentReviewsData.error;

        return {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          ratingDistribution,
          recentReviews: recentReviewsData.data || [],
        };
      } catch (err) {
        console.error("Erro ao buscar estatísticas de avaliações:", err);
        return null;
      }
    },
    [],
  );

  // Criar nova avaliação
  const createReview = async (reviewData: ReviewInsert) => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert(reviewData)
        .select(
          `
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          reviewed:profiles!reviews_reviewed_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          ad:classified_ads(
            id,
            title,
            category
          )
        `,
        )
        .single();

      if (error) throw error;

      // ✅ VERIFICAR SE É A PRIMEIRA AVALIAÇÃO DO USUÁRIO (para referral milestone)
      if (data && data.reviewer_id) {
        try {
          // Contar quantas avaliações o usuário fez
          const { count, error: countError } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("reviewer_id", data.reviewer_id);

          if (!countError && count === 1) {
            console.log(
              "🎉 [Review] Esta é a PRIMEIRA avaliação do usuário! Marcando milestone...",
            );

            // Marcar milestone de primeira avaliação (via API segura para bypass RLS)
            await updateReferralMilestone(
              data.reviewer_id,
              "first_review_made",
            );
          }
        } catch (milestoneError) {
          console.warn(
            "⚠️ [Review] Erro ao processar milestone de primeira avaliação:",
            milestoneError,
          );
          // Não falhar a criação da avaliação se houver erro no milestone
        }
      }

      // Criar notificação para o usuário avaliado
      if (data && data.reviewed_id !== data.reviewer_id) {
        await createReviewNotification(data);
      }

      return { data, error: null };
    } catch (err) {
      console.error("Erro ao criar avaliação:", err);
      return {
        data: null,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    }
  };

  // Criar notificação para nova avaliação
  const createReviewNotification = async (review: ReviewWithProfiles) => {
    try {
      const notificationData = {
        user_id: review.reviewed_id,
        title: "Nova Avaliação Recebida",
        message: `${review.reviewer.full_name} avaliou você com ${review.rating_person} estrelas`,
        type: "review",
        is_read: false,
        action_url: `/perfil/${review.reviewed_id}`,
        priority: "normal" as const,
      };

      const { error } = await supabase
        .from("notifications")
        .insert(notificationData);

      if (error) {
        console.error("Erro ao criar notificação de avaliação:", error);
      }
    } catch (err) {
      console.error("Erro ao criar notificação de avaliação:", err);
    }
  };

  // Atualizar avaliação
  const updateReview = async (reviewId: string, updates: ReviewUpdate) => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", reviewId)
        .select(
          `
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          reviewed:profiles!reviews_reviewed_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          ad:classified_ads(
            id,
            title,
            category
          )
        `,
        )
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error("Erro ao atualizar avaliação:", err);
      return {
        data: null,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    }
  };

  // Deletar avaliação
  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error("Erro ao deletar avaliação:", err);
      return {
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    }
  };

  // Responder a uma avaliação
  const respondToReview = async (reviewId: string, responseText: string) => {
    try {
      // Se responseText estiver vazio, remover a resposta
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (responseText && responseText.trim()) {
        updateData.response_text = responseText.trim();
        updateData.response_date = new Date().toISOString();
      } else {
        // Remover resposta
        updateData.response_text = null;
        updateData.response_date = null;
      }

      // Fazer o update sem select para evitar erro 406
      const { data: updateResult, error: updateError } = await supabase
        .from("reviews")
        .update(updateData)
        .eq("id", reviewId)
        .select("id, response_text, response_date");

      if (updateError) {
        console.error("❌ Erro ao atualizar resposta:", updateError);
        throw updateError;
      }

      // Se o update retornou dados, usar eles diretamente
      if (
        updateResult &&
        updateResult.length > 0 &&
        updateResult[0].response_text
      ) {
        const updatedReview = updateResult[0];

        // Buscar relacionamentos separadamente
        const { data: relationships } = await supabase
          .from("reviews")
          .select(
            `
            reviewer:profiles!reviews_reviewer_id_fkey(
              id,
              full_name,
              avatar_url,
              user_type
            ),
            reviewed:profiles!reviews_reviewed_id_fkey(
              id,
              full_name,
              avatar_url,
              user_type
            )
          `,
          )
          .eq("id", reviewId)
          .single();

        const reviewer = Array.isArray(relationships?.reviewer)
          ? relationships.reviewer[0]
          : relationships?.reviewer;
        const reviewed = Array.isArray(relationships?.reviewed)
          ? relationships.reviewed[0]
          : relationships?.reviewed;

        const fullData = {
          ...updatedReview,
          reviewer: reviewer || null,
          reviewed: reviewed || null,
        };

        // Atualizar o estado local
        setReviews((prevReviews) => {
          const updated = prevReviews.map((review) => {
            if (review.id === reviewId) {
              return {
                ...review,
                ...updatedReview,
                reviewer: reviewer || review.reviewer,
                reviewed: reviewed || review.reviewed,
              };
            }
            return review;
          });
          return updated;
        });

        return { data: fullData, error: null };
      }

      // Pequeno delay para garantir que o banco processou a atualização
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Buscar os dados completos com relacionamentos em uma query separada
      const { data: fullData, error: selectError } = await supabase
        .from("reviews")
        .select(
          `
          id,
          reviewer_id,
          reviewed_id,
          rating_person,
          comment,
          response_text,
          response_date,
          created_at,
          updated_at,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          reviewed:profiles!reviews_reviewed_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          )
        `,
        )
        .eq("id", reviewId)
        .single();

      if (selectError) {
        console.error("❌ Erro ao buscar avaliação atualizada:", selectError);
        throw selectError;
      }

      // Atualizar o estado local com todos os dados retornados
      if (fullData) {
        // Garantir que reviewer e reviewed sejam objetos únicos, não arrays
        const reviewer = Array.isArray(fullData.reviewer)
          ? fullData.reviewer[0]
          : fullData.reviewer;
        const reviewed = Array.isArray(fullData.reviewed)
          ? fullData.reviewed[0]
          : fullData.reviewed;

        setReviews((prevReviews) => {
          const updated = prevReviews.map((review) => {
            if (review.id === reviewId) {
              return {
                ...review,
                ...fullData,
                reviewer: reviewer || review.reviewer,
                reviewed: reviewed || review.reviewed,
              } as typeof review;
            }
            return review;
          });
          return updated;
        });
      }

      return { data: fullData, error: null };
    } catch (err) {
      console.error("Erro ao responder avaliação:", err);
      return {
        data: null,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    }
  };

  // Verificar se usuário pode avaliar outro usuário
  const canUserReview = async (
    reviewerId: string,
    reviewedId: string,
    adId?: string,
  ) => {
    try {
      // 1. Não pode avaliar a si mesmo
      if (reviewerId === reviewedId) {
        return false;
      }

      // 2. Verificar se já existe uma avaliação
      const { data: existingReview, error: reviewError } = await supabase
        .from("reviews")
        .select("id")
        .eq("reviewer_id", reviewerId)
        .eq("reviewed_id", reviewedId);

      if (reviewError) throw reviewError;

      if (existingReview && existingReview.length > 0) {
        return false; // Já existe avaliação
      }

      // 3. Verificar se há uma solicitação de avaliação aceita entre os usuários
      const { data: requestData, error: requestError } = await supabase
        .from("evaluation_requests")
        .select("id")
        .or(
          `and(requester_id.eq.${reviewerId},target_id.eq.${reviewedId}),and(requester_id.eq.${reviewedId},target_id.eq.${reviewerId})`,
        )
        .eq("status", "accepted");

      if (requestError) {
        console.error("Erro ao verificar solicitações de avaliação:", requestError);
        return false;
      }

      return requestData && requestData.length > 0;
    } catch (err) {
      console.error("Erro ao verificar se pode avaliar:", err);
      return false;
    }
  };

  return {
    reviews,
    loading,
    error,
    fetchUserReviews,
    fetchUserReviewStats,
    createReview,
    updateReview,
    deleteReview,
    respondToReview,
    canUserReview,
  };
}
