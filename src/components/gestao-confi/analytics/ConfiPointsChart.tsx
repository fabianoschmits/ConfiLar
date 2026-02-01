"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface ConfiPointsChartProps {
  timeRange: string;
}

interface PointsData {
  date: string;
  earned: number;
  spent: number;
  balance: number;
}

export function ConfiPointsChart({ timeRange }: ConfiPointsChartProps) {
  const [data, setData] = useState<PointsData[]>([]);
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

      // Buscar transações de pontos
      let transactions: any[] = [];
      try {
        const { data, error } = await supabase
          .from("points_transactions")
          .select("created_at, points, action_type")
          .gte("created_at", startDate.toISOString());

        if (error) {
          // Se a tabela não existir, usar array vazio
          if (
            error.code === "PGRST116" ||
            error.code === "PGRST205" ||
            error.message.includes("relation") ||
            error.message.includes("does not exist")
          ) {
            console.warn(
              "Tabela points_transactions não existe ou não há permissão para acessar",
            );
            transactions = [];
          } else {
            throw error;
          }
        } else {
          transactions = data || [];
        }
      } catch (error: any) {
        // Se houver erro 400 (bad request), pode ser que a tabela não existe ou a query está malformada
        if (
          error?.code === "PGRST116" ||
          error?.code === "PGRST205" ||
          error?.status === 400
        ) {
          console.warn("Não foi possível buscar transações de pontos");
          transactions = [];
        } else {
          console.error("Erro ao buscar transações de pontos:", error);
          transactions = [];
        }
      }

      // Agrupar por data
      const grouped: Record<
        string,
        { earned: number; spent: number; balance: number }
      > = {};

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        grouped[dateStr] = { earned: 0, spent: 0, balance: 0 };
      }

      let runningBalance = 0;
      transactions?.forEach((tx) => {
        const date = new Date(tx.created_at).toISOString().split("T")[0];
        if (grouped[date]) {
          if (tx.points > 0) {
            grouped[date].earned += tx.points;
            runningBalance += tx.points;
          } else {
            grouped[date].spent += Math.abs(tx.points);
            runningBalance += tx.points; // já é negativo
          }
          grouped[date].balance = runningBalance;
        }
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
      console.error("Erro ao buscar dados de ConfiPoints:", error);
      // Se a tabela não existir, mostrar dados vazios
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    earned: {
      label: "Pontos Ganhos",
      color: "hsl(var(--chart-1))",
    },
    spent: {
      label: "Pontos Gastos",
      color: "hsl(var(--chart-2))",
    },
    balance: {
      label: "Saldo Total",
      color: "hsl(var(--chart-3))",
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
        Nenhum dado de ConfiPoints disponível
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
              dataKey="earned"
              stroke="hsl(142.1 76.2% 36.3%)"
              strokeWidth={2}
              name="Pontos Ganhos"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="spent"
              stroke="hsl(0 84.2% 60.2%)"
              strokeWidth={2}
              name="Pontos Gastos"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="hsl(221.2 83.2% 53.3%)"
              strokeWidth={2}
              name="Saldo Total"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total Ganho (período)
          </p>
          <p className="text-xl font-bold text-green-600">
            {data.reduce((sum, d) => sum + d.earned, 0).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total Gasto (período)
          </p>
          <p className="text-xl font-bold text-red-600">
            {data.reduce((sum, d) => sum + d.spent, 0).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Saldo Atual
          </p>
          <p className="text-xl font-bold">
            {data[data.length - 1]?.balance.toLocaleString("pt-BR") || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
