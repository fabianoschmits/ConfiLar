
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Note: Using Service Role Key for Webhook to bypass RLS/Auth since it comes from PagHiper
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);


const PAGHIPER_TOKEN = process.env.PAGHIPER_TOKEN!;
const PAGHIPER_API_KEY = process.env.PAGHIPER_API_KEY!;

export async function POST(request: NextRequest) {
    try {
        // PagHiper sends FormData or JSON? Usually POST encoded form data or JSON.
        // Documentation says "Post simples". Usually x-www-form-urlencoded.
        // Let's try to parse as JSON first, fallback to formData.
        let body: any;
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            body = await request.json();
        } else {
            const formData = await request.formData();
            body = Object.fromEntries(formData);
        }

        const { transaction_id, notification_id, apiKey } = body;

        if (!transaction_id || !notification_id) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Validate request if possible, but the best validation is calling status API.
        // Also check apiKey matches? PagHiper payload includes it?
        // "apiKey sent in notification".
        if (apiKey && apiKey !== PAGHIPER_API_KEY) {
            // Just log warning, but proceed to verify status with our trusted key anyway to be safe.
            console.warn("Webhook API Key mismatch or not provided correctly", apiKey);
        }

        // VERIFY STATUS WITH PAGHIPER API
        // We MUST use the notification_id to get the real status.
        const statusUrl = "https://pix.paghiper.com/invoice/notification/";

        // Note: status check endpoint usually requires POST with token/apiKey/notification_id
        const verifyPayload = {
            token: PAGHIPER_TOKEN,
            apiKey: PAGHIPER_API_KEY,
            notification_id: notification_id,
            transaction_id: transaction_id
        };

        const verifyResponse = await fetch(statusUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(verifyPayload)
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.status_request.result !== "success") {
            console.error("PagHiper verification failed:", verifyData);
            return NextResponse.json({ error: "Verification failed" }, { status: 400 });
        }

        const status = verifyData.status_request.status;

        let orderStatus: "pending" | "approved" | "cancelled" = "pending";
        if (status === "paid" || status === "approved" || status === "completed") {
            orderStatus = "approved";
        } else if (status === "canceled" || status === "disputed") {
            orderStatus = "cancelled";
        }

        // 3. Update Order Status in `points_purchases`
        const { data: order, error: updateError } = await supabase
            .from("points_purchases")
            .update({
                status: orderStatus,
                paid_at: orderStatus === "approved" ? new Date().toISOString() : null,
                approved_at: orderStatus === "approved" ? new Date().toISOString() : null,
                metadata: {
                    provider: "paghiper",
                    last_notification: notification_id,
                    transaction_id: transaction_id,
                    last_status: status
                }
            })
            .eq("transaction_id", transaction_id)
            .select() // Return updated row
            .single();

        if (updateError || !order) {
            console.error("Error updating order:", updateError);
            return NextResponse.json({ error: "Order not found or update failed" }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
