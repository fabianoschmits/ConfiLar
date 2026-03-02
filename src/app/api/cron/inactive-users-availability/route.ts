import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { logCronExecution, CronExecutionLogger } from "@/lib/cron-logging";

export async function GET(request: NextRequest) {
  const JOB_NAME = "inactive-users-availability";

  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const logger = new CronExecutionLogger(JOB_NAME);

    const runMaintenance = async (executorLabel: string) => {
      const adminSupabase = createAdminSupabaseClient();
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      logger.log(
        `Buscando usuários inativos há mais de 7 dias... (Corte: ${sevenDaysAgoISO})`,
      );

      // Buscar usuários que estão disponíveis
      const { data: availableUsers, error: fetchError } = await adminSupabase
        .from("profiles")
        .select("id, full_name, email, is_available, last_login_at, updated_at")
        .eq("is_available", true);

      if (fetchError) {
        logger.error(`Erro ao buscar usuários: ${fetchError.message}`);
        await logCronExecution(
          JOB_NAME,
          "error",
          `Erro ao buscar usuários (${executorLabel})`,
          {
            error: fetchError.message,
          },
        );
        return NextResponse.json(
          {
            error: "Erro ao buscar usuários",
            details: fetchError.message,
            logs: logger.getLogs(),
          },
          { status: 500 },
        );
      }

      if (!availableUsers || availableUsers.length === 0) {
        logger.log("Nenhum usuário disponível encontrado.");
        await logCronExecution(
          JOB_NAME,
          "success",
          "Fila vazia (Nenhum disponível)",
          { executor: executorLabel },
        );
        return NextResponse.json({
          success: true,
          message: "Nenhum usuário disponível encontrado",
          logs: logger.getLogs(),
        });
      }

      // Filtrar inativos
      const reallyInactiveUsers = availableUsers.filter((user) => {
        const lastActivity = user.last_login_at
          ? new Date(user.last_login_at)
          : user.updated_at
            ? new Date(user.updated_at)
            : null;
        if (!lastActivity) return false;

        const daysSinceActivity = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
        );
        return daysSinceActivity >= 7;
      });

      if (reallyInactiveUsers.length === 0) {
        logger.log("Nenhum usuário inativo há mais de 7 dias.");
        await logCronExecution(JOB_NAME, "success", "Nenhum inativo", {
          executor: executorLabel,
        });
        return NextResponse.json({
          success: true,
          message: "Nenhum usuário inativo encontrado",
          logs: logger.getLogs(),
        });
      }

      const userIds = reallyInactiveUsers.map((u) => u.id);
      const { error: updateError } = await adminSupabase
        .from("profiles")
        .update({ is_available: false, updated_at: now.toISOString() })
        .in("id", userIds);

      if (updateError) {
        logger.error(`Erro ao atualizar perfis: ${updateError.message}`);
        await logCronExecution(
          JOB_NAME,
          "error",
          "Erro ao marcar indisponíveis",
          { error: updateError.message },
        );
        return NextResponse.json(
          {
            error: "Erro ao atualizar disponibilidade",
            details: updateError.message,
            logs: logger.getLogs(),
          },
          { status: 500 },
        );
      }

      reallyInactiveUsers.forEach((u) => {
        const lastActivity = u.last_login_at
          ? new Date(u.last_login_at)
          : u.updated_at
            ? new Date(u.updated_at)
            : null;
        const daysSinceActivity = lastActivity
          ? Math.floor(
              (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
            )
          : 0;
        logger.log(
          `✅ Usuário ${u.full_name || u.email} marcado como indisponível (${daysSinceActivity} dias inativo)`,
        );
      });

      await logCronExecution(
        JOB_NAME,
        "success",
        `${userIds.length} usuários marcados (${executorLabel})`,
        {
          executor: executorLabel,
          count: userIds.length,
        },
      );

      return NextResponse.json({
        success: true,
        message: `${userIds.length} usuário(s) marcado(s) como indisponível(is)`,
        users_marked_unavailable: userIds.length,
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
    return NextResponse.json(
      { error: "Erro inesperado", details: error.message },
      { status: 500 },
    );
  }
}
