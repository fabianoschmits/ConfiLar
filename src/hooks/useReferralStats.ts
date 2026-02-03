"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface ReferralStats {
  userId: string;
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  totalPoints: number;
  tier: "none" | "bronze" | "silver" | "gold" | "platinum" | "diamond";
  tierUpdatedAt: string | null;
  badges: Array<{
    tier: string;
    earned_at: string;
    referrals_at_time: number;
  }>;
  rank: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralDashboard {
  stats: ReferralStats | null;
  referrals: Array<{
    id: string;
    referredId: string;
    referredName: string;
    referredAvatar: string | null;
    status: string;
    profileCompleted: boolean;
    firstPostMade: boolean;
    createdAt: string;
    activatedAt: string | null;
  }>;
  recentPoints: Array<{
    id: string;
    points: number;
    actionType: string;
    description: string;
    createdAt: string;
  }>;
  totalPointsThisMonth: number;
  totalReferralsThisMonth: number;
}

export function useReferralStats(userId?: string) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Verificar se há sessão ativa antes de fazer a consulta
    checkAuthAndLoadStats();
  }, [userId]);

  const checkAuthAndLoadStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      loadStats();
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_referral_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        // Se não existir, criar
        if (fetchError.code === "PGRST116") {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single();

          const { data: newStats, error: createError } = await supabase.rpc(
            "generate_referral_code",
            {
              user_name: profileData?.full_name || "USER",
              user_id: userId,
            },
          );

          if (createError) throw createError;

          // Buscar novamente
          const { data: finalData, error: finalError } = await supabase
            .from("user_referral_stats")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (finalError) throw finalError;

          setStats(mapStats(finalData));
        } else {
          throw fetchError;
        }
      } else {
        setStats(mapStats(data));
      }
    } catch (err: any) {
      console.error("Erro ao carregar stats de referral:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mapStats = (data: any): ReferralStats => ({
    userId: data.user_id,
    referralCode: data.referral_code,
    totalReferrals: data.total_referrals || 0,
    activeReferrals: data.active_referrals || 0,
    completedReferrals: data.completed_referrals || 0,
    totalPoints: data.total_points || 0,
    tier: data.tier || "none",
    tierUpdatedAt: data.tier_updated_at,
    badges: data.badges || [],
    rank: data.rank,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });

  return { stats, loading, error, refresh: loadStats };
}

