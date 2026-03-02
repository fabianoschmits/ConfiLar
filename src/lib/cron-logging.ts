import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * Utilitário para coletar logs durante a execução de um Cron Job
 * e retorná-los para o administrador no frontend.
 */
export class CronExecutionLogger {
  private logs: string[] = [];
  private jobName: string;

  constructor(jobName: string) {
    this.jobName = jobName;
  }

  log(message: string) {
    const timestamp = new Date().toLocaleTimeString("pt-BR", { hour12: false });
    const fullMessage = `[${timestamp}] ${message}`;
    this.logs.push(fullMessage);
    console.log(`[Cron: ${this.jobName}] ${message}`);
  }

  error(message: string) {
    const timestamp = new Date().toLocaleTimeString("pt-BR", { hour12: false });
    const fullMessage = `🔴 [${timestamp}] ERRO: ${message}`;
    this.logs.push(fullMessage);
    console.error(`[Cron: ${this.jobName}] ❌ ${message}`);
  }

  getLogs() {
    return this.logs;
  }
}

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
