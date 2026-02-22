import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * GET /api/gestao-confi/reports
 *
 * Lista todas as denúncias do sistema.
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem visualizar denúncias
 */
export const GET = withAdminAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const adminSupabase = createAdminSupabaseClient();

      // Buscar denúncias
      const { data: reports, error } = await adminSupabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar denúncias:", error);
        return NextResponse.json(
          { error: "Erro ao buscar denúncias" },
          { status: 500 },
        );
      }

      // Enriquecer com informações dos usuários e contexto
      const enrichedReports = await Promise.all(
        (reports || []).map(async (report) => {
          let reporter = null;
          let reportedUser = null;
          let reportedPost = null;
          let classifiedAd = null;
          let conversationMessages = null;
          let reviewDetails = null;
          let reportedComment = null;

          // Buscar informações do denunciante
          if (report.reporter_id) {
            const { data: reporterData } = await adminSupabase
              .from("profiles")
              .select("id, full_name, email, user_type, avatar_url")
              .eq("id", report.reporter_id)
              .single();
            reporter = reporterData;
          }

          // Buscar informações do usuário denunciado
          if (report.reported_user_id) {
            const { data: reportedUserData } = await adminSupabase
              .from("profiles")
              .select("id, full_name, email, user_type, avatar_url")
              .eq("id", report.reported_user_id)
              .single();
            reportedUser = reportedUserData;
          }

          // Buscar informações do post denunciado
          if (report.reported_post_id) {
            const { data: reportedPostData } = await adminSupabase
              .from("feed_posts")
              .select("id, title, content, professional_id")
              .eq("id", report.reported_post_id)
              .single();
            reportedPost = reportedPostData;
          }

          // Buscar informações do anúncio classificado denunciado
          if (report.reported_classified_id) {
            const { data: classifiedAdData } = await adminSupabase
              .from("classified_ads")
              .select("id, title, description, user_name, user_id")
              .eq("id", report.reported_classified_id)
              .single();
            classifiedAd = classifiedAdData;
          }

          // Para denúncias de conversa, buscar mensagens
          if (
            report.type === "other" &&
            report.description.includes("conversa")
          ) {
            // Buscar conversa entre os usuários
            const { data: messagesData } = await adminSupabase
              .from("messages")
              .select(
                `
              id,
              content,
              created_at,
              updated_at,
              sender_id,
              conversation_id,
              profiles!messages_sender_id_fkey(full_name, avatar_url)
            `,
              )
              .or(
                `sender_id.eq.${report.reporter_id},sender_id.eq.${report.reported_user_id}`,
              )
              .order("created_at", { ascending: true })
              .limit(50); // Últimas 50 mensagens

            conversationMessages = messagesData;
          }

          // Para denúncias de avaliação, buscar detalhes da avaliação
          if (report.reported_review_id) {
            const { data: reviewData } = await adminSupabase
              .from("reviews")
              .select(
                `
              id,
              rating_person,
              comment,
              created_at,
              reviewer_id,
              reviewed_id,
              profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
            `,
              )
              .eq("id", report.reported_review_id)
              .single();

            reviewDetails = reviewData;
          }

          // Para denúncias de comentário
          if (report.reported_comment_id) {
            const { data: commentData } = await adminSupabase
              .from("comments")
              .select("*")
              .eq("id", report.reported_comment_id)
              .single();
            reportedComment = commentData;
          }

          return {
            ...report,
            reporter,
            reported_user: reportedUser,
            reported_post: reportedPost,
            classified_ad: classifiedAd,
            conversation_messages: conversationMessages,
            review_details: reviewDetails,
            reported_comment: reportedComment,
          };
        }),
      );

      return NextResponse.json({ reports: enrichedReports });
    } catch (error) {
      console.error("Erro na API de denúncias:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);

/**
 * PUT /api/gestao-confi/reports
 *
 * Atualiza o status de uma denúncia.
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem atualizar denúncias
 */
export const PUT = withAdminAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { reportId, status, notes, resolution } = await request.json();
      const adminSupabase = createAdminSupabaseClient();

      // Buscar denúncia atual para comparar status
      const { data: currentReport } = await adminSupabase
        .from("reports")
        .select("status, reporter_id, type, reason")
        .eq("id", reportId)
        .single();

      if (!currentReport) {
        return NextResponse.json(
          { error: "Denúncia não encontrada" },
          { status: 404 },
        );
      }

      const updateData: any = { status };
      if (notes) updateData.admin_notes = notes;
      if (resolution) updateData.resolution = resolution;

      const { error } = await adminSupabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId);

      if (error) {
        console.error("Erro ao atualizar denúncia:", error);
        return NextResponse.json(
          { error: "Erro ao atualizar denúncia" },
          { status: 500 },
        );
      }

      // Enviar notificação se o status mudou
      if (currentReport.status !== status && currentReport.reporter_id) {
        try {
          await sendReportStatusNotification(
            adminSupabase,
            currentReport.reporter_id,
            reportId,
            currentReport.status,
            status,
            currentReport.type,
            currentReport.reason,
          );
        } catch (notifError) {
          console.warn(
            "⚠️ Erro ao enviar notificação de mudança de status (não crítico):",
            notifError,
          );
          // Não falha a operação se a notificação falhar
        }
      }

      console.log(`✅ Denúncia ${reportId} atualizada por admin ${user.id}`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Erro na API de atualização:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);

// Função helper para enviar notificação de mudança de status
async function sendReportStatusNotification(
  adminSupabase: any,
  reporterId: string,
  reportId: string,
  oldStatus: string,
  newStatus: string,
  reportType: string,
  reportReason: string,
) {
  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    reviewing: "Em Revisão",
    resolved: "Resolvida",
    dismissed: "Descartada",
  };

  const statusMessages: Record<string, string> = {
    reviewing:
      "Sua denúncia está sendo analisada pela nossa equipe de moderação.",
    resolved:
      'Sua denúncia foi resolvida. Verifique a resposta da moderação em "Minhas Denúncias".',
    dismissed:
      "Sua denúncia foi analisada e descartada. Caso discorde, entre em contato conosco.",
  };

  const title = `Denúncia ${statusLabels[newStatus] || newStatus}`;
  const message =
    statusMessages[newStatus] ||
    `O status da sua denúncia mudou para "${statusLabels[newStatus] || newStatus}".`;

  // Criar notificação no banco
  const { error: notifError } = await adminSupabase
    .from("notifications")
    .insert({
      user_id: reporterId,
      type: "system",
      title: title,
      message: message,
      action_url: `/minhas-denuncias`,
      priority: newStatus === "resolved" ? "high" : "normal",
      metadata: {
        report_id: reportId,
        report_type: reportType,
        report_reason: reportReason,
        old_status: oldStatus,
        new_status: newStatus,
        type: "report_status_change",
        changed_at: new Date().toISOString(),
      },
      is_read: false,
    });

  if (notifError) {
    console.error("Erro ao criar notificação de status:", notifError);
    throw notifError;
  }

  // Tentar enviar push notification
  try {
    const { data: subscription } = await adminSupabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", reporterId)
      .single();

    if (subscription) {
      const webpush = (await import("web-push")).default;
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
          title: title,
          body: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
          icon: "/icon-192x192.png",
          badge: "/icon-96x96.png",
          data: {
            report_id: reportId,
            type: "report_status_change",
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
      }
    }
  } catch (pushError) {
    console.warn(
      "⚠️ Erro ao enviar push notification (não crítico):",
      pushError,
    );
  }
}

/**
 * DELETE /api/gestao-confi/reports
 *
 * Deleta uma denúncia.
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem deletar denúncias
 */
export const DELETE = withAdminAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const reportId = searchParams.get("id");

      if (!reportId) {
        return NextResponse.json(
          { error: "ID da denúncia é obrigatório" },
          { status: 400 },
        );
      }

      const adminSupabase = createAdminSupabaseClient();

      const { error } = await adminSupabase
        .from("reports")
        .delete()
        .eq("id", reportId);

      if (error) {
        console.error("Erro ao deletar denúncia:", error);
        return NextResponse.json(
          { error: "Erro ao deletar denúncia" },
          { status: 500 },
        );
      }

      console.log(`✅ Denúncia ${reportId} deletada por admin ${user.id}`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Erro na API de exclusão:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
