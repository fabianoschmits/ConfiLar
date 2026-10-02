import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { detectYouTubeUrls, removeYouTubeUrls } from "@/utils/youtube";
import { validPremiumPurchase } from "@/lib/premium-purchase";

export const POST = withAuth(
  async (request: NextRequest, _supabaseAuth, user) => {
    try {
      const {
        action = "create",
        postId,
        title,
        description,
        images,
        location_city,
        location_state,
        service_category_id,
        pointsToSpend,
        durationDays,
      } = await request.json();
      if (
        !validPremiumPurchase("POST", durationDays, pointsToSpend) ||
        !["create", "renew"].includes(action) ||
        (action === "renew" && !postId) ||
        (action === "create" &&
          (typeof description !== "string" ||
            (!description.trim() && !(Array.isArray(images) && images.length))))
      ) {
        return NextResponse.json(
          { error: "Plano premium ou conteúdo inválido." },
          { status: 400 },
        );
      }
      const admin = createAdminSupabaseClient();
      if (action === "renew") {
        const { data: existing, error } = await admin
          .from("feed_posts")
          .select("user_id")
          .eq("id", postId)
          .single();
        if (error || !existing)
          return NextResponse.json(
            { error: "Publicação não encontrada" },
            { status: 404 },
          );
        if (existing.user_id !== user.id)
          return NextResponse.json(
            { error: "Permissão negada" },
            { status: 403 },
          );
      }
      const expiresAt = new Date(
        Date.now() + durationDays * 86400000,
      ).toISOString();
      const metadata: Record<string, unknown> = {
        type: "premium",
        points_spent: pointsToSpend,
        duration_days: durationDays,
        expires_at: expiresAt,
        [action === "create" ? "created_at" : "renewed_at"]:
          new Date().toISOString(),
      };
      const payload: Record<string, unknown> = {
        user_id: user.id,
        is_premium: true,
        is_featured: true,
        premium_points_spent: pointsToSpend,
        premium_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
        metadata,
      };
      if (action === "create") {
        const video = detectYouTubeUrls(description)[0];
        if (video) {
          metadata.youtube_video_id = video.id;
          metadata.youtube_video_url = video.url;
        }
        const content = removeYouTubeUrls(description);
        const { data: profile } = await admin
          .from("profiles")
          .select("country")
          .eq("id", user.id)
          .single();
        Object.assign(payload, {
          professional_id: user.id,
          title: title || content.slice(0, 100) || "Post Premium",
          description: content,
          content,
          images: images || [],
          service_category_id: service_category_id || null,
          location_city,
          location_state,
          location_country: profile?.country || "BR",
          is_active: true,
          is_public: true,
          premium_highlight_color: "#FFD700",
          tags: ["premium"],
        });
      }
      const { data: post, error } = await admin.rpc(
        "purchase_premium_content",
        {
          p_user_id: user.id,
          p_kind: "POST",
          p_record_id: action === "renew" ? postId : null,
          p_payload: payload,
          p_points: pointsToSpend,
          p_credit: null,
        },
      );
      if (error || !post)
        return NextResponse.json(
          {
            error:
              "Não foi possível confirmar a compra. Verifique seu saldo e tente novamente.",
          },
          { status: 400 },
        );
      return NextResponse.json({ success: true, post });
    } catch {
      return NextResponse.json(
        { error: "Dados inválidos ou falha ao processar a publicação." },
        { status: 400 },
      );
    }
  },
);
