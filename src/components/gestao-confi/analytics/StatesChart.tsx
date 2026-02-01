"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface StateData {
  state: string;
  count: number;
}

export function StatesChart() {
  const [data, setData] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: users } = await supabase
        .from("profiles")
        .select("location_state")
        .not("location_state", "is", null);

      const stateCounts: Record<string, number> = {};
      users?.forEach((user) => {
        const state = user.location_state;
        if (state) {
          stateCounts[state] = (stateCounts[state] || 0) + 1;
        }
      });

      const chartData = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 estados

      setData(chartData);
    } catch (error) {
      console.error("Erro ao buscar dados de estados:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    count: {
      label: "Usuários",
      color: "hsl(var(--chart-1))",
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
        className="h-[350px] sm:h-[400px] min-w-[400px]"
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-800"
          />
          <XAxis
            type="number"
            className="text-[10px] sm:text-xs"
            tick={{ fill: "currentColor", fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="state"
            className="text-[10px] sm:text-xs"
            tick={{ fill: "currentColor", fontSize: 10 }}
            width={70}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="count"
            fill="hsl(221.2 83.2% 53.3%)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
