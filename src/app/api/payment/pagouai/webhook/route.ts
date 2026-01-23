import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import crypto from "crypto";

/**
 * POST /api/payment/pagouai/webhook
 *
 * Webhook da Pagou.ai para notificar sobre mudanças no status do pagamento
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-pagou-signature");
    const timestamp = request.headers.get("x-pagou-timestamp");

    // 1. Validar Headers
    if (!signature || !timestamp) {
      console.error("❌ Webhook Pagou.ai: Headers de assinatura ausentes");
      return NextResponse.json(
        { error: "Assinatura ausente" },
        { status: 401 },
      );
    }

    const SECRET_KEY = process.env.PAGOUAI_SECRET_KEY;
    if (!SECRET_KEY) {
      console.error("❌ Webhook Pagou.ai: SECRET_KEY não configurada");
      return NextResponse.json(
        { error: "Erro de configuração" },
        { status: 500 },
      );
    }

    // 2. Validar Assinatura (HMAC-SHA256 de timestamp + rawBody)
    const contentToSign = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(contentToSign)
      .digest("hex");

    // Comparação resistente a timing attack
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (!isValidSignature) {
      console.error("❌ Webhook Pagou.ai: Assinatura inválida");
      return NextResponse.json(
        { error: "Assinatura inválida" },
        { status: 401 },
      );
    }

    // 3. Validar Timestamp (proteção contra replay attacks)
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    const timeDifference = Math.abs(currentTime - webhookTime);

    // Rejeitar se timestamp for mais antigo que 5 minutos (300 segundos)
    if (timeDifference > 300) {
      console.error(
        `❌ Webhook Pagou.ai: Timestamp expirado (diferença: ${timeDifference}s)`,
      );
      return NextResponse.json({ error: "Webhook expirado" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    console.log("📥 Webhook Pagou.ai recebido:", JSON.stringify(body, null, 2));

    const { event_name, data } = body;

    // Só processamos evento de conclusão de QRCode
    if (event_name !== "qrcode.completed") {
      return NextResponse.json({ success: true, message: "Evento ignorado" });
    }

    const paymentId = data.id;
    const paidAmount = data.amount; // Valor pago
    // Tentar pegar o purchase_id do metadata se disponível
    const purchaseId = data.metadata?.find(
      (m: any) => m.key === "purchase_id",
    )?.value;

    const supabase = createAdminSupabaseClient();

    // Buscar compra
    const { data: purchase, error: purchaseError } = await supabase
      .from("points_purchases")
      .select("*")
      .or(
        `payment_id.eq.${paymentId}${purchaseId ? `,id.eq.${purchaseId}` : ""}`,
      )
      .single();

    if (purchaseError || !purchase) {
      console.error("❌ Webhook Pagou.ai: Compra não encontrada:", paymentId);
      return NextResponse.json(
        { error: "Compra não encontrada" },
        { status: 404 },
      );
    }

    // 4. Validar valor pago (segurança crítica)
    if (paidAmount !== purchase.amount_brl) {
      console.error(
        `❌ Webhook Pagou.ai: Valor divergente! Esperado: ${purchase.amount_brl}, Pago: ${paidAmount}`,
      );
      return NextResponse.json({ error: "Valor divergente" }, { status: 400 });
    }

    // Se já aprovado, ignorar
    if (purchase.status === "approved") {
      return NextResponse.json({ success: true, message: "Já processado" });
    }

    // 5. Verificar se pontos já foram creditados (prevenção de duplicação)
    const purchaseDescription = `Compra de pacote - ${purchase.id}`;
    const { data: existingTransaction } = await supabase
      .from("point_transactions")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("source", "purchase")
      .eq("description", purchaseDescription)
      .limit(1)
      .single();

    if (existingTransaction) {
      console.log(
        `⚠️ Webhook Pagou.ai: Pontos já creditados (transação: ${existingTransaction.id})`,
      );

      // Garantir que o status está como aprovado
      await supabase
        .from("points_purchases")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", purchase.id);

      return NextResponse.json({ success: true, message: "Já processado" });
    }

    // Atualizar status da compra
    const { error: updateError } = await supabase
      .from("points_purchases")
      .update({
        status: "approved",
        payment_data: body,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    if (updateError) {
      console.error(
        "❌ Webhook Pagou.ai: Erro ao atualizar compra:",
        updateError,
      );
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }

    // Creditar pontos
    const pointsToAdd = purchase.points_received || 0;

    if (pointsToAdd > 0) {
      const { error: pointsError } = await supabase.rpc("add_points", {
        p_user_id: purchase.user_id,
        p_points: pointsToAdd,
        p_source: "purchase",
        p_description: purchaseDescription,
      });

      if (pointsError) {
        console.error(
          "❌ Webhook Pagou.ai: Erro ao creditar pontos:",
          pointsError,
        );
      } else {
        console.log(
          `✅ Webhook Pagou.ai: ${pointsToAdd} pontos creditados para ${purchase.user_id}`,
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook Pagou.ai: Erro interno:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
