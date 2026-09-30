"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, UserCheck } from "lucide-react";

interface UsersChartProps {
  timeRange: string;
}

interface UserData {
  date: string;
  total: number;
  new: number;
  active: number;
}

export function UsersChart({ timeRange }: UsersChartProps) {
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const days =
        timeRange === "7d"
          ? 7
          : timeRange === "30d"
            ? 30
            : timeRange === "90d"
              ? 90
              : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: users } = await supabase
        .from("profiles")
        .select("created_at, updated_at")
        .gte("created_at", startDate.toISOString());

      const grouped: Record<
        string,
        { total: number; new: number; active: number }
      > = {};

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        grouped[dateStr] = { total: 0, new: 0, active: 0 };
      }

      users?.forEach((user) => {
        const createdDate = new Date(user.created_at)
          .toISOString()
          .split("T")[0];
        if (grouped[createdDate]) grouped[createdDate].new++;
      });

      let runningTotal = 0;
      Object.keys(grouped).forEach((date) => {
        runningTotal += grouped[date].new;
        grouped[date].total = runningTotal;
        const checkDate = new Date(date);
        const sevenDaysAgo = new Date(checkDate);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        users?.forEach((user) => {
          const updatedDate = new Date(user.updated_at);
          if (updatedDate >= sevenDaysAgo && updatedDate <= checkDate)
            grouped[date].active++;
        });
      });

      const chartData = Object.entries(grouped)
        .map(([date, values]) => ({
          date: new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          ...values,
        }))
        .slice(-days);

      setData(chartData);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    total: { label: "Total", color: "hsl(221 83% 53%)" },
    new: { label: "Novos", color: "hsl(142 76% 36%)" },
    active: { label: "Ativos", color: "hsl(47 95% 53%)" },
  };

  if (loading)
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse font-black text-[10px] uppercase">
        Calculando Métricas...
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[var(--cl-mist)]/30 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40 p-3 sm:p-5 rounded-2xl sm:rounded-[24px] group hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[var(--cl-teal)]" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--cl-teal)]/80">
              Base Total
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-[var(--cl-teal)]">
            {data[data.length - 1]?.total || 0}
          </div>
          <p className="text-[8px] sm:text-[10px] font-bold opacity-60 mt-1 uppercase tracking-tight">
            Usuários Registrados
          </p>
        </div>
        <div className="bg-emerald-50/30 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-3 sm:p-5 rounded-2xl sm:rounded-[24px] group hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600/80">
              Novos Leads
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-600">
            {data.reduce((sum, d) => sum + d.new, 0)}
          </div>
          <p className="text-[8px] sm:text-[10px] font-bold opacity-60 mt-1 uppercase tracking-tight">
            Crescimento no Período
          </p>
        </div>
        <div className="bg-amber-50/30 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40 p-3 sm:p-5 rounded-2xl sm:rounded-[24px] group hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-600/80">
              Engajados
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-amber-600">
            {data[data.length - 1]?.active || 0}
          </div>
          <p className="text-[8px] sm:text-[10px] font-bold opacity-60 mt-1 uppercase tracking-tight">
            Retenção de 7 Dias
          </p>
        </div>
      </div>

      <div className="w-full h-[300px] sm:h-[350px] bg-[var(--cl-surface)]/20 border border-border/50 rounded-2xl sm:rounded-[32px] p-3 sm:p-6 shadow-sm">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(221 83% 53%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(221 83% 53%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142 76% 36%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142 76% 36%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.1}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fontWeight: 700,
                fill: "currentColor",
                opacity: 0.5,
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fontWeight: 700,
                fill: "currentColor",
                opacity: 0.5,
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(221 83% 53%)"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorTotal)"
              name="Total"
            />
            <Area
              type="monotone"
              dataKey="new"
              stroke="hsl(142 76% 36%)"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorNew)"
              name="Novos"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
