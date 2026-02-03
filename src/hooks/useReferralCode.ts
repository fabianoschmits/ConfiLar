"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useReferralCode(userId?: string) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadReferralCode();
  }, [userId]);

  const loadReferralCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_referral_stats")
        .select("referral_code")
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      setReferralCode(data.referral_code);

      // Gerar link completo - redireciona direto para a página de cadastro
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://appconfilar.com.br";

      setReferralLink(`${baseUrl}/auth?ref=${data.referral_code}`);
    } catch (err: any) {
      console.error("Erro ao carregar código de referral:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralLink) return false;

    try {
      await navigator.clipboard.writeText(referralLink);
      return true;
    } catch (err) {
      console.error("Erro ao copiar link:", err);
      return false;
    }
  };

  const shareViaWhatsApp = () => {
    if (!referralLink) return;

    const message = encodeURIComponent(
      `Olá! 👋\n\nEstou usando o ConfiLar para encontrar profissionais qualificados e está sendo ótimo!\n\nUse meu link e ganhe benefícios exclusivos:\n${referralLink}\n\nNos vemos lá! 🚀`,
    );

    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareViaTelegram = () => {
    if (!referralLink) return;

    const message = encodeURIComponent(
      `Olá! Estou usando o ConfiLar e recomendo! Use meu link: ${referralLink}`,
    );

    window.open(
      `https://t.me/share/url?url=${referralLink}&text=${message}`,
      "_blank",
    );
  };

  const shareViaEmail = () => {
    if (!referralLink) return;

    const subject = encodeURIComponent("Convite para o ConfiLar");
    const body = encodeURIComponent(
      `Olá!\n\nGostaria de te convidar para conhecer o ConfiLar, uma plataforma incrível para conectar profissionais e clientes.\n\nUsando meu link de indicação, você ganha acesso a benefícios exclusivos:\n${referralLink}\n\nEspero te ver por lá!\n\nAbraços`,
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const updateReferralCode = async (
    newCode: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Normalizar código (maiúsculas, sem espaços)
      const normalizedCode = newCode.toUpperCase().trim();

      // Validar formato: 6-12 caracteres, apenas letras (A-Z) e/ou números (0-9)
      const codeRegex = /^[A-Z0-9]{6,12}$/;
      if (!codeRegex.test(normalizedCode)) {
        setError(
          "Código inválido. Deve ter entre 6 e 12 caracteres (apenas letras e/ou números)",
        );
        return {
          success: false,
          error:
            "Código inválido. Deve ter entre 6 e 12 caracteres (apenas letras e/ou números)",
        };
      }

      // Verificar disponibilidade (opcional - pode fazer no backend também)
      const { data: existingCode } = await supabase
        .from("user_referral_stats")
        .select("user_id, referral_code")
        .ilike("referral_code", normalizedCode)
        .single();

      if (existingCode && existingCode.user_id !== userId) {
        setError("Este código já está em uso. Tente outro.");
        return {
          success: false,
          error: "Este código já está em uso. Tente outro.",
        };
      }

      // Chamar API para atualizar
      const response = await fetch("/api/referrals/update-code", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newCode: normalizedCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao atualizar código");
        return {
          success: false,
          error: result.error || "Erro ao atualizar código",
        };
      }

      // Atualizar estado local
      setReferralCode(result.referralCode);

      // Atualizar link
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://appconfilar.com.br";
      setReferralLink(`${baseUrl}/auth?ref=${result.referralCode}`);

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao atualizar código";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    referralCode,
    referralLink,
    loading,
    error,
    copyToClipboard,
    shareViaWhatsApp,
    shareViaTelegram,
    shareViaEmail,
    updateReferralCode,
    refresh: loadReferralCode,
  };
}

export function useValidateReferralCode() {
  const [validating, setValidating] = useState(false);

  const validateCode = async (
    code: string,
  ): Promise<{
    valid: boolean;
    userId?: string;
    userName?: string;
  }> => {
    try {
      setValidating(true);

      const { data, error } = await supabase
        .from("user_referral_stats")
        .select(
          `
          user_id,
          profiles!inner (
            full_name
          )
        `,
        )
        .eq("referral_code", code)
        .single();

      if (error || !data) {
        return { valid: false };
      }

      // profiles vem como array, pegar o primeiro
      const profile = Array.isArray(data.profiles)
        ? data.profiles[0]
        : data.profiles;

      return {
        valid: true,
        userId: data.user_id,
        userName: profile?.full_name || "Usuário",
      };
    } catch (err) {
      console.error("Erro ao validar código de referral:", err);
      return { valid: false };
    } finally {
      setValidating(false);
    }
  };

  return { validateCode, validating };
}
