import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { NotificationService } from "@/services/NotificationService";
import { NotificationControlService } from "@/services/NotificationControlService";

export function useNotificationTriggers() {
  const { user } = useAuthContext();

  // Sistema de controle para evitar processamento duplicado
  const processedActions = useRef(new Set<string>());
  const isMonitoring = useRef(false); // Flag para evitar múltiplas instâncias

  // Monitorar novas avaliações
  const monitorNewReviews = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id,
          rating_person,
          comment,
          created_at,
          reviewer_id,
          reviewed_id,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name)
        `,
        )
        .eq("reviewed_id", user.id)
        .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) return;

      for (const review of data) {
        const actionId = `review_${review.id}`;

        if (processedActions.current.has(actionId)) continue;

        const reviewerName = (review.reviewer as any)?.full_name || "Usuário";

        // Marcar como processada ANTES de criar a notificação
        processedActions.current.add(actionId);

        await NotificationService.notifyNewReview(
          user.id,
          reviewerName,
          review.rating_person,
          review.id,
        );

        console.log("✅ Notificação de avaliação criada:", actionId);
      }
    } catch (error) {
      console.error("❌ Erro ao monitorar avaliações:", error);
    }
  }, [user]);

  // Monitorar novos favoritos
  const monitorNewFavorites = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("favorites")
        .select(
          `
          id,
          created_at,
          user_id,
          professional_id,
          favoriter:profiles!favorites_user_id_fkey(full_name)
        `,
        )
        .eq("professional_id", user.id)
        .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) return;

      for (const favorite of data) {
        const actionId = `favorite_${favorite.id}`;

        if (processedActions.current.has(actionId)) continue;

        const favoriterName =
          (favorite.favoriter as any)?.full_name || "Usuário";

        // Marcar como processada ANTES de criar a notificação
        processedActions.current.add(actionId);

        await NotificationService.notifyNewFavorite(user.id, favoriterName);

        console.log("✅ Notificação de favorito criada:", actionId);
      }
    } catch (error) {
      console.error("❌ Erro ao monitorar favoritos:", error);
    }
  }, [user]);

  // Monitorar recomendações
  const monitorRecommendations = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_recommendations")
        .select(
          `
          id,
          created_at,
          recommender_id,
          recommended_id,
          recommendation_type,
          recommender:profiles!user_recommendations_recommender_id_fkey(full_name),
          recommended:profiles!user_recommendations_recommended_id_fkey(full_name)
        `,
        )
        .eq("recommended_id", user.id)
        .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) return;

      for (const recommendation of data) {
        const actionId = `recommendation_${recommendation.id}`;

        if (processedActions.current.has(actionId)) continue;

        const fromUserName =
          (recommendation.recommender as any)?.full_name || "Usuário";

        // Marcar como processada ANTES de criar a notificação
        processedActions.current.add(actionId);

        await NotificationService.notifyNewRecommendation(
          user.id,
          fromUserName,
        );

        console.log("✅ Notificação de recomendação criada:", actionId);
      }
    } catch (error) {
      console.error("❌ Erro ao monitorar recomendações:", error);
    }
  }, [user]);

  // Monitorar visualizações de perfil
  const monitorProfileViews = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("profile_views")
        .select(
          `
          id,
          created_at,
          viewer_id,
          viewed_profile_id,
          viewer:profiles!profile_views_viewer_id_fkey(full_name)
        `,
        )
        .eq("viewed_profile_id", user.id)
        .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) return;

      for (const view of data) {
        const actionId = `profile_view_${view.id}`;

        if (processedActions.current.has(actionId)) continue;

        const viewerName = (view.viewer as any)?.full_name || "Usuário";

        // Marcar como processada ANTES de criar a notificação
        processedActions.current.add(actionId);

        await NotificationService.notifyProfileView(user.id, viewerName);

        console.log("✅ Notificação de visualização criada:", actionId);
      }
    } catch (error) {
      console.error("❌ Erro ao monitorar visualizações:", error);
    }
  }, [user]);

  // Executar monitoramento periodicamente (REATIVADO COM CONTROLES)
  useEffect(() => {
    if (!user) return;

    // Evitar múltiplas instâncias
    if (isMonitoring.current) {
      console.log("⚠️ Sistema de monitoramento já está ativo, pulando...", {
        user: user.id,
        isMonitoring: isMonitoring.current,
      });
      return;
    }

    isMonitoring.current = true;
    console.log("🔄 Sistema de monitoramento INICIADO", {
      user: user.id,
      timestamp: new Date().toISOString(),
      isMonitoring: isMonitoring.current,
    });

    const runMonitoring = async () => {
      try {
        await Promise.all([
          monitorNewReviews(),
          monitorNewFavorites(),
          monitorRecommendations(),
          monitorProfileViews(),
        ]);
      } catch (error) {
        console.error("❌ Erro no monitoramento:", error);
      }
    };

    // Executar imediatamente
    runMonitoring();

    // Executar a cada 30 segundos (reduzido de 10s para evitar sobrecarga)
    const interval = setInterval(runMonitoring, 30000);

    return () => {
      clearInterval(interval);
      isMonitoring.current = false;
      console.log("🛑 Sistema de monitoramento parado");
    };
  }, [user]);

  return {
    monitorNewReviews,
    monitorNewFavorites,
    monitorRecommendations,
    monitorProfileViews,
  };
}
