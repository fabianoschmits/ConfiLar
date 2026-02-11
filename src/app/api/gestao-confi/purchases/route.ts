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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const userId = searchParams.get("user_id");
    const paymentMethod = searchParams.get("payment_method");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const packageId = searchParams.get("package_id");
    const minAmount = searchParams.get("min_amount");
    const maxAmount = searchParams.get("max_amount");
    const search = searchParams.get("search");

    // Build query for purchases
    let query = supabaseAdmin
      .from("points_purchases")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (paymentMethod) {
      query = query.eq("payment_method", paymentMethod);
    }
    if (packageId) {
      query = query.eq("package_id", packageId);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (minAmount) {
      query = query.gte("amount_brl", parseFloat(minAmount));
    }
    if (maxAmount) {
      query = query.lte("amount_brl", parseFloat(maxAmount));
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: purchases, error, count } = await query;

    if (error) {
      console.error("Error fetching purchases:", error);
      return NextResponse.json(
        { error: "Failed to fetch purchases" },
        { status: 500 },
      );
    }

    // Fetch related data
    const userIds = [...new Set(purchases?.map((p) => p.user_id) || [])];
    const packageIds = [...new Set(purchases?.map((p) => p.package_id) || [])];

    const { data: users } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);

    const { data: packages } = await supabaseAdmin
      .from("points_packages")
      .select("id, name, slug, points, bonus_percentage")
      .in("id", packageIds);

    // Combine data
    const purchasesWithRelations = purchases?.map((purchase) => ({
      ...purchase,
      user: users?.find((u) => u.id === purchase.user_id) || null,
      package: packages?.find((p) => p.id === purchase.package_id) || null,
    }));

    // If search is provided, filter in memory
    let filteredPurchases = purchasesWithRelations || [];
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredPurchases = filteredPurchases.filter((p: any) => {
        const userName = p.user?.full_name?.toLowerCase() || "";
        const userEmail = p.user?.email?.toLowerCase() || "";
        const purchaseId = p.id.toLowerCase();
        return (
          userName.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          purchaseId.includes(searchLower)
        );
      });
    }

    return NextResponse.json({
      purchases: filteredPurchases,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in admin purchases API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
