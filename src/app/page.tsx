"use client";

import { useState, useEffect } from "react";
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
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useHomeStats, formatStatNumber } from "@/hooks/useHomeStats";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LogoSplashScreen } from "@/components/common/LogoSplashScreen";

export default function HomePage() {
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
    <PublicLayout>
      <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#00b0b0]/20 selection:text-[#00b0b0]">
        {/* Header com Design de Cartão Flutuante (como na desktop original) */}
        <header
          className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 pt-4 pb-2 md:px-8 md:pt-6",
            scrolled ? "translate-y-0" : "",
          )}
        >
          <div
            className={cn(
              "max-w-7xl mx-auto flex justify-between items-center px-6 py-4 rounded-2xl border transition-all duration-500",
              scrolled
                ? "bg-white/90 backdrop-blur-xl border-gray-100 shadow-lg text-gray-900"
                : "bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl",
            )}
          >
            <Link href="/" className="flex items-center">
              <Image
                src={
                  scrolled
                    ? "/imagens/logo/Logo azul - sem fundo - horizontal.png"
                    : "/imagens/logo/Logo branco - sem fundo - horizontal.png"
                }
                alt="ConfiLar"
                width={160}
                height={40}
                priority
                className="h-8 md:h-10 w-auto object-contain"
              />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-6 text-sm font-semibold">
                <Link
                  href="/buscar"
                  className="hover:text-[#00b0b0] transition-colors"
                >
                  {t("ctaSearch")}
                </Link>
                <Link
                  href="/sobre"
                  className="hover:text-[#00b0b0] transition-colors"
                >
                  {tNav("about")}
                </Link>
                <Link
                  href="/ajuda"
                  className="hover:text-[#00b0b0] transition-colors"
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
                    scrolled ? "text-[#00b0b0]" : "text-white",
                  )}
                >
                  {tNav("login")}
                </Link>
                <Button
                  asChild
                  className="bg-[#00b0b0] hover:bg-[#009090] text-white rounded-full px-6 font-bold shadow-lg shadow-[#00b0b0]/20 border-0 transition-transform active:scale-95"
                >
                  <Link href="/auth?tab=register">{tNav("createAccount")}</Link>
                </Button>
              </div>
            </div>

            <button
              className="md:hidden p-2"
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
              className="flex items-center gap-3 py-4 border-b border-gray-100 text-[#00b0b0]"
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
              <Button className="w-full bg-[#00b0b0] hover:bg-[#009090] text-white py-6 rounded-2xl text-lg font-bold">
                {t("ctaStart")}
              </Button>
            </Link>
          </nav>
        </div>

        <main>
          {/* Hero Section - A Cara da Desktop com a Praticidade da Mobile */}
          <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
            {/* Fundo Original Exato da Desktop (com Grid e Gradiente) */}
            <div className="absolute inset-0 z-0">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/imagens/Fotos/hero-bg-premium.png')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-950/80 to-[#00b0b0]/20" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
              <div className="absolute inset-0 bg-black/40 md:hidden" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#00b0b0]/20 backdrop-blur-md text-[#00e6e6] border border-[#00b0b0]/40 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 mx-auto md:mx-0">
                <Zap size={14} className="fill-[#00e6e6] animate-pulse" />{" "}
                {t("subtitle")}
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start md:gap-4 mb-8">
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white leading-tight drop-shadow-lg">
                  {t("title")}
                </h1>
                <div className="flex items-center gap-3">
                  <Image
                    src="/imagens/logo/Logo azul - sem fundo - horizontal.png"
                    alt="ConfiLar"
                    width={280}
                    height={80}
                    priority
                    className="h-10 md:h-14 lg:h-20 w-auto object-contain mt-1 md:mt-3"
                  />
                  <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white leading-tight drop-shadow-lg">
                    ?
                  </h1>
                </div>
              </div>

              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl font-medium leading-relaxed drop-shadow-md mx-auto md:mx-0">
                {t("description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start mb-20 px-4 md:px-0">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#00b0b0] hover:bg-[#009090] text-white py-8 px-10 rounded-3xl text-xl font-black shadow-2xl shadow-[#00b0b0]/50 group border-0 transition-all hover:-translate-y-1"
                >
                  <Link href="/buscar" className="flex items-center">
                    {t("ctaSearch")}{" "}
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
                  className="bg-white/10 backdrop-blur-xl border-2 border-white/80 text-white py-8 px-10 rounded-3xl text-xl font-bold hover:bg-white/30 transition-all hover:-translate-y-1"
                >
                  <Link href="/auth">{tNav("login")}</Link>
                </Button>
              </div>

              {/* Stats com Dados Reais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl">
                <div className="bg-white/15 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hover:bg-white/20 transition-all group">
                  <p className="text-3xl lg:text-4xl font-black text-[#00b0b0] mb-1 group-hover:scale-110 transition-transform origin-left">
                    {statsLoading
                      ? "..."
                      : formatStatNumber(professionalsCount)}
                  </p>
                  <p className="text-xs uppercase font-extrabold text-white/70 tracking-widest">
                    {t("stats.professionals")}
                  </p>
                  <div className="w-8 h-1 bg-[#00b0b0] mt-3 rounded-full" />
                </div>
                <div className="bg-white/15 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hover:bg-white/20 transition-all group">
                  <p className="text-3xl lg:text-4xl font-black text-[#00b0b0] mb-1 group-hover:scale-110 transition-transform origin-left">
                    {statsLoading ? "..." : formatStatNumber(reviewsCount)}
                  </p>
                  <p className="text-xs uppercase font-extrabold text-white/70 tracking-widest">
                    {t("stats.reviews")}
                  </p>
                  <div className="w-8 h-1 bg-[#00b0b0] mt-3 rounded-full" />
                </div>
                <div className="bg-white/15 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hover:bg-white/20 transition-all group">
                  <p className="text-3xl lg:text-4xl font-black text-[#00b0b0] mb-1 group-hover:scale-110 transition-transform origin-left">
                    {statsLoading ? "..." : formatStatNumber(citiesCount)}
                  </p>
                  <p className="text-xs uppercase font-extrabold text-white/70 tracking-widest">
                    {t("stats.cities")}
                  </p>
                  <div className="w-8 h-1 bg-[#00b0b0] mt-3 rounded-full" />
                </div>
                <div className="bg-white/15 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hover:bg-white/20 transition-all group">
                  <p className="text-3xl lg:text-4xl font-black text-[#00b0b0] mb-1 group-hover:scale-110 transition-transform origin-left">
                    {statsLoading ? "..." : formatStatNumber(servicesCount)}
                  </p>
                  <p className="text-xs uppercase font-extrabold text-white/70 tracking-widest">
                    {t("stats.services")}
                  </p>
                  <div className="w-8 h-1 bg-[#00b0b0] mt-3 rounded-full" />
                </div>
              </div>
            </div>
          </section>

          {/* Categorias */}
          <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-center md:text-left">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-4">
                    Serviços Favoritos
                  </h2>
                  <p className="text-lg text-gray-500 max-w-2xl">
                    Os mais requisitados em Venâncio Aires e região agora na
                    palma da sua mão.
                  </p>
                </div>
                <Link
                  href="/buscar"
                  className="text-[#00b0b0] font-bold flex items-center gap-2 hover:underline group mx-auto md:mx-0"
                >
                  Ver catálogo completo{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                {[
                  {
                    name: "Limpeza",
                    icon: (
                      <Star
                        size={24}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    ),
                    img: "/imagens/Fotos/transparency.png",
                  },
                  {
                    name: "Reparos",
                    icon: <Briefcase size={24} className="text-blue-500" />,
                    img: "/imagens/Fotos/ads.png",
                  },
                  {
                    name: "Elétrica",
                    icon: (
                      <Zap
                        size={24}
                        className="text-[#00b0b0] fill-[#00b0b0]"
                      />
                    ),
                    img: "/imagens/Fotos/recommendations.png",
                  },
                  {
                    name: "Jardim",
                    icon: <CheckCircle size={24} className="text-green-500" />,
                    img: "/imagens/Fotos/referrals.png",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[3/4] overflow-hidden rounded-[3rem] cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-700 hover:-rotate-1 active:scale-95"
                  >
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-115 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent opacity-90" />
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="bg-white/10 backdrop-blur-xl w-14 h-14 rounded-3xl flex items-center justify-center mb-4 border border-white/20 group-hover:bg-[#00b0b0] group-hover:border-0 transition-all duration-500">
                        {item.icon}
                      </div>
                      <h3 className="text-white font-black text-2xl drop-shadow-md">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Indicações */}
          <section className="py-28 bg-[#f8fafb] overflow-hidden relative border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#00b0b0] to-teal-200 rounded-[4rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
                <div className="relative rounded-[3.5rem] overflow-hidden shadow-3xl border-[12px] border-white">
                  <Image
                    src="/imagens/Fotos/referrals.png"
                    alt="Indicações ConfiLar"
                    width={600}
                    height={600}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                  <TrendingUp size={16} /> Valorização da confiança
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-gray-900">
                  Uma rede feita por{" "}
                  <span className="text-[#00b0b0]">pessoas reais</span>.
                </h2>
                <p className="text-xl text-gray-500 mb-12 leading-relaxed">
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
                    <p className="text-4xl font-black text-[#00b0b0]">
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
                        : formatStatNumber(
                            referralStats.totalUsersParticipating,
                          )}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="bg-gray-900 hover:bg-black text-white py-8 px-12 rounded-3xl text-xl font-black shadow-2xl transition-all hover:scale-105"
                >
                  <Link href="/auth?tab=register">Entrar para a rede</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* CTA Master */}
          <section className="py-24 px-6 mb-12">
            <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 rounded-[4rem] p-12 md:p-24 text-center text-white shadow-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00b0b0]/5 rounded-full blur-[100px] -mr-64 -mt-64" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mb-10 border border-white/10 shadow-inner">
                  <Award size={48} className="text-[#00b0b0]" />
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tight leading-tight">
                  Dê ao seu lar o <span className="text-[#00b0b0]">melhor</span>
                  .
                </h2>
                <p className="text-white/60 text-xl md:text-2xl mb-16 max-w-3xl font-medium leading-relaxed">
                  Centenas de profissionais verificados esperando para resolver
                  o seu problema agora mesmo.
                </p>
                <div className="flex flex-col sm:flex-row gap-8 justify-center w-full max-w-2xl">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#00b0b0] hover:bg-[#009090] text-white py-9 px-14 rounded-[2rem] text-2xl font-black shadow-[0_20px_40px_-10px_rgba(0,176,176,0.6)] border-0 transition-all hover:scale-105 active:scale-95"
                  >
                    <Link href="/auth?tab=register">Criar Conta Grátis</Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10 py-9 px-14 rounded-[2rem] text-2xl font-bold border-2 border-white/20 backdrop-blur-md"
                  >
                    <Link href="/buscar">Apenas Olhar</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left border-b border-gray-100 pb-16">
              <div className="max-w-sm">
                <Image
                  src="/imagens/logo/Logo azul - sem fundo - horizontal.png"
                  alt="ConfiLar"
                  width={180}
                  height={45}
                  className="h-10 w-auto mb-8 mx-auto md:mx-0 opacity-90"
                />
                <p className="text-lg text-gray-500 leading-relaxed font-medium">
                  Conectando profissionais reais a problemas reais.
                  Transparência e confiança em cada clique.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-12 text-base font-black text-gray-900">
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-[#00b0b0] uppercase tracking-widest mb-2">
                    Plataforma
                  </p>
                  <Link
                    href="/buscar"
                    className="hover:text-[#00b0b0] transition-colors"
                  >
                    {t("ctaSearch")}
                  </Link>
                  <Link
                    href="/profissionais"
                    className="hover:text-[#00b0b0] transition-colors"
                  >
                    {tNav("professionals")}
                  </Link>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-[#00b0b0] uppercase tracking-widest mb-2">
                    Suporte
                  </p>
                  <Link
                    href="/ajuda"
                    className="hover:text-[#00b0b0] transition-colors"
                  >
                    {tNav("help")}
                  </Link>
                  <Link
                    href="/sobre"
                    className="hover:text-[#00b0b0] transition-colors"
                  >
                    {tNav("about")}
                  </Link>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-[#00b0b0] uppercase tracking-widest mb-2">
                    Legal
                  </p>
                  <Link
                    href="/termos"
                    className="hover:text-[#00b0b0] transition-colors"
                  >
                    Termos
                  </Link>
                  <Link
                    href="/privacidade"
                    className="hover:text-[#00b0b0] transition-colors"
                  >
                    Privacidade
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400 font-medium">
              <p>© 2026 ConfiLar Brasil. Venâncio Aires, RS.</p>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-[10px] uppercase font-black">
                  <Smartphone size={12} /> App Progressive
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  );
}
