import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/gestao-confi/reports/notify
 *
 * Envia uma notificação ao denunciante sobre a resolução de sua denúncia.
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem enviar notificações sobre denúncias
 */
export const POST = withAdminAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { reporterId, message, reportId } = await request.json();

      if (!reporterId || !message) {
        return NextResponse.json(
          { error: "reporterId e message são obrigatórios" },
          { status: 400 },
        );
      }

      // Validar que reporterId é um UUID válido
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(reporterId)) {
        return NextResponse.json(
          { error: "reporterId inválido" },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      // Buscar informações da denúncia para contexto
      const { data: report } = await adminSupabase
        .from("reports")
        .select("type, reason")
        .eq("id", reportId)
        .single();

      // Atualizar o campo resolution da denúncia com a mensagem
      await adminSupabase
        .from("reports")
        .update({ resolution: message })
        .eq("id", reportId);

      // Criar notificação no banco de dados
      const { data: notification, error: notifError } = await adminSupabase
        .from("notifications")
        .insert({
          user_id: reporterId,
          type: "system",
          title: "Denúncia Resolvida - Resposta da Moderação",
          message: message,
          action_url: `/minhas-denuncias`,
          priority: "high",
          metadata: {
            report_id: reportId,
            report_type: report?.type || "unknown",
            report_reason: report?.reason || "",
            type: "report_resolved_with_message",
            resolved_by: user.id,
            resolved_at: new Date().toISOString(),
          },
          is_read: false,
        })
        .select()
        .single();

      if (notifError) {
        console.error("Erro ao criar notificação:", notifError);
        return NextResponse.json(
          { error: "Erro ao criar notificação" },
          { status: 500 },
        );
      }

      // Tentar enviar push notification (opcional, não falha se não houver subscription)
      try {
        const { data: subscription } = await adminSupabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", reporterId)
          .single();

        if (subscription) {
          // Importar webpush dinamicamente
          const webpush = (await import("web-push")).default;

          // Configurar VAPID keys
          const vapidKeys = {
            publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
            privateKey: process.env.VAPID_PRIVATE_KEY || "",
          };

          if (vapidKeys.publicKey && vapidKeys.privateKey) {
            webpush.setVapidDetails(
              "mailto:no-reply@appconfilar.com.br",
              vapidKeys.publicKey,
              vapidKeys.privateKey,
            );

            const payload = JSON.stringify({
              title: "Denúncia Resolvida",
              body:
                message.substring(0, 100) + (message.length > 100 ? "..." : ""),
              icon: "/icon-192x192.png",
              badge: "/icon-96x96.png",
              data: {
                report_id: reportId,
                type: "report_resolved",
              },
              tag: "confilar-notification",
              requireInteraction: false,
              silent: false,
            });

            const pushSubscription = {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            };

            await webpush.sendNotification(pushSubscription, payload);
            console.log(
              `✅ Push notification enviada para denunciante ${reporterId}`,
            );
          }
        }
      } catch (pushError) {
        // Não falha a operação se push notification falhar
        console.warn(
          "⚠️ Erro ao enviar push notification (não crítico):",
          pushError,
        );
      }

      console.log(
        `✅ Notificação enviada para denunciante ${reporterId} sobre denúncia ${reportId} por admin ${user.id}`,
      );

      return NextResponse.json({
        success: true,
        notification_id: notification.id,
      });
    } catch (error) {
      console.error("Erro na API de notificação de denúncia:", error);
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
