"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook para verificar e criar notificações premium automaticamente
 *
 * Este hook chama a função do banco `maintain_premium_notifications`
 * periodicamente (a cada 5 minutos) ou quando o componente é montado
 * para criar notificações de posts/anúncios premium expirando ou expirados
 */
export function usePremiumNotifications() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<Date | null>(null);

  const checkAndCreateNotifications = async () => {
    try {
      // Verificar se já verificou há menos de 5 minutos
      const now = new Date();
      if (lastCheckRef.current) {
        const minutesSinceLastCheck =
          (now.getTime() - lastCheckRef.current.getTime()) / (1000 * 60);
        if (minutesSinceLastCheck < 5) {
          console.log(
            "⏭️ Pulando verificação de notificações premium (verificou há menos de 5 minutos)",
          );
          return;
        }
      }

      console.log("🔔 Verificando notificações premium...");

      // Chamar função do banco que cria todas as notificações
      const { data, error } = await supabase.rpc(
        "maintain_premium_notifications",
      );

      if (error) {
        console.error("❌ Erro ao verificar notificações premium:", error);
        return;
      }

      lastCheckRef.current = now;

      const postsResult = data?.posts;
      const classifiedsResult = data?.classifieds;

      const expiringPosts = postsResult?.expiring_notifications || 0;
      const expiredPosts = postsResult?.expired_notifications || 0;
      const expiringClassifieds =
        classifiedsResult?.expiring_notifications || 0;
      const expiredClassifieds = classifiedsResult?.expired_notifications || 0;

      if (
        expiringPosts > 0 ||
        expiredPosts > 0 ||
        expiringClassifieds > 0 ||
        expiredClassifieds > 0
      ) {
        console.log("✅ Notificações premium criadas:", {
          posts: {
            expiring: expiringPosts,
            expired: expiredPosts,
          },
          classifieds: {
            expiring: expiringClassifieds,
            expired: expiredClassifieds,
          },
        });
      } else {
        console.log("✅ Nenhuma notificação premium pendente");
      }
    } catch (error) {
      console.error("❌ Erro ao verificar notificações premium:", error);
    }
  };

  useEffect(() => {
    // Verificar imediatamente quando o componente é montado
    checkAndCreateNotifications();

    // Verificar a cada 5 minutos
    intervalRef.current = setInterval(
      () => {
        checkAndCreateNotifications();
      },
      5 * 60 * 1000,
    ); // 5 minutos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    checkAndCreateNotifications,
  };
}
