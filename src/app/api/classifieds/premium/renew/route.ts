import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/classifieds/premium/renew
 *
 * Renova um anúncio premium deduzindo pontos via server-side.
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { adId, pointsToSpend, durationDays, useCreditType } =
        await request.json();
      const authenticatedUserId = user.id;

      const adminSupabase = createAdminSupabaseClient();

      // 1. Buscar anúncio e verificar posse
      const { data: ad, error: adError } = await adminSupabase
        .from("classified_ads")
        .select("user_id, title")
        .eq("id", adId)
        .single();

      if (adError || !ad) {
        return NextResponse.json(
          { error: "Anúncio não encontrado" },
          { status: 404 },
        );
      }

      if (ad.user_id !== authenticatedUserId) {
        return NextResponse.json(
          { error: "Permissão negada" },
          { status: 403 },
        );
      }

      // 2. Processar pagamento (Pontos ou Créditos)
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
        // Verificar saldo de pontos
        const { data: balanceData } = await adminSupabase
          .from("user_points_balance")
          .select("balance")
          .eq("user_id", authenticatedUserId)
          .single();

        if (!balanceData || balanceData.balance < pointsToSpend) {
          return NextResponse.json(
            { error: "Saldo insuficiente para renovação" },
            { status: 400 },
          );
        }

        // Deduzir pontos
        const { error: pointsError } = await adminSupabase.rpc(
          "deduct_points",
          {
            p_user_id: authenticatedUserId,
            p_points: pointsToSpend,
            p_source: "premium_ad_renewal",
            p_description: `Renovou anúncio premium: ${ad.title}`,
          },
        );

        if (pointsError) {
          console.error("Erro ao deduzir pontos na renovação:", pointsError);
          return NextResponse.json(
            { error: "Erro ao debitar pontos" },
            { status: 500 },
          );
        }
      }

      // 3. Renovar anúncio
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const { data: updatedAd, error: updateError } = await adminSupabase
        .from("classified_ads")
        .update({
          is_premium: true,
          is_featured: true,
          premium_points_spent: useCreditType ? 0 : pointsToSpend,
          premium_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", adId)
        .select()
        .single();

      if (updateError) {
        console.error("Erro ao renovar anúncio:", updateError);
        return NextResponse.json(
          { error: "Erro ao renovar anúncio" },
          { status: 500 },
        );
      }

      // 4. Notificar o usuário
      try {
        await adminSupabase.from("notifications").insert({
          user_id: authenticatedUserId,
          type: "success",
          title: "🌟 Anúncio Renovado!",
          message: `Seu anúncio "${ad.title}" foi renovado com sucesso e continuará em destaque por mais ${durationDays} dias.`,
          action_url: `/classificados`,
          priority: "normal",
          is_read: false,
          created_at: new Date().toISOString(),
        });
      } catch (notifError) {
        console.error("Erro ao criar notificação de renovação:", notifError);
        // Não falhar a requisição se a notificação falhar
      }

      return NextResponse.json({ success: true, ad: updatedAd });
    } catch (error) {
      console.error("Erro na API de renovação premium:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
