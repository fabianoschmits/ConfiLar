import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * DELETE /api/admin/classified-ads/[id]
 *
 * Deleta um anúncio classificado (apenas administradores)
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem deletar anúncios
 * - ✅ Usa Service Role Key para bypassar RLS
 * - ✅ Loga ação de deleção
 */
export const DELETE = withAdminAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      // Extrair ID da URL (ex: /api/admin/classified-ads/123)
      const urlParts = request.url.split("/");
      const adId = urlParts[urlParts.length - 1];

      if (!adId) {
        return NextResponse.json(
          { error: "ID do anúncio é obrigatório" },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      // Buscar informações do anúncio antes de deletar (para log)
      const { data: adData, error: fetchError } = await adminSupabase
        .from("classified_ads")
        .select("id, title, user_id, created_at")
        .eq("id", adId)
        .single();

      if (fetchError || !adData) {
        return NextResponse.json(
          { error: "Anúncio não encontrado" },
          { status: 404 },
        );
      }

      // Deletar o anúncio (e seus relacionamentos via CASCADE se configurado no banco)
      const { error: deleteError } = await adminSupabase
        .from("classified_ads")
        .delete()
        .eq("id", adId);

      if (deleteError) {
        console.error("❌ Erro ao deletar anúncio:", deleteError);
        return NextResponse.json(
          { error: "Erro ao deletar anúncio", details: deleteError.message },
          { status: 500 },
        );
      }

      console.log(
        `✅ Anúncio ${adId} deletado por admin ${user.id} (${user.email})`,
      );
      console.log(
        `📋 Anúncio deletado: ${adData.title || "Sem título"} | Criado por: ${adData.user_id}`,
      );

      return NextResponse.json({
        success: true,
        message: "Anúncio deletado com sucesso",
        deletedAd: {
          id: adData.id,
          title: adData.title,
        },
      });
    } catch (error: any) {
      console.error("❌ Erro inesperado ao deletar anúncio:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor", details: error.message },
        { status: 500 },
      );
    }
  },
);
