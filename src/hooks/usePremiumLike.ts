"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";

interface UsePremiumLikeProps {
  postId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function usePremiumLike({
  postId,
  onSuccess,
  onError,
}: UsePremiumLikeProps) {
  const { user } = useAuthContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const premiumLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      // Usar a rota de API segura em vez de RPC direta
      const response = await fetch("/api/points/premium-like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          postId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao realizar curtida premium");
      }

      console.log("✅ Curtida premium realizada via API:", result);
      return result;
    },
    onSuccess: () => {
      toast.success(
        `Post curtido com sucesso! (-${PREMIUM_PRICES.LIKE.POINTS} pontos)`,
      );
      queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
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

  const handlePremiumLike = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    premiumLikeMutation.mutate();
  };

  return {
    handlePremiumLike,
    isProcessing: isProcessing || premiumLikeMutation.isPending,
    error: premiumLikeMutation.error?.message,
  };
}
