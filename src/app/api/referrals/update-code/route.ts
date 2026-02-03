import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withRateLimit } from "@/lib/rateLimitMiddleware";

/**
 * PUT /api/referrals/update-code
 *
 * Atualiza o código de referral personalizado do usuário.
 *
 * Segurança:
 * - ✅ Autenticação obrigatória
 * - ✅ Rate limiting
 * - ✅ Validação de formato (6-12 caracteres, A-Z, 0-9)
 * - ✅ Validação de unicidade
 * - ✅ Verifica se o usuário é o dono do código
 */
const handler = async (request: NextRequest) => {
  try {
    // Verificar autenticação usando cookies do Next.js
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Ignorar erros ao definir cookies em API routes
            }
          },
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { newCode } = await request.json();

    if (!newCode) {
      return NextResponse.json(
        { error: "Novo código é obrigatório" },
        { status: 400 },
      );
    }

    // Normalizar código (maiúsculas, sem espaços)
    const normalizedCode = newCode.toUpperCase().trim();

    // Validar formato: 6-12 caracteres, apenas letras (A-Z) e/ou números (0-9)
    // Pode ser apenas letras, apenas números, ou ambos
    const codeRegex = /^[A-Z0-9]{6,12}$/;
    if (!codeRegex.test(normalizedCode)) {
      return NextResponse.json(
        {
          error:
            "Código inválido. Deve ter entre 6 e 12 caracteres (apenas letras e/ou números)",
        },
        { status: 400 },
      );
    }

    // Verificar se o código já existe (case-insensitive)
    const { data: existingCode, error: checkError } = await supabase
      .from("user_referral_stats")
      .select("user_id, referral_code")
      .ilike("referral_code", normalizedCode)
      .single();

    // Se encontrou um código existente e não é do usuário atual, retornar erro
    if (existingCode && existingCode.user_id !== user.id) {
      return NextResponse.json(
        { error: "Este código já está em uso. Tente outro." },
        { status: 409 },
      );
    }

    // Se é o mesmo código do usuário, retornar sucesso (nada a fazer)
    if (
      existingCode &&
      existingCode.user_id === user.id &&
      existingCode.referral_code === normalizedCode
    ) {
      return NextResponse.json({
        success: true,
        message: "Código já está configurado assim",
        referralCode: normalizedCode,
      });
    }

    // Buscar stats do usuário
    const { data: userStats, error: statsError } = await supabase
      .from("user_referral_stats")
      .select("id, referral_code")
      .eq("user_id", user.id)
      .single();

    if (statsError || !userStats) {
      return NextResponse.json(
        { error: "Estatísticas de referral não encontradas" },
        { status: 404 },
      );
    }

    // Atualizar código
    const { data: updatedStats, error: updateError } = await supabase
      .from("user_referral_stats")
      .update({
        referral_code: normalizedCode,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select("referral_code")
      .single();

    if (updateError) {
      // Se for erro de constraint única (código duplicado)
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "Este código já está em uso. Tente outro." },
          { status: 409 },
        );
      }

      console.error(
        "❌ [API update-code] Erro ao atualizar código:",
        updateError,
      );
      return NextResponse.json(
        { error: updateError.message || "Erro ao atualizar código" },
        { status: 500 },
      );
    }

    console.log(
      "✅ [API update-code] Código atualizado com sucesso:",
      normalizedCode,
    );

    return NextResponse.json({
      success: true,
      message: "Código atualizado com sucesso!",
      referralCode: updatedStats.referral_code,
    });
  } catch (error: any) {
    console.error("❌ [API update-code] Erro ao atualizar código:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
};

export const PUT = withRateLimit(handler, "API_DEFAULT");
