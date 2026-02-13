"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { useHelpChat } from "@/contexts/HelpChatContext";
import { supabase } from "@/lib/supabase";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SimpleHeaderBell } from "@/components/notifications/SimpleHeaderBell";
import { UserReportsModal } from "@/components/UserReportsModal";
import { useMessages } from "@/hooks/useMessages";
import { AvailabilityToggleCompact } from "@/components/ui/AvailabilityToggle";
import { useAvailability } from "@/hooks/useAvailability";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { FontSizeControl } from "@/components/ui/FontSizeControl";
import { soundManager } from "@/lib/soundManager";
import { useTranslations } from "next-intl";
import {
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
  MessageCircle,
  Heart,
  Star,
  Calendar,
  Briefcase,
  Home,
  Users,
  TrendingUp,
  Shield,
  Award,
  Eye,
  ThumbsUp,
  BarChart3,
  ShieldCheck,
  Flag,
  FileText,
  UserPlus,
  Coins,
  Target,
  History,
  Gift,
  Zap,
  ShoppingCart,
  DollarSign,
  Send,
  Crown,
  ShoppingBag,
  MapPin,
  Camera,
} from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { cn } from "@/lib/utils";
import {
  EditProfileModal,
  ProfileTab,
} from "@/components/profile/EditProfileModal";

interface ModernHeaderProps {
  showBackButton?: boolean;
  title?: string;
  showMenuButton?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
}

