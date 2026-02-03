"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface AvailabilityContextType {
  userAvailability: Record<string, boolean>;
  updateUserAvailability: (userId: string, isAvailable: boolean) => void;
  subscribeToAvailabilityChanges: () => void;
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(
  undefined,
);

export function AvailabilityProvider({ children }: { children: ReactNode }) {
  const [userAvailability, setUserAvailability] = useState<
    Record<string, boolean>
  >({});
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Função para atualizar disponibilidade de um usuário
  const updateUserAvailability = (userId: string, isAvailable: boolean) => {
    setUserAvailability((prev) => ({
      ...prev,
      [userId]: isAvailable,
    }));

    // Invalidar cache do timeline para atualizar posts existentes
    queryClient.invalidateQueries({
      queryKey: ["unified-timeline"],
    });
    queryClient.invalidateQueries({
      queryKey: ["timeline"],
    });
  };

  // Função para se inscrever em mudanças de disponibilidade
  const subscribeToAvailabilityChanges = () => {
    if (!supabase) return;

    // Escutar mudanças na tabela profiles
    const subscription = supabase
      .channel("availability-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: "is_available=neq.null",
        },
        (payload) => {
          const { new: newProfile } = payload;
          if (
            newProfile &&
            newProfile.id &&
            typeof newProfile.is_available === "boolean"
          ) {
            updateUserAvailability(newProfile.id, newProfile.is_available);
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  // Carregar disponibilidades iniciais e se inscrever em mudanças
  useEffect(() => {
    const loadInitialAvailabilities = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, is_available")
          .not("is_available", "is", null);

        if (error) {
          console.error("Erro ao carregar disponibilidades:", error);
          return;
        }

        if (profiles) {
          const availabilities: Record<string, boolean> = {};
          profiles.forEach((profile) => {
            if (profile.id && typeof profile.is_available === "boolean") {
              availabilities[profile.id] = profile.is_available;
            }
          });
          setUserAvailability(availabilities);
        }
      } catch (error) {
        console.error("Erro ao carregar disponibilidades iniciais:", error);
      }
    };

    // Carregar dados iniciais
    loadInitialAvailabilities();

    // Se inscrever em mudanças
    const unsubscribe = subscribeToAvailabilityChanges();

    return unsubscribe;
  }, []);

  return (
    <AvailabilityContext.Provider
      value={{
        userAvailability,
        updateUserAvailability,
        subscribeToAvailabilityChanges,
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  );
}

export function useAvailabilityContext() {
  const context = useContext(AvailabilityContext);
  if (context === undefined) {
    throw new Error(
      "useAvailabilityContext must be used within an AvailabilityProvider",
    );
  }
  return context;
}
