import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Writes are owned by /api/posts/share/record. This hook only reads the counter.
export function usePostShares(postId: string) {
  const {
    data: sharesCount = 0,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post-shares", postId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("post_shares")
        .select("id", { count: "exact", head: true })
        .eq("post_id", postId);
      if (error) throw error;
      return count || 0;
    },
    staleTime: 120000,
    gcTime: 300000,
    retry: false,
  });
  return { sharesCount, isLoading, error };
}
