import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";

/**
 * POST /api/points/premium-comment
 *
 * Cria um comentário premium deduzindo pontos via server-side.
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { postId, content } = await request.json();
      const authenticatedUserId = user.id;

      if (!postId || !content) {
        return NextResponse.json(
          { error: "postId e content são obrigatórios" },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      // 1. Verificar saldo (Server-side)
      const { data: balanceData } = await adminSupabase
        .from("user_points_balance")
        .select("balance")
        .eq("user_id", authenticatedUserId)
        .single();

      const pointsCost = PREMIUM_PRICES.COMMENT.POINTS;

      if (!balanceData || balanceData.balance < pointsCost) {
        return NextResponse.json(
          { error: `Saldo insuficiente. Necessário: ${pointsCost} pontos` },
          { status: 400 },
        );
      }

      // 2. Criar comentário
      const { data: comment, error: commentError } = await adminSupabase
        .from("comments")
        .insert({
          user_id: authenticatedUserId,
          post_id: postId,
          content,
          is_featured: true,
          premium_points_spent: pointsCost,
        })
        .select()
        .single();

      if (commentError) {
        console.error("Erro ao criar comentário premium:", commentError);
        return NextResponse.json(
          { error: "Erro ao publicar comentário" },
          { status: 500 },
        );
      }

      // 3. Deduzir pontos
      const { error: pointsError } = await adminSupabase.rpc("deduct_points", {
        p_user_id: authenticatedUserId,
        p_points: pointsCost,
        p_source: "premium_comment",
        p_description: "Comentário premium em post",
      });

      if (pointsError) {
        console.error("Erro ao deduzir pontos no comentário:", pointsError);
      }

      return NextResponse.json({ success: true, comment });
    } catch (error) {
      console.error("Erro na API de comentário premium:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
