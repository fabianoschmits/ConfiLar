import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createClient } from "@supabase/supabase-js";

// Token fornecido pelo usuário para verificação
const PAGHIPER_TOKEN = process.env.PAGHIPER_TOKEN!;
const PAGHIPER_API_KEY = process.env.PAGHIPER_API_KEY!;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const GET = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const purchaseId = searchParams.get("purchase_id");

      if (!purchaseId) {
        return NextResponse.json(
          { error: "Order ID (purchase_id) required" },
          { status: 400 },
        );
      }

      // 1. Buscar a compra no banco para pegar o transaction_id
      const { data: purchase, error: fetchError } = await supabaseAdmin
        .from("points_purchases")
        .select("*")
        .eq("id", purchaseId)
        .single();

      if (fetchError || !purchase) {
        return NextResponse.json(
          { error: "Compra não encontrada" },
          { status: 404 },
        );
      }

      // Se já estiver aprovada, apenas retornar
      if (purchase.status === "approved") {
        return NextResponse.json({
          status: "approved",
          paymentStatus: "PAID",
        });
      }

      // 2. Se estiver pendente, verificar na PagHiper
      if (purchase.status === "pending" && purchase.payment_id) {
        const statusUrl = "https://pix.paghiper.com/invoice/status/";

        const verifyPayload = {
          token: PAGHIPER_TOKEN,
          apiKey: PAGHIPER_API_KEY,
          transaction_id: purchase.payment_id,
        };

        const response = await fetch(statusUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verifyPayload),
        });

        const data = await response.json();

        if (data.status_request?.result === "success") {
          const pagHiperStatus = data.status_request.status;

          // Extrair dados do PIX se disponíveis para recuperação
          const pixData = data.status_request.pix_code;
          let pixCode = pixData?.emv;
          let qrCode = pixData?.qrcode_image_url || pixData?.qrcode_base64;

          // Se estiver pago na PagHiper mas pendente no nosso banco, aprovar
          if (["paid", "approved", "completed"].includes(pagHiperStatus)) {
            const { error: rpcError } = await supabaseAdmin.rpc(
              "approve_points_purchase",
              {
                p_purchase_id: purchaseId,
              },
            );

            if (!rpcError) {
              return NextResponse.json({
                status: "approved",
                paymentStatus: "PAID",
                updated: true,
                pixCode: pixCode || purchase.payment_data?.brCode,
                qrCode: qrCode || purchase.payment_data?.brCodeBase64,
              });
            } else {
              console.error(
                "Erro ao aprovar via RPC na verificação ativa:",
                rpcError,
              );
            }
          } else if (
            ["canceled", "expired", "disputed"].includes(pagHiperStatus)
          ) {
            // Opcionalmente atualizar para cancelado no banco
            await supabaseAdmin
              .from("points_purchases")
              .update({ status: "cancelled" })
              .eq("id", purchaseId);

            return NextResponse.json({
              status: "cancelled",
              paymentStatus: "CANCELLED",
            });
          }

          // Se ainda pendente, retornar os dados atuais (possivelmente recuperados)
          // Tentar recuperar da PagHiper se não tiver no banco local
          const transactionIdFromDB = purchase.payment_id;
          let currentPixCode = purchase.payment_data?.brCode;
          let currentQrCode = purchase.payment_data?.brCodeBase64;

          if (!currentPixCode || !currentQrCode) {
            console.log(
              `🔍 Recuperando dados do PIX da PagHiper para transação: ${transactionIdFromDB}`,
            );
            const statusResponse = await fetch(
              "https://pix.paghiper.com/invoice/status/",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  apiKey: PAGHIPER_API_KEY,
                  token: PAGHIPER_TOKEN,
                  transaction_id: transactionIdFromDB,
                }),
              },
            );

            const statusData = await statusResponse.json();

            if (
              statusResponse.ok &&
              statusData.status_request?.result === "success"
            ) {
              currentPixCode = statusData.status_request.pix_code.emv;
              currentQrCode = statusData.status_request.pix_code.qrcode_base64
                ? `data:image/png;base64,${statusData.status_request.pix_code.qrcode_base64}`
                : statusData.status_request.pix_code.qrcode_image_url;

              // Opcionalmente atualizar o banco com os dados recuperados
              await supabaseAdmin
                .from("points_purchases")
                .update({
                  payment_url: currentQrCode,
                  payment_data: {
                    ...purchase.payment_data,
                    brCode: currentPixCode,
                    brCodeBase64: currentQrCode,
                  },
                })
                .eq("id", purchaseId);
            }
          }

          return NextResponse.json({
            status: "pending",
            paymentStatus: "PENDING",
            pixCode: currentPixCode,
            qrCode: currentQrCode,
            expiresAt: purchase.expires_at,
          });
        }
      }

      // Retornar status atual (se não mudou ou falhou a consulta externa)
      return NextResponse.json({
        status: purchase.status,
        paymentStatus: purchase.status.toUpperCase(),
        pixCode: purchase.payment_data?.brCode,
        qrCode: purchase.payment_data?.brCodeBase64,
        expiresAt: purchase.expires_at,
      });
    } catch (error: any) {
      console.error("Check Error:", error);
      return NextResponse.json(
        { error: "Erro interno ao verificar status" },
        { status: 500 },
      );
    }
  },
);
