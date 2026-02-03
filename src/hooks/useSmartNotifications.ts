import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export interface SmartNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "engagement" | "recommendation" | "achievement" | "safety" | "trending";
  category:
    | "like"
    | "comment"
    | "mention"
    | "recommendation"
    | "badge"
    | "warning"
    | "trending";
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: {
    post_id?: string;
    comment_id?: string;
    user_id?: string;
    user_name?: string;
    badge_type?: string;
    engagement_count?: number;
  };
  created_at: string;
}

export function useSmartNotifications() {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["smart-notifications"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          id,
          user_id,
          title,
          message,
          type,
          category,
          is_read,
          action_url,
          action_label,
          metadata,
          created_at
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as SmartNotification[];
    },
    staleTime: 1000 * 60 * 1, // Cache por 1 minuto
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["smart-notifications"],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["smart-notifications"],
      });
    },
  });

  // Atualizar contador de não lidas
  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return {
    notifications: notifications || [],
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}

// Hook para criar notificações inteligentes
export function useCreateSmartNotification() {
  const queryClient = useQueryClient();

  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: {
      user_id: string;
      title: string;
      message: string;
      type: SmartNotification["type"];
      category: SmartNotification["category"];
      action_url?: string;
      action_label?: string;
      metadata?: SmartNotification["metadata"];
    }) => {
      const { data, error } = await supabase
        .from("notifications")
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["smart-notifications"],
      });
    },
  });

  const createEngagementNotification = (
    userId: string,
    postId: string,
    type: "like" | "comment" | "mention",
  ) => {
    const messages = {
      like: "curtiu seu post",
      comment: "comentou seu post",
      mention: "mencionou você em um comentário",
    };

    createNotificationMutation.mutate({
      user_id: userId,
      title: "Nova Interação",
      message: `Alguém ${messages[type]} no ConfiLar`,
      type: "engagement",
      category: type,
      action_url: `/feed#post-${postId}`,
      action_label: "Ver post",
      metadata: { post_id: postId },
    });
  };

  const createRecommendationNotification = (
    userId: string,
    recommenderName: string,
  ) => {
    createNotificationMutation.mutate({
      user_id: userId,
      title: "Nova Recomendação",
      message: `${recommenderName} recomendou você no ConfiLar`,
      type: "recommendation",
      category: "recommendation",
      action_url: "/reputacao",
      action_label: "Ver reputação",
      metadata: { user_name: recommenderName },
    });
  };

  const createAchievementNotification = (userId: string, badgeType: string) => {
    createNotificationMutation.mutate({
      user_id: userId,
      title: "Nova Conquista",
      message: `Parabéns! Você ganhou o badge ${badgeType}`,
      type: "achievement",
      category: "badge",
      action_url: "/perfil",
      action_label: "Ver perfil",
      metadata: { badge_type: badgeType },
    });
  };

  const createSafetyNotification = (userId: string, message: string) => {
    createNotificationMutation.mutate({
      user_id: userId,
      title: "Aviso de Segurança",
      message,
      type: "safety",
      category: "warning",
      action_url: "/ajuda",
      action_label: "Saiba mais",
    });
  };

  const createTrendingNotification = (userId: string, postId: string) => {
    createNotificationMutation.mutate({
      user_id: userId,
      title: "Post em Alta",
      message: "Seu post está em destaque na sua cidade!",
      type: "trending",
      category: "trending",
      action_url: `/feed#post-${postId}`,
      action_label: "Ver post",
      metadata: { post_id: postId },
    });
  };

  return {
    createEngagementNotification,
    createRecommendationNotification,
    createAchievementNotification,
    createSafetyNotification,
    createTrendingNotification,
    isCreating: createNotificationMutation.isPending,
  };
}
