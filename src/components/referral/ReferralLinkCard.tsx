"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Check,
  Share2,
  Mail,
  MessageCircle,
  Send,
  Edit2,
  X,
  Loader2,
} from "lucide-react";
import { useReferralCode } from "@/hooks/useReferralCode";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ReferralLinkCardProps {
  userId: string;
  className?: string;
}

export function ReferralLinkCard({ userId, className }: ReferralLinkCardProps) {
  const {
    referralCode,
    referralLink,
    loading,
    copyToClipboard,
    shareViaWhatsApp,
    shareViaTelegram,
    shareViaEmail,
    updateReferralCode,
    refresh,
  } = useReferralCode(userId);

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "idle" | "available" | "unavailable" | "invalid"
  >("idle");

  // Inicializar código ao entrar em modo de edição
  useEffect(() => {
    if (isEditing && referralCode) {
      setEditCode(referralCode);
      setAvailabilityStatus("idle");
    }
  }, [isEditing, referralCode]);

  // Validar e verificar disponibilidade do código em tempo real
  useEffect(() => {
    if (!isEditing || !editCode.trim()) {
      setAvailabilityStatus("idle");
      return;
    }

    const normalizedCode = editCode.toUpperCase().trim();

    // Validar formato: 6-12 caracteres, apenas letras (A-Z) e/ou números (0-9)
    const codeRegex = /^[A-Z0-9]{6,12}$/;

    if (normalizedCode.length < 6) {
      setAvailabilityStatus("invalid");
      return;
    }

    if (!codeRegex.test(normalizedCode)) {
      setAvailabilityStatus("invalid");
      return;
    }

    // Se é o mesmo código atual, considerar disponível
    if (normalizedCode === referralCode) {
      setAvailabilityStatus("available");
      return;
    }

    // Verificar disponibilidade com debounce
    const timeoutId = setTimeout(async () => {
      setIsCheckingAvailability(true);
      try {
        const { data: existingCode } = await supabase
          .from("user_referral_stats")
          .select("user_id, referral_code")
          .ilike("referral_code", normalizedCode)
          .single();

        if (existingCode && existingCode.user_id !== userId) {
          setAvailabilityStatus("unavailable");
        } else {
          setAvailabilityStatus("available");
        }
      } catch (error) {
        // Se não encontrou, está disponível
        setAvailabilityStatus("available");
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [editCode, isEditing, referralCode, userId]);

  const handleCopy = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!editCode.trim()) {
      toast.error("Digite um código");
      return;
    }

    if (availabilityStatus !== "available") {
      toast.error("Código inválido ou já está em uso");
      return;
    }

    setIsSaving(true);
    try {
      const normalizedCode = editCode.toUpperCase().trim();
      const result = await updateReferralCode(normalizedCode);

      if (result.success) {
        toast.success("Código atualizado com sucesso!");
        setIsEditing(false);
        setEditCode("");
        setAvailabilityStatus("idle");
        await refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar código");
      }
    } catch (error) {
      toast.error("Erro ao atualizar código. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditCode("");
    setAvailabilityStatus("idle");
  };

  const handleCodeChange = (value: string) => {
    // Permitir apenas letras e números, converter para maiúsculas
    const cleanValue = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    // Limitar a 12 caracteres
    const limitedValue = cleanValue.slice(0, 12);
    setEditCode(limitedValue);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn("border-2 border-blue-200 dark:border-blue-800", className)}
    >
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Seu Link Exclusivo de Indicação
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Código de Referral */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Seu Código Pessoal
            </label>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-7 text-xs"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Alterar
              </Button>
            )}
          </div>

          {!isEditing ? (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <code className="flex-1 text-lg font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                {referralCode}
              </code>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Input
                  value={editCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="Digite seu código personalizado"
                  className={cn(
                    "text-lg font-bold tracking-wider uppercase",
                    availabilityStatus === "invalid" &&
                      "border-red-500 focus:border-red-500",
                    availabilityStatus === "unavailable" &&
                      "border-red-500 focus:border-red-500",
                    availabilityStatus === "available" &&
                      "border-green-500 focus:border-green-500",
                  )}
                  maxLength={12}
                />
                {isCheckingAvailability && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              {/* Feedback de validação */}
              {editCode && (
                <div className="text-xs">
                  {availabilityStatus === "invalid" && (
                    <p className="text-red-600 dark:text-red-400">
                      Código deve ter entre 6 e 12 caracteres (apenas letras
                      e/ou números)
                    </p>
                  )}
                  {availabilityStatus === "unavailable" && (
                    <p className="text-red-600 dark:text-red-400">
                      Este código já está em uso. Tente outro.
                    </p>
                  )}
                  {availabilityStatus === "available" && (
                    <p className="text-green-600 dark:text-green-400">
                      ✓ Código disponível!
                    </p>
                  )}
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    availabilityStatus !== "available" ||
                    !editCode.trim() ||
                    editCode.length < 6
                  }
                  size="sm"
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Salvar
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>

              {/* Dica */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Você pode usar apenas letras, apenas números, ou ambos. Ex:
                "fabianoschmits", "123456", "fabiano123"
              </p>
            </div>
          )}
        </div>

        {/* Link Completo */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Link para Compartilhar
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={referralLink || ""}
              readOnly
              className="font-mono text-sm bg-white dark:bg-gray-900"
            />
            <Button
              onClick={handleCopy}
              variant={copied ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Botões de Compartilhamento */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Compartilhar via
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={shareViaWhatsApp}
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-500"
            >
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-xs">WhatsApp</span>
            </Button>

            <Button
              onClick={shareViaTelegram}
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-500"
            >
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs">Telegram</span>
            </Button>

            <Button
              onClick={shareViaEmail}
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-500"
            >
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs">E-mail</span>
            </Button>
          </div>
        </div>

        {/* Dica */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            💡 <strong>Dica:</strong> Compartilhe seu link nas redes sociais,
            grupos de WhatsApp ou com amigos. Quanto mais pessoas se cadastrarem
            usando seu link, mais pontos e badges você ganha!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
