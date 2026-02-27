import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withRateLimit } from "@/lib/rateLimitMiddleware";
import { isValidUUID } from "@/lib/validation";

/**
 * POST /api/referrals/claim
 *
 * Permite que um usuário que não foi indicado no cadastro (ex: login via Google)
 * adicione o código de quem o convidou posteriormente.
 *
 * Segurança:
 * - ✅ Rate limiting (heranca via withRateLimit)
 * - ✅ Validação de código de referral
 * - ✅ Verificação de auto-referral
 * - ✅ Verificação se o usuário já não foi indicado
 * - ⚠️ Usa Service Role para bypass RLS
 */
const handler = async (request: NextRequest) => {
  try {
    const { referredUserId, referralCode } = await request.json();

    console.log("🔍 [API claim] Reivindicando referral:", {
      referredUserId,
      referralCode,
    });

    if (!referredUserId || !referralCode) {
      return NextResponse.json(
        { error: "referredUserId e referralCode são obrigatórios" },
        { status: 400 },
      );
    }

    // Validar UUID do usuário
    if (!isValidUUID(referredUserId)) {
      return NextResponse.json(
        { error: "referredUserId inválido" },
        { status: 400 },
      );
    }

    // Normalizar código
    const normalizedCode = referralCode.toUpperCase().trim();

    // Validar formato do código: 6-12 caracteres, apenas letras (A-Z) e/ou números (0-9)
    const codeRegex = /^[A-Z0-9]{6,12}$/;
    if (!codeRegex.test(normalizedCode)) {
      return NextResponse.json(
        {
          error:
            "Código de referral inválido. Deve ter entre 6 e 12 caracteres (apenas letras e/ou números)",
        },
        { status: 400 },
      );
    }

    // Usar admin client para bypass RLS
    const supabase = createAdminSupabaseClient();

    // 1. Verificar se o usuário já não foi indicado
    const { data: existingReferral, error: existingReferralError } =
      await supabase
        .from("referrals")
        .select("id")
        .eq("referred_id", referredUserId)
        .maybeSingle();

    if (existingReferral) {
      return NextResponse.json(
        { error: "Você já possui uma indicação registrada." },
        { status: 400 },
      );
    }

    // 2. Buscar dados do referrer
    const { data: statsData, error: statsError } = await supabase
      .from("user_referral_stats")
      .select("user_id, referral_code")
      .ilike("referral_code", normalizedCode)
      .single();

    if (statsError || !statsData) {
      console.error("❌ [API claim] Código não encontrado:", statsError);
      return NextResponse.json(
        { error: "Código de indicação inválido. Verifique o código inserido." },
        { status: 404 },
      );
    }

    const { user_id: referrerId } = statsData;

    // 3. Verificar se não é auto-referral
    if (referrerId === referredUserId) {
      return NextResponse.json(
        { error: "Não é possível se auto-indicar." },
        { status: 400 },
      );
    }

    // 4. Criar referral (manual claim)
    const { error: insertError, data: insertData } = await supabase
      .from("referrals")
      .insert({
        referrer_id: referrerId,
        referred_id: referredUserId,
        referral_code: normalizedCode,
        status: "pending",
        source: "manual_claim",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        // Unique violation
        console.log(
          "⚠️ [API claim] Referral duplicado (já existe) - mas passou na primeira checagem de concorrência",
        );
        return NextResponse.json(
          { error: "O registro de indicação já existe para você." },
          { status: 400 },
        );
      }
      console.error(
        "❌ [API claim] Erro ao inserir manual referral:",
        insertError,
      );
      return NextResponse.json(
        {
          error: "Erro ao processar a indicação manual",
          details: insertError.message,
        },
        { status: 500 },
      );
    }

    // ✅ BONUS: Conceder crédito de anúncio premium de 7 dias para o usuário indicado (mesmo bonus do signup)
    console.log(
      "🎁 [API claim] Concedendo bônus de indicação (1 crédito 7 dias)...",
    );
    const { error: bonusError } = await supabase
      .from("profiles")
      .update({ credits_ad_premium_7d: 1 }) // Define como 1
      .eq("id", referredUserId);

    if (bonusError) {
      console.error("❌ [API claim] Erro ao conceder bônus:", bonusError);
    } else {
      console.log(
        "✅ [API claim] Bônus concedido com sucesso para:",
        referredUserId,
      );

      // 🔔 Enviar notificação pro usuário indicado
      await supabase.from("notifications").insert({
        user_id: referredUserId,
        title: "🎁 Bônus de Indicação Recebido!",
        message:
          "Você ganhou 1 crédito para criar um Anúncio Premium de 7 Dias grátis por ter sido indicado! Aproveite.",
        type: "system",
        priority: "high",
        is_read: false,
      });

      // 🔔 Notificar quem indicou informando a nova aquisicao
      await supabase.from("notifications").insert({
        user_id: referrerId,
        title: "🎉 Nova indicação registrada!",
        message: `Um amigo acabou de registrar o seu código (${normalizedCode}) através da funcionalidade manual! Acompanhe no dashboard de indicações.`,
        type: "system",
        priority: "normal",
        is_read: false,
      });
    }

    console.log(
      "✅ [API claim] Manual Referral criado com sucesso:",
      insertData?.id,
    );

    return NextResponse.json({
      success: true,
      referralId: insertData?.id,
      referrerId,
      referredUserId,
      referralCode: normalizedCode,
      message: "Código reivindicado com sucesso e recompensas liberadas!",
    });
  } catch (error: any) {
    console.error(
      "❌ [API claim] Erro geral ao processar manual claim:",
      error,
    );
    return NextResponse.json(
      { error: "Erro interno do servidor ao processar sua indicação" },
      { status: 500 },
    );
  }
};

export const POST = withRateLimit(handler, "API_DEFAULT");
