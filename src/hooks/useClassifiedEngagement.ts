"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export interface ClassifiedEngagement {
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

type ClassifiedAdLikeTarget = {
  id: string;
  likes_count?: number | null;
  comments_count?: number | null;
};

function initialEngagement(ad: ClassifiedAdLikeTarget): ClassifiedEngagement {
  return {
    likesCount: ad.likes_count || 0,
    commentsCount: ad.comments_count || 0,
    isLiked: false,
  };
}

export function useClassifiedEngagement(ads: ClassifiedAdLikeTarget[]) {
  const { user } = useAuthContext();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const pendingLocks = useRef(new Set<string>());
  const currentUserId = useRef(user?.id);
  currentUserId.current = user?.id;
  const [engagementByAd, setEngagementByAd] = useState<
    Record<string, ClassifiedEngagement>
  >({});
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(
    () => new Set(),
  );

  const adIds = useMemo(() => ads.map((ad) => ad.id), [ads]);
  const adIdsKey = adIds.join(",");

  useEffect(() => {
    if (!ads.length) {
      setEngagementByAd({});
      return;
    }

    setEngagementByAd((current) => {
      const next: Record<string, ClassifiedEngagement> = {};

      ads.forEach((ad) => {
        const previous = current[ad.id];
        next[ad.id] = {
          ...initialEngagement(ad),
          ...(previous || {}),
        };
      });

      return next;
    });
  }, [ads, adIdsKey]);

  useEffect(() => {
    setEngagementByAd((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, value]) => [
          id,
          { ...value, isLiked: false },
        ]),
      ),
    );
  }, [user?.id]);

  useEffect(() => {
    if (!adIds.length) return;

    let cancelled = false;

    const loadEngagement = async () => {
      const [countsResult, likesResult] = await Promise.all([
        supabase
          .from("classified_ads")
          .select("id, likes_count, comments_count")
          .in("id", adIds),
        user
          ? supabase
              .from("classified_ad_likes")
              .select("ad_id")
              .eq("user_id", user.id)
              .in("ad_id", adIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (cancelled) return;

      // A migração é aplicada junto do deploy. Enquanto um ambiente antigo não
      // a recebeu, a listagem continua disponível com seus contadores base.
      if (countsResult.error || likesResult.error) {
        setIsAvailable(false);
        console.warn("Engajamento de classificados indisponível:", {
          counts: countsResult.error?.message,
          likes: likesResult.error?.message,
        });
        return;
      }
      setIsAvailable(true);

      const countsById = new Map(
        (countsResult.data || []).map((ad) => [
          ad.id,
          {
            likesCount: ad.likes_count || 0,
            commentsCount: ad.comments_count || 0,
          },
        ]),
      );
      const likedAdIds = new Set(
        (likesResult.data || []).map((like) => like.ad_id),
      );

      setEngagementByAd((current) => {
        const next = { ...current };

        adIds.forEach((adId) => {
          if (user && pendingLocks.current.has(`${user.id}:${adId}`)) return;
          const counts = countsById.get(adId);
          const previous = current[adId] || {
            likesCount: 0,
            commentsCount: 0,
            isLiked: false,
          };

          next[adId] = {
            likesCount: counts?.likesCount ?? previous.likesCount,
            commentsCount: counts?.commentsCount ?? previous.commentsCount,
            isLiked: user ? likedAdIds.has(adId) : false,
          };
        });

        return next;
      });
    };

    const refresh = () => {
      if (document.visibilityState !== "hidden")
        void loadEngagement().catch(() => {
          if (!cancelled) setIsAvailable(false);
        });
    };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [adIdsKey, user, ads]);

  const getEngagement = useCallback(
    (ad: ClassifiedAdLikeTarget): ClassifiedEngagement =>
      engagementByAd[ad.id] || initialEngagement(ad),
    [engagementByAd],
  );

  const toggleLike = useCallback(
    async (ad: ClassifiedAdLikeTarget) => {
      if (!user) {
        toast.info("Faça login para curtir anúncios");
        return;
      }
      if (isAvailable !== true) {
        toast.info(
          "Curtidas temporariamente indisponíveis. Tente novamente mais tarde.",
        );
        return;
      }

      const lockKey = `${user.id}:${ad.id}`;
      if (pendingLocks.current.has(lockKey)) return;
      pendingLocks.current.add(lockKey);

      const previous = getEngagement(ad);
      const nextLiked = !previous.isLiked;

      setPendingLikeIds((current) => new Set(current).add(ad.id));
      setEngagementByAd((current) => ({
        ...current,
        [ad.id]: {
          ...previous,
          isLiked: nextLiked,
          likesCount: Math.max(0, previous.likesCount + (nextLiked ? 1 : -1)),
        },
      }));

      try {
        const result = nextLiked
          ? await supabase.from("classified_ad_likes").upsert(
              { ad_id: ad.id, user_id: user.id },
              {
                onConflict: "ad_id,user_id",
                ignoreDuplicates: true,
              },
            )
          : await supabase
              .from("classified_ad_likes")
              .delete()
              .eq("ad_id", ad.id)
              .eq("user_id", user.id);

        if (result.error) throw result.error;
        const { data: counts } = await supabase
          .from("classified_ads")
          .select("likes_count, comments_count")
          .eq("id", ad.id)
          .single();
        if (counts && currentUserId.current === user.id) {
          setEngagementByAd((current) => ({
            ...current,
            [ad.id]: {
              ...(current[ad.id] || previous),
              likesCount: counts.likes_count || 0,
              commentsCount: counts.comments_count || 0,
            },
          }));
        }
      } catch {
        if (currentUserId.current !== user.id) return;
        setEngagementByAd((current) => ({
          ...current,
          [ad.id]: {
            ...(current[ad.id] || previous),
            isLiked: previous.isLiked,
            likesCount: previous.likesCount,
          },
        }));
        toast.error("Não foi possível atualizar a curtida. Tente novamente.");
      } finally {
        pendingLocks.current.delete(lockKey);
        setPendingLikeIds((current) => {
          const next = new Set(current);
          next.delete(ad.id);
          return next;
        });
      }
    },
    [getEngagement, isAvailable, user],
  );

  const changeCommentsCount = useCallback((adId: string, change: number) => {
    setEngagementByAd((current) => {
      const previous = current[adId] || {
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      };

      return {
        ...current,
        [adId]: {
          ...previous,
          commentsCount: Math.max(0, previous.commentsCount + change),
        },
      };
    });
  }, []);

  return {
    getEngagement,
    toggleLike,
    changeCommentsCount,
    isLikePending: (adId: string) => pendingLikeIds.has(adId),
    isAvailable,
  };
}
