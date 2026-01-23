import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

/**
 * GET /api/payment/pagouai/check
 *
 * Verifica o status de um pagamento PIX consultando o banco local (point_orders).
 * A atualização do status é feita via Webhook.
 */
export const GET = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const paymentId = searchParams.get("id"); // transaction_id
      const orderId = searchParams.get("purchase_id"); // internal order_id

      if (!paymentId && !orderId) {
        return NextResponse.json(
          { error: "ID do pagamento ou da ordem é obrigatório" },
          { status: 400 },
        );
      }

      // Buscar a ordem no banco
      // Prioridade: buscar por ID interno (purchase_id/orderId)
      let query = supabaseAuth
        .from("point_orders")
        .select("*")
        .eq("user_id", user.id);

      if (orderId) {
        query = query.eq("id", orderId);
      } else if (paymentId) {
        query = query.eq("transaction_id", paymentId);
      }

      const { data: order, error } = await query.single();

      if (error || !order) {
        return NextResponse.json(
          { error: "Ordem não encontrada" },
          { status: 404 },
        );
      }

      // Retornar status normalizado
      let status = "pending";
      if (order.status === "paid") {
        status = "approved";
      } else if (order.status === "expired" || order.status === "failed") {
        status = "cancelled";
      }

      return NextResponse.json({
        success: true,
        status: status,
        paymentStatus: order.status.toUpperCase(), // Para compatibilidade
        orderId: order.id,
        transactionId: order.transaction_id,
      });
    } catch (error) {
      console.error("❌ Erro ao verificar status:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  },
);
