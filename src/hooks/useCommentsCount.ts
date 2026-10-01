import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CommentsCountResult {
  count: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCommentsCount(postId: string): CommentsCountResult {
  const queryClient = useQueryClient();

  // Query para buscar contagem de comentários
  const {
    data: count = 0,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments-count", postId],
    queryFn: async () => {
      // Contar apenas comentários principais (não respostas) e não deletados
      // Isso mantém a consistência com a lista de comentários exibida
      const { count, error } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("is_deleted", false)
        .is("parent_comment_id", null); // Apenas comentários principais (não respostas)

      if (error) {
        console.error(
          "❌ [useCommentsCount] Erro ao contar comentários:",
          error,
        );
        throw error;
      }

      const totalCount = count || 0;
      console.log("📊 [useCommentsCount] Contagem de comentários:", {
        postId,
        count: totalCount,
      });
      return totalCount;
    },
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
  });

  // Função para sincronizar contador
  const syncCount = async () => {
    try {
      // Contar apenas comentários principais (não respostas) e não deletados
      const { count, error } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("is_deleted", false)
        .is("parent_comment_id", null); // Apenas comentários principais (não respostas)

      if (error) throw error;

      const actualCount = count || 0;

      // Reading comments must never overwrite counters owned by database triggers.
      queryClient.setQueryData(["comments-count", postId], actualCount);
      void queryClient.invalidateQueries({ queryKey: ["unified-timeline"] });

      return actualCount;
    } catch (error) {
      console.error("Erro ao sincronizar contador de comentários:", error);
      throw error;
    }
  };

  return {
    count,
    isLoading,
    error: error as Error | null,
    refetch: syncCount,
  };
}

// Hook para atualizar contador quando comentário é adicionado/removido
export function useCommentsCountUpdater(postId: string) {
  const queryClient = useQueryClient();

  const incrementCount = () => {
    queryClient.setQueryData(
      ["comments-count", postId],
      (oldCount: number) => (oldCount || 0) + 1,
    );

    // Atualizar no banco
    queryClient.invalidateQueries({ queryKey: ["comments-count", postId] });
  };

  const decrementCount = () => {
    queryClient.setQueryData(["comments-count", postId], (oldCount: number) =>
      Math.max((oldCount || 0) - 1, 0),
    );

    // Atualizar no banco
    queryClient.invalidateQueries({ queryKey: ["comments-count", postId] });
  };

  const syncCount = async () => {
    try {
      const { count, error } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("is_deleted", false)
        .is("parent_comment_id", null);

      if (error) throw error;

      const actualCount = count || 0;
      queryClient.setQueryData(["comments-count", postId], actualCount);

      return actualCount;
    } catch (error) {
      console.error("Erro ao sincronizar contador:", error);
      throw error;
    }
  };

  return {
    incrementCount,
    decrementCount,
    syncCount,
  };
}
