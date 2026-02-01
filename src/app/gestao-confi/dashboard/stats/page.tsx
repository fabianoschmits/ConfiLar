"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/gestao-confi/shared/PageHeader";

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeUsers: number;
  totalPosts: number;
  postsToday: number;
  totalReports: number;
  pendingReports: number;
  totalBans: number;
  activeBans: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    activeUsers: 0,
    totalPosts: 0,
    postsToday: 0,
    totalReports: 0,
    pendingReports: 0,
    totalBans: 0,
    activeBans: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Usuários
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: newUsersToday } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      const { count: newUsersThisWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { count: activeUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("updated_at", yesterday.toISOString());

      // Posts
      const { count: totalPosts } = await supabase
        .from("feed_posts")
        .select("*", { count: "exact", head: true });

      const { count: postsToday } = await supabase
        .from("feed_posts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Denúncias
      const { count: totalReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true });

      const { count: pendingReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Banimentos
      let totalBans = 0;
      let activeBans = 0;
      try {
        const { count: total } = await supabase
          .from("user_bans")
          .select("*", { count: "exact", head: true });

        const { count: active } = await supabase
          .from("user_bans")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        totalBans = total || 0;
        activeBans = active || 0;
      } catch (error: any) {
        // Se a tabela não existir, usar 0
        if (error?.code === "PGRST116" || error?.code === "PGRST205") {
          totalBans = 0;
          activeBans = 0;
        }
      }

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        activeUsers: activeUsers || 0,
        totalPosts: totalPosts || 0,
        postsToday: postsToday || 0,
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
        totalBans: totalBans || 0,
        activeBans: activeBans || 0,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { label: "Total de Usuários", value: stats.totalUsers },
    { label: "Novos Hoje", value: stats.newUsersToday },
    { label: "Novos Esta Semana", value: stats.newUsersThisWeek },
    { label: "Usuários Ativos (24h)", value: stats.activeUsers },
    { label: "Total de Posts", value: stats.totalPosts },
    { label: "Posts Hoje", value: stats.postsToday },
    { label: "Total de Denúncias", value: stats.totalReports },
    { label: "Denúncias Pendentes", value: stats.pendingReports },
    { label: "Total de Banimentos", value: stats.totalBans },
    { label: "Banimentos Ativos", value: stats.activeBans },
  ];

  return (
    <div>
      <PageHeader
        title="Estatísticas"
        onRefresh={fetchStats}
        loading={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {item.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
