
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";

// This route allows the frontend to poll for status updates based on the order ID.
// Ideally, the webhook updates the DB, and this route just reads the DB.

export const GET = withAuth(
    async (request: NextRequest, supabaseAuth, user) => {
        try {
            const { searchParams } = new URL(request.url);
            const purchaseId = searchParams.get("purchase_id");
            const transactionId = searchParams.get("id"); // Optional, mostly relying on purchaseId (internal order id)

            if (!purchaseId) {
                return NextResponse.json(
                    { error: "Order ID (purchase_id) required" },
                    { status: 400 }
                );
            }

            // Check Order in DB
            const { data: order, error } = await supabaseAuth
                .from("point_orders")
                .select("status")
                .eq("id", purchaseId)
                .single();

            if (error || !order) {
                return NextResponse.json(
                    { error: "Order not found" },
                    { status: 404 }
                );
            }

            // Map DB status to frontend expected status
            // Frontend expects: "approved", "paid", "PAID" for success.
            return NextResponse.json({
                status: order.status,
                paymentStatus: order.status === "approved" ? "PAID" : order.status.toUpperCase()
            });

        } catch (error: any) {
            console.error("Check Error:", error);
            return NextResponse.json(
                { error: "Internal Error" },
                { status: 500 }
            );
        }
    }
);
