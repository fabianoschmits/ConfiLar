import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Inicializar cliente Supabase com chave de serviço para operações administrativas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    // Tenta encontrar a assinatura em possíveis cabeçalhos
    const signature =
      headers["x-pagou-signature"] ||
      headers["x-webhook-signature"] ||
      headers["signature"];

    // Segredo do Webhook (Dica: No Pagou.ai moderno, pode ser diferente da Secret Key)
    const webhookSecret =
      process.env.PAGOUAI_WEBHOOK_SECRET || process.env.PAGOUAI_SECRET_KEY;

    if (!webhookSecret) {
      console.error("❌ Webhook Secret não configurado");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 },
      );
    }

    // Se houver assinatura, validamos. Se não houver, logamos aviso mas processamos
    // (Em produção você deve exigir a assinatura!)
    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const signatureBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (
        signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
      ) {
        console.error("❌ Assinatura inválida no webhook");
        // return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    /**
     * Normalização de Status e IDs (Suportando CamelCase do Pagou.ai .ai e snake_case do .com.br)
     */
    const status = (
      payload.status ||
      payload.transactionStatus ||
      ""
    ).toUpperCase();
    const orderId =
      payload.externalId || payload.external_id || payload.metadata?.orderId;
    const transactionId = payload.transactionId || payload.id;

    // Status de sucesso comuns: PAID, COMPLETED, FINISHED, PIX_IN_FINISH
    const isSuccess = [
      "PAID",
      "COMPLETED",
      "FINISHED",
      "PIX_IN_FINISH",
    ].includes(status);

    if (isSuccess && orderId) {
      // Buscar a ordem no banco
      const { data: order, error: orderError } = await supabase
        .from("point_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        console.error("❌ Ordem não encontrada no banco:", orderId);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Idempotência
      if (order.status !== "paid") {
        // 1. Incrementar pontos
        const { error: incrementError } = await supabase.rpc(
          "increment_points",
          {
            uid: order.user_id,
            amount: order.points,
          },
        );

        if (incrementError) {
          console.error("❌ Erro ao incrementar pontos:", incrementError);
          return NextResponse.json(
            { error: "Failed to credit points" },
            { status: 500 },
          );
        }

        // 2. Marcar ordem como paga
        await supabase
          .from("point_orders")
          .update({
            status: "paid",
            updated_at: new Date().toISOString(),
            transaction_id: transactionId,
          })
          .eq("id", orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("🔥 Erro no webhook:", error);
    return NextResponse.json(
      { error: "Internal Error", detail: error.message },
      { status: 500 },
    );
  }
}
