"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface ActivityChartProps {
  timeRange: string;
}

interface ActivityData {
  date: string;
  logins: number;
  signups: number;
  posts: number;
  messages: number;
}

export function ActivityChart({ timeRange }: ActivityChartProps) {
  const [data, setData] = useState<ActivityData[]>([]);
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

      // Buscar cadastros (signups)
      const { data: signups } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      // Buscar posts
      const { data: posts } = await supabase
        .from("feed_posts")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      // Buscar mensagens
      let messages: any[] = [];
      try {
        const { data: msgs } = await supabase
          .from("messages")
          .select("created_at")
          .gte("created_at", startDate.toISOString());
        messages = msgs || [];
      } catch (e) {
        // Tabela pode não existir
      }

      // Buscar logs de login do sistema (se existir)
      let logins: any[] = [];
      try {
        const { data: loginLogs } = await supabase
          .from("system_logs")
          .select("created_at")
          .eq("action", "user_login")
          .gte("created_at", startDate.toISOString());
        logins = loginLogs || [];
      } catch (e) {
        // Tabela pode não existir
      }

      // Agrupar por data
      const grouped: Record<
        string,
        { logins: number; signups: number; posts: number; messages: number }
      > = {};

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        grouped[dateStr] = { logins: 0, signups: 0, posts: 0, messages: 0 };
      }

      signups?.forEach((signup) => {
        const date = new Date(signup.created_at).toISOString().split("T")[0];
        if (grouped[date]) grouped[date].signups++;
      });

      posts?.forEach((post) => {
        const date = new Date(post.created_at).toISOString().split("T")[0];
        if (grouped[date]) grouped[date].posts++;
      });

      messages?.forEach((msg) => {
        const date = new Date(msg.created_at).toISOString().split("T")[0];
        if (grouped[date]) grouped[date].messages++;
      });

      logins?.forEach((login) => {
        const date = new Date(login.created_at).toISOString().split("T")[0];
        if (grouped[date]) grouped[date].logins++;
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
    } catch (error) {
      console.error("Erro ao buscar dados de atividade:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    logins: {
      label: "Logins",
      color: "hsl(var(--chart-1))",
    },
    signups: {
      label: "Cadastros",
      color: "hsl(var(--chart-2))",
    },
    posts: {
      label: "Posts",
      color: "hsl(var(--chart-3))",
    },
    messages: {
      label: "Mensagens",
      color: "hsl(var(--chart-4))",
    },
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Carregando dados...</div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <ChartContainer
        config={chartConfig}
        className="h-[250px] sm:h-[300px] min-w-[600px]"
      >
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-800"
          />
          <XAxis
            dataKey="date"
            className="text-[10px] sm:text-xs"
            tick={{ fill: "currentColor", fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            className="text-[10px] sm:text-xs"
            tick={{ fill: "currentColor", fontSize: 10 }}
            width={50}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line
            type="monotone"
            dataKey="logins"
            stroke="hsl(221.2 83.2% 53.3%)"
            strokeWidth={2}
            name="Logins"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="signups"
            stroke="hsl(142.1 76.2% 36.3%)"
            strokeWidth={2}
            name="Cadastros"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="posts"
            stroke="hsl(47.9 95.8% 53.1%)"
            strokeWidth={2}
            name="Posts"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="messages"
            stroke="hsl(0 84.2% 60.2%)"
            strokeWidth={2}
            name="Mensagens"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
