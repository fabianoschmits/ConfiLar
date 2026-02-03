import { useState, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface TimelineFilters {
  category?: string;
  location?: string;
}

interface FeedPost {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  location_state?: string;
  location_city?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: string;
  };
}

export function useTimeline(filters: TimelineFilters = {}) {
  const [currentPage, setCurrentPage] = useState(0);
  const POSTS_PER_PAGE = 20;

  // Query otimizada para timeline com paginação infinita
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["timeline", filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const page = pageParam as number;
      const { data, error } = await supabase
        .from("feed_posts")
        .select(
          `
          id,
          user_id,
          content,
          images,
          location_state,
          location_city,
          likes_count,
          comments_count,
          created_at,
          updated_at,
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
        .order("created_at", { ascending: false })
        .range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);

      if (error) throw error;
      return data as unknown as FeedPost[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage as FeedPost[]).length === POSTS_PER_PAGE
        ? allPages.length
        : undefined;
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    gcTime: 1000 * 60 * 30, // Manter no cache por 30 minutos
  });

  // Função para carregar mais posts
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Função para atualizar um post específico (para curtidas, comentários)
  const updatePost = useCallback(
    (postId: string, updates: Partial<FeedPost>) => {
      // Esta função seria implementada com React Query mutations
      // Por enquanto, apenas refetch para simplicidade
      refetch();
    },
    [refetch],
  );

  // Função para adicionar um novo post
  const addPost = useCallback(
    (newPost: FeedPost) => {
      // Invalidação do cache para forçar refetch
      refetch();
    },
    [refetch],
  );

  // Flatten dos dados de todas as páginas
  const posts = data?.pages.flat() || [];

  return {
    posts,
    isLoading,
    error,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    updatePost,
    addPost,
    refetch,
  };
}

// Hook para estatísticas da timeline (otimizado)
export function useTimelineStats() {
  return useQuery({
    queryKey: ["timeline-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_posts")
        .select("id, likes_count, comments_count");
      // .eq('is_active', true) // Coluna não existe

      if (error) throw error;

      const totalPosts = data?.length || 0;
      const totalLikes =
        data?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
      const totalComments =
        data?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;

      return {
        totalPosts,
        totalLikes,
        totalComments,
        avgLikesPerPost: totalPosts > 0 ? totalLikes / totalPosts : 0,
        avgCommentsPerPost: totalPosts > 0 ? totalComments / totalPosts : 0,
      };
    },
    staleTime: 1000 * 60 * 10, // Cache por 10 minutos
    gcTime: 1000 * 60 * 60, // Manter no cache por 1 hora
  });
}
