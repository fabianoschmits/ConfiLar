import { useQuery } from "@tanstack/react-query";
import { TrendingPost } from "./usePostRanking";

// Dados mock para posts em alta
const mockTrendingPosts = [
  {
    id: "trend1",
    professional_id: "user1",
    title: "Reforma de Cozinha Moderna - Antes e Depois",
    description: "Reforma de Cozinha Moderna - Antes e Depois",
    images: [
      "/placeholder-kitchen-before.jpg",
      "/placeholder-kitchen-after.jpg",
    ],
    location_city: "São Paulo",
    location_state: "SP",
    likes_count: 45,
    comments_count: 12,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    trending_score: 85,
    trending_reason: "high_engagement",
    professional: {
      id: "user1",
      full_name: "Maria Silva",
      avatar_url: "/placeholder-avatar.jpg",
      user_type: "professional",
    },
  },
  {
    id: "trend2",
    professional_id: "user2",
    title: "Dicas de Limpeza Profissional - Segredos Revelados",
    description: "Dicas de Limpeza Profissional - Segredos Revelados",
    images: ["/placeholder-cleaning-tips.jpg"],
    location_city: "Rio de Janeiro",
    location_state: "RJ",
    likes_count: 32,
    comments_count: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    trending_score: 72,
    trending_reason: "high_engagement",
    professional: {
      id: "user2",
      full_name: "João Santos",
      avatar_url: "/placeholder-avatar.jpg",
      user_type: "professional",
    },
  },
  {
    id: "trend3",
    professional_id: "user3",
    title: "Como Escolher um Eletricista Confiável",
    description: "Como Escolher um Eletricista Confiável",
    images: [],
    location_city: "Belo Horizonte",
    location_state: "MG",
    likes_count: 28,
    comments_count: 15,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    trending_score: 68,
    trending_reason: "verified_professional",
    professional: {
      id: "user3",
      full_name: "Pedro Oliveira",
      avatar_url: "/placeholder-avatar.jpg",
      user_type: "professional",
    },
  },
];

export function usePostRankingMock(options: any = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["trending-posts-mock", options],
    queryFn: async () => {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Filtrar por localização se especificado
      let posts = mockTrendingPosts;
      if (options.location_city && options.location_state) {
        posts = posts.filter(
          (post) =>
            post.location_city === options.location_city &&
            post.location_state === options.location_state,
        );
      }

      // Limitar quantidade
      const limit = options.limit || 5;
      return posts.slice(0, limit) as unknown as TrendingPost[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  return {
    trendingPosts: data || [],
    isLoading,
    error,
  };
}
