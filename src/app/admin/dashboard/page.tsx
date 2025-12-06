"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
  FileText,
  Shield,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  UserCheck,
  Ban,
  Eye,
  Star,
  Heart,
  Share2,
  BarChart3,
  MapPin,
  Clock,
  Zap,
  Server,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  DollarSign,
  Target,
  Award,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Globe,
  TrendingDown,
  Percent,
  Mail,
  Bell,
  Search,
  Filter,
  Download,
  Settings,
  Database,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Unlock,
  UserX,
  UserPlus,
  FileCheck,
  FileX,
  Timer,
  Gauge,
  Layers,
  PieChart as PieChartIcon,
} from "lucide-react";
import Link from "next/link";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CronJobsSection } from "@/components/admin/CronJobsSection";
import { useTranslations } from "next-intl";

// ========== INTERFACES ==========
interface DashboardStats {
  // Usuários
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers24h: number;
  activeUsers7d: number;
  activeUsers30d: number;
  verifiedUsers: number;
  professionalUsers: number;
  clientUsers: number;
  usersGrowth: number;
  usersByState: { state: string; count: number }[];
  avgSessionTime: number;
  retentionRate: number;

  // Posts e Engajamento
  totalPosts: number;
  postsToday: number;
  postsThisWeek: number;
  postsThisMonth: number;
  totalComments: number;
  commentsToday: number;
  totalLikes: number;
  likesToday: number;
  totalShares: number;
  avgPostsPerUser: number;
  topPosters: { id: string; name: string; count: number }[];

  // Chat
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
  avgResponseTime: number;
  conversionRate: number;

  // Avaliações
  totalReviews: number;
  reviewsToday: number;
  avgRating: number;
  reviewsDistribution: { rating: number; count: number }[];
  topRatedProfessionals: { id: string; name: string; rating: number }[];

  // Denúncias e Segurança
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalBans: number;
  activeBans: number;
  failedLogins: number;

  // Sistema
  systemErrors24h: number;
  systemErrors7d: number;
  systemWarnings24h: number;
  apiResponseTime: number;
  databaseSize: number;
  cacheHitRate: number;

  // Performance
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgPageLoadTime: number;
}

interface OnlineUser {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  is_verified: boolean;
  avatar_url: string | null;
  location_city: string | null;
  location_state: string | null;
  last_activity: string;
  posts_count: number;
  messages_count: number;
  session_duration: number;
}

interface SystemError {
  id: string;
  level: string;
  category: string;
  message: string;
  endpoint: string | null;
  status_code: number | null;
  created_at: string;
  user: { full_name: string; email: string } | null;
  details: any;
}

interface ChartData {
  date: string;
  users: number;
  posts: number;
  messages: number;
  reports: number;
  reviews: number;
}

interface ServiceCategory {
  category: string;
  count: number;
  avgRating: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
  label: string;
}

// ========== COMPONENTES DE SKELETON ==========
function MetricCardSkeleton() {
  return (
    <Card className="dark:bg-card dark:border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card className="dark:bg-card dark:border-border">
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton
          className={`h-[${height}px] w-full`}
          style={{ height: `${height}px` }}
        />
      </CardContent>
    </Card>
  );
}

function UserListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border border-border"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ========== COMPONENTE PRINCIPAL ==========
export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    activeUsers24h: 0,
    activeUsers7d: 0,
    activeUsers30d: 0,
    verifiedUsers: 0,
    professionalUsers: 0,
    clientUsers: 0,
    usersGrowth: 0,
    usersByState: [],
    avgSessionTime: 0,
    retentionRate: 0,
    totalPosts: 0,
    postsToday: 0,
    postsThisWeek: 0,
    postsThisMonth: 0,
    totalComments: 0,
    commentsToday: 0,
    totalLikes: 0,
    likesToday: 0,
    totalShares: 0,
    avgPostsPerUser: 0,
    topPosters: [],
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    messagesToday: 0,
    messagesThisWeek: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    totalReviews: 0,
    reviewsToday: 0,
    avgRating: 0,
    reviewsDistribution: [],
    topRatedProfessionals: [],
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalBans: 0,
    activeBans: 0,
    failedLogins: 0,
    systemErrors24h: 0,
    systemErrors7d: 0,
    systemWarnings24h: 0,
    apiResponseTime: 0,
    databaseSize: 0,
    cacheHitRate: 0,
    pageViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    avgPageLoadTime: 0,
  });

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [systemErrors, setSystemErrors] = useState<SystemError[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      setLoading(true);
      setError(null);

      const now = new Date();
      const today = startOfDay(now);
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);
      const yesterday = subDays(now, 1);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // ========== USUÁRIOS ==========
      const [
        { count: totalUsers },
        { count: newUsersToday },
        { count: newUsersThisWeek },
        { count: newUsersThisMonth },
        { count: activeUsers24h },
        { count: activeUsers7d },
        { count: activeUsers30d },
        { count: verifiedUsers },
        { count: professionalUsers },
        { count: clientUsers },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthAgo.toISOString()),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", yesterday.toISOString()),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", weekAgo.toISOString()),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", monthAgo.toISOString()),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "professional"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "client"),
      ]);

      // Usuários online
      const { data: onlineUsersData } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          email,
          user_type,
          is_verified,
          avatar_url,
          location_city,
          location_state,
          updated_at
        `,
        )
        .gte("updated_at", twoHoursAgo.toISOString())
        .order("updated_at", { ascending: false })
        .limit(50);

      if (onlineUsersData) {
        const usersWithStats = await Promise.all(
          onlineUsersData.map(async (user) => {
            const [postsResult, messagesResult] = await Promise.all([
              supabase
                .from("feed_posts")
                .select("id", { count: "exact", head: true })
                .eq("user_id", user.id),
              supabase
                .from("messages")
                .select("id", { count: "exact", head: true })
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
            ]);

            return {
              id: user.id,
              full_name: user.full_name || t("noName"),
              email: user.email,
              user_type: user.user_type,
              is_verified: user.is_verified,
              avatar_url: user.avatar_url,
              location_city: user.location_city,
              location_state: user.location_state,
              last_activity: user.updated_at,
              posts_count: postsResult.count || 0,
              messages_count: messagesResult.count || 0,
              session_duration: Math.floor(
                (now.getTime() - new Date(user.updated_at).getTime()) /
                  1000 /
                  60,
              ),
            };
          }),
        );
        setOnlineUsers(usersWithStats);
      }

      // Usuários por estado
      const { data: usersByLocation } = await supabase
        .from("profiles")
        .select("location_state")
        .not("location_state", "is", null);

      const usersByState = usersByLocation
        ? Object.entries(
            usersByLocation.reduce((acc: any, user: any) => {
              const state = user.location_state;
              acc[state] = (acc[state] || 0) + 1;
              return acc;
            }, {}),
          )
            .map(([state, count]) => ({ state, count: count as number }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        : [];

      // Top postadores
      const { data: postsByUser } = await supabase
        .from("feed_posts")
        .select("user_id, profiles!feed_posts_user_id_fkey(full_name)")
        .limit(1000);

      const topPosters = postsByUser
        ? Object.entries(
            postsByUser.reduce((acc: any, post: any) => {
              const userId = post.user_id;
              if (!acc[userId]) {
                acc[userId] = {
                  id: userId,
                  name: post.profiles?.full_name || t("noName"),
                  count: 0,
                };
              }
              acc[userId].count++;
              return acc;
            }, {}),
          )
            .map(([, data]: any) => data)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        : [];

      // ========== POSTS E ENGAJAMENTO ==========
      const [
        { count: totalPosts },
        { count: postsToday },
        { count: postsThisWeek },
        { count: postsThisMonth },
        { count: totalComments },
        { count: commentsToday },
        { count: totalLikes },
        { count: likesToday },
      ] = await Promise.all([
        supabase.from("feed_posts").select("*", { count: "exact", head: true }),
        supabase
          .from("feed_posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("feed_posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("feed_posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthAgo.toISOString()),
        supabase
          .from("post_comments")
          .select("*", { count: "exact", head: true })
          .eq("is_deleted", false),
        supabase
          .from("post_comments")
          .select("*", { count: "exact", head: true })
          .eq("is_deleted", false)
          .gte("created_at", today.toISOString()),
        supabase.from("post_likes").select("*", { count: "exact", head: true }),
        supabase
          .from("post_likes")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
      ]);

      let totalShares = 0;
      try {
        const { count } = await supabase
          .from("post_shares")
          .select("*", { count: "exact", head: true });
        totalShares = count || 0;
      } catch {}

      // ========== CHAT ==========
      const [
        { count: totalConversations },
        { count: totalMessages },
        { count: messagesToday },
        { count: messagesThisWeek },
      ] = await Promise.all([
        supabase
          .from("conversations")
          .select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
      ]);

      const { count: activeConversations } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .gte("updated_at", yesterday.toISOString());

      // ========== AVALIAÇÕES ==========
      const [
        { count: totalReviews },
        { count: reviewsToday },
        { data: reviewsData },
      ] = await Promise.all([
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("reviews")
          .select(
            "rating_person, reviewed_id, profiles!reviews_reviewed_id_fkey(full_name)",
          ),
      ]);

      let avgRating = 0;
      const reviewsDistribution = [
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ];

      if (reviewsData && reviewsData.length > 0) {
        const sum = reviewsData.reduce(
          (acc, r) => acc + (r.rating_person || 0),
          0,
        );
        avgRating = sum / reviewsData.length;

        reviewsData.forEach((review: any) => {
          const rating = review.rating_person || 0;
          const index = reviewsDistribution.findIndex(
            (r) => r.rating === rating,
          );
          if (index >= 0) reviewsDistribution[index].count++;
        });
      }

      // Top profissionais avaliados
      const topRatedProfessionals = reviewsData
        ? Object.entries(
            reviewsData.reduce((acc: any, review: any) => {
              const id = review.reviewed_id;
              if (!acc[id]) {
                acc[id] = {
                  id,
                  name: review.profiles?.full_name || t("noName"),
                  ratings: [],
                  avg: 0,
                };
              }
              if (review.rating_person)
                acc[id].ratings.push(review.rating_person);
              return acc;
            }, {}),
          )
            .map(([, data]: any) => ({
              id: data.id,
              name: data.name,
              rating:
                data.ratings.length > 0
                  ? data.ratings.reduce((a: number, b: number) => a + b, 0) /
                    data.ratings.length
                  : 0,
            }))
            .filter((p) => p.rating > 0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10)
        : [];

      // ========== DENÚNCIAS ==========
      const [
        { count: totalReports },
        { count: pendingReports },
        { count: resolvedReports },
      ] = await Promise.all([
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "resolved"),
      ]);

      let totalBans = 0;
      let activeBans = 0;
      try {
        const [{ count: total }, { count: active }] = await Promise.all([
          supabase.from("bans").select("*", { count: "exact", head: true }),
          // ⚠️ SEGURANÇA: Usar parâmetro em vez de concatenação de string
          supabase
            .from("bans")
            .select("*", { count: "exact", head: true })
            .or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`),
        ]);
        totalBans = total || 0;
        activeBans = active || 0;
      } catch {}

      // ========== ERROS DO SISTEMA ==========
      let systemErrors24h = 0;
      let systemErrors7d = 0;
      let systemWarnings24h = 0;
      const errorsList: SystemError[] = [];

      try {
        const [
          { count: errors24h },
          { count: errors7d },
          { count: warnings24h },
          { data: recentErrors },
        ] = await Promise.all([
          supabase
            .from("system_logs")
            .select("*", { count: "exact", head: true })
            .eq("level", "ERROR")
            .gte("created_at", yesterday.toISOString()),
          supabase
            .from("system_logs")
            .select("*", { count: "exact", head: true })
            .eq("level", "ERROR")
            .gte("created_at", weekAgo.toISOString()),
          supabase
            .from("system_logs")
            .select("*", { count: "exact", head: true })
            .eq("level", "WARNING")
            .gte("created_at", yesterday.toISOString()),
          supabase
            .from("system_logs")
            .select(
              `
              id,
              level,
              category,
              message,
              endpoint,
              status_code,
              created_at,
              details,
              user:profiles!system_logs_user_id_fkey(full_name, email)
            `,
            )
            .eq("level", "ERROR")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        systemErrors24h = errors24h || 0;
        systemErrors7d = errors7d || 0;
        systemWarnings24h = warnings24h || 0;

        if (recentErrors) {
          errorsList.push(
            ...recentErrors.map((err: any) => ({
              id: err.id,
              level: err.level,
              category: err.category,
              message: err.message,
              endpoint: err.endpoint,
              status_code: err.status_code,
              created_at: err.created_at,
              details: err.details,
              user: err.user
                ? { full_name: err.user.full_name, email: err.user.email }
                : null,
            })),
          );
        }
      } catch {}

      setSystemErrors(errorsList);

      // ========== GRÁFICO DE ATIVIDADE (30 DIAS) ==========
      const chartDataArray: ChartData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, "yyyy-MM-dd");
        const startDate = startOfDay(date).toISOString();
        const endDate = endOfDay(date).toISOString();

        const [
          { count: dayUsers },
          { count: dayPosts },
          { count: dayMessages },
          { count: dayReports },
          { count: dayReviews },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startDate)
            .lt("created_at", endDate),
          supabase
            .from("feed_posts")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startDate)
            .lt("created_at", endDate),
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startDate)
            .lt("created_at", endDate),
          supabase
            .from("reports")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startDate)
            .lt("created_at", endDate),
          supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startDate)
            .lt("created_at", endDate),
        ]);

        chartDataArray.push({
          date: format(date, "dd/MM", { locale: ptBR }),
          users: dayUsers || 0,
          posts: dayPosts || 0,
          messages: dayMessages || 0,
          reports: dayReports || 0,
          reviews: dayReviews || 0,
        });
      }
      setChartData(chartDataArray);

      // ========== CATEGORIAS DE SERVIÇOS ==========
      const { data: servicesData } = await supabase
        .from("profiles")
        .select("professional_services")
        .not("professional_services", "is", null)
        .eq("user_type", "professional");

      if (servicesData) {
        const categoryCounts: {
          [key: string]: { count: number; ratings: number[] };
        } = {};
        servicesData.forEach((profile) => {
          if (
            profile.professional_services &&
            Array.isArray(profile.professional_services)
          ) {
            profile.professional_services.forEach((service: string) => {
              if (!categoryCounts[service]) {
                categoryCounts[service] = { count: 0, ratings: [] };
              }
              categoryCounts[service].count++;
            });
          }
        });

        const categoryArray = Object.entries(categoryCounts)
          .map(([category, data]) => ({
            category,
            count: data.count,
            avgRating:
              data.ratings.length > 0
                ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length
                : 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setServiceCategories(categoryArray);
      }

      // Calcular métricas derivadas
      const previousMonthUsers = (totalUsers || 0) - (newUsersThisMonth || 0);
      const usersGrowth =
        previousMonthUsers > 0
          ? Math.round(((newUsersThisMonth || 0) / previousMonthUsers) * 100)
          : 0;

      const avgPostsPerUser =
        totalUsers && totalUsers > 0 ? (totalPosts || 0) / totalUsers : 0;
      const conversionRate =
        totalConversations && totalUsers && totalUsers > 0
          ? Math.round((totalConversations / totalUsers) * 100 * 10) / 10
          : 0;

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        activeUsers24h: activeUsers24h || 0,
        activeUsers7d: activeUsers7d || 0,
        activeUsers30d: activeUsers30d || 0,
        verifiedUsers: verifiedUsers || 0,
        professionalUsers: professionalUsers || 0,
        clientUsers: clientUsers || 0,
        usersGrowth,
        usersByState,
        avgSessionTime: 0, // Seria necessário tracking
        retentionRate:
          activeUsers7d && totalUsers && totalUsers > 0
            ? Math.round((activeUsers7d / totalUsers) * 100)
            : 0,
        totalPosts: totalPosts || 0,
        postsToday: postsToday || 0,
        postsThisWeek: postsThisWeek || 0,
        postsThisMonth: postsThisMonth || 0,
        totalComments: totalComments || 0,
        commentsToday: commentsToday || 0,
        totalLikes: totalLikes || 0,
        likesToday: likesToday || 0,
        totalShares: totalShares,
        avgPostsPerUser: Math.round(avgPostsPerUser * 10) / 10,
        topPosters,
        totalConversations: totalConversations || 0,
        activeConversations: activeConversations || 0,
        totalMessages: totalMessages || 0,
        messagesToday: messagesToday || 0,
        messagesThisWeek: messagesThisWeek || 0,
        avgResponseTime: 0,
        conversionRate,
        totalReviews: totalReviews || 0,
        reviewsToday: reviewsToday || 0,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewsDistribution,
        topRatedProfessionals,
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
        resolvedReports: resolvedReports || 0,
        totalBans,
        activeBans,
        failedLogins: 0, // Seria necessário tracking
        systemErrors24h,
        systemErrors7d,
        systemWarnings24h,
        apiResponseTime: 0,
        databaseSize: 0,
        cacheHitRate: 0,
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0,
        avgPageLoadTime: 0,
      });

      setLastUpdate(new Date());
      if (showToast) {
        toast.success("Dados atualizados com sucesso!");
      }
    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
      setError(err.message || "Erro ao carregar dados");
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => fetchAllData(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const chartConfig = {
    users: { label: "Usuários", color: "hsl(var(--chart-1))" },
    posts: { label: "Posts", color: "hsl(var(--chart-2))" },
    messages: { label: "Mensagens", color: "hsl(var(--chart-3))" },
    reports: { label: "Denúncias", color: "hsl(var(--chart-4))" },
    reviews: { label: "Avaliações", color: "hsl(var(--chart-5))" },
  };

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const handleRefresh = () => {
    fetchAllData(true);
  };

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card className="dark:bg-card dark:border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("errorLoading")}
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("tryAgain")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {t("dashboard")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {lastUpdate &&
              `${t("lastUpdate")}: ${lastUpdate.toLocaleTimeString("pt-BR")}`}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading || refreshing ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      {/* Tabs de Seções */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t("overview")}</span>
            <span className="sm:hidden">{t("overviewShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            <Users className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t("users")}</span>
            <span className="sm:hidden">{t("usersShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs sm:text-sm">
            <Activity className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t("engagement")}</span>
            <span className="sm:hidden">{t("engagementShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs sm:text-sm">
            <Server className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t("system")}</span>
            <span className="sm:hidden">{t("systemShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">
            <Shield className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t("security")}</span>
            <span className="sm:hidden">{t("securityShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="cron" className="text-xs sm:text-sm">
            <Timer className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t("cronJobs")}</span>
            <span className="sm:hidden">{t("cronJobsShort")}</span>
          </TabsTrigger>
        </TabsList>

        {/* SEÇÃO 1: VISÃO GERAL */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="dark:bg-card dark:border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">
                      {t("totalUsers")}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.totalUsers}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      {stats.usersGrowth >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      {Math.abs(stats.usersGrowth)}% {t("thisMonth")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-card dark:border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">
                      {t("activeUsers")}
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.activeUsers24h}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("last24Hours")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-card dark:border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">
                      {t("totalPosts")}
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.totalPosts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.postsToday} {t("today")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-card dark:border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">
                      {t("pendingReports")}
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.pendingReports}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("of")} {stats.totalReports} {t("total")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico Principal */}
              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {t("activityLast30Days")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("activityDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ChartContainer
                      config={chartConfig}
                      className="h-[300px] w-full"
                    >
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="fillUsers"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="hsl(var(--chart-1))"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(var(--chart-1))"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="fillPosts"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="hsl(var(--chart-2))"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(var(--chart-2))"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="date"
                          className="text-xs text-muted-foreground"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          className="text-xs text-muted-foreground"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stroke="hsl(var(--chart-1))"
                          fill="url(#fillUsers)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="posts"
                          stroke="hsl(var(--chart-2))"
                          fill="url(#fillPosts)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <Skeleton className="h-[300px] w-full" />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Outras seções com skeletons */}
        <TabsContent value="users" className="space-y-4 mt-4">
          {loading ? (
            <UserListSkeleton />
          ) : (
            <Card className="dark:bg-card dark:border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {t("onlineUsers")}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t("onlineUsersDescription")} ({onlineUsers.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {onlineUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {t("noUsersOnline")}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {onlineUsers.map((user) => (
                      <Link
                        key={user.id}
                        href={`/perfil/${user.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">
                              {user.full_name}
                            </p>
                            {user.is_verified && (
                              <Badge
                                variant="secondary"
                                className="h-4 px-1 text-xs"
                              >
                                <UserCheck className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {user.user_type === "professional"
                                ? "Profissional"
                                : "Cliente"}
                            </Badge>
                            {user.location_city && (
                              <>
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">
                                  {user.location_city}, {user.location_state}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4 mt-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Total de Posts
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalPosts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.avgPostsPerUser} por usuário
                  </p>
                </CardContent>
              </Card>
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Comentários
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalComments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de comentários
                  </p>
                </CardContent>
              </Card>
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Curtidas
                  </CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalLikes}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de curtidas
                  </p>
                </CardContent>
              </Card>
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Avaliações
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalReviews}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nota média: {stats.avgRating.toFixed(1)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-4">
          {loading ? (
            <ErrorListSkeleton />
          ) : (
            <Card className="dark:bg-card dark:border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">
                      Erros do Sistema
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Últimos erros registrados
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Últimas 24h
                      </p>
                      <p className="text-2xl font-bold text-destructive">
                        {stats.systemErrors24h}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Últimos 7 dias
                      </p>
                      <p className="text-2xl font-bold text-destructive">
                        {stats.systemErrors7d}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {systemErrors.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Nenhum erro registrado recentemente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {systemErrors.map((error) => (
                      <div
                        key={error.id}
                        className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 dark:bg-destructive/10"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="destructive" className="text-xs">
                                {error.level}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {error.category}
                              </Badge>
                              {error.status_code && (
                                <Badge variant="outline" className="text-xs">
                                  {error.status_code}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">
                              {error.message}
                            </p>
                            {error.endpoint && (
                              <p className="text-xs text-muted-foreground mb-1">
                                <code className="bg-muted px-1 py-0.5 rounded">
                                  {error.endpoint}
                                </code>
                              </p>
                            )}
                            {error.user && (
                              <p className="text-xs text-muted-foreground">
                                Usuário: {error.user.full_name} (
                                {error.user.email})
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(error.created_at).toLocaleString(
                                "pt-BR",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Denúncias Pendentes
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.pendingReports}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requerem atenção
                  </p>
                </CardContent>
              </Card>
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Total de Denúncias
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalReports}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Todas as denúncias
                  </p>
                </CardContent>
              </Card>
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Banimentos Ativos
                  </CardTitle>
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.activeBans}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    de {stats.totalBans} total
                  </p>
                </CardContent>
              </Card>
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Erros 24h
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {stats.systemErrors24h}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Erros do sistema
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* SEÇÃO: CRON JOBS */}
        <TabsContent value="cron" className="space-y-4 mt-4">
          <CronJobsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
