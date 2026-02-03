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

    // Buscar transferências do usuário (sem joins)
    const { data: transfers, error: transfersError } = await supabase
      .from("points_transfers")
      .select("*")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (transfersError) {
      console.error("Erro ao buscar transferências:", transfersError);
      return NextResponse.json(
        { error: "Erro ao buscar transferências" },
        { status: 500 },
      );
    }

    // Buscar informações dos usuários separadamente
    const userIds = new Set();
    transfers?.forEach((transfer) => {
      if (transfer.from_user_id) userIds.add(transfer.from_user_id);
      if (transfer.to_user_id) userIds.add(transfer.to_user_id);
    });

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", Array.from(userIds));

    if (profilesError) {
      console.error("Erro ao buscar perfis:", profilesError);
      // Continuar mesmo com erro nos perfis
    }

    // Combinar os dados
    const profilesMap = new Map(
      profiles?.map((profile) => [profile.id, profile]) || [],
    );

    const transfersWithUsers =
      transfers?.map((transfer) => ({
        ...transfer,
        from_user: transfer.from_user_id
          ? profilesMap.get(transfer.from_user_id)
          : null,
        to_user: transfer.to_user_id
          ? profilesMap.get(transfer.to_user_id)
          : null,
      })) || [];

    return NextResponse.json({ transfers: transfersWithUsers });
  } catch (error) {
    console.error("Erro na API de listar transferências:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
