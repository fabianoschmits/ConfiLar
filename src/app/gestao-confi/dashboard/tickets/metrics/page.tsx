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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const COLORS = ["#00b0b0", "#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

export default function TicketMetricsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await supportService.getAdvancedMetrics();
      setMetrics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Calculando métricas avançadas...
        </p>
      </div>
    );
  }

  const ticketsByStatus = [
    {
      name: "Abertos",
      value:
        metrics?.total_tickets -
        (metrics?.resolved_tickets + metrics?.closed_tickets),
    },
    { name: "Resolvidos", value: metrics?.resolved_tickets },
    { name: "Fechados", value: metrics?.closed_tickets },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analytics de Suporte
          </h1>
          <p className="text-muted-foreground">
            Visão geral de performance e satisfação.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  Tickets
                </p>
                <h3 className="text-3xl font-bold">{metrics?.total_tickets}</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  Denúncias
                </p>
                <h3 className="text-3xl font-bold">{metrics?.total_reports}</h3>
              </div>
              <AlertCircle className="w-8 h-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  SLA (Tickets)
                </p>
                <h3 className="text-3xl font-bold text-red-500">
                  {metrics?.overdue_tickets}
                </h3>
              </div>
              <Clock className="w-8 h-8 text-red-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  Resp. Média
                </p>
                <h3 className="text-3xl font-bold text-amber-500">
                  {metrics?.avg_response_time_hours.toFixed(1)}h
                </h3>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-success/5 border-success/20 hover:border-success/40 transition-all cursor-pointer group"
          onClick={() => router.push("/gestao-confi/dashboard/tickets/ratings")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  Média Geral
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-success">
                    {metrics?.avg_rating.toFixed(1)}
                  </h3>
                  <span className="text-[10px] text-success font-medium group-hover:underline">
                    Ver →
                  </span>
                </div>
              </div>
              <Star className="w-8 h-8 text-success/40 fill-success/40 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase">
              Atendimentos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.category_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar
                  dataKey="tickets"
                  name="Tickets"
                  fill="#00b0b0"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="reports"
                  name="Denúncias"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total Interactions Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase">
              Composição da Demanda
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Tickets", value: metrics?.total_tickets },
                    { name: "Denúncias", value: metrics?.total_reports },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#00b0b0" />
                  <Cell fill="#8884d8" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">
                {metrics?.total_interactions}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                Total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
