import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";
import webpush from "web-push";

// Configurar VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || "",
};
let vapidReady = false;

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  try {
    webpush.setVapidDetails(
      "mailto:no-reply@appconfilar.com.br",
      vapidKeys.publicKey,
      vapidKeys.privateKey,
    );
    vapidReady = true;
  } catch (error) {
    console.error("Erro ao configurar VAPID no send route:", error);
  }
}

/**
 * POST /api/notifications/send
 *
 * Envia uma notificação push para um usuário específico.
 *
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Admins podem enviar para qualquer um
 * - ✅ Usuários comuns só podem testar notificações para si mesmos
 */
export const POST = withAuth(
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

      if (userId !== user.id) {
        const { data: admin } = await supabaseAuth
          .from("admins")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();
        if (!admin)
          return NextResponse.json(
            {
              error:
                "Envio direto para outros usuários restrito a administradores",
            },
            { status: 403 },
          );
      }
      if (
        typeof title !== "string" ||
        title.length > 200 ||
        (body && (typeof body !== "string" || body.length > 2000))
      ) {
        return NextResponse.json(
          { error: "Conteúdo da notificação inválido" },
          { status: 400 },
        );
      }
      if (!vapidReady)
        return NextResponse.json(
          {
            error:
              "Notificações push indisponíveis: configuração do servidor pendente",
          },
          { status: 503 },
        );

      // Usar admin client para buscar subscription (independente de quem enviou)
      const adminSupabase = createAdminSupabaseClient();

      // Buscar subscription do destinatário
      const { data: subscription, error: subError } = await adminSupabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError || !subscription) {
        // Se for admin pedindo teste, avisar que não tem sub
        console.warn(`⚠️ Subscription não encontrada para usuário ${userId}`);
        return NextResponse.json(
          {
            error:
              "O destinatário não possui inscrição ativa para notificações push",
          },
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
        requireInteraction: false, // Pode ser configurado dinamicamente
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

      console.log(`✅ Notificação push enviada de ${user.id} para ${userId}`);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Erro ao enviar notificação push:", error);

      // Se a subscription expirou ou é inválida, podemos removê-la aqui se quisermos

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
