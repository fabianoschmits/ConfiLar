"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HomePageLayout } from "@/components/layout/HomePageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  Star,
  Shield,
  ArrowRight,
  MessageCircle,
  Briefcase,
  Eye,
  ThumbsUp,
  Gift,
  CheckCircle2,
  Menu,
  X,
  Mail,
  Instagram,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
} from "lucide-react";
import { useHomeStats, formatStatNumber } from "@/hooks/useHomeStats";
import { LandingPageSkeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { BrandLogo } from "@/components/common/BrandLogo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslations } from "next-intl";

// Página Inicial Principal - Hero com Imagem de Fundo Full + Overlay
function HomeContent() {
  const router = useRouter();
  const { user, loading, isReady } = useAuthContext();
  const t = useTranslations("landing");
  const tNav = useTranslations("navigation");
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    professionalsCount,
    reviewsCount,
    citiesCount,
    servicesCount,
    loading: statsLoading,
  } = useHomeStats();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalUsersParticipating: 0,
    loading: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const { data } = await supabase.rpc("get_public_referral_stats");
        if (data) {
          setReferralStats({
            totalReferrals: data.total_referrals || 0,
            totalUsersParticipating: data.total_users_participating || 0,
            loading: false,
          });
        }
      } catch (error) {
        setReferralStats({
          totalReferrals: 0,
          totalUsersParticipating: 0,
          loading: false,
        });
      }
    };
    if (mounted) fetchReferralStats();
  }, [mounted]);

  useEffect(() => {
    if (mounted && isReady && user) {
      router.push("/feed");
    }
  }, [user, isReady, router, mounted]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !mounted) return <LandingPageSkeleton />;
  if (user) return null;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-950">
        {/* Header Flutuante Transparente */}
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
              <Link href="/" className="flex items-center">
                <Image
                  src="/imagens/logo/Logo branco - sem fundo - horizontal.png"
                  alt="ConfiLar"
                  width={360}
                  height={96}
                  quality={95}
                  priority
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>

              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/sobre"
                  className="text-white hover:text-[#00b0b0] transition-colors font-medium"
                >
                  {tNav("about")}
                </Link>
                <Link
                  href="/ajuda"
                  className="text-white hover:text-[#00b0b0] transition-colors font-medium"
                >
                  {tNav("help")}
                </Link>
              </nav>

              <div className="hidden md:flex items-center gap-3">
                <LanguageSelector />
                <Button
                  variant="ghost"
                  asChild
                  className="text-white hover:text-[#00b0b0] hover:bg-white/10"
                >
                  <Link href="/auth">{tNav("login")}</Link>
                </Button>
                <Button
                  asChild
                  className="bg-[#00b0b0] hover:bg-[#00a0a0] text-white shadow-lg shadow-[#00b0b0]/50"
                >
                  <Link href="/auth?tab=register">{tNav("createAccount")}</Link>
                </Button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden mt-4 bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <nav className="flex flex-col space-y-4">
                  <Link
                    href="/sobre"
                    className="text-white hover:text-[#00b0b0] transition-colors"
                  >
                    {tNav("about")}
                  </Link>
                  <Link
                    href="/ajuda"
                    className="text-white hover:text-[#00b0b0] transition-colors"
                  >
                    {tNav("help")}
                  </Link>
                  <div className="pt-4 border-t border-white/20">
                    <div className="mb-4">
                      <LanguageSelector />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
                    <Button
                      variant="ghost"
                      asChild
                      className="justify-start text-white hover:bg-white/10"
                    >
                      <Link href="/auth">{tNav("login")}</Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-[#00b0b0] hover:bg-[#00a0a0] text-white justify-start"
                    >
                      <Link href="/auth?tab=register">
                        {tNav("createAccount")}
                      </Link>
                    </Button>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section com Imagem de Fundo */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Imagem de Fundo com Overlay */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/imagens/Fotos/hero-bg.png')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-[#00b0b0]/30" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          </div>

          {/* Conteúdo Hero */}
          <div
            className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <Badge className="mb-6 bg-[#00b0b0]/20 text-[#00b0b0] border-[#00b0b0]/50 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              {t("subtitle")}
            </Badge>

            <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                {t("title")}
              </h1>
              <Image
                src="/imagens/logo/Logo azul - sem fundo - horizontal.png"
                alt="ConfiLar"
                width={300}
                height={80}
                quality={95}
                priority
                className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto object-contain mt-5 sm:mt-6 md:mt-7 lg:mt-8"
              />
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                ?
              </h1>
            </div>

            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto font-medium leading-relaxed">
              {t("description")}
            </p>

            <p className="text-base sm:text-lg text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t("description2")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                asChild
                className="bg-[#00b0b0] hover:bg-[#00a0a0] text-white text-lg px-8 py-6 shadow-2xl shadow-[#00b0b0]/50 hover:shadow-[#00b0b0]/70 transition-all"
              >
                <Link href="/auth?tab=register">
                  {t("ctaStart")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-white border-2 border-white/60 bg-white/10 hover:bg-white/20 text-lg px-8 py-6 backdrop-blur-sm"
              >
                <Link href="/buscar">
                  <Search className="mr-2 h-5 w-5" />
                  {t("ctaSearch")}
                </Link>
              </Button>
            </div>

            {/* Stats Cards com Glassmorphism */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-4xl sm:text-5xl font-bold text-[#00b0b0] mb-2">
                  {statsLoading ? "..." : formatStatNumber(professionalsCount)}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  {t("stats.professionals")}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {t("stats.verified")}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-4xl sm:text-5xl font-bold text-[#00b0b0] mb-2">
                  {statsLoading ? "..." : formatStatNumber(reviewsCount)}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  {t("stats.reviews")}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {t("stats.real")}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-4xl sm:text-5xl font-bold text-[#00b0b0] mb-2">
                  {statsLoading ? "..." : formatStatNumber(citiesCount)}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  {t("stats.cities")}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {t("stats.attended")}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-4xl sm:text-5xl font-bold text-[#00b0b0] mb-2">
                  {statsLoading ? "..." : formatStatNumber(servicesCount)}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  {t("stats.services")}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {t("stats.categories")}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/50 rounded-full" />
            </div>
          </div>
        </section>

        {/* Seção Como Funciona - Cards com Imagens */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-[#00b0b0]/10 text-[#00b0b0] border-[#00b0b0]/50">
                {t("howItWorks.title")}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t("howItWorks.subtitle")}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t("howItWorks.description")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Card 1 */}
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                    style={{
                      backgroundImage: "url('/imagens/Fotos/transparency.png')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-14 h-14 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Eye className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t("features.transparency.title")}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t("features.transparency.description")}
                  </p>
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                    style={{
                      backgroundImage: "url('/imagens/Fotos/referrals.png')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-14 h-14 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t("features.referrals.title")}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t("features.referrals.description")}
                  </p>
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                    style={{
                      backgroundImage:
                        "url('/imagens/Fotos/recommendations.png')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-14 h-14 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <ThumbsUp className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t("features.recommendations.title")}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t("features.recommendations.description")}
                  </p>
                </CardContent>
              </Card>

              {/* Card 4 */}
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: "url('/imagens/Fotos/ads.png')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-14 h-14 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Briefcase className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t("features.ads.title")}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t("features.ads.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Seção Funcionalidades Detalhadas - Layout Alternado */}
        <section className="py-24 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-[#00b0b0]/10 text-[#00b0b0] border-[#00b0b0]/50">
                {t("features.title")}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t("features.subtitle")}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t("features.description")}
              </p>
            </div>

            <div className="space-y-24">
              {/* Feature 1 - Imagem à esquerda */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('/imagens/Fotos/transparency-detail.png')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00b0b0]/20 to-transparent" />
                </div>
                <div>
                  <div className="w-16 h-16 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("features.transparencyDetail.title")}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    {t("features.transparencyDetail.description")}
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("features.transparencyDetail.points.whoHired")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("features.transparencyDetail.points.allReviews")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t(
                          "features.transparencyDetail.points.completeHistory",
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t(
                          "features.transparencyDetail.points.identityVerification",
                        )}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Feature 2 - Imagem à direita */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="w-16 h-16 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("features.referralsDetail.title")}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    {t("features.referralsDetail.description")}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                      <Gift className="h-8 w-8 text-[#00b0b0] mb-3" />
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        {t("features.referralsDetail.referralProgram.title")}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t(
                          "features.referralsDetail.referralProgram.description",
                        )}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                      <ThumbsUp className="h-8 w-8 text-[#00b0b0] mb-3" />
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        {t(
                          "features.referralsDetail.publicRecommendations.title",
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t(
                          "features.referralsDetail.publicRecommendations.description",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/imagens/Fotos/referrals.png')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00b0b0]/20 to-transparent" />
                </div>
              </div>

              {/* Feature 3 - Imagem à esquerda */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/imagens/Fotos/ads.png')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00b0b0]/20 to-transparent" />
                </div>
                <div>
                  <div className="w-16 h-16 bg-[#00b0b0] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("features.adsDetail.title")}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    {t("features.adsDetail.description")}
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("features.adsDetail.offerServices")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("features.adsDetail.requestServices")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5 text-[#00b0b0]" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("features.adsDetail.premiumAds")}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Programa de Indicações - Card Grande */}
        <section className="py-24 bg-gradient-to-br from-[#00b0b0] to-[#008080]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                {t("referralProgram.title")}
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {t("referralProgram.description")}
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <Gift className="h-7 w-7 text-[#00b0b0]" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">
                        {t("referralProgram.howItWorks")}
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {[
                        {
                          num: 1,
                          title: t("referralProgram.steps.step1.title"),
                          desc: t("referralProgram.steps.step1.description"),
                        },
                        {
                          num: 2,
                          title: t("referralProgram.steps.step2.title"),
                          desc: t("referralProgram.steps.step2.description"),
                        },
                        {
                          num: 3,
                          title: t("referralProgram.steps.step3.title"),
                          desc: t("referralProgram.steps.step3.description"),
                        },
                        {
                          num: 4,
                          title: t("referralProgram.steps.step4.title"),
                          desc: t("referralProgram.steps.step4.description"),
                        },
                      ].map((step) => (
                        <div key={step.num} className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[#00b0b0] shadow-lg">
                            {step.num}
                          </div>
                          <div>
                            <h4 className="font-bold text-white mb-1">
                              {step.title}
                            </h4>
                            <p className="text-sm text-white/80">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl">
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-6 text-center">
                      {t("referralProgram.stats.title")}
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-6 bg-gradient-to-br from-[#00b0b0]/10 to-[#00b0b0]/5 rounded-2xl">
                        <div className="text-4xl font-bold text-[#00b0b0] mb-2">
                          {referralStats.loading
                            ? "..."
                            : formatStatNumber(referralStats.totalReferrals)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t("referralProgram.stats.totalReferrals")}
                        </div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-[#00b0b0]/10 to-[#00b0b0]/5 rounded-2xl">
                        <div className="text-4xl font-bold text-[#00b0b0] mb-2">
                          {referralStats.loading
                            ? "..."
                            : formatStatNumber(
                                referralStats.totalUsersParticipating,
                              )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t("referralProgram.stats.usersParticipating")}
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Button
                        asChild
                        className="w-full bg-[#00b0b0] hover:bg-[#00a0a0] text-white py-6 text-lg shadow-xl"
                      >
                        <Link href="/auth?tab=register">
                          {t("referralProgram.cta")}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Por que escolher - Grid 3 colunas */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-[#00b0b0]/10 text-[#00b0b0] border-[#00b0b0]/50">
                {t("whyChoose.badge")}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t("whyChoose.title")}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#00b0b0]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-10 w-10 text-[#00b0b0]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("whyChoose.transparency.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t("whyChoose.transparency.description")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#00b0b0]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-[#00b0b0]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("whyChoose.verified.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t("whyChoose.verified.description")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#00b0b0]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-10 w-10 text-[#00b0b0]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("whyChoose.communication.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t("whyChoose.communication.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <BrandLogo width={140} height={38} className="mb-6" />
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {t("footer.description")}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">
                  {t("footer.quickLinks")}
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      href="/sobre"
                      className="text-gray-400 hover:text-[#00b0b0] transition-colors"
                    >
                      {t("footer.aboutUs")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/ajuda"
                      className="text-gray-400 hover:text-[#00b0b0] transition-colors"
                    >
                      {t("footer.helpCenter")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/termos"
                      className="text-gray-400 hover:text-[#00b0b0] transition-colors"
                    >
                      {t("footer.termsOfUse")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/buscar"
                      className="text-gray-400 hover:text-[#00b0b0] transition-colors"
                    >
                      {t("footer.search")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">
                  {t("footer.contact")}
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center text-gray-400">
                    <Mail className="h-4 w-4 mr-2 text-[#00b0b0]" />
                    <a
                      href="mailto:contato@appconfilar.com.br"
                      className="hover:text-[#00b0b0] transition-colors"
                    >
                      contato@appconfilar.com.br
                    </a>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <Instagram className="h-4 w-4 mr-2 text-[#00b0b0]" />
                    <a
                      href="https://www.instagram.com/appconfilar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#00b0b0] transition-colors"
                    >
                      @appconfilar
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-12 bg-gray-800" />

            <div className="text-center">
              <p className="text-gray-400 text-sm">{t("footer.copyright")}</p>
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  );
}

export default function Home() {
  return (
    <HomePageLayout>
      <Suspense fallback={<LandingPageSkeleton />}>
        <HomeContent />
      </Suspense>
    </HomePageLayout>
  );
}
