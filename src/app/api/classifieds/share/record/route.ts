import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/classifieds/share/record
 *
 * Registra um compartilhamento de anúncio (link, WhatsApp, Messenger)
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const body = await request.json();
      const { adId, shareType } = body;

      const authenticatedUserId = user.id;

      if (!adId) {
        return NextResponse.json(
          { error: "adId é obrigatório" },
          { status: 400 },
        );
      }

      if (
        !shareType ||
        !["link", "whatsapp", "messenger"].includes(shareType)
      ) {
        return NextResponse.json(
          { error: "shareType deve ser: link, whatsapp ou messenger" },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      // Verificar se o anúncio existe
      const { data: adData, error: adError } = await adminSupabase
        .from("classified_ads")
        .select("id")
        .eq("id", adId)
        .eq("is_active", true)
        .single();

      if (adError || !adData) {
        return NextResponse.json(
          { error: "Anúncio não encontrado" },
          { status: 404 },
        );
      }

      // Registrar compartilhamento
      const { error } = await adminSupabase
        .from("classified_shares")
        .insert({
          ad_id: adId,
          user_id: authenticatedUserId,
          share_type: shareType,
          shared_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505")
          return NextResponse.json({ success: true, isNew: false });
        return NextResponse.json(
          { error: "Não foi possível registrar o compartilhamento" },
          { status: 503 },
        );
      }
      return NextResponse.json({
        success: true,
        message: "Compartilhamento registrado",
        isNew: true,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
