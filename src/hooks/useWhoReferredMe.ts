"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface WhoReferredMe {
  referrerId: string;
  referrerName: string;
  referrerCode: string;
  referrerAvatar: string | null;
  createdAt: string;
}

export function useWhoReferredMe(userId?: string) {
  const [referrer, setReferrer] = useState<WhoReferredMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadReferrer();
  }, [userId]);

  const loadReferrer = async () => {
    try {
      setLoading(true);
      console.log(
        "🔍 [WhoReferredMe] Buscando quem indicou o usuário:",
        userId,
      );

      // Buscar se o usuário foi indicado por alguém
      const { data: referralData, error: referralError } = await supabase
        .from("referrals")
        .select("referrer_id, created_at")
        .eq("referred_id", userId)
        .single();

      if (referralError || !referralData) {
        // Usuário não foi indicado por ninguém
        console.log("ℹ️ [WhoReferredMe] Usuário não foi indicado por ninguém");
        setReferrer(null);
        return;
      }

      console.log(
        "✅ [WhoReferredMe] Referral encontrado! Indicador:",
        referralData.referrer_id,
      );

      // Buscar dados do indicador
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", referralData.referrer_id)
        .single();

      // Buscar código de referência do indicador
      const { data: statsData } = await supabase
        .from("user_referral_stats")
        .select("referral_code")
        .eq("user_id", referralData.referrer_id)
        .single();

      if (profileData) {
        console.log("✅ [WhoReferredMe] Dados do indicador:", {
          name: profileData.full_name,
          code: statsData?.referral_code,
          avatar: profileData.avatar_url ? "Sim" : "Não",
        });

        setReferrer({
          referrerId: referralData.referrer_id,
          referrerName: profileData.full_name || "Usuário",
          referrerCode: statsData?.referral_code || "",
          referrerAvatar: profileData.avatar_url || null,
          createdAt: referralData.created_at,
        });
      } else {
        console.log("⚠️ [WhoReferredMe] Perfil do indicador não encontrado");
        setReferrer(null);
      }
    } catch (err) {
      console.error("Erro ao buscar quem indicou:", err);
      setReferrer(null);
    } finally {
      setLoading(false);
    }
  };

  return { referrer, loading };
}
