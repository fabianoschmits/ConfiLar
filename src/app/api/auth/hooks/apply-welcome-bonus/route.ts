import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withRateLimit } from "@/lib/rateLimitMiddleware";

/**
 * POST /api/auth/hooks/apply-welcome-bonus
 *
 * Aplica o bônus de boas-vindas (1 crédito de anúncio de 1 dia) para usuários orgânicos.
 * Se o usuário já tiver bônus de indicação (7 dias), não aplica este.
 */
const handler = async (request: NextRequest) => {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();

    // 1. Verificar perfil atual
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits_ad_premium_1d, credits_ad_premium_7d")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("❌ [Welcome Bonus] Perfil não encontrado:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 2. Verificar se já tem bônus
    if (
      (profile.credits_ad_premium_7d && profile.credits_ad_premium_7d > 0) ||
      (profile.credits_ad_premium_1d && profile.credits_ad_premium_1d > 0)
    ) {
      console.log("ℹ️ [Welcome Bonus] Usuário já possui créditos. Ignorando.");
      return NextResponse.json({
        success: false,
        message: "User already has credits",
        applied: false,
      });
    }

    // 3. Aplicar bônus orgânico (1 dia)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits_ad_premium_1d: 1 })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ [Welcome Bonus] Erro ao aplicar bônus:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log("✅ [Welcome Bonus] Bônus orgânico aplicado para:", userId);

    // 🔔 Enviar notificação
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "🎁 Bem-vindo ao ConfiLar!",
      message:
        "Presente de boas-vindas: Você ganhou 1 crédito para criar um Anúncio Premium de 1 Dia grátis! Crie seu primeiro anúncio agora.",
      type: "system",
      priority: "high",
      is_read: false,
    });

    return NextResponse.json({
      success: true,
      applied: true,
      message: "Organic welcome bonus applied",
    });
  } catch (error: any) {
    console.error("❌ [Welcome Bonus] Erro interno:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const POST = withRateLimit(handler, "API_DEFAULT");
