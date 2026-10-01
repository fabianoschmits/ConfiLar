"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Coins,
  CreditCard,
  CheckCircle,
  Star,
  Zap,
  Crown,
  Gift,
  TrendingUp,
  Info,
  Heart,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { usePoints } from "@/hooks/usePoints";
import { usePointsPackages } from "@/hooks/useEconomy";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";
import { MicroInteraction } from "@/components/ui/MicroInteraction";
import { PackageSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge";

export default function ComprarPontosPage() {
  const t = useTranslations("confipoints");
  const tCommon = useTranslations("common");
  const { user, profile } = useAuthContext();
  const { balance: pointsData, loading: pointsLoading } = usePoints(user?.id);
  const { packages: dbPackages, loading: packagesLoading } =
    usePointsPackages();
  const [selectedPackage, setSelectedPackage] = useState<{
    id: string;
    name: string;
    points: number;
    price: string;
    priceValue: number;
    bonus: number;
  } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  if (pointsLoading || packagesLoading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="app-screen bg-[var(--cl-paper)] p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <PackageSkeleton />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Configuração visual estática dos pacotes baseada no slug
  const packageVisuals: Record<
    string,
    { icon: React.ReactNode; color: string }
  > = {
    iniciante: {
      icon: <CheckCircle className="w-6 h-6" />,
      color: "blue",
    },
    popular: {
      icon: <Star className="w-6 h-6" />,
      color: "green",
    },
    premium: {
      icon: <Crown className="w-6 h-6" />,
      color: "purple",
    },
    enterprise: {
      icon: <Gift className="w-6 h-6" />,
      color: "amber",
    },
    mega: {
      icon: <TrendingUp className="w-6 h-6" />,
      color: "red",
    },
    pro_monthly: {
      icon: <Crown className="w-6 h-6" />,
      color: "amber",
    },
    gold: {
      icon: <Zap className="w-6 h-6" />,
      color: "amber",
    },
  };

  const calculateMaxDays = (points: number, type: "POST" | "AD") => {
    const prices =
      type === "POST"
        ? [
            PREMIUM_PRICES.POST_30_DAYS,
            PREMIUM_PRICES.POST_14_DAYS,
            PREMIUM_PRICES.POST_7_DAYS,
            PREMIUM_PRICES.POST_1_DAY,
          ]
        : [
            PREMIUM_PRICES.AD_30_DAYS,
            PREMIUM_PRICES.AD_14_DAYS,
            PREMIUM_PRICES.AD_7_DAYS,
            PREMIUM_PRICES.AD_1_DAY,
          ];

    let remaining = points;
    let days = 0;

    // Ensure sorted descending by price/points
    const sortedPrices = [...prices].sort((a, b) => b.POINTS - a.POINTS);

    for (const price of sortedPrices) {
      const count = Math.floor(remaining / price.POINTS);
      if (count > 0) {
        days += count * (price.DAYS || 1);
        remaining -= count * price.POINTS;
      }
    }
    return days;
  };

  const packages = dbPackages
    .filter((pkg) => Object.keys(packageVisuals).includes(pkg.slug))
    .map((pkg) => {
      const visual = packageVisuals[pkg.slug] || packageVisuals.starter;
      const bonusPoints = pkg.total_points - pkg.points;
      const totalPoints = pkg.total_points;

      // Cálculo dinâmico de funcionalidades baseadas nos pontos totais e preços atuais
      const likesCount = Math.floor(totalPoints / PREMIUM_PRICES.LIKE.POINTS);

      const maxPostDays = calculateMaxDays(totalPoints, "POST");
      const maxAdDays = calculateMaxDays(totalPoints, "AD");

      // Descrição de uso dinâmico (O que você pode fazer?)
      const options = [];
      if (maxPostDays > 0) {
        options.push(
          `${maxPostDays} ${maxPostDays > 1 ? "Dias" : "Dia"} de Post Premium`,
        );
      }
      if (maxAdDays > 0) {
        options.push(
          `${maxAdDays} ${maxAdDays > 1 ? "Dias" : "Dia"} de Anúncio Premium`,
        );
      }
      options.push(`${likesCount} ${t("premiumLikes")}`);

      const uses = options.join(` ${t("or")} `);

      return {
        id: pkg.id,
        slug: pkg.slug,
        name: pkg.name,
        points: pkg.points,
        price: pkg.price_brl.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        priceValue: pkg.price_brl,
        bonus: bonusPoints,
        popular: pkg.is_featured,
        description: pkg.description || "",
        icon: visual.icon,
        color: visual.color,
        uses,
      };
    })
    .sort((a, b) => a.priceValue - b.priceValue);

  const activePackage = packages.find((pkg) => pkg.slug === expandedPackage);

  const benefits = [
    {
      icon: <Crown className="w-5 h-5 text-[var(--cl-ink-secondary)]" />,
      title: t("benefit1.title"),
      description: t("benefit1.description"),
    },
    {
      icon: <Heart className="w-5 h-5 text-[var(--cl-ink-secondary)]" />,
      title: t("benefit2.title"),
      description: t("benefit2.description"),
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-[var(--cl-ink-secondary)]" />,
      title: t("benefit3.title"),
      description: t("benefit3.description"),
    },
    {
      icon: <Gift className="w-5 h-5 text-[var(--cl-ink-secondary)]" />,
      title: t("benefit4.title"),
      description: t("benefit4.description"),
    },
  ];

  // Lógica para restrição de compra Pro
  const isCurrentlyPro =
    profile?.is_pro &&
    profile?.pro_expires_at &&
    new Date(profile.pro_expires_at) > new Date();

  const getProRemainingTime = () => {
    if (!profile?.pro_expires_at) return null;
    const expiresAt = new Date(profile.pro_expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const proRemainingTime = getProRemainingTime();

  return (
    <MainLayout requireAuth={true}>
      <div className="app-screen bg-[var(--cl-paper)]">
        <div className="app-page">
          <div className="mx-auto max-w-6xl">
            {/* Header - Mobile Optimized with Brand Color */}
            <PageHeader
              title={t("buyPoints")}
              description={t("acquirePoints")}
              icon={ShoppingCart}
              backHref="/confipoints/dashboard"
            />

            {/* Saldo Atual - Compact & Discreet */}
            {user && (
              <div className="mb-3 p-2 border border-[var(--cl-border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-[var(--cl-teal)]" />
                    <div>
                      <p className="text-xs text-[var(--cl-ink-muted)]">
                        {t("balance")}
                      </p>
                      <p className="text-sm font-bold text-[var(--cl-ink)]">
                        {pointsData?.balance || 0} pts
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs px-2 py-0"
                  >
                    {pointsData?.level || "Bronze"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Conversão - Compact Single Line */}
            <div className="mb-4 p-3 border border-[var(--cl-border)] rounded-lg">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-[var(--cl-teal)]" />
                  <span className="text-sm font-semibold text-[var(--cl-ink)]">
                    {t("conversionExample")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                  >
                    {t("postPrice", { points: PREMIUM_PRICES.POST.POINTS })}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                  >
                    {t("likePrice", { points: PREMIUM_PRICES.LIKE.POINTS })}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Pacotes - Mobile Optimized Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--cl-ink)]">
                  {t("choosePackage")}
                </h2>
                {isCurrentlyPro && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800 flex items-center gap-1.5 py-1 px-3">
                    <Crown className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">
                      Você é ConfiLar Pro!
                    </span>
                  </Badge>
                )}
              </div>

              {/* Banner de Assinatura Ativa (Apenas para Pro) */}
              {isCurrentlyPro && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 border border-amber-200 dark:border-amber-800 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <Crown className="w-16 h-16 text-amber-600" />
                  </div>
                  <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--cl-ink)]">
                          Assinatura ConfiLar Pro Ativa
                        </h3>
                        <p className="text-sm text-[var(--cl-ink-secondary)]">
                          Aproveite todos os seus benefícios exclusivos.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-2 px-4 rounded-lg border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <div className="text-sm">
                        <span className="text-[var(--cl-ink-muted)] font-medium mr-1">
                          Próxima renovação em:
                        </span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {proRemainingTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {/* Package Details Modal */}
                <ResponsiveModal
                  isOpen={expandedPackage !== null}
                  onOpenChange={(open) => !open && setExpandedPackage(null)}
                  title={activePackage?.name}
                  className="max-w-md"
                  centered
                >
                  {activePackage && (
                    <div className="space-y-6">
                      {/* Icon & Description */}
                      <div className="text-center">
                        <div className="mx-auto mb-3 w-16 h-16 bg-[var(--cl-mist)] border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-[var(--cl-teal)]">
                          {activePackage.icon}
                        </div>
                        <p className="text-sm text-[var(--cl-ink-secondary)]">
                          {activePackage.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="p-4 border border-[var(--cl-border)] rounded-lg text-center">
                        <div className="text-3xl font-bold text-[var(--cl-ink)] mb-2">
                          {activePackage.price}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Coins className="w-5 h-5 text-[var(--cl-teal)]" />
                          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            {activePackage.points.toLocaleString("pt-BR")}{" "}
                            pontos
                          </span>
                        </div>

                        {/* Pro Badge Preview */}
                        {activePackage.slug === "pro_monthly" && (
                          <div className="flex items-center justify-center mt-2 mb-1 gap-2 bg-[var(--cl-mist)]/50 py-1.5 rounded-full w-fit mx-auto px-4 border border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-medium text-[var(--cl-ink-muted)]">
                              Receba:
                            </span>
                            <ProVerifiedBadge
                              isVerified={true}
                              isPro={true}
                              iconSize={3}
                            />
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-500">
                              ConfiLar Pro
                            </span>
                          </div>
                        )}
                        {activePackage.bonus > 0 && (
                          <>
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700"
                            >
                              +{activePackage.bonus.toLocaleString("pt-BR")}{" "}
                              bônus
                            </Badge>
                            <p className="text-sm text-[var(--cl-ink-muted)] mt-2 font-semibold">
                              Total:{" "}
                              {(
                                activePackage.points + activePackage.bonus
                              ).toLocaleString("pt-BR")}{" "}
                              pontos
                            </p>
                          </>
                        )}
                      </div>

                      {/* Equivalent */}
                      <div className="p-3 border border-[var(--cl-border)] rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Equivalente a:
                        </p>
                        <p className="text-sm text-[var(--cl-ink-secondary)]">
                          {activePackage.uses}
                        </p>
                      </div>

                      {/* Pro Benefits Section */}
                      {activePackage.slug === "pro_monthly" && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-left mb-4">
                          <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center text-sm">
                            <Crown className="w-4 h-4 mr-2" /> Vantagens
                            ConfiLar Pro
                          </h4>
                          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc pl-4">
                            <li>Badge Exclusiva Pro + Verificado</li>
                            <li>Prioridade máxima nas buscas</li>
                            <li>3000 ConfiPoints mensais</li>
                            <li>Destaque em recomendações</li>
                          </ul>
                          <div className="mt-3 flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                              Limite de 1 assinatura a cada 30 dias.{" "}
                              {isCurrentlyPro ? (
                                <span className="text-amber-600 font-bold">
                                  Você já é Pro! Disponível para nova compra em:{" "}
                                  {proRemainingTime}.
                                </span>
                              ) : (
                                "Ao comprar, você recebe os pontos e 30 dias de status Pro. Após esse período, sua conta retorna ao normal até a próxima renovação."
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Purchase Button */}
                      <Button
                        className={`w-full h-12 text-base ${
                          activePackage.popular
                            ? "bg-[var(--cl-teal)] hover:brightness-95 text-white"
                            : "bg-gray-800 hover:bg-gray-900 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-gray-900"
                        } ${
                          activePackage.slug === "pro_monthly" &&
                          (!profile?.is_verified || isCurrentlyPro)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={
                          activePackage.slug === "pro_monthly" &&
                          (isCurrentlyPro || !profile?.is_verified)
                        }
                        onClick={() => {
                          if (
                            activePackage.slug === "pro_monthly" &&
                            !profile?.is_verified
                          ) {
                            toast.error(
                              "Você precisa verificar sua identidade para assinar o ConfiLar Pro.",
                            );
                            return;
                          }

                          if (
                            activePackage.slug === "pro_monthly" &&
                            isCurrentlyPro
                          ) {
                            toast.error(
                              `Você já possui uma assinatura Pro ativa. Disponível para nova compra em ${proRemainingTime}.`,
                            );
                            return;
                          }

                          setSelectedPackage({
                            id: activePackage.id,
                            name: activePackage.name,
                            points: activePackage.points,
                            price: activePackage.price,
                            priceValue: activePackage.priceValue,
                            bonus: activePackage.bonus,
                          });
                          setExpandedPackage(null);
                          setIsCheckoutOpen(true);
                        }}
                      >
                        {activePackage.slug === "pro_monthly" ? (
                          !profile?.is_verified ? (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Requer Verificação
                            </>
                          ) : isCurrentlyPro ? (
                            <>
                              <Clock className="w-5 h-5 mr-2" />
                              Renovação em {proRemainingTime}
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              Assinar ConfiLar Pro
                            </>
                          )
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Comprar Agora
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </ResponsiveModal>

                {packages.map((pkg) => {
                  const isExpanded = expandedPackage === pkg.slug;

                  return (
                    <div key={pkg.id} className="relative">
                      {/* Compact Card */}
                      <button
                        onClick={() =>
                          setExpandedPackage(isExpanded ? null : pkg.slug)
                        }
                        className={`w-full p-3 border rounded-lg transition-all text-center ${
                          pkg.popular
                            ? "border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-900"
                            : "border-[var(--cl-border)] hover:border-gray-300 dark:hover:border-gray-700"
                        } ${isExpanded ? "ring-2 ring-gray-900 dark:ring-gray-100" : ""}`}
                      >
                        {pkg.popular && (
                          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-[var(--cl-cta)] text-white dark:text-[var(--cl-on-cta)] px-2 py-0.5 text-xs border-0">
                            ⭐
                          </Badge>
                        )}

                        <div className="mb-2 mx-auto w-8 h-8 bg-[var(--cl-mist)] border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-[var(--cl-teal)]">
                          {pkg.icon}
                        </div>

                        <h3 className="text-xs font-bold text-[var(--cl-ink)] mb-1">
                          {pkg.name}
                        </h3>

                        <p className="text-sm font-bold text-[var(--cl-ink)] mb-0.5">
                          {pkg.price}
                        </p>

                        <div className="flex items-center justify-center gap-1">
                          <Coins className="w-3 h-3 text-[var(--cl-teal)]" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {pkg.points.toLocaleString("pt-BR")}
                          </span>
                        </div>

                        {pkg.slug === "pro_monthly" && (
                          <div className="flex items-center justify-center mt-1.5 gap-1.5">
                            <ProVerifiedBadge
                              isVerified={true}
                              isPro={true}
                              iconSize={3}
                              className="w-3.5 h-3.5"
                            />
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500">
                              ConfiLar Pro
                            </span>
                          </div>
                        )}

                        {pkg.bonus > 0 && (
                          <Badge
                            variant="secondary"
                            className="mt-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs border-0 px-1 py-0"
                          >
                            +{pkg.bonus}
                          </Badge>
                        )}

                        {pkg.slug === "pro_monthly" && isCurrentlyPro && (
                          <div className="mt-1">
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[9px] border-amber-200 dark:border-amber-800 animate-pulse">
                              Ativo: {proRemainingTime}
                            </Badge>
                          </div>
                        )}

                        <p className="text-xs text-[var(--cl-ink-muted)] mt-2">
                          {isExpanded ? "Fechar" : "Ver mais"}
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Benefícios - Compact (Moved Below) */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[var(--cl-ink)] mb-2">
                {t("whatCanYouDo")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="p-2 border border-[var(--cl-border)] rounded-lg text-center"
                  >
                    <div className="flex justify-center mb-1">
                      <div className="w-4 h-4 text-[var(--cl-ink-secondary)]">
                        {benefit.icon}
                      </div>
                    </div>
                    <h4 className="text-xs font-semibold text-[var(--cl-ink)]">
                      {t(`benefit${index + 1}.title`)}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabela de Preços das Ações - Compact */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[var(--cl-ink)] mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[var(--cl-ink-secondary)]" />
                {t("premiumActionsCostTable")}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 border border-[var(--cl-border)] rounded-lg text-center">
                  <Heart className="w-4 h-4 text-[var(--cl-ink-secondary)] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-[var(--cl-ink)]">
                    {PREMIUM_PRICES.LIKE.POINTS} pts
                  </p>
                  <p className="text-xs text-[var(--cl-ink-muted)]">
                    {t("premiumLike")}
                  </p>
                </div>

                <div className="p-2 border border-[var(--cl-border)] rounded-lg text-center">
                  <Crown className="w-4 h-4 text-[var(--cl-ink-secondary)] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-[var(--cl-ink)]">
                    {PREMIUM_PRICES.POST.POINTS} pts
                  </p>
                  <p className="text-xs text-[var(--cl-ink-muted)]">
                    {t("premiumPost")}
                  </p>
                </div>

                <div className="p-2 border border-[var(--cl-border)] rounded-lg text-center">
                  <Star className="w-4 h-4 text-[var(--cl-ink-secondary)] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-[var(--cl-ink)]">
                    {PREMIUM_PRICES.AD_1_DAY.POINTS} pts
                  </p>
                  <p className="text-xs text-[var(--cl-ink-muted)]">
                    {t("premiumAd")}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações Adicionais - Compact */}
            <details className="border border-[var(--cl-border)] rounded-lg p-3">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[var(--cl-ink)]">
                <Info className="w-4 h-4 text-[var(--cl-ink-secondary)]" />
                Informações Importantes
              </summary>
              <ul className="text-xs text-[var(--cl-ink-secondary)] space-y-1 mt-2 ml-6">
                <li>• R$ 1,00 = 100 ConfiPoints</li>
                <li>• Pontos não expiram</li>
                <li>• Pagamento seguro via PIX</li>
                <li>• Transferências (taxa de 25%)</li>
                <li>• Bônus de até 25%</li>
              </ul>
            </details>
          </div>
        </div>
      </div>

      {/* Modal de Checkout */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setSelectedPackage(null);
        }}
        packageData={selectedPackage}
      />
    </MainLayout>
  );
}
