import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

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

      // Buscar item
      const { data: item, error: itemError } = await supabaseAuth
        .from("points_store_items")
        .select("*")
        .eq("id", item_id)
        .eq("is_active", true)
        .single();

      if (itemError || !item) {
        return NextResponse.json(
          { error: "Item não encontrado" },
          { status: 404 },
        );
      }

      // Verificar saldo do usuário autenticado
      const { data: profile } = await supabaseAuth
        .from("profiles")
        .select("points_balance")
        .eq("id", user.id) // 🔒 Sempre ID autenticado
        .single();

      if (!profile || profile.points_balance < item.points_price) {
        return NextResponse.json(
          { error: "Saldo insuficiente" },
          { status: 400 },
        );
      }

      // Criar compra na loja para o usuário autenticado
      const { data: purchase, error: purchaseError } = await supabaseAuth
        .from("points_store_purchases")
        .insert({
          user_id: user.id, // 🔒 Sempre ID autenticado
          item_id: item_id,
          points_spent: item.points_price,
          expires_at: item.duration_days
            ? new Date(
                Date.now() + item.duration_days * 24 * 60 * 60 * 1000,
              ).toISOString()
            : null,
        })
        .select(
          `
        *,
        item:points_store_items(*)
      `,
        )
        .single();

      if (purchaseError) {
        console.error("Erro ao criar compra na loja:", purchaseError);
        return NextResponse.json(
          { error: "Erro ao processar compra" },
          { status: 500 },
        );
      }

      // Remover pontos do usuário autenticado (usar deduct_points ao invés de add_points negativo)
      await supabaseAuth.rpc("deduct_points", {
        p_user_id: user.id, // 🔒 Sempre ID autenticado
        p_points: item.points_price,
        p_source: "store_purchase",
        p_description: `Comprou: ${item.name}`,
      });

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
