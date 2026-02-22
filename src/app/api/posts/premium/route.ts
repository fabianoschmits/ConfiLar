import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authenticatedRoute";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { detectYouTubeUrls, removeYouTubeUrls } from "@/utils/youtube";

/**
 * POST /api/posts/premium
 *
 * Cria ou renova um post premium deduzindo pontos via server-side.
 */
export const POST = withAuth(
  async (request: NextRequest, supabaseAuth, user) => {
    try {
      const body = await request.json();
      const {
        action = "create", // "create" ou "renew"
        postId, // Necessário para renovação
        title,
        description,
        images,
        location_city,
        location_state,
        service_category_id,
        pointsToSpend,
        durationDays,
      } = body;

      const authenticatedUserId = user.id;
      const adminSupabase = createAdminSupabaseClient();

      // 1. Processar pagamento ANTES de criar/renovar
      const { data: deductRes, error: pointsError } = await adminSupabase.rpc(
        "deduct_points",
        {
          p_user_id: authenticatedUserId,
          p_points: pointsToSpend,
          p_source:
            action === "create" ? "premium_post" : "premium_post_renewal",
          p_description: `${action === "create" ? "Criou" : "Renovou"} post premium (${durationDays} dias)`,
        },
      );

      if (pointsError || (deductRes && !deductRes.success)) {
        console.error(
          "Erro ao deduzir pontos no post premium:",
          pointsError || deductRes?.error,
        );
        return NextResponse.json(
          {
            error:
              deductRes?.error ||
              "Saldo insuficiente ou erro ao debitar pontos.",
          },
          { status: 400 },
        );
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      let result;

      if (action === "create") {
        // Processar YouTube e Descrição
        const youtubeVideos = detectYouTubeUrls(description || "");
        const firstVideo = youtubeVideos.length > 0 ? youtubeVideos[0] : null;
        const cleanedDescription = removeYouTubeUrls(description || "");
        const titleToUse =
          title || cleanedDescription.slice(0, 100) || "Post Premium";

        const metadata: any = {
          type: "premium",
          points_spent: pointsToSpend,
          duration_days: durationDays,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        };

        if (firstVideo) {
          metadata.youtube_video_id = firstVideo.id;
          metadata.youtube_video_url = firstVideo.url;
        }

        // Buscar país do perfil
        const { data: profile } = await adminSupabase
          .from("profiles")
          .select("country")
          .eq("id", authenticatedUserId)
          .single();

        const { data: post, error: postError } = await adminSupabase
          .from("feed_posts")
          .insert({
            professional_id: authenticatedUserId,
            user_id: authenticatedUserId,
            title: titleToUse,
            description: cleanedDescription,
            content: cleanedDescription,
            images: images || [],
            service_category_id: service_category_id || null,
            location_city,
            location_state,
            location_country: profile?.country || "BR",
            is_active: true,
            is_public: true,
            is_featured: true,
            is_premium: true,
            premium_points_spent: pointsToSpend,
            premium_expires_at: expiresAt.toISOString(),
            premium_highlight_color: "#FFD700",
            tags: ["premium"],
            metadata: metadata,
          })
          .select()
          .single();

        if (postError) {
          console.error("Erro ao inserir post premium:", postError);
          return NextResponse.json(
            { error: "Erro ao registrar post no banco de dados" },
            { status: 500 },
          );
        }
        result = post;
      } else {
        // Renovar
        if (!postId)
          return NextResponse.json(
            { error: "postId é necessário para renovação" },
            { status: 400 },
          );

        const { data: post, error: updateError } = await adminSupabase
          .from("feed_posts")
          .update({
            is_premium: true,
            is_featured: true,
            premium_points_spent: pointsToSpend,
            premium_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              type: "premium",
              points_spent: pointsToSpend,
              duration_days: durationDays,
              expires_at: expiresAt.toISOString(),
              renewed_at: new Date().toISOString(),
            },
          })
          .eq("id", postId)
          .eq("user_id", authenticatedUserId)
          .select()
          .single();

        if (updateError) {
          console.error("Erro ao renovar post premium:", updateError);
          return NextResponse.json(
            { error: "Erro ao renovar post no banco de dados" },
            { status: 500 },
          );
        }
        result = post;
      }

      return NextResponse.json({ success: true, post: result });
    } catch (error) {
      console.error("Erro na API de post premium:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  },
);
