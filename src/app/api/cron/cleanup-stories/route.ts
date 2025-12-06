import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withAdminAuth } from "@/lib/authenticatedRoute";

/**
 * API para limpeza de stories antigos
 *
 * ⚠️ NOTA: Esta rota pode ser chamada manualmente por administradores
 * ou por um serviço externo (Cron job, GitHub Actions, etc.)
 *
 * Função executada:
 * - Deleta stories que já passaram de 24 horas (expiraram)
 *
 * Segurança:
 * - Requer autenticação de administrador (se chamado do frontend)
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

      // Usar função do banco que deleta stories expirados
      const { data: result, error: rpcError } = await adminSupabase.rpc(
        "cleanup_expired_stories_report",
      );

      if (rpcError) {
        console.error("❌ Erro ao limpar stories expirados:", rpcError);
        return NextResponse.json(
          { error: "Erro ao limpar stories", details: rpcError.message },
          { status: 500 },
        );
      }

      const storiesDeleted = result?.stories_deleted || 0;

      console.log(`✅ Limpeza de stories concluída (via CRON_SECRET):`);
      console.log(`   - ${storiesDeleted} stories deletados`);

      return NextResponse.json({
        success: true,
        message: "Stories expirados deletados com sucesso",
        stories_deleted: storiesDeleted,
        story_ids: result?.story_ids || [],
        timestamp: result?.timestamp,
      });
    }

    // Se não for CRON_SECRET, verificar se é admin autenticado
    return withAdminAuth(async (req, supabase, user) => {
      // Usar Service Role para bypassar RLS ao executar a função
      const adminSupabase = createAdminSupabaseClient();

      // Usar função do banco que deleta stories expirados
      const { data: result, error: rpcError } = await adminSupabase.rpc(
        "cleanup_expired_stories_report",
      );

      if (rpcError) {
        console.error("❌ Erro ao limpar stories expirados:", rpcError);
        return NextResponse.json(
          { error: "Erro ao limpar stories", details: rpcError.message },
          { status: 500 },
        );
      }

      const storiesDeleted = result?.stories_deleted || 0;

      console.log(`✅ Limpeza de stories executada por admin ${user.id}:`);
      console.log(`   - ${storiesDeleted} stories deletados`);

      return NextResponse.json({
        success: true,
        message: "Stories expirados deletados com sucesso",
        stories_deleted: storiesDeleted,
        story_ids: result?.story_ids || [],
        timestamp: result?.timestamp,
      });
    })(request);
  } catch (error: any) {
    console.error("❌ Erro inesperado na limpeza de stories:", error);
    return NextResponse.json(
      { error: "Erro inesperado", details: error.message },
      { status: 500 },
    );
  }
}

// Permitir POST também (alguns serviços de CRON usam POST)
export const POST = GET;
