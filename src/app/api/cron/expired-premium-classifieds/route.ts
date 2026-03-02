import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { logCronExecution, CronExecutionLogger } from "@/lib/cron-logging";

export async function GET(request: NextRequest) {
  const JOB_NAME = "expired-premium-classifieds";

  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const logger = new CronExecutionLogger(JOB_NAME);

    const runMaintenance = async (executorLabel: string) => {
      const supabase = createAdminSupabaseClient();
      const { data: result, error: rpcError } = await supabase.rpc(
        "maintain_premium_classifieds",
      );

      if (rpcError) {
        logger.error(`Erro ao executar manutenção: ${rpcError.message}`);
        await logCronExecution(
          JOB_NAME,
          "error",
          `Erro ao executar (${executorLabel})`,
          {
            error: rpcError.message,
          },
        );
        return NextResponse.json(
          {
            error: "Erro ao executar manutenção",
            details: rpcError.message,
            logs: logger.getLogs(),
          },
          { status: 500 },
        );
      }

      const deactivatedCount = result?.deactivated_count || 0;
      const expiringNotifications = result?.expiring_notifications || 0;
      const expiredNotifications = result?.expired_notifications || 0;

      logger.log(
        `Classificados premium convertidos para normais: ${deactivatedCount}`,
      );
      logger.log(
        `Notificações de expiração (24h) criadas: ${expiringNotifications}`,
      );
      logger.log(`Notificações de expirados criadas: ${expiredNotifications}`);

      await logCronExecution(
        JOB_NAME,
        "success",
        `Sucesso (${executorLabel}): ${deactivatedCount} desativados`,
        { ...result, executor: executorLabel },
      );

      return NextResponse.json({
        success: true,
        message: "Manutenção de classificados concluída",
        ...result,
        logs: logger.getLogs(),
      });
    };

    // 1. Check Cron Secret
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return await runMaintenance("Cron Job");
    }

    // 2. Fallback to Admin Auth
    return withAdminAuth(async (req, supabase, user) => {
      return await runMaintenance(`Admin ${user.id}`);
    })(request);
  } catch (error: any) {
    await logCronExecution(JOB_NAME, "error", "Erro inesperado", {
      error: error.message,
    });
    console.error("❌ Erro inesperado no CRON job de classificados:", error);
    return NextResponse.json(
      { error: "Erro inesperado", details: error.message },
      { status: 500 },
    );
  }
}

export const POST = GET;
