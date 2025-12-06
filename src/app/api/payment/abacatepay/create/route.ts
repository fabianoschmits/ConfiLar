import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

/**
 * POST /api/payment/abacatepay/create
 *
 * Cria um pagamento PIX via AbacatePay e retorna o QR Code
 *
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Valida dados do cliente
 * - ✅ Cria registro de compra no banco
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
      if (
        !customer.name ||
        !customer.email ||
        !customer.phone ||
        !customer.cpf
      ) {
        return NextResponse.json(
          { error: "Dados do cliente incompletos" },
          { status: 400 },
        );
      }

      // Validar endereço
      if (
        !customer.address ||
        !customer.address.street ||
        !customer.address.number ||
        !customer.address.neighborhood ||
        !customer.address.city ||
        !customer.address.state ||
        !customer.address.zipCode
      ) {
        return NextResponse.json(
          { error: "Endereço incompleto" },
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

      // Criar registro de compra no banco primeiro
      // Estrutura da tabela: id, user_id, package_id, amount_brl, points_received, payment_method, status, created_at
      const totalPoints = points + (bonus || 0);

      // Salvar dados do pacote no metadata para poder verificar depois
      const packageMetadata = {
        package_id: package_id,
        package_name: `Pacote ${package_id}`,
        points: points,
        bonus: bonus || 0,
        total_points: totalPoints,
        amount: amount,
      };

      const { data: purchase, error: purchaseError } = await supabaseAuth
        .from("points_purchases")
        .insert({
          user_id: user.id,
          package_id: null, // Pacotes hardcoded não têm ID no banco
          amount_brl: amount, // Valor em BRL
          points_received: totalPoints, // Total de pontos (incluindo bônus)
          payment_method: "pix",
          status: "pending",
          metadata: packageMetadata, // Salvar dados do pacote no metadata
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
        console.error("❌ Erro ao criar compra:", purchaseError);
        console.error(
          "❌ Detalhes do erro:",
          JSON.stringify(purchaseError, null, 2),
        );
        return NextResponse.json(
          {
            error: `Erro ao criar registro de compra: ${purchaseError.message || "Erro desconhecido"}`,
          },
          { status: 500 },
        );
      }

      // Preparar dados para AbacatePay (baseado na documentação oficial)
      // Valor em centavos
      const amountInCents = Math.round(amount * 100);

      // Tempo de expiração: 30 minutos (1800 segundos)
      const expiresIn = 30 * 60;

      // Formatar telefone para o formato esperado: (11) 4002-8922
      const formatPhone = (phone: string) => {
        const numbers = phone.replace(/\D/g, "");
        if (numbers.length === 11) {
          return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
        } else if (numbers.length === 10) {
          return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
        }
        return phone;
      };

      // Formatar CPF: 123.456.789-01
      const formatCPF = (cpf: string) => {
        const numbers = cpf.replace(/\D/g, "");
        if (numbers.length === 11) {
          return `${numbers.substring(0, 3)}.${numbers.substring(3, 6)}.${numbers.substring(6, 9)}-${numbers.substring(9)}`;
        }
        return cpf;
      };

      const paymentData = {
        amount: amountInCents,
        expiresIn: expiresIn,
        description:
          `Compra de ${points} ConfiPoints - Pacote ${package_id}`.substring(
            0,
            140,
          ),
        customer: {
          name: customer.name,
          cellphone: formatPhone(customer.phone),
          email: customer.email,
          taxId: formatCPF(customer.cpf),
        },
        metadata: {
          purchase_id: purchase.id,
          user_id: user.id,
          package_id: package_id,
          points: points,
          bonus: bonus || 0,
          externalId: `confipoints-${package_id}-${purchase.id}`,
        },
      };

      // Chamar API do AbacatePay para criar QR Code PIX
      // Endpoint: POST /pixQrCode/create
      const abacateResponse = await fetch(
        `${ABACATEPAY_API_URL}/pixQrCode/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
          },
          body: JSON.stringify(paymentData),
        },
      );

      const abacateData = await abacateResponse.json();

      if (!abacateResponse.ok) {
        console.error("❌ Erro na API AbacatePay:", abacateData);

        // Atualizar status da compra para erro
        await supabaseAuth
          .from("points_purchases")
          .update({
            status: "rejected",
            payment_error: abacateData.error || "Erro ao processar pagamento",
          })
          .eq("id", purchase.id);

        return NextResponse.json(
          { error: abacateData.message || "Erro ao processar pagamento" },
          { status: abacateResponse.status || 500 },
        );
      }

      // Estrutura da resposta do AbacatePay conforme documentação
      // Response: { data: { id, brCode, brCodeBase64, expiresAt, status, ... }, error: null }
      if (abacateData.error) {
        console.error("❌ Erro na resposta AbacatePay:", abacateData.error);
        return NextResponse.json(
          { error: abacateData.error || "Erro ao processar pagamento" },
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

      // Extrair dados do QR Code PIX conforme documentação
      const qrCodeId = responseData.id; // pix_char_123456
      const brCode = responseData.brCode; // Código PIX copia e cola
      const brCodeBase64 = responseData.brCodeBase64; // Imagem do QR Code em base64
      const expiresAt = responseData.expiresAt; // Data de expiração
      const status = responseData.status; // Status do pagamento

      // Atualizar compra com dados do pagamento
      await supabaseAuth
        .from("points_purchases")
        .update({
          payment_id: qrCodeId,
          payment_url: brCodeBase64 || brCode,
          payment_data: abacateData,
        })
        .eq("id", purchase.id);

      return NextResponse.json({
        success: true,
        paymentId: qrCodeId,
        qrCode: brCode, // Código PIX copia e cola
        qrCodeImage: brCodeBase64, // Imagem do QR Code em base64
        paymentUrl: brCodeBase64 || brCode,
        expiresAt: expiresAt,
        status: status,
        purchaseId: purchase.id,
      });
    } catch (error) {
      console.error("❌ Erro ao criar pagamento:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
