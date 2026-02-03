import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { NotificationService } from "@/services/NotificationService";

interface UsePostLikesProps {
  postId: string;
  postOwnerId: string;
  postOwnerName: string;
}

export function usePostLikes({
  postId,
  postOwnerId,
  postOwnerName,
}: UsePostLikesProps) {
  const queryClient = useQueryClient();
  const [isLiking, setIsLiking] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      setIsLiking(true);

      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        // Remover like
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existingLike.id);

        if (error) throw error;
        return { action: "removed" };
      } else {
        // Adicionar like
        const { error } = await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: user.id,
        });

        if (error) throw error;

        // Criar notificação para o dono do post (se não for o próprio usuário)
        if (postOwnerId !== user.id) {
          try {
            await NotificationService.createLikeNotification(
              postId,
              postOwnerId,
              user.id,
              user.user_metadata?.full_name || "Usuário",
            );

            // Enviar push notification
            await NotificationService.sendPushNotification(
              postOwnerId,
              "Nova curtida!",
              `${user.user_metadata?.full_name || "Usuário"} curtiu seu post`,
            );
          } catch (notificationError) {
            console.warn(
              "Erro ao criar notificação de curtida:",
              notificationError,
            );
            // Não falhar a operação por causa da notificação
          }
        }

        return { action: "added" };
      }
    },
    onSuccess: () => {
      // Invalidar cache da timeline
      queryClient.invalidateQueries({
        queryKey: ["unified-timeline"],
      });

      // Invalidar cache específico do post
      queryClient.invalidateQueries({
        queryKey: ["post", postId],
      });
    },
    onError: (error) => {
      console.error("Erro ao curtir post:", error);
    },
    onSettled: () => {
      setIsLiking(false);
    },
  });

  const toggleLike = () => {
    if (!isLiking) {
      likeMutation.mutate();
    }
  };

  return {
    toggleLike,
    isLiking,
    isLiked: false, // Será determinado pelo componente pai baseado no estado atual
  };
}
