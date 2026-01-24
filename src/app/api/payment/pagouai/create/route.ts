import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

/**
 * POST /api/payment/pagouai/create
 *
 * Cria um pagamento PIX via API Pagou.ai (Plataforma Nova/AI - Full Spec)
 * Doc: https://developer.pagou.ai/api-reference/pagamentos/criar-pagamento
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const body = await request.json();
      const { package_id, customer } = body;

      // 1. Validar CPF e Nome do pagador
      if (!customer?.cpf || !customer?.name) {
        return NextResponse.json(
          { error: "Dados do pagador (Nome e CPF) são obrigatórios para PIX." },
          { status: 400 },
        );
      }

      // 2. Buscar pacote
      const { data: pack } = await supabaseAuth
        .from("point_packages")
        .select("*")
        .eq("id", package_id)
        .single();

      if (!pack) {
        if (!body.amount) {
          return NextResponse.json(
            { error: "Pacote inválido" },
            { status: 400 },
          );
        }
      }

      // Normalizar valores
      const amountInCentavos = pack
        ? pack.price
        : Math.round(body.amount * 100);
      const pointsAmount = pack ? pack.points : body.points;
      const amountInReais = amountInCentavos / 100;

      // 3. Criar Ordem Interna
      const orderId = crypto.randomUUID();
      const { error: orderError } = await supabaseAuth
        .from("point_orders")
        .insert({
          id: orderId,
          user_id: user.id,
          points: pointsAmount,
          price: amountInCentavos,
          status: "pending",
        });

      if (orderError) {
        console.error("Erro ao criar ordem:", orderError);
        return NextResponse.json(
          { error: "Erro ao criar ordem" },
          { status: 500 },
        );
      }

      // 4. Montar Payload conforme developer.pagou.ai (Full Detail)
      // Nota: A doc usa o termo "neighboor" (com dois 'o')
      const pagouPayload = {
        type: "PIX",
        transaction: {
          value: amountInReais,
          description: `Compra de ${pointsAmount} pontos ConfiLar`,
          expirationTime: 3600,
          externalId: orderId,
          dueDate: new Date().toISOString().split("T")[0],
        },
        payer: {
          fullName: customer.name,
          document: customer.cpf.replace(/\D/g, ""),
          contact: {
            // Formato exigido na doc: +55DDDNNNNNNNN
            phone: customer.phone
              ? `+55${customer.phone.replace(/\D/g, "")}`
              : "",
            mail: customer.email || "",
          },
          address: {
            zipCode:
              customer.address?.zipCode?.replace(/\D/g, "") || "00000000",
            street: customer.address?.street || "",
            neighboor: customer.address?.neighborhood || "",
            number: customer.address?.number || "S/N",
            city: customer.address?.city || "",
            state: customer.address?.state || "",
            country: "BR",
          },
        },
      };

      console.log(
        "🚀 Payload Pagou.ai (Full Spec):",
        JSON.stringify(pagouPayload, null, 2),
      );

      // 5. Enviar Requisição
      const pagouUrl = `https://api.pagou.ai/pix/v1/payment`;

      const response = await fetch(pagouUrl, {
        method: "POST",
        headers: {
          apiKey: process.env.PAGOUAI_SECRET_KEY!, // Header exato da doc
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pagouPayload),
      });

      const text = await response.text();
      console.log(`🧾 Status: ${response.status} | Resposta:`, text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: "Erro de comunicação com Gateway", details: text },
          { status: 502 },
        );
      }

      if (!response.ok) {
        console.error(
          "❌ Erro Completo Pagou.ai:",
          JSON.stringify(data, null, 2),
        );
        const errorMessage = data.message || data.error || JSON.stringify(data);
        const userMessage =
          response.status === 403
            ? "Chave de API inválida ou conta não autorizada. Verifique no painel da Pagou.ai."
            : errorMessage;

        return NextResponse.json(
          { error: userMessage, details: data },
          { status: response.status },
        );
      }

      // 6. Sucesso - Resposta: { transactionId, status, pixQrCode, pixCode, ... }
      const transactionId = data.transactionId;
      const pixCode = data.pixCode;
      const pixQrCodeBase64 = data.pixQrCode;

      if (!transactionId || !pixCode) {
        console.error("❌ Resposta incompleta:", data);
        return NextResponse.json(
          { error: "QR Code não retornado pelo gateway" },
          { status: 502 },
        );
      }

      // 7. Atualizar Ordem
      await supabaseAuth
        .from("point_orders")
        .update({ transaction_id: transactionId })
        .eq("id", orderId);

      return NextResponse.json({
        orderId,
        qrCode: pixQrCodeBase64,
        pixCode: pixCode,
        transactionId: transactionId,
        expiresAt:
          data.expirationDate ||
          new Date(Date.now() + 3600 * 1000).toISOString(),
      });
    } catch (error: any) {
      console.error("🔥 Erro interno:", error);
      return NextResponse.json(
        { error: "Erro interno no servidor", detail: error.message },
        { status: 500 },
      );
    }
  },
);
