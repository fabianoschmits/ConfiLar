"use client";

import { useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/LoginForm";
import { BasicSignupForm } from "@/components/forms/BasicSignupForm";
import { ArrowLeft } from "lucide-react";
import { LightModeLayout } from "@/components/layout/LightModeLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { useReferralTracking } from "@/hooks/useReferralTracking";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useTranslations } from "next-intl";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const tNav = useTranslations("navigation");
  const tCommon = useTranslations("common");
  const [activeTab, setActiveTab] = useState("login");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [referralInfo, setReferralInfo] = useState<{
    code: string;
    userName?: string;
  } | null>(null);

  // Hook de tracking de referral
  useReferralTracking();

  useEffect(() => {
    // Obter o parâmetro de aba da URL
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setActiveTab("register");
    }

    // Verificar se há mensagem de conta criada
    const message = searchParams.get("message");
    if (message === "account_created") {
      setRegistrationComplete(true);
      setActiveTab("login");
    }

    // Verificar se há código de referral na URL
    const refCode = searchParams.get("ref");
    if (refCode) {
      console.log("🔍 [AuthPage] Código de referral detectado:", refCode);
      setReferralInfo({ code: refCode });
      // Se há código de referral, mudar para aba de cadastro automaticamente
      setActiveTab("register");
      // Validar código para mostrar nome do indicador
      validateReferralCode(refCode);
    }
  }, [searchParams]);

  const validateReferralCode = async (code: string) => {
    try {
      const { data } = await fetch("/api/referrals/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }).then((r) => r.json());

      if (data?.userName) {
        setReferralInfo((prev) =>
          prev ? { ...prev, userName: data.userName } : null,
        );
      }
    } catch (err) {
      console.error("Erro ao validar código de referral:", err);
    }
  };

  const handleRegistrationComplete = () => {
    setRegistrationComplete(true);
    setActiveTab("login");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleLoginClick = () => {
    setRegistrationComplete(false);
  };

  return (
    <LightModeLayout>
      <div className="min-h-screen bg-[var(--cl-paper)]">
        {/* Header Moderno */}
        <header className="bg-[var(--cl-surface)]/80 backdrop-blur-md border-b border-[var(--cl-border)] sticky top-0 z-50 shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <BrandLogo width={160} height={40} className="object-contain" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleBackToHome}
                variant="ghost"
                size="sm"
                className="text-[var(--cl-ink-secondary)] hover:text-[var(--cl-ink)] transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>{tNav("backToHome")}</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Moderno */}
        <div className="container py-12 md:py-24">
          <div className="mx-auto max-w-md">
            {/* Auth Forms Modernas */}
            <Card className="bg-[var(--cl-surface)]/70 backdrop-blur-sm border border-[var(--cl-border)] shadow-[var(--cl-shadow)] rounded-[var(--cl-radius-card)]">
              <CardContent className="p-6">
                {/* Título de Boas-vindas */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-semibold text-[var(--cl-ink)]">
                    {t("welcome")}
                  </h1>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-[var(--cl-mist)] rounded-xl">
                    <TabsTrigger
                      value="login"
                      className="text-sm font-medium data-[state=active]:bg-[var(--cl-surface)] data-[state=active]:text-[var(--cl-ink)] data-[state=active]:shadow-sm rounded-lg"
                    >
                      {t("login")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="text-sm font-medium data-[state=active]:bg-[var(--cl-surface)] data-[state=active]:text-[var(--cl-ink)] data-[state=active]:shadow-sm rounded-lg"
                    >
                      {tNav("createAccountTab")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <Suspense
                      fallback={
                        <div className="text-center py-8">
                          <div className="w-8 h-8 bg-[var(--cl-cta)] rounded-xl mx-auto animate-pulse"></div>
                          <p className="text-[var(--cl-ink-secondary)] font-medium mt-2">
                            {tCommon("loading")}
                          </p>
                        </div>
                      }
                    >
                      <LoginForm />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <Suspense
                      fallback={
                        <div className="text-center py-8">
                          <div className="w-8 h-8 bg-[var(--cl-cta)] rounded-xl mx-auto animate-pulse"></div>
                          <p className="text-[var(--cl-ink-secondary)] font-medium mt-2">
                            {tCommon("loading")}
                          </p>
                        </div>
                      }
                    >
                      <BasicSignupForm />
                    </Suspense>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <div className="h-px bg-[var(--cl-border)] my-4"></div>
                  <div className="text-center text-sm text-[var(--cl-ink-secondary)]">
                    {tNav("termsAgreement")}{" "}
                    <a
                      href="/termos"
                      className="text-[var(--cl-teal)] underline hover:brightness-90 font-medium"
                    >
                      {tNav("termsOfUse")}
                    </a>{" "}
                    {tNav("and")}{" "}
                    <a
                      href="/privacidade"
                      className="text-[var(--cl-teal)] underline hover:brightness-90 font-medium"
                    >
                      {tNav("privacyPolicy")}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LightModeLayout>
  );
}
