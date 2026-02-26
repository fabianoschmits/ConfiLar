"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";

interface CreatePremiumAdData {
  title: string;
  description: string;
  service_type: string;
  location_city: string;
  location_state: string;
  ad_type: "oferecer" | "procurar";
  price_range: string;
  contact_phone?: string;
  contact_email?: string;
  images?: string[];
  pointsToSpend: number;
  durationDays: number;
}

interface UsePremiumAdProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function usePremiumAd({ onSuccess, onError }: UsePremiumAdProps) {
  const { user } = useAuthContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const premiumAdMutation = useMutation({
    mutationFn: async (adData: CreatePremiumAdData) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Usar a nova API Route segura para criar anúncio premium
      const response = await fetch("/api/classifieds/premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: adData.title,
          description: adData.description,
          category: adData.service_type,
          location_city: adData.location_city,
          location_state: adData.location_state,
          ad_type: adData.ad_type,
          price_range: adData.price_range,
          contact_phone: adData.contact_phone,
          contact_email: adData.contact_email,
          images: adData.images,
          pointsToSpend: adData.pointsToSpend,
          durationDays: adData.durationDays,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar anúncio premium");
      }

      return result.ad;
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Anúncio premium criado com sucesso! (-${variables.pointsToSpend.toLocaleString("pt-BR")} pontos)`,
      );
      queryClient.invalidateQueries({ queryKey: ["classified-ads"] });
      queryClient.invalidateQueries({
        queryKey: ["user-classifieds", user?.id],
      });
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

  const createPremiumAd = async (adData: CreatePremiumAdData) => {
    if (isProcessing) return;

    setIsProcessing(true);
    premiumAdMutation.mutate(adData);
  };

  // Função para renovar anúncio premium
  const renewPremiumAdMutation = useMutation({
    mutationFn: async ({
      adId,
      pointsToSpend,
      durationDays,
      useCreditType,
    }: {
      adId: string;
      pointsToSpend: number;
      durationDays: number;
      useCreditType?: "1d" | "7d";
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Usar a nova API Route segura para renovar anúncio premium
      const response = await fetch("/api/classifieds/premium/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          adId,
          pointsToSpend,
          durationDays,
          useCreditType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao renovar anúncio premium");
      }

      return result.ad;
    },
    onSuccess: (data, variables) => {
      if (variables.useCreditType) {
        toast.success(
          "Anúncio premium renovado com sucesso usando crédito! 🌟",
        );
      } else {
        toast.success(
          `Anúncio premium renovado com sucesso! (-${variables.pointsToSpend.toLocaleString("pt-BR")} pontos)`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ["classified-ads"] });
      queryClient.invalidateQueries({
        queryKey: ["user-classifieds", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["user-points", user?.id] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
      onError?.(error.message);
    },
  });

  const renewPremiumAd = async (
    adId: string,
    pointsToSpend: number,
    durationDays: number,
    useCreditType?: "1d" | "7d",
  ) => {
    if (isProcessing || renewPremiumAdMutation.isPending) return;

    renewPremiumAdMutation.mutate({
      adId,
      pointsToSpend,
      durationDays,
      useCreditType,
    });
  };

  return {
    createPremiumAd,
    renewPremiumAd,
    isProcessing:
      isProcessing ||
      premiumAdMutation.isPending ||
      renewPremiumAdMutation.isPending,
    error:
      premiumAdMutation.error?.message || renewPremiumAdMutation.error?.message,
  };
}
