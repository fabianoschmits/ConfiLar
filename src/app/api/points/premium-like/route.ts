import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

// Debit, reward, reaction and notification commit together or not at all.
export const POST = withAuth(
  async (request: NextRequest, _supabaseAuth, user) => {
    try {
      const { postId } = await request.json();
      if (!postId)
        return NextResponse.json(
          { error: "Conteúdo não informado." },
          { status: 400 },
        );
      const admin = createAdminSupabaseClient();
      const { data, error } = await admin.rpc("purchase_premium_like", {
        p_user_id: user.id,
        p_kind: "POST",
        p_content_id: postId,
      });
      if (error || !data?.success)
        return NextResponse.json(
          {
            error:
              "Não foi possível confirmar a curtida premium. Verifique seu saldo e a disponibilidade do conteúdo.",
          },
          { status: 400 },
        );
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { error: "Dados inválidos para curtida premium." },
        { status: 400 },
      );
    }
  },
);
