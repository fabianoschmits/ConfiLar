"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
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
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { usePoints } from "@/hooks/usePoints";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";
import { MicroInteraction } from "@/components/ui/MicroInteraction";
import { PackageSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ComprarPontosPage() {
  const t = useTranslations("confipoints");
  const tCommon = useTranslations("common");
  const { user, profile } = useAuthContext();
  const { balance: pointsData, loading: pointsLoading } = usePoints(user?.id);
  const [selectedPackage, setSelectedPackage] = useState<{
    id: string;
    name: string;
    points: number;
    price: string;
    priceValue: number;
    bonus: number;
  } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (pointsLoading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
          <div className="max-w-7xl mx-auto">
            <PackageSkeleton />
          </div>
        </div>
      </MainLayout>
    );
  }

  const packages = [
    {
      id: "starter",
      name: t("packageStarter"),
      points: 1000,
      price: "R$ 10,00",
      priceValue: 10,
      bonus: 0,
      popular: false,
      description: t("packageStarterDesc"),
      icon: <Zap className="w-8 h-8" />,
      color: "blue",
      features: [
        `1.000 ${t("title")}`,
        `${Math.floor(1000 / PREMIUM_PRICES.LIKE.POINTS)} ${t("premiumLikes")}`,
        `${Math.floor(1000 / PREMIUM_PRICES.POST.POINTS)} ${t("premiumPost")}`,
        `${Math.floor(1000 / PREMIUM_PRICES.AD_1_DAY.POINTS)} ${t("premiumAd")}`,
      ],
      uses: `1 ${t("premiumPost")} ${t("or")} ${Math.floor(1000 / PREMIUM_PRICES.LIKE.POINTS)} ${t("premiumLikes")}`,
    },
    {
      id: "popular",
      name: t("packagePopular"),
      points: 5000,
      price: "R$ 50,00",
      priceValue: 50,
      bonus: 500,
      popular: true,
      description: t("packagePopularDesc"),
      icon: <Star className="w-8 h-8" />,
      color: "green",
      features: [
        `5.000 ${t("title")}`,
        `+500 ${t("bonusPoints")}`,
        `${Math.floor(5500 / PREMIUM_PRICES.LIKE.POINTS)} ${t("premiumLikes")}`,
        `${Math.floor(5500 / PREMIUM_PRICES.POST.POINTS)} ${t("premiumPosts")}`,
        `${Math.floor(5500 / PREMIUM_PRICES.AD_1_DAY.POINTS)} ${t("premiumAds")}`,
        t("emailSupport"),
      ],
      uses: `${Math.floor(5500 / PREMIUM_PRICES.POST.POINTS)} ${t("premiumPosts")} ${t("or")} ${Math.floor(5500 / PREMIUM_PRICES.LIKE.POINTS)} ${t("premiumLikes")}`,
    },
    {
      id: "professional",
      name: t("packageProfessional"),
      points: 10000,
      price: "R$ 100,00",
      priceValue: 100,
      bonus: 1500,
      popular: false,
      description: t("packageProfessionalDesc"),
      icon: <Crown className="w-8 h-8" />,
      color: "purple",
      features: [
        `10.000 ${t("title")}`,
        `+1.500 ${t("bonusPoints")} (15%)`,
        `${Math.floor(11500 / PREMIUM_PRICES.LIKE.POINTS)} ${t("premiumLikes")}`,
        `${Math.floor(11500 / PREMIUM_PRICES.POST.POINTS)} ${t("premiumPosts")}`,
        `${Math.floor(11500 / PREMIUM_PRICES.AD_1_DAY.POINTS)} ${t("premiumAds")}`,
        t("emailSupport"),
        t("exclusiveBadge"),
      ],
      uses: `${Math.floor(11500 / PREMIUM_PRICES.POST.POINTS)} ${t("premiumPosts")} ${t("or")} ${Math.floor(11500 / PREMIUM_PRICES.AD_1_DAY.POINTS)} ${t("premiumAds")}`,
    },
    {
      id: "enterprise",
      name: t("packageEnterprise"),
      points: 25000,
      price: "R$ 250,00",
      priceValue: 250,
      bonus: 5000,
      popular: false,
      description: t("packageEnterpriseDesc"),
      icon: <Gift className="w-8 h-8" />,
      color: "amber",
      features: [
        `25.000 ${t("title")}`,
        `+5.000 ${t("bonusPoints")} (20%)`,
        `${Math.floor(30000 / PREMIUM_PRICES.LIKE.POINTS)} ${t("premiumLikes")}`,
        `${Math.floor(30000 / PREMIUM_PRICES.POST.POINTS)} ${t("premiumPosts")}`,
        `${Math.floor(30000 / PREMIUM_PRICES.AD_1_DAY.POINTS)} ${t("premiumAds")}`,
        t("emailSupport"),
        t("advancedReports"),
        t("premiumConsulting"),
      ],
      uses: `${Math.floor(30000 / PREMIUM_PRICES.POST.POINTS)} ${t("premiumPosts")} ${t("or")} ${Math.floor(30000 / PREMIUM_PRICES.AD_1_DAY.POINTS)} ${t("premiumAds")}`,
    },
    {
      id: "mega",
      name: t("packageMega"),
      points: 50000,
      price: "R$ 500,00",
      priceValue: 500,
      bonus: 12500,
      popular: false,
      description: t("packageMegaDesc"),
      icon: <TrendingUp className="w-8 h-8" />,
      color: "red",
      features: [
        `50.000 ${t("title")}`,
        `+12.500 ${t("bonusPoints")} (25%)`,
        `${Math.floor(62500 / PREMIUM_PRICES.LIKE.POINTS)} ${t("premiumLikes")}`,
        `${Math.floor(62500 / PREMIUM_PRICES.POST.POINTS)} ${t("premiumPosts")}`,
        `${Math.floor(62500 / PREMIUM_PRICES.AD_1_DAY.POINTS)} ${t("premiumAds")}`,
        t("emailSupport"),
        t("maximumPriority"),
        t("earlyAccess"),
        t("vipBadge"),
      ],
      uses: `${Math.floor(62500 / PREMIUM_PRICES.POST.POINTS)} ${t("premiumPosts")} ${t("or")} ${Math.floor(62500 / PREMIUM_PRICES.AD_1_DAY.POINTS)} ${t("premiumAds")}`,
    },
  ];

  const benefits = [
    {
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      title: t("benefit1.title"),
      description: t("benefit1.description"),
    },
    {
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      title: t("benefit2.title"),
      description: t("benefit2.description"),
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: t("benefit3.title"),
      description: t("benefit3.description"),
    },
    {
      icon: <Gift className="w-6 h-6 text-blue-500" />,
      title: t("benefit4.title"),
      description: t("benefit4.description"),
    },
  ];

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t("buyPoints")}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("acquirePoints")}
                  </p>
                </div>
              </div>
            </div>

            {/* Saldo Atual */}
            {user && (
              <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                        <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("balance")}
                        </p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                          {pointsData?.balance || 0} {t("title")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    >
                      {pointsData?.level || "Bronze"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefícios */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t("whatCanYouDo")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {benefits.map((benefit, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-3">
                        {benefit.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t(`benefit${index + 1}.title`)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t(`benefit${index + 1}.description`)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Conversão */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Coins className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("conversionRate")}
                      </p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {t("conversionExample")}
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t("usageExample")}:
                    </p>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-purple-600 border-purple-600"
                      >
                        {t("postPrice", { points: PREMIUM_PRICES.POST.POINTS })}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-pink-600 border-pink-600"
                      >
                        {t("likePrice", { points: PREMIUM_PRICES.LIKE.POINTS })}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pacotes */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t("choosePackage")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {packages.map((pkg) => (
                  <MicroInteraction
                    key={pkg.id}
                    type="scale"
                    intensity={pkg.popular ? "strong" : "medium"}
                  >
                    <Card
                      className={`relative hover:shadow-xl transition-all duration-300 ${
                        pkg.popular
                          ? "ring-2 ring-green-500 shadow-lg sm:scale-105"
                          : "hover:scale-105"
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-green-500 text-white px-3 py-1 shadow-lg">
                            <Star className="w-3 h-3 mr-1" />
                            {t("mostPopular")}
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-4 pt-6">
                        <div
                          className={`mx-auto mb-3 w-16 h-16 rounded-full bg-gradient-to-br ${
                            pkg.color === "blue"
                              ? "from-blue-400 to-blue-600"
                              : pkg.color === "green"
                                ? "from-green-400 to-green-600"
                                : pkg.color === "purple"
                                  ? "from-purple-400 to-purple-600"
                                  : pkg.color === "amber"
                                    ? "from-amber-400 to-amber-600"
                                    : "from-red-400 to-red-600"
                          } flex items-center justify-center text-white shadow-lg`}
                        >
                          {pkg.icon}
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {pkg.name}
                        </CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {pkg.description}
                        </p>
                      </CardHeader>

                      <CardContent className="text-center px-4 pb-6">
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {pkg.price}
                          </div>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                              {pkg.points.toLocaleString("pt-BR")}
                            </span>
                          </div>
                          {pkg.bonus > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs"
                            >
                              +{pkg.bonus.toLocaleString("pt-BR")} {t("bonus")}
                            </Badge>
                          )}
                          {pkg.bonus > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-semibold">
                              {t("total")}:{" "}
                              {(pkg.points + pkg.bonus).toLocaleString("pt-BR")}{" "}
                              {t("points")}
                            </p>
                          )}
                        </div>

                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                            {t("equivalentTo")}:
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                            {pkg.uses}
                          </p>
                        </div>

                        <ul className="text-left space-y-1.5 mb-6">
                          {pkg.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          className={`w-full ${
                            pkg.popular
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          onClick={() => {
                            setSelectedPackage({
                              id: pkg.id,
                              name: pkg.name,
                              points: pkg.points,
                              price: pkg.price,
                              priceValue: pkg.priceValue,
                              bonus: pkg.bonus,
                            });
                            setIsCheckoutOpen(true);
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          {t("purchase")}
                        </Button>
                      </CardContent>
                    </Card>
                  </MicroInteraction>
                ))}
              </div>
            </div>

            {/* Tabela de Preços das Ações */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  {t("premiumActionsCostTable")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-pink-600" />
                      <h4 className="font-semibold text-pink-900 dark:text-pink-100">
                        {t("premiumLike")}
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                      {PREMIUM_PRICES.LIKE.POINTS} {t("points")}
                    </p>
                    <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                      R$ {PREMIUM_PRICES.LIKE.BRL.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                        {t("premiumPost")}
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {PREMIUM_PRICES.POST.POINTS} {t("points")}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      R$ {PREMIUM_PRICES.POST.BRL.toFixed(2)} /{" "}
                      {PREMIUM_PRICES.POST.DURATION}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                        {t("premiumAd")}
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                      {PREMIUM_PRICES.AD_1_DAY.POINTS} {t("points")}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      {t("startingFrom")} R${" "}
                      {PREMIUM_PRICES.AD_1_DAY.BRL.toFixed(2)} /{" "}
                      {PREMIUM_PRICES.AD_1_DAY.DURATION}
                    </p>
                    {pointsData?.balance &&
                      pointsData.balance >= PREMIUM_PRICES.AD_1_DAY.POINTS && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                          {t("youCanMake", {
                            count: Math.floor(
                              pointsData.balance /
                                PREMIUM_PRICES.AD_1_DAY.POINTS,
                            ),
                          })}
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Informações Importantes
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>
                        • <strong>Conversão:</strong> R$ 1,00 = 100 ConfiPoints
                        (R$ 10,00 = 1.000 pontos)
                      </li>
                      <li>
                        • ConfiPoints não expiram e podem ser usados a qualquer
                        momento
                      </li>
                      <li>
                        • Todos os pagamentos são processados de forma segura
                        via PIX
                      </li>
                      <li>
                        • Você pode transferir pontos para outros usuários sem
                        taxas
                      </li>
                      <li>
                        • Você pode transferir seus pontos para outros usuários
                      </li>
                      <li>• Suporte via Email para dúvidas sobre compras</li>
                      <li>• Quanto maior o pacote, maior o bônus (até 25%)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
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
