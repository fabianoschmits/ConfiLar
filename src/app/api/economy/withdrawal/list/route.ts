import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar saques do usuário
    const { data, error } = await supabase
      .from("points_withdrawals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Erro ao buscar saques:", error);
      return NextResponse.json(
        { error: "Erro ao buscar saques" },
        { status: 500 },
      );
    }

    return NextResponse.json({ withdrawals: data || [] });
  } catch (error) {
    console.error("Erro na API de listar saques:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
