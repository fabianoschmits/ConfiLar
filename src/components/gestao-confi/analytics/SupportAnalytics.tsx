"use client";

import React, { useState, useEffect } from "react";
import { supportService } from "@/modules/support/services/supportService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Clock,
  AlertCircle,
  Star,
  Loader2,
  MessageSquare,
  ExternalLink,
  Calendar,
  LifeBuoy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const COLORS = ["#00b0b0", "#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

export function SupportAnalytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, ratingsData] = await Promise.all([
        supportService.getAdvancedMetrics(),
        supportService.getDetailedRatings(),
      ]);
      setMetrics(metricsData);
      setRatings(ratingsData);
    } catch (error) {
      console.error("Error loading support analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
        <p className="text-muted-foreground text-sm font-medium">
          Processando inteligência de suporte...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5 sm:mb-1 opacity-60">
                  Total Demandas
                </p>
                <h3 className="text-xl sm:text-3xl font-black tracking-tighter">
                  {metrics?.total_interactions}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Tickets + Denúncias
                </p>
              </div>
              <LifeBuoy className="w-10 h-10 text-primary/20 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm border-border/50 shadow-sm rounded-3xl overflow-hidden group hover:border-red-500/30 transition-all">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5 sm:mb-1 opacity-60">
                  SLA Crítico
                </p>
                <h3 className="text-xl sm:text-3xl font-black tracking-tighter text-red-500">
                  {metrics?.overdue_tickets}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Fora do prazo
                </p>
              </div>
              <Clock className="w-10 h-10 text-red-500/20 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm border-border/50 shadow-sm rounded-3xl overflow-hidden group hover:border-amber-500/30 transition-all">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5 sm:mb-1 opacity-60">
                  Resp. Média
                </p>
                <h3 className="text-xl sm:text-3xl font-black tracking-tighter text-amber-500">
                  {metrics?.avg_response_time_hours.toFixed(1)}h
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Tempo até primeira resposta
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-amber-500/20 group-hover:scale-110 group-hover:translate-y--1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm border-border/50 shadow-sm rounded-3xl overflow-hidden group hover:border-green-500/30 transition-all border-l-4 border-l-green-500/20">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5 sm:mb-1 opacity-60">
                  CSAT Suporte
                </p>
                <h3 className="text-xl sm:text-3xl font-black tracking-tighter text-green-500">
                  {metrics?.avg_rating.toFixed(1)}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Média de avaliações
                </p>
              </div>
              <Star className="w-10 h-10 text-green-500/20 fill-green-500/10 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <Card className="bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20">
                <BarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
              </div>
              <CardTitle className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">
                Volume por Categoria
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-4 sm:pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.category_distribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.1}
                />
                <XAxis
                  dataKey="category"
                  fontSize={10}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  fontSize={10}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Bar
                  dataKey="tickets"
                  name="Tickets"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="reports"
                  name="Denúncias"
                  fill="#8c44f7"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demand Composition Pie Chart */}
        <Card className="bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--cl-teal)]/10 border border-purple-500/20">
                <LifeBuoy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
              </div>
              <CardTitle className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">
                Composição de Atendimentos
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center relative p-4 sm:py-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Tickets", value: metrics?.total_tickets },
                    { name: "Denúncias", value: metrics?.total_reports },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#8c44f7" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl sm:text-3xl font-black tracking-tighter">
                {metrics?.total_interactions}
              </span>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Ratings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            </div>
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-60">
              Feedbacks do Suporte
            </h3>
          </div>
          <Badge
            variant="outline"
            className="rounded-full font-bold text-[8px] sm:text-[10px] px-1.5 sm:px-2"
          >
            {ratings.length}{" "}
            <span className="hidden sm:inline ml-1">avaliações</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ratings.slice(0, 6).map((rating) => (
            <Card
              key={
                rating.type === "ticket" ? rating.ticket_id : rating.report_id
              }
              className={cn(
                "bg-white/40 dark:bg-gray-950/40 backdrop-blur-sm border-border/40 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden hover:border-primary/20 transition-all group",
                rating.type === "report"
                  ? "border-l-4 border-l-red-500/40"
                  : "border-l-4 border-l-blue-500/40",
              )}
            >
              <CardContent className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      {rating.profiles?.avatar_url ? (
                        <img
                          src={rating.profiles.avatar_url}
                          alt={rating.profiles.full_name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl object-cover shadow-sm border border-border/50"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center border border-border/50">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black leading-none mb-1">
                        {rating.profiles?.full_name || "Membro"}
                      </p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "w-3 h-3 transition-all",
                              rating.rating >= s
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/20",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={cn(
                        "text-[8px] font-black tracking-widest uppercase border-none h-4 px-1.5",
                        rating.type === "ticket"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-red-500/10 text-red-500",
                      )}
                    >
                      {rating.type === "ticket" ? "Ticket" : "Denúncia"}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-bold flex items-center gap-1 opacity-50">
                      <Calendar className="w-2.5 h-2.5" />
                      {format(new Date(rating.rated_at), "dd/MM", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-border/30 relative italic">
                  <p className="text-[10px] sm:text-xs leading-relaxed text-foreground/80 line-clamp-2">
                    {rating.feedback || "Sem comentário disponível."}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate max-w-[70%]">
                    {rating.type === "ticket" ? (
                      <MessageSquare className="w-3 h-3 text-blue-500/60" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-red-500/60" />
                    )}
                    <span className="text-[10px] font-bold text-muted-foreground truncate uppercase">
                      {rating.display_title || "Demanda"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-xl text-[10px] font-bold gap-2 px-3 hover:bg-primary/5 hover:text-primary transition-all"
                    onClick={() =>
                      router.push(
                        rating.type === "ticket"
                          ? `/gestao-confi/dashboard/tickets/${rating.ticket_id}`
                          : `/gestao-confi/dashboard/reports/${rating.report_id}`,
                      )
                    }
                  >
                    Abrir <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {ratings.length > 6 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 border-border/50 bg-white/50 backdrop-blur-sm"
              onClick={() => router.push("/gestao-confi/dashboard/tickets")}
            >
              Ver Todas as Avaliações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
