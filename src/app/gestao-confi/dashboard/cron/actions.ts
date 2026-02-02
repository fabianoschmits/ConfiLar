"use server";

import { createAdminSupabaseClient } from "@/lib/supabase";

export interface CronLog {
  id: string;
  job_name: string;
  status: "success" | "error";
  message: string;
  details: any;
  created_at: string;
}

export interface CronStats {
  totalRunsToday: number;
  successRateSevenDays: number;
  lastFailedJob: string | null;
  lastFailedTime: string | null;
}

export async function fetchCronLogs(limit = 20): Promise<CronLog[]> {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("cron_execution_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching cron logs:", error);
    return [];
  }

  return data as CronLog[];
}

export async function fetchCronStats(): Promise<CronStats> {
  const supabase = createAdminSupabaseClient();
  const now = new Date();

  // 1. Runs Today
  const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const { count: totalRunsToday } = await supabase
    .from("cron_execution_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfDay);

  // 2. Success Rate (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentLogs } = await supabase
    .from("cron_execution_logs")
    .select("status")
    .gte("created_at", sevenDaysAgo.toISOString());

  let successRateSevenDays = 100;
  if (recentLogs && recentLogs.length > 0) {
    const successCount = recentLogs.filter(
      (l) => l.status === "success",
    ).length;
    successRateSevenDays = Math.round((successCount / recentLogs.length) * 100);
  }

  // 3. Last Failed Job
  const { data: lastFail } = await supabase
    .from("cron_execution_logs")
    .select("job_name, created_at")
    .eq("status", "error")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return {
    totalRunsToday: totalRunsToday || 0,
    successRateSevenDays,
    lastFailedJob: lastFail?.job_name || null,
    lastFailedTime: lastFail?.created_at || null,
  };
}
