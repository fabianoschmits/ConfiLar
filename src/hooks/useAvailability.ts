"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Função helper para usar o contexto de disponibilidade de forma opcional
const useAvailabilityContextOptional = () => {
  // Retorna null por padrão - o contexto será usado quando estiver implementado
  return null;
};

export interface AvailabilityState {
  isAvailable: boolean;
  loading: boolean;
  error: string | null;
}

export const useAvailability = () => {
  const { user, profile, refreshAuth } = useAuthContext();
  const availabilityContext = useAvailabilityContextOptional();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AvailabilityState>({
    isAvailable: false,
    loading: true,
    error: null,
  });

  // Carregar estado inicial da disponibilidade
  useEffect(() => {
    if (profile) {
      setState((prev) => ({
        ...prev,
        isAvailable: profile.is_available || false,
        loading: false,
      }));
    }
  }, [profile]);

  // Função para alternar disponibilidade
  const toggleAvailability = useCallback(async () => {
    if (!user || !profile) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const newAvailability = !state.isAvailable;

      // Atualizar no banco de dados
      const { error } = await supabase
        .from("profiles")
        .update({
          is_available: newAvailability,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setState((prev) => ({
        ...prev,
        isAvailable: newAvailability,
        loading: false,
      }));

      // Atualizar contexto de autenticação para refletir mudança no perfil
      await refreshAuth();

      // Atualizar contexto global se disponível
      if (availabilityContext && user) {
        availabilityContext.updateUserAvailability(user.id, newAvailability);
      }

      // Invalidar cache do timeline para atualizar posts existentes
      queryClient.invalidateQueries({
        queryKey: ["unified-timeline"],
      });
      queryClient.invalidateQueries({
        queryKey: ["timeline"],
      });

      // Mostrar mensagem de feedback com tema moderno
      if (newAvailability) {
        toast.success("Disponível para orçamentos", {
          description:
            "Agora você está disponível para receber orçamentos e ofertas de clientes",
        });

        // Mensagem informativa sobre inativação automática
        setTimeout(() => {
          toast.info("Disponibilidade automática", {
            description:
              "Você será automaticamente marcado como indisponível se ficar 7 dias sem acessar o site",
            duration: 6000,
          });
        }, 2000);
      } else {
        toast.info("Indisponível para orçamentos", {
          description:
            "Você não está mais disponível para receber orçamentos e ofertas",
        });
      }

      return newAvailability;
    } catch (error) {
      console.error("Erro ao atualizar disponibilidade:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar disponibilidade",
      }));

      // Mostrar erro com tema moderno
      toast.error("Não foi possível alterar sua disponibilidade", {
        description: "Tente novamente em alguns instantes",
      });

      return null;
    }
  }, [user, profile, state.isAvailable]);

  // Função para definir disponibilidade específica
  const setAvailability = useCallback(
    async (available: boolean) => {
      if (!user || !profile) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Atualizar no banco de dados
        const { error } = await supabase
          .from("profiles")
          .update({
            is_available: available,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) {
          throw error;
        }

        // Atualizar estado local
        setState((prev) => ({
          ...prev,
          isAvailable: available,
          loading: false,
        }));

        // Atualizar contexto de autenticação para refletir mudança no perfil
        await refreshAuth();

        // Atualizar contexto global se disponível
        if (availabilityContext && user) {
          availabilityContext.updateUserAvailability(user.id, available);
        }

        // Invalidar cache do timeline para atualizar posts existentes
        queryClient.invalidateQueries({
          queryKey: ["unified-timeline"],
        });
        queryClient.invalidateQueries({
          queryKey: ["timeline"],
        });

        // Mostrar mensagem de feedback com tema moderno
        if (available) {
          toast.success("Disponível para orçamentos", {
            description:
              "Agora você está disponível para receber orçamentos e ofertas de clientes",
          });

          // Mensagem informativa sobre inativação automática
          setTimeout(() => {
            toast.info("Disponibilidade automática", {
              description:
                "Você será automaticamente marcado como indisponível se ficar 7 dias sem acessar o site",
              duration: 6000,
            });
          }, 2000);
        } else {
          toast.info("Indisponível para orçamentos", {
            description:
              "Você não está mais disponível para receber orçamentos e ofertas",
          });
        }

        return available;
      } catch (error) {
        console.error("Erro ao definir disponibilidade:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Erro ao definir disponibilidade",
        }));

        // Mostrar erro com tema moderno
        toast.error("Não foi possível alterar sua disponibilidade", {
          description: "Tente novamente em alguns instantes",
        });

        return null;
      }
    },
    [user, profile],
  );

  return {
    ...state,
    toggleAvailability,
    setAvailability,
  };
};
