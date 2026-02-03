"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function useProfileCheck() {
  const { user, profile } = useAuthContext();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      // Verificar se já está na página de onboarding ou editar perfil para evitar loop
      const currentPath = window.location.pathname;
      if (
        currentPath === "/onboarding" ||
        currentPath.startsWith("/editarperfil") ||
        currentPath === "/editar-perfil"
      ) {
        setIsChecking(false);
        return;
      }

      try {
        // Buscar perfil no banco para verificação completa
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select(
            "id, full_name, phone, location_state, location_city, profile_completed, user_type",
          )
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar perfil:", error);
          setIsChecking(false);
          return;
        }

        // Se não tem perfil no banco, redirecionar para onboarding
        if (!profileData) {
          console.log(
            "🔍 Perfil não encontrado, redirecionando para onboarding",
          );
          router.push("/onboarding");
          setIsChecking(false);
          return;
        }

        // Verificar se o perfil tem dados básicos preenchidos
        const hasBasicData =
          profileData.full_name &&
          profileData.full_name !== "Usuário" &&
          profileData.full_name.trim() !== "" &&
          profileData.phone &&
          profileData.phone.trim() !== "" &&
          profileData.location_state &&
          profileData.location_city;

        // Verificar se o perfil foi marcado como completado
        const isProfileCompleted = profileData.profile_completed === true;

        console.log("🔍 Verificação do perfil:", {
          hasBasicData,
          isProfileCompleted,
          full_name: profileData.full_name,
          phone: profileData.phone,
          location_state: profileData.location_state,
          location_city: profileData.location_city,
        });

        // Se o perfil não tem dados básicos OU não foi marcado como completado, redirecionar para onboarding
        if (!hasBasicData || !isProfileCompleted) {
          console.log("🔍 Perfil incompleto, redirecionando para onboarding");
          router.push("/onboarding");
        } else {
          console.log("✅ Perfil completo, permitindo acesso");
        }
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Adicionar um delay para evitar verificações muito rápidas
    const timeoutId = setTimeout(() => {
      checkProfile();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [user, profile, router]);

  return { isChecking };
}
