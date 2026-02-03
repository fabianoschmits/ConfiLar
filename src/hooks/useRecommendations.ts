"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Recommendation {
  id: string;
  recommender_id: string;
  recommended_id: string;
  recommendation_type: string;
  created_at: string;
  recommender: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    user_type: "client" | "professional";
    location_city: string | null;
    location_state: string | null;
    rating: number;
    is_verified: boolean;
  };
}

export function useRecommendations(userId: string | undefined) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

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
              rating,
              is_verified
            )
          `,
          )
          .eq("recommended_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedData = data.map((item: any) => ({
          id: item.id,
          recommender_id: item.recommender_id,
          recommended_id: item.recommended_id,
          recommendation_type: item.recommendation_type,
          created_at: item.created_at,
          recommender: Array.isArray(item.recommender)
            ? item.recommender[0]
            : item.recommender,
        }));

        setRecommendations(transformedData);
      } catch (error) {
        console.error("Erro ao carregar recomendações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [userId]);

  return { recommendations, loading };
}
