"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { supportService } from "@/modules/support/services/supportService";
import {
  Activity,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
  Users,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { startOfDay, subDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AdminKpiCards } from "@/components/gestao-confi/dashboard/AdminKpiCards";
import { AdminTemporalChart } from "@/components/gestao-confi/dashboard/AdminTemporalChart";

// --- Interfaces ---
interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeReports: number;
  openTickets: number;
  revenueToday: number;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  created_at: string;
  userName?: string;
  userAvatar?: string;
}

// ... (QuickLink omitido para brevidade no diff se possível, mas vou manter a estrutura correta)

// --- Components ---

function QuickLink({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: any;
  label: string;
  color: string;
}) {
  return (
    <Link href={href} className="block group">
      <Button
        variant="outline"
        className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 hover:bg-muted/50 transition-all border-border/50 shadow-sm rounded-xl sm:rounded-2xl"
      >
        <div
          className={cn(
            "p-1 sm:p-1.5 rounded-lg bg-card border border-border group-hover:scale-110 transition-transform",
            color,
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 w-5" />
        </div>
        <span className="text-[8px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
          {label}
        </span>
      </Button>
    </Link>
  );
}

// --- Main Page Component ---

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    activeReports: 0,
    openTickets: 0,
    revenueToday: 0,
  });
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [logLimit, setLogLimit] = useState(6);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 6);

    try {
      // 1. Fetch KPI Data
      const [
        { count: usersCount },
        { count: newUsers },
        metrics,
        { data: revenueData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supportService.getAdvancedMetrics(),
        supabase
          .from("points_purchases")
          .select("amount_brl")
          .eq("status", "approved")
          .gte("created_at", today.toISOString()),
      ]);

      const totalRevenueToday = (revenueData || []).reduce(
        (acc, curr) => acc + (Number(curr.amount_brl) || 0),
        0,
      );
      const activeReports = metrics.total_reports - metrics.resolved_reports;
      const openTickets =
        metrics.total_tickets -
        (metrics.resolved_tickets + metrics.closed_tickets);

      setStats({
        totalUsers: usersCount || 0,
        newUsersToday: newUsers || 0,
        activeReports,
        openTickets,
        revenueToday: totalRevenueToday,
      });

      // 2. Recent Activity (Logs) with user info & dynamic limit - LOGIN ONLY
      const { data: logs } = await supabase
        .from("system_logs")
        .select(
          `
          id, 
          message, 
          created_at, 
          level,
          user_id,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `,
        )
        .eq("action", "user_login")
        .order("created_at", { ascending: false })
        .limit(logLimit);

      if (logs) {
        setRecentLogs(
          logs.map((l: any) => ({
            id: l.id,
            action: l.level,
            details: l.message,
            created_at: l.created_at,
            userName: l.profiles?.full_name,
            userAvatar: l.profiles?.avatar_url,
          })),
        );
      }

      // 3. Registration History (Last 7 Days)
      const { data: recentProfiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      const dailyCounts = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        const count = (recentProfiles || []).filter((p) =>
          isSameDay(new Date(p.created_at), d),
        ).length;
        return {
          date: format(d, "EEE", { locale: ptBR }),
          count,
        };
      });

      setChartData(dailyCounts);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [logLimit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSeeMoreLogs = () => {
    setLogLimit(50);
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8 animate-in fade-in duration-700">
      <AdminPageHeader
        title="Dashboard Central"
        description="Acompanhamento em tempo real da rede ConfiLar."
        icon={LayoutDashboard}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="rounded-xl border-border/50 bg-white/50 backdrop-blur-sm shadow-sm"
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
          />
          Atualizar Dados
        </Button>
      </AdminPageHeader>

      <AdminKpiCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-4">
          <AdminTemporalChart
            data={chartData}
            title="Crescimento da Comunidade"
            description="Novos membros cadastrados na última semana"
            loading={loading}
          />
        </div>

        {/* Quick Links & Activity */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="rounded-[20px] sm:rounded-[32px] border-border/50 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
              <CardTitle className="text-[13px] sm:text-base font-bold">
                Menu de Ação
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <QuickLink
                  href="/gestao-confi/dashboard/atendimento"
                  icon={Activity}
                  label="Hub Atend."
                  color="text-blue-500"
                />
                <QuickLink
                  href="/gestao-confi/dashboard/users"
                  icon={Users}
                  label="Usuários"
                  color="text-indigo-500"
                />
                <QuickLink
                  href="/gestao-confi/dashboard/atendimento?tab=reports"
                  icon={AlertTriangle}
                  label="Denúncias"
                  color="text-red-500"
                />
                <QuickLink
                  href="/gestao-confi/dashboard/purchases"
                  icon={CreditCard}
                  label="Financeiro"
                  color="text-emerald-500"
                />
                <QuickLink
                  href="/gestao-confi/dashboard/system"
                  icon={Activity}
                  label="Sistema"
                  color="text-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[20px] sm:rounded-[32px] border-border/50 shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 flex flex-row items-center justify-between">
              <CardTitle className="text-[13px] sm:text-base font-bold">
                Log de Acessos
              </CardTitle>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div
                className={cn(
                  "space-y-4",
                  logLimit > 6 &&
                    "max-h-[450px] overflow-y-auto pr-2 custom-scrollbar",
                )}
              >
                {loading && recentLogs.length === 0
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </div>
                    ))
                  : recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 text-sm border-b last:border-0 pb-3 last:pb-0 border-border/40 group hover:bg-muted/5 transition-colors"
                      >
                        {log.userAvatar ? (
                          <img
                            src={log.userAvatar}
                            alt={log.userName || "Admin"}
                            className="h-8 w-8 rounded-full mt-0.5 shrink-0 object-cover border border-border shadow-sm group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="bg-muted p-2 rounded-full mt-0.5 shrink-0 group-hover:bg-blue-600/10 group-hover:text-blue-600 transition-colors">
                            <Activity className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="grid gap-0.5">
                          <p className="font-bold text-[11px] sm:text-[13px] leading-snug">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-2">
                            {log.userName && (
                              <span className="text-[8px] sm:text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                {log.userName}
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[7px] sm:text-[9px] font-black uppercase px-1.5 rounded-md",
                                log.action === "ERROR"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600",
                              )}
                            >
                              {log.action}
                            </span>
                            <p className="text-[8px] sm:text-[10px] text-muted-foreground font-medium">
                              {format(
                                new Date(log.created_at),
                                "HH:mm '•' dd MMM",
                                { locale: ptBR },
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                {!loading && recentLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum log registrado.
                  </p>
                )}

                {logLimit === 6 && recentLogs.length >= 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs text-muted-foreground hover:text-primary rounded-xl"
                    onClick={handleSeeMoreLogs}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 mr-2" />
                    )}
                    Ver mais eventos
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
