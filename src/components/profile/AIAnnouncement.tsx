"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Bot, Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export function AIAnnouncement() {
  const { profile } = useAuthContext();
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations("editProfile");

  useEffect(() => {
    // Only show to professionals
    if (profile?.user_type !== "professional") return;

    // Check if already dismissed
    const dismissed = localStorage.getItem(
      "confilar_ai_announcement_dismissed",
    );
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem("confilar_ai_announcement_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-24 right-6 z-50 max-w-sm w-full"
      >
        <Card className="border-2 border-primary-500 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg">
                  <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  Seu Perfil Pronto para IA{" "}
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </h3>
              </div>
              <button
                onClick={dismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Agora você pode permitir que assistentes de IA (como ChatGPT)
              encontrem e recomendem seu perfil profissional. Aumente seu
              alcance!
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                onClick={() => {
                  // This is a bit of a hack but edit profile modal is usually opened via a state in the page or context
                  // For now, we'll just dismiss and point them to their settings
                  dismiss();
                  window.location.href = "#settings-privacy"; // Placeholder or trigger modal
                }}
              >
                Saber Mais
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismiss}
                className="text-gray-500"
              >
                Depois
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
