"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ChartDataPoint {
  date: string;
  count: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--cl-surface)] p-3 rounded-2xl border shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--cl-ink)]" />
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {payload[0].value}{" "}
            <span className="text-[10px] font-normal opacity-50">
              cadastros
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function AdminTemporalChart({
  data,
  title,
  description,
  loading,
}: {
  data: ChartDataPoint[];
  title: string;
  description: string;
  loading: boolean;
}) {
  return (
    <Card className="rounded-[32px] border-border/50 shadow-sm overflow-hidden bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-[var(--cl-ink)]/10 text-[var(--cl-teal)]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <CardTitle className="text-base font-bold tracking-tight">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 px-2">
        <div className="h-[200px] sm:h-[300px] w-full">
          {loading ? (
            <div className="w-full h-full bg-muted/20 animate-pulse rounded-2xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  className="dark:stroke-gray-800"
                />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={10}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
