
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createClient } from "@supabase/supabase-js";

const PAGHIPER_API_KEY = process.env.PAGHIPER_API_KEY!;
const PAGHIPER_TOKEN = process.env.PAGHIPER_TOKEN!;
const PAGHIPER_PIX_URL = "https://pix.paghiper.com/invoice/create/";

// Admin client for database operations to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

            // 1. Buscar pacote (Using admin to ensure we can read configs if needed, or public)
            // Table is `points_packages` NOT `point_packages`
            const { data: pack } = await supabaseAdmin
                .from("points_packages")
                .select("*")
                .eq("id", package_id)
                .single();

            if (!pack && !body.amount) {
                return NextResponse.json(
                    { error: "Pacote inválido ou valor não informado." },
                    { status: 400 }
                );
            }

            const amountInCentavos = pack ? Math.round(pack.price_brl * 100) : Math.round(body.amount * 100);
            // Note: pack.price might be decimal, pack.price_brl is likely the column name in new schema?
            // Checking economy.ts: `price_brl: number` is correct. `price` was checked previously but `price_brl` is interface.

            const pointsAmount = pack ? pack.points : body.points;

            const orderId = crypto.randomUUID();

            // Clean phone
            const phoneClean = customer.phone ? customer.phone.replace(/\D/g, "") : "";

            // 2. Criar Ordem na Tabela `points_purchases`
            const { error: orderError } = await supabaseAdmin
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
                    { error: "Erro ao criar ordem interna.", details: orderError.message },
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
                        price_cents: amountInCentavos,
                        value_cents: amountInCentavos,
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

            if (data.pix_create_request?.result !== "success") {
                console.error("Erro PagHiper:", data);
                // Rollback or update status to failed?
                // Ideally cancel the pending order
                await supabaseAdmin.from("points_purchases").delete().eq("id", orderId);

                return NextResponse.json(
                    { error: data.pix_create_request?.response_message || "Erro ao criar PIX na PagHiper" },
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
            // Use `points_purchases` NOT `point_orders`
            await supabaseAdmin
                .from("points_purchases")
                .update({ transaction_id: transactionId })
                .eq("id", orderId);

            return NextResponse.json({
                orderId,
                qrCode: pixQrCodeUrl,
                pixCode: pixCode,
                transactionId: transactionId,
                expiresAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
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
