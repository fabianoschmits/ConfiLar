import { useState, useRef } from "react";
import { financialFetch } from "@/lib/financial-fetch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { NotificationService } from "@/services/NotificationService";
import { toast } from "sonner";

interface UseStoryLikesProps {
  storyId: string;
  storyOwnerId: string;
  storyOwnerName: string;
}

interface LikeUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
}

export function useStoryLikes({
  storyId,
  storyOwnerId,
  storyOwnerName,
}: UseStoryLikesProps) {
  const queryClient = useQueryClient();
  const [isLiking, setIsLiking] = useState(false);
  const [isPremiumLiking, setIsPremiumLiking] = useState(false);
  const premiumPending = useRef(false);

  // UMA ÚNICA QUERY para buscar TUDO (otimizado)
  const { data: likesData } = useQuery({
    queryKey: ["story-likes-all", storyId],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("story_likes")
        .select(
          `
          id,
          user_id,
          is_premium,
          created_at,
          user:profiles!story_likes_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `,
        )
        .eq("story_id", storyId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Erro ao buscar likes:", error);
        return {
          likeCounts: { normal: 0, premium: 0, total: 0 },
          likeUsers: [],
          userLike: null,
          userPremiumLike: null,
        };
      }

      // Processar dados
      const normalLikes = data.filter((like) => !like.is_premium).length;
      const premiumLikes = data.filter((like) => like.is_premium).length;

      const likeUsers: LikeUser[] = data.map((like: any) => ({
        id: like.user.id,
        full_name: like.user.full_name,
        avatar_url: like.user.avatar_url,
        is_premium: like.is_premium,
        created_at: like.created_at,
      }));

      const userLike = user
        ? data.find((like) => like.user_id === user.id && !like.is_premium)
        : null;
      const userPremiumLike = user
        ? data.find((like) => like.user_id === user.id && like.is_premium)
        : null;

      return {
        likeCounts: {
          normal: normalLikes,
          premium: premiumLikes,
          total: normalLikes + premiumLikes,
        },
        likeUsers,
        userLike,
        userPremiumLike,
      };
    },
    enabled: !!storyId,
    staleTime: 0, // Sempre considerar dados "stale" para atualizar imediatamente
    refetchOnWindowFocus: false, // NÃO refazer ao focar janela
    refetchOnMount: true, // Refazer ao montar para garantir dados atualizados
    refetchInterval: false, // NÃO refazer automaticamente
  });

  // Mutation para like normal
  const likeMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      setIsLiking(true);

      const userLike = likesData?.userLike;

      if (userLike) {
        // Remover like
        const { error } = await supabase
          .from("story_likes")
          .delete()
          .eq("id", userLike.id);

        if (error) throw error;
        return { action: "removed" };
      } else {
        // Adicionar like
        const { error } = await supabase.from("story_likes").insert({
          story_id: storyId,
          user_id: user.id,
          is_premium: false,
        });

        if (error) throw error;

        // Criar notificação para o dono do story (se não for o próprio usuário)
        if (storyOwnerId !== user.id) {
          try {
            await NotificationService.sendPushNotification(
              storyOwnerId,
              "❤️ Nova curtida no story!",
              `${user.user_metadata?.full_name || "Usuário"} curtiu seu story`,
            );
          } catch (notificationError) {
            console.warn(
              "Erro ao criar notificação de curtida:",
              notificationError,
            );
          }
        }

        return { action: "added" };
      }
    },
    onSuccess: () => {
      // Invalidar e refetch imediatamente para atualizar contador sem atraso
      queryClient.invalidateQueries({ queryKey: ["story-likes-all", storyId] });
      queryClient.refetchQueries({ queryKey: ["story-likes-all", storyId] });
      // Toast removido para permitir múltiplos likes em sequência sem interrupção
    },
    onError: (error) => {
      console.error("Erro ao curtir story:", error);
      toast.error("Erro ao curtir story");
    },
    onSettled: () => {
      setIsLiking(false);
    },
  });

  // Mutation para like premium (permite múltiplos likes)
  const premiumLikeMutation = useMutation({
    networkMode: "always",
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      setIsPremiumLiking(true);

      // Chamar API para processar like premium (deduzir pontos, etc)
      const response = await financialFetch("/api/points/premium-like-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId,
          storyOwnerId,
          storyOwnerName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao dar like premium");
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidar e refetch imediatamente para atualizar contador sem atraso
      queryClient.invalidateQueries({ queryKey: ["story-likes-all", storyId] });
      queryClient.refetchQueries({ queryKey: ["story-likes-all", storyId] });
      queryClient.invalidateQueries({ queryKey: ["user-points"] });
      // Toast removido para permitir múltiplos likes em sequência sem interrupção
    },
    onError: (error: any) => {
      console.error("Erro ao dar like premium:", error);
      toast.error(error.message || "Erro ao dar like premium");
    },
    onSettled: () => {
      setIsPremiumLiking(false);
      premiumPending.current = false;
    },
  });

  const toggleLike = () => {
    if (!isLiking) {
      likeMutation.mutate();
    }
  };

  const givePremiumLike = () => {
    if (!premiumPending.current) {
      premiumPending.current = true;
      setIsPremiumLiking(true);
      premiumLikeMutation.mutate();
    }
  };

  return {
    // Actions
    toggleLike,
    givePremiumLike,

    // States
    isLiking,
    isPremiumLiking,
    isLiked: !!likesData?.userLike,
    isPremiumLiked: !!likesData?.userPremiumLike,

    // Data
    likeCounts: likesData?.likeCounts || { normal: 0, premium: 0, total: 0 },
    likeUsers: likesData?.likeUsers || [],
  };
}
