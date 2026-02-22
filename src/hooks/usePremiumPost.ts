"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";

interface CreatePremiumPostData {
  id?: string;
  title: string;
  description: string;
  images?: string[];
  location_city?: string;
  location_state?: string;
  service_category_id?: string;
  pointsToSpend: number;
  durationDays: number;
}

interface UsePremiumPostProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function usePremiumPost({ onSuccess, onError }: UsePremiumPostProps) {
  const { user } = useAuthContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const premiumPostMutation = useMutation({
    mutationFn: async (postData: CreatePremiumPostData) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Usar API route segura
      const response = await fetch("/api/posts/premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          postId: postData.id, // Only if updating/renewing
          title: postData.title,
          description: postData.description,
          category: postData.service_category_id,
          images: postData.images,
          location_city: postData.location_city,
          location_state: postData.location_state,
          durationDays: postData.durationDays,
          pointsToSpend: postData.pointsToSpend,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao realizar post premium");
      }

      console.log("✅ Post premium realizado via API:", result);
      return result;
    },
    onSuccess: () => {
      toast.success(`Post premium criado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts", user?.id] });
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

  const createPremiumPost = async (postData: CreatePremiumPostData) => {
    if (isProcessing) return;

    setIsProcessing(true);
    premiumPostMutation.mutate(postData);
  };

  return {
    createPremiumPost,
    isProcessing: isProcessing || premiumPostMutation.isPending,
    error: premiumPostMutation.error?.message,
  };
}
