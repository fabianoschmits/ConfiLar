import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/points/balance
 *
 * Retorna o saldo de pontos do usuário autenticado.
 *
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Usa sempre user.id autenticado (ignora qualquer userId na query)
 * - ✅ Mais seguro e simples - não aceita userId como parâmetro
 */
export const GET = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      // ✅ Sempre usar o ID do usuário autenticado (não aceitar da query)
      const authenticatedUserId = user.id;

      console.log(
        "🔍 [Balance API] Buscando saldo para usuário:",
        authenticatedUserId,
      );

      // Usar admin client apenas se necessário para bypass RLS
      // Mas sempre usar authenticatedUserId para garantir segurança
      const supabaseAdmin = createAdminSupabaseClient();
      const { data, error } = await supabaseAdmin
        .from("user_points_balance")
        .select("*")
        .eq("user_id", authenticatedUserId) // 🔒 Sempre ID autenticado
        .single();

      console.log("🔍 [Balance API] Resultado da query:", {
        data,
        error: error?.message,
      });

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          return NextResponse.json({
            data: {
              balance: 0,
              total_earned: 0,
              total_spent: 0,
              available_balance: 0,
              daily_earned: 0,
            },
          });
        }
        // Se a tabela não existir, retornar dados padrão
        if (
          error.code === "PGRST205" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          console.log(
            "Tabela user_points_balance não existe, retornando dados padrão",
          );
          return NextResponse.json({
            data: {
              balance: 0,
              total_earned: 0,
              total_spent: 0,
              available_balance: 0,
              daily_earned: 0,
            },
          });
        }
        console.error("Erro ao buscar saldo de pontos:", error);
        return NextResponse.json(
          { error: "Erro ao buscar saldo" },
          { status: 500 },
        );
      }

      return NextResponse.json({ data });
    } catch (error) {
      console.error("Erro na API de saldo de pontos:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
