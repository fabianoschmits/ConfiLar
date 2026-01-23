import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

/**
 * POST /api/payment/pagouai/create
 *
 * Cria um pagamento PIX via Pagou.ai e retorna o QR Code
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const body = await request.json();
      const { package_id, amount, points, bonus, customer } = body;

      // Validar dados obrigatórios
      if (!package_id || !amount || !points || !customer) {
        return NextResponse.json(
          { error: "Dados incompletos" },
          { status: 400 },
        );
      }

      // Validar dados do cliente
      if (!customer.name || !customer.cpf) {
        return NextResponse.json(
          { error: "Dados do cliente (nome e CPF) são obrigatórios" },
          { status: 400 },
        );
      }

      const PAGOUAI_SECRET_KEY = process.env.PAGOUAI_SECRET_KEY;
      const PAGOUAI_API_URL =
        process.env.PAGOUAI_API_URL || "https://api.pagou.com.br/v1";

      if (!PAGOUAI_SECRET_KEY) {
        console.error("❌ PAGOUAI_SECRET_KEY não configurada");
        return NextResponse.json(
          { error: "Configuração de pagamento não disponível" },
          { status: 500 },
        );
      }

      // Criar registro de compra no banco
      const totalPoints = points + (bonus || 0);
      const packageMetadata = {
        package_id,
        points,
        bonus: bonus || 0,
        total_points: totalPoints,
        amount,
        gateway: "pagouai",
      };

      const { data: purchase, error: purchaseError } = await supabaseAuth
        .from("points_purchases")
        .insert({
          user_id: user.id,
          package_id: null,
          amount_brl: amount,
          points_received: totalPoints,
          payment_method: "pix",
          status: "pending",
          metadata: packageMetadata,
          customer_data: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            cpf: customer.cpf,
            address: customer.address,
          },
        })
        .select()
        .single();

      if (purchaseError) {
        console.error("❌ Erro ao criar compra no banco:", purchaseError);
        return NextResponse.json(
          { error: "Erro ao processar pedido" },
          { status: 500 },
        );
      }

      // Preparar dados para Pagou.ai
      // A API espera o valor como float/number em reais, conforme doc
      const paymentData = {
        amount: amount,
        customer_code: user.id,
        description: `Compra de ${totalPoints} ConfiPoints - Pacote ${package_id}`,
        payer: {
          document: customer.cpf.replace(/\D/g, ""),
          name: customer.name,
        },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/pagouai/webhook`,
        metadata: [
          { key: "purchase_id", value: purchase.id },
          { key: "user_id", value: user.id },
        ],
      };

      // Chamar API da Pagou.ai
      const response = await fetch(`${PAGOUAI_API_URL}/pix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-API-KEY": PAGOUAI_SECRET_KEY,
        },
        body: JSON.stringify(paymentData),
      });

      const pagouData = await response.json();

      if (!response.ok) {
        console.error("❌ Erro na API Pagou.ai:", pagouData);

        await supabaseAuth
          .from("points_purchases")
          .update({
            status: "rejected",
            payment_error: pagouData.message || "Erro no gateway",
          })
          .eq("id", purchase.id);

        return NextResponse.json(
          { error: pagouData.message || "Erro ao processar pagamento" },
          { status: response.status },
        );
      }

      // Atualizar compra com ID da Pagou.ai
      // pagouData deve conter os campos conforme a doc (qrcode, etc)
      await supabaseAuth
        .from("points_purchases")
        .update({
          payment_id: pagouData.id,
          payment_url: pagouData.qrcode, // Geralmente o código copia e cola
          payment_data: pagouData,
        })
        .eq("id", purchase.id);

      return NextResponse.json({
        success: true,
        paymentId: pagouData.id,
        qrCode: pagouData.qrcode,
        qrCodeImage: pagouData.qrcode_base64 || pagouData.qrcode, // Depende do que a API retorna
        paymentUrl: pagouData.qrcode,
        expiresAt: pagouData.expiration_date,
        purchaseId: purchase.id,
      });
    } catch (error) {
      console.error("❌ Erro no servidor ao criar pagamento:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  },
);
