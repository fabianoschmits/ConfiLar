import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

// Exportar config de runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/gestao-confi/bans
 *
 * Lista todos os banimentos do sistema.
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem visualizar banimentos
 */
export const GET = withAdminAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const adminSupabase = createAdminSupabaseClient();
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") || "all";

      let query = adminSupabase
        .from("user_bans")
        .select("*")
        .order("created_at", { ascending: false });

      if (status !== "all") {
        if (status === "active") {
          query = query.eq("is_active", true);
        } else if (status === "revoked") {
          query = query.eq("is_active", false);
        }
      }

      const { data: bans, error } = await query;

      if (error) {
        console.error("Erro ao buscar banimentos:", error);
        return NextResponse.json(
          { error: "Erro ao buscar banimentos" },
          { status: 500 },
        );
      }

      // Enriquecer com informações dos usuários
      const enrichedBans = await Promise.all(
        (bans || []).map(async (ban) => {
          let profile = null;

          // Buscar informações do usuário banido
          if (ban.user_id) {
            const { data: profileData } = await adminSupabase
              .from("profiles")
              .select("id, full_name, email, user_type, avatar_url")
              .eq("id", ban.user_id)
              .single();
            profile = profileData;
          }

          return {
            ...ban,
            profiles: profile,
          };
        }),
      );

      return NextResponse.json({ bans: enrichedBans });
    } catch (error) {
      console.error("Erro na API de banimentos:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Erro interno do servidor",
        },
        { status: 500 },
      );
    }
  },
);

/**
 * POST /api/gestao-confi/bans
 *
 * Cria um novo banimento para um usuário.
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem banir usuários
 */
export const POST = withAdminAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { userId, reason, banType, durationDays, adminNotes } =
        await request.json();

      // Validar dados de entrada
      if (!userId || !reason || !banType) {
        return NextResponse.json(
          { error: "userId, reason e banType são obrigatórios" },
          { status: 400 },
        );
      }

      // Validar que userId é um UUID válido
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return NextResponse.json({ error: "userId inválido" }, { status: 400 });
      }

      // Não permitir banir a si mesmo
      if (userId === user.id) {
        return NextResponse.json(
          { error: "Não é possível banir a si mesmo" },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      const banData = {
        user_id: userId,
        reason,
        ban_type: banType,
        duration_days: banType === "temporary" ? durationDays : null,
        admin_notes: adminNotes || `Banido por admin ${user.id}`,
        status: "active",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await adminSupabase
        .from("user_bans")
        .insert(banData)
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar banimento:", error);
        return NextResponse.json(
          { error: "Erro ao criar banimento" },
          { status: 500 },
        );
      }

      console.log(
        `✅ Banimento criado por admin ${user.id} para usuário ${userId}`,
      );

      return NextResponse.json({ ban: data });
    } catch (error) {
      console.error("Erro na API de criação de banimento:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);

/**
 * PUT /api/gestao-confi/bans
 *
 * Atualiza um banimento existente (ativar/revogar).
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem atualizar banimentos
 */
export const PUT = withAdminAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { banId, status, adminNotes } = await request.json();

      if (!banId) {
        return NextResponse.json(
          { error: "banId é obrigatório" },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Mapear status para is_active
      if (status === "revoked") {
        updateData.is_active = false;
      } else if (status === "active") {
        updateData.is_active = true;
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await adminSupabase
        .from("user_bans")
        .update(updateData)
        .eq("id", banId);

      if (error) {
        console.error("Erro ao atualizar banimento:", error);
        return NextResponse.json(
          { error: "Erro ao atualizar banimento" },
          { status: 500 },
        );
      }

      console.log(`✅ Banimento ${banId} atualizado por admin ${user.id}`);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Erro na API de atualização de banimento:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Erro interno do servidor",
        },
        { status: 500 },
      );
    }
  },
);
