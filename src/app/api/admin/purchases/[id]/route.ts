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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch purchase
    const { data: purchase, error } = await supabaseAdmin
      .from("points_purchases")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    // Fetch user data
    const { data: user } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, avatar_url, phone, user_type, created_at")
      .eq("id", purchase.user_id)
      .single();

    // Fetch package data
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from("points_packages")
      .select(
        "id, name, slug, description, points, bonus_percentage, price_brl, total_points",
      )
      .eq("id", purchase.package_id)
      .single();

    if (packageError) {
      console.error("Error fetching package for purchase:", packageError);
    }

    // Get user's current points balance
    const { data: balance } = await supabaseAdmin
      .from("user_points_balance")
      .select("balance, total_earned, total_spent")
      .eq("user_id", purchase.user_id)
      .single();

    console.log("Purchase data for modal:", {
      id: purchase.id,
      package_id: purchase.package_id,
      has_user: !!user,
      has_package: !!packageData,
    });

    return NextResponse.json({
      purchase: {
        ...purchase,
        user: user || null,
        points_package: packageData || null,
      },
      userBalance: balance,
    });
  } catch (error) {
    console.error("Error fetching purchase details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, admin_note } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    // Get purchase
    const { data: purchase, error: fetchError } = await supabaseAdmin
      .from("points_purchases")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    if (purchase.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending purchases can be approved or rejected" },
        { status: 400 },
      );
    }

    if (action === "approve") {
      // Use the existing RPC to approve
      const { error: approveError } = await supabaseAdmin.rpc(
        "approve_points_purchase",
        {
          p_purchase_id: id,
        },
      );

      if (approveError) {
        console.error("Error approving purchase:", approveError);
        return NextResponse.json(
          { error: "Failed to approve purchase" },
          { status: 500 },
        );
      }

      // Update admin note if provided
      if (admin_note) {
        await supabaseAdmin
          .from("points_purchases")
          .update({ admin_note })
          .eq("id", id);
      }

      return NextResponse.json({
        success: true,
        message: "Purchase approved successfully",
      });
    } else {
      // Reject purchase
      const { error: rejectError } = await supabaseAdmin
        .from("points_purchases")
        .update({
          status: "rejected",
          admin_note: admin_note || "Rejected by admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (rejectError) {
        console.error("Error rejecting purchase:", rejectError);
        return NextResponse.json(
          { error: "Failed to reject purchase" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Purchase rejected successfully",
      });
    }
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
