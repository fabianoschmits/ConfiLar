import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { logCronExecution, CronExecutionLogger } from "@/lib/cron-logging";

export async function GET(request: NextRequest) {
  const JOB_NAME = "clear-email-queue";

  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const logger = new CronExecutionLogger(JOB_NAME);

    const runMaintenance = async (executorLabel: string) => {
      const adminSupabase = createAdminSupabaseClient();

      logger.log("Iniciando limpeza da fila de emails...");

      const { data, count, error } = await adminSupabase
        .from("notification_email_queue")
        .delete({ count: "exact" })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Deleta tudo (hack legal para deletar todos sem where perigoso)

      if (error) {
        logger.error(`Erro ao limpar fila: ${error.message}`);
        await logCronExecution(
          JOB_NAME,
          "error",
          `Erro ao limpar fila (${executorLabel})`,
          {
            error: error.message,
          },
        );
        return NextResponse.json(
          {
            error: "Erro ao limpar fila",
            details: error.message,
            logs: logger.getLogs(),
          },
          { status: 500 },
        );
      }

      const deletedCount = count || 0;
      logger.log(`Sucesso! ${deletedCount} emails removidos da fila.`);

      await logCronExecution(
        JOB_NAME,
        "success",
        `Fila limpa (${executorLabel}): ${deletedCount} emails removidos`,
        { deleted_count: deletedCount, executor: executorLabel },
      );

      return NextResponse.json({
        success: true,
        message: "Fila de emails limpa com sucesso",
        deleted_count: deletedCount,
        logs: logger.getLogs(),
      });
    };

    // 1. Cron Secret
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return await runMaintenance("Cron Job");
    }

    // 2. Admin Auth
    return withAdminAuth(async (req, supabase, user) => {
      return await runMaintenance(`Admin ${user.id}`);
    })(request);
  } catch (error: any) {
    await logCronExecution(JOB_NAME, "error", "Erro inesperado", {
      error: error.message,
    });
    console.error("❌ Erro inesperado na limpeza de fila:", error);
    return NextResponse.json(
      { error: "Erro inesperado", details: error.message },
      { status: 500 },
    );
  }
}

export const POST = GET;
