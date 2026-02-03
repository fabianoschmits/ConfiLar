"use client";

import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TimelinePost } from "@/types/timeline";

interface UseCachedPostsOptions {
  limit?: number;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useCachedPosts(options: UseCachedPostsOptions = {}) {
  const {
    limit = 20,
    enabled = true,
    staleTime = 2 * 60 * 1000,
    cacheTime = 5 * 60 * 1000,
  } = options;

  return useQuery({
    queryKey: ["posts", { limit }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:author_id (
            id,
            username,
            full_name,
            avatar_url,
            reputation_score
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as TimelinePost[];
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useCachedInfinitePosts(options: UseCachedPostsOptions = {}) {
  const { limit = 20, enabled = true, staleTime = 2 * 60 * 1000 } = options;

  return useInfiniteQuery({
    queryKey: ["posts-infinite", { limit }],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:author_id (
            id,
            username,
            full_name,
            avatar_url,
            reputation_score
          )
        `,
        )
        .order("created_at", { ascending: false })
        .range(pageParam * limit, (pageParam + 1) * limit - 1);

      if (error) throw error;
      return {
        data: data as TimelinePost[],
        nextPage: data.length === limit ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled,
    staleTime,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useCachedPost(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:author_id (
            id,
            username,
            full_name,
            avatar_url,
            reputation_score
          )
        `,
        )
        .eq("id", postId)
        .single();

      if (error) throw error;
      return data as TimelinePost;
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook para invalidar cache de posts
export function useInvalidatePosts() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
  };
}
