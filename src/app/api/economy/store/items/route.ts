import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { withRateLimit } from "@/lib/rateLimitMiddleware";

/**
 * GET /api/economy/store/items
 *
 * Retorna itens da loja de pontos.
 *
 * Segurança:
 * - ✅ Requer autenticação
 * - ✅ Rate limiting
 */
const handler = async (request: NextRequest) => {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar itens da loja
    const { data, error } = await supabase
      .from("points_store_items")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("points_price");

    if (error) {
      console.error("Erro ao buscar itens da loja:", error);
      return NextResponse.json(
        { error: "Erro ao buscar itens" },
        { status: 500 },
      );
    }

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error("Erro na API de itens da loja:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
};

// ⚠️ SEGURANÇA: Rate limiting para prevenir abuse
export const GET = withRateLimit(handler, "API_DEFAULT");
