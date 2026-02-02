import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/classifieds/share
 *
 * Compartilha um anúncio com uma lista de usuários, criando notificações.
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const body = await request.json();
      const { adId, userIds, message } = body;

      const authenticatedUserId = user.id;

      if (!adId) {
        return NextResponse.json(
          { error: "adId é obrigatório" },
          { status: 400 },
        );
      }

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json(
          { error: "userIds deve ser um array não vazio" },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      // Buscar informações do anúncio
      const { data: adData, error: adError } = await adminSupabase
        .from("classified_ads")
        .select("title, id")
        .eq("id", adId)
        .single();

      if (adError || !adData) {
        return NextResponse.json(
          { error: "Anúncio não encontrado" },
          { status: 404 },
        );
      }

      // Buscar nome real do usuário autenticado
      const { data: profileData, error: profileError } = await supabaseAuth
        .from("profiles")
        .select("full_name")
        .eq("id", authenticatedUserId)
        .single();

      if (profileError || !profileData) {
        return NextResponse.json(
          { error: "Erro ao buscar informações do usuário" },
          { status: 500 },
        );
      }

      const fromUserName = profileData.full_name || "Usuário";

      // Criar notificações
      const notifications = userIds.map((userId: string) => ({
        user_id: userId,
        type: "info",
        title: "Anúncio compartilhado",
        message: message || `${fromUserName} compartilhou um anúncio com você`,
        action_url: `/classificados?ad=${adId}`,
        priority: "normal",
        metadata: {
          ad_id: adId,
          ad_title: adData.title,
          shared_by: fromUserName,
          from_user_id: authenticatedUserId,
          message: message || null,
          type: "shared_ad",
        },
        is_read: false,
      }));

      const { data, error } = await adminSupabase
        .from("notifications")
        .insert(notifications)
        .select();

      if (error) {
        return NextResponse.json(
          { error: "Erro ao compartilhar anúncio", details: error.message },
          { status: 500 },
        );
      }

      // Registrar compartilhamento na tabela classified_shares (opcional, ignora erro se não existir)
      try {
        await adminSupabase.from("classified_shares").insert({
          ad_id: adId,
          user_id: authenticatedUserId,
          share_type: "user",
          shared_at: new Date().toISOString(),
        });
      } catch (shareError) {
        // Ignora erro se a tabela não existir
      }

      return NextResponse.json({
        success: true,
        message: `Anúncio compartilhado com ${userIds.length} usuário(s)`,
        notificationsCreated: data?.length || 0,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
