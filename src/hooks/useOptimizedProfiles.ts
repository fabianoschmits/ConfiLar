import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QueryKeys, CacheUtils } from "@/lib/queryClient";

interface Profile {
  id: string;
  full_name: string;
  user_type: string;
  avatar_url: string;
  bio?: string;
  location_state?: string;
  location_city?: string;
  rating?: number;
  total_reviews?: number;
  is_available?: boolean;
  is_pro?: boolean;
  pro_expires_at?: string;
  created_at: string;
}

interface ProfileFilters {
  user_type?: "client" | "professional";
  location_state?: string;
  location_city?: string;
  is_available?: boolean;
  search?: string;
}

// Hook para buscar perfil específico com cache
export function useProfile(userId: string) {
  return useQuery({
    queryKey: QueryKeys.profile(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          user_type,
          avatar_url,
          bio,
          location_state,
          location_city,
          neighborhood,
          professional_services,
          professional_experience_years,
          professional_certifications,
          badge,
          rating,
          total_reviews,
          is_verified,
          is_available,
          is_pro,
          pro_expires_at,
          created_at
        `,
        )
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    retry: CacheUtils.RETRY_CONFIG.CRITICAL.retry,
    retryDelay: CacheUtils.RETRY_CONFIG.CRITICAL.retryDelay,
  });
}

// Hook para buscar perfis com filtros e paginação
export function useProfiles(
  filters: ProfileFilters = {},
  page = 0,
  limit = 20,
) {
  return useQuery({
    queryKey: QueryKeys.profileSearch({ ...filters, page, limit }),
    queryFn: async () => {
      let query = supabase.from("profiles").select(
        `
          id,
          full_name,
          user_type,
          avatar_url,
          bio,
          location_state,
          location_city,
          rating,
          total_reviews,
          is_verified,
          is_available,
          is_pro,
          pro_expires_at,
          created_at
        `,
        { count: "exact" },
      );

      // Filtrar perfis ocultos
      query = query.eq("is_hidden", false);

      // Aplicar filtros
      if (filters.user_type) {
        query = query.eq("user_type", filters.user_type);
      }
      if (filters.location_state) {
        query = query.eq("location_state", filters.location_state);
      }
      if (filters.location_city) {
        query = query.eq("location_city", filters.location_city);
      }
      if (filters.is_available !== undefined) {
        query = query.eq("is_available", filters.is_available);
      }
      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`,
        );
      }

      // Paginação
      query = query
        .order("created_at", { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        profiles: data as Profile[],
        total: count || 0,
        hasMore: (count || 0) > (page + 1) * limit,
      };
    },
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    retry: CacheUtils.RETRY_CONFIG.IMPORTANT.retry,
    retryDelay: CacheUtils.RETRY_CONFIG.IMPORTANT.retryDelay,
  });
}

// Hook para atualizar perfil
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Profile>;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data, variables) => {
      // Invalidar cache do perfil específico
      queryClient.invalidateQueries({
        queryKey: QueryKeys.profile(variables.userId),
      });

      // Invalidar cache de busca de perfis
      queryClient.invalidateQueries({ queryKey: QueryKeys.profiles });
    },
  });
}

// Hook para estatísticas de perfis
export function useProfileStats(userId: string) {
  return useQuery({
    queryKey: ["profile-stats", userId],
    queryFn: async () => {
      // Buscar estatísticas em paralelo
      const [viewsResult, reviewsResult, messagesResult] = await Promise.all([
        // Visualizações do perfil
        supabase.from("profile_views").select("id").eq("profile_id", userId),

        // Avaliações recebidas
        supabase
          .from("reviews")
          .select("id, rating_person")
          .eq("reviewed_id", userId),

        // Mensagens enviadas/recebidas
        supabase
          .from("messages")
          .select("id")
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
      ]);

      const viewsCount = viewsResult.data?.length || 0;
      const reviewsCount = reviewsResult.data?.length || 0;
      const averageRating =
        reviewsResult.data?.length > 0
          ? reviewsResult.data.reduce(
              (sum, review) => sum + review.rating_person,
              0,
            ) / reviewsResult.data.length
          : 0;
      const messagesCount = messagesResult.data?.length || 0;

      return {
        viewsCount,
        reviewsCount,
        averageRating,
        messagesCount,
      };
    },
    enabled: !!userId,
    staleTime: CacheUtils.CACHE_TIMES.DYNAMIC,
    gcTime: CacheUtils.CACHE_TIMES.DYNAMIC * 2,
    retry: CacheUtils.RETRY_CONFIG.OPTIONAL.retry,
    retryDelay: CacheUtils.RETRY_CONFIG.OPTIONAL.retryDelay,
  });
}
