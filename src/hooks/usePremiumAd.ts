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

      // Verificar saldo do usuário
      const { data: balance, error: balanceError } = await supabase
        .from("user_points_balance")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (balanceError) throw new Error("Erro ao verificar saldo");
      if (!balance || balance.balance < adData.pointsToSpend) {
        throw new Error(
          `Saldo insuficiente. Necessário: ${adData.pointsToSpend.toLocaleString("pt-BR")} pontos para anúncio premium`,
        );
      }

      // Calcular data de expiração baseado na duração escolhida
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + adData.durationDays);

      // Buscar nome do usuário do perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, user_type")
        .eq("id", user.id)
        .single();

      // Criar anúncio premium na tabela classified_ads
      const { data, error } = await supabase
        .from("classified_ads")
        .insert({
          user_id: user.id,
          user_name: profile?.full_name || "Usuário",
          user_type: profile?.user_type || "client",
          title: adData.title,
          description: adData.description,
          category: adData.service_type, // category é o nome da coluna na tabela
          location_city: adData.location_city,
          location_state: adData.location_state,
          ad_type: adData.ad_type,
          price_range: adData.price_range,
          contact_phone: adData.contact_phone,
          contact_email: adData.contact_email,
          images: adData.images || [],
          is_active: true,
          is_premium: true,
          is_featured: true,
          premium_points_spent: adData.pointsToSpend,
          premium_expires_at: expiresAt.toISOString(),
          premium_highlight_color: "#FFD700",
        })
        .select()
        .single();

      if (error) throw error;

      // Deduzir pontos
      const { error: pointsError } = await supabase.rpc("add_points", {
        p_user_id: user.id,
        p_points: -adData.pointsToSpend,
        p_source: "premium_ad",
        p_description: `Criou anúncio premium (${adData.durationDays} dia${adData.durationDays > 1 ? "s" : ""} - ${adData.pointsToSpend.toLocaleString("pt-BR")} pontos)`,
      });

      if (pointsError) throw new Error("Erro ao processar pontos");

      return data;
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
    }: {
      adId: string;
      pointsToSpend: number;
      durationDays: number;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Buscar o anúncio atual
      const { data: currentAd, error: fetchError } = await supabase
        .from("classified_ads")
        .select("*")
        .eq("id", adId)
        .single();

      if (fetchError || !currentAd) {
        throw new Error("Anúncio não encontrado");
      }

      // Verificar se o usuário é o dono do anúncio
      if (currentAd.user_id !== user.id) {
        throw new Error("Você não tem permissão para renovar este anúncio");
      }

      // Verificar saldo do usuário
      const { data: balance, error: balanceError } = await supabase
        .from("user_points_balance")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (balanceError) throw new Error("Erro ao verificar saldo");
      if (!balance || balance.balance < pointsToSpend) {
        throw new Error(
          `Saldo insuficiente. Necessário: ${pointsToSpend.toLocaleString("pt-BR")} pontos para renovar anúncio premium`,
        );
      }

      // Calcular nova data de expiração
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      // Atualizar anúncio para premium novamente
      const { data, error } = await supabase
        .from("classified_ads")
        .update({
          is_premium: true,
          is_featured: true,
          premium_points_spent: pointsToSpend,
          premium_expires_at: expiresAt.toISOString(),
          premium_highlight_color: "#FFD700",
          updated_at: new Date().toISOString(),
        })
        .eq("id", adId)
        .select()
        .single();

      if (error) throw error;

      // Deduzir pontos
      const { error: pointsError } = await supabase.rpc("add_points", {
        p_user_id: user.id,
        p_points: -pointsToSpend,
        p_source: "premium_ad_renewal",
        p_description: `Renovou anúncio premium (${durationDays} dia${durationDays > 1 ? "s" : ""} - ${pointsToSpend.toLocaleString("pt-BR")} pontos)`,
        p_metadata: {
          ad_id: adId,
          duration_days: durationDays,
          ad_title: currentAd.title,
        },
      });

      if (pointsError) throw new Error("Erro ao processar pontos");

      return data;
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Anúncio premium renovado com sucesso! (-${variables.pointsToSpend.toLocaleString("pt-BR")} pontos)`,
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
  });

  const renewPremiumAd = async (
    adId: string,
    pointsToSpend: number,
    durationDays: number,
  ) => {
    if (isProcessing || renewPremiumAdMutation.isPending) return;

    renewPremiumAdMutation.mutate({ adId, pointsToSpend, durationDays });
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