export function ModernHeader({
  showBackButton = false,
  title,
  showMenuButton = false,
  onBackClick,
  onMenuClick,
}: ModernHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuthContext();
  const { openChat } = useFloatingChat();
  const { openChat: openHelpChat } = useHelpChat();
  const { getTotalUnreadCount } = useMessages();
  const { isAvailable } = useAvailability();
  const t = useTranslations("header");
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] =
    useState<ProfileTab>("account");

  // Verificar se o usuário é admin
  const { isAdmin } = useAdmin();
  const [reputationStats, setReputationStats] = useState({
    totalViews: 0,
    totalRecommendations: 0,
    totalReviews: 0,
    averageRating: 0,
  });

  // Scroll detection for dynamic header
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    // Listener para abrir o modal de perfil de qualquer lugar
    const handleOpenProfile = (e: any) => {
      if (e.detail?.tab) {
        openProfileModal(e.detail.tab);
      } else {
        openProfileModal("account");
      }
    };
    window.addEventListener("confilar:open-profile-modal", handleOpenProfile);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener(
        "confilar:open-profile-modal",
        handleOpenProfile,
      );
    };
  }, []);

  const isLoggedIn = !!(user && profile);

  // Carregar estatísticas de reputação (apenas se logado)
  useEffect(() => {
    if (isLoggedIn) {
      loadReputationStats();
    }
  }, [isLoggedIn, profile?.id]);

  // No topo do componente, antes de qualquer lógica que dependa de user/profile
  const isLandingPage =
    pathname === "/" || pathname === "/pt" || pathname === "/en";
  if (isLandingPage) {
    return null;
  }

  const loadReputationStats = async () => {
    if (!profile?.id) return;

    try {
      // Carregar avaliações
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("rating_person, is_recommended")
        .eq("reviewed_id", profile.id);

      if (reviewsError) throw reviewsError;

      // Carregar visualizações
      const { data: viewsData, error: viewsError } = await supabase
        .from("profile_views")
        .select("id")
        .eq("viewed_profile_id", profile.id);

      if (viewsError) throw viewsError;

      // Carregar recomendações da tabela user_recommendations
      const { data: recommendationsData, error: recommendationsError } =
        await supabase
          .from("user_recommendations")
          .select("id")
          .eq("recommended_id", profile.id);

      if (recommendationsError) {
        console.error(
          "📊 Header - Erro ao carregar recomendações:",
          recommendationsError,
        );
      }

      // Calcular estatísticas
      const totalReviews = reviewsData?.length || 0;
      const totalRecommendations = recommendationsData?.length || 0;
      const averageRating =
        totalReviews > 0
          ? parseFloat(
              (
                reviewsData.reduce((sum, r) => sum + r.rating_person, 0) /
                totalReviews
              ).toFixed(1),
            )
          : 0;
      const totalViews = viewsData?.length || 0;

      setReputationStats({
        totalViews,
        totalRecommendations,
        totalReviews,
        averageRating,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas de reputação:", error);
    }
  };

  // Função de navegação simplificada
  const handleNavigation = (path: string) => {
    try {
      console.log("Navegando para:", path);
      setIsMenuExpanded(false);
      router.push(path);
    } catch (error) {
      console.error("Erro na navegação:", error);
      // Fallback para window.location
      window.location.href = path;
    }
  };

  const openProfileModal = (tab: ProfileTab) => {
    setActiveProfileTab(tab);
    setIsProfileModalOpen(true);
    setIsMenuExpanded(false);
  };

  // Função para alternar seções
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getPageTitle = () => {
    if (title) return title;

    const pathTitles: Record<string, string> = {
      "/home": t("dashboard"),
      "/buscar": t("searchProfessionals"),
      "/classificados": t("classifieds"),
      "/feed": t("socialFeed"),
      "/perfil": t("myProfile"),
      "/favoritos": t("favorites"),
      "/portfolio": t("myPortfolio"),
      "/reputacao": t("reputation"),
      "/ajuda": t("helpCenter"),
      "/contato": t("contact"),
      "/sobre": t("aboutUs"),
    };

    return pathTitles[pathname] || "ConfiLar";
  };

  const handleSignOut = async () => {
    console.log("Executando logout...");
    setIsMenuExpanded(false);
    await signOut();
    // Redirecionar diretamente para a página de login
    window.location.href = "/auth";
  };

  // Dados seguros para renderização
  const userId = user?.id || "";
  const profileId = profile?.id || "";
  const userFullName = profile?.full_name || "Usuário";
  const userAvatarUrl = profile?.avatar_url || "";
  const userType = profile?.user_type || "client";

  // Dados do usuário
  const accountStats = {
    memberSince: profile?.created_at
      ? new Date(profile.created_at).getFullYear()
      : "2024",
    verificationStatus: userType === "professional" ? "verified" : "basic",
    premiumStatus: false,
  };

  const getVerificationBadge = () => {
    if (accountStats.verificationStatus === "verified") {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          {t("verified")}
        </Badge>
      );
    }
    return <Badge variant="secondary">{t("basic")}</Badge>;
  };

  const getPremiumBadge = () => {
    if (accountStats.premiumStatus) {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          Premium
        </Badge>
      );
    }
    return null;
  };

  return (
    <>
      {/* Header Moderno - Flutuante no Mobile (dinâmico) e Desktop (fixo) */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-300 border border-gray-200 dark:border-gray-900",
          // Desktop styles (always pill-like)
          "lg:top-6 lg:left-80 lg:right-6 lg:translate-x-0 lg:w-auto lg:max-w-[calc(100vw-18rem)] lg:rounded-2xl lg:shadow-[0_8px_30px_rgb(0,0,0,0.12)] lg:dark:shadow-2xl lg:backdrop-blur-lg lg:bg-white lg:dark:bg-black/95",
          // Mobile styles (dynamic)
          isScrolled
            ? "top-5 left-1/2 -translate-x-1/2 w-[95%] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl backdrop-blur-md bg-white/90 dark:bg-black/90"
            : "top-0 left-0 translate-x-0 w-full rounded-none shadow-none border-x-0 border-t-0 bg-white dark:bg-black",
        )}
      >
        <div className="px-3 sm:px-4 lg:px-4">
          <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackClick}
                  className="p-2"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>
              )}

              {showMenuButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMenuClick}
                  className="p-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              {/* Logo */}
              <Link
                href={isLoggedIn ? "/home" : "/"}
                className="flex items-center space-x-2"
              >
                <div className="h-12 flex items-center justify-center">
                  {/* Mobile: 30% menor */}
                  <div className="block sm:hidden">
                    <BrandLogo width={84} height={22} />
                  </div>
                  {/* Desktop/tablet: padrão */}
                  <div className="hidden sm:block">
                    <BrandLogo width={120} height={32} />
                  </div>
                </div>
              </Link>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                {getPageTitle()}
              </h1>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center">
              {/* Toggle de Tema */}
              <div className="relative -ml-1">
                <ThemeToggle />
              </div>

              {/* Notificações */}
              {isLoggedIn && (
                <div className="relative -ml-1">
                  <SimpleHeaderBell />
                </div>
              )}

              {/* Avatar e Menu do Usuário OU Botão de Login */}
              <div className="relative -ml-1">
                {isLoggedIn ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      soundManager.play("/sounds/New/very-fast.mp3", {
                        volume: 0.3,
                      });
                      setIsMenuExpanded(!isMenuExpanded);
                    }}
                    className="flex items-center gap-1 px-2 py-2"
                  >
                    <UserAvatar
                      src={userAvatarUrl}
                      alt={userFullName}
                      fallback={userFullName.charAt(0)}
                      size="sm"
                      userId={userId}
                      showReferralBadge={false}
                    />
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-full px-4 h-8 text-xs font-bold"
                    onClick={() => router.push("/auth")}
                  >
                    Entrar
                  </Button>
                )}

                {/* Menu Expandido */}
                {isMenuExpanded && (
                  <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-[75vh] overflow-hidden animate-slide-down">
                    <div className="p-3 sm:p-4 overflow-y-auto max-h-[75vh]">
                      {/* Header do Perfil */}
                      <div className="flex items-center space-x-2 sm:space-x-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700 -mx-3 sm:-mx-4 px-3 sm:px-4">
                        {/* Link para o perfil - apenas foto e nome */}
                        <Link
                          href={profileId ? `/perfil/${profileId}` : "/auth"}
                          onClick={() => setIsMenuExpanded(false)}
                          className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <UserAvatar
                            src={userAvatarUrl}
                            alt={userFullName}
                            fallback={userFullName.charAt(0)}
                            size="lg"
                            className="w-11 h-11 sm:w-17 sm:h-17 flex-shrink-0"
                            userId={userId}
                            showReferralBadge={true}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                              {userFullName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {userType === "professional"
                                ? t("professional")
                                : t("client")}
                            </p>
                            <div className="flex gap-1 mt-1">
                              <div className="text-xs">
                                {getVerificationBadge()}
                                {getPremiumBadge()}
                              </div>
                            </div>
                          </div>
                        </Link>
                        {/* Toggle de Disponibilidade e Idioma - juntos */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                          <AvailabilityToggleCompact />
                          {/* Seletor de Idioma - apenas ícone */}
                          <LanguageSelector iconOnly={true} compact={true} />
                        </div>
                      </div>

                      {/* Estatísticas de Reputação */}
                      <div className="py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {t("myReputation")}
                        </h4>
                        <div className="flex justify-between gap-1">
                          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary-50 dark:bg-primary-900/30 rounded-md">
                            <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 dark:text-blue-400 mb-0.5" />
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                              {reputationStats.totalViews}
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-50 dark:bg-green-900/30 rounded-md">
                            <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 dark:text-green-400 mb-0.5" />
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                              {reputationStats.totalRecommendations}
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 dark:bg-orange-900/30 rounded-md">
                            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-600 dark:text-orange-400 mb-0.5" />
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                              {reputationStats.totalReviews}
                            </div>
                          </div>
                          {profile?.user_type === "professional" &&
                            reputationStats.averageRating > 0 && (
                              <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <div className="mb-0.5">
                                  <StarRating
                                    rating={reputationStats.averageRating}
                                    size="sm"
                                    variant="compact"
                                    showValue={false}
                                    className="scale-75 sm:scale-75"
                                  />
                                </div>
                                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                  {reputationStats.averageRating.toFixed(1)}
                                </div>
                              </div>
                            )}
                        </div>
                        {/* Labels */}
                        <div className="flex justify-between gap-1 mt-1">
                          <div className="w-10 sm:w-12 text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                              {t("views")}
                            </div>
                          </div>
                          <div className="w-10 sm:w-12 text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                              {t("recommendations")}
                            </div>
                          </div>
                          <div className="w-10 sm:w-12 text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                              {t("reviews")}
                            </div>
                          </div>
                          {profile?.user_type === "professional" &&
                            reputationStats.averageRating > 0 && (
                              <div className="w-10 sm:w-12 text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                                  {t("rating")}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Principal */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection("principal")}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <Home className="h-3 w-3" />
                            {t("principal")}
                          </div>
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${expandedSections.has("principal") ? "rotate-180" : ""}`}
                          />
                        </button>
                        {expandedSections.has("principal") && (
                          <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/home")}
                              className="flex items-center gap-1 text-xs py-1 h-7"
                            >
                              <Home className="h-3 w-3" />
                              <span className="truncate">Home</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/feed")}
                              className="flex items-center gap-1 text-xs py-1 h-7 text-[#00b0b0]"
                            >
                              <Users className="h-3 w-3" />
                              <span className="truncate">
                                {t("socialFeed")}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/classificados")}
                              className="flex items-center gap-1 text-xs py-1 h-7"
                            >
                              <Briefcase className="h-3 w-3" />
                              <span className="truncate">
                                {t("classifieds")}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/buscar")}
                              className="flex items-center gap-1 text-xs py-1 h-7"
                            >
                              <Search className="h-3 w-3" />
                              <span className="truncate">
                                {t("searchProfessionals")}
                              </span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Gestão */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection("gestao")}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {t("management")}
                          </div>
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${expandedSections.has("gestao") ? "rotate-180" : ""}`}
                          />
                        </button>
                        {expandedSections.has("gestao") && (
                          <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/favoritos")}
                              className="flex items-center gap-1 text-xs py-1 h-7"
                            >
                              <Heart className="h-3 w-3" />
                              <span className="truncate">{t("favorites")}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/avaliacoes")}
                              className="flex items-center gap-1 text-xs py-1 h-7"
                            >
                              <Star className="h-3 w-3" />
                              <span className="truncate">{t("reviews")}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/indicacoes")}
                              className="flex items-center gap-1 text-xs py-1 h-7 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                            >
                              <UserPlus className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <span className="truncate text-green-700 dark:text-green-300">
                                Indicações
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                openChat();
                                setIsMenuExpanded(false);
                              }}
                              className="flex items-center gap-1 text-xs py-1 h-7"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span className="truncate">Mensagens</span>
                              {getTotalUnreadCount() > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="ml-auto text-xs px-1 py-0"
                                >
                                  {getTotalUnreadCount()}
                                </Badge>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* ConfiPoints */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection("confipoints")}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <Coins className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                            {t("confipoints")}
                          </div>
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${expandedSections.has("confipoints") ? "rotate-180" : ""}`}
                          />
                        </button>
                        {expandedSections.has("confipoints") && (
                          <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleNavigation("/confipoints/dashboard")
                              }
                              className="flex items-center gap-1 text-xs py-1 h-7 bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                            >
                              <BarChart3 className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                              <span className="truncate text-yellow-700 dark:text-yellow-300">
                                Dashboard
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleNavigation("/confipoints/comprar")
                              }
                              className="flex items-center gap-1 text-xs py-1 h-7 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                            >
                              <Crown className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              <span className="truncate text-purple-700 dark:text-purple-300">
                                Loja Premium
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleNavigation("/confipoints/compras")
                              }
                              className="flex items-center gap-1 text-xs py-1 h-7 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                            >
                              <ShoppingBag className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <span className="truncate text-green-700 dark:text-green-300">
                                Minhas Compras
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleNavigation("/confipoints/transferir")
                              }
                              className="flex items-center gap-1 text-xs py-1 h-7 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                              <Send className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              <span className="truncate text-blue-700 dark:text-blue-300">
                                Transferir
                              </span>
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleNavigation("/gestao-confi/confipoints")
                                }
                                className="flex items-center gap-1 text-xs py-1 h-7 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-green-900/30 border border-red-200 dark:border-red-800"
                              >
                                <BarChart3 className="h-3 w-3 text-red-600 dark:text-red-400" />
                                <span className="truncate text-red-700 dark:text-red-300">
                                  Admin
                                </span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Profissional */}
                      {profile?.user_type === "professional" && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => toggleSection("profissional")}
                            className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                          >
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-3 w-3" />
                              {t("professional")}
                            </div>
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${expandedSections.has("profissional") ? "rotate-180" : ""}`}
                            />
                          </button>
                          {expandedSections.has("profissional") && (
                            <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNavigation("/portfolio")}
                                className="flex items-center gap-1 text-xs py-1 h-7"
                              >
                                <FileText className="h-3 w-3" />
                                <span className="truncate">
                                  {t("myPortfolio")}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNavigation("/reputacao")}
                                className="flex items-center gap-1 text-xs py-1 h-7"
                              >
                                <Award className="h-3 w-3" />
                                <span className="truncate">
                                  {t("reputation")}
                                </span>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Meu Perfil */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection("meu-perfil")}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {t("myProfileMenu")}
                          </div>
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${expandedSections.has("meu-perfil") ? "rotate-180" : ""}`}
                          />
                        </button>
                        {expandedSections.has("meu-perfil") && (
                          <div className="flex flex-col gap-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openProfileModal("account")}
                              className="flex items-center gap-2 text-xs py-2.5 h-auto w-full justify-start font-semibold text-[#00b0b0] bg-[#00b0b0]/5 hover:bg-[#00b0b0]/10 rounded-lg transition-colors"
                            >
                              <Settings className="h-4 w-4" />
                              <div className="flex flex-col items-start">
                                <span>Gerenciar Meu Perfil</span>
                                <span className="text-[10px] font-normal text-gray-500">
                                  Editar dados, foto, endereço e mais
                                </span>
                              </div>
                            </Button>

                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleNavigation("/gestao-confi/dashboard")
                                }
                                className="flex items-center gap-2 text-xs py-2 w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Shield className="h-4 w-4" />
                                <span>Painel Admin</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acessibilidade - Moving above Support for better visibility */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection("acessibilidade")}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="h-3 w-3" />
                            {t("accessibility") || "Acessibilidade"}
                          </div>
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${expandedSections.has("acessibilidade") ? "rotate-180" : ""}`}
                          />
                        </button>
                        {expandedSections.has("acessibilidade") && (
                          <div className="px-1 pb-1">
                            {/* Controle de Tamanho da Fonte */}
                            <div className="px-2 py-1">
                              <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider block mb-1">
                                Tamanho da Fonte
                              </span>
                              <FontSizeControl />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Suporte */}
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toggleSection("suporte")}
                          className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                        >
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-3 w-3" />
                            {t("support")}
                          </div>
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${expandedSections.has("suporte") ? "rotate-180" : ""}`}
                          />
                        </button>
                        {expandedSections.has("suporte") && (
                          <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/ajuda")}
                              className="flex items-center gap-1 text-xs py-1 h-7 justify-start"
                            >
                              <HelpCircle className="h-3 w-3" />
                              <span className="truncate">
                                {t("helpCenter")}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                openHelpChat();
                                setIsMenuExpanded(false);
                              }}
                              className="flex items-center gap-1 text-xs py-1 h-7 justify-start"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span className="truncate">Chat de Ajuda</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/contato")}
                              className="flex items-center gap-1 text-xs py-1 h-7 justify-start"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span className="truncate">{t("contact")}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/sobre")}
                              className="flex items-center gap-1 text-xs py-1 h-7 justify-start"
                            >
                              <Users className="h-3 w-3" />
                              <span className="truncate">{t("aboutUs")}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/termos")}
                              className="flex items-center gap-1 text-xs py-1 h-7 justify-start"
                            >
                              <FileText className="h-3 w-3" />
                              <span className="truncate">Termos de Uso</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigation("/privacidade")}
                              className="flex items-center gap-1 text-xs py-1 h-7 justify-start"
                            >
                              <Shield className="h-3 w-3" />
                              <span className="truncate">
                                Política de Privacidade
                              </span>
                            </Button>
                            <UserReportsModal>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-xs py-1 h-7 justify-start w-full"
                              >
                                <Flag className="h-3 w-3" />
                                <span className="truncate">
                                  {t("myReports")}
                                </span>
                              </Button>
                            </UserReportsModal>
                          </div>
                        )}
                      </div>

                      {/* Administração - Apenas para Admin */}
                      {isAdmin && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => toggleSection("administracao")}
                            className="w-full py-2 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2"
                          >
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-3 w-3" />
                              {t("administration")}
                            </div>
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${expandedSections.has("administracao") ? "rotate-180" : ""}`}
                            />
                          </button>
                          {expandedSections.has("administracao") && (
                            <div className="grid grid-cols-1 gap-1 px-2 pb-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleNavigation("/gestao-confi/dashboard")
                                }
                                className="flex items-center gap-1 text-xs py-1 h-7 bg-gray-100 hover:bg-gray-200"
                              >
                                <ShieldCheck className="h-3 w-3" />
                                <span className="truncate">
                                  {t("adminPanel")}
                                </span>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botão de Sair */}
                      <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleSignOut}
                          className="w-full text-xs sm:text-sm py-1.5 sm:py-2"
                        >
                          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          {t("logout")}
                        </Button>
                      </div>

                      {/* Informações do Usuário */}
                      <div className="pt-2 sm:pt-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                          <div
                            className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
                            {profile?.user_type === "professional"
                              ? t("professionalActive")
                              : t("clientActive")}
                            {profile?.location_city &&
                              profile?.location_state && (
                                <>
                                  {" "}
                                  - {profile.location_city},{" "}
                                  {profile.location_state}
                                </>
                              )}
                            {" - "}
                            {t("memberSince")}{" "}
                            {profile?.created_at
                              ? new Date(profile.created_at).getFullYear()
                              : "2024"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar menu */}
      {isMenuExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={() => setIsMenuExpanded(false)}
        />
      )}

      {/* Modal de Perfil Unificado */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        initialTab={activeProfileTab}
      />
    </>
  );
}
