"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";

interface BanInfo {
  ban_id: string;
  reason: string;
  ban_type: "temporary" | "permanent";
  expires_at?: string;
  days_remaining?: number;
  admin_notes?: string;
}

export function useBanCheck() {
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();

  const checkBanStatus = async () => {
    if (!user?.id) {
      setIsBanned(false);
      setBanInfo(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Verificar se o usuário está banido
      const { data, error } = await supabase.rpc("get_user_ban_info", {
        user_uuid: user.id,
      });

      if (error) {
        console.error("Erro ao verificar status de banimento:", error);
        setIsBanned(false);
        setBanInfo(null);
        return;
      }

      if (data && data.length > 0) {
        const ban = data[0];
        setIsBanned(true);
        setBanInfo({
          ban_id: ban.ban_id,
          reason: ban.reason,
          ban_type: ban.ban_type,
          expires_at: ban.expires_at,
          days_remaining: ban.days_remaining,
          admin_notes: ban.admin_notes,
        });
      } else {
        setIsBanned(false);
        setBanInfo(null);
      }
    } catch (error) {
      console.error("Erro ao verificar banimento:", error);
      setIsBanned(false);
      setBanInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBanStatus();
  }, [user?.id]);

  return {
    isBanned,
    banInfo,
    isLoading,
    checkBanStatus,
  };
}
