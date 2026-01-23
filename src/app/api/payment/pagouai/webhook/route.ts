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
    const signature = request.headers.get("x-pagou-signature");

    // Fallback: usar a SECRET_KEY se a WEBHOOK_SECRET não estiver definida
    const webhookSecret =
      process.env.PAGOUAI_WEBHOOK_SECRET || process.env.PAGOUAI_SECRET_KEY;

    if (!webhookSecret) {
      console.error("❌ Webhook Secret não configurado");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 },
      );
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Validar assinatura HMAC-SHA256
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    // Comparação segura
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    const isValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      console.error("❌ Assinatura inválida no webhook");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log("🔔 Webhook recebido:", event);

    // Verificar status
    const status = event.status?.toUpperCase();

    if (status === "PAID" || status === "COMPLETED") {
      const orderId = event.external_id;

      if (!orderId) {
        console.warn("⚠️ Webhook sem external_id, ignorando");
        return NextResponse.json({ received: true });
      }

      // Buscar a ordem no banco
      const { data: order, error: orderError } = await supabase
        .from("point_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        console.error("❌ Ordem não encontrada:", orderId);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Idempotência
      if (order.status !== "paid") {
        console.log(`✅ Aprovando ordem ${orderId} para user ${order.user_id}`);

        // 1. Incrementar pontos do usuário via RPC
        const { error: incrementError } = await supabase.rpc(
          "increment_points",
          {
            uid: order.user_id,
            amount: order.points,
          },
        );

        if (incrementError) {
          console.error("❌ Erro ao incrementar pontos:", incrementError);
        } else {
          // 2. Marcar ordem como paga
          await supabase
            .from("point_orders")
            .update({
              status: "paid",
              updated_at: new Date().toISOString(),
              transaction_id: event.id,
            })
            .eq("id", orderId);

          console.log("🎉 Pontos creditados e ordem atualizada!");
        }
      } else {
        console.log("ℹ️ Ordem já processada anteriormente");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
