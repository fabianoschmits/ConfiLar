import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { AddPointsRequest } from "@/types/points";

/**
 * POST /api/points/add
 *
 * Adiciona pontos ao usuário autenticado baseado em uma ação.
 *
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Sempre adiciona pontos ao usuário autenticado (user.id)
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      // Parse do body
      const body: AddPointsRequest = await request.json();

      // Validar dados
      if (!body.action_type) {
        return NextResponse.json(
          { error: "Tipo de ação é obrigatório" },
          { status: 400 },
        );
      }

      // Montar metadata com informações extras
      const metadata = {
        ...body.metadata,
        referral_id: body.referral_id,
        post_id: body.post_id,
        related_user_id: body.related_user_id,
      };

      // Adicionar pontos ao usuário autenticado (RPC agora segura e server-side)
      const { data, error } = await supabaseAuth.rpc("add_points", {
        p_user_id: user.id,
        p_points: 0, // Lookup automático via p_source (action_type)
        p_source: body.action_type,
        p_description: body.description,
        p_metadata: metadata,
      });

      if (error || !data || !data.success) {
        console.error("Erro ao adicionar pontos:", error || data?.message);
        return NextResponse.json(
          {
            error:
              error?.message || data?.message || "Erro ao adicionar pontos",
          },
          { status: 500 },
        );
      }

      const pointsAdded = data.points_added;

      // Criar notificação se for um tipo de referral
      const referralTypes = [
        "referral_signup",
        "referral_profile_completed",
        "referral_first_post",
        "referral_first_review",
        "referral_active_30_days",
      ];

      if (referralTypes.includes(body.action_type)) {
        try {
          // Buscar informações do usuário indicado (referred) se disponível
          let referredUserName = "alguém";
          if (body.related_user_id || metadata.related_user_id) {
            const referredUserId =
              body.related_user_id || metadata.related_user_id;
            const { data: referredProfile } = await supabaseAuth
              .from("profiles")
              .select("full_name")
              .eq("id", referredUserId)
              .single();

            if (referredProfile?.full_name) {
              referredUserName = referredProfile.full_name;
            }
          }

          // Definir mensagens baseadas no tipo de referral
          const referralMessages: Record<
            string,
            { title: string; message: string }
          > = {
            referral_signup: {
              title: "👥 Nova Indicação!",
              message: `${referredUserName} se cadastrou usando seu código de indicação! Você ganhou ${pointsAdded.toLocaleString("pt-BR")} ConfiPoints`,
            },
            referral_profile_completed: {
              title: "✅ Perfil Completado!",
              message: `${referredUserName} completou o perfil! Você ganhou ${pointsAdded.toLocaleString("pt-BR")} ConfiPoints`,
            },
            referral_first_post: {
              title: "📝 Primeiro Post!",
              message: `${referredUserName} fez o primeiro post! Você ganhou ${pointsAdded.toLocaleString("pt-BR")} ConfiPoints`,
            },
            referral_first_review: {
              title: "⭐ Primeira Avaliação!",
              message: `${referredUserName} fez a primeira avaliação! Você ganhou ${pointsAdded.toLocaleString("pt-BR")} ConfiPoints`,
            },
            referral_active_30_days: {
              title: "🔥 30 Dias Ativo!",
              message: `${referredUserName} completou 30 dias ativo! Você ganhou ${pointsAdded.toLocaleString("pt-BR")} ConfiPoints`,
            },
          };

          const notificationData = referralMessages[body.action_type];

          if (notificationData) {
            // Criar notificação
            await supabaseAuth.from("notifications").insert({
              user_id: user.id,
              type: "achievement",
              title: notificationData.title,
              message: notificationData.message,
              action_url: "/confipoints/dashboard",
              priority: "high",
              metadata: {
                referral_type: body.action_type,
                points_received: pointsAdded,
                referred_user_id:
                  body.related_user_id || metadata.related_user_id,
                referred_user_name: referredUserName,
                referral_id: body.referral_id || metadata.referral_id,
                type: "referral_points_received",
              },
              is_read: false,
            });

            // Enviar push notification
            try {
              const { NotificationService } =
                await import("@/services/NotificationService");
              await NotificationService.sendPushNotification(
                user.id,
                notificationData.title,
                notificationData.message,
              );
            } catch (pushError) {
              console.warn(
                "⚠️ [Points Add API] Erro ao enviar push notification:",
                pushError,
              );
            }

            console.log(
              `✅ [Points Add API] Notificação de referral criada: ${body.action_type}`,
            );
          }
        } catch (notifError) {
          console.error(
            "⚠️ [Points Add API] Erro ao criar notificação de referral:",
            notifError,
          );
          // Não falhar a adição de pontos por causa da notificação
        }
      }

      return NextResponse.json({
        success: true,
        points_added: pointsAdded,
        new_balance: data.new_balance,
        message: data.message || "Pontos adicionados com sucesso",
      });
    } catch (error) {
      console.error("Erro na API de adicionar pontos:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
