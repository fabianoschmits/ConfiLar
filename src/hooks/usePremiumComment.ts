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

      // Usar a rota de API segura em vez de RPC direta
      const response = await fetch("/api/points/premium-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          postId,
          content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao realizar comentário premium");
      }

      console.log("✅ Comentário premium realizado via API:", result);
      return result;
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
