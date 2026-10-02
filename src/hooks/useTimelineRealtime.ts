import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
export function useTimelineRealtime(includeActivities = false) {
  const queryClient = useQueryClient();
  useEffect(() => {
    let channels: ReturnType<typeof supabase.channel>[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    const invalidate = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["unified-timeline"] }),
        1000,
      );
    };
    const stop = () => {
      clearTimeout(timer);
      channels.forEach((c) => {
        void supabase.removeChannel(c);
      });
      channels = [];
    };
    const start = () => {
      stop();
      if (document.hidden || !navigator.onLine) return;
      channels.push(
        supabase
          .channel("timeline-feed-posts")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "feed_posts" },
            (payload) => {
              if (payload.eventType === "DELETE") {
                queryClient.setQueriesData<any>(
                  { queryKey: ["unified-timeline"] },
                  (data: any) =>
                    data
                      ? {
                          ...data,
                          pages: data.pages.map((page: any[]) =>
                            page.filter((item) => item.id !== payload.old.id),
                          ),
                        }
                      : data,
                );
                return;
              }
              if (
                payload.eventType === "UPDATE" &&
                payload.new.is_active &&
                payload.new.is_public
              ) {
                const cached = queryClient
                  .getQueriesData<any>({ queryKey: ["unified-timeline"] })
                  .flatMap(([, data]) => data?.pages?.flat() || [])
                  .find((item: any) => item.id === payload.new.id);
                const contentFields = [
                  "title",
                  "description",
                  "images",
                  "metadata",
                  "location_city",
                  "location_state",
                  "premium_expires_at",
                ];
                if (
                  cached &&
                  cached.pagination_featured === payload.new.is_featured &&
                  contentFields.every(
                    (key) =>
                      JSON.stringify(cached[key] ?? null) ===
                      JSON.stringify(payload.new[key] ?? null),
                  )
                ) {
                  queryClient.setQueriesData<any>(
                    { queryKey: ["unified-timeline"] },
                    (data: any) =>
                      data
                        ? {
                            ...data,
                            pages: data.pages.map((page: any[]) =>
                              page.map((item) =>
                                item.id === payload.new.id
                                  ? {
                                      ...item,
                                      likes_count: payload.new.likes_count,
                                      comments_count:
                                        payload.new.comments_count,
                                    }
                                  : item,
                              ),
                            ),
                          }
                        : data,
                  );
                  return;
                }
              }
              invalidate();
            },
          )
          .subscribe(),
      );
      if (includeActivities)
        channels.push(
          supabase
            .channel("timeline-activities")
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "user_activity_log" },
              invalidate,
            )
            .subscribe(),
        );
    };
    const resume = () => {
      start();
      if (!document.hidden && navigator.onLine) invalidate();
    };
    start();
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    window.addEventListener("offline", stop);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("offline", stop);
    };
  }, [queryClient, includeActivities]);
}
