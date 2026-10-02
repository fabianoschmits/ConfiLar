import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { validPremiumPurchase } from "@/lib/premium-purchase";

export const POST = withAuth(
  async (request: NextRequest, _supabaseAuth, user) => {
    try {
      const {
        adId,
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
      } = await request.json();
      if (
        !validPremiumPurchase(
          "AD",
          durationDays,
          pointsToSpend,
          useCreditType,
        ) ||
        ![title, description, category, location_city, location_state].every(
          (value) => typeof value === "string" && value.trim(),
        )
      ) {
        return NextResponse.json(
          { error: "Plano premium ou dados do anúncio inválidos." },
          { status: 400 },
        );
      }
      const admin = createAdminSupabaseClient();
      if (adId) {
        const { data: existing, error } = await admin
          .from("classified_ads")
          .select("user_id")
          .eq("id", adId)
          .single();
        if (error || !existing)
          return NextResponse.json(
            { error: "Anúncio não encontrado" },
            { status: 404 },
          );
        if (existing.user_id !== user.id)
          return NextResponse.json(
            { error: "Permissão negada" },
            { status: 403 },
          );
      }
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name,user_type,contact_phone,email")
        .eq("id", user.id)
        .single();
      const payload = {
        user_id: user.id,
        user_name: profile?.full_name || "Usuário",
        user_type: profile?.user_type || "client",
        title,
        description,
        category,
        location_city,
        location_state,
        location_country: location_country || "BR",
        ad_type:
          ad_type === "offer" || ad_type === "oferecer"
            ? "oferecer"
            : "procurar",
        price_range: price != null ? String(price) : null,
        contact_phone: profile?.contact_phone || null,
        contact_email: profile?.email || null,
        images: images || [],
        is_active: true,
        is_premium: true,
        is_featured: true,
        premium_points_spent: useCreditType ? 0 : pointsToSpend,
        premium_expires_at: new Date(
          Date.now() + durationDays * 86400000,
        ).toISOString(),
        premium_highlight_color: "#FFD700",
      };
      const { data: ad, error } = await admin.rpc("purchase_premium_content", {
        p_user_id: user.id,
        p_kind: "AD",
        p_record_id: adId || null,
        p_payload: payload,
        p_points: pointsToSpend,
        p_credit: useCreditType || null,
      });
      if (error || !ad)
        return NextResponse.json(
          {
            error:
              "Não foi possível confirmar a compra. Verifique seus pontos ou créditos.",
          },
          { status: 400 },
        );
      return NextResponse.json({ success: true, ad });
    } catch {
      return NextResponse.json(
        { error: "Dados inválidos ou falha ao processar o anúncio." },
        { status: 400 },
      );
    }
  },
);
