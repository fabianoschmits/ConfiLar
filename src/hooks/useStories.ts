import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  views_count: number;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  hasNew?: boolean;
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar: string | null;
  stories: Story[];
  hasNew: boolean;
  isVerified?: boolean;
  isPro?: boolean;
  proExpiresAt?: string;
}

/**
 * Hook para gerenciar stories
 */
export function useStories() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Buscar todos os stories ativos agrupados por usuário
  const {
    data: storyGroups,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const now = new Date().toISOString();

      // Buscar stories de TODOS os usuários (sem filtro de localização)
      const { data, error } = await supabase
        .from("stories")
        .select(
          `
          id,
          user_id,
          image_url,
          created_at,
          expires_at,
          views_count,
          profiles!inner(
            id,
            full_name,
            avatar_url,
            is_verified,
            is_pro,
            pro_expires_at
          )
        `,
        )
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar stories:", error);
        return [];
      }

      // Agrupar stories por usuário
      const groupsMap = new Map<string, StoryGroup>();

      data?.forEach((story: any) => {
        const profile = story.profiles;
        const userId = story.user_id;

        if (!groupsMap.has(userId)) {
          groupsMap.set(userId, {
            userId,
            userName: profile.full_name || "Usuário",
            userAvatar: profile.avatar_url,
            stories: [],
            hasNew: false,
            isVerified: profile.is_verified,
            isPro: profile.is_pro,
            proExpiresAt: profile.pro_expires_at,
          });
        }

        const group = groupsMap.get(userId)!;
        group.stories.push({
          id: story.id,
          user_id: story.user_id,
          image_url: story.image_url,
          created_at: story.created_at,
          expires_at: story.expires_at,
          views_count: story.views_count,
          user: {
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          },
        });
      });

      // Verificar quais usuários têm stories novos (não visualizados pelo usuário atual)
      // E ordenar stories dentro de cada grupo (não visualizados primeiro)
      if (user?.id) {
        // OTIMIZAÇÃO: Buscar TODAS as views de UMA VEZ em vez de uma por grupo
        const allStoryIds = Array.from(groupsMap.values()).flatMap((group) =>
          group.stories.map((s) => s.id),
        );

        let viewedStoryIds = new Set<string>();
        if (allStoryIds.length > 0) {
          const { data: views } = await supabase
            .from("story_views")
            .select("story_id")
            .eq("viewer_id", user.id)
            .in("story_id", allStoryIds);

          viewedStoryIds = new Set(views?.map((v) => v.story_id) || []);
        }

        // Agora processar cada grupo usando o Set já carregado
        for (const group of groupsMap.values()) {
          // Ordenar stories dentro do grupo: não visualizados primeiro, visualizados depois
          group.stories.sort((a, b) => {
            const aViewed = viewedStoryIds.has(a.id);
            const bViewed = viewedStoryIds.has(b.id);

            // Se um foi visualizado e o outro não, o não visualizado vem primeiro
            if (aViewed && !bViewed) return 1;
            if (!aViewed && bViewed) return -1;

            // Se ambos têm o mesmo status de visualização, ordenar por data (mais recente primeiro)
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });

          group.hasNew = group.stories.some((s) => !viewedStoryIds.has(s.id));
        }
      } else {
        // Se não há usuário, ordenar por data (mais recente primeiro)
        for (const group of groupsMap.values()) {
          group.stories.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
        }
      }

      // Ordenar grupos: grupos com stories não visualizados primeiro
      const groupsArray = Array.from(groupsMap.values());

      if (user?.id) {
        groupsArray.sort((a, b) => {
          // Grupos com stories novos (não visualizados) vêm primeiro
          if (a.hasNew && !b.hasNew) return -1;
          if (!a.hasNew && b.hasNew) return 1;

          // Se ambos têm o mesmo status, ordenar por data do story mais recente
          const aLatestStory = a.stories[0]?.created_at || "";
          const bLatestStory = b.stories[0]?.created_at || "";
          return (
            new Date(bLatestStory).getTime() - new Date(aLatestStory).getTime()
          );
        });
      } else {
        // Se não há usuário, ordenar por data do story mais recente
        groupsArray.sort((a, b) => {
          const aLatestStory = a.stories[0]?.created_at || "";
          const bLatestStory = b.stories[0]?.created_at || "";
          return (
            new Date(bLatestStory).getTime() - new Date(aLatestStory).getTime()
          );
        });
      }

      return groupsArray;
    },
    staleTime: 1000 * 60, // Cache por 60 segundos
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
    refetchOnWindowFocus: false, // NÃO refazer ao focar janela
    refetchOnMount: false, // NÃO refazer ao montar novamente
    refetchInterval: false, // DESABILITAR refetch automático
  });

  // Mutation para criar um novo story
  const createStoryMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!user?.id) {
        console.error("❌ Erro: usuário não autenticado");
        throw new Error("Usuário não autenticado");
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

      console.log("💾 Inserindo story no banco...", {
        user_id: user.id,
        image_url: imageUrl,
        expires_at: expiresAt.toISOString(),
      });

      const { data, error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Erro ao inserir story:", error);
        throw new Error(`Erro ao criar story: ${error.message}`);
      }

      console.log("✅ Story inserido com sucesso:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("🔄 Invalidando cache de stories...");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      console.log("✅ Cache invalidado");
    },
    onError: (error) => {
      console.error("❌ Erro na mutation createStory:", error);
    },
  });

  // Mutation para registrar visualização de story
  const viewStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!user?.id) return;

      // Verificar se já visualizou
      const { data: existing } = await supabase
        .from("story_views")
        .select("id")
        .eq("story_id", storyId)
        .eq("viewer_id", user.id)
        .maybeSingle();

      if (existing) return; // Já visualizou

      // Registrar visualização
      await supabase.from("story_views").insert({
        story_id: storyId,
        viewer_id: user.id,
      });

      // The database updates the counter; viewers cannot edit another user's story.
    },
    onSuccess: () => {
      // Invalidar cache para atualizar na próxima vez que for necessário
      // NÃO fazer refetch imediato para evitar loops
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  // Mutation para excluir um story
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Buscar a URL da imagem para deletar do Storage também
      const { data: story } = await supabase
        .from("stories")
        .select("image_url")
        .eq("id", storyId)
        .eq("user_id", user.id) // Segurança
        .single();

      if (!story)
        throw new Error("Story não encontrado ou você não tem permissão");

      // 1. Deletar do banco (views e likes devem ter ON DELETE CASCADE)
      const { error: dbError } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (dbError) throw dbError;

      // 2. Deletar do Storage
      try {
        // A URL pública segue o padrão: .../feed-images/stories/user_id/timestamp.ext
        const urlParts = story.image_url.split("/feed-images/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from("feed-images").remove([filePath]);
        }
      } catch (storageError) {
        console.warn(
          "Erro ao deletar imagem do storage (não crítico):",
          storageError,
        );
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  const createStory = useCallback(
    (imageUrl: string) => {
      return createStoryMutation.mutateAsync(imageUrl);
    },
    [createStoryMutation],
  );

  const viewStory = useCallback(
    (storyId: string) => {
      viewStoryMutation.mutate(storyId);
    },
    [viewStoryMutation],
  );

  const deleteStory = useCallback(
    (storyId: string) => {
      return deleteStoryMutation.mutateAsync(storyId);
    },
    [deleteStoryMutation],
  );

  return {
    storyGroups: storyGroups || [],
    isLoading,
    createStory,
    viewStory,
    deleteStory,
    isCreating: createStoryMutation.isPending,
    isDeleting: deleteStoryMutation.isPending,
    refetch,
  };
}
