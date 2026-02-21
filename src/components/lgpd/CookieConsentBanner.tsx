"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cookie,
  Settings,
  Check,
  X,
  Shield,
  BarChart3,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytical: boolean;
  marketing: boolean;
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Sempre true
    functional: false,
    analytical: false,
    marketing: false,
  });
  const { user } = useAuthContext();

  useEffect(() => {
    // Verificar se o usuário já deu consentimento
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    } else {
      // Carregar preferências salvas
      const savedPreferences = localStorage.getItem("cookie-preferences");
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  // Sincronizar consentimento com o banco de dados quando o usuário logar
  useEffect(() => {
    if (user) {
      const consent = localStorage.getItem("cookie-consent");
      const savedPreferences = localStorage.getItem("cookie-preferences");
      const lastSyncedUser = sessionStorage.getItem(
        "cookie-consent-synced-user",
      );

      if (
        consent === "true" &&
        savedPreferences &&
        lastSyncedUser !== user.id
      ) {
        savePreferences(JSON.parse(savedPreferences));
        sessionStorage.setItem("cookie-consent-synced-user", user.id);
      }
    }
  }, [user]);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytical: true,
      marketing: true,
    };

    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      functional: false,
      analytical: false,
      marketing: false,
    };

    setPreferences(onlyEssential);
    savePreferences(onlyEssential);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = async (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", "true");
    localStorage.setItem("cookie-preferences", JSON.stringify(prefs));

    // Aplicar preferências (aqui você implementaria a lógica real)
    console.log("Cookie preferences saved:", prefs);

    // Auditoria de Consentimento (LGPD)
    if (user) {
      try {
        const consentType =
          prefs.marketing && prefs.analytical && prefs.functional
            ? "all"
            : !prefs.marketing && !prefs.analytical && !prefs.functional
              ? "essential"
              : "custom";

        await supabase.from("user_consents").insert({
          user_id: user.id,
          policy_version: "1.0",
          consent_type: consentType,
          preferences: prefs,
          user_agent:
            typeof window !== "undefined"
              ? window.navigator.userAgent
              : "Unknown",
        });
      } catch (error) {
        console.error("Erro ao salvar auditoria de consentimento:", error);
      }
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return; // Não pode ser desabilitado

    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 pointer-events-none">
      <Card className="max-w-lg mx-auto shadow-2xl border-zinc-800 bg-zinc-950/90 backdrop-blur-xl text-zinc-100 pointer-events-auto overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {!showSettings ? (
            <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Cookie className="h-4 w-4 sm:h-5 sm:w-5 text-[#00b0b0]" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs sm:text-lg tracking-tight">
                      Privacidade e Cookies
                    </h3>
                    <div className="sm:hidden">
                      <Link
                        href="/privacidade"
                        className="text-[#00b0b0] text-[10px] hover:underline"
                      >
                        Saiba mais
                      </Link>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-[10px] sm:text-sm leading-snug sm:leading-relaxed">
                    Utilizamos cookies para o funcionamento do site e para
                    melhorar sua experiência.
                  </p>
                </div>
              </div>

              <div className="flex flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-[#00b0b0] hover:bg-[#008c8c] text-white font-medium rounded-lg sm:rounded-xl h-8 sm:h-11 flex-1 shadow-lg text-[10px] sm:text-base px-0"
                >
                  Aceitar Todos
                </Button>

                <Button
                  onClick={handleRejectAll}
                  variant="secondary"
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700 rounded-lg sm:rounded-xl h-8 sm:h-11 flex-1 text-[10px] sm:text-base px-0"
                >
                  Essenciais
                </Button>

                <Button
                  onClick={() => setShowSettings(true)}
                  variant="ghost"
                  className="hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg sm:rounded-xl h-8 sm:h-11 w-8 sm:w-11 p-0 shrink-0"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              <div className="hidden sm:flex text-[10px] sm:text-xs text-zinc-500 items-center justify-center gap-1.5 opacity-80">
                <Shield className="h-3 w-3" />
                <span>Em conformidade com a LGPD.</span>
                <Link
                  href="/privacidade"
                  className="text-[#00b0b0] hover:underline font-medium"
                >
                  Saiba mais
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#00b0b0]" />
                  <h3 className="font-semibold text-lg">Preferências</h3>
                </div>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Cookies Essenciais */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-emerald-500" />
                    <div>
                      <h4 className="font-medium text-sm">Essenciais</h4>
                      <p className="text-xs text-zinc-500">
                        Garante a segurança e o login.
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] uppercase tracking-wider font-bold">
                    Obrigatório
                  </Badge>
                </div>

                {/* Cookies Analíticos */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-indigo-400" />
                    <div>
                      <h4 className="font-medium text-sm">Analíticos</h4>
                      <p className="text-xs text-zinc-500">
                        Melhorar a navegação.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => togglePreference("analytical")}
                    variant="ghost"
                    className={`h-8 w-12 rounded-full p-0 transition-colors ${preferences.analytical ? "bg-[#00b0b0] text-white" : "bg-zinc-800 text-zinc-500"}`}
                  >
                    <div
                      className={`h-6 w-6 bg-white rounded-full shadow-md transition-transform transform ${preferences.analytical ? "translate-x-2" : "-translate-x-2"}`}
                    />
                  </Button>
                </div>

                {/* Cookies de Marketing */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <div>
                      <h4 className="font-medium text-sm">Marketing</h4>
                      <p className="text-xs text-zinc-500">
                        Conteúdo personalizado.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => togglePreference("marketing")}
                    variant="ghost"
                    className={`h-8 w-12 rounded-full p-0 transition-colors ${preferences.marketing ? "bg-[#00b0b0] text-white" : "bg-zinc-800 text-zinc-500"}`}
                  >
                    <div
                      className={`h-6 w-6 bg-white rounded-full shadow-md transition-transform transform ${preferences.marketing ? "translate-x-2" : "-translate-x-2"}`}
                    />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleSavePreferences}
                  className="bg-[#00b0b0] hover:bg-[#008c8c] text-white font-medium rounded-xl h-11 flex-1 shadow-lg shadow-teal-900/20"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Preferências
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  className="text-zinc-400 hover:text-white rounded-xl h-11"
                >
                  Voltar
                </Button>
              </div>
              <div className="text-xs text-zinc-500 text-center pt-2 opacity-60">
                Você pode alterar essas configurações a qualquer momento.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
