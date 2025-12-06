import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withAdminAuth } from "@/lib/authenticatedRoute";

/**
 * API para marcar usuários inativos como indisponíveis
 *
 * ⚠️ NOTA: Esta rota pode ser chamada manualmente por administradores
 * ou por um serviço externo (Cron job, GitHub Actions, etc.)
 *
 * Funções executadas:
 * - Identifica usuários que ficaram mais de 7 dias sem acessar
 * - Marca como indisponível (is_available = false) usuários inativos
 * - Usa last_login_at ou updated_at para verificar inatividade
 *
 * Segurança:
 * - Requer Service Role Key (fornecida via header do frontend)
 * - Ou usa CRON_SECRET (se chamado por serviço externo)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // ⚠️ SEGURANÇA: NUNCA aceitar Service Role Key do frontend!
    // Apenas aceitar CRON_SECRET (serviço externo) ou autenticação de admin

    // Verificar se é chamada por serviço externo com CRON_SECRET
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      // CRON_SECRET configurado (serviço externo) - usar Service Role do servidor
      const adminSupabase = createAdminSupabaseClient();

      // Data de 7 dias atrás
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      console.log(
        "🔍 [Inactive Users] Buscando usuários inativos há mais de 7 dias...",
      );
      console.log(`   Data de corte: ${sevenDaysAgoISO}`);

      // Buscar usuários que estão disponíveis mas inativos há mais de 7 dias
      // Primeiro, buscar todos os usuários disponíveis
      const { data: availableUsers, error: fetchError } = await adminSupabase
        .from("profiles")
        .select("id, full_name, email, is_available, last_login_at, updated_at")
        .eq("is_available", true);

      if (fetchError) {
        console.error(
          "❌ [Inactive Users] Erro ao buscar usuários disponíveis:",
          fetchError,
        );
        return NextResponse.json(
          {
            error: "Erro ao buscar usuários disponíveis",
            details: fetchError.message,
          },
          { status: 500 },
        );
      }

      if (!availableUsers || availableUsers.length === 0) {
        console.log("✅ [Inactive Users] Nenhum usuário disponível encontrado");
        return NextResponse.json({
          success: true,
          message: "Nenhum usuário disponível encontrado",
          users_marked_unavailable: 0,
          user_ids: [],
          timestamp: new Date().toISOString(),
        });
      }

      // Filtrar usuários que realmente estão inativos há mais de 7 dias
      // (verificar tanto last_login_at quanto updated_at)
      const now = new Date();
      const reallyInactiveUsers = availableUsers.filter((user) => {
        const lastLogin = user.last_login_at
          ? new Date(user.last_login_at)
          : null;
        const lastUpdate = user.updated_at ? new Date(user.updated_at) : null;

        // Se tem last_login_at, usar ele; senão usar updated_at
        const lastActivity = lastLogin || lastUpdate;

        if (!lastActivity) {
          // Se não tem nenhuma data, considerar inativo se updated_at for muito antigo
          // ou se não existe last_login_at e updated_at é antigo
          if (lastUpdate) {
            const lastUpdateDate = new Date(lastUpdate);
            const daysSinceUpdate = Math.floor(
              (now.getTime() - lastUpdateDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            return daysSinceUpdate >= 7;
          }
          return false;
        }

        const lastActivityDate = new Date(lastActivity);
        const daysSinceActivity = Math.floor(
          (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        return daysSinceActivity >= 7;
      });

      if (reallyInactiveUsers.length === 0) {
        console.log(
          "✅ [Inactive Users] Nenhum usuário realmente inativo há mais de 7 dias",
        );
        return NextResponse.json({
          success: true,
          message: "Nenhum usuário realmente inativo há mais de 7 dias",
          users_marked_unavailable: 0,
          user_ids: [],
          timestamp: new Date().toISOString(),
        });
      }

      // Marcar como indisponível
      const userIds = reallyInactiveUsers.map((u) => u.id);
      const { error: updateError } = await adminSupabase
        .from("profiles")
        .update({
          is_available: false,
          updated_at: new Date().toISOString(),
        })
        .in("id", userIds);

      if (updateError) {
        console.error(
          "❌ [Inactive Users] Erro ao marcar usuários como indisponíveis:",
          updateError,
        );
        return NextResponse.json(
          {
            error: "Erro ao atualizar disponibilidade",
            details: updateError.message,
          },
          { status: 500 },
        );
      }

      console.log(
        `✅ [Inactive Users] ${reallyInactiveUsers.length} usuários marcados como indisponíveis`,
      );

      // Log detalhado
      reallyInactiveUsers.forEach((user) => {
        const lastLogin = user.last_login_at
          ? new Date(user.last_login_at)
          : null;
        const lastUpdate = user.updated_at ? new Date(user.updated_at) : null;
        const lastActivity = lastLogin || lastUpdate;
        const daysSinceActivity = lastActivity
          ? Math.floor(
              (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
            )
          : 0;

        console.log(
          `   - ${user.full_name || user.email} (${daysSinceActivity} dias sem atividade)`,
        );
      });

      return NextResponse.json({
        success: true,
        message: `${reallyInactiveUsers.length} usuário(s) marcado(s) como indisponível(is) devido à inatividade`,
        users_marked_unavailable: reallyInactiveUsers.length,
        user_ids: userIds,
        user_details: reallyInactiveUsers.map((u) => {
          const lastLogin = u.last_login_at ? new Date(u.last_login_at) : null;
          const lastUpdate = u.updated_at ? new Date(u.updated_at) : null;
          const lastActivity = lastLogin || lastUpdate;
          const daysSinceActivity = lastActivity
            ? Math.floor(
                (now.getTime() - lastActivity.getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 0;

          return {
            id: u.id,
            name: u.full_name,
            email: u.email,
            last_login_at: u.last_login_at,
            updated_at: u.updated_at,
            days_inactive: daysSinceActivity,
          };
        }),
        timestamp: new Date().toISOString(),
      });
    }

    // Se não for CRON_SECRET, verificar se é admin autenticado
    return withAdminAuth(async (req, supabase, user) => {
      const adminSupabase = createAdminSupabaseClient();

      // Data de 7 dias atrás
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      // Buscar usuários que estão disponíveis mas inativos há mais de 7 dias
      const { data: availableUsers, error: fetchError } = await adminSupabase
        .from("profiles")
        .select("id, full_name, email, is_available, last_login_at, updated_at")
        .eq("is_available", true)
        .or(`last_login_at.lt.${sevenDaysAgoISO},last_login_at.is.null`)
        .order("updated_at", { ascending: true });

      if (fetchError) {
        console.error(
          "❌ [Inactive Users] Erro ao buscar usuários:",
          fetchError,
        );
        return NextResponse.json(
          { error: "Erro ao buscar usuários", details: fetchError.message },
          { status: 500 },
        );
      }

      if (!availableUsers || availableUsers.length === 0) {
        return NextResponse.json({
          success: true,
          message: "Nenhum usuário realmente inativo há mais de 7 dias",
          users_marked_unavailable: 0,
          user_ids: [],
          timestamp: new Date().toISOString(),
        });
      }

      // Filtrar usuários que realmente estão inativos há mais de 7 dias
      const now = new Date();
      const reallyInactiveUsers = availableUsers.filter((user) => {
        const lastLogin = user.last_login_at
          ? new Date(user.last_login_at)
          : null;
        const lastUpdate = user.updated_at ? new Date(user.updated_at) : null;
        const lastActivity = lastLogin || lastUpdate;

        if (!lastActivity) {
          if (lastUpdate) {
            const lastUpdateDate = new Date(lastUpdate);
            const daysSinceUpdate = Math.floor(
              (now.getTime() - lastUpdateDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            return daysSinceUpdate >= 7;
          }
          return false;
        }

        const lastActivityDate = new Date(lastActivity);
        const daysSinceActivity = Math.floor(
          (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        return daysSinceActivity >= 7;
      });

      if (reallyInactiveUsers.length === 0) {
        return NextResponse.json({
          success: true,
          message: "Nenhum usuário realmente inativo há mais de 7 dias",
          users_marked_unavailable: 0,
          user_ids: [],
          timestamp: new Date().toISOString(),
        });
      }

      // Marcar como indisponível
      const userIds = reallyInactiveUsers.map((u) => u.id);
      const { error: updateError } = await adminSupabase
        .from("profiles")
        .update({
          is_available: false,
          updated_at: new Date().toISOString(),
        })
        .in("id", userIds);

      if (updateError) {
        console.error(
          "❌ [Inactive Users] Erro ao marcar usuários como indisponíveis:",
          updateError,
        );
        return NextResponse.json(
          {
            error: "Erro ao atualizar disponibilidade",
            details: updateError.message,
          },
          { status: 500 },
        );
      }

      console.log(
        `✅ [Inactive Users] ${reallyInactiveUsers.length} usuários marcados como indisponíveis por admin ${user.id}`,
      );

      return NextResponse.json({
        success: true,
        message: `${reallyInactiveUsers.length} usuário(s) marcado(s) como indisponível(is) devido à inatividade`,
        users_marked_unavailable: reallyInactiveUsers.length,
        user_ids: userIds,
        timestamp: new Date().toISOString(),
      });
    })(request);
  } catch (error: any) {
    console.error(
      "❌ [Inactive Users] Erro ao processar usuários inativos:",
      error,
    );
    return NextResponse.json(
      { error: "Erro ao processar usuários inativos", details: error.message },
      { status: 500 },
    );
  }
}
