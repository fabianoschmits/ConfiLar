import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { reason, deduct_points = true } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Refund reason is required" },
        { status: 400 },
      );
    }

    // Call the RPC to process refund
    const { error } = await supabaseAdmin.rpc("admin_refund_purchase", {
      p_purchase_id: id,
      p_refund_reason: reason,
      p_deduct_points: deduct_points,
    });

    if (error) {
      console.error("Error processing refund:", error);
      return NextResponse.json(
        { error: error.message || "Failed to process refund" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
    });
  } catch (error) {
    console.error("Error in refund API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
