"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UsersChart } from "@/components/gestao-confi/analytics/UsersChart";
import { TrafficChart } from "@/components/gestao-confi/analytics/TrafficChart";
import { ConfiPointsChart } from "@/components/gestao-confi/analytics/ConfiPointsChart";
import { StatesChart } from "@/components/gestao-confi/analytics/StatesChart";
import { ActivityChart } from "@/components/gestao-confi/analytics/ActivityChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  Globe,
  Activity,
  Coins,
  FileText,
  Search,
  Trash2,
  Eye,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  TrendingUp,
  X,
  RefreshCw,
  LifeBuoy,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthContext } from "@/contexts/AuthContext";
import { ResponsiveTable } from "@/components/gestao-confi/ResponsiveTable";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PostsChart } from "@/components/gestao-confi/analytics/PostsChart";
import { SupportAnalytics } from "@/components/gestao-confi/analytics/SupportAnalytics";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("30d");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <AdminPageHeader
        title="Analytics & Inteligência"
        description="Acompanhe o crescimento e o comportamento da comunidade em tempo real."
        icon={BarChart3}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm p-3 sm:p-4 rounded-2xl sm:rounded-[28px] border border-border/50 shadow-sm gap-3">
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 sm:px-2">
          Período de Análise
        </span>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10 rounded-xl sm:rounded-2xl border-border/40 font-bold text-[10px] sm:text-xs">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="rounded-xl sm:rounded-2xl">
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="users" className="w-full space-y-4 sm:space-y-8">
        <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-1.5 sm:gap-2">
          <TabsTrigger
            value="users"
            className="h-9 sm:h-11 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] data-[state=active]:shadow-lg transition-all border border-border/30 bg-white gap-1.5 sm:gap-2"
          >
            <Users className="h-3.5 w-3.5 sm:h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger
            value="geo"
            className="h-9 sm:h-11 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] data-[state=active]:shadow-lg transition-all border border-border/30 bg-white gap-1.5 sm:gap-2"
          >
            <Globe className="h-3.5 w-3.5 sm:h-4 w-4" /> Geografia
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="h-9 sm:h-11 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] data-[state=active]:shadow-lg transition-all border border-border/30 bg-white gap-1.5 sm:gap-2"
          >
            <Activity className="h-3.5 w-3.5 sm:h-4 w-4" /> Sistema
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="h-9 sm:h-11 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] data-[state=active]:shadow-lg transition-all border border-border/30 bg-white gap-1.5 sm:gap-2"
          >
            <LifeBuoy className="h-3.5 w-3.5 sm:h-4 w-4" /> Atendimento
          </TabsTrigger>
          <TabsTrigger
            value="finance"
            className="h-9 sm:h-11 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] data-[state=active]:shadow-lg transition-all border border-border/30 bg-white gap-1.5 sm:gap-2"
          >
            <Coins className="h-3.5 w-3.5 sm:h-4 w-4" /> Financeiro
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="h-9 sm:h-11 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] data-[state=active]:shadow-lg transition-all border border-border/30 bg-white gap-1.5 sm:gap-2"
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 w-4" /> Conteúdo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UsersChart timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="geo" className="space-y-6">
          <StatesChart />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrafficChart timeRange={timeRange} />
            <ActivityChart timeRange={timeRange} />
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <SupportAnalytics />
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <ConfiPointsChart timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <PostsChart timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
