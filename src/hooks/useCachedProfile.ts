"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/database";

interface UseCachedProfileOptions {
  userId?: string;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useCachedProfile(options: UseCachedProfileOptions = {}) {
  const {
    userId,
    enabled = true,
    staleTime = 5 * 60 * 1000,
    cacheTime = 10 * 60 * 1000,
  } = options;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: enabled && !!userId,
    staleTime,
    gcTime: cacheTime,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCachedProfiles(userIds: string[]) {
  return useQuery({
    queryKey: ["profiles", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (error) throw error;
      return data as Profile[];
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook para invalidar cache de perfil
export function useInvalidateProfile() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
  };
}
