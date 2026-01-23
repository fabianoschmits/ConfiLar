import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

/**
 * POST /api/payment/pagouai/create
 *
 * Cria um pagamento PIX via nova API Pagou.ai (Skeleton)
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const body = await request.json();
      const { package_id } = body;

      // 1. Buscar pacote no banco
      const { data: pack } = await supabaseAuth
        .from("point_packages")
        .select("*")
        .eq("id", package_id)
        .single();

      if (!pack) {
        // Fallback para pacotes hardcoded se a tabela estiver vazia ou ID não bater
        // Isso garante compatibilidade com o front antigo se os IDs não baterem
        console.warn(
          "Pacote não encontrado no banco, usando valores do request se disponíveis",
        );
        if (!body.amount || !body.points) {
          return NextResponse.json(
            { error: "Pacote inválido" },
            { status: 400 },
          );
        }
      }

      const amountInCentavos = pack
        ? pack.price
        : Math.round(body.amount * 100);
      const pointsAmount = pack ? pack.points : body.points;

      // 2. Criar Ordem Interna
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

      // 3. Chamar API Pagou.ai (Skeleton)
      console.log("🚀 Enviando para api.pagou.ai:", {
        amount: amountInCentavos,
        external_id: orderId,
      });

      const response = await fetch(
        `${process.env.PAGOUAI_API_URL}/pix/cash-in`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PAGOUAI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInCentavos, // em centavos
            description: `Compra de ${pointsAmount} pontos ConfiLar`,
            external_id: orderId, // ID interno
            expires_in: 3600,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Erro Pagou.ai:", data);
        return NextResponse.json({ error: data }, { status: 400 });
      }

      // 4. Atualizar Ordem com ID da transação
      await supabaseAuth
        .from("point_orders")
        .update({ transaction_id: data.id })
        .eq("id", orderId);

      // 5. Retornar dados para o Front
      return NextResponse.json({
        orderId,
        qrCode: data.qr_code_base64,
        pixCode: data.pix_code,
        transactionId: data.id,
      });
    } catch (error) {
      console.error("❌ Erro interno:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  },
);
