import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token reCAPTCHA ausente." },
        { status: 400 },
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY não configurada.");
      return NextResponse.json(
        { success: false, message: "Configuração de servidor inválida." },
        { status: 500 },
      );
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    // Score >= 0.5 é considerado humano (0.0 = bot, 1.0 = humano)
    if (data.success && data.score >= 0.5) {
      return NextResponse.json({ success: true, score: data.score });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Verificação de segurança falhou. Tente novamente.",
          score: data.score,
        },
        { status: 403 },
      );
    }
  } catch (error) {
    console.error("Erro ao verificar reCAPTCHA:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao verificar segurança." },
      { status: 500 },
    );
  }
}
