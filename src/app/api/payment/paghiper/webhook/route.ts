import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Note: Using Service Role Key for Webhook to bypass RLS/Auth since it comes from PagHiper
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const PAGHIPER_TOKEN = "8PT5PS2TTQ2AZ9U05BQJB91TDF11SBE7QPQQXMQRAY8Y";
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
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    // Validate request if possible, but the best validation is calling status API.
    // Also check apiKey matches? PagHiper payload includes it?
    // "apiKey sent in notification".
    if (apiKey && apiKey !== PAGHIPER_API_KEY) {
      // Just log warning, but proceed to verify status with our trusted key anyway to be safe.
      console.warn(
        "Webhook API Key mismatch or not provided correctly",
        apiKey,
      );
    }

    // VERIFY STATUS WITH PAGHIPER API
    // We MUST use the notification_id to get the real status.
    const statusUrl = "https://pix.paghiper.com/invoice/notification/";

    // Note: status check endpoint usually requires POST with token/apiKey/notification_id
    const verifyPayload = {
      token: PAGHIPER_TOKEN,
      apiKey: PAGHIPER_API_KEY,
      notification_id: notification_id,
      transaction_id: transaction_id,
    };

    const verifyResponse = await fetch(statusUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verifyPayload),
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.status_request.result !== "success") {
      console.error("PagHiper verification failed:", verifyData);
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 400 },
      );
    }

    const status = verifyData.status_request.status;

    let orderStatus: "pending" | "approved" | "cancelled" = "pending";
    if (status === "paid" || status === "approved" || status === "completed") {
      orderStatus = "approved";
    } else if (status === "canceled" || status === "disputed") {
      orderStatus = "cancelled";
    }

    // 3. Update Order Status using SAFE RPC
    // This ensures points are added only once and correctly.

    // First get the order UUID if we don't have it (we queried by transaction_id effectively)
    // Actually we need the UUID for the RPC.
    const { data: existingOrder, error: fetchError } = await supabase
      .from("points_purchases")
      .select("id, status")
      .eq("transaction_id", transaction_id)
      .single();

    if (fetchError || !existingOrder) {
      console.error("Order not found for transaction:", transaction_id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (orderStatus === "approved" && existingOrder.status === "pending") {
      const { error: rpcError } = await supabase.rpc(
        "approve_points_purchase",
        {
          p_purchase_id: existingOrder.id,
        },
      );

      if (rpcError) {
        console.error("Error approving order via RPC:", rpcError);
        // Even if RPC fails (e.g. race condition), we log it.
        // If it failed because "already processed", that's fine.
        if (!rpcError.message?.includes("já processada")) {
          return NextResponse.json(
            { error: "Failed to approve order" },
            { status: 500 },
          );
        }
      }

      // Update metadata with notification info (optional, or separate update)
      await supabase
        .from("points_purchases")
        .update({
          metadata: {
            provider: "paghiper",
            last_notification: notification_id,
            transaction_id: transaction_id,
            last_status: status,
            updated_at: new Date().toISOString(),
          },
        })
        .eq("id", existingOrder.id);
    } else if (
      orderStatus === "cancelled" &&
      existingOrder.status !== "cancelled"
    ) {
      await supabase
        .from("points_purchases")
        .update({
          status: "cancelled",
          metadata: {
            provider: "paghiper",
            last_notification: notification_id,
            last_status: status,
          },
        })
        .eq("id", existingOrder.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
