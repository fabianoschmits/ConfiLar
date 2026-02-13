"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

/**
 * Hook centralizado para verificar se o perfil do usuário está completo.
 * Redireciona para o onboarding se faltarem informações essenciais.
 */
export function useProfileCheck() {
  const { user, profile } = useAuthContext();
  const [isChecking, setIsChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const checkProfile = useCallback(async () => {
    if (!user) {
      setIsChecking(false);
      return;
    }

    // Se já temos o perfil no contexto, verificar se o perfil_completed está marcado
    if (profile && profile.profile_completed) {
      setIsChecking(false);
      setNeedsOnboarding(false);
      return;
    }

    try {
      // Buscar do banco se não estiver no contexto ou se precisarmos de confirmação
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, location_state, location_city, profile_completed",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao verificar perfil no Supabase:", error);
        return;
      }

      if (!profileData) {
        console.log("🔍 Perfil não encontrado, sinalizando onboarding");
        setNeedsOnboarding(true);
        return;
      }

      const isProfileCompleted = profileData.profile_completed === true;

      // Verificação de segurança adicional para campos essenciais
      const hasEssentialData =
        profileData.full_name &&
        profileData.full_name !== "Usuário" &&
        profileData.phone &&
        profileData.location_state &&
        profileData.location_city;

      if (!isProfileCompleted || !hasEssentialData) {
        console.log("🔍 Perfil incompleto ou não marcado como completo");
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(false);
      }
    } catch (error) {
      console.error("Erro crítico na verificação de perfil:", error);
    } finally {
      setIsChecking(false);
    }
  }, [user, profile]);

  useEffect(() => {
    // Delay estratégico para permitir que o AuthContext carregue
    const timeoutId = setTimeout(() => {
      checkProfile();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [checkProfile]);

  return { isChecking, needsOnboarding, checkProfile };
}
