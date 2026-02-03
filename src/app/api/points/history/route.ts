import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

/**
 * GET /api/points/history
 *
 * Retorna o histórico de transações de pontos do usuário autenticado.
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

      const { searchParams } = new URL(request.url);

      // Parse dos query parameters
      const type = searchParams.get("type");
      const source = searchParams.get("source");
      const startDate = searchParams.get("start_date");
      const endDate = searchParams.get("end_date");
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Construir query - usando sempre o ID do usuário autenticado
      let query = supabaseAuth
        .from("point_transactions")
        .select("*")
        .eq("user_id", authenticatedUserId) // 🔒 Sempre ID autenticado
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (type) {
        query = query.eq("type", type);
      }

      if (source) {
        query = query.eq("source", source);
      }

      if (startDate) {
        query = query.gte("created_at", startDate);
      }

      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      // Aplicar paginação
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar histórico de pontos:", error);
        // Se a tabela não existir, retornar array vazio
        if (
          error.code === "PGRST205" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          return NextResponse.json({
            transactions: [],
            pagination: {
              limit,
              offset,
              has_more: false,
            },
          });
        }
        return NextResponse.json(
          { error: "Erro ao buscar histórico" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        transactions: data || [],
        pagination: {
          limit,
          offset,
          has_more: (data?.length || 0) === limit,
        },
      });
    } catch (error) {
      console.error("Erro na API de histórico de pontos:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
