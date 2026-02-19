"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface HomeStats {
  professionalsCount: number;
  reviewsCount: number;
  citiesCount: number;
  servicesCount: number;
  loading: boolean;
  error: string | null;
}

export function useHomeStats(): HomeStats {
  const [stats, setStats] = useState<HomeStats>({
    professionalsCount: 0,
    reviewsCount: 0,
    citiesCount: 0,
    servicesCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar contagem de profissionais verificados
        const { count: professionalsCount, error: professionalsError } =
          await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("user_type", "professional")
            .eq("is_verified", true);

        // Se houver erro ou count for null, usar fallback baixo
        const finalProfessionalsCount = professionalsError
          ? 2
          : professionalsCount || 0;

        // Buscar contagem de avaliações
        const { count: reviewsCount, error: reviewsError } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true });

        const finalReviewsCount = reviewsError ? 5 : reviewsCount || 0;

        // Buscar contagem de cidades únicas
        const { data: citiesData, error: citiesError } = await supabase
          .from("profiles")
          .select("location_city")
          .not("location_city", "is", null);

        let citiesCount = 1; // Fallback
        if (!citiesError && citiesData) {
          const uniqueCities = new Set(
            citiesData
              .map((profile: any) => profile.location_city)
              .filter(Boolean),
          );
          citiesCount = uniqueCities.size || 1;
        }

        // Buscar contagem de tipos de serviços disponíveis na plataforma
        // O usuário quer saber quantos tipos de serviços temos para os profissionais prestarem
        const { services } = await import("@/data/services");
        const finalServicesCount = services.length || 38;

        setStats({
          professionalsCount: finalProfessionalsCount,
          reviewsCount: finalReviewsCount,
          citiesCount,
          servicesCount: finalServicesCount,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        // Usar dados de fallback em caso de erro
        setStats({
          professionalsCount: 2,
          reviewsCount: 5,
          citiesCount: 1,
          servicesCount: 38,
          loading: false,
          error: null,
        });
      }
    };

    fetchStats();
  }, []);

  return stats;
}

// Função auxiliar para formatar números
export function formatStatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k+`;
  }
  return num.toString();
}
