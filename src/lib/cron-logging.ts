import { createAdminSupabaseClient } from "@/lib/supabase";

export async function logCronExecution(
  jobName: string,
  status: "success" | "error",
  message: string,
  details?: any,
) {
  try {
    const supabase = createAdminSupabaseClient();

    await supabase.from("cron_execution_logs").insert({
      job_name: jobName,
      status,
      message,
      details: details ? JSON.stringify(details) : null,
      created_at: new Date().toISOString(),
    });

    console.log(`[Cron Log] ${jobName}: ${status} - ${message}`);
  } catch (error) {
    // Fail silently to not crash the cron job just because logging failed
    console.error(`Failed to log cron execution for ${jobName}:`, error);
  }
}
