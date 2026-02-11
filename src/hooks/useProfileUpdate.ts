"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Hook central para atualização de perfil de usuário.
 * Garante a sincronização entre a tabela 'profiles' e os metadados do Supabase Auth.
 */
export function useProfileUpdate() {
  const { user, refreshAuth } = useAuthContext();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (data: Record<string, any>) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return { success: false };
    }

    setIsUpdating(true);
    try {
      // 1. Atualizar ou inserir na tabela profiles no banco de dados
      // Injetamos o ID do usuário para garantir que o RLS permita a operação
      const profileData = {
        ...data,
        id: user.id,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profileData, {
          onConflict: "id",
        });

      if (profileError) {
        console.error(
          "❌ [useProfileUpdate] Erro na tabela profiles:",
          profileError,
        );
        throw profileError;
      }

      // 2. Definir quais campos devem ser replicados para o auth.metadata
      // Isso é importante porque campos como 'full_name' e 'avatar_url'
      // são usados globalmente pelo contexto de autenticação sem precisar buscar no banco.
      const metadataSyncFields = [
        "full_name",
        "phone",
        "user_type",
        "avatar_url",
        "onboarding_completed",
        "profile_completed",
        "bio",
        "cpf_cnpj",
        "country",
        "locale",
        "location_state",
        "location_city",
        "neighborhood",
        "address",
        "address_number",
        "zip_code",
      ];

      const metadataToUpdate: Record<string, any> = {};
      metadataSyncFields.forEach((field) => {
        if (data[field] !== undefined) {
          metadataToUpdate[field] = data[field];
        }
      });

      // 3. Atualizar metadados do Auth se houver campos relevantes
      if (Object.keys(metadataToUpdate).length > 0) {
        const { error: authError } = await supabase.auth.updateUser({
          data: metadataToUpdate,
        });

        if (authError) {
          // Não falhamos a operação se apenas o metadata falhar, mas logamos o aviso
          console.warn(
            "⚠️ [useProfileUpdate] Aviso: Metadados do Auth não sincronizados:",
            authError.message,
          );
        }
      }

      // 4. Recarregar o contexto global para refletir as mudanças
      await refreshAuth();

      return { success: true };
    } catch (error: any) {
      console.error("❌ [useProfileUpdate] Erro crítico:", error);
      toast.error("Erro ao salvar alterações", {
        description: error.message || "Tente novamente mais tarde.",
      });
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile,
    isUpdating,
    user,
  };
}
