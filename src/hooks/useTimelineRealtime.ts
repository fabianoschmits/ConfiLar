import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function useTimelineRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Configurar Realtime para feed_posts
    const feedPostsChannel = supabase
      .channel("timeline-feed-posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feed_posts",
        },
        (payload) => {
          console.log("🔄 Feed post atualizado:", payload);

          // Não invalidar cache para exclusões - isso pode causar posts deletados a reaparecerem
          if (payload.eventType === "DELETE") {
            console.log(
              "📝 Post deletado detectado, não invalidando cache para evitar reaparecimento",
            );
            return;
          }

          // Invalidar cache apenas para INSERT e UPDATE
          queryClient.invalidateQueries({
            queryKey: ["unified-timeline"],
          });
        },
      )
      .subscribe();

    // Configurar Realtime para user_activity_log
    const activityChannel = supabase
      .channel("timeline-activities")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_activity_log",
        },
        (payload) => {
          console.log("🔄 Atividade atualizada:", payload);

          // Invalidar cache da timeline
          queryClient.invalidateQueries({
            queryKey: ["unified-timeline"],
          });
        },
      )
      .subscribe();

    // Realtime para notificações removido - notificações não aparecem mais no feed

    // Cleanup
    return () => {
      feedPostsChannel.unsubscribe();
      activityChannel.unsubscribe();
      // notificationsChannel removido
    };
  }, [queryClient]);
}
