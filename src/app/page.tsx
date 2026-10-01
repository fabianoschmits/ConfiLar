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
import { MainLayout } from "@/components/layout/MainLayout";
import { HomePageLayout } from "@/components/layout/HomePageLayout";
import { LogoSplashScreen } from "@/components/common/LogoSplashScreen";

function HomeContent() {
  const router = useRouter();
  const { user, loading: authLoading, isReady } = useAuthContext();
  const t = useTranslations("landing");
  const tNav = useTranslations("navigation");

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
    <MainLayout requireAuth={false}>
      <div className="app-landing bg-[var(--cl-paper)] text-[var(--cl-ink)]">
        <section aria-label="Conheça o ConfiLar">
          {/* Hero Section - Foco em Mobile e Clareza com Foto Desktop de Fundo */}
          <section className="relative flex items-center py-10 sm:py-16 overflow-hidden">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-[var(--cl-teal)]/20 backdrop-blur-md text-[#00e6e6] border border-[var(--cl-teal)]/40 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 mx-auto md:mx-0 shadow-lg shadow-black/20">
                  <Zap size={14} className="fill-[#00e6e6] animate-pulse" />{" "}
                  {t("subtitle")}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-8 text-white drop-shadow-2xl">
                  Encontre quem você{" "}
                  <span className="text-[var(--cl-teal)]">confia</span> para o
                  seu lar.
                </h1>
                <p className="text-base sm:text-lg text-white/90 mb-6 max-w-xl font-medium leading-relaxed drop-shadow-md mx-auto md:mx-0">
                  {t("description")}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[var(--cl-teal)] hover:brightness-95 text-white py-3 px-5 rounded-full text-base font-black shadow-[0_20px_40px_-10px_rgba(0,176,176,0.6)] group border-0"
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
                    className="bg-white/10 backdrop-blur-xl border-2 border-white/80 text-white py-3 px-5 rounded-full text-base font-bold hover:bg-white/20 transition-all "
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
                      <p className="text-4xl font-black text-[var(--cl-teal)] mb-1 ">
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
                      <p className="text-4xl font-black text-[var(--cl-teal)] mb-1 ">
                        {statsLoading ? "..." : formatStatNumber(reviewsCount)}
                      </p>
                      <p className="text-xs uppercase font-extrabold text-white/70 tracking-widest">
                        {t("stats.reviews")}
                      </p>
                      <div className="w-8 h-1 bg-[var(--cl-teal)] mt-3 rounded-full" />
                    </div>
                    <div className="group">
                      <p className="text-4xl font-black text-[var(--cl-teal)] mb-1 ">
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
          <section className="py-8 sm:py-12 bg-[var(--cl-surface)] relative">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-8 text-center md:text-left">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black mb-4">
                    O que você precisa hoje?
                  </h2>
                  <p className="text-lg text-[var(--cl-ink-secondary)] max-w-2xl font-medium">
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
                      <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-white/20 group-hover:bg-[var(--cl-teal)] group-hover:border-0duration-300">
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
          <section className="py-8 sm:py-12 bg-[var(--cl-mist)] border-y border-[var(--cl-border)] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--cl-teal)] to-teal-200 rounded-3xl opacity-20 blur-2xl" />
                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-white">
                  <Image
                    src="/imagens/Fotos/referrals.png"
                    alt="Indicações ConfiLar"
                    width={600}
                    height={600}
                    className="w-full h-auto transition-transform duration-1000 group-"
                  />
                </div>
              </div>

              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-[var(--cl-mist)] text-[var(--cl-teal)] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                  <TrendingUp size={16} /> Valorização da confiança
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-8 leading-tight">
                  Uma rede feita por{" "}
                  <span className="text-[var(--cl-teal)]">pessoas reais</span>.
                </h2>
                <p className="text-xl text-[var(--cl-ink-secondary)] mb-6 leading-relaxed font-medium">
                  No ConfiLar, o seu histórico de confiança vale pontos. Já
                  movimentamos mais de{" "}
                  <strong>
                    {referralStats.loading
                      ? "..."
                      : formatStatNumber(referralStats.totalReferrals)}
                  </strong>{" "}
                  indicações verificadas.
                </p>

                <div className="flex flex-wrap gap-6 justify-center md:justify-start mb-6">
                  <div className="bg-[var(--cl-surface)] p-8 rounded-[2.5rem] shadow-[var(--cl-shadow)] border border-[var(--cl-border)] flex-1 min-w-[200px]">
                    <p className="text-sm font-bold text-gray-400 mb-2 tracking-widest uppercase">
                      {t("stats.referrals")}
                    </p>
                    <p className="text-4xl font-black text-[var(--cl-teal)]">
                      {referralStats.loading
                        ? "..."
                        : formatStatNumber(referralStats.totalReferrals)}
                    </p>
                  </div>
                  <div className="bg-[var(--cl-surface)] p-8 rounded-[2.5rem] shadow-[var(--cl-shadow)] border border-[var(--cl-border)] flex-1 min-w-[200px]">
                    <p className="text-sm font-bold text-gray-400 mb-2 tracking-widest uppercase">
                      Participantes
                    </p>
                    <p className="text-4xl font-black text-[var(--cl-ink)]">
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
                  className="bg-[var(--cl-teal)] hover:brightness-95 text-white py-8 px-12 rounded-3xl text-xl font-black shadow-2xl shadow-[#00b0b0]/40 transition-all  border-0"
                >
                  <Link href="/auth?tab=register">Entrar para a rede</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Section Diferenciais - Clean e Direto */}
          <section className="py-8 sm:py-12 bg-[var(--cl-surface)]">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-10 rounded-[2.5rem] bg-[var(--cl-mist)] border border-[var(--cl-border)] shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                  <div className="w-16 h-16 bg-[var(--cl-teal)]/10 rounded-2xl flex items-center justify-center text-[var(--cl-teal)] mb-8 group-hover:bg-[var(--cl-teal)] group-hover:text-white transition-colors">
                    <ShieldCheck size={36} />
                  </div>
                  <h3 className="text-2xl font-black mb-4">
                    Segurança em 1º lugar
                  </h3>
                  <p className="text-[var(--cl-ink-secondary)] leading-relaxed font-medium">
                    {t("security.description")}
                  </p>
                </div>
                <div className="p-10 rounded-[2.5rem] bg-[var(--cl-mist)] border border-[var(--cl-border)] shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                  <div className="w-16 h-16 bg-[var(--cl-teal)]/10 rounded-2xl flex items-center justify-center text-[var(--cl-teal)] mb-8 group-hover:bg-[var(--cl-teal)] group-hover:text-white transition-colors">
                    <Users size={36} />
                  </div>
                  <h3 className="text-2xl font-black mb-4">Comunidade Real</h3>
                  <p className="text-[var(--cl-ink-secondary)] leading-relaxed font-medium">
                    Avaliações reais de vizinhos e pessoas da sua cidade.
                    Transparência total sobre quem você está contratando.
                  </p>
                </div>
                <div className="p-10 rounded-[2.5rem] bg-[var(--cl-mist)] border border-[var(--cl-border)] shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                  <div className="w-16 h-16 bg-[var(--cl-teal)]/10 rounded-2xl flex items-center justify-center text-[var(--cl-teal)] mb-8 group-hover:bg-[var(--cl-teal)] group-hover:text-white transition-colors">
                    <Smartphone size={36} />
                  </div>
                  <h3 className="text-2xl font-black mb-4">
                    Tudo pelo Celular
                  </h3>
                  <p className="text-[var(--cl-ink-secondary)] leading-relaxed font-medium">
                    Gerencie orçamentos, conversas e agendamentos na palma da
                    sua mão com nossa interface ultra-rápida.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Final Master */}
          <section className="py-8 sm:py-12 px-6">
            <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-gray-950 via-[#00b0b0]/20 to-gray-900 p-5 sm:p-10 text-center text-white relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
                style={{ backgroundImage: "url('/imagens/Fotos/hero-bg.png')" }}
              />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--cl-teal)]/5 rounded-full blur-[100px] -mr-64 -mt-64" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                  <Award size={48} className="text-[var(--cl-teal)]" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-black mb-6 tracking-tight leading-tight">
                  Pronto para{" "}
                  <span className="text-[var(--cl-teal)]">transformar</span> seu
                  lar?
                </h2>
                <p className="text-white/60 text-base sm:text-lg mb-6 max-w-3xl font-medium leading-relaxed">
                  Crie sua conta agora e tenha acesso aos melhores profissionais
                  da região em segundos.
                </p>
                <div className="flex flex-col sm:flex-row gap-8 justify-center w-full max-w-2xl">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[var(--cl-teal)] hover:brightness-95 text-white py-3 px-5 rounded-full text-base font-black shadow-[0_20px_40px_-5px_rgba(0,176,176,0.5)] border-0"
                  >
                    <Link href="/auth?tab=register">Criar conta gratuita</Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10 py-3 px-5 rounded-full text-base font-black border-2 border-white/20 backdrop-blur-md"
                  >
                    <Link href="/buscar">Apenas Explorar</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </section>

        <footer className="py-8 bg-[var(--cl-surface)] border-t border-[var(--cl-border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left border-b border-[var(--cl-border)] pb-6">
              <div className="max-w-sm">
                <Image
                  src="/imagens/logo/Logo azul - sem fundo - horizontal.png"
                  alt="ConfiLar"
                  width={180}
                  height={48}
                  className="h-10 w-auto mb-8 mx-auto md:mx-0 opacity-90"
                />
                <p className="text-lg text-[var(--cl-ink-secondary)] leading-relaxed font-medium">
                  Conectando profissionais reais a problemas reais.
                  Transparência e confiança em cada clique.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-base font-black text-[var(--cl-ink)]">
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
                    href="/buscar"
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
                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest text-[var(--cl-ink-secondary)]">
                  <Smartphone size={12} /> App Progressive
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
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
