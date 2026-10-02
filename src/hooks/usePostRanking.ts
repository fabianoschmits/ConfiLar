import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface TrendingPost {
  id: string;
  title: string;
  description: string;
  images: string[];
  location_city: string;
  location_state: string;
  professional_id: string;
  professional_name: string;
  professional_avatar?: string;
  engagement_score: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  trending_reason: "high_engagement" | "new_post" | "verified_professional";
}

export function usePostRanking(filters: {
  location_city?: string;
  location_state?: string;
  time_range?: "24h" | "7d" | "30d";
  limit?: number;
}) {
  const {
    data: trendingPosts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trending-posts", filters],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from("feed_posts")
        .select(
          `
          id,
          user_id,
          content,
          images,
          location_city,
          location_state,
          likes_count,
          comments_count,
          created_at,
          user:profiles!feed_posts_user_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type,
            is_available
          )
        `,
        )
        .eq("is_active", true)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (filters.location_city)
        query = query.eq("location_city", filters.location_city);
      if (filters.location_state)
        query = query.eq("location_state", filters.location_state);
      const days =
        filters.time_range === "30d" ? 30 : filters.time_range === "7d" ? 7 : 1;
      query = query.gte(
        "created_at",
        new Date(Date.now() - days * 86400000).toISOString(),
      );
      const { data, error } = await query.limit(120).abortSignal(signal);

      if (error) throw error;

      // Do not issue one request per post. Views are private analytics, not a public ranking input.
      const postsWithViews = (data || []).map((post) => ({
        ...post,
        views_count: 0,
      }));
      // Calcular score de engajamento
      const postsWithScore = postsWithViews.map((post) => {
        const engagementScore = calculateEngagementScore(post);
        const trendingReason = determineTrendingReason(post, engagementScore);

        return {
          id: post.id,
          title: post.content, // Usar content como título
          description: post.content, // Usar content como descrição
          images: post.images || [],
          location_city: post.location_city,
          location_state: post.location_state,
          professional_id: post.user_id,
          professional_name: (post.user as any)?.full_name || "Usuário",
          professional_avatar: (post.user as any)?.avatar_url,
          engagement_score: engagementScore,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: 0, // Implementar contagem de shares
          views_count: 0, // Campo não existe na tabela
          created_at: post.created_at,
          trending_reason: trendingReason,
        };
      });

      // Ordenar por score de engajamento
      return postsWithScore
        .sort((a, b) => b.engagement_score - a.engagement_score)
        .slice(0, filters.limit || 10);
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    gcTime: 1000 * 60 * 10, // Manter no cache por 10 minutos
  });

  return {
    trendingPosts: trendingPosts || [],
    isLoading,
    error,
  };
}

// Função para calcular score de engajamento
function calculateEngagementScore(post: any): number {
  const likes = post.likes_count || 0;
  const comments = post.comments_count || 0;
  const views = post.views_count || 0;

  // Fórmula de engajamento: likes * 2 + comments * 3 + views * 0.5
  const engagementScore = likes * 2 + comments * 3 + views * 0.5;

  // Bonus por profissional verificado
  const verifiedBonus =
    (post.user as any)?.user_type === "professional" ? 10 : 0;

  // Bonus por post recente (últimas 24h)
  const isRecent =
    new Date().getTime() - new Date(post.created_at).getTime() <
    24 * 60 * 60 * 1000;
  const recentBonus = isRecent ? 5 : 0;

  return engagementScore + verifiedBonus + recentBonus;
}

// Função para determinar motivo do trending
function determineTrendingReason(
  post: any,
  score: number,
): TrendingPost["trending_reason"] {
  // Priorizar high engagement
  if (score > 50) {
    return "high_engagement";
  }

  // Depois verificar se é post recente
  const isRecent =
    new Date().getTime() - new Date(post.created_at).getTime() <
    24 * 60 * 60 * 1000;
  if (isRecent) {
    return "new_post";
  }

  // Se é profissional verificado mas não tem engajamento alto, mostrar como verificado
  if ((post.user as any)?.user_type === "professional") {
    return "verified_professional";
  }

  // Padrão: high engagement
  return "high_engagement";
}
