import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { withRateLimit } from "@/lib/rateLimitMiddleware";
import { isValidUUID } from "@/lib/validation";

/**
 * POST /api/referrals/create
 *
 * Cria um referral para um usuário recém-cadastrado.
 *
 * Segurança:
 * - ✅ Rate limiting
 * - ✅ Validação de código de referral
 * - ✅ Verificação de auto-referral
 * - ⚠️ Usa Service Role para bypass RLS (necessário após cadastro)
 */
const handler = async (request: NextRequest) => {
  try {
    const { referredUserId, referralCode, source } = await request.json();

    console.log("🔍 [API create] Criando referral:", {
      referredUserId,
      referralCode,
      source,
    });

    if (!referredUserId || !referralCode) {
      return NextResponse.json(
        { error: "referredUserId e referralCode são obrigatórios" },
        { status: 400 },
      );
    }

    // ⚠️ SEGURANÇA: Validar UUID do usuário
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

    // Buscar dados do referrer
    const { data: statsData, error: statsError } = await supabase
      .from("user_referral_stats")
      .select("user_id, referral_code")
      .ilike("referral_code", normalizedCode)
      .single();

    if (statsError || !statsData) {
      console.error("❌ [API create] Código não encontrado:", statsError);
      return NextResponse.json(
        { error: "Código de referral inválido" },
        { status: 404 },
      );
    }

    const referrerId = statsData.user_id;

    // Verificar se não é auto-referral
    if (referrerId === referredUserId) {
      return NextResponse.json(
        { error: "Não é possível se auto-indicar" },
        { status: 400 },
      );
    }

    // Criar referral
    const { error: insertError, data: insertData } = await supabase
      .from("referrals")
      .insert({
        referrer_id: referrerId,
        referred_id: referredUserId,
        referral_code: normalizedCode,
        status: "pending",
        source: source || "link_direto",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // Pode ser duplicado, o que é ok
      if (insertError.code === "23505") {
        console.log("⚠️ [API create] Referral duplicado (já existe)");
        return NextResponse.json({
          success: true,
          message: "Referral já existe",
          duplicate: true,
        });
      }

      console.error("❌ [API create] Erro ao inserir referral:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log("✅ [API create] Referral criado com sucesso:", insertData?.id);

    return NextResponse.json({
      success: true,
      referralId: insertData?.id,
      referrerId,
      referredUserId,
      referralCode: normalizedCode,
    });
  } catch (error: any) {
    console.error("❌ [API create] Erro ao criar referral:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
};

export const POST = withRateLimit(handler, "API_DEFAULT");
