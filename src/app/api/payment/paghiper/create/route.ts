import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createClient } from "@supabase/supabase-js";

const PAGHIPER_API_KEY = process.env.PAGHIPER_API_KEY!;
const PAGHIPER_TOKEN = process.env.PAGHIPER_TOKEN!;
const PAGHIPER_PIX_URL = "https://pix.paghiper.com/invoice/create/";

// Admin client for database operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const body = await request.json();
      const { package_id, customer } = body;

      if (!customer?.cpf || !customer?.name) {
        return NextResponse.json(
          { error: "Dados do pagador (Nome e CPF) são obrigatórios." },
          { status: 400 },
        );
      }

      // 1. Buscar pacote para garantir que existe e pegar valores
      // Table is `points_packages`
      const { data: pack } = await supabaseAdmin
        .from("points_packages")
        .select("*")
        .eq("id", package_id)
        .single();

      if (!pack && !body.amount) {
        return NextResponse.json(
          { error: "Pacote inválido ou valor não informado." },
          { status: 400 },
        );
      }

      // Calculate values
      const amountInCentavos = pack
        ? Math.round(pack.price_brl * 100)
        : Math.round(body.amount * 100);
      const pointsAmount = pack ? pack.points : body.points;
      const phoneClean = customer.phone
        ? customer.phone.replace(/\D/g, "")
        : "";

      // 2. Criar Ordem usando RPC (Padrão do sistema)
      // Isso garante que todas as regras de negócio do banco sejam aplicadas
      // Usando supabaseAdmin para garantir privilégios se necessário
      const { data: orderId, error: rpcError } = await supabaseAdmin.rpc(
        "create_points_purchase",
        {
          p_user_id: user.id,
          p_package_id: package_id,
          p_payment_method: "pix",
        },
      );

      if (rpcError) {
        console.error("Erro ao criar ordem (RPC):", rpcError);
        return NextResponse.json(
          {
            error: `Erro ao criar ordem interna: ${rpcError.message}`,
            details: rpcError,
          },
          { status: 500 },
        );
      }

      if (!orderId) {
        return NextResponse.json(
          { error: "Erro ao obter ID da ordem." },
          { status: 500 },
        );
      }

      // 3. Montar Payload PagHiper
      const paghiperPayload = {
        apiKey: PAGHIPER_API_KEY,
        order_id: orderId, // Usar o ID gerado pelo banco
        payer_email: customer.email,
        payer_name: customer.name,
        payer_cpf_cnpj: customer.cpf.replace(/\D/g, ""),
        payer_phone: phoneClean,
        notification_url: `${request.nextUrl.origin}/api/payment/paghiper/webhook`,
        fixed_description: true,
        shipping_price_cents: 0,
        days_due_date: 0,
        minutes_due_date: 30, // Definir vencimento em 30 minutos
        items: [
          {
            description: `Compra de ${pointsAmount} pontos ConfiLar`,
            quantity: 1,
            item_id: package_id || "custom_points",
            price_cents: amountInCentavos,
          },
        ],
      };

      // 4. Enviar Requisição para PagHiper
      const response = await fetch(PAGHIPER_PIX_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(paghiperPayload),
      });

      const data = await response.json();

      if (data.pix_create_request?.result !== "success") {
        console.error("Erro PagHiper:", data);
        // Cancelar a ordem criada se falhar no PagHiper
        await supabaseAdmin.from("points_purchases").delete().eq("id", orderId);

        return NextResponse.json(
          {
            error:
              data.pix_create_request?.response_message ||
              "Erro ao criar PIX na PagHiper",
          },
          { status: 400 },
        );
      }

      const transactionId = data.pix_create_request.transaction_id;
      const pixCode = data.pix_create_request.pix_code.emv;

      // Handle QR Code URL or Base64
      const pixQrCodeUrl = data.pix_create_request.pix_code.qrcode_image_url;
      const pixQrCodeBase64 = data.pix_create_request.pix_code.qrcode_base64;

      // Prioritizar Base64 se disponível para evitar problemas de CORS ou carregamento externo
      const bestQrCode = pixQrCodeBase64
        ? `data:image/png;base64,${pixQrCodeBase64}`
        : pixQrCodeUrl;

      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      // 5. Atualizar Ordem com ID da transação e metadados
      // Usamos supabaseAdmin para garantir permissão de update
      const { error: updateError } = await supabaseAdmin
        .from("points_purchases")
        .update({
          payment_id: transactionId, // Usar coluna correta payment_id
          payment_url: bestQrCode, // Salvar melhor opção de QR Code
          payment_data: {
            brCode: pixCode,
            brCodeBase64: bestQrCode,
            qrcode_image_url: pixQrCodeUrl,
            qrcode_base64: pixQrCodeBase64,
            transactionId: transactionId,
            expiresAt: expiresAt,
          },
          expires_at: expiresAt,
          metadata: {
            provider: "paghiper",
            phone: phoneClean,
            generated_at: new Date().toISOString(),
          },
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Erro ao atualizar ordem com ID transação:", updateError);
        // Não falhamos o request aqui pois o PIX foi gerado, mas logamos erro crítico
      }

      return NextResponse.json({
        orderId,
        qrCode: pixQrCodeUrl,
        pixCode: pixCode,
        transactionId: transactionId,
        expiresAt: expiresAt,
      });
    } catch (error: any) {
      console.error("Erro interno:", error);
      return NextResponse.json(
        { error: "Erro interno no servidor", detail: error.message },
        { status: 500 },
      );
    }
  },
);
