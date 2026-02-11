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
    // Get all purchases
    const { data: allPurchases, error } = await supabaseAdmin
      .from("points_purchases")
      .select(
        "status, amount_brl, payment_method, package_id, points_received",
      );

    if (error) {
      console.error("Error fetching purchase stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch statistics" },
        { status: 500 },
      );
    }

    const purchases = allPurchases || [];

    // Calculate statistics
    const totalRevenue = purchases
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + (p.amount_brl || 0), 0);

    const totalPurchases = purchases.length;

    const purchasesByStatus = purchases.reduce((acc: any, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const revenueByPaymentMethod = purchases
      .filter((p) => p.status === "approved")
      .reduce((acc: any, p) => {
        const method = p.payment_method || "unknown";
        acc[method] = (acc[method] || 0) + (p.amount_brl || 0);
        return acc;
      }, {});

    const successRate =
      totalPurchases > 0
        ? ((purchasesByStatus.approved || 0) / totalPurchases) * 100
        : 0;

    // Get top packages
    const { data: packages } = await supabaseAdmin
      .from("points_packages")
      .select("id, name, slug");

    const packageMap = (packages || []).reduce((acc: any, pkg) => {
      acc[pkg.id] = pkg;
      return acc;
    }, {});

    const packageStats = purchases
      .filter((p) => p.status === "approved" && p.package_id)
      .reduce((acc: any, p) => {
        const pkgId = p.package_id!;
        if (!acc[pkgId]) {
          acc[pkgId] = {
            package_id: pkgId,
            package_name: packageMap[pkgId]?.name || "Unknown",
            count: 0,
            revenue: 0,
            points_sold: 0,
          };
        }
        acc[pkgId].count += 1;
        acc[pkgId].revenue += p.amount_brl || 0;
        acc[pkgId].points_sold += p.points_received || 0;
        return acc;
      }, {});

    const topPackages = Object.values(packageStats)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      totalPurchases,
      purchasesByStatus,
      revenueByPaymentMethod,
      successRate: Math.round(successRate * 100) / 100,
      topPackages,
      pendingCount: purchasesByStatus.pending || 0,
    });
  } catch (error) {
    console.error("Error in stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
