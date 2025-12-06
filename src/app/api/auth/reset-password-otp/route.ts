import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withRateLimit } from "@/lib/rateLimitMiddleware";
import { validateEmail } from "@/lib/validation";

/**
 * POST /api/auth/reset-password-otp
 *
 * Envia um código OTP numérico para recuperação de senha usando signInWithOtp
 *
 * IMPORTANTE: Para enviar código OTP numérico (não magic link), o template de email
 * "Magic Link" no Supabase Dashboard precisa incluir {{ .Token }} em vez do link.
 *
 * Segurança:
 * - ✅ Rate limiting agressivo (previne brute force e spam)
 * - ✅ Validação de email
 */
const handler = async (request: NextRequest) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 },
      );
    }

    // ⚠️ SEGURANÇA: Validar formato do email
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Usar signInWithOtp para enviar código OTP de recuperação
    // IMPORTANTE: Para enviar código OTP numérico em vez de magic link,
    // o template de email "Magic Link" no Supabase Dashboard precisa incluir {{ .Token }}
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // Não criar novo usuário
        emailRedirectTo: undefined, // Não redirecionar, apenas enviar código
      },
    });

    if (otpError) {
      console.error("❌ Erro ao enviar código OTP de recuperação:", otpError);
      return NextResponse.json(
        { error: otpError.message || "Erro ao enviar código de verificação" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Código de verificação enviado com sucesso",
    });
  } catch (error) {
    console.error(
      "❌ Erro ao processar solicitação de recuperação de senha:",
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
