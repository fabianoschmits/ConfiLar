import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withRateLimit } from "@/lib/rateLimitMiddleware";

/**
 * POST /api/referrals/update-milestone
 *
 * Atualiza um milestone de referral usando Service Role para bypass RLS.
 * Isso é necessário porque o usuário indicado (referred) muitas vezes
 * não tem permissão para editar sua própria linha na tabela referrals.
 */
const handler = async (request: NextRequest) => {
  try {
    // 1. Verificar autenticação (O usuário que completa o milestone deve estar logado)
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Ignorar erros em API routes
            }
          },
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // 2. Obter dados da requisição
    const { referredUserId, milestone } = await request.json();

    if (!referredUserId || !milestone) {
      return NextResponse.json(
        { error: "referredUserId e milestone são obrigatórios" },
        { status: 400 },
      );
    }

    // 3. Verificar se o usuário é administrador
    const { data: adminData } = await supabaseUser
      .from("admins")
      .select("id, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    const isAdmin = !!adminData;

    // 🔒 SEGURANÇA:
    // - Milestones de verificação (profile_completed) SÓ podem ser disparados por admins.
    // - Milestones de atividade (posts, reviews) podem ser disparados pelo próprio usuário.
    // - Admins podem disparar qualquer milestone para qualquer usuário.

    const isVerificationMilestone = milestone === "profile_completed";

    if (isVerificationMilestone && !isAdmin) {
      return NextResponse.json(
        {
          error: "Apenas administradores podem confirmar a conclusão de perfil",
        },
        { status: 403 },
      );
    }

    if (!isAdmin && referredUserId !== user.id) {
      return NextResponse.json(
        { error: "Operação não permitida para este usuário" },
        { status: 403 },
      );
    }

    const allowedMilestones = [
      "profile_completed",
      "first_post_made",
      "first_review_made",
      "active_30_days",
    ];

    if (!allowedMilestones.includes(milestone)) {
      return NextResponse.json(
        { error: "Milestone inválido" },
        { status: 400 },
      );
    }

    // 3. Usar Admin Client para bypass RLS
    const supabaseAdmin = createAdminSupabaseClient();

    // 4. Verificar se o referral existe e se o milestone já não está concluído
    const { data: referralData, error: fetchError } = await supabaseAdmin
      .from("referrals")
      .select(`id, ${milestone}`)
      .eq("referred_id", referredUserId)
      .maybeSingle();

    if (fetchError) {
      console.error(
        "❌ [API update-milestone] Erro ao buscar referral:",
        fetchError,
      );
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!referralData) {
      return NextResponse.json(
        {
          message: "Nenhum referral encontrado para este usuário",
          success: false,
        },
        { status: 200 }, // Não é erro, usuário pode não ter sido indicado
      );
    }

    // Se já estiver concluído, não fazer nada
    const currentData = referralData as any;
    if (currentData[milestone] === true) {
      return NextResponse.json({
        success: true,
        message: "Milestone já concluído anteriormente",
      });
    }

    // 5. Preparar dados de atualização
    const updateData: any = {
      [milestone]: true,
      last_activity_at: new Date().toISOString(),
    };

    // Lógica especial para ativação do referral
    if (milestone === "profile_completed") {
      updateData.status = "active";
      updateData.activated_at = new Date().toISOString();
    }

    // 6. Executar atualização
    const { error: updateError } = await supabaseAdmin
      .from("referrals")
      .update(updateData)
      .eq("id", currentData.id);

    if (updateError) {
      console.error(
        "❌ [API update-milestone] Erro ao atualizar milestone:",
        updateError,
      );
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log(
      `✅ [API update-milestone] Milestone ${milestone} atualizado para usuário ${referredUserId}`,
    );

    return NextResponse.json({
      success: true,
      message: `Milestone ${milestone} atualizado com sucesso`,
    });
  } catch (error: any) {
    console.error("❌ [API update-milestone] Erro interno:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
};

export const POST = withRateLimit(handler, "API_DEFAULT");
