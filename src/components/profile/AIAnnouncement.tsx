"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Bot, Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useTutorial } from "@/contexts/TutorialContext";

export function AIAnnouncement() {
  const { profile, updateProfile } = useAuthContext();
  const { isActive: isTutorialActive } = useTutorial();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const t = useTranslations("editProfile");

  useEffect(() => {
    // Se não for profissional ou já tiver indexação ativa, garantir que o banner esteja oculto
    if (
      profile?.user_type !== "professional" ||
      profile?.allow_ai_indexing ||
      profile?.hide_ai_announcement
    ) {
      if (isVisible) setIsVisible(false);
      return;
    }

    // Não mostrar se o tutorial estiver ativo
    if (isTutorialActive) {
      if (isVisible) setIsVisible(false);
      return;
    }

    // Verificar se já foi descartado nesta SESSÃO (aparece de novo no próximo login)
    const sessionDismissed = sessionStorage.getItem(
      "confilar_ai_announcement_session_dismissed",
    );

    if (!sessionDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    } else {
      if (isVisible) setIsVisible(false);
    }
  }, [
    profile?.user_type,
    profile?.allow_ai_indexing,
    profile?.hide_ai_announcement,
    isTutorialActive,
    isVisible,
  ]);

  const dismissTemporarily = () => {
    setIsVisible(false);
    sessionStorage.setItem(
      "confilar_ai_announcement_session_dismissed",
      "true",
    );
  };

  const dismissPermanently = async () => {
    try {
      setIsUpdating(true);
      await updateProfile({ hide_ai_announcement: true });
      setIsVisible(false);
    } catch (error) {
      console.error("Erro ao ocultar anúncio de IA permanentemente:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 z-50 md:max-w-sm"
      >
        <Card className="border border-primary-500/50 shadow-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-600"></div>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100/50 dark:bg-primary-900/30 rounded-xl border border-primary-200/50 dark:border-primary-800/50">
                  <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  {t("announcementTitle")}{" "}
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                </h3>
              </div>
              <button
                onClick={dismissTemporarily}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
              {t("announcementBody")}
            </p>

            <div className="flex gap-3">
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md active:scale-95 transition-all dark:bg-primary-600 dark:hover:bg-primary-700"
                onClick={() => {
                  dismissTemporarily();
                  // Disparar evento para abrir o modal de perfil na aba de privacidade
                  const event = new CustomEvent("confilar:open-profile-modal", {
                    detail: { tab: "privacy" },
                  });
                  window.dispatchEvent(event);
                }}
              >
                {t("activateNow")}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={dismissTemporarily}
                className="border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                {t("later")}
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-800">
                <Switch
                  id="dont-show"
                  checked={false}
                  onCheckedChange={(checked) => {
                    if (checked) dismissPermanently();
                  }}
                  disabled={isUpdating}
                  className="data-[state=checked]:bg-primary-600"
                />
                <Label
                  htmlFor="dont-show"
                  className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  {isUpdating ? t("saving") : t("dontShowAgain")}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
