import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";
import webpush from "web-push";

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
}

/**
 * POST /api/notifications/send
 *
 * Envia uma notificação push para um usuário específico.
 *
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem enviar notificações push
 * - ✅ Previne spam e notificações falsas
 */
export const POST = withAdminAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const { userId, title, body, data, icon, badge } = await request.json();

      if (!userId || !title) {
        return NextResponse.json(
          { error: "userId e title são obrigatórios" },
          { status: 400 },
        );
      }

      // Validar que userId é um UUID válido
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return NextResponse.json({ error: "userId inválido" }, { status: 400 });
      }

      // Usar admin client (após validar que é admin)
      const adminSupabase = createAdminSupabaseClient();

      // Buscar subscription do usuário
      const { data: subscription, error: subError } = await adminSupabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (subError || !subscription) {
        return NextResponse.json(
          { error: "Subscription não encontrada para este usuário" },
          { status: 404 },
        );
      }

      // Preparar payload da notificação
      const payload = JSON.stringify({
        title,
        body: body || "",
        icon: icon || "/icon-192x192.png",
        badge: badge || "/icon-96x96.png",
        data: data || {},
        tag: "confilar-notification",
        requireInteraction: false,
        silent: false,
      });

      // Enviar notificação
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      await webpush.sendNotification(pushSubscription, payload);

      console.log(
        `✅ Notificação push enviada para usuário ${userId} por admin ${user.id}`,
      );

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Erro ao enviar notificação push:", error);
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
