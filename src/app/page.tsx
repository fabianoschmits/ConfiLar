"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowRight,
  LogIn,
  ShieldCheck,
  Users,
  Star,
  Zap,
  Briefcase,
  Smartphone,
  CheckCircle,
  Menu,
  X,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useHomeStats, formatStatNumber } from "@/hooks/useHomeStats";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HomePageLayout } from "@/components/layout/HomePageLayout";
import { LogoSplashScreen } from "@/components/common/LogoSplashScreen";

function HomeContent() {
  const router = useRouter();
  const { user, loading: authLoading, isReady } = useAuthContext();
  const t = useTranslations("landing");
  const tNav = useTranslations("navigation");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Dados Reais do Projeto
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Redirecionamento se já estiver logado
  useEffect(() => {
    if (mounted && isReady && user) {
      router.push("/feed");
    }
  }, [user, isReady, router, mounted]);

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

  if (authLoading || !mounted || user) return <LogoSplashScreen />;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[var(--cl-teal)]/20 selection:text-[var(--cl-teal)]">
      {/* Header Simplificado e Focado */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8",
          scrolled
            ? "py-3 bg-white/95 backdrop-blur-md shadow-lg"
            : "py-5 bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src={
                scrolled
                  ? "/imagens/logo/Logo azul - sem fundo - horizontal.png"
                  : "/imagens/logo/Logo branco - sem fundo - horizontal.png"
              }
              alt="ConfiLar"
              width={180}
              height={48}
              priority
              className="h-8 md:h-10 w-auto object-contain drop-shadow-md"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <nav
              className={cn(
                "flex items-center gap-6 text-sm font-semibold transition-colors",
                scrolled ? "text-gray-600" : "text-white",
              )}
            >
              <Link
                href="/buscar"
                className="hover:text-[var(--cl-teal)] transition-colors"
              >
                {t("ctaSearch")}
              </Link>
              <Link
                href="/sobre"
                className="hover:text-[var(--cl-teal)] transition-colors"
              >
                {tNav("about")}
              </Link>
              <Link
                href="/ajuda"
                className="hover:text-[var(--cl-teal)] transition-colors"
              >
                {tNav("help")}
              </Link>
            </nav>
            <div
              className={cn(
                "h-4 w-[1px]",
                scrolled ? "bg-gray-200" : "bg-white/20",
              )}
            />
            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className={cn(
                  "text-sm font-bold hover:underline px-4",
                  scrolled ? "text-[var(--cl-teal)]" : "text-white",
                )}
              >
                {tNav("login")}
              </Link>
              <Button
                asChild
                className="bg-[var(--cl-teal)] hover:brightness-95 text-white rounded-full px-6 font-bold shadow-lg shadow-[#00b0b0]/40 border-0"
              >
                <Link href="/auth?tab=register">{tNav("createAccount")}</Link>
              </Button>
            </div>
          </div>

          <button
            className={cn(
              "md:hidden p-2",
              scrolled ? "text-gray-600" : "text-white",
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Menu Mobile Simplificado */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white transition-transform duration-300 md:hidden pt-24 px-6",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <nav className="flex flex-col gap-6 text-xl font-bold">
          <Link
            href="/auth"
            className="flex items-center gap-3 py-4 border-b border-gray-100 text-[var(--cl-teal)]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LogIn size={24} /> {tNav("login")}
          </Link>
          <Link
            href="/buscar"
            className="flex items-center gap-3 py-4 border-b border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Search size={24} /> {t("ctaSearch")}
          </Link>
          <Link
            href="/sobre"
            className="flex items-center gap-3 py-4 border-b border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={24} /> {tNav("about")}
          </Link>
          <Link
            href="/auth?tab=register"
            className="mt-8"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button className="w-full bg-[var(--cl-teal)] hover:brightness-95 text-white py-6 rounded-2xl text-lg font-bold shadow-xl shadow-[#00b0b0]/30">
              {t("ctaStart")}
            </Button>
          </Link>
        </nav>
      </div>

      <main>
        {/* Hero Section - Foco em Mobile e Clareza com Foto Desktop de Fundo */}
        <section className="relative min-h-screen flex items-center pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden">
          {/* Fundo da Versão Desktop */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/imagens/Fotos/hero-bg.png')",
              }}
            />
            {/* Overlay Escuro para Contraste Máximo */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[var(--cl-teal)]/20 backdrop-blur-md text-[#00e6e6] border border-[var(--cl-teal)]/40 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 mx-auto md:mx-0 shadow-lg shadow-black/20">
                <Zap size={14} className="fill-[#00e6e6] animate-pulse" />{" "}
                {t("subtitle")}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 text-white drop-shadow-2xl">
                Encontre quem você{" "}
                <span className="text-[var(--cl-teal)]">confia</span> para o seu
                lar.
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-12 max-w-xl font-medium leading-relaxed drop-shadow-md mx-auto md:mx-0">
                {t("description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-[var(--cl-teal)] hover:brightness-95 text-white py-8 px-10 rounded-2xl text-xl font-black shadow-[0_20px_40px_-10px_rgba(0,176,176,0.6)] group border-0 transition-all hover:scale-105"
                >
                  <Link href="/buscar">
                    {t("ctaSearch")}
                    <ArrowRight
                      size={24}
                      className="ml-3 group-hover:translate-x-2 transition-transform"
                    />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white/10 backdrop-blur-xl border-2 border-white/80 text-white py-8 px-10 rounded-2xl text-xl font-bold hover:bg-white/20 transition-all hover:scale-105"
                >
                  <Link href="/auth">{tNav("login")}</Link>
                </Button>
              </div>
            </div>

            {/* Estatísticas Flutuantes no Desktop (Clean) */}
            <div className="relative hidden md:flex justify-end">
              <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl max-w-xs transition-all hover:bg-white/15">
                <div className="space-y-8">
                  <div className="group">
                    <p className="text-4xl font-black text-[var(--cl-teal)] mb-1 group-hover:scale-105 transition-transform origin-left">
                      {statsLoading
                        ? "..."
                        : formatStatNumber(professionalsCount)}
                    </p>
                    <p className="text-xs uppercase font-extrabold text-white/70 tracking-widest">
                      {t("stats.professionals")}
                    </p>
                    <div className="w-8 h-1 bg-[var(--cl-teal)] mt-3 rounded-full" />
                  </div>
                  <div className="group">
                    <p className="text-4xl font-black text-[var(--cl-teal)] mb-1 group-hover:scale-105 transition-transform origin-left">
                      {statsLoading ? "..." : formatStatNumber(reviewsCount)}
                    </p>
                    <p className="text-xs uppercase font-extrabold text-white/70 tracking-widest">
                      {t("stats.reviews")}
                    </p>
                    <div className="w-8 h-1 bg-[var(--cl-teal)] mt-3 rounded-full" />
                  </div>
                  <div className="group">
                    <p className="text-4xl font-black text-[var(--cl-teal)] mb-1 group-hover:scale-105 transition-transform origin-left">
                      {statsLoading ? "..." : formatStatNumber(citiesCount)}
                    </p>
                    <p className="text-xs uppercase font-extrabold text-white/70 tracking-widest">
                      {t("stats.cities")}
                    </p>
                    <div className="w-8 h-1 bg-[var(--cl-teal)] mt-3 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Serviços em Cards - Otimizado para Mobile */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-center md:text-left">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-4">
                  O que você precisa hoje?
                </h2>
                <p className="text-lg text-gray-500 max-w-2xl font-medium">
                  {t("howItWorks.description")}
                </p>
              </div>
              <Link
                href="/buscar"
                className="text-[var(--cl-teal)] font-bold flex items-center gap-2 hover:underline group mx-auto md:mx-0 text-lg"
              >
                Ver todos os serviços{" "}
                <ArrowRight
                  size={22}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {[
                {
                  name: "Limpeza",
                  icon: <Star className="text-yellow-500 fill-yellow-500" />,
                  img: "/imagens/Fotos/transparency.png",
                },
                {
                  name: "Reformas",
                  icon: <Briefcase className="text-blue-500" />,
                  img: "/imagens/Fotos/ads.png",
                },
                {
                  name: "Elétrica",
                  icon: <Zap className="text-orange-500 fill-orange-500" />,
                  img: "/imagens/Fotos/recommendations.png",
                },
                {
                  name: "Jardinagem",
                  icon: <CheckCircle className="text-green-500" />,
                  img: "/imagens/Fotos/referrals.png",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-white/20 group-hover:bg-[var(--cl-teal)] group-hover:border-0 transition-all duration-300">
                      {item.icon}
                    </div>
                    <h3 className="text-white font-black text-xl drop-shadow-md">
                      {item.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Indicações Reais - Dados Dinâmicos */}
        <section className="py-24 bg-[#f8fafb] border-y border-gray-100 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--cl-teal)] to-teal-200 rounded-[4rem] opacity-20 blur-2xl" />
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-white">
                <Image
                  src="/imagens/Fotos/referrals.png"
                  alt="Indicações ConfiLar"
                  width={600}
                  height={600}
                  className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[var(--cl-mist)] text-[var(--cl-teal)] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                <TrendingUp size={16} /> Valorização da confiança
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Uma rede feita por{" "}
                <span className="text-[var(--cl-teal)]">pessoas reais</span>.
              </h2>
              <p className="text-xl text-gray-500 mb-12 leading-relaxed font-medium">
                No ConfiLar, o seu histórico de confiança vale pontos. Já
                movimentamos mais de{" "}
                <strong>
                  {referralStats.loading
                    ? "..."
                    : formatStatNumber(referralStats.totalReferrals)}
                </strong>{" "}
                indicações verificadas.
              </p>

              <div className="flex flex-wrap gap-6 justify-center md:justify-start mb-12">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex-1 min-w-[200px]">
                  <p className="text-sm font-bold text-gray-400 mb-2 tracking-widest uppercase">
                    {t("stats.referrals")}
                  </p>
                  <p className="text-4xl font-black text-[var(--cl-teal)]">
                    {referralStats.loading
                      ? "..."
                      : formatStatNumber(referralStats.totalReferrals)}
                  </p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex-1 min-w-[200px]">
                  <p className="text-sm font-bold text-gray-400 mb-2 tracking-widest uppercase">
                    Participantes
                  </p>
                  <p className="text-4xl font-black text-gray-900">
                    {referralStats.loading
                      ? "..."
                      : formatStatNumber(referralStats.totalUsersParticipating)}
                  </p>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="bg-[var(--cl-teal)] hover:brightness-95 text-white py-8 px-12 rounded-3xl text-xl font-black shadow-2xl shadow-[#00b0b0]/40 transition-all hover:scale-105 border-0"
              >
                <Link href="/auth?tab=register">Entrar para a rede</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section Diferenciais - Clean e Direto */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="p-10 rounded-[2.5rem] bg-[#fdfdfd] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-[var(--cl-teal)]/10 rounded-2xl flex items-center justify-center text-[var(--cl-teal)] mb-8 group-hover:bg-[var(--cl-teal)] group-hover:text-white transition-colors">
                  <ShieldCheck size={36} />
                </div>
                <h3 className="text-2xl font-black mb-4">
                  Segurança em 1º lugar
                </h3>
                <p className="text-gray-500 leading-relaxed font-medium">
                  {t("security.description")}
                </p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-[#fdfdfd] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-[var(--cl-teal)]/10 rounded-2xl flex items-center justify-center text-[var(--cl-teal)] mb-8 group-hover:bg-[var(--cl-teal)] group-hover:text-white transition-colors">
                  <Users size={36} />
                </div>
                <h3 className="text-2xl font-black mb-4">Comunidade Real</h3>
                <p className="text-gray-500 leading-relaxed font-medium">
                  Avaliações reais de vizinhos e pessoas da sua cidade.
                  Transparência total sobre quem você está contratando.
                </p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-[#fdfdfd] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-[var(--cl-teal)]/10 rounded-2xl flex items-center justify-center text-[var(--cl-teal)] mb-8 group-hover:bg-[var(--cl-teal)] group-hover:text-white transition-colors">
                  <Smartphone size={36} />
                </div>
                <h3 className="text-2xl font-black mb-4">Tudo pelo Celular</h3>
                <p className="text-gray-500 leading-relaxed font-medium">
                  Gerencie orçamentos, conversas e agendamentos na palma da sua
                  mão com nossa interface ultra-rápida.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final Master */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto rounded-[4rem] bg-gradient-to-br from-gray-950 via-[#00b0b0]/20 to-gray-900 p-16 md:p-24 text-center text-white relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
              style={{ backgroundImage: "url('/imagens/Fotos/hero-bg.png')" }}
            />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--cl-teal)]/5 rounded-full blur-[100px] -mr-64 -mt-64" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mb-10 border border-white/10 shadow-inner">
                <Award size={48} className="text-[var(--cl-teal)]" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tight leading-tight">
                Pronto para{" "}
                <span className="text-[var(--cl-teal)]">transformar</span> seu
                lar?
              </h2>
              <p className="text-white/60 text-xl md:text-2xl mb-16 max-w-3xl font-medium leading-relaxed">
                Crie sua conta agora e tenha acesso aos melhores profissionais
                da região em segundos.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center w-full max-w-2xl">
                <Button
                  asChild
                  size="lg"
                  className="bg-[var(--cl-teal)] hover:brightness-95 text-white py-10 px-14 rounded-[2.5rem] text-2xl font-black shadow-[0_20px_40px_-5px_rgba(0,176,176,0.5)] border-0 transition-all hover:scale-105"
                >
                  <Link href="/auth?tab=register">Criar conta gratuita</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10 py-10 px-14 rounded-[2.5rem] text-2xl font-black border-2 border-white/20 backdrop-blur-md"
                >
                  <Link href="/buscar">Apenas Explorar</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left border-b border-gray-100 pb-16">
            <div className="max-w-sm">
              <Image
                src="/imagens/logo/Logo azul - sem fundo - horizontal.png"
                alt="ConfiLar"
                width={180}
                height={48}
                className="h-10 w-auto mb-8 mx-auto md:mx-0 opacity-90"
              />
              <p className="text-lg text-gray-500 leading-relaxed font-medium">
                Conectando profissionais reais a problemas reais. Transparência
                e confiança em cada clique.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-12 text-base font-black text-gray-900">
              <div className="flex flex-col gap-4">
                <p className="text-xs text-[var(--cl-teal)] uppercase tracking-widest mb-2">
                  Plataforma
                </p>
                <Link
                  href="/buscar"
                  className="hover:text-[var(--cl-teal)] transition-colors"
                >
                  {t("ctaSearch")}
                </Link>
                <Link
                  href="/profissionais"
                  className="hover:text-[var(--cl-teal)] transition-colors"
                >
                  {tNav("professionals")}
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-xs text-[var(--cl-teal)] uppercase tracking-widest mb-2">
                  Suporte
                </p>
                <Link
                  href="/ajuda"
                  className="hover:text-[var(--cl-teal)] transition-colors"
                >
                  {tNav("help")}
                </Link>
                <Link
                  href="/sobre"
                  className="hover:text-[var(--cl-teal)] transition-colors"
                >
                  {tNav("about")}
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-xs text-[var(--cl-teal)] uppercase tracking-widest mb-2">
                  Legal
                </p>
                <Link
                  href="/termos"
                  className="hover:text-[var(--cl-teal)] transition-colors"
                >
                  Termos
                </Link>
                <Link
                  href="/privacidade"
                  className="hover:text-[var(--cl-teal)] transition-colors"
                >
                  Privacidade
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400 font-medium text-center">
            <p>© 2026 ConfiLar Brasil. Venâncio Aires, RS.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest text-gray-500">
                <Smartphone size={12} /> App Progressive
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <HomePageLayout>
      <Suspense fallback={<LogoSplashScreen />}>
        <HomeContent />
      </Suspense>
    </HomePageLayout>
  );
}