export function useReferralDashboard(userId?: string) {
  const [dashboard, setDashboard] = useState<ReferralDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Verificar autenticação antes de carregar
    checkAuthAndLoadDashboard();
  }, [userId]);

  const checkAuthAndLoadDashboard = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      loadDashboard();
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_referral_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (statsError && statsError.code !== "PGRST116") throw statsError;

      // Buscar referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select(
          `
          id,
          referred_id,
          status,
          profile_completed,
          first_post_made,
          first_review_made,
          created_at,
          activated_at
        `,
        )
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });

      if (referralsError) throw referralsError;

      // Buscar perfis dos indicados separadamente
      let profilesMap: Record<
        string,
        { full_name: string; avatar_url: string | null }
      > = {};

      if (referralsData && referralsData.length > 0) {
        const referredIds = referralsData.map((r) => r.referred_id);

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", referredIds);

        if (profilesData) {
          profilesMap = profilesData.reduce(
            (acc, profile) => {
              acc[profile.id] = {
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
              };
              return acc;
            },
            {} as Record<
              string,
              { full_name: string; avatar_url: string | null }
            >,
          );
        }
      }

      // Buscar histórico de pontos recente
      const { data: pointsData, error: pointsError } = await supabase
        .from("referral_points_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (pointsError) throw pointsError;

      // Calcular pontos do mês
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthPointsData } = await supabase
        .from("referral_points_history")
        .select("points")
        .eq("user_id", userId)
        .gte("created_at", startOfMonth.toISOString());

      const totalPointsThisMonth =
        monthPointsData?.reduce((sum, p) => sum + p.points, 0) || 0;

      // Contar referrals do mês
      const { count: monthReferralsCount } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", userId)
        .gte("created_at", startOfMonth.toISOString());

      const mappedReferrals = (referralsData || []).map((r: any) => {
        const profile = profilesMap[r.referred_id];
        return {
          id: r.id,
          referredId: r.referred_id,
          referredName: profile?.full_name || "Usuário",
          referredAvatar: profile?.avatar_url || null,
          status: r.status,
          profileCompleted: r.profile_completed,
          firstPostMade: r.first_post_made,
          createdAt: r.created_at,
          activatedAt: r.activated_at,
        };
      });

      const mappedPoints = (pointsData || []).map((p: any) => ({
        id: p.id,
        points: p.points,
        actionType: p.action_type,
        description: p.description || "",
        createdAt: p.created_at,
      }));

      setDashboard({
        stats: statsData ? mapStatsData(statsData) : null,
        referrals: mappedReferrals,
        recentPoints: mappedPoints,
        totalPointsThisMonth,
        totalReferralsThisMonth: monthReferralsCount || 0,
      });
    } catch (err: any) {
      console.error("Erro ao carregar dashboard de referral:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mapStatsData = (data: any): ReferralStats => ({
    userId: data.user_id,
    referralCode: data.referral_code,
    totalReferrals: data.total_referrals || 0,
    activeReferrals: data.active_referrals || 0,
    completedReferrals: data.completed_referrals || 0,
    totalPoints: data.total_points || 0,
    tier: data.tier || "none",
    tierUpdatedAt: data.tier_updated_at,
    badges: data.badges || [],
    rank: data.rank,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });

  return { dashboard, loading, error, refresh: loadDashboard };
}

export function useTopReferrers(limit: number = 10) {
  const [topReferrers, setTopReferrers] = useState<
    Array<{
      userId: string;
      fullName: string;
      avatarUrl: string | null;
      referralCode: string;
      totalReferrals: number;
      totalPoints: number;
      tier: string;
      rank: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar autenticação antes de carregar
    checkAuthAndLoadTopReferrers();
  }, [limit]);

  const checkAuthAndLoadTopReferrers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      loadTopReferrers();
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setLoading(false);
    }
  };

  const loadTopReferrers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc(
        "get_top_referrers",
        { p_limit: limit },
      );

      if (fetchError) {
        console.error("Erro na função get_top_referrers:", fetchError);
        // Fallback: buscar dados diretamente
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("user_referral_stats")
          .select(
            `
            user_id,
            referral_code,
            total_referrals,
            total_points,
            tier,
            rank,
            profiles!inner(full_name, avatar_url)
          `,
          )
          .neq("tier", "none")
          .order("total_referrals", { ascending: false })
          .limit(limit);

        if (fallbackError) throw fallbackError;

        // Mapear dados do fallback
        const mappedData = (fallbackData || []).map((item: any) => ({
          userId: item.user_id,
          fullName: item.profiles.full_name,
          avatarUrl: item.profiles.avatar_url,
          referralCode: item.referral_code,
          totalReferrals: item.total_referrals,
          totalPoints: item.total_points,
          tier: item.tier,
          rank: item.rank,
        }));

        setTopReferrers(mappedData);
        return;
      }

      // Mapear dados da função RPC
      const mappedData = (data || []).map((item: any) => ({
        userId: item.user_id,
        fullName: item.full_name,
        avatarUrl: item.avatar_url,
        referralCode: item.referral_code,
        totalReferrals: item.total_referrals,
        totalPoints: item.total_points,
        tier: item.tier,
        rank: item.rank,
      }));

      setTopReferrers(mappedData);
    } catch (err: any) {
      console.error("Erro ao carregar top referrers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { topReferrers, loading, error, refresh: loadTopReferrers };
}
