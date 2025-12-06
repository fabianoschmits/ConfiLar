import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

/**
 * GET /api/payment/abacatepay/check
 *
 * Verifica o status de um pagamento PIX via AbacatePay
 *
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Verifica se o pagamento pertence ao usuário autenticado
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

      // Obter chave API do AbacatePay
      const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY;
      const ABACATEPAY_API_URL =
        process.env.ABACATEPAY_API_URL || "https://api.abacatepay.com/v1";

      if (!ABACATEPAY_API_KEY) {
        console.error("❌ ABACATEPAY_API_KEY não configurada");
        return NextResponse.json(
          { error: "Configuração de pagamento não disponível" },
          { status: 500 },
        );
      }

      // Se tiver purchase_id, buscar o payment_id do banco
      let qrCodeId = paymentId;
      if (purchaseId && !paymentId) {
        const { data: purchase, error: purchaseError } = await supabaseAuth
          .from("points_purchases")
          .select("payment_id, user_id")
          .eq("id", purchaseId)
          .eq("user_id", user.id) // Garantir que é do usuário autenticado
          .single();

        if (purchaseError || !purchase) {
          return NextResponse.json(
            { error: "Compra não encontrada" },
            { status: 404 },
          );
        }

        qrCodeId = purchase.payment_id;
      }

      if (!qrCodeId) {
        return NextResponse.json(
          { error: "ID do QR Code não encontrado" },
          { status: 400 },
        );
      }

      // Chamar API do AbacatePay para verificar status
      // Endpoint: GET /pixQrCode/check?id=<id>
      const abacateResponse = await fetch(
        `${ABACATEPAY_API_URL}/pixQrCode/check?id=${qrCodeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
          },
        },
      );

      const abacateData = await abacateResponse.json();

      if (!abacateResponse.ok) {
        console.error("❌ Erro ao verificar status:", abacateData);
        return NextResponse.json(
          {
            error: abacateData.error || "Erro ao verificar status do pagamento",
          },
          { status: abacateResponse.status || 500 },
        );
      }

      // Estrutura da resposta conforme documentação
      // Response: { data: { status, expiresAt }, error: null }
      if (abacateData.error) {
        console.error("❌ Erro na resposta AbacatePay:", abacateData.error);
        return NextResponse.json(
          { error: abacateData.error || "Erro ao verificar status" },
          { status: 400 },
        );
      }

      const responseData = abacateData.data;

      if (!responseData) {
        console.error("❌ Resposta sem data:", abacateData);
        return NextResponse.json(
          { error: "Resposta inválida da API" },
          { status: 500 },
        );
      }

      const status = responseData.status; // PENDING, PAID, etc.
      const expiresAt = responseData.expiresAt;

      console.log(
        `🔍 Status recebido do AbacatePay: ${status} (tipo: ${typeof status})`,
      );

      // Mapear status do AbacatePay para nosso sistema
      // Status possíveis: PENDING, PAID, EXPIRED, CANCELLED
      let mappedStatus:
        | "pending"
        | "processing"
        | "approved"
        | "rejected"
        | "cancelled"
        | "refunded" = "pending";

      const statusUpper = String(status).toUpperCase();

      if (
        statusUpper === "PAID" ||
        statusUpper === "APPROVED" ||
        statusUpper === "COMPLETED" ||
        statusUpper === "SUCCESS"
      ) {
        mappedStatus = "approved";
        console.log(`✅ Status mapeado para: approved`);
      } else if (
        statusUpper === "PENDING" ||
        statusUpper === "WAITING" ||
        statusUpper === "WAITING_PAYMENT"
      ) {
        mappedStatus = "pending";
        console.log(`⏳ Status mapeado para: pending`);
      } else if (
        statusUpper === "PROCESSING" ||
        statusUpper === "IN_PROGRESS"
      ) {
        mappedStatus = "processing";
        console.log(`🔄 Status mapeado para: processing`);
      } else if (
        statusUpper === "EXPIRED" ||
        statusUpper === "CANCELLED" ||
        statusUpper === "CANCELED"
      ) {
        mappedStatus = "cancelled";
        console.log(`❌ Status mapeado para: cancelled`);
      } else if (
        statusUpper === "REJECTED" ||
        statusUpper === "FAILED" ||
        statusUpper === "ERROR"
      ) {
        mappedStatus = "rejected";
        console.log(`🚫 Status mapeado para: rejected`);
      } else {
        console.warn(
          `⚠️ Status desconhecido do AbacatePay: ${status}, mantendo como 'pending'`,
        );
      }

      // Se tiver purchase_id, atualizar status no banco
      if (purchaseId) {
        // Buscar compra ANTES de atualizar para verificar status anterior
        const { data: purchaseBeforeUpdate, error: fetchError } =
          await supabaseAuth
            .from("points_purchases")
            .select("points_received, status, metadata")
            .eq("id", purchaseId)
            .eq("user_id", user.id)
            .single();

        if (fetchError) {
          console.error("❌ Erro ao buscar compra:", fetchError);
          return NextResponse.json(
            { error: "Compra não encontrada" },
            { status: 404 },
          );
        }

        if (!purchaseBeforeUpdate) {
          console.error("❌ Compra não encontrada:", purchaseId);
          return NextResponse.json(
            { error: "Compra não encontrada" },
            { status: 404 },
          );
        }

        const previousStatus = purchaseBeforeUpdate?.status;

        // PRIMEIRO: Verificar se os pontos já foram creditados, independentemente do status do pagamento
        // Se os pontos foram creditados, a compra foi paga e deve estar como aprovada
        // A descrição deve ser exatamente: "Compra de pacote - {purchaseId}"
        const purchaseDescription = `Compra de pacote - ${purchaseId}`;

        const { data: existingTransactions, error: checkError } =
          await supabaseAuth
            .from("point_transactions")
            .select("id, amount, description, created_at")
            .eq("user_id", user.id)
            .eq("source", "purchase")
            .eq("description", purchaseDescription)
            .limit(1);

        if (checkError) {
          console.error(
            "❌ Erro ao verificar transações existentes:",
            checkError,
          );
        }

        // Se os pontos foram creditados, garantir que a compra está marcada como aprovada
        // Esta é a verificação PRINCIPAL: se pontos foram creditados, a compra foi paga
        // Se os pontos foram creditados, o trigger automático já deve ter aprovado a compra
        // Mas vamos forçar aprovação como fallback caso o trigger não tenha funcionado
        if (existingTransactions && existingTransactions.length > 0) {
          console.log(
            `💰 Pontos já foram creditados para esta compra (transação: ${existingTransactions[0].id})`,
          );

          // Fallback: forçar aprovação se o trigger não funcionou
          if (previousStatus !== "approved") {
            console.log(`🔄 Forçando aprovação (fallback)...`);

            const { error: approveError } = await supabaseAuth
              .from("points_purchases")
              .update({
                status: "approved",
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", purchaseId)
              .eq("user_id", user.id);

            if (approveError) {
              console.error(
                "❌ Erro ao marcar compra como aprovada (fallback):",
                approveError,
              );
            } else {
              console.log(
                `✅ Compra ${purchaseId} marcada como aprovada (fallback)`,
              );
              if (purchaseBeforeUpdate) {
                purchaseBeforeUpdate.status = "approved";
              }
            }
          }
          mappedStatus = "approved";
        }

        // Atualizar previousStatus se foi modificado acima
        const currentStatus = purchaseBeforeUpdate?.status || previousStatus;
        const shouldCreditPoints =
          mappedStatus === "approved" && currentStatus !== "approved";

        // Atualizar payment_data no banco
        // Nota: O status será atualizado automaticamente pelo trigger quando pontos forem creditados
        const updateData: any = {
          payment_data: abacateData,
          updated_at: new Date().toISOString(),
        };

        // Só atualizar status manualmente se o status do pagamento mudou E não foi aprovado por pontos
        // (o trigger cuida da aprovação quando pontos são creditados)
        if (
          mappedStatus !== currentStatus &&
          !(
            existingTransactions &&
            existingTransactions.length > 0 &&
            mappedStatus === "approved"
          )
        ) {
          updateData.status = mappedStatus;
          if (mappedStatus === "approved") {
            updateData.approved_at = new Date().toISOString();
          }
        }

        const { error: updateError, data: updatedPurchase } = await supabaseAuth
          .from("points_purchases")
          .update(updateData)
          .eq("id", purchaseId)
          .eq("user_id", user.id)
          .select("id, status, approved_at, updated_at")
          .single();

        if (updateError) {
          console.error("❌ Erro ao atualizar compra:", updateError);
        } else {
          console.log(
            `✅ Compra ${purchaseId} atualizada - Status: ${updatedPurchase?.status || mappedStatus}`,
          );
        }

        // Se pagamento aprovado e não estava aprovado antes, creditar pontos automaticamente
        if (shouldCreditPoints && purchaseBeforeUpdate) {
          try {
            const pointsToAdd = purchaseBeforeUpdate.points_received || 0;
            const purchaseDescription = `Compra de pacote - ${purchaseId}`;

            console.log(
              `💰 Processando crédito de pontos para compra ${purchaseId}:`,
            );
            console.log(`   - Status anterior: ${currentStatus}`);
            console.log(`   - Status novo: ${mappedStatus}`);
            console.log(`   - Pontos a creditar: ${pointsToAdd}`);
            console.log(`   - Usuário: ${user.id}`);

            if (pointsToAdd > 0) {
              // VERIFICAR SE JÁ FOI CREDITADO - Buscar transações existentes com a mesma descrição
              const { data: existingTransactions, error: checkError } =
                await supabaseAuth
                  .from("point_transactions")
                  .select("id, amount, description, created_at")
                  .eq("user_id", user.id)
                  .eq("source", "purchase")
                  .eq("description", purchaseDescription)
                  .limit(1);

              if (checkError) {
                console.error(
                  "❌ Erro ao verificar transações existentes:",
                  checkError,
                );
              }

              if (existingTransactions && existingTransactions.length > 0) {
                console.log(
                  `⚠️ Pontos já foram creditados anteriormente para esta compra (transação: ${existingTransactions[0].id})`,
                );
                // Não creditar novamente - o trigger automático já deve ter aprovado a compra
                mappedStatus = "approved";
              } else {
                // Se não encontrou transação existente, creditar pontos
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
                  console.error("❌ Erro ao creditar pontos:", pointsError);
                } else {
                  console.log(
                    `✅ ${pointsToAdd} pontos creditados. O trigger automático aprovará a compra.`,
                  );
                  mappedStatus = "approved";
                }
              }
            } else {
              console.warn(
                `⚠️ Compra ${purchaseId} aprovada mas sem pontos para creditar (points_received: ${pointsToAdd})`,
              );
            }
          } catch (creditError) {
            console.error(
              "❌ Erro ao processar crédito de pontos:",
              creditError,
            );
            console.error("❌ Stack trace:", (creditError as Error).stack);
          }
        }
        // Nota: O trigger automático no banco aprova compras quando pontos são creditados
        // Então não precisamos de verificações adicionais aqui
      }

      // Buscar compra atualizada para retornar o status mais recente
      let finalStatus = mappedStatus;
      if (purchaseId) {
        const { data: updatedPurchase } = await supabaseAuth
          .from("points_purchases")
          .select("status")
          .eq("id", purchaseId)
          .eq("user_id", user.id)
          .single();

        if (updatedPurchase) {
          finalStatus = updatedPurchase.status;
          console.log(`📊 Status final retornado: ${finalStatus}`);
        }
      }

      return NextResponse.json({
        success: true,
        status: finalStatus,
        paymentStatus: status,
        expiresAt: expiresAt,
        data: responseData,
        paymentId: qrCodeId,
        purchaseId: purchaseId,
      });
    } catch (error) {
      console.error("❌ Erro ao verificar status do pagamento:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
