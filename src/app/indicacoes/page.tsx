"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthContext } from "@/contexts/AuthContext";
import { ReferralDashboardSkeleton } from "@/components/ui/skeleton";
import { ReferralDashboard } from "@/components/referral/ReferralDashboard";
import { ReferralLinkCard } from "@/components/referral/ReferralLinkCard";
import { ReferralHistory } from "@/components/referral/ReferralHistory";
import { ReferralLeaderboard } from "@/components/referral/ReferralLeaderboard";
import { ReferralBadge } from "@/components/referral/ReferralBadge";
import { WhoReferredMe } from "@/components/referral/WhoReferredMe";
import { ClaimReferral } from "@/components/referral/ClaimReferral";
import { useWhoReferredMe } from "@/hooks/useWhoReferredMe";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Award, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function IndicacoesPage() {
  const { user, loading } = useAuthContext();
  const {
    referrer,
    loading: loadingReferrer,
    refetch: refetchReferrer,
  } = useWhoReferredMe(user?.id);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showPointsTable, setShowPointsTable] = useState(false);
  const [showTiersBenefits, setShowTiersBenefits] = useState(false);

  if (loading) {
    return (
      <MainLayout>
        <div className="app-screen bg-[var(--cl-paper)] p-6">
          <div className="max-w-7xl mx-auto">
            <ReferralDashboardSkeleton />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="app-screen bg-[var(--cl-paper)] flex items-center justify-center p-6">
          <EmptyState
            icon={
              <Users className="h-16 w-16 text-gray-400 dark:text-gray-600" />
            }
            title="Faça login para acessar"
            description="Você precisa estar logado para ver seu programa de indicações"
            variant="centered"
            action={{
              label: "Fazer Login",
              onClick: () => (window.location.href = "/auth"),
            }}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="app-screen bg-[var(--cl-paper)]">
        <div className="app-page space-y-6">
          {/* Header */}
          <PageHeader
            title="Programa de indicações"
            description="Convide amigos e acompanhe suas recompensas."
            icon={Users}
          />

          {/* Quem me indicou / Reivindicar */}
          {!loadingReferrer &&
            (referrer ? (
              <WhoReferredMe
                referrerId={referrer.referrerId}
                referrerName={referrer.referrerName}
                referrerCode={referrer.referrerCode}
                referrerAvatar={referrer.referrerAvatar}
              />
            ) : (
              <ClaimReferral onSuccess={() => refetchReferrer()} />
            ))}

          {/* Dashboard de Estatísticas - Cards em linha única */}
          <ReferralDashboard userId={user.id} />

          {/* Link de Indicação - Full width */}
          <ReferralLinkCard userId={user.id} />

          {/* Leaderboard - Full width */}
          <ReferralLeaderboard limit={10} />

          {/* Histórico de Indicações */}
          <ReferralHistory userId={user.id} />

          {/* Tabela de Pontos - Accordion */}
          <Card>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                onClick={() => setShowPointsTable(!showPointsTable)}
                className="w-full flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-base md:text-lg text-[var(--cl-ink)]">
                    Como Ganhar Pontos
                  </h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--cl-ink-secondary)] transition-transform ${
                    showPointsTable ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {showPointsTable && (
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {pointsTable.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-600 dark:bg-green-400 rounded-full" />
                        <span className="text-sm md:text-base text-[var(--cl-ink)]">
                          {item.action}
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-bold text-green-600 dark:text-green-400">
                        +{item.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Como Funciona */}
          <Card className="bg-gradient-to-r from-[var(--cl-mist)] to-[var(--cl-mist)] dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="w-full flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-2 h-auto rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--cl-teal)] dark:text-blue-400" />
                  <h3 className="font-semibold text-sm text-[var(--cl-ink)]">
                    Como Funciona
                  </h3>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--cl-ink-secondary)] transition-transform ${
                    showHowItWorks ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {showHowItWorks && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 px-6 pb-6 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--cl-cta)] dark:bg-blue-500 text-[var(--cl-on-cta)] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-[var(--cl-ink)]">
                        Compartilhe seu link
                      </p>
                      <p className="text-sm text-[var(--cl-ink-secondary)]">
                        Use seu código exclusivo para convidar amigos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--cl-cta)] dark:bg-blue-500 text-[var(--cl-on-cta)] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-[var(--cl-ink)]">
                        Indicações enviam documentos
                      </p>
                      <p className="text-sm text-[var(--cl-ink-secondary)]">
                        Cada documento enviado confirma a indicação e te dá
                        pontos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--cl-cta)] dark:bg-blue-500 text-[var(--cl-on-cta)] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-[var(--cl-ink)]">
                        Ganhe recompensas
                      </p>
                      <p className="text-sm text-[var(--cl-ink-secondary)]">
                        Desbloqueie badges e benefícios exclusivos
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Níveis e Benefícios */}
          <Card>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                onClick={() => setShowTiersBenefits(!showTiersBenefits)}
                className="w-full flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--cl-teal)] dark:text-[var(--cl-teal)]" />
                  <h3 className="font-semibold text-base md:text-lg text-[var(--cl-ink)]">
                    Níveis e Benefícios
                  </h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--cl-ink-secondary)] transition-transform ${
                    showTiersBenefits ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {showTiersBenefits && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {tiersBenefits.map((tier, index) => (
                    <div
                      key={index}
                      className="p-2 md:p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2 mb-2">
                        {/* Badge Real */}
                        <ReferralBadge
                          tier={tier.tierKey}
                          totalReferrals={tier.minReferrals}
                          size="sm"
                        />
                        <div className="text-center">
                          <h4 className="font-bold text-xs md:text-sm text-[var(--cl-ink)]">
                            {tier.name}
                          </h4>
                          <p className="text-[10px] md:text-xs text-[var(--cl-ink-secondary)]">
                            {tier.requirement}
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, idx) => (
                          <li
                            key={idx}
                            className="text-[9px] md:text-[10px] text-[var(--cl-ink-secondary)] flex items-start gap-1"
                          >
                            <span className="text-green-600 dark:text-green-400 text-[8px] md:text-[9px]">
                              ✓
                            </span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

const pointsTable = [
  { action: "Indicação se cadastra", points: 200 },
  { action: "Indicação envia documentos", points: 150 },
  { action: "Indicação faz primeiro post", points: 100 },
  { action: "Indicação faz primeira avaliação", points: 100 },
  { action: "Indicação fica ativa por 30 dias", points: 300 },
];

const tiersBenefits = [
  {
    name: "Bronze",
    tierKey: "bronze" as const,
    minReferrals: 1,
    icon: Award,
    color: "text-amber-600",
    requirement: "1-4 indicações",
    benefits: ["Badge Bronze", "Reconhecimento no perfil"],
  },
  {
    name: "Prata",
    tierKey: "silver" as const,
    minReferrals: 5,
    icon: Award,
    color: "text-gray-400",
    requirement: "5-9 indicações",
    benefits: ["Badge Prata", "Destaque no perfil", "Título especial"],
  },
  {
    name: "Ouro",
    tierKey: "gold" as const,
    minReferrals: 10,
    icon: Award,
    color: "text-yellow-500",
    requirement: "10-24 indicações",
    benefits: ["Badge Ouro", "Prioridade em buscas", "Badge no feed"],
  },
  {
    name: "Platina",
    tierKey: "platinum" as const,
    minReferrals: 25,
    icon: Award,
    color: "text-cyan-500",
    requirement: "25-49 indicações",
    benefits: ["Badge Platina", "Perfil Premium", "Selo verificado"],
  },
  {
    name: "Diamante",
    tierKey: "diamond" as const,
    minReferrals: 50,
    icon: Sparkles,
    color: "text-blue-500",
    requirement: "50+ indicações",
    benefits: [
      "Badge Diamante",
      "Perfil VIP",
      "Reconhecimento público",
      "Features exclusivas",
    ],
  },
];
