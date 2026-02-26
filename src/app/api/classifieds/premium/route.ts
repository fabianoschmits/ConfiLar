import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/classifieds/premium
 *
 * Cria um anúncio premium deduzindo pontos via server-side.
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const adData = await request.json();
      const authenticatedUserId = user.id;

      const {
        adId, // Adicionar suporte para ID de anúncio existente
        title,
        description,
        category,
        location_city,
        location_state,
        location_country,
        ad_type,
        price,
        images,
        pointsToSpend,
        durationDays,
        useCreditType,
      } = adData;

      const adminSupabase = createAdminSupabaseClient();

      // Se adId for fornecido, verificar se o anúncio existe e pertence ao usuário
      if (adId) {
        const { data: existingAd, error: checkError } = await adminSupabase
          .from("classified_ads")
          .select("user_id, is_premium")
          .eq("id", adId)
          .single();

        if (checkError || !existingAd) {
          return NextResponse.json(
            { error: "Anúncio não encontrado" },
            { status: 404 },
          );
        }

        if (existingAd.user_id !== authenticatedUserId) {
          return NextResponse.json(
            { error: "Você não tem permissão para editar este anúncio" },
            { status: 403 },
          );
        }
      }

      // 1. Processar pagamento (Pontos ou Créditos) ANTES de criar/atualizar o anúncio
      if (useCreditType) {
        // Verificar créditos no perfil
        const { data: profileData } = await adminSupabase
          .from("profiles")
          .select("credits_ad_premium_1d, credits_ad_premium_7d")
          .eq("id", authenticatedUserId)
          .single();

        const hasCredit =
          useCreditType === "1d"
            ? (profileData?.credits_ad_premium_1d || 0) > 0
            : (profileData?.credits_ad_premium_7d || 0) > 0;

        if (!hasCredit) {
          return NextResponse.json(
            {
              error:
                "Você não possui créditos premium disponíveis para esta duração.",
            },
            { status: 400 },
          );
        }

        // Consumir crédito
        const updateField =
          useCreditType === "1d"
            ? "credits_ad_premium_1d"
            : "credits_ad_premium_7d";
        const { data: creditRes, error: creditError } = await adminSupabase.rpc(
          "decrement_credit_count",
          {
            p_user_id: authenticatedUserId,
            p_field: updateField,
            p_amount: 1,
          },
        );

        if (creditError || (creditRes && !creditRes.success)) {
          return NextResponse.json(
            { error: creditRes?.error || "Erro ao consumir crédito" },
            { status: 500 },
          );
        }
      } else if (pointsToSpend > 0) {
        // Tentar deduzir pontos PRIMEIRO
        const { data: res, error: pointsError } = await adminSupabase.rpc(
          "deduct_points",
          {
            p_user_id: authenticatedUserId,
            p_points: pointsToSpend,
            p_source: "premium_ad",
            p_description: adId
              ? `Upgrade para anúncio premium (${durationDays} dias)`
              : `Criou anúncio premium (${durationDays} dias)`,
          },
        );

        if (pointsError || (res && !res.success)) {
          console.error("Erro ao deduzir pontos:", pointsError || res?.error);
          return NextResponse.json(
            {
              error:
                res?.error || "Saldo insuficiente ou erro ao debitar pontos.",
            },
            { status: 400 },
          );
        }
      }

      // 2. Criar ou Atualizar anúncio
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("full_name, user_type, contact_phone, email")
        .eq("id", authenticatedUserId)
        .single();

      const adPayload = {
        user_id: authenticatedUserId,
        user_name: profile?.full_name || "Usuário",
        user_type: profile?.user_type || "client",
        title,
        description,
        category,
        location_city,
        location_state,
        location_country: location_country || "BR",
        ad_type: ad_type === "offer" ? "oferecer" : "procurar",
        price_range: price ? price.toString() : null,
        contact_phone: profile?.contact_phone || null,
        contact_email: profile?.email || null,
        images: images || [],
        is_active: true,
        is_premium: true,
        is_featured: true,
        premium_points_spent: useCreditType ? 0 : pointsToSpend,
        premium_expires_at: expiresAt.toISOString(),
        premium_highlight_color: "#FFD700",
      };

      let resultAd;
      if (adId) {
        // Atualizar anúncio existente (Upgrade)
        const { data, error: updateError } = await adminSupabase
          .from("classified_ads")
          .update(adPayload)
          .eq("id", adId)
          .select()
          .single();

        if (updateError) {
          console.error("Erro ao atualizar anúncio para premium:", updateError);
          return NextResponse.json(
            { error: "Erro ao atualizar anúncio para premium" },
            { status: 500 },
          );
        }
        resultAd = data;
      } else {
        // Criar novo anúncio
        const { data, error: adError } = await adminSupabase
          .from("classified_ads")
          .insert(adPayload)
          .select()
          .single();

        if (adError) {
          console.error("Erro ao inserir anúncio:", adError);
          return NextResponse.json(
            { error: "Erro ao registrar anúncio no banco de dados" },
            { status: 500 },
          );
        }
        resultAd = data;
      }

      // 3. Notificar o usuário
      try {
        await adminSupabase.from("notifications").insert({
          user_id: authenticatedUserId,
          type: "success",
          title: adId
            ? "🌟 Upgrade Premium Ativado!"
            : "🌟 Anúncio Premium Criado!",
          message: `Seu anúncio "${title}" agora é Premium e terá destaque máximo por ${durationDays} dias.`,
          action_url: `/classificados`,
          priority: "high",
          is_read: false,
          created_at: new Date().toISOString(),
        });
      } catch (notifError) {
        console.error("Erro ao criar notificação de upgrade:", notifError);
        // Não falhar a requisição se a notificação falhar
      }

      return NextResponse.json({ success: true, ad: resultAd });
    } catch (error) {
      console.error("Erro na API de anúncio premium:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
