import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { withRateLimit } from "@/lib/rateLimitMiddleware";
import { sanitizeString } from "@/lib/validation";

/**
 * GET /api/users/search
 *
 * Busca usuário pelo nome completo.
 *
 * Segurança:
 * - ✅ Requer autenticação (withAuth) - previne enumeration attacks
 * - ✅ Rate limiting - previne abuse
 * - ✅ Sanitização de entrada
 * - ✅ Busca apenas por nome, não expõe informações sensíveis
 */
const handler = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawName = searchParams.get("name");

    // ⚠️ SEGURANÇA: Sanitizar entrada do usuário
    const name = rawName ? sanitizeString(rawName, 100) : null;

    console.log("🔍 API: Buscando usuário:", name);

    if (!name || name.length < 2) {
      return NextResponse.json(
        {
          error: "Nome do usuário deve ter pelo menos 2 caracteres",
          userId: null,
        },
        { status: 400 },
      );
    }

    // Buscar usuário pelo nome completo (case insensitive)
    const { data, error } = await supabaseAuth
      .from("profiles")
      .select("id, full_name")
      .ilike("full_name", name)
      .limit(1)
      .single();

    if (error || !data) {
      console.error("❌ API: Erro ao buscar usuário:", error);
      console.log("🔍 API: Tentando busca parcial...");

      // Tentar busca parcial se não encontrar exato
      const { data: partialData, error: partialError } = await supabaseAuth
        .from("profiles")
        .select("id, full_name")
        .ilike("full_name", `%${name}%`)
        .limit(1)
        .single();

      if (partialError || !partialData) {
        console.error("❌ API: Usuário não encontrado:", name);
        return NextResponse.json(
          { error: "Usuário não encontrado", userId: null },
          { status: 404 },
        );
      }

      console.log(
        "✅ API: Usuário encontrado (busca parcial):",
        partialData.full_name,
        "→",
        partialData.id,
      );
      return NextResponse.json({ userId: partialData.id });
    }

    console.log("✅ API: Usuário encontrado:", data.full_name, "→", data.id);
    return NextResponse.json({ userId: data.id });
  } catch (error) {
    console.error("❌ API: Erro geral:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", userId: null },
      { status: 500 },
    );
  }
});

// ⚠️ SEGURANÇA: Rate limiting para prevenir enumeration attacks
export const GET = withRateLimit(handler, "API_DEFAULT");
