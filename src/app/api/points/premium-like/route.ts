import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/points/premium-like
 *
 * Cria uma curtida premium em um post, deduzindo pontos do usuário autenticado
 * e adicionando pontos ao criador do post.
 *
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Usa sempre user.id autenticado (ignora userId do body)
 * - ✅ Previne fraude financeira e manipulação de identidade
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      console.log("🔍 [Premium Like API] Iniciando requisição...");

      // Parse do body
      const body = await request.json();
      const { postId } = body;

      // ✅ IGNORAR userId do body - sempre usar user.id autenticado
      const authenticatedUserId = user.id;

      console.log("🔍 [Premium Like API] Body recebido:", {
        postId,
        authenticatedUserId,
      });

      // Validar dados
      if (!postId) {
        return NextResponse.json(
          { error: "postId é obrigatório" },
          { status: 400 },
        );
      }

      // Usar cliente admin para bypass RLS (após validar autenticação)
      const supabase = createAdminSupabaseClient();

      // Buscar informações do post
      const { data: post, error: postError } = await supabase
        .from("feed_posts")
        .select("user_id, professional_id")
        .eq("id", postId)
        .single();

      if (postError || !post) {
        return NextResponse.json(
          { error: "Post não encontrado" },
          { status: 404 },
        );
      }

      const postCreatorId = post.user_id || post.professional_id;

      if (!postCreatorId) {
        return NextResponse.json(
          { error: "Criador do post não identificado" },
          { status: 400 },
        );
      }

      // Não permitir curtir próprio post
      if (authenticatedUserId === postCreatorId) {
        return NextResponse.json(
          { error: "Você não pode curtir seu próprio post" },
          { status: 400 },
        );
      }

      // Verificar saldo do usuário autenticado
      const { data: balance, error: balanceError } = await supabase
        .from("user_points_balance")
        .select("balance")
        .eq("user_id", authenticatedUserId) // 🔒 Sempre ID autenticado
        .single();

      if (balanceError) {
        return NextResponse.json(
          { error: "Erro ao verificar saldo" },
          { status: 500 },
        );
      }

      const pointsCost = 5; // Custo de uma curtida premium

      if (!balance || balance.balance < pointsCost) {
        return NextResponse.json(
          {
            error: `Saldo insuficiente. Necessário: ${pointsCost} pontos`,
            balance: balance?.balance || 0,
          },
          { status: 400 },
        );
      }

      // Verificar se já deu like neste post (normal ou premium)
      const { data: existingLikes, error: likeCheckError } = await supabase
        .from("feed_posts_likes")
        .select("id, is_premium")
        .eq("post_id", postId)
        .eq("user_id", authenticatedUserId); // 🔒 Sempre ID autenticado

      if (likeCheckError) {
        console.error(
          "❌ [Premium Like API] Erro ao verificar like existente:",
          likeCheckError,
        );
        return NextResponse.json(
          { error: "Erro ao verificar like" },
          { status: 500 },
        );
      }

      console.log(
        "🔍 [Premium Like API] Likes existentes:",
        existingLikes?.length || 0,
      );

      // SEMPRE criar novo like premium (permite múltiplos likes)
      console.log("🆕 [Premium Like API] Criando novo like premium...");

      const { data: premiumLike, error: likeError } = await supabase
        .from("feed_posts_likes")
        .insert({
          post_id: postId,
          user_id: authenticatedUserId, // 🔒 Sempre ID autenticado
          is_premium: true,
          premium_points_spent: pointsCost,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (likeError) {
        console.error(
          "❌ [Premium Like API] Erro ao criar premium like:",
          likeError,
        );
        console.error(
          "❌ [Premium Like API] Detalhes do erro:",
          JSON.stringify(likeError, null, 2),
        );
        return NextResponse.json(
          { error: "Erro ao criar like premium" },
          { status: 500 },
        );
      }

      console.log("✅ [Premium Like API] Like premium criado com sucesso");

      // 2. Deduzir pontos do usuário autenticado que curtiu
      const { error: deductError } = await supabase.rpc("add_points", {
        p_user_id: authenticatedUserId, // 🔒 Sempre ID autenticado
        p_points: -pointsCost,
        p_source: "premium_like",
        p_description: "Curtida premium em post",
        p_metadata: {
          post_id: postId,
          creator_id: postCreatorId,
        },
      });

      if (deductError) {
        console.error("Erro ao deduzir pontos:", deductError);
        // Rollback: remover is_premium do like
        await supabase
          .from("feed_posts_likes")
          .update({ is_premium: false, premium_points_spent: 0 })
          .eq("id", premiumLike.id);
        return NextResponse.json(
          { error: "Erro ao processar pontos" },
          { status: 500 },
        );
      }

      // 3. Adicionar pontos ao criador do post
      const { error: rewardError } = await supabase.rpc("add_points", {
        p_user_id: postCreatorId,
        p_points: pointsCost,
        p_source: "receive_premium_like",
        p_description: "Recebeu curtida premium em post",
        p_metadata: {
          post_id: postId,
          from_user_id: authenticatedUserId, // 🔒 Sempre ID autenticado
        },
      });

      if (rewardError) {
        console.error(
          "⚠️ [Premium Like API] Erro ao recompensar criador:",
          rewardError,
        );
        // Não fazer rollback aqui pois o usuário já pagou
      }

      // 4. Criar notificação para o criador do post
      try {
        // Buscar nome do usuário autenticado que deu premium like
        const { data: likerProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authenticatedUserId) // 🔒 Sempre ID autenticado
          .single();

        const likerName = likerProfile?.full_name || "Usuário";

        // Buscar título do post
        const { data: postData } = await supabase
          .from("feed_posts")
          .select("title")
          .eq("id", postId)
          .single();

        const postTitle = postData?.title || "seu post";

        // Criar notificação para o criador do post
        await supabase.from("notifications").insert({
          user_id: postCreatorId,
          type: "achievement",
          title: "💰 Curtida Premium Recebida!",
          message: `${likerName} deu uma curtida premium em "${postTitle.substring(0, 30)}${postTitle.length > 30 ? "..." : ""}" (+${pointsCost} pontos)`,
          action_url: `/feed?post=${postId}`,
          priority: "high",
          metadata: {
            post_id: postId,
            from_user_id: authenticatedUserId, // 🔒 Sempre ID autenticado
            from_user_name: likerName,
            points_received: pointsCost,
            type: "premium_like_received",
          },
          is_read: false,
        });

        // Enviar push notification
        try {
          const { NotificationService } =
            await import("@/services/NotificationService");
          await NotificationService.sendPushNotification(
            postCreatorId,
            "💰 Curtida Premium Recebida!",
            `${likerName} deu uma curtida premium no seu post (+${pointsCost} pontos)`,
          );
        } catch (pushError) {
          console.warn(
            "⚠️ [Premium Like API] Erro ao enviar push notification:",
            pushError,
          );
        }

        console.log(
          "✅ [Premium Like API] Notificação criada para criador do post",
        );
      } catch (notifError) {
        console.error(
          "⚠️ [Premium Like API] Erro ao criar notificação:",
          notifError,
        );
        // Não fazer rollback pois o usuário já pagou
      }

      console.log("✅ [Premium Like API] Premium like concluído com sucesso!");

      return NextResponse.json({
        success: true,
        like: premiumLike,
        pointsSpent: pointsCost,
        pointsRewarded: pointsCost,
      });
    } catch (error) {
      console.error("Erro ao processar premium like:", error);
      return NextResponse.json(
        {
          error: "Erro interno do servidor",
        },
        { status: 500 },
      );
    }
  },
);
