import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withRateLimit } from "@/lib/rateLimitMiddleware";
import { validateEmail } from "@/lib/validation";

/**
 * POST /api/auth/change-email-otp
 *
 * Envia um código OTP numérico para verificar o novo email durante a alteração de email.
 *
 * IMPORTANTE: Para enviar código OTP numérico (não magic link), o template de email
 * "Email Change" no Supabase Dashboard precisa incluir {{ .Token }} em vez do link.
 *
 * Segurança:
 * - ✅ Rate limiting agressivo (previne brute force)
 * - ✅ Validação de email
 * - ✅ Requer autenticação
 */
const handler = async (request: NextRequest) => {
  try {
    const { newEmail } = await request.json();

    if (!newEmail) {
      return NextResponse.json(
        { error: "Novo email é obrigatório" },
        { status: 400 },
      );
    }

    // ⚠️ SEGURANÇA: Validar formato do email usando função padronizada
    if (!validateEmail(newEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Verificar se o usuário está autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    // Verificar se o novo email é diferente do atual
    if (user.email === newEmail) {
      return NextResponse.json(
        { error: "O novo email deve ser diferente do email atual" },
        { status: 400 },
      );
    }

    // Usar updateUser para iniciar a mudança de email
    // Isso enviará um código OTP para o novo email se o template estiver configurado corretamente
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      console.error(
        "❌ Erro ao enviar código OTP de alteração de email:",
        updateError,
      );
      return NextResponse.json(
        {
          error: updateError.message || "Erro ao enviar código de verificação",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Código de verificação enviado para o novo email",
    });
  } catch (error) {
    console.error(
      "❌ Erro ao processar solicitação de alteração de email:",
      error,
    );
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
};

// ⚠️ SEGURANÇA: Rate limiting agressivo para prevenir brute force
export const POST = withRateLimit(handler, "PASSWORD_RESET");
