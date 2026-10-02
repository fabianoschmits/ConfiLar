"use client";

import { useState, useEffect } from "react";
import { withPrivateProfile } from "@/lib/private-profile";
import { supabase } from "@/lib/supabase";

export interface CompleteProfileData {
  // Dados básicos
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  profile_photo_url: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  name: string | null;

  // Localização
  location_state: string | null;
  location_city: string | null;
  neighborhood: string | null;
  address: string | null;

  // Dados pessoais
  birth_date: string | null;
  idade: number | null;
  gender: "male" | "female" | "other" | null;
  escolaridade:
    | "ensino_fundamental_incompleto"
    | "ensino_fundamental_completo"
    | "ensino_medio_incompleto"
    | "ensino_medio_completo"
    | "ensino_superior_incompleto"
    | "ensino_superior_completo"
    | "pos_graduacao"
    | "mestrado"
    | "doutorado"
    | null;
  filhos: number | null;
  estado_civil:
    | "solteiro"
    | "casado"
    | "divorciado"
    | "viuvo"
    | "uniao_estavel"
    | "outro"
    | null;

  // Dados profissionais
  user_type: "client" | "professional";
  professional_services: string[] | null;
  professional_experience_years: number | null;
  professional_certifications: string[] | null;
  referencia_profissional: string | null;
  turno_trabalho: "manha" | "tarde" | "noite" | "integral" | "flexivel" | null;
  professional_portfolio_url: string | null;

  // Estatísticas
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_pro?: boolean;
  pro_expires_at?: string | null;
  verification_status:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | null;
  is_available: boolean;
  badge: string;
  points_balance: number | null;
  user_level: string | null;

  // Datas
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
  last_profile_update: string | null;

  // Verificação
  client_verification_document: string | null;
  selfie_document_url: string | null;
  residence_proof_url: string | null;

  // Outros
  profile_completed: boolean | null;
  profile_completion_score: number | null;
  cpf_cnpj: string | null;

  // Redes Sociais
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  whatsapp_number: string | null;

  // Campos adicionais do Profile
  address_number: string | null;
  zip_code: string | null;
  allow_ai_indexing: boolean | null;
  hide_ai_announcement: boolean | null;
}

export function useProfileData(userId: string) {
  const [profile, setProfile] = useState<CompleteProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select(
            `
            id,
            email,
            full_name,
            avatar_url,
            profile_photo_url,
            bio,
            phone,
            whatsapp,
            name,
            location_state,
            location_city,
            neighborhood,
            address,
            birth_date,
            idade,
            gender,
            escolaridade,
            filhos,
            estado_civil,
            user_type,
            professional_services,
            professional_experience_years,
            professional_certifications,
            referencia_profissional,
            turno_trabalho,
            professional_portfolio_url,
            rating,
            rating,
            total_reviews,
            is_verified,
            is_pro,
            pro_expires_at,
            verification_status,
            is_available,
            badge,
            points_balance,
            user_level,
            created_at,
            updated_at,
            last_login_at,
            last_profile_update,
            client_verification_document,
            selfie_document_url,
            residence_proof_url,
            profile_completed,
            profile_completion_score,
            cpf_cnpj,
            instagram_url,
            facebook_url,
            linkedin_url,
            twitter_url,
            youtube_url,
            tiktok_url,
            whatsapp_number,
            address_number,
            zip_code,
            allow_ai_indexing,
            hide_ai_announcement
          `,
          )
          .eq("id", userId)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            setError("Perfil não encontrado");
          } else {
            throw fetchError;
          }
          return;
        }

        setProfile(await withPrivateProfile(data));
      } catch (err: any) {
        console.error("Erro ao buscar perfil:", err);
        setError("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}

// Funções auxiliares para formatação
export const formatEscolaridade = (escolaridade: string | null): string => {
  if (!escolaridade) return "Não informado";
  const mapping: Record<string, string> = {
    ensino_fundamental_incompleto: "Ensino Fundamental Incompleto",
    ensino_fundamental_completo: "Ensino Fundamental Completo",
    ensino_medio_incompleto: "Ensino Médio Incompleto",
    ensino_medio_completo: "Ensino Médio Completo",
    ensino_superior_incompleto: "Ensino Superior Incompleto",
    ensino_superior_completo: "Ensino Superior Completo",
    pos_graduacao: "Pós-Graduação",
    mestrado: "Mestrado",
    doutorado: "Doutorado",
  };
  return mapping[escolaridade] || escolaridade;
};

export const formatEstadoCivil = (estado_civil: string | null): string => {
  if (!estado_civil) return "Não informado";
  const mapping: Record<string, string> = {
    solteiro: "Solteiro(a)",
    casado: "Casado(a)",
    divorciado: "Divorciado(a)",
    viuvo: "Viúvo(a)",
    uniao_estavel: "União Estável",
    outro: "Outro",
  };
  return mapping[estado_civil] || estado_civil;
};

export const formatTurnoTrabalho = (turno_trabalho: string | null): string => {
  if (!turno_trabalho) return "Não informado";
  const mapping: Record<string, string> = {
    manha: "Manhã",
    tarde: "Tarde",
    noite: "Noite",
    integral: "Turno Integral",
    flexivel: "Horário Flexível",
  };
  return mapping[turno_trabalho] || turno_trabalho;
};

export const formatGender = (gender: string | null): string => {
  if (!gender) return "Não informado";
  const mapping: Record<string, string> = {
    male: "Masculino",
    female: "Feminino",
    other: "Outro",
  };
  return mapping[gender] || gender;
};
