import { purchaseOnce } from "@/lib/purchase-once";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { validPremiumPurchase } from "@/lib/premium-purchase";

export const POST = withAuth(
  async (request: NextRequest, _supabaseAuth, user) => {
    try {
      const body = await request.json();
      const { adId, pointsToSpend, durationDays, useCreditType } = body;
      if (
        !adId ||
        !validPremiumPurchase("AD", durationDays, pointsToSpend, useCreditType)
      ) {
        return NextResponse.json(
          { error: "Plano premium inválido." },
          { status: 400 },
        );
      }
      const admin = createAdminSupabaseClient();
      const { data: existing, error: lookupError } = await admin
        .from("classified_ads")
        .select("user_id")
        .eq("id", adId)
        .single();
      if (lookupError || !existing)
        return NextResponse.json(
          { error: "Anúncio não encontrado" },
          { status: 404 },
        );
      if (existing.user_id !== user.id)
        return NextResponse.json(
          { error: "Permissão negada" },
          { status: 403 },
        );
      const { data: ad, error } = await purchaseOnce(
        admin,
        request,
        body,
        "premium-content",
        {
          p_user_id: user.id,
          p_kind: "AD",
          p_record_id: adId,
          p_points: pointsToSpend,
          p_credit: useCreditType || null,
          p_payload: {
            user_id: user.id,
            is_premium: true,
            is_featured: true,
            premium_points_spent: useCreditType ? 0 : pointsToSpend,
            premium_expires_at: new Date(
              Date.now() + durationDays * 86400000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      );
      if (error || !ad)
        return NextResponse.json(
          {
            error:
              "Não foi possível confirmar a renovação. Verifique seus pontos ou créditos.",
          },
          { status: 400 },
        );
      return NextResponse.json({ success: true, ad });
    } catch {
      return NextResponse.json(
        { error: "Dados inválidos ou falha ao processar a renovação." },
        { status: 503 },
      );
    }
  },
);
