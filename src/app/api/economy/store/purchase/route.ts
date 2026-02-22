import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/economy/store/purchase
 *
 * Realiza uma compra de item da loja usando pontos do usuário autenticado.
 *
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Sempre compra usando pontos do usuário autenticado (user.id)
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      // Parse do body
      const body = await request.json();
      const { item_id } = body;

      // Validar dados
      if (!item_id) {
        return NextResponse.json(
          { error: "ID do item é obrigatório" },
          { status: 400 },
        );
      }

      // Utilizar a RPC segura e atômica para efetuar a compra (Admin Client para bypass REVOKE)
      const supabaseAdmin = createAdminSupabaseClient();
      const { data: purchaseId, error: rpcError } = await supabaseAdmin.rpc(
        "purchase_store_item",
        {
          p_user_id: user.id, // 🔒 Sempre ID autenticado
          p_item_id: item_id,
        },
      );

      if (rpcError) {
        console.error("Erro ao comprar item na loja (RPC):", rpcError);
        return NextResponse.json(
          {
            error:
              rpcError.message ||
              "Erro ao processar compra. Verifique seu saldo.",
          },
          { status: 400 },
        );
      }

      // Buscar os detalhes da compra recém-criada para retornar ao cliente
      const { data: purchase, error: purchaseError } = await supabaseAuth
        .from("points_store_purchases")
        .select(
          `
        *,
        item:points_store_items(*)
      `,
        )
        .eq("id", purchaseId)
        .single();

      if (purchaseError) {
        console.error(
          "Erro ao buscar detalhes da compra efetuada:",
          purchaseError,
        );
        // Mesmo falhando o fetch, a compra funcionou no banco
      }

      return NextResponse.json({
        success: true,
        purchase,
        message: "Item comprado com sucesso!",
      });
    } catch (error) {
      console.error("Erro na API de compra na loja:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
