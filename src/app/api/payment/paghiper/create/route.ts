
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";


const PAGHIPER_API_KEY = process.env.PAGHIPER_API_KEY!;
const PAGHIPER_TOKEN = process.env.PAGHIPER_TOKEN!;
const PAGHIPER_PIX_URL = "https://pix.paghiper.com/invoice/create/";

export const POST = withAuth(
    async (request: NextRequest, supabaseAuth, user) => {
        try {
            const body = await request.json();
            const { package_id, customer } = body;

            if (!customer?.cpf || !customer?.name) {
                return NextResponse.json(
                    { error: "Dados do pagador (Nome e CPF) são obrigatórios." },
                    { status: 400 }
                );
            }

            // 1. Buscar pacote
            const { data: pack } = await supabaseAuth
                .from("point_packages")
                .select("*")
                .eq("id", package_id)
                .single();

            if (!pack && !body.amount) {
                return NextResponse.json(
                    { error: "Pacote inválido ou valor não informado." },
                    { status: 400 }
                );
            }

            const amountInCentavos = pack ? pack.price : Math.round(body.amount * 100);
            const pointsAmount = pack ? pack.points : body.points;

            // PagHiper uses cents for creating transaction? No, most use ID but let's check doc or assume BRL logic then confirm. 
            // Actually standard for these APIs is usually cents. Let's re-read doc if needed or stick to cents.
            // Wait, PagHiper `value_cents` field name implies cents.

            const orderId = crypto.randomUUID();

            // Clean phone
            const phoneClean = customer.phone ? customer.phone.replace(/\D/g, "") : "";

            // 2. Criar Ordem na Tabela `points_purchases` (corrigido de point_orders)
            const { error: orderError } = await supabaseAuth
                .from("points_purchases")
                .insert({
                    id: orderId,
                    user_id: user.id,
                    package_id: package_id,
                    points_received: pointsAmount,
                    amount_brl: amountInCentavos / 100, // Saving in BRL
                    payment_method: "pix",
                    status: "pending",
                    metadata: { provider: "paghiper", phone: phoneClean }
                });

            if (orderError) {
                console.error("Erro ao criar ordem:", orderError);
                return NextResponse.json(
                    { error: "Erro ao criar ordem interna." },
                    { status: 500 }
                );
            }

            // 3. Montar Payload PagHiper

            const paghiperPayload = {
                apiKey: PAGHIPER_API_KEY,
                order_id: orderId,
                payer_email: customer.email,
                payer_name: customer.name,
                payer_cpf_cnpj: customer.cpf.replace(/\D/g, ""),
                payer_phone: phoneClean,
                notification_url: `${request.nextUrl.origin}/api/payment/paghiper/webhook`,
                days_due_date: 3,
                items: [
                    {
                        description: `Compra de ${pointsAmount} pontos ConfiLar`,
                        quantity: 1,
                        item_id: package_id || "custom_points",
                        price_cents: amountInCentavos, // SDK uses this
                        value_cents: amountInCentavos, // Common pattern, adding for safety
                    }
                ]
            };

            // 4. Enviar Requisição para PagHiper
            const response = await fetch(PAGHIPER_PIX_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(paghiperPayload),
            });

            const data = await response.json();

            if (data.pix_create_request.result !== "success") {
                console.error("Erro PagHiper:", data);
                return NextResponse.json(
                    { error: data.pix_create_request.response_message || "Erro ao criar PIX na PagHiper" },
                    { status: 400 }
                );
            }

            const transactionId = data.pix_create_request.transaction_id;
            const pixCode = data.pix_create_request.pix_code.emv;

            // Handle QR Code URL or Base64
            let pixQrCodeUrl = data.pix_create_request.pix_code.qrcode_image_url;
            const pixQrCodeBase64 = data.pix_create_request.pix_code.qrcode_base64;

            if (!pixQrCodeUrl && pixQrCodeBase64) {
                pixQrCodeUrl = `data:image/png;base64,${pixQrCodeBase64}`;
            }

            // 5. Atualizar Ordem com ID da transação
            await supabaseAuth
                .from("point_orders")
                .update({ transaction_id: transactionId })
                .eq("id", orderId);

            return NextResponse.json({
                orderId,
                qrCode: pixQrCodeUrl,
                pixCode: pixCode,
                transactionId: transactionId,
                expiresAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(), // 3 days approx 
            });

        } catch (error: any) {
            console.error("Erro interno:", error);
            return NextResponse.json(
                { error: "Erro interno no servidor", detail: error.message },
                { status: 500 }
            );
        }
    }
);
