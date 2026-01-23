import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

/**
 * GET /api/payment/pagouai/check
 *
 * Verifica o status de um pagamento PIX via Pagou.ai
 */
export const GET = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const paymentId = searchParams.get("id");
      const purchaseId = searchParams.get("purchase_id");

      if (!paymentId && !purchaseId) {
        return NextResponse.json(
          { error: "ID do pagamento ou compra é obrigatório" },
          { status: 400 },
        );
      }

      const PAGOUAI_SECRET_KEY = process.env.PAGOUAI_SECRET_KEY;
      const PAGOUAI_API_URL =
        process.env.PAGOUAI_API_URL || "https://api.pagou.com.br/v1";

      if (!PAGOUAI_SECRET_KEY) {
        return NextResponse.json(
          { error: "Configuração ausente" },
          { status: 500 },
        );
      }

      let activePaymentId = paymentId;
      let purchase = null;

      if (purchaseId) {
        const { data: purchaseData, error: purchaseError } = await supabaseAuth
          .from("points_purchases")
          .select("*")
          .eq("id", purchaseId)
          .eq("user_id", user.id)
          .single();

        if (purchaseError || !purchaseData) {
          return NextResponse.json(
            { error: "Compra não encontrada" },
            { status: 404 },
          );
        }

        purchase = purchaseData;
        activePaymentId = purchase.payment_id || paymentId;
      }

      if (!activePaymentId) {
        return NextResponse.json(
          { error: "Pagamento não encontrado" },
          { status: 404 },
        );
      }

      const response = await fetch(
        `${PAGOUAI_API_URL}/pix/${activePaymentId}`,
        {
          method: "GET",
          headers: {
            "X-API-KEY": PAGOUAI_SECRET_KEY,
            Accept: "application/json",
          },
        },
      );

      const pagouData = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: pagouData.message || "Erro ao consultar" },
          { status: response.status },
        );
      }

      // Status na Pagou.ai (conforme doc: StatusCompleted para pago)
      const status = pagouData.status;
      let mappedStatus = "pending";

      if (status === "StatusCompleted") {
        mappedStatus = "approved";
      } else if (status === "StatusCanceled") {
        mappedStatus = "cancelled";
      } else if (status === "StatusRefunded") {
        mappedStatus = "refunded";
      }

      // Se aprovado e temos a compra, creditar os pontos
      if (
        mappedStatus === "approved" &&
        purchase &&
        purchase.status !== "approved"
      ) {
        // Validar valor pago
        if (pagouData.amount !== purchase.amount_brl) {
          console.error(
            `❌ Check Pagou.ai: Valor divergente! Esperado: ${purchase.amount_brl}, Pago: ${pagouData.amount}`,
          );
          return NextResponse.json(
            { error: "Valor divergente detectado" },
            { status: 400 },
          );
        }

        // Verificar se pontos já foram creditados
        const purchaseDescription = `Compra de pacote - ${purchase.id}`;
        const { data: existingTransaction } = await supabaseAuth
          .from("point_transactions")
          .select("id")
          .eq("user_id", user.id)
          .eq("source", "purchase")
          .eq("description", purchaseDescription)
          .limit(1)
          .single();

        if (!existingTransaction) {
          // Creditar pontos
          const pointsToAdd = purchase.points_received || 0;

          if (pointsToAdd > 0) {
            const { error: pointsError } = await supabaseAuth.rpc(
              "add_points",
              {
                p_user_id: user.id,
                p_points: pointsToAdd,
                p_source: "purchase",
                p_description: purchaseDescription,
              },
            );

            if (pointsError) {
              console.error(
                "❌ Check Pagou.ai: Erro ao creditar pontos:",
                pointsError,
              );
            } else {
              console.log(
                `✅ Check Pagou.ai: ${pointsToAdd} pontos creditados para ${user.id}`,
              );
            }
          }
        }

        // Atualizar status da compra
        await supabaseAuth
          .from("points_purchases")
          .update({
            status: "approved",
            payment_data: pagouData,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", purchase.id);
      }

      return NextResponse.json({
        success: true,
        status: mappedStatus,
        rawStatus: status,
        data: pagouData,
      });
    } catch (error) {
      console.error("❌ Erro ao verificar pagamento:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  },
);
