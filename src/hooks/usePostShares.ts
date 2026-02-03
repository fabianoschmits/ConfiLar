import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";

interface PostShare {
  id: string;
  post_id: string;
  user_id: string;
  share_type: "user" | "link" | "whatsapp" | "messenger";
  shared_at: string;
}

export function usePostShares(postId: string) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Buscar contagem de compartilhamentos
  const { data: sharesCount, isLoading } = useQuery({
    queryKey: ["post-shares", postId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("post_shares")
          .select("id")
          .eq("post_id", postId);

        if (error) {
          // Se for erro de permissão (403) ou tabela não existir, retornar 0
          if (
            error.code === "PGRST205" ||
            error.code === "42501" ||
            error.message?.includes("403") ||
            error.message?.includes("permission denied")
          ) {
            console.log(
              "Sem permissão para acessar post_shares, retornando 0 compartilhamentos",
            );
            return 0;
          }
          throw error;
        }
        return data?.length || 0;
      } catch (error) {
        console.log("Erro ao buscar compartilhamentos, retornando 0:", error);
        return 0;
      }
    },
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
    retry: false,
  });

  // Mutation para registrar compartilhamento
  const recordShareMutation = useMutation({
    mutationFn: async (
      shareType: "user" | "link" | "whatsapp" | "messenger",
    ) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      try {
        // Verificar se o usuário já compartilhou este post com este tipo
        const { data: existingShare, error: checkError } = await supabase
          .from("post_shares")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .eq("share_type", shareType)
          .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          // Se for erro de permissão, simular sucesso
          if (
            checkError.code === "PGRST205" ||
            checkError.code === "42501" ||
            checkError.message?.includes("403") ||
            checkError.message?.includes("permission denied")
          ) {
            console.log(
              "Sem permissão para verificar post_shares, simulando registro",
            );
            return { id: "simulated", isNew: true };
          }
          throw checkError;
        }

        // Se já existe, não registrar novamente
        if (existingShare) {
          console.log(`Usuário já compartilhou este post via ${shareType}`);
          return { id: existingShare.id, isNew: false };
        }

        // Registrar novo compartilhamento
        const { data, error } = await supabase
          .from("post_shares")
          .insert({
            post_id: postId,
            user_id: user.id,
            share_type: shareType,
            shared_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          // Se for erro de permissão (403) ou tabela não existir, simular sucesso
          if (
            error.code === "PGRST205" ||
            error.code === "42501" ||
            error.message?.includes("403") ||
            error.message?.includes("permission denied")
          ) {
            console.log(
              "Sem permissão para inserir em post_shares, simulando registro",
            );
            return { id: "simulated", isNew: true };
          }
          // Se for erro de duplicata, não é um erro real
          if (error.code === "23505") {
            console.log("Compartilhamento já registrado para este post");
            return { id: "duplicate", isNew: false };
          }
          // Se for erro de foreign key constraint, simular sucesso
          if (error.code === "23503") {
            console.log("Post não existe mais, simulando registro");
            return { id: "simulated", isNew: true };
          }
          // Se for qualquer erro relacionado a post_shares, simular sucesso
          if (error.message?.includes("post_shares")) {
            console.log("Erro relacionado a post_shares, simulando registro");
            return { id: "simulated", isNew: true };
          }
          throw error;
        }
        return { id: data.id, isNew: true };
      } catch (error: any) {
        console.log(
          "Erro ao registrar compartilhamento, simulando sucesso:",
          error?.message || error,
        );
        return { id: "simulated", isNew: true };
      }
    },
    onSuccess: (data) => {
      // Atualizar cache local apenas se for um novo compartilhamento
      if (data.isNew) {
        queryClient.setQueryData(
          ["post-shares", postId],
          (oldCount: number) => (oldCount || 0) + 1,
        );
        // Invalidar query para buscar dados atualizados
        queryClient.invalidateQueries({ queryKey: ["post-shares", postId] });
      }
    },
    onError: (error: any) => {
      // Não logar erro se for duplicata ou tabela não existir
      if (
        error.message?.includes("duplicate") ||
        error.code === "23505" ||
        error.code === "PGRST205"
      ) {
        console.log("Compartilhamento já registrado ou tabela não existe");
        return;
      }
      console.error("Erro ao registrar compartilhamento:", error);
    },
  });

  // Função para registrar compartilhamento
  const recordShare = useCallback(
    (shareType: "user" | "link" | "whatsapp" | "messenger") => {
      if (!user?.id || recordShareMutation.isPending) return;

      try {
        recordShareMutation.mutate(shareType);
      } catch (error) {
        console.error("Erro ao registrar compartilhamento:", error);
      }
    },
    [user?.id, recordShareMutation],
  );

  return {
    sharesCount: sharesCount || 0,
    isLoading,
    recordShare,
    isRecording: recordShareMutation.isPending,
  };
}
