import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/gestao-confi/points/manage
 *
 * Permite que administradores adicionem ou removam pontos de usuários.
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem gerenciar pontos
 */
export const POST = withAdminAuth(
  async (request: NextRequest, supabaseAuth, adminUser) => {
    try {
      const body = await request.json();
      const { userId, amount, action, reason } = body;

      // Validar dados
      if (!userId || !amount || !action) {
        return NextResponse.json(
          { error: "userId, amount e action são obrigatórios" },
          { status: 400 },
        );
      }

      if (action !== "add" && action !== "remove") {
        return NextResponse.json(
          { error: 'action deve ser "add" ou "remove"' },
          { status: 400 },
        );
      }

      if (amount <= 0 || !Number.isInteger(amount)) {
        return NextResponse.json(
          { error: "amount deve ser um número inteiro positivo" },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      // Verificar se o usuário existe
      const { data: userData, error: userError } = await adminSupabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", userId)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 404 },
        );
      }

      // Verificar saldo atual se for remover
      if (action === "remove") {
        const { data: balanceData, error: balanceError } = await adminSupabase
          .from("user_points_balance")
          .select("balance")
          .eq("user_id", userId)
          .single();

        if (balanceError || !balanceData) {
          return NextResponse.json(
            { error: "Erro ao verificar saldo do usuário" },
            { status: 500 },
          );
        }

        if (balanceData.balance < amount) {
          return NextResponse.json(
            {
              error: `Saldo insuficiente. O usuário possui apenas ${balanceData.balance} pontos.`,
              currentBalance: balanceData.balance,
            },
            { status: 400 },
          );
        }
      }

      // Executar ação
      let result;
      const description =
        reason ||
        `Ajuste manual de pontos por administrador (${action === "add" ? "adição" : "remoção"})`;
      const source =
        action === "add" ? "admin_add_points" : "admin_remove_points";

      const metadata = {
        admin_id: adminUser.id,
        admin_email: adminUser.email,
        reason: reason || null,
        action: action,
        timestamp: new Date().toISOString(),
      };

      if (action === "add") {
        const { data, error } = await adminSupabase.rpc("add_points", {
          p_user_id: userId,
          p_points: amount,
          p_source: source,
          p_description: description,
          p_metadata: metadata,
        });

        if (error) {
          console.error("Erro ao adicionar pontos:", error);
          return NextResponse.json(
            { error: "Erro ao adicionar pontos" },
            { status: 500 },
          );
        }

        result = data;
      } else {
        const { data, error } = await adminSupabase.rpc("deduct_points", {
          p_user_id: userId,
          p_points: amount,
          p_source: source,
          p_description: description,
          p_metadata: metadata,
        });

        if (error) {
          console.error("Erro ao remover pontos:", error);
          return NextResponse.json(
            { error: "Erro ao remover pontos" },
            { status: 500 },
          );
        }

        result = data;
      }

      // Buscar novo saldo
      const { data: newBalanceData } = await adminSupabase
        .from("user_points_balance")
        .select("balance")
        .eq("user_id", userId)
        .single();

      console.log(
        `✅ Admin ${adminUser.id} ${action === "add" ? "adicionou" : "removeu"} ${amount} pontos do usuário ${userId}`,
      );

      return NextResponse.json({
        success: true,
        action,
        amount,
        userId,
        userName: userData.full_name || userData.email,
        newBalance: newBalanceData?.balance || 0,
        transaction: result,
      });
    } catch (error) {
      console.error("Erro na API de gerenciamento de pontos:", error);
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
