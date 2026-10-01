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

      if (
        !userIds ||
        !Array.isArray(userIds) ||
        userIds.length === 0 ||
        userIds.length > 20 ||
        userIds.some(
          (id) =>
            typeof id !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              id,
            ),
        ) ||
        (message && (typeof message !== "string" || message.length > 1000))
      ) {
        return NextResponse.json(
          {
            error:
              "Selecione até 20 destinatários válidos e uma mensagem de até 1000 caracteres",
          },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      // Buscar informações do anúncio
      const { data: adData, error: adError } = await adminSupabase
        .from("classified_ads")
        .select("title, id")
        .eq("id", adId)
        .eq("is_active", true)
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
      const notifications = [...new Set<string>(userIds)].map(
        (userId: string) => ({
          user_id: userId,
          type: "info",
          title: "Anúncio compartilhado",
          message:
            message || `${fromUserName} compartilhou um anúncio com você`,
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
        }),
      );

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
        const { error: shareError } = await adminSupabase
          .from("classified_shares")
          .upsert(
            {
              ad_id: adId,
              user_id: authenticatedUserId,
              share_type: "user",
              shared_at: new Date().toISOString(),
            },
            { onConflict: "ad_id,user_id,share_type", ignoreDuplicates: true },
          );
        if (shareError)
          console.warn(
            "Notificações enviadas; registro do compartilhamento indisponível:",
            shareError.code,
          );
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
