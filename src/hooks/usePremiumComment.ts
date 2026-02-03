"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";

interface UsePremiumCommentProps {
  postId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function usePremiumComment({
  postId,
  onSuccess,
  onError,
}: UsePremiumCommentProps) {
  const { user } = useAuthContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const premiumCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Verificar saldo do usuário
      const { data: balance, error: balanceError } = await supabase
        .from("user_points_balance")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (balanceError) throw new Error("Erro ao verificar saldo");
      if (!balance || balance.balance < PREMIUM_PRICES.COMMENT.POINTS) {
        throw new Error(
          `Saldo insuficiente. Necessário: ${PREMIUM_PRICES.COMMENT.POINTS} pontos para comentar`,
        );
      }

      // Criar comentário premium
      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          post_id: postId,
          content,
          is_featured: true,
          premium_points_spent: PREMIUM_PRICES.COMMENT.POINTS,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduzir pontos
      const { error: pointsError } = await supabase.rpc("add_points", {
        p_user_id: user.id,
        p_points: -PREMIUM_PRICES.COMMENT.POINTS,
        p_source: "premium_comment",
        p_description: "Comentário premium em post",
      });

      if (pointsError) throw new Error("Erro ao processar pontos");

      return data;
    },
    onSuccess: () => {
      toast.success(
        `Comentário premium publicado! (-${PREMIUM_PRICES.COMMENT.POINTS} pontos)`,
      );
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["user-points", user?.id] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
      onError?.(error.message);
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const handlePremiumComment = async (content: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    premiumCommentMutation.mutate(content);
  };

  return {
    handlePremiumComment,
    isProcessing: isProcessing || premiumCommentMutation.isPending,
    error: premiumCommentMutation.error?.message,
  };
}
