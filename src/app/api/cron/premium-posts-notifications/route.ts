import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { logCronExecution, CronExecutionLogger } from "@/lib/cron-logging";

export async function GET(request: NextRequest) {
  const JOB_NAME = "premium-posts-notifications";

  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const logger = new CronExecutionLogger(JOB_NAME);

    // Função interna para executar a lógica de manutenção
    const runMaintenance = async (executorLabel: string) => {
      const adminSupabase = createAdminSupabaseClient();
      const { data: result, error: rpcError } = await adminSupabase.rpc(
        "maintain_premium_posts_notifications",
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
            error: "Erro ao executar notificações",
            details: rpcError.message,
            logs: logger.getLogs(),
          },
          { status: 500 },
        );
      }

      const deactivatedCount = result?.deactivated_count || 0;
      const expiringNotifications = result?.expiring_notifications || 0;
      const expiredNotifications = result?.expired_notifications || 0;

      logger.log(`Posts premium convertidos para normais: ${deactivatedCount}`);
      logger.log(
        `Notificações de expiração (24h) criadas: ${expiringNotifications}`,
      );
      logger.log(`Notificações de expirados criadas: ${expiredNotifications}`);

      const logMessage = `Sucesso (${executorLabel}): ${deactivatedCount} desativados, ${expiringNotifications} alertados`;
      await logCronExecution(JOB_NAME, "success", logMessage, result);

      return NextResponse.json({
        success: true,
        message: "Manutenção de posts premium concluída",
        ...result,
        logs: logger.getLogs(),
      });
    };

    // 1. Verificar chamada via CRON_SECRET
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return await runMaintenance("Cron Job");
    }

    // 2. Verificar chamada via Admin autenticado
    return withAdminAuth(async (req, supabase, user) => {
      return await runMaintenance(`Admin ${user.id}`);
    })(request);
  } catch (error: any) {
    await logCronExecution(JOB_NAME, "error", "Erro inesperado", {
      error: error.message,
    });
    console.error("❌ Erro inesperado no CRON job de posts premium:", error);
    return NextResponse.json(
      { error: "Erro inesperado", details: error.message },
      { status: 500 },
    );
  }
}

// Permitir POST também (alguns serviços de CRON usam POST)
export const POST = GET;
