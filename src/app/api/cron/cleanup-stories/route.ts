import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { logCronExecution, CronExecutionLogger } from "@/lib/cron-logging";

export async function GET(request: NextRequest) {
  const JOB_NAME = "cleanup-stories";

  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const logger = new CronExecutionLogger(JOB_NAME);

    const runMaintenance = async (executorLabel: string) => {
      const adminSupabase = createAdminSupabaseClient();
      const { data: result, error: rpcError } = await adminSupabase.rpc(
        "cleanup_expired_stories_report",
      );

      if (rpcError) {
        logger.error(`Erro ao limpar stories: ${rpcError.message}`);
        await logCronExecution(
          JOB_NAME,
          "error",
          `Erro ao limpar (${executorLabel})`,
          {
            error: rpcError.message,
          },
        );
        return NextResponse.json(
          {
            error: "Erro ao limpar stories",
            details: rpcError.message,
            logs: logger.getLogs(),
          },
          { status: 500 },
        );
      }

      const storiesDeleted = result?.stories_deleted || 0;
      logger.log(`Stories expirados deletados com sucesso: ${storiesDeleted}`);

      await logCronExecution(
        JOB_NAME,
        "success",
        `${storiesDeleted} stories deletados (${executorLabel})`,
        result,
      );

      return NextResponse.json({
        success: true,
        message: "Limpeza de stories concluída",
        ...result,
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
    console.error("❌ Erro inesperado na limpeza de stories:", error);
    return NextResponse.json(
      { error: "Erro inesperado", details: error.message },
      { status: 500 },
    );
  }
}

export const POST = GET;
