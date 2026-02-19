"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  useProfileData,
  formatEscolaridade,
  formatEstadoCivil,
  formatTurnoTrabalho,
  formatGender,
} from "@/hooks/useProfileData";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  User,
  Briefcase,
  MessageCircle,
  Calendar,
  CheckCircle,
  Eye,
  GraduationCap,
  Heart,
  Users,
  Clock,
  Award,
  Building2,
  Globe,
  Share2,
  Palette,
  Layers,
  Sparkles,
  ThumbsUp,
  Quote,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useProfileViews } from "@/hooks/useProfileViews";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProfilePageSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useReferralStats } from "@/hooks/useReferralStats";
import { ReferralBadgeLarge } from "@/components/referral/ReferralBadge";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge";
import { useTranslations } from "next-intl";
import { PortfolioProjectCard } from "@/components/portfolio/PortfolioProjectCard";
import { SocialLinksDisplay } from "@/components/profile/SocialLinksDisplay";
import { AIProfileSchema } from "@/components/profile/AIProfileSchema";
import { GuestBlurOverlay } from "@/components/auth/GuestBlurOverlay";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const { openChat } = useFloatingChat();
  const userId = params.id as string;
  const [mounted, setMounted] = useState(false);

  const { profile, loading, error } = useProfileData(userId);
  const {
    reviews,
    loading: reviewsLoading,
    fetchUserReviews,
    respondToReview,
    deleteReview,
    updateReview,
  } = useSupabaseReviews();
  const { projects: portfolioProjects, loading: portfolioLoading } =
    usePortfolio(userId || "");
  const { recommendations, loading: recommendationsLoading } =
    useRecommendations(userId);
  const { recordView, getViewStats } = useProfileViews();
  const [viewStats, setViewStats] = useState<{ total_views: number } | null>(
    null,
  );
  const { stats: referralStats, loading: referralLoading } =
    useReferralStats(userId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserReviews(userId);
    }
  }, [userId, fetchUserReviews]);

  // Registrar visualização automaticamente quando o perfil é visualizado
  useEffect(() => {
    if (!userId || !mounted) return;

    // Não registrar visualização do próprio perfil
    if (user?.id === userId) return;

    // Registrar visualização mesmo se o usuário não estiver autenticado
    const timer = setTimeout(async () => {
      try {
        await recordView(userId);
      } catch (error) {
        console.error("Erro ao registrar visualização:", error);
      }
    }, 2000); // 2 segundos de delay

    return () => {
      clearTimeout(timer);
    };
  }, [userId, mounted, user?.id, recordView]);

  // Buscar estatísticas de visualizações
  useEffect(() => {
    if (!userId || !mounted) return;

    const fetchViewStats = async () => {
      try {
        const stats = await getViewStats(userId);
        if (stats) {
          setViewStats(stats);
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas de visualizações:", error);
      }
    };

    fetchViewStats();
  }, [userId, mounted, getViewStats]);

  // Forçar scroll para o topo quando o perfil terminar de carregar
  useEffect(() => {
    if (mounted && !loading) {
      window.scrollTo(0, 0);
    }
  }, [mounted, loading]);

  const handleContact = () => {
    if (!user) {
      toast.error("Login necessário");
      return;
    }
    if (userId === user.id) {
      toast.error("Ação inválida");
      return;
    }
    openChat(userId, profile?.full_name || "Usuário");
    toast.success("Iniciando conversa...");
  };

  const handleShare = async () => {
    try {
      const profileUrl = `${window.location.origin}/perfil/${userId}`;
      await navigator.clipboard.writeText(profileUrl);
      toast.success(t("profileLinkCopied"));
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      toast.error(t("errorCopyingLink"));
    }
  };

  if (!mounted || loading) {
    return (
      <MainLayout requireAuth={false}>
        <ProfilePageSkeleton />
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {error || t("profileNotFound")}
              </h2>
              <Button onClick={() => router.push("/buscar")}>
                {tNav("search")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const isOwnProfile = user?.id === profile.id;
  const isProfessional = profile.user_type === "professional";

  return (
    <MainLayout requireAuth={false}>
      {profile && <AIProfileSchema profile={profile} />}
      <div className="min-h-screen bg-gray-50 dark:bg-black text-foreground transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header Minimalista */}
          {/* Header Minimalista Unificado */}
          <div className="flex flex-col items-center text-center mb-12">
            {/* Identity Card Container */}
            <div className="relative group w-full max-w-2xl mx-auto mb-12">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

              <div className="relative px-6 py-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[1.8rem] shadow-2xl flex flex-col items-center">
                {/* Unified Avatar & Info */}
                <div className="flex flex-col items-center -mt-20 sm:-mt-24 mb-6">
                  <div className="relative p-1.5 rounded-full bg-background/50 backdrop-blur shadow-sm border border-border/50">
                    <UserAvatar
                      src={profile.avatar_url || profile.profile_photo_url}
                      alt={profile.full_name || "Usuário"}
                      fallback={
                        profile.full_name?.charAt(0).toUpperCase() || "U"
                      }
                      size="xl"
                      userId={profile.id}
                      showReferralBadge={true}
                      className="w-32 h-32 sm:w-40 sm:h-40 shadow-inner"
                    />
                    <ProVerifiedBadge
                      isVerified={profile.is_verified}
                      isPro={profile.is_pro}
                      proExpiresAt={profile.pro_expires_at}
                      iconSize={3}
                      className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10"
                    />
                  </div>
                </div>

                <div className="space-y-4 max-w-lg w-full">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        {profile.full_name || "Usuário"}
                      </h1>
                      {profile.is_verified && (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 rounded-full px-3 py-1 border-0 shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] uppercase tracking-wider font-bold">
                            Verificado
                          </span>
                        </Badge>
                      )}
                      {profile.verification_status === "pending" && (
                        <Badge
                          variant="outline"
                          className="text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 flex items-center gap-1 rounded-full px-3 py-1 shadow-sm"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] uppercase tracking-wider font-bold">
                            Em Análise
                          </span>
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 transition-colors border-0"
                      >
                        {isProfessional ? t("professional") : t("client")}
                      </Badge>
                      {profile.location_city && profile.location_state && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {profile.location_city}, {profile.location_state}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="mt-4 relative">
                      <Quote className="w-8 h-8 text-primary/10 absolute -top-4 -left-2 transform -scale-x-100" />
                      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed italic relative z-10 px-4">
                        {profile.bio}
                      </p>
                      <Quote className="w-8 h-8 text-primary/10 absolute -bottom-4 -right-2" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação Minimalistas */}
            <div className="flex flex-wrap justify-center gap-3 mb-10 w-full sm:w-auto">
              {!isOwnProfile && (
                <Button
                  onClick={handleContact}
                  className="rounded-full px-8 py-6 font-semibold shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t("contact")}
                </Button>
              )}
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 font-medium border-2 hover:bg-muted w-full sm:w-auto"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 mr-2" />
                {t("share")}
              </Button>
            </div>

            {/* Redes Sociais */}
            <div className="w-full max-w-lg mx-auto mb-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Redes Sociais
              </h3>
              <SocialLinksDisplay profile={profile} />
            </div>

            {/* Métricas Clean (Row) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mx-auto border-y border-border py-6 mb-8">
              <div className="text-center p-2">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground">
                    {profile.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3" /> {t("rating")}
                  </span>
                </div>
              </div>
              <div className="text-center p-2 border-l border-border/50">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground">
                    {profile.total_reviews}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {t("reviews")}
                  </span>
                </div>
              </div>
              <div className="text-center p-2 border-l border-border/50">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground">
                    {viewStats?.total_views?.toLocaleString("pt-BR") || "0"}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {t("views")}
                  </span>
                </div>
              </div>
              <div className="text-center p-2 border-l border-border/50">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="transform scale-90 origin-center">
                    {referralLoading ? (
                      <span className="text-muted-foreground">...</span>
                    ) : (
                      <ReferralBadgeLarge
                        tier={referralStats?.tier || "none"}
                        totalReferrals={referralStats?.totalReferrals || 0}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Rápidas (Icon Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground w-full max-w-3xl mx-auto">
              {profile.location_city && profile.location_state && (
                <div className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    {profile.location_city}, {profile.location_state}
                  </span>
                </div>
              )}
              {profile.escolaridade && (
                <div className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span className="truncate max-w-[200px]">
                    {formatEscolaridade(profile.escolaridade)}
                  </span>
                </div>
              )}
              {isProfessional &&
                profile.professional_experience_years &&
                profile.professional_experience_years > 0 && (
                  <div className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span>
                      {profile.professional_experience_years}{" "}
                      {profile.professional_experience_years === 1
                        ? t("year")
                        : t("years")}{" "}
                      exp.
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Tabs - Classic Scrollable */}
          <Tabs
            defaultValue="recommendations"
            className="space-y-8 w-full max-w-4xl mx-auto"
          >
            <div className="relative w-full group/tabs">
              <div
                className="relative w-full overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const isAtEnd =
                    target.scrollWidth - target.scrollLeft <=
                    target.clientWidth + 10;
                  const indicator = document.getElementById(
                    "tab-scroll-indicator",
                  );
                  if (indicator) {
                    indicator.style.opacity = isAtEnd ? "0" : "1";
                    indicator.style.visibility = isAtEnd ? "hidden" : "visible";
                  }
                }}
              >
                <TabsList className="flex w-max min-w-full h-12 items-center justify-start gap-1.5 bg-muted/40 p-1.5 rounded-xl border border-border/50 backdrop-blur-sm">
                  <TabsTrigger
                    value="recommendations"
                    className="px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all data-[state=active]:bg-[#00b0b0] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Recomendações
                  </TabsTrigger>
                  {isProfessional && (
                    <TabsTrigger
                      value="services"
                      className="px-6 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all data-[state=active]:bg-[#00b0b0] data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      {t("services")}
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="reviews"
                    className="px-6 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all data-[state=active]:bg-[#00b0b0] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    {t("reviews")}
                  </TabsTrigger>
                  {isProfessional && (
                    <TabsTrigger
                      value="portfolio"
                      className="px-6 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all data-[state=active]:bg-[#00b0b0] data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      {t("portfolio")}
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="about"
                    className="px-6 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all data-[state=active]:bg-[#00b0b0] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Sobre
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Scroll Indicator - Mobile Only */}
              <div
                id="tab-scroll-indicator"
                className="absolute right-0 top-1/2 -translate-y-[calc(50%+12px)] h-10 w-12 bg-gradient-to-l from-background via-background/80 to-transparent flex items-center justify-end pr-2 pointer-events-none transition-all duration-300 sm:hidden z-10"
              >
                <div className="bg-primary/20 p-1.5 rounded-full animate-bounce-x">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>

            {/* Aba de Recomendações */}
            <TabsContent
              value="recommendations"
              className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  {t("recommendations")}
                </h2>
                {recommendations.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {recommendations.length}
                  </Badge>
                )}
              </div>
              <GuestBlurOverlay isGuest={!user}>
                {recommendationsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="border border-border rounded-lg p-4 space-y-3 animate-pulse bg-card"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recommendations.length === 0 ? (
                  <EmptyState
                    icon={
                      <ThumbsUp className="h-12 w-12 text-muted-foreground/50" />
                    }
                    title="Nenhuma recomendação"
                    description="Este usuário ainda não recebeu recomendações."
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {recommendations.map((rec) => (
                      <Link
                        key={rec.id}
                        href={`/perfil/${rec.recommender.id}`}
                        className="block group"
                      >
                        <Card className="transition-all cursor-pointer h-full border border-border/40 bg-card/20 backdrop-blur-md group-hover:border-primary/40 rounded-xl overflow-hidden shadow-none">
                          <CardContent className="p-2">
                            <div className="flex flex-col items-center text-center gap-1.5">
                              <UserAvatar
                                src={rec.recommender.avatar_url}
                                alt={rec.recommender.full_name}
                                fallback={
                                  rec.recommender.full_name?.charAt(0) || "U"
                                }
                                size="sm"
                                className="h-8 w-8"
                              />
                              <div className="flex-1 min-w-0 w-full">
                                <h4 className="font-bold text-[11px] text-foreground truncate group-hover:text-primary transition-colors leading-tight mb-0.5">
                                  {rec.recommender.full_name}
                                </h4>
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  {rec.recommender.is_verified && (
                                    <ProVerifiedBadge
                                      isVerified={rec.recommender.is_verified}
                                      isPro={(rec.recommender as any).is_pro}
                                      proExpiresAt={
                                        (rec.recommender as any).pro_expires_at
                                      }
                                      iconSize={1.5}
                                    />
                                  )}
                                  {rec.recommender.rating > 0 && (
                                    <div className="flex items-center gap-0.5">
                                      <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                                      <span className="text-[9px] font-bold text-foreground">
                                        {rec.recommender.rating.toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {rec.recommender.location_city && (
                                  <p className="text-[9px] text-muted-foreground truncate leading-none mb-1 opacity-70">
                                    {rec.recommender.location_city}
                                  </p>
                                )}
                                <Badge
                                  variant="outline"
                                  className="text-[8px] px-1 h-3.5 leading-none border-muted-foreground/20 text-muted-foreground"
                                >
                                  {rec.recommender.user_type === "professional"
                                    ? t("professional")
                                    : t("client")}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </GuestBlurOverlay>
            </TabsContent>

            <TabsContent
              value="about"
              className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <GuestBlurOverlay isGuest={!user}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações Pessoais */}
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        Informações Pessoais
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {profile.gender && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                          <span className="text-sm font-medium text-muted-foreground">
                            Gênero
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {formatGender(profile.gender)}
                          </span>
                        </div>
                      )}

                      {profile.idade && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("age")}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-foreground">
                              {profile.idade}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {t("years")}
                            </span>
                          </div>
                        </div>
                      )}

                      {profile.escolaridade && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("education")}
                          </span>
                          <span className="text-sm font-bold text-foreground text-right max-w-[180px] leading-tight">
                            {formatEscolaridade(profile.escolaridade)}
                          </span>
                        </div>
                      )}

                      {profile.estado_civil && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("maritalStatus")}
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {formatEstadoCivil(profile.estado_civil)}
                          </span>
                        </div>
                      )}

                      {profile.filhos !== null &&
                        profile.filhos !== undefined && (
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("childrenLabel")}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-foreground">
                                {profile.filhos}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                {profile.filhos === 1
                                  ? t("child")
                                  : t("children")}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Informações Profissionais */}
                  {isProfessional && (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-[#00b0b0]/10 rounded-2xl">
                          <Briefcase className="w-5 h-5 text-[#00b0b0]" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                          {t("professionalInfo")}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {profile.professional_experience_years && (
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("experience")}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-foreground">
                                {profile.professional_experience_years}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                {profile.professional_experience_years === 1
                                  ? t("year")
                                  : t("years")}
                              </span>
                            </div>
                          </div>
                        )}

                        {profile.turno_trabalho && (
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("shift")}
                            </span>
                            <span className="text-sm font-bold text-foreground">
                              {formatTurnoTrabalho(profile.turno_trabalho)}
                            </span>
                          </div>
                        )}

                        {profile.referencia_profissional && (
                          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-transparent">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                              {t("professionalReference")}
                            </span>
                            <p className="text-sm text-foreground leading-relaxed italic">
                              "{profile.referencia_profissional}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </GuestBlurOverlay>
            </TabsContent>

            <TabsContent
              value="services"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <GuestBlurOverlay isGuest={!user}>
                {isProfessional ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-semibold">
                        {t("servicesOffered")}
                      </h2>
                    </div>

                    {profile.professional_services &&
                    profile.professional_services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.professional_services.map((service, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group"
                          >
                            <div className="shrink-0 p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                              <CheckCircle className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-foreground text-sm sm:text-base font-semibold">
                              {service}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={
                          <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                        }
                        title={t("noServices")}
                        description={t("noServicesDescription")}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-lg border border-border border-dashed">
                    <User className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {t("client")}
                    </h3>
                    <p className="text-muted-foreground">
                      Este usuário é um cliente e não oferece serviços.
                    </p>
                  </div>
                )}
              </GuestBlurOverlay>
            </TabsContent>

            <TabsContent
              value="reviews"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <GuestBlurOverlay isGuest={!user}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">{t("reviews")}</h2>
                  </div>

                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="border border-border rounded-lg p-4 animate-pulse bg-card"
                        >
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          currentUserId={user?.id}
                          profileOwnerId={userId}
                          onRespond={async (reviewId, responseText) => {
                            const result = await respondToReview(
                              reviewId,
                              responseText,
                            );

                            if (userId && !result.error) {
                              setTimeout(async () => {
                                await fetchUserReviews(userId);
                              }, 1000);
                            }
                            return result;
                          }}
                          onEdit={async (reviewToEdit) => {
                            fetchUserReviews(userId);
                          }}
                          onDelete={async (reviewId) => {
                            const result = await deleteReview(reviewId);
                            if (!result.error) {
                              toast.success("Avaliação excluída com sucesso");
                              fetchUserReviews(userId);
                            } else {
                              toast.error("Erro ao excluir avaliação");
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={
                        <Star className="h-12 w-12 text-muted-foreground/50" />
                      }
                      title="Nenhuma avaliação encontrada"
                      description="Este usuário ainda não recebeu avaliações."
                    />
                  )}
                </div>
              </GuestBlurOverlay>
            </TabsContent>

            {isProfessional && (
              <TabsContent
                value="portfolio"
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <GuestBlurOverlay isGuest={!user}>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {/* Using Briefcase as placeholder if LayoutGrid is not imported, or replace with Briefcase if consistent */}
                        <Briefcase className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">
                          {t("portfolio")}
                        </h2>
                      </div>
                      {isOwnProfile && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          <Link href="/portfolio">Gerenciar Portfólio</Link>
                        </Button>
                      )}
                    </div>

                    {portfolioLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="aspect-[4/3] bg-muted animate-pulse rounded-lg"
                          />
                        ))}
                      </div>
                    ) : portfolioProjects && portfolioProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolioProjects.map((project) => (
                          <PortfolioProjectCard
                            key={project.id}
                            project={project}
                            isOwner={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={
                          <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                        }
                        title={t("noPortfolio")}
                        description={t("noPortfolioDescription")}
                      />
                    )}
                  </div>
                </GuestBlurOverlay>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
