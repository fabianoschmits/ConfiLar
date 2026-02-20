"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users,
  AlertTriangle,
  FileText,
  Shield,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  Star,
  Clock,
  LayoutDashboard,
  Megaphone,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { startOfDay, subDays } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

// --- Interfaces ---
interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalPosts: number;
  activeReports: number;
  pendingReports: number;
  totalReviews: number;
  systemHealth: "healthy" | "warning" | "critical";
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  created_at: string;
  user_email?: string;
}

// --- Components ---

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend === "up" && (
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  color,
  highlight,
}: {
  href: string;
  icon: any;
  label: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <Button
        variant="outline"
        className={cn(
          "w-full h-24 sm:h-20 flex flex-col gap-2 hover:bg-muted/50 transition-all border-border shadow-sm",
          highlight && "border-blue-200 dark:border-blue-900 bg-blue-50/10",
        )}
      >
        <div
          className={cn(
            "p-1.5 rounded-lg bg-card border border-border group-hover:scale-110 transition-transform",
            color,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      </Button>
    </Link>
  );
}

// --- Main Page Component ---

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    totalPosts: 0,
    activeReports: 0,
    pendingReports: 0,
    totalReviews: 0,
    systemHealth: "healthy",
  });
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const today = startOfDay(new Date());

    try {
      // 1. Basic Counts
      const [
        { count: usersCount },
        { count: newUsers },
        { count: postsCount },
        { count: reportsCount },
        { count: pendingReports },
        { count: reviewsCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase.from("feed_posts").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: usersCount || 0,
        newUsersToday: newUsers || 0,
        totalPosts: postsCount || 0,
        activeReports: reportsCount || 0,
        pendingReports: pendingReports || 0,
        totalReviews: reviewsCount || 0,
        systemHealth: "healthy", // Placeholder logic
      });

      // 2. Recent Activity (Logs)
      const { data: logs } = await supabase
        .from("system_logs")
        .select("id, message, details, created_at, level")
        .order("created_at", { ascending: false })
        .limit(5);

      if (logs) {
        setRecentLogs(
          logs.map((l) => ({
            id: l.id,
            action: l.level,
            details: l.message,
            created_at: l.created_at,
          })),
        );
      }

      // 3. Simple Chart Data (Last 7 Days Users)
      // Mocked for simplicity in this refactor step, ideally fetch real daily counts
      const mockChartData = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
          name: d.toLocaleDateString("pt-BR", { weekday: "short" }),
          users: Math.floor(Math.random() * 50) + (usersCount || 0) / 100, // Dummy trend
        };
      });
      setChartData(mockChartData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <AdminPageHeader
        title="Visão Geral"
        description="Monitoramento em tempo real da plataforma."
      >
        <Button size="sm" onClick={fetchData} disabled={loading}>
          <Activity className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </AdminPageHeader>

      {/* KPI Grid - Responsive: 1col mobile, 2col tablet, 4col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={Users}
          description={`+${stats.newUsersToday} hoje`}
          trend="up"
          loading={loading}
        />
        <StatCard
          title="Postagens"
          value={stats.totalPosts}
          icon={FileText}
          description="Total na plataforma"
          loading={loading}
        />
        <StatCard
          title="Denúncias Pendentes"
          value={stats.pendingReports}
          icon={AlertTriangle}
          description={
            stats.pendingReports > 0 ? "Requer atenção imediata" : "Tudo limpo"
          }
          trend={stats.pendingReports > 0 ? "down" : "neutral"} // 'down' is bad here visually, but context aware
          loading={loading}
        />
        <StatCard
          title="Saúde do Sistema"
          value={stats.systemHealth === "healthy" ? "Normal" : "Alerta"}
          icon={Activity}
          description="Status dos serviços"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Main Chart Area (Desktop: 4 cols, Mobile: 1 col) */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
            <CardDescription>
              Novos cadastros nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorUsers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Quick Links (Desktop: 3 cols) */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Acesso Rápido</CardTitle>
              <CardDescription>
                Atalhos para funções administrativas
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              <QuickLink
                href="/gestao-confi/dashboard"
                icon={LayoutDashboard}
                label="Admin"
                color="text-slate-500"
              />
              <QuickLink
                href="/gestao-confi/dashboard/users"
                icon={Users}
                label="Usuários"
                color="text-indigo-500"
              />
              <QuickLink
                href="/gestao-confi/dashboard/moderation"
                icon={Shield}
                label="Moderação"
                color="text-red-500"
              />
              <QuickLink
                href="/gestao-confi/dashboard/verifications"
                icon={ShieldCheck}
                label="Verificações"
                color="text-blue-500"
                highlight
              />
              <QuickLink
                href="/gestao-confi/dashboard/posts"
                icon={FileText}
                label="Posts"
                color="text-emerald-500"
              />
              <QuickLink
                href="/gestao-confi/dashboard/classifieds"
                icon={Megaphone}
                label="Anúncios"
                color="text-amber-500"
              />
              <QuickLink
                href="/gestao-confi/dashboard/logs"
                icon={Clock}
                label="Logs"
                color="text-slate-400"
              />
              <QuickLink
                href="/gestao-confi/dashboard/revenue"
                icon={CreditCard}
                label="Financeiro"
                color="text-purple-500"
              />
              <QuickLink
                href="/gestao-confi/dashboard/active-log"
                icon={Activity}
                label="Logs Ativos"
                color="text-cyan-500"
              />
              <QuickLink
                href="/gestao-confi/dashboard/tickets"
                icon={MessageSquare}
                label="Tickets"
                color="text-orange-500"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))
                  : recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 text-sm border-b last:border-0 pb-3 last:pb-0 border-border"
                      >
                        <div className="bg-muted p-2 rounded-full mt-0.5">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="grid gap-1">
                          <p className="font-medium">{log.details}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                {!loading && recentLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade recente.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
