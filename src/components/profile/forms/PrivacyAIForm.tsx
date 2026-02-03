"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot, Shield, Info, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PrivacyAIForm() {
  const { profile, refreshProfile } = useAuthContext();
  const t = useTranslations("editProfile");
  const [loading, setLoading] = useState(false);
  const [allowAI, setAllowAI] = useState(profile?.allow_ai_indexing ?? false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setAllowAI(profile.allow_ai_indexing ?? false);
    }
  }, [profile]);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    setAllowAI(checked);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ allow_ai_indexing: checked })
        .eq("id", profile?.id);

      if (error) throw error;

      await refreshProfile();
      toast.success(t("profileUpdated"));
    } catch (error) {
      console.error("Error updating AI indexing preference:", error);
      toast.error(t("errorSaving"));
      setAllowAI(!checked); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div
      ref={wrapperRef}
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="space-y-6">
        {/* Card Principal */}
        <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start justify-between">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <Bot className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("allowAiIndexing")}
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {t("aiIndexingDescription")}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Switch
                id="ai-indexing"
                checked={allowAI}
                onCheckedChange={handleToggle}
                disabled={loading}
                className="data-[state=checked]:bg-indigo-600"
              />
              <Label
                htmlFor="ai-indexing"
                className={cn(
                  "text-sm font-semibold transition-colors",
                  allowAI
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500",
                )}
              >
                {allowAI ? "Ativado" : "Desativado"}
              </Label>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white dark:border-white/5 shadow-sm">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Dados Compartilhados
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Nome, Categoria, Cidade e Telefone.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white dark:border-white/5 shadow-sm">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Privacidade LGPD
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Você tem controle total e pode desativar a qualquer momento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="flex gap-4 p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Info className="w-5 h-5 text-gray-400 shrink-0" />
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-gray-900 dark:text-white">
              Como isso ajuda você?
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Assistentes de IA modernos como ChatGPT, Claude e Perplexity estão
              se tornando a principal ferramenta de busca de profissionais. Ao
              ativar esta opção, o ConfiLar cria uma versão estruturada do seu
              perfil que essas IAs conseguem ler facilmente, aumentando suas
              chances de ser recomendado para novos clientes.
            </p>
          </div>
        </div>
      </div>

      {/* Espaçador extra para mobile */}
      <div className="h-40 sm:h-0" />
    </div>
  );
}
