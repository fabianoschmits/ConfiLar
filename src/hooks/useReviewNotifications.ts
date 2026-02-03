import { useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { NotificationService } from "@/services/NotificationService";

/**
 * Hook para notificações relacionadas a avaliações
 */
export function useReviewNotifications() {
  const { user } = useAuthContext();

  // Notificar nova avaliação
  const notifyNewReview = useCallback(
    async (
      recipientId: string,
      reviewerName: string,
      rating: number,
      reviewId: string,
    ) => {
      if (!user) return;

      try {
        await NotificationService.notifyNewReview(
          recipientId,
          reviewerName,
          rating,
          reviewId,
        );
      } catch (error) {
        console.error("Erro ao notificar nova avaliação:", error);
      }
    },
    [user],
  );

  // Notificar avaliação respondida
  const notifyReviewResponse = useCallback(
    async (recipientId: string, response: string) => {
      if (!user) return;

      try {
        await NotificationService.createNotification({
          user_id: recipientId,
          title: "Avaliação respondida",
          message: `Resposta: ${response}`,
          type: "like", // Usando 'like' como fallback
          priority: "normal",
          action_url: "/avaliacoes",
        });
      } catch (error) {
        console.error("Erro ao notificar resposta de avaliação:", error);
      }
    },
    [user],
  );

  // Notificar mudança de avaliação
  const notifyReviewUpdate = useCallback(
    async (recipientId: string, oldRating: number, newRating: number) => {
      if (!user) return;

      try {
        await NotificationService.createNotification({
          user_id: recipientId,
          title: "Avaliação atualizada",
          message: `Sua avaliação foi alterada de ${oldRating} para ${newRating} estrelas`,
          type: "like", // Usando 'like' como fallback
          priority: "normal",
          action_url: "/avaliacoes",
        });
      } catch (error) {
        console.error("Erro ao notificar atualização de avaliação:", error);
      }
    },
    [user],
  );

  // Notificar avaliação removida
  const notifyReviewRemoval = useCallback(
    async (recipientId: string, reviewerName: string) => {
      if (!user) return;

      try {
        await NotificationService.createNotification({
          user_id: recipientId,
          title: "Avaliação removida",
          message: `${reviewerName} removeu sua avaliação`,
          type: "like", // Usando 'like' como fallback
          priority: "normal",
          action_url: "/avaliacoes",
        });
      } catch (error) {
        console.error("Erro ao notificar remoção de avaliação:", error);
      }
    },
    [user],
  );

  return {
    notifyNewReview,
    notifyReviewResponse,
    notifyReviewUpdate,
    notifyReviewRemoval,
  };
}
